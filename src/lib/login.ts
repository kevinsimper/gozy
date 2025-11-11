import { sendWhatsAppMessage } from "./whatsapp";

export async function sendLoginPin(
  botUrl: string,
  botToken: string,
  phoneNumber: string,
  pin: string,
): Promise<void> {
  const message = `Din Gozy login kode er: ${pin}\n\nKoden udløber om 10 minutter.`;

  const result = await sendWhatsAppMessage(
    botUrl,
    botToken,
    phoneNumber,
    message,
  );

  if (!result.success) {
    throw new Error(result.error || "Failed to send login PIN");
  }

  console.log(`Successfully sent PIN to ${phoneNumber}`);
}
