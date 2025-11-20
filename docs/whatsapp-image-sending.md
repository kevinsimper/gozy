# WhatsApp Image Sending Architecture

This document describes how the Gozy platform sends images to users via WhatsApp, including the complete flow from AI-generated image responses to delivery through the WhatsApp bot.

## Overview

The image sending feature allows the AI assistant to send images to users through WhatsApp conversations. This is implemented using:

1. **AI Function Calling**: Gemini AI can call functions to generate/fetch images
2. **R2 Storage**: Images are stored in Cloudflare R2 for reliable access
3. **Time-Limited Public URLs**: Files are accessible via public URLs for 1 hour
4. **WhatsApp Bot Integration**: The bot downloads and sends images to users

## Architecture Components

### 1. Main Application (Cloudflare Workers)

**Location**: `/src`

The main application handles:
- AI conversation processing
- Image storage in R2
- Public file URL generation
- Webhook response construction

### 2. WhatsApp Bot (Node.js Service)

**Location**: `/whatsapp-bot`

The bot handles:
- Receiving messages from WhatsApp users
- Calling the webhook API
- Downloading images from URLs
- Sending images to users via WhatsApp Web

## Complete Flow

### Step-by-Step Process

```
User → WhatsApp → Bot → Webhook API → AI Processing → Bot → WhatsApp → User
```

1. **User sends message**: "Send me a dog picture"
2. **Bot receives message**: Captures via `whatsapp-web.js`
3. **Bot calls webhook**: `POST /api/whatsapp` with message data
4. **Webhook processes message**:
   - Creates/finds user record
   - Saves incoming message to database
   - Calls AI conversation handler
5. **AI generates response**:
   - Recognizes intent to send image
   - Calls `sendRandomDogImageFunction`
   - Function handler fetches image, stores in R2
   - Returns `{text: "Here's a dog!", fileId: 123}`
6. **Webhook constructs response**:
   - Looks up message by fileId
   - Generates public URL: `https://gozy.dk/api/files/{publicId}`
   - Returns `{success: true, response: "Here's a dog!", mediaUrl: "https://..."}`
7. **Bot receives response**:
   - Checks if `mediaUrl` is present
   - Downloads image from URL using `MessageMedia.fromUrl()`
   - Sends to user via `client.sendMessage(from, media, {caption})`
8. **User receives image** with caption

### Key Design Decisions

#### Why Webhook Returns Data Instead of Sending

The webhook API (`/api/whatsapp`) is **incoming only** - it:
- ✅ Processes messages and generates responses
- ✅ Returns response data to the caller
- ❌ Does NOT send messages to users

The bot is responsible for:
- ✅ Calling the webhook
- ✅ Handling the response
- ✅ Actually sending messages to users

**Rationale**: This separation of concerns allows:
- The webhook to be stateless and testable
- The bot to handle WhatsApp-specific delivery logic
- Better error handling and retry logic in the bot

#### Why Public URLs Instead of Direct File Transfer

Images are served via time-limited public URLs because:

1. **WhatsApp Preview Servers**: WhatsApp's servers download media to generate previews - they don't have authentication
2. **Simplicity**: Bot just needs a URL, no need for authentication tokens
3. **Security**: URLs expire after 1 hour (checked via message `createdAt` timestamp)
4. **Reliability**: R2 provides fast, global CDN access

## Code Structure

### Main Application

#### 1. AI Function Declaration

**File**: `src/lib/conversation/functions.ts`

```typescript
export const sendRandomDogImageFunction = createGeminiFunctionDeclaration({
  name: "send_random_dog_image",
  description: "Sends a random cute dog image to the user.",
  schema: z.object({
    message: z.string().optional()
      .describe("Optional message to accompany the dog image (in Danish)"),
  }),
});
```

#### 2. Function Handler

**File**: `src/lib/conversation/function-handler.ts`

The handler:
1. Fetches image from external API (e.g., Dog CEO API)
2. Downloads the image data
3. Uploads to R2 at `assistant-images/{timestamp}-{filename}`
4. Creates database file record
5. Returns `{success: true, messageToUser: "...", fileId: 123}`

#### 3. Conversation Generator

**File**: `src/lib/conversation/index.ts`

```typescript
export type AssistantResponse = {
  text: string;
  fileId?: number;  // Optional file attachment
};

export async function generateAssistantResponse(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
): Promise<Result<AssistantResponse, string>>
```

When a function returns `fileId`, it's included in the response.

#### 4. Webhook Handler

**File**: `src/lib/whatsapp-webhook-handler.ts`

