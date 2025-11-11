import {
  ContentListUnion,
  GoogleGenAI,
  FunctionDeclaration,
  FunctionCall,
} from "@google/genai";
import { z } from "zod";
import { createGeminiFunctionDeclaration } from "./functioncall";

export type GeminiBindings = {
  GEMINI_API_KEY: string;
};

export const googleModels = {
  pro: "gemini-2.5-pro",
  flash: "gemini-2.5-flash-preview-09-2025",
  flashLite: "gemini-2.5-flash-lite-preview-09-2025",
};

export async function generateClient(c: { env: GeminiBindings }) {
  const apiKey = c.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
}

const updateUserNameSchema = z.object({
  name: z.string().describe("The new name for the user"),
});

export const updateUserNameFunction = createGeminiFunctionDeclaration({
  name: "update_user_name",
  description:
    "Updates the user's name in the system when they tell you their name or ask to change it",
  schema: updateUserNameSchema,
});

const saveMessageFileToDocumentsSchema = z.object({
  messageFileId: z
    .number()
    .describe("The ID of the file from the conversation message to save"),
  documentType: z
    .enum([
      "taximeter_certificate",
      "vehicle_inspection",
      "taxi_id",
      "winter_tires",
      "drivers_license",
      "vehicle_registration",
      "insurance",
      "tax_card",
      "criminal_record",
      "leasing_agreement",
      "other",
    ])
    .optional()
    .describe(
      "The type of document being saved. Optional - AI will automatically detect document type and expiry date if not provided.",
    ),
});

export const saveMessageFileToDocumentsFunction =
  createGeminiFunctionDeclaration({
    name: "save_message_file_to_documents",
    description:
      "Saves a file from the conversation to the user's permanent document storage. Use this when the user sends an important document like a driver's license, insurance, or vehicle registration. Document type and expiry date will be automatically detected by AI if not provided.",
    schema: saveMessageFileToDocumentsSchema,
  });

const getUserDocumentsSchema = z.object({});

export const getUserDocumentsFunction = createGeminiFunctionDeclaration({
  name: "get_user_documents",
  description:
    "Retrieves the list of documents the user has already saved in their permanent storage. Call this before saving a new document to check if the user already has that document type.",
  schema: getUserDocumentsSchema,
});

const createVehicleOfferSchema = z.object({
  brand: z.string().optional().describe("The vehicle brand (e.g., Toyota, VW)"),
  budget: z
    .number()
    .optional()
    .describe("The user's budget in Danish kroner (DKK)"),
  model: z.string().optional().describe("The specific vehicle model"),
  financing: z
    .enum(["lease", "loan", "cash"])
    .optional()
    .describe("The preferred financing method"),
  timeframe: z
    .string()
    .optional()
    .describe("When the user wants the vehicle (e.g., 'within 3 months')"),
  notes: z.string().optional().describe("Any additional notes or requirements"),
});

export const createVehicleOfferFunction = createGeminiFunctionDeclaration({
  name: "create_vehicle_offer",
  description:
    "Creates a new vehicle quote request when the user expresses interest in getting a vehicle offer. Call this immediately when the user wants a quote, even if you don't have all the information yet. You can collect more details later.",
  schema: createVehicleOfferSchema,
});

const updateVehicleOfferSchema = z.object({
  offerId: z.number().describe("The ID of the vehicle offer to update"),
  updates: z
    .object({
      brand: z
        .string()
        .optional()
        .describe("The vehicle brand (e.g., Toyota, VW)"),
      budget: z
        .number()
        .optional()
        .describe("The user's budget in Danish kroner (DKK)"),
      model: z.string().optional().describe("The specific vehicle model"),
      financing: z
        .enum(["lease", "loan", "cash"])
        .optional()
        .describe("The preferred financing method"),
      timeframe: z
        .string()
        .optional()
        .describe("When the user wants the vehicle (e.g., 'within 3 months')"),
      notes: z
        .string()
        .optional()
        .describe("Any additional notes or requirements"),
      status: z
        .enum(["collecting_info", "submitted", "responded"])
        .optional()
        .describe("The status of the offer"),
    })
    .describe("The fields to update on the vehicle offer"),
});

export const updateVehicleOfferFunction = createGeminiFunctionDeclaration({
  name: "update_vehicle_offer",
  description:
    "Updates an existing vehicle offer with new information when the user provides details about their vehicle preferences (brand, budget, model, financing, timeframe, notes, or status).",
  schema: updateVehicleOfferSchema,
});

const getOpenOffersSchema = z.object({});

export const getOpenOffersFunction = createGeminiFunctionDeclaration({
  name: "get_open_offers",
  description:
    "Retrieves all open vehicle quote requests for the user. Use this to see what offers the user has in progress and what information is still missing.",
  schema: getOpenOffersSchema,
});

const askVehicleOfferQuestionSchema = z.object({
  offerId: z.number().describe("The ID of the vehicle offer to ask about"),
  field: z
    .enum(["brand", "budget", "model", "financing", "timeframe"])
    .describe("The field you are asking about"),
  question: z
    .string()
    .describe("The question to ask the user in Danish (1-2 sentences)"),
});

export const askVehicleOfferQuestionFunction = createGeminiFunctionDeclaration({
  name: "ask_vehicle_offer_question",
  description:
    "Asks the user a question about their vehicle offer and marks it as asked. Use this after creating a vehicle offer to collect missing information. The question will be sent to the user and the field will be tracked as asked.",
  schema: askVehicleOfferQuestionSchema,
});

export type GenerateResponseResult = {
  text?: string;
  functionCalls?: FunctionCall[];
};

export async function generateResponse(
  c: { env: GeminiBindings },
  contents: ContentListUnion,
  systemInstruction?: string,
  tools?: FunctionDeclaration[],
): Promise<GenerateResponseResult> {
  const client = await generateClient(c);
  const response = await client.models.generateContent({
    config: {
      systemInstruction:
        systemInstruction ||
        "Du er en hjælpsom assistant til taxachauffører i København. Svar ALTID med ren tekst uden markdown formatering. Brug ALDRIG *, #, _, eller andre markdown tegn.",
      tools: tools
        ? [
            {
              functionDeclarations: tools,
            },
          ]
        : undefined,
    },
    model: googleModels.flash,
    contents,
  });

  return {
    text: response.text,
    functionCalls: response.functionCalls,
  };
}
