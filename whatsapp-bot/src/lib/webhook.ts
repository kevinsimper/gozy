const API_URL = process.env.API_URL || "http://localhost:8787";
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || "";

type WebhookPayload = {
  from: string;
  text?: string;
  mediaData?: string;
  mediaMimeType?: string;
  messageId: string;
  timestamp: number;
};

type WebhookResponse = {
  success: boolean;
  response?: string;
};

export async function sendToWebhook(
  payload: WebhookPayload,
): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Webhook API error (${response.status}):`, error);
      return null;
    }

    const result: WebhookResponse = await response.json();
    console.log("Webhook API response:", result);
    return result.response || null;
  } catch (error) {
    console.error("Failed to send to webhook:", error);
    return null;
  }
}
