import { toWhatsAppId } from "./phoneNumber.js";

type WhatsAppClient = {
  sendMessage: (whatsappId: string, message: string) => Promise<unknown>;
};

export async function sendMessage(
  client: WhatsAppClient,
  phoneNumber: string,
  message: string,
): Promise<void> {
  const whatsappId = toWhatsAppId(phoneNumber);
  await client.sendMessage(whatsappId, message);
}
