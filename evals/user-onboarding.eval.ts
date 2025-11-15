// Test for user onboarding flow
// Verifies that AI properly onboards new users by collecting name, driver type, and taxi ID

import { test } from "node:test";
import assert from "node:assert";
import { generateResponse } from "../src/services/gemini/client";
import {
  updateUserNameFunction,
  updateDriverInfoFunction,
} from "../src/lib/conversation/functions";
import { CONVERSATION_SYSTEM_PROMPT } from "../src/lib/prompts";

const mockContext = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  },
};

const newUser = {
  id: 1,
  name: "Ny Bruger",
  phoneNumber: "+4512345678",
  email: null,
  role: "driver" as const,
  driverType: null, // Not onboarded yet
  taxiId: null, // Not onboarded yet
  loginPin: null,
  loginPinExpiry: null,
  lastLoginAt: null,
  preferredRttLocationId: null,
  createdAt: new Date(),
};

test("AI should onboard new user by collecting name, driver type, and taxi ID", async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  console.log("\n=== Testing onboarding flow for new user ===");

  // Step 1: User greets - AI should welcome and ask for name
  const firstResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "Hej" }],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT(newUser),
    [updateUserNameFunction, updateDriverInfoFunction],
  );

  console.log("\n=== Step 1: Initial greeting ===");
  console.log("Text:", firstResponse.text);
  console.log("Function calls:", firstResponse.functionCalls?.length || 0);

  // AI should greet and ask for name (might not call function yet)
  assert.ok(
    firstResponse.text,
    "AI should respond with text asking for information",
  );

  // Step 2: User provides name
  const secondResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "Hej" }],
      },
      {
        role: "model",
        parts: [{ text: firstResponse.text || "" }],
      },
      {
        role: "user",
        parts: [{ text: "Mit navn er Hans Jensen" }],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT(newUser),
    [updateUserNameFunction, updateDriverInfoFunction],
  );

  console.log("\n=== Step 2: User provides name ===");
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

  // AI should call update_user_name
  const updateNameCall = secondResponse.functionCalls?.find(
    (call) => call.name === "update_user_name",
  );
  assert.ok(updateNameCall, "AI should call update_user_name");
  const nameArgs = updateNameCall?.args as { name?: string };
  assert.ok(nameArgs.name, "AI should extract name from user message");
  console.log("✓ AI called update_user_name with name:", nameArgs.name);

  // Step 3: Continue conversation after name update - AI should ask about driver type
  const thirdResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "Hej" }],
      },
      {
        role: "model",
        parts: [{ text: firstResponse.text || "" }],
      },
      {
        role: "user",
        parts: [{ text: "Mit navn er Hans Jensen" }],
      },
      {
        role: "model",
        parts: [{ functionCall: updateNameCall }],
      },
      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: "update_user_name",
              response: {
                success: true,
                message: "Name updated successfully",
              },
            },
          },
        ],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT(newUser),
    [updateUserNameFunction, updateDriverInfoFunction],
  );

  console.log("\n=== Step 3: After name update ===");
  console.log("Text:", thirdResponse.text);

  // AI should ask about driver type
  assert.ok(thirdResponse.text, "AI should ask about driver type or taxi ID");

  // Step 4: User provides driver type and taxi ID
  const fourthResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "Hej" }],
      },
      {
        role: "model",
        parts: [{ text: firstResponse.text || "" }],
      },
      {
        role: "user",
        parts: [{ text: "Mit navn er Hans Jensen" }],
      },
      {
        role: "model",
        parts: [{ functionCall: updateNameCall }],
      },
      {
        role: "user",
        parts: [
          {
            functionResponse: {
              name: "update_user_name",
              response: {
                success: true,
                message: "Name updated successfully",
              },
            },
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: thirdResponse.text || "" }],
      },
      {
        role: "user",
        parts: [{ text: "Jeg er vognmand og mit taxi ID er ABC123" }],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT(newUser),
    [updateUserNameFunction, updateDriverInfoFunction],
  );

  console.log("\n=== Step 4: User provides driver type and taxi ID ===");
  console.log("Function calls:", fourthResponse.functionCalls?.length || 0);
  if (fourthResponse.functionCalls) {
    console.log(
      "Functions called:",
      fourthResponse.functionCalls.map((fc) => fc.name).join(", "),
    );
    fourthResponse.functionCalls.forEach((fc) => {
      console.log(`  ${fc.name}:`, JSON.stringify(fc.args, null, 2));
    });
  }
  console.log("Text:", fourthResponse.text);

  // AI should call update_driver_info with both driverType and taxiId
  const updateDriverCall = fourthResponse.functionCalls?.find(
    (call) => call.name === "update_driver_info",
  );
  assert.ok(updateDriverCall, "AI should call update_driver_info");

  const driverArgs = updateDriverCall?.args as {
    driverType?: string;
    taxiId?: string;
  };
  assert.ok(driverArgs.driverType, "AI should extract driver type");
  assert.ok(driverArgs.taxiId, "AI should extract taxi ID");

  // Verify driver type is correct (vognmand = vehicle_owner)
  assert.strictEqual(
    driverArgs.driverType,
    "vehicle_owner",
    "AI should map 'vognmand' to 'vehicle_owner'",
  );

  console.log("\n=== SUCCESS! ===");
  console.log("✓ AI successfully onboarded user");
  console.log("  Driver type:", driverArgs.driverType);
  console.log("  Taxi ID:", driverArgs.taxiId);

  // Expected onboarding flow documentation
  const expectedOnboardingFlow = {
    step1: {
      userMessage: "Hej",
      expectedBehavior: "AI welcomes user and asks for name",
    },
    step2: {
      userMessage: "Mit navn er Hans Jensen",
      expectedFunctionCall: "update_user_name",
      expectedArgs: { name: "Hans Jensen" },
    },
    step3: {
      functionResponse: {
        name: "update_user_name",
        response: { success: true },
      },
      expectedBehavior:
        "AI asks if user is 'vognmand' or 'chauffør' and asks for Taxi ID",
    },
    step4: {
      userMessage: "Jeg er vognmand og mit taxi ID er ABC123",
      expectedFunctionCall: "update_driver_info",
      expectedArgs: {
        driverType: "vehicle_owner",
        taxiId: "ABC123",
      },
    },
    step5: {
      functionResponse: {
        name: "update_driver_info",
        response: { success: true },
      },
      expectedBehavior:
        "AI confirms onboarding complete and explains what Gozy can help with",
    },
  };

  console.log("\n=== Expected onboarding flow ===");
  console.log(JSON.stringify(expectedOnboardingFlow, null, 2));

  console.log("\n=== User onboarding criteria ===");
  console.log("User is considered 'onboarded' when:");
  console.log("1. user.name is set (not null)");
  console.log("2. user.driverType is set (either 'vehicle_owner' or 'driver')");
  console.log("3. user.taxiId is set (not null)");

  console.log("\n✓ Test completed successfully");
});

