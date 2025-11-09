# Multi-Agent Architecture

## Overview

Gozy uses a multi-agent system where a router agent delegates conversations to specialized subagents. This design improves task adherence, reduces token usage, and provides clearer separation of concerns.

## Database Schema

### conversation_contexts Table

Tracks which agent is currently active for each user and stores the router's handoff context.

```sql
CREATE TABLE conversation_contexts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  agent_type TEXT NOT NULL,  -- 'vehicle_offer', 'document', 'compliance', 'general', etc.

  -- Router-provided context (key optimization!)
  activation_summary TEXT NOT NULL,  -- Router's summary of why this agent was activated
  activation_message_id INTEGER,     -- Message ID that triggered this agent activation

  -- Agent working state
  context_data TEXT,                 -- JSON: agent-specific state (offerId, currentField, etc.)

  -- Lifecycle tracking
  status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'completed', 'paused'
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (activation_message_id) REFERENCES messages(id)
);

CREATE UNIQUE INDEX conversation_contexts_user_active_idx
  ON conversation_contexts(user_id, status)
  WHERE status = 'active';

CREATE INDEX conversation_contexts_user_created_idx
  ON conversation_contexts(user_id, created_at DESC);
```

## Agent Types

- **general**: Default conversational agent for general questions
- **vehicle_offer**: Collects vehicle quote requirements
- **document**: Handles document uploads and organization
- **compliance**: Manages document expiry reminders and deadlines
- **booking**: RTT appointments and support requests

## Router-to-Subagent Workflow

### 1. Router Analysis

The router reads recent conversation history and decides if an agent switch is needed:

```typescript
const routerDecision = await routerAgent.analyze(recentMessages);

if (routerDecision.switchToAgent) {
  // Router detected intent change
}
```

### 2. Context Creation

When switching agents, the router creates a context with a summary:

```typescript
await createConversationContext({
  userId,
  agentType: "vehicle_offer",
  activationSummary:
    "User wants Toyota Camry quote, budget 200k DKK, leasing preferred",
  activationMessageId: latestMessage.id,
  contextData: JSON.stringify({ priority: "high" }),
});
```

### 3. Subagent Activation

The subagent only reads messages AFTER the activation point:

```typescript
const context = await getActiveContext(userId);
const relevantMessages = await getMessagesSince(
  userId,
  context.activationMessageId,
);

// Subagent prompt includes the activation summary
const subagentPrompt = `
${baseAgentPrompt}

CONTEXT: ${context.activationSummary}

Recent conversation:
${formatMessages(relevantMessages)}
`;
```

### 4. Subagent Execution

The subagent handles the conversation using:

- Its specialized system prompt
- The activation summary from the router
- Only messages since activation
- Its agent-specific function declarations

## Key Benefits

### Token Optimization

Subagents don't re-process the full conversation history. The router's `activation_summary` provides all necessary context.

**Before (monolithic agent):**

- Reads all 50+ messages
- 10,000+ tokens per request

**After (multi-agent):**

- Reads only 5-10 relevant messages
- Uses router's 50-token summary
- 2,000 tokens per request

### Focused Behavior

Each agent has a specialized prompt optimized for its task, leading to better adherence than a monolithic system prompt.

### Clear Handoffs

The `activation_summary` is an explicit instruction to the subagent, making debugging and analytics easier.

### Resumable Contexts

If a user returns days later, the context is preserved in the database.

## Example Activation Summaries

### Vehicle Offer Agent

```
User wants vehicle quote for Toyota (any model), budget 150-200k DKK, needs within 2 months
```

### Document Agent

```
User is uploading their driver's license - need to save as drivers_license type
```

### Compliance Agent

```
User asked about insurance renewal deadline - check their documents for expiry dates
```

### Booking Agent

```
User wants to schedule RTT appointment for vehicle inspection next week
```

## Context Data Examples

The `context_data` JSON field stores agent-specific working state:

### Vehicle Offer Agent

```json
{
  "offerId": 123,
  "currentField": "brand",
  "fieldsCollected": ["budget", "timeframe"],
  "questionsAsked": ["brand", "financing"]
}
```

### Document Agent

```json
{
  "expectedDocumentType": "drivers_license",
  "uploadAttempts": 1,
  "validationErrors": []
}
```

### Compliance Agent

```json
{
  "checkingDocumentIds": [45, 67, 89],
  "upcomingDeadlines": [{ "documentType": "insurance", "expiresIn": "14 days" }]
}
```

## Implementation Notes

### Single Active Agent Per User

The unique index `conversation_contexts_user_active_idx` ensures only one agent is active per user at a time. This keeps the conversation flow simple.

### Agent Completion

When a subagent completes its task, it should:

1. Update status to 'completed'
2. Set `completed_at` timestamp
3. Optionally hand back to 'general' agent

```typescript
await completeConversationContext(contextId, {
  status: "completed",
  completedAt: new Date(),
});

// Optionally activate general agent
await createConversationContext({
  userId,
  agentType: "general",
  activationSummary: "Vehicle quote submitted, ready for general conversation",
  activationMessageId: currentMessageId,
});
```

### Agent Pausing

For multi-turn tasks that may be interrupted:

```typescript
await updateConversationContext(contextId, {
  status: "paused",
  contextData: JSON.stringify(currentState),
});
```

The router can reactivate paused contexts if the user returns to that topic.

## Migration Path

1. Add `conversation_contexts` table via Drizzle migration
2. Create router agent logic in `src/lib/agents/router.ts`
3. Extract first subagent (e.g., VehicleOfferAgent) from existing code
4. Update `src/lib/conversation.ts` to check for active contexts
5. Gradually migrate other domains to specialized agents
6. Keep backward compatibility during transition

## Future Enhancements

- **Multi-agent concurrency**: Remove unique constraint to allow multiple active contexts
- **Agent priority system**: Use `priority` field to determine which agent handles ambiguous messages
- **Agent transition logging**: Add `agent_transitions` table for analytics
- **Context sharing**: Allow agents to read each other's context_data for coordination