```typescript
export type WhatsappWebhookResponse = {
  text: string;
  mediaUrl?: string;
};

export async function handleWhatsappWebhook(
  c: Context<{ Bindings: Bindings }>,
  phoneNumber: string,
  messageText: string,
  file?: DatabaseFile,
): Promise<Result<WhatsappWebhookResponse, string>>
```

**Key logic**:
```typescript
// If response has fileId, construct public media URL
if (result.val.fileId) {
  const user = await findUserByPhoneNumber(c, phoneNumber);
  if (user) {
    const lastMessage = await getLastAssistantMessage(c, user.id);
    if (lastMessage && lastMessage.publicId) {
      const baseUrl = new URL(c.req.url).origin;
      response.mediaUrl = `${baseUrl}/api/files/${lastMessage.publicId}`;
    }
  }
}

return Ok(response);  // Does NOT send message, just returns data
```

#### 5. Public File Serving

**File**: `src/routes/api/files.ts`

```typescript
export const filesRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/:publicId", async (c) => {
    const publicId = c.req.param("publicId");
    const message = await getMessageByPublicId(c, publicId);

    // Check 1-hour expiration
    const now = new Date();
    const messageAge = now.getTime() - message.createdAt.getTime();
    const oneHourInMs = 60 * 60 * 1000;

    if (messageAge > oneHourInMs) {
      return c.json({ error: "File access expired" }, 403);
    }

    // Serve file from R2
    const file = await c.env.FILES.get(message.file.storageKey);
    return new Response(file.body, {
      headers: { "Content-Type": message.file.mimeType },
    });
  });
```

### WhatsApp Bot

#### 1. Webhook Client

**File**: `whatsapp-bot/src/lib/webhook.ts`

```typescript
const WebhookResponseSchema = z.object({
  success: z.boolean(),
  response: z.string().optional(),
  mediaUrl: z.string().url().optional(),  // New field
});

export async function sendToWebhook(
  payload: WebhookPayload,
): Promise<{ text: string; mediaUrl?: string } | null>
```

Returns the full response object including `mediaUrl`.

#### 2. Message Handler

**File**: `whatsapp-bot/src/lib/messageHandler.ts`

**Text-only reply**:
```typescript
export async function sendDelayedReply(
  message: Message,
  text: string,
): Promise<void> {
  const delay = calculateReplyDelay(text.length);
  await sleep(delay);
  await message.reply(text);  // Simple text reply
}
```

**Media reply** (new):
```typescript
export async function sendDelayedMediaReply(
  client: WhatsAppClient,
  from: string,
  mediaUrl: string,
  caption: string,
): Promise<void> {
  const delay = calculateReplyDelay(caption.length);
  await sleep(delay);

  // Download from URL and send
  const media = await MessageMedia.fromUrl(mediaUrl);
  await client.sendMessage(from, media, { caption });
}
```

**Main handler logic**:
```typescript
export async function handleMessage(
  client: WhatsAppClient,
  msg: Message,
  text?: string,
): Promise<void> {
  // ... process incoming message, call webhook ...

  const aiResponse = await sendToWebhook({ ... });

  if (aiResponse) {
    if (aiResponse.mediaUrl) {
      // Send with media
      await sendDelayedMediaReply(
        client,
        msg.from,
        aiResponse.mediaUrl,
        aiResponse.text,
      );
    } else {
      // Send text only
      await sendDelayedReply(msg, aiResponse.text);
    }
  }
}
```

## Database Schema

### Messages Table

```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  public_id TEXT UNIQUE NOT NULL,  -- For public URL access
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  file_id INTEGER,  -- Optional file attachment
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id)
);
```

### Files Table

```sql
CREATE TABLE files (
  id INTEGER PRIMARY KEY,
  storage_key TEXT NOT NULL,  -- R2 object key
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  original_filename TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Time-Limited Access

### Security Model

Public file URLs are **time-limited** to balance security and functionality:

- **Expiration**: 1 hour from message creation
- **Check**: Done on every file request
- **Rationale**:
  - WhatsApp preview servers need unauthenticated access
  - Short window limits exposure
  - Long enough for WhatsApp to download and cache

### Implementation

```typescript
// In /api/files/:publicId handler
const now = new Date();
const messageAge = now.getTime() - message.createdAt.getTime();
const oneHourInMs = 60 * 60 * 1000;

