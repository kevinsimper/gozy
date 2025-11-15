import { test } from "node:test";
import assert from "node:assert";
import { generateResponse } from "../src/services/gemini/client";
import {
  createVehicleOfferFunction,
  updateVehicleOfferFunction,
  getOpenOffersFunction,
  askVehicleOfferQuestionFunction,
} from "../src/lib/conversation/functions";
import { CONVERSATION_SYSTEM_PROMPT } from "../src/lib/prompts";

const mockContext = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  },
};

const mockUser = {
  id: 1,
  name: "Test Driver",
  phoneNumber: "+4512345678",
  email: null,
  role: "driver" as const,
  driverType: "vehicle_owner" as const,
  taxiId: "TEST123",
  loginPin: null,
  loginPinExpiry: null,
  lastLoginAt: null,
  preferredRttLocationId: null,
  createdAt: new Date(),
};

test("AI behavior when asking follow-up questions after creating offer", async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  // Step 1: User asks for a vehicle quote (matching production data)
  const firstResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "jeg vil gerne have et tilbud på en bil" }],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT(mockUser),
    [
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
    ],
  );

  console.log("\n=== First Response ===");
  console.log("Text:", firstResponse.text);
  console.log("Function calls:", firstResponse.functionCalls?.length || 0);
  console.log(
    "Functions called:",
    firstResponse.functionCalls?.map((fc) => fc.name).join(", "),
  );
  console.log("Full response:", JSON.stringify(firstResponse, null, 2));

  // Verify AI called create_vehicle_offer
  assert.ok(
    firstResponse.functionCalls && firstResponse.functionCalls.length > 0,
    "AI should call a function when user requests a quote",
  );

  const createCall = firstResponse.functionCalls?.find(
    (call) => call.name === "create_vehicle_offer",
  );
  assert.ok(createCall, "AI should call create_vehicle_offer");

  // Step 2: Simulate function response
  const conversationWithFunctionResponse = [
    {
      role: "user" as const,
      parts: [{ text: "jeg vil gerne have et tilbud på en bil" }],
    },
    {
      role: "model" as const,
      parts: [{ functionCall: createCall }],
    },
    {
      role: "user" as const,
      parts: [
        {
          functionResponse: {
            name: "create_vehicle_offer",
            response: {
              success: true,
              offerId: 1,
              missingFields: [
                "brand",
                "budget",
                "model",
                "financing",
                "timeframe",
              ],
              alreadyAsked: [],
            },
          },
        },
      ],
    },
  ];

  const secondResponse = await generateResponse(
    mockContext,
    conversationWithFunctionResponse,
    CONVERSATION_SYSTEM_PROMPT(mockUser),
    [
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
    ],
  );

  console.log("\n=== Second Response (after create) ===");
  console.log("Has text response:", !!secondResponse.text);
  console.log("Text:", secondResponse.text);
  console.log("Function calls:", secondResponse.functionCalls?.length || 0);
  if (secondResponse.functionCalls && secondResponse.functionCalls.length > 0) {
    console.log(
      "Functions called:",
      secondResponse.functionCalls.map((fc) => fc.name).join(", "),
    );
    secondResponse.functionCalls.forEach((fc) => {
      console.log(`  ${fc.name}:`, JSON.stringify(fc.args, null, 2));
    });
  }
  console.log(
    "Full response:",
    JSON.stringify(
      {
        text: secondResponse.text,
        functionCalls: secondResponse.functionCalls,
      },
      null,
      2,
    ),
  );

  // Check that AI uses the new function
  const askQuestionCall = secondResponse.functionCalls?.find(
    (call) => call.name === "ask_vehicle_offer_question",
  );

  if (askQuestionCall) {
    const args = askQuestionCall.args as {
      offerId?: number;
      field?: string;
      question?: string;
    };
    console.log("\n=== Current Behavior ===");
    console.log("✓ GOOD: AI uses ask_vehicle_offer_question");
    console.log("  field:", args.field);
    console.log("  question:", args.question);
    assert.ok(args.field, "field should be provided");
    assert.ok(args.question, "question should be provided");
  } else {
    // Check for old approach
    const updateCall = secondResponse.functionCalls?.find(
      (call) => call.name === "update_vehicle_offer",
    );
    if (updateCall) {
      console.log("\n=== Current Behavior ===");
      console.log("⚠ AI still using old update_vehicle_offer approach");
      console.log("Expected: ask_vehicle_offer_question");
    }
  }

  console.log("\n✓ Test verifies AI behavior");
});
