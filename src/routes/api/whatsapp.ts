import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";
import { generateResponse, googleModels } from "../../services/gemini/client";

type Bindings = {
  DB: D1Database;
  WHATSAPP_WEBHOOK_TOKEN: string;
  GEMINI_API_KEY: string;
};

const whatsappWebhookSchema = z.object({
  from: z.string(),
  text: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  messageId: z.string(),
  timestamp: z.number(),
});

type WhatsappWebhookPayload = z.infer<typeof whatsappWebhookSchema>;

export const whatsappWebhookRoutes = new Hono<{ Bindings: Bindings }>().post(
  "/whatsapp",
  async (c, next) => {
    const token = c.env.WHATSAPP_WEBHOOK_TOKEN;
    const bearer = bearerAuth({ token });
    return bearer(c, next);
  },
  async (c) => {
    try {
      const body = await c.req.json();
      const parsed = whatsappWebhookSchema.safeParse(body);

      if (!parsed.success) {
        return c.json(
          {
            error: "Invalid payload",
            details: parsed.error.format(),
          },
          400,
        );
      }

      const message: WhatsappWebhookPayload = parsed.data;

      console.log(
        `Received message from ${message.from}: ${message.text || "[media]"}`,
      );

      if (!message.text) {
        return c.json({
          success: true,
          response: "I can only respond to text messages for now.",
        });
      }

      const geminiResponse = await generateResponse(
        c,
        message.text,
        "Du er en hjælpsom assistant til taxachauffører i København. Svar ALTID kort og præcist i 1-2 sætninger. Svar kun med tekst, ikke markdown!",
      );

      return c.json({
        success: true,
        response: geminiResponse,
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return c.json(
        {
          error: "Internal server error",
        },
        500,
      );
    }
  },
);
