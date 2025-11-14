import { sendWhatsappMessage } from "./whatsapp-sender";
import type { Context } from "hono";

type LoginContext = {
  Bindings: {
    DB: D1Database;
    WHATSAPP_BOT_URL: string;
    WHATSAPP_BOT_TOKEN: string;
    WHATSAPP_DISABLED?: string;
  };
};

export async function sendLoginPin<Env extends LoginContext>(
  c: Context<Env>,
  phoneNumber: string,
  pin: string,
  userId?: number,
): Promise<void> {
  const message = `Din Gozy login kode er: ${pin}\n\nKoden udløber om 10 minutter.`;

  const result = await sendWhatsappMessage(c, phoneNumber, message, userId);

  if (!result.success) {
    throw new Error(result.error || "Failed to send login PIN");
  }

  console.log(`Successfully sent PIN to ${phoneNumber}`);
}
