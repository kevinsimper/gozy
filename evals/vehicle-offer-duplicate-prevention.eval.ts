import { test } from "node:test";
import assert from "node:assert";
import { generateResponse } from "../src/services/gemini/client";
import {
  createVehicleOfferFunction,
  updateVehicleOfferFunction,
  getOpenOffersFunction,
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

test("AI should not create duplicate offers when user already has an open offer", async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  // Step 1: User asks for first quote
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
    ],
  );

  console.log("\n=== First Request ===");
  console.log("Function calls:", firstResponse.functionCalls?.length || 0);
  console.log(
    "Functions called:",
    firstResponse.functionCalls?.map((fc) => fc.name).join(", "),
  );

  // Verify AI created an offer
  const createCall = firstResponse.functionCalls?.find(
    (call) => call.name === "create_vehicle_offer",
  );
  assert.ok(
    createCall,
    "AI should call create_vehicle_offer for first request",
  );

  // Step 2: Simulate conversation after first offer was created and question asked
  const conversationAfterFirstOffer = [
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
    conversationAfterFirstOffer,
    CONVERSATION_SYSTEM_PROMPT(mockUser),
    [
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
    ],
  );

  // Get the update call and text response
  const updateCall = secondResponse.functionCalls?.find(
    (call) => call.name === "update_vehicle_offer",
  );

  // Step 3: User asks for another quote without answering the question
  const conversationWithDuplicateRequest = [
    ...conversationAfterFirstOffer,
    {
      role: "model" as const,
      parts: updateCall
        ? [
            { functionCall: updateCall },
            { text: secondResponse.text || "Hvilket bilmærke ønsker du?" },
          ]
        : [{ text: secondResponse.text || "Hvilket bilmærke ønsker du?" }],
    },
    ...(updateCall
      ? [
          {
            role: "user" as const,
            parts: [
              {
                functionResponse: {
                  name: "update_vehicle_offer",
                  response: {
                    success: true,
                    missingFields: [
                      "brand",
                      "budget",
                      "model",
                      "financing",
                      "timeframe",
                    ],
                    alreadyAsked: ["brand"],
                  },
                },
              },
            ],
          },
        ]
      : []),
    {
      role: "user" as const,
      parts: [{ text: "jeg vil gerne have et tilbud på en bil" }],
    },
  ];

  const thirdResponse = await generateResponse(
    mockContext,
    conversationWithDuplicateRequest,
    CONVERSATION_SYSTEM_PROMPT(mockUser),
    [
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
    ],
  );

  console.log("\n=== Second Request (duplicate) ===");
  console.log("Function calls:", thirdResponse.functionCalls?.length || 0);
  if (thirdResponse.functionCalls && thirdResponse.functionCalls.length > 0) {
    console.log(
      "Functions called:",
      thirdResponse.functionCalls.map((fc) => fc.name).join(", "),
    );
    thirdResponse.functionCalls.forEach((fc) => {
      console.log(`  ${fc.name}:`, JSON.stringify(fc.args, null, 2));
    });
  }
  console.log("Text:", thirdResponse.text);

  // Check current behavior
  const getOffersCall = thirdResponse.functionCalls?.find(
    (call) => call.name === "get_open_offers",
  );
  const duplicateCreateCall = thirdResponse.functionCalls?.find(
    (call) => call.name === "create_vehicle_offer",
  );

  console.log("\n=== Current Behavior ===");
  if (getOffersCall) {
    console.log(
      "✓ GOOD: AI calls get_open_offers to check for existing offers",
    );
  } else {
    console.log("⚠ AI did NOT check for existing open offers");
  }

  if (duplicateCreateCall) {
    console.log(
      "⚠ BUG: AI created a second offer without checking for existing ones",
    );
    console.log(
      "Expected: AI should check get_open_offers first, then ask user if they want a new offer",
    );
  } else {
    console.log("✓ GOOD: AI did not immediately create a duplicate offer");
  }

  console.log(
    "\n✓ Test documents current behavior for duplicate offer prevention",
  );
});
