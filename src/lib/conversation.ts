import { type Context } from "hono";
import { Ok, Err, Result } from "@casperlabs/ts-results/esm/index";
import {
  generateResponse,
  updateUserNameFunction,
  saveMessageFileToDocumentsFunction,
  getUserDocumentsFunction,
  createVehicleOfferFunction,
  updateVehicleOfferFunction,
  getOpenOffersFunction,
  askVehicleOfferQuestionFunction,
} from "../services/gemini/client";
import {
  findUserByPhoneNumber,
  createUser,
  updateUser,
  type User,
} from "../models/user";
import { createMessage, getMessagesWithFiles } from "../models/message";
import { Bindings } from "..";
import { DatabaseFile } from "../models/file";
import { saveConversationFileAsUserDocument } from "./userDocument";
import { findUserDocumentsByUserId } from "../models/userDocument";
import {
  createVehicleOffer,
  updateVehicleOffer,
  getOpenOffers,
  getMissingFields,
  getQuestionsAsked,
} from "../models/vehicleOffer";
import { CONVERSATION_SYSTEM_PROMPT } from "./prompts";

export async function saveIncomingMessage(
  c: Context<{ Bindings: Bindings }>,
  phoneNumber: string,
  messageText: string,
  file?: DatabaseFile,
): Promise<Result<User, string>> {
  try {
    console.log(
      `Processing message from ${phoneNumber}: ${messageText || "[media]"}`,
    );

    let user = await findUserByPhoneNumber(c, phoneNumber);
    if (!user) {
      console.log(`Creating new user for phone number: ${phoneNumber}`);
      user = await createUser(c, phoneNumber, `User ${phoneNumber}`);
      console.log(`User created with ID: ${user.id}`);
    }

    if (!messageText && !file) {
      return Err("Please send a message or an image.");
    }

    // Save user message with optional file
    await createMessage(c, user.id, "user", messageText || "Image", file);
    console.log(`Saved user message with ${file ? "file" : "no file"}`);

    return Ok(user);
  } catch (error) {
    console.error("Error in saveIncomingMessage:", error);
    return Err("Failed to save message");
  }
}

