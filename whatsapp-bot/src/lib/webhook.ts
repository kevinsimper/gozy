const API_URL = process.env.API_URL || "http://localhost:8787";
const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN || "";

type WebhookPayload = {
  from: string;
  text?: string;
  mediaUrl?: string;
  messageId: string;
  timestamp: number;
};

export async function sendToWebhook(payload: WebhookPayload): Promise<void> {
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
      return;
    }

    const result = await response.json();
    console.log("Webhook API response:", result);
  } catch (error) {
    console.error("Failed to send to webhook:", error);
  }
}
