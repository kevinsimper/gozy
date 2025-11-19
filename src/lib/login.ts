import { sendWhatsappMessage } from "./whatsapp-sender";
import type { Context } from "hono";
import type { Bindings } from "../index";

export async function sendLoginPin(
  c: Context<{ Bindings: Bindings }>,
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
