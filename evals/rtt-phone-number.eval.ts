// Test that AI provides correct RTT phone numbers from database, not from memory
// Reproduces the bug: User asks "vad er deres telefon?" → AI asks which location → User says "søborg" → AI gives WRONG number

import { test } from "node:test";
import assert from "node:assert";
import { generateResponse } from "../src/services/gemini/client";
import { lookupRttLocationInfoFunction } from "../src/lib/conversation/functions";
import { CONVERSATION_SYSTEM_PROMPT } from "../src/lib/prompts";

const mockContext = {
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  },
};

const mockUser = {
  id: 1,
  name: "Kevin Simper",
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

// Correct RTT phone number from database
const CORRECT_SOBORG_PHONE = "+45 44 53 55 15";
const WRONG_PHONE = "+45 70 20 20 20"; // The incorrect number AI was providing

test("AI should provide correct Søborg phone number, not wrong one from memory", async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  console.log("\n=== Reproducing the bug ===");
  console.log("User: vad er deres telefon?");

  // Step 1: User asks "vad er deres telefon?"
  const firstResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "vad er deres telefon?" }],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT(mockUser),
    [lookupRttLocationInfoFunction],
  );

  console.log("AI:", firstResponse.text || "[function call]");
  console.log(
    "Function calls:",
    firstResponse.functionCalls?.map((fc) => fc.name).join(", ") || "none",
  );

  // Step 2: User says "søborg"
  const secondResponse = await generateResponse(
    mockContext,
    [
      {
        role: "user",
        parts: [{ text: "vad er deres telefon?" }],
      },
      {
        role: "model",
        parts: firstResponse.text
          ? [{ text: firstResponse.text }]
          : firstResponse.functionCalls
            ? [{ functionCall: firstResponse.functionCalls[0] }]
            : [{ text: "" }],
      },
      {
        role: "user",
        parts: [{ text: "søborg" }],
      },
    ],
    CONVERSATION_SYSTEM_PROMPT(mockUser),
    [lookupRttLocationInfoFunction],
  );

  console.log("\nUser: søborg");
  console.log("AI:", secondResponse.text || "[function call]");
  console.log(
    "Function calls:",
    secondResponse.functionCalls?.map((fc) => fc.name).join(", ") || "none",
  );

  // If AI called lookup_rtt_location_info, provide the data
  let finalText = secondResponse.text;
  if (
    secondResponse.functionCalls?.some(
      (fc) => fc.name === "lookup_rtt_location_info",
    )
  ) {
    const finalResponse = await generateResponse(
      mockContext,
      [
        {
          role: "user",
          parts: [{ text: "vad er deres telefon?" }],
        },
        {
          role: "model",
          parts: firstResponse.text
            ? [{ text: firstResponse.text }]
            : firstResponse.functionCalls
              ? [{ functionCall: firstResponse.functionCalls[0] }]
              : [{ text: "" }],
        },
        {
          role: "user",
          parts: [{ text: "søborg" }],
        },
        {
          role: "model",
          parts: [
            {
              functionCall: secondResponse.functionCalls.find(
                (fc) => fc.name === "lookup_rtt_location_info",
              ),
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: "lookup_rtt_location_info",
                response: {
                  success: true,
                  locations: [
                    {
                      id: 1,
                      slug: "soborg",
                      name: "RTT Søborg",
                      phone: "+45 44 53 55 15",
                    },
                    {
                      id: 2,
                      slug: "aarhus",
                      name: "RTT Århus",
                      phone: "+45 86 24 14 55",
                    },
                    {
                      id: 3,
                      slug: "aalborg",
                      name: "RTT Aalborg",
                      phone: "+45 28 93 91 99",
                    },
                  ],
                },
              },
            },
          ],
        },
      ],
      CONVERSATION_SYSTEM_PROMPT(mockUser),
      [lookupRttLocationInfoFunction],
    );
    finalText = finalResponse.text;
    console.log("AI (after function):", finalText);
  }

  // Assertions
  assert.ok(finalText, "AI must provide a response");
  assert.ok(
    finalText.includes(CORRECT_SOBORG_PHONE),
    `AI MUST provide correct Søborg phone: ${CORRECT_SOBORG_PHONE}\nBut got: ${finalText}`,
  );
  assert.ok(
    !finalText.includes(WRONG_PHONE),
    `AI MUST NOT provide wrong phone: ${WRONG_PHONE}\nBut got: ${finalText}`,
  );

  console.log("\n✓ PASS: AI provided correct phone number");
  console.log(`✓ Correct: ${CORRECT_SOBORG_PHONE}`);
  console.log(`✓ Did NOT use wrong: ${WRONG_PHONE}`);
});

test("AI should provide correct phone numbers for all RTT locations", async () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const locations = [
    { slug: "søborg", correct: "+45 44 53 55 15" },
    { slug: "århus", correct: "+45 86 24 14 55" },
    { slug: "aalborg", correct: "+45 28 93 91 99" },
  ];

  for (const location of locations) {
    console.log(`\n=== Testing ${location.slug} ===`);

    const response = await generateResponse(
      mockContext,
      [
        {
          role: "user",
          parts: [
            { text: `hvad er telefonnummeret til RTT ${location.slug}?` },
          ],
        },
      ],
      CONVERSATION_SYSTEM_PROMPT(mockUser),
      [lookupRttLocationInfoFunction],
    );

    console.log("Function calls:", response.functionCalls?.length || 0);

    // Must call lookup_rtt_location_info
    const lookupCall = response.functionCalls?.find(
      (call) => call.name === "lookup_rtt_location_info",
    );

    assert.ok(
      lookupCall,
      `AI must call lookup_rtt_location_info for ${location.slug}`,
    );

    // Get final response with data
    const finalResponse = await generateResponse(
      mockContext,
      [
        {
          role: "user",
          parts: [
            { text: `hvad er telefonnummeret til RTT ${location.slug}?` },
          ],
        },
        {
          role: "model",
          parts: [{ functionCall: lookupCall }],
        },
        {
          role: "user",
          parts: [
            {
              functionResponse: {
                name: "lookup_rtt_location_info",
                response: {
                  success: true,
                  locations: [
                    {
                      id: 1,
                      slug: "soborg",
                      name: "RTT Søborg",
                      phone: "+45 44 53 55 15",
                    },
                    {
                      id: 2,
                      slug: "aarhus",
                      name: "RTT Århus",
                      phone: "+45 86 24 14 55",
                    },
                    {
                      id: 3,
                      slug: "aalborg",
                      name: "RTT Aalborg",
                      phone: "+45 28 93 91 99",
                    },
                  ],
                },
              },
            },
          ],
        },
      ],
      CONVERSATION_SYSTEM_PROMPT(mockUser),
      [lookupRttLocationInfoFunction],
    );

    assert.ok(
      finalResponse.text?.includes(location.correct),
      `AI must provide correct phone for ${location.slug}: ${location.correct}`,
    );

    console.log(`✓ Correct phone number provided for ${location.slug}`);
  }
});
