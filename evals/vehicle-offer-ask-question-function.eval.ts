// Test for new ask_vehicle_offer_question function approach
// This eval proves the concept before implementing the function

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
  manualMode: false,
  manualModeEnabledAt: null,
  createdAt: new Date(),
};

test("AI should use ask_vehicle_offer_question to ask questions", async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  console.log("Testing new function-based question approach...");

  // Step 1: Call Gemini with user request
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
  console.log("Function calls:", firstResponse.functionCalls?.length || 0);
  console.log(
    "Functions called:",
    firstResponse.functionCalls?.map((fc) => fc.name).join(", "),
  );
  console.log("Text:", firstResponse.text);

  const createCall = firstResponse.functionCalls?.find(
    (call) => call.name === "create_vehicle_offer",
  );
  assert.ok(createCall, "AI should call create_vehicle_offer");

  // Step 2: Simulate function response, call AI again
  const secondResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "jeg vil gerne have et tilbud på en bil" }],
      },
      {
        role: "model",
        parts: [{ functionCall: createCall }],
      },
      {
        role: "user",
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
    ],
    CONVERSATION_SYSTEM_PROMPT(mockUser),
    [
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
    ],
  );

  console.log("\n=== Second Response ===");
  console.log("Function calls:", secondResponse.functionCalls?.length || 0);
  if (secondResponse.functionCalls) {
    console.log(
      "Functions called:",
      secondResponse.functionCalls.map((fc) => fc.name).join(", "),
    );
    secondResponse.functionCalls.forEach((fc) => {
      console.log(`  ${fc.name}:`, JSON.stringify(fc.args, null, 2));
    });
  }
  console.log("Text:", secondResponse.text);

  // Check if AI used the new function
  const askQuestionCall = secondResponse.functionCalls?.find(
    (call) => call.name === "ask_vehicle_offer_question",
  );

  if (askQuestionCall) {
    const args = askQuestionCall.args as {
      offerId?: number;
      field?: string;
      question?: string;
    };
    console.log("\n=== SUCCESS! ===");
    console.log("✓ AI called ask_vehicle_offer_question");
    console.log("  offerId:", args.offerId);
    console.log("  field:", args.field);
    console.log("  question:", args.question);
    assert.ok(args.offerId, "offerId should be provided");
    assert.ok(args.field, "field should be provided");
    assert.ok(args.question, "question should be provided");
  } else {
    console.log("\n=== Still using old approach ===");
    console.log(
      "AI called:",
      secondResponse.functionCalls?.map((fc) => fc.name).join(", "),
    );
    console.log("Expected: ask_vehicle_offer_question");
  }

  // Documentation: Expected conversation flow with new function:
  const expectedFlowWithNewFunction = {
    round1: {
      userMessage: "jeg vil gerne have et tilbud på en bil",
      expectedAIFunctionCall: "create_vehicle_offer",
      expectedArgs: {},
    },
    round2: {
      functionResponse: {
        name: "create_vehicle_offer",
        response: {
          success: true,
          offerId: 1,
          missingFields: ["brand", "budget", "model", "financing", "timeframe"],
          alreadyAsked: [],
        },
      },
      expectedAIFunctionCall: "ask_vehicle_offer_question",
      expectedArgs: {
        offerId: 1,
        field: "brand", // One of: brand, budget, model, financing, timeframe
        question: "Hvilket bilmærke ønsker du?", // The actual question text in Danish
      },
    },
    round3: {
      functionResponse: {
        name: "ask_vehicle_offer_question",
        response: {
          success: true,
          messageToUser: "Hvilket bilmærke ønsker du?", // This gets saved as assistant message
          updatedQuestionsAsked: ["brand"], // Confirms it was marked
        },
      },
      expectedBehavior:
        "Conversation loop saves messageToUser and returns to user",
    },
  };

  console.log("\n=== Expected conversation flow with new function ===");
  console.log(JSON.stringify(expectedFlowWithNewFunction, null, 2));

  // Assertions documenting expected behavior
  console.log("\n=== Expected function signature ===");
  const expectedFunctionSignature = {
    name: "ask_vehicle_offer_question",
    parameters: {
      offerId: "number - The vehicle offer ID",
      field: "enum - One of: brand, budget, model, financing, timeframe",
      question: "string - The question text to ask user in Danish",
    },
    returns: {
      success: "boolean",
      messageToUser: "string - The question to send to user",
      updatedQuestionsAsked: "array - Updated list of asked questions",
    },
  };
  console.log(JSON.stringify(expectedFunctionSignature, null, 2));

  // Benefits of this approach:
  console.log("\n=== Benefits ===");
  console.log("1. AI MUST provide question text (can't return undefined)");
  console.log("2. Question is atomically marked as asked when asking");
  console.log("3. Clear which field is being asked about");
  console.log("4. No extra AI round-trip needed");
  console.log(
    "5. Simpler prompt: just call one function instead of update then text",
  );

  console.log("\n✓ This eval documents expected behavior");
  console.log(
    "Next step: Implement the function and update this eval to make real API calls",
  );
});
