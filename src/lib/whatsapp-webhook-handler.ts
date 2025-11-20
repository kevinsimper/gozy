import { type Context } from "hono";
import { Ok, Err, Result } from "@casperlabs/ts-results/esm/index";
import { Bindings } from "../index";
import { DatabaseFile } from "../models/file";
import { handleTextMessage } from "./conversation";
import { findUserByPhoneNumber } from "../models/user";
import { getLastAssistantMessage } from "../models/message";
import { createWhatsappMessage } from "../models/whatsapp-message";
import { AppLink, lk } from "./links";

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
  let user = await findUserByPhoneNumber(c, phoneNumber);
  if (result.val.fileId && user) {
    const lastMessage = await getLastAssistantMessage(c, user.id);
    if (lastMessage && lastMessage.publicId) {
      const baseUrl = new URL(c.req.url).origin;
      response.mediaUrl = `${baseUrl}${lk(AppLink.ApiFiles, { publicId: lastMessage.publicId })}`;
    }
  }

  // Log the outgoing WhatsApp message
  if (user) {
    try {
      await createWhatsappMessage(
        c,
        phoneNumber,
        response.text,
        "sent",
        user.id,
        response.mediaUrl,
      );
    } catch (error) {
      console.error("Failed to log outgoing WhatsApp message:", error);
    }
  }

  return Ok(response);
}
