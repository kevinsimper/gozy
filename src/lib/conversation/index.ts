import { type Context } from "hono";
import { Ok, Err, Result } from "@casperlabs/ts-results/esm/index";
import { type Content } from "@google/genai";
import { generateResponse } from "../../services/gemini/client";
import {
  updateUserNameFunction,
  updateDriverInfoFunction,
  saveMessageFileToDocumentsFunction,
  getUserDocumentsFunction,
  createVehicleOfferFunction,
  updateVehicleOfferFunction,
  getOpenOffersFunction,
  askVehicleOfferQuestionFunction,
  lookupRttLocationInfoFunction,
  checkInAtLocationFunction,
  updatePreferredLocationFunction,
  addTaxiIdFunction,
  getTaxiIdsFunction,
  sendRandomDogImageFunction,
  sendDocumentImageFunction,
} from "./functions";
import {
  findUserByPhoneNumber,
  findUserById,
  createUser,
  type User,
} from "../../models/user";
import { createMessage } from "../../models/message";
import { Bindings } from "../..";
import { DatabaseFile } from "../../models/file";
import { CONVERSATION_SYSTEM_PROMPT } from "../prompts";
import { formatConversationHistory } from "./history-formatter";
import { handleFunctionCall } from "./function-handler";
import { findTaxiIdsByUserId } from "../../models/taxiid";
import { findRttLocationById } from "../../models/rttlocation";

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
    // Mark messages sent during manual mode so they're excluded from AI context
    await createMessage(
      c,
      user.id,
      "user",
      messageText || "Image",
      file,
      undefined, // sentByAdminId
      user.manualMode, // sentDuringManualMode
    );
    console.log(`Saved user message with ${file ? "file" : "no file"}`);

    return Ok(user);
  } catch (error) {
    console.error("Error in saveIncomingMessage:", error);
    return Err("Failed to save message");
  }
}

export type AssistantResponse =
  | { type: "success"; text: string; fileId?: number }
  | { type: "skipped"; reason: "manualMode" };

export async function generateAssistantResponse(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
): Promise<Result<AssistantResponse, string>> {
  try {
    // Get user data for system prompt
    const user = await findUserById(c, userId);
    if (!user) {
      return Err("User not found");
    }

    // Check if user is in manual mode - skip AI response
    if (user.manualMode) {
      console.log(`User ${userId} is in manual mode, skipping AI response`);
      return Ok({ type: "skipped", reason: "manualMode" });
    }

    // Fetch taxi IDs
    const taxiIds = await findTaxiIdsByUserId(c, userId);
    const taxiIdStrings = taxiIds.map((t) => t.taxiId);

    // Fetch preferred location name
    let preferredLocationName: string | undefined;
    if (user.preferredRttLocationId) {
      const location = await findRttLocationById(
        c,
        user.preferredRttLocationId,
      );
      if (location) {
        preferredLocationName = location.name;
      }
    }

    // Get recent conversation history with files
    const conversationHistory = await formatConversationHistory(c, userId, 10);

    console.log(
      `Sending ${conversationHistory.length} messages to Gemini (including ${conversationHistory.filter((m) => m.parts?.some((p) => p.inlineData)).length} with images)`,
    );

    const systemPrompt = CONVERSATION_SYSTEM_PROMPT({
      ...user,
      taxiIds: taxiIdStrings,
      preferredLocationName,
      preferredRttLocationId: user.preferredRttLocationId,
    });
    const tools = [
      updateUserNameFunction,
      updateDriverInfoFunction,
      saveMessageFileToDocumentsFunction,
      getUserDocumentsFunction,
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
      lookupRttLocationInfoFunction,
      checkInAtLocationFunction,
      updatePreferredLocationFunction,
      addTaxiIdFunction,
      getTaxiIdsFunction,
      sendRandomDogImageFunction,
      sendDocumentImageFunction,
    ];

    let currentHistory: Content[] = conversationHistory;
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
          return Ok({ type: "success", text: result.text });
        }
        return Err("No response from assistant.");
      }

      const functionResponses: Array<{
        name: string;
        response: Record<string, unknown>;
      }> = [];

      for (const functionCall of result.functionCalls) {
        const functionResponse = await handleFunctionCall(
          c,
          userId,
          functionCall,
        );
        functionResponses.push(functionResponse);
      }

      // Check if any function response contains a messageToUser field
      // If so, save it as assistant message and return immediately
      for (const functionResponse of functionResponses) {
        if (
          functionResponse.response.messageToUser &&
          typeof functionResponse.response.messageToUser === "string"
        ) {
          const message = functionResponse.response.messageToUser;

          // Check if there's also a fileId to attach
          let fileToAttach;
          if (
            functionResponse.response.fileId &&
            typeof functionResponse.response.fileId === "number"
          ) {
            const { findFileById } = await import("../../models/file");
            fileToAttach = await findFileById(
              c,
              functionResponse.response.fileId,
            );
          }

          await createMessage(c, userId, "assistant", message, fileToAttach);
          console.log(
            `Saved and returning message from function: ${message}${fileToAttach ? ` with file ${fileToAttach.id}` : ""}`,
          );
          return Ok({
            type: "success",
            text: message,
            fileId: fileToAttach?.id,
          });
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
): Promise<Result<AssistantResponse, string>> {
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