export async function generateAssistantResponse(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
): Promise<Result<string, string>> {
  try {
    // Get recent conversation history with files
    const recentMessages = await getMessagesWithFiles(c, userId, 10);

    // Format messages for Gemini API with image support
    const conversationHistory: Array<{
      role: "user" | "model";
      parts: Array<Record<string, unknown>>;
    }> = await Promise.all(
      recentMessages.map(async (msg) => {
        const parts: Array<Record<string, unknown>> = [];

        if (msg.content) {
          parts.push({ text: msg.content });
        }

        if (msg.file) {
          try {
            const fileObject = await c.env.FILES.get(msg.file.storageKey);
            if (fileObject) {
              const arrayBuffer = await fileObject.arrayBuffer();
              const base64 = btoa(
                String.fromCharCode(...new Uint8Array(arrayBuffer)),
              );
              parts.push({
                inlineData: {
                  mimeType: msg.file.mimeType,
                  data: base64,
                },
              });
              parts.push({
                text: `[File ID: ${msg.file.id}, Filename: ${msg.file.originalFilename}]`,
              });
            }
          } catch (error) {
            console.error("Error loading image from R2:", error);
          }
        }

        return {
          role:
            msg.role === "assistant" ? ("model" as const) : ("user" as const),
          parts,
        };
      }),
    );

    console.log(
      `Sending ${conversationHistory.length} messages to Gemini (including ${conversationHistory.filter((m) => m.parts.some((p) => p.inlineData)).length} with images)`,
    );

    const systemPrompt = CONVERSATION_SYSTEM_PROMPT;
    const tools = [
      updateUserNameFunction,
      saveMessageFileToDocumentsFunction,
      getUserDocumentsFunction,
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
    ];

    let currentHistory: Array<{
      role: "user" | "model";
      parts: Array<Record<string, unknown>>;
    }> = conversationHistory;
    let maxIterations = 5;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;
      console.log(`Function call iteration ${iteration}`);

      const result = await generateResponse(
        c,
        currentHistory,
        systemPrompt,
        tools,
      );

      console.log(
        "Gemini response received:",
        result.text ? "has text" : "no text",
        result.functionCalls
          ? `${result.functionCalls.length} function calls`
          : "no function calls",
      );

      if (!result.functionCalls || result.functionCalls.length === 0) {
        if (result.text) {
          await createMessage(c, userId, "assistant", result.text);
          return Ok(result.text);
        }
        return Err("No response from assistant.");
      }

      const functionResponses: Array<{
        name: string;
        response: Record<string, unknown>;
      }> = [];

      for (const functionCall of result.functionCalls) {
        if (functionCall.name === "update_user_name") {
          const args = functionCall.args as { name: string };
          await updateUser(c, userId, { name: args.name });
          console.log(`Updated user ${userId} name to: ${args.name}`);
          functionResponses.push({
            name: functionCall.name,
            response: { success: true },
          });
        } else if (functionCall.name === "save_message_file_to_documents") {
          const args = functionCall.args as {
            messageFileId: number;
            documentType: string;
          };
          try {
            await saveConversationFileAsUserDocument(
              c,
              userId,
              args.messageFileId,
              args.documentType,
            );
            console.log(
              `Saved file ${args.messageFileId} as ${args.documentType} for user ${userId}`,
            );
            functionResponses.push({
              name: functionCall.name,
              response: { success: true },
            });
          } catch (error) {
            console.error("Error saving message file to documents:", error);
            functionResponses.push({
              name: functionCall.name,
              response: { success: false, error: String(error) },
            });
          }
        } else if (functionCall.name === "get_user_documents") {
          const documents = await findUserDocumentsByUserId(c, userId);
          const documentList = documents.map((doc) => ({
            documentType: doc.documentType,
            filename: doc.file.originalFilename,
            uploadedAt: doc.createdAt,
          }));
          console.log(
            `Retrieved ${documentList.length} documents for user ${userId}`,
          );
          functionResponses.push({
            name: functionCall.name,
            response: { documents: documentList },
          });
        } else if (functionCall.name === "create_vehicle_offer") {
          const args = functionCall.args as {
            brand?: string;
            budget?: number;
            model?: string;
            financing?: "lease" | "loan" | "cash";
            timeframe?: string;
            notes?: string;
          };
          const offer = await createVehicleOffer(c, userId, args);
          console.log(`Created vehicle offer ${offer.id} for user ${userId}`);
          functionResponses.push({
            name: functionCall.name,
            response: {
              success: true,
              offerId: offer.id,
              missingFields: getMissingFields(offer),
              alreadyAsked: getQuestionsAsked(offer),
            },
          });
        } else if (functionCall.name === "update_vehicle_offer") {
          const args = functionCall.args as {
            offerId: number;
            updates?: {
              brand?: string;
              budget?: number;
              model?: string;
              financing?: "lease" | "loan" | "cash";
              timeframe?: string;
              notes?: string;
              status?: "collecting_info" | "submitted" | "responded";
            };
            questionsAsked?: string[];
          };
          const offer = await updateVehicleOffer(
            c,
            args.offerId,
            args.updates,
            args.questionsAsked,
          );
          console.log(`Updated vehicle offer ${offer.id}`);
          functionResponses.push({
            name: functionCall.name,
            response: {
              success: true,
              missingFields: getMissingFields(offer),
              alreadyAsked: getQuestionsAsked(offer),
            },
          });
        } else if (functionCall.name === "get_open_offers") {
          const offers = await getOpenOffers(c, userId);
          console.log(
            `Retrieved ${offers.length} open offers for user ${userId}`,
          );
          functionResponses.push({
            name: functionCall.name,
            response: {
              success: true,
              offers: offers.map((offer) => ({
                id: offer.id,
                brand: offer.brand,
                budget: offer.budget,
                model: offer.model,
                financing: offer.financing,
                timeframe: offer.timeframe,
                notes: offer.notes,
                missingFields: getMissingFields(offer),
                alreadyAsked: getQuestionsAsked(offer),
                createdAt: offer.createdAt,
              })),
            },
          });
        } else if (functionCall.name === "ask_vehicle_offer_question") {
          const args = functionCall.args as {
            offerId: number;
            field: string;
            question: string;
          };
          const offer = await updateVehicleOffer(c, args.offerId, undefined, [
            args.field,
          ]);
          console.log(
            `Asked question about ${args.field} for vehicle offer ${offer.id}`,
          );
          functionResponses.push({
            name: functionCall.name,
            response: {
              success: true,
              messageToUser: args.question,
              updatedQuestionsAsked: getQuestionsAsked(offer),
            },
          });
        }
      }

      // Check if any function response contains a messageToUser field
      // If so, save it as assistant message and return immediately
      for (const functionResponse of functionResponses) {
        if (
          functionResponse.response.messageToUser &&
          typeof functionResponse.response.messageToUser === "string"
        ) {
          const message = functionResponse.response.messageToUser;
          await createMessage(c, userId, "assistant", message);
          console.log(`Saved and returning message from function: ${message}`);
          return Ok(message);
        }
      }

      currentHistory = [
        ...currentHistory,
        {
          role: "model" as const,
          parts: result.functionCalls.map((fc) => ({ functionCall: fc })),
        },
        {
          role: "user" as const,
          parts: functionResponses.map((fr) => ({
            functionResponse: {
              name: fr.name,
              response: fr.response,
            },
          })),
        },
      ];
    }

    return Err("Max function call iterations reached.");
  } catch (error) {
    console.error("Error in generateAssistantResponse:", error);
    return Err("Internal server error");
  }
}

export async function handleTextMessage(
  c: Context<{ Bindings: Bindings }>,
  phoneNumber: string,
  messageText: string,
  file?: DatabaseFile,
): Promise<Result<string, string>> {
  const userResult = await saveIncomingMessage(
    c,
    phoneNumber,
    messageText,
    file,
  );

  if (!userResult.ok) {
    return Err(userResult.val);
  }

  const user = userResult.val;
  return await generateAssistantResponse(c, user.id);
}
