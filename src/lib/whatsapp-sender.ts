import type { Context } from "hono";
import { sendWhatsAppMessage as sendWhatsAppMessageService } from "./whatsapp";
import { createWhatsappMessage } from "../models/whatsapp-message";

type WhatsappContext = {
  Bindings: {
    DB: D1Database;
    WHATSAPP_BOT_URL: string;
    WHATSAPP_BOT_TOKEN: string;
    WHATSAPP_ENABLED?: string;
  };
};

export async function sendWhatsappMessage<Env extends WhatsappContext>(
  c: Context<Env>,
  phoneNumber: string,
  message: string,
  userId?: number,
): Promise<{ success: boolean; error?: string }> {
  const isDisabled = c.env.WHATSAPP_ENABLED === "false";

  let result: { success: boolean; error?: string };

  if (isDisabled) {
    console.log(
      `[WhatsApp disabled] Would send to ${phoneNumber}: ${message.substring(0, 50)}...`,
    );
    result = { success: true };
  } else {
    result = await sendWhatsAppMessageService(
      c.env.WHATSAPP_BOT_URL,
      c.env.WHATSAPP_BOT_TOKEN,
      phoneNumber,
      message,
    );
  }

  const status = result.success ? "sent" : "failed";

  try {
    await createWhatsappMessage(c, phoneNumber, message, status, userId);
  } catch (error) {
    console.error("Failed to log WhatsApp message to database:", error);
  }

  return result;
}
