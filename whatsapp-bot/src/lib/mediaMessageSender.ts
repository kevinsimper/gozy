import pkg from "whatsapp-web.js";
import { toWhatsAppId } from "./phoneNumber.js";
const { MessageMedia } = pkg;

type WhatsAppClient = InstanceType<typeof pkg.Client>;

export async function sendMediaMessage(
  client: WhatsAppClient,
  phoneNumber: string,
  file: File,
  caption?: string,
): Promise<void> {
  const whatsappId = toWhatsAppId(phoneNumber);

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Convert to base64
  const base64Data = buffer.toString("base64");

  // Create MessageMedia instance
  const media = new MessageMedia(file.type, base64Data, file.name);

  // Send with optional caption
  const options = caption ? { caption } : undefined;
  await client.sendMessage(whatsappId, media, options);
}
