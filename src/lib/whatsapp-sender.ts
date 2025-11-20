import { sendWhatsAppMessage as sendWhatsAppMessageService } from "./whatsapp";
import { createWhatsappMessage } from "../models/whatsapp-message";
import type { Bindings } from "../index";

export async function sendWhatsappMessage(
  c: { env: Bindings },
  phoneNumber: string,
  message: string,
  userId?: number,
  mediaUrl?: string,
): Promise<{ success: boolean; error?: string }> {
  const isDisabled = c.env.WHATSAPP_ENABLED === "false";

  let result: { success: boolean; error?: string };

  if (isDisabled) {
    console.log(
      `[WhatsApp disabled] Would send to ${phoneNumber}: ${message.substring(0, 50)}...${mediaUrl ? ` with media: ${mediaUrl}` : ""}`,
    );
    result = { success: true };
  } else {
    result = await sendWhatsAppMessageService(
      c.env.WHATSAPP_BOT_URL,
      c.env.WHATSAPP_BOT_TOKEN,
      phoneNumber,
      message,
      mediaUrl,
    );
  }

  const status = result.success ? "sent" : "failed";

  try {
    await createWhatsappMessage(
      c,
      phoneNumber,
      message,
      status,
      userId,
      mediaUrl,
    );
  } catch (error) {
    console.error("Failed to log WhatsApp message to database:", error);
  }

  return result;
}
