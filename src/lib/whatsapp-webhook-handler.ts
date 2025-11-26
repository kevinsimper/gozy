import { type Context } from "hono";
import { Ok, Err, Result } from "@casperlabs/ts-results/esm/index";
import { Bindings } from "../index";
import { DatabaseFile } from "../models/file";
import { saveIncomingMessage, generateAssistantResponse } from "./conversation";
import { findUserByPhoneNumber } from "../models/user";
import { getLastAssistantMessage } from "../models/message";
import { createWhatsappMessage } from "../models/whatsapp-message";
import { AppLink, lk } from "./links";

export type WhatsappWebhookResponse = {
  text: string;
  mediaUrl?: string;
  skipAutoReply?: boolean;
};

export async function handleWhatsappWebhook(
  c: Context<{ Bindings: Bindings }>,
  phoneNumber: string,
  messageText: string,
  file?: DatabaseFile,
): Promise<Result<WhatsappWebhookResponse, string>> {
  // Save incoming message and get/create user
  const userResult = await saveIncomingMessage(
    c,
    phoneNumber,
    messageText,
    file,
  );

  if (!userResult.ok) {
    return Err(userResult.val);
  }

  const user = userResult.val;

  // Generate assistant response (handles manual mode check internally)
  const result = await generateAssistantResponse(c, user.id);

  if (!result.ok) {
    return Err(result.val);
  }

  // Handle skipped response (manual mode)
  if (result.val.type === "skipped") {
    return Ok({
      text: "",
      skipAutoReply: true,
    });
  }

  // result.val.type === "success" - TypeScript narrows the type
  const response: WhatsappWebhookResponse = {
    text: result.val.text,
  };

  // If the response includes a fileId, construct the public media URL
  if (result.val.fileId) {
    const lastMessage = await getLastAssistantMessage(c, user.id);
    if (lastMessage && lastMessage.publicId) {
      const baseUrl = new URL(c.req.url).origin;
      response.mediaUrl = `${baseUrl}${lk(AppLink.ApiFiles, { publicId: lastMessage.publicId })}`;
    }
  }

  // Log the outgoing WhatsApp message
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

  return Ok(response);
}
