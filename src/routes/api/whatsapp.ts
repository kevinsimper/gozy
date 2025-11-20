import { Hono } from "hono";
import { z } from "zod";
import { Bindings } from "../../index";
import { uploadAndCreateFile } from "../../lib/fileUpload";
import { DatabaseFile } from "../../models/file";
import { handleWhatsappWebhook } from "../../lib/whatsapp-webhook-handler";

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
  "/",
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
    const result = await handleWhatsappWebhook(
      c,
      phoneNumber,
      messageText,
      file,
    );

    if (result.ok) {
      return c.json({
        success: true,
        response: result.val.text,
        mediaUrl: result.val.mediaUrl,
      });
    } else {
      return c.json({ error: result.val }, 500);
    }
  },
);
