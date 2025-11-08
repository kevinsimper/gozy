# Evals

This folder contains evaluation tests for the Gozy AI system. Unlike unit tests, evals make real API calls to external services (like Gemini) to validate end-to-end behavior.

## Purpose

Evals are used to:

- Validate that the AI correctly uses function calls
- Test complex conversation flows
- Ensure the AI follows expected patterns
- Catch regressions in AI behavior

## Running Evals

```bash
npm run test:evals
```

Evals require a real `GEMINI_API_KEY` environment variable to be set:

```bash
GEMINI_API_KEY=your-key-here npm run test:evals
```

## Writing Evals

Eval files should:

- Be named `*.eval.ts`
- Use Node.js test runner (`node:test`)
- Make real API calls to validate behavior
- Include clear assertions about expected outcomes
- Log helpful debug information

Example:

```typescript
import { test } from "node:test";
import assert from "node:assert";

test("AI does something specific", async () => {
  // Make real API call
  const response = await generateResponse(...);

  // Assert behavior
  assert.ok(response.functionCalls);

  console.log("Debug info:", response);
});
```

## Current Evals

### vehicle-offer-questions-after-ask.eval.ts

Validates that the AI immediately tracks questions after creating a vehicle offer. This ensures the AI marks questions as asked BEFORE sending the text response to the user.

**Test flow:**

1. User requests a vehicle quote
2. AI calls `create_vehicle_offer`
3. Function returns offerId with missingFields
4. AI calls `update_vehicle_offer` with `questionsAsked: ["brand"]`
5. AI sends text message asking about brand

**Expected behavior:**

- AI must call `update_vehicle_offer` BEFORE sending text
- `questionsAsked` array must contain the field being asked about

### vehicle-offer-duplicate-prevention.eval.ts

Validates that the AI does not create duplicate open offers when a user already has one in progress. This ensures users don't end up with multiple incomplete offers.

**Test flow:**

1. User requests a vehicle quote
2. AI creates first offer and asks questions
3. User requests another quote without answering
4. AI should check for existing open offers first
5. AI should NOT immediately create a second offer

**Expected behavior:**

- AI should call `get_open_offers` to check for existing offers
- AI should ask user if they want to continue with existing offer or start fresh
- AI should NOT create duplicate offers without checking first