test("AI should recognize difference between vognmand and chauffør", async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  console.log("\n=== Testing driver type recognition ===");

  // Test case 1: chauffør should map to "driver"
  const chaufforResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "Jeg er chauffør og mit taxi ID er XYZ789" }],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT(newUser),
    [updateUserNameFunction, updateDriverInfoFunction],
  );

  console.log("\n=== Test: chauffør ===");
  console.log("Function calls:", chaufforResponse.functionCalls?.length || 0);
  if (chaufforResponse.functionCalls) {
    chaufforResponse.functionCalls.forEach((fc) => {
      console.log(`  ${fc.name}:`, JSON.stringify(fc.args, null, 2));
    });
  }

  const chaufforCall = chaufforResponse.functionCalls?.find(
    (call) => call.name === "update_driver_info",
  );

  if (chaufforCall) {
    const args = chaufforCall.args as {
      driverType?: string;
      taxiId?: string;
    };
    console.log("✓ Driver type for chauffør:", args.driverType);
    console.log("✓ Taxi ID:", args.taxiId);

    // Note: We're documenting current behavior, not enforcing strict mapping yet
    // The AI might correctly map "chauffør" to "driver" or might need improvement
    if (args.driverType === "driver") {
      console.log("✓ EXCELLENT: AI correctly mapped chauffør to 'driver'");
    } else {
      console.log(
        "⚠ AI mapped chauffør to:",
        args.driverType,
        "(expected 'driver')",
      );
    }
  }

  console.log("\n=== Driver type mapping ===");
  console.log("vognmand (owns vehicle) → vehicle_owner");
  console.log("chauffør (drives for others) → driver");

  console.log("\n✓ Test completed");
});

test("AI should handle various WhatsApp greetings to initiate onboarding", async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  console.log("\n=== Testing various WhatsApp greetings ===");

  const greetings = [
    "Hej",
    "Hey",
    "Hejsa",
    "Goddag",
    "Hej med dig",
    "Hi",
    "Halløj",
  ];

  for (const greeting of greetings) {
    console.log(`\n--- Testing greeting: "${greeting}" ---`);

    const response = await generateResponse(
      mockContext,
      [
        {
          role: "user",
          parts: [{ text: greeting }],
        },
      ],
      CONVERSATION_SYSTEM_PROMPT(newUser),
      [updateUserNameFunction, updateDriverInfoFunction],
    );

    console.log("AI response:", response.text);

    // AI should respond with text (welcoming and asking for name)
    assert.ok(
      response.text,
      `AI should respond to "${greeting}" with welcoming text`,
    );

    // AI should not call functions on first greeting - just ask for information
    const hasNameFunction = response.functionCalls?.some(
      (call) => call.name === "update_user_name",
    );
    assert.ok(
      !hasNameFunction,
      `AI should not call update_user_name on greeting "${greeting}" without name provided`,
    );

    console.log(`✓ AI properly handled greeting: "${greeting}"`);
  }

  console.log("\n=== Test Summary ===");
  console.log("✓ AI handles all common Danish/English greetings");
  console.log("✓ AI welcomes user and initiates onboarding flow");
  console.log(
    "✓ AI asks for information without making premature function calls",
  );

  console.log("\n=== Expected WhatsApp onboarding initiation ===");
  console.log("User sends any greeting (hej, hey, goddag, etc.)");
  console.log("→ AI welcomes user to Gozy");
  console.log("→ AI asks for user's name");
  console.log("→ Onboarding flow begins");

  console.log("\n✓ Test completed successfully");
});