if (messageAge > oneHourInMs) {
  return c.json({ error: "File access expired" }, 403);
}
```

**Note**: This checks `message.createdAt`, not `file.createdAt`, because the same file might be reused in multiple messages with different expiration times.

## Example: Adding a New Image Function

To add a new image-sending function:

### 1. Create Function Declaration

```typescript
// src/lib/conversation/functions.ts
export const sendWeatherMapFunction = createGeminiFunctionDeclaration({
  name: "send_weather_map",
  description: "Sends a weather map for a specific location",
  schema: z.object({
    location: z.string().describe("Location name or coordinates"),
    message: z.string().optional(),
  }),
});
```

### 2. Implement Handler

```typescript
// src/lib/conversation/function-handler.ts
else if (functionCall.name === "send_weather_map") {
  const { location, message } = functionCall.args;

  // Fetch weather map from API
  const response = await fetch(
    `https://api.weather.com/maps/${encodeURIComponent(location)}`
  );
  const imageBlob = await response.blob();

  // Upload to R2
  const timestamp = Date.now();
  const storageKey = `assistant-images/${timestamp}-weather-map.png`;
  await c.env.FILES.put(storageKey, imageBlob);

  // Create file record
  const file = await createFile(c, {
    storageKey,
    mimeType: "image/png",
    size: imageBlob.size,
    originalFilename: "weather-map.png",
  });

  return {
    name: functionCall.name,
    response: {
      success: true,
      messageToUser: message || `Her er vejrkortet for ${location}`,
      fileId: file.id,
    },
  };
}
```

### 3. Register Function

```typescript
// src/lib/conversation/index.ts
const tools = [
  updateUserNameFunction,
  // ... other functions ...
  sendRandomDogImageFunction,
  sendWeatherMapFunction,  // Add here
];
```

### 4. Test Flow

The rest happens automatically:
- ✅ Gemini recognizes when to call the function
- ✅ Function handler stores image and returns fileId
- ✅ Conversation handler includes fileId in response
- ✅ Webhook handler constructs mediaUrl
- ✅ Bot downloads and sends to user

## Testing

### Unit Tests

**Main app tests**: `src/routes/api/whatsapp.test.ts`
```typescript
it("should handle file responses with mediaUrl", async () => {
  vi.mocked(handleWhatsappWebhook).mockResolvedValue(
    Ok({
      text: "Here's an image!",
      mediaUrl: "https://example.com/image.jpg",
    })
  );

  // ... test that response includes mediaUrl
});
```

**Bot tests**: `whatsapp-bot/src/lib/messageHandler.test.ts`
```typescript
it("should handle media URL in response", async () => {
  vi.mocked(webhook.sendToWebhook).mockResolvedValue({
    text: "Here's a cute dog!",
    mediaUrl: "https://example.com/dog.jpg",
  });

  await handleMessage(mockClient, mockMessage);

  expect(mockClient.sendMessage).toHaveBeenCalledWith(
    "4540360565@c.us",
    { data: "mock-media" },
    { caption: "Here's a cute dog!" }
  );
  expect(mockMessage.reply).not.toHaveBeenCalled();
});
```

### Integration Testing

Use the development mock interface:

1. Navigate to `/dev/whatsapp-mock`
2. Enter phone number and message: "send me a dog picture"
3. Submit form
4. Verify response includes clickable image link
5. Check `/dev/whatsapp-messages` for logged outbound message with mediaUrl

## Common Issues & Debugging

### Issue: Image not appearing in WhatsApp

**Symptoms**: User gets text response but no image

**Debug steps**:
1. Check bot logs for "Media URL: https://..." - confirms webhook returned mediaUrl
2. Check for "Waiting Xms before replying with media..." - confirms bot recognized mediaUrl
3. Check for errors downloading from URL
4. Test URL manually in browser - should download image file
5. Verify URL is not expired (< 1 hour old)

**Common causes**:
- URL expired (> 1 hour old)
- Network issue downloading from URL
- Invalid image format
- R2 file missing or corrupted

### Issue: Duplicate messages

**Symptoms**: User receives same message twice

**Likely cause**: Webhook is calling `sendWhatsappMessage` directly

**Fix**: Webhook should ONLY return data, never send messages. The bot handles sending.

### Issue: URL expired immediately

**Symptoms**: File URL returns 403 even though just created

**Debug steps**:
1. Check `message.createdAt` timestamp in database
2. Verify server time is correct
3. Check timezone handling

## Related Documentation

- [Multi-Agent Architecture](./multi-agent-architecture.md) - How AI decides when to send images
- [HForm Guide](./hform-guide.md) - Form handling in dev interfaces

## Future Improvements

Potential enhancements:

1. **Longer expiration for premium users**: Allow configurable expiration times
2. **Signed URLs**: Use HMAC signatures instead of time-based expiration
3. **Image optimization**: Resize/compress images before sending
4. **Caching**: Cache downloaded images in bot to avoid re-downloading
5. **Multiple images**: Support sending multiple images in one message
6. **Video support**: Extend to support video files
7. **Progress indicators**: Show "uploading..." status to user
