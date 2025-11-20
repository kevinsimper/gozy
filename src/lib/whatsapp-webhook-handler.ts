import { type Context } from "hono";
import { Ok, Err, Result } from "@casperlabs/ts-results/esm/index";
import { Bindings } from "../index";
import { DatabaseFile } from "../models/file";
import { handleTextMessage } from "./conversation";
import { findUserByPhoneNumber } from "../models/user";
import { getLastAssistantMessage } from "../models/message";
import { createWhatsappMessage } from "../models/whatsapp-message";

export type WhatsappWebhookResponse = {
  text: string;
  mediaUrl?: string;
};

export async function handleWhatsappWebhook(
  c: Context<{ Bindings: Bindings }>,
  phoneNumber: string,
  messageText: string,
  file?: DatabaseFile,
): Promise<Result<WhatsappWebhookResponse, string>> {
  // Process the message and generate assistant response
  const result = await handleTextMessage(c, phoneNumber, messageText, file);

  if (!result.ok) {
    return Err(result.val);
  }

  const response: WhatsappWebhookResponse = {
    text: result.val.text,
  };

  // If the response includes a fileId, construct the public media URL
  let mediaUrl: string | undefined;
  if (result.val.fileId) {
    const user = await findUserByPhoneNumber(c, phoneNumber);
    if (user) {
      const lastMessage = await getLastAssistantMessage(c, user.id);
      if (lastMessage && lastMessage.publicId) {
        const baseUrl = new URL(c.req.url).origin;
        mediaUrl = `${baseUrl}/api/files/${lastMessage.publicId}`;
        response.mediaUrl = mediaUrl;
      }
    }
  }

  // Log to whatsapp_messages table (simulates what the bot would do after sending)
  const user = await findUserByPhoneNumber(c, phoneNumber);
  if (user) {
    await createWhatsappMessage(
      c,
      phoneNumber,
      result.val.text,
      "sent",
      user.id,
      mediaUrl,
    );
  }

  return Ok(response);
}
