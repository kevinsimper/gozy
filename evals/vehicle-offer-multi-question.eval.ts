import { test } from "node:test";
import assert from "node:assert";
import { generateResponse } from "../src/services/gemini/client";
import {
  createVehicleOfferFunction,
  updateVehicleOfferFunction,
  getOpenOffersFunction,
  askVehicleOfferQuestionFunction,
} from "../src/services/gemini/client";
import { CONVERSATION_SYSTEM_PROMPT } from "../src/lib/prompts";

const mockContext = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  },
};

test("AI should ask multiple questions in sequence", async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  console.log("Testing multi-question flow...");

  // Step 1: User requests quote
  const firstResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "jeg vil gerne have et tilbud på en bil" }],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT,
    [
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
    ],
  );

  console.log("\n=== Step 1: Initial request ===");
  console.log(
    "AI called:",
    firstResponse.functionCalls?.map((fc) => fc.name).join(", "),
  );

  const createCall = firstResponse.functionCalls?.find(
    (call) => call.name === "create_vehicle_offer",
  );
  assert.ok(createCall, "AI should call create_vehicle_offer");

  // Step 2: AI asks first question
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
    CONVERSATION_SYSTEM_PROMPT,
    [
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
    ],
  );

  console.log("\n=== Step 2: First question ===");
  console.log(
    "AI called:",
    secondResponse.functionCalls?.map((fc) => fc.name).join(", "),
  );

  const firstQuestionCall = secondResponse.functionCalls?.find(
    (call) => call.name === "ask_vehicle_offer_question",
  );
  assert.ok(firstQuestionCall, "AI should call ask_vehicle_offer_question");

  const firstQuestionArgs = firstQuestionCall.args as {
    offerId: number;
    field: string;
    question: string;
  };
  console.log("First question field:", firstQuestionArgs.field);
  console.log("First question text:", firstQuestionArgs.question);

  // Step 3: User answers first question
  const thirdResponse = await generateResponse(
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
      {
        role: "model",
        parts: [{ functionCall: firstQuestionCall }],
      },
      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: "ask_vehicle_offer_question",
              response: {
                success: true,
                messageToUser: firstQuestionArgs.question,
                updatedQuestionsAsked: [firstQuestionArgs.field],
              },
            },
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "Toyota" }],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT,
    [
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
    ],
  );

  console.log("\n=== Step 3: After user answers ===");
  console.log(
    "AI called:",
    thirdResponse.functionCalls?.map((fc) => fc.name).join(", "),
  );

  if (thirdResponse.functionCalls) {
    thirdResponse.functionCalls.forEach((fc) => {
      console.log(`  ${fc.name}:`, JSON.stringify(fc.args, null, 2));
    });
  }

  // Check if AI updated the offer with the answer
  const updateCall = thirdResponse.functionCalls?.find(
    (call) => call.name === "update_vehicle_offer",
  );

  if (updateCall) {
    console.log("\n✓ GOOD: AI called update_vehicle_offer with user's answer");
  } else {
    console.log("\n⚠ AI did not update the offer with user's answer");
  }

  // Step 4: Simulate update response and see if AI asks second question
  const fourthResponse = await generateResponse(
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
      {
        role: "model",
        parts: [{ functionCall: firstQuestionCall }],
      },
      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: "ask_vehicle_offer_question",
              response: {
                success: true,
                messageToUser: firstQuestionArgs.question,
                updatedQuestionsAsked: [firstQuestionArgs.field],
              },
            },
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "Toyota" }],
      },
      {
        role: "model",
        parts: updateCall ? [{ functionCall: updateCall }] : [],
      },
      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: "update_vehicle_offer",
              response: {
                success: true,
                missingFields: ["budget", "model", "financing", "timeframe"],
                alreadyAsked: ["brand"],
              },
            },
          },
        ],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT,
    [
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
    ],
  );

  console.log("\n=== Step 4: After update response ===");
  console.log(
    "AI called:",
    fourthResponse.functionCalls?.map((fc) => fc.name).join(", "),
  );

  if (fourthResponse.functionCalls) {
    fourthResponse.functionCalls.forEach((fc) => {
      console.log(`  ${fc.name}:`, JSON.stringify(fc.args, null, 2));
    });
  }

  // Check if AI asked a second question
  const secondQuestionCall = fourthResponse.functionCalls?.find(
    (call) => call.name === "ask_vehicle_offer_question",
  );

  if (secondQuestionCall) {
    const secondQuestionArgs = secondQuestionCall.args as {
      offerId: number;
      field: string;
      question: string;
    };
    console.log("\n✓ EXCELLENT: AI asked a second question!");
    console.log("Second question field:", secondQuestionArgs.field);
    console.log("Second question text:", secondQuestionArgs.question);
    assert.notEqual(
      secondQuestionArgs.field,
      firstQuestionArgs.field,
      "Second question should be about a different field",
    );
  } else {
    console.log("\n⚠ AI did not ask a second question");
    console.log("Expected: AI should continue asking about missing fields");
  }

  console.log("\n✓ Test completed");
});
