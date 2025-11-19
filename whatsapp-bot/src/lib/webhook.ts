import { z } from "zod";

const API_URL = process.env.API_URL || "http://localhost:8787";
const GOZY_API_KEY = process.env.GOZY_API_KEY;

if (!GOZY_API_KEY) {
  throw new Error(
    "GOZY_API_KEY environment variable is required for webhook authentication",
  );
}

type WebhookPayload = {
  from: string;
  text?: string;
  media?: {
    data: string;
    mimeType: string;
  };
  messageId: string;
  timestamp: number;
};

const WebhookResponseSchema = z.object({
  success: z.boolean(),
  response: z.string().optional(),
});

type WebhookResponse = z.infer<typeof WebhookResponseSchema>;

export async function sendToWebhook(
  payload: WebhookPayload,
): Promise<string | null> {
  try {
    console.log(`[API] Sending to webhook: ${API_URL}/api/whatsapp`);
    console.log(`[API] From: ${payload.from}, MessageId: ${payload.messageId}`);
    if (payload.text) {
      console.log(
        `[API] Text message: ${payload.text.substring(0, 100)}${payload.text.length > 100 ? "..." : ""}`,
      );
    }
    if (payload.media) {
      console.log(
        `[API] Media message: ${payload.media.mimeType}, size: ${payload.media.data.length} bytes`,
      );
    }

    const formData = new FormData();

    formData.append("from", payload.from);
    if (payload.text) {
      formData.append("text", payload.text);
    }
    formData.append("messageId", payload.messageId);
    formData.append("timestamp", payload.timestamp.toString());

    if (payload.media) {
      // Convert base64 to Buffer
      const buffer = Buffer.from(payload.media.data, "base64");
      const blob = new Blob([buffer], { type: payload.media.mimeType });

      // Create File object from Blob
      const file = new File([blob], "media", { type: payload.media.mimeType });
      formData.append("media", file);
    }

    const startTime = Date.now();
    const response = await fetch(`${API_URL}/api/whatsapp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOZY_API_KEY}`,
      },
      body: formData,
    });
    const duration = Date.now() - startTime;

    console.log(`[API] Response status: ${response.status} (${duration}ms)`);

    if (!response.ok) {
      const error = await response.text();
      console.error(
        `[API] Webhook API error (${response.status}):`,
        error.substring(0, 200),
      );
      return null;
    }

    const json = await response.json();
    const result = WebhookResponseSchema.parse(json);
    console.log(`[API] Response success:`, result.success);
    if (result.response) {
      console.log(
        `[API] Response text: ${result.response.substring(0, 100)}${result.response.length > 100 ? "..." : ""}`,
      );
    }
    return result.response || null;
  } catch (error) {
    console.error("[API] Failed to send to webhook:", error);
    return null;
  }
}
