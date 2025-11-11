import { z } from "zod";

const API_URL = process.env.API_URL || "http://localhost:8787";
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || "";

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

    const response = await fetch(`${API_URL}/api/whatsapp`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WEBHOOK_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Webhook API error (${response.status}):`, error);
      return null;
    }

    const json = await response.json();
    const result = WebhookResponseSchema.parse(json);
    console.log("Webhook API response:", result);
    return result.response || null;
  } catch (error) {
    console.error("Failed to send to webhook:", error);
    return null;
  }
}
