import { z } from "zod";
import { createGeminiFunctionDeclaration } from "../../services/gemini/functioncall";

const updateUserNameSchema = z.object({
  name: z.string().describe("The new name for the user"),
});

export const updateUserNameFunction = createGeminiFunctionDeclaration({
  name: "update_user_name",
  description:
    "Updates the user's name in the system when they tell you their name or ask to change it",
  schema: updateUserNameSchema,
});

const updateDriverInfoSchema = z.object({
  driverType: z
    .enum(["vehicle_owner", "driver"])
    .optional()
    .describe(
      "The driver type: 'vehicle_owner' for vognmand (owns vehicle), 'driver' for chauffør (drives for someone else)",
    ),
  taxiId: z.string().optional().describe("The driver's Taxi ID number"),
});

export const updateDriverInfoFunction = createGeminiFunctionDeclaration({
  name: "update_driver_info",
  description:
    "Updates the driver's type (vognmand/chauffør) and Taxi ID when they provide this information during onboarding or profile update",
  schema: updateDriverInfoSchema,
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

const getRttLocationsSchema = z.object({});

export const getRttLocationsFunction = createGeminiFunctionDeclaration({
  name: "get_rtt_locations",
  description:
    "Retrieves the list of all RTT workshop locations with complete information (name, address, phone, email, opening hours). ALWAYS call this function when the user asks ANY question about RTT locations such as: address, phone number, opening hours, email, or location details. Also use when the user wants to check in but doesn't have a preferred location set. NEVER provide RTT information from memory - always fetch from database first.",
  schema: getRttLocationsSchema,
});

const checkInAtLocationSchema = z.object({
  locationId: z.number().describe("The ID of the RTT location to check in at"),
  updatePreferred: z
    .boolean()
    .optional()
    .describe(
      "Whether to save this location as the user's preferred location for future check-ins",
    ),
});

export const checkInAtLocationFunction = createGeminiFunctionDeclaration({
  name: "check_in_at_location",
  description:
    "Records a check-in for the user at the specified RTT location. Optionally updates the user's preferred location if updatePreferred is true.",
  schema: checkInAtLocationSchema,
});

const updatePreferredLocationSchema = z.object({
  locationId: z
    .number()
    .describe("The ID of the RTT location to set as preferred"),
});

export const updatePreferredLocationFunction = createGeminiFunctionDeclaration({
  name: "update_preferred_location",
  description:
    "Updates the user's preferred RTT location without performing a check-in. Use this when the user wants to change their default location.",
  schema: updatePreferredLocationSchema,
});

const sendDocumentLinkSchema = z.object({
  documentPublicId: z
    .string()
    .describe("The publicId of the document to send a link for"),
  message: z
    .string()
    .optional()
    .describe(
      "Optional custom message to include with the link (in Danish). If not provided, a default message will be used.",
    ),
});

export const sendDocumentLinkFunction = createGeminiFunctionDeclaration({
  name: "send_document_link",
  description:
    "Sends a link to the user's document dashboard where they can view or download the document. Use this when the user asks to see a specific document. Call get_user_documents first to get the documentPublicId.",
  schema: sendDocumentLinkSchema,
});
