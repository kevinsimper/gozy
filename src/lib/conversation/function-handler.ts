import { type Context } from "hono";
import { Bindings } from "../..";
import { updateUser } from "../../models/user";
import { saveConversationFileAsUserDocument } from "../userDocument";
import { findUserDocumentsByUserId } from "../../models/userDocument";
import {
  createVehicleOffer,
  updateVehicleOffer,
  getOpenOffers,
  getMissingFields,
  getQuestionsAsked,
} from "../../models/vehicleOffer";
import { type FunctionCall } from "@google/genai";

export async function handleFunctionCall(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
  functionCall: FunctionCall,
): Promise<{
  name: string;
  response: Record<string, unknown>;
}> {
  if (functionCall.name === "update_user_name") {
    const args = functionCall.args as { name: string };
    await updateUser(c, userId, { name: args.name });
    console.log(`Updated user ${userId} name to: ${args.name}`);
    return {
      name: functionCall.name,
      response: { success: true },
    };
  } else if (functionCall.name === "save_message_file_to_documents") {
    const args = functionCall.args as {
      messageFileId: number;
      documentType?: string;
    };
    try {
      await saveConversationFileAsUserDocument(
        c,
        userId,
        args.messageFileId,
        args.documentType,
      );
      console.log(
        `Saved file ${args.messageFileId} ${args.documentType ? `as ${args.documentType}` : "(AI will detect type)"} for user ${userId}`,
      );
      return {
        name: functionCall.name,
        response: { success: true },
      };
    } catch (error) {
      console.error("Error saving message file to documents:", error);
      return {
        name: functionCall.name,
        response: { success: false, error: String(error) },
      };
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
    return {
      name: functionCall.name,
      response: { documents: documentList },
    };
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
    return {
      name: functionCall.name,
      response: {
        success: true,
        offerId: offer.id,
        missingFields: getMissingFields(offer),
        alreadyAsked: getQuestionsAsked(offer),
      },
    };
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
    return {
      name: functionCall.name,
      response: {
        success: true,
        missingFields: getMissingFields(offer),
        alreadyAsked: getQuestionsAsked(offer),
      },
    };
  } else if (functionCall.name === "get_open_offers") {
    const offers = await getOpenOffers(c, userId);
    console.log(`Retrieved ${offers.length} open offers for user ${userId}`);
    return {
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
    };
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
    return {
      name: functionCall.name,
      response: {
        success: true,
        messageToUser: args.question,
        updatedQuestionsAsked: getQuestionsAsked(offer),
      },
    };
  }

  throw new Error(`Unknown function call: ${functionCall.name}`);
}
