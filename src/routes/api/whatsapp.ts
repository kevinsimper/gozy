import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";
import { handleTextMessage } from "../../lib/conversation";
import { Bindings } from "../../index";
import { uploadAndCreateFile } from "../../lib/fileUpload";
import { DatabaseFile } from "../../models/file";

const whatsappWebhookSchema = z.object({
  from: z.string(),
  text: z.string().optional(),
  media: z.instanceof(File).optional(),
  messageId: z.string(),
  timestamp: z.string().transform((val) => parseInt(val, 10)),
});

type WhatsappWebhookPayload = z.infer<typeof whatsappWebhookSchema>;

function extractPhoneNumber(whatsappId: string): string {
  const phoneNumber = whatsappId.replace(/@c\.us$/, "");
  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}

export const whatsappWebhookRoutes = new Hono<{ Bindings: Bindings }>().post(
  "/whatsapp",
  async (c, next) => {
    const token = c.env.WHATSAPP_WEBHOOK_TOKEN;
    const bearer = bearerAuth({ token });
    return bearer(c, next);
  },
  async (c) => {
    const body = await c.req.parseBody();
    const parsed = whatsappWebhookSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        { error: "Invalid payload", details: parsed.error.format() },
        400,
      );
    }

    const message = parsed.data;
    const phoneNumber = extractPhoneNumber(message.from);

    let file: DatabaseFile | undefined;

    if (message.media && message.media.size > 0) {
      try {
        file = await uploadAndCreateFile(c, message.media);
      } catch (error) {
        console.error("Error processing media:", error);
        return c.json({ error: "Failed to process media" }, 500);
      }
    }

    const messageText = message.text || "";
    const result = await handleTextMessage(c, phoneNumber, messageText, file);

    if (result.ok) {
      return c.json({ success: true, response: result.val });
    } else {
      return c.json({ error: result.err }, 500);
    }
  },
);
