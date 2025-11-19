import { Hono } from "hono";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";
import type pkg from "whatsapp-web.js";
import { sendMessage } from "./lib/messageSender.js";
import {
  sendMediaMessage,
  sendMessageWithMediaUrl,
} from "./lib/mediaMessageSender.js";

const WHATSAPP_BOT_TOKEN = process.env.WHATSAPP_BOT_TOKEN || "";

type WhatsAppClient = InstanceType<typeof pkg.Client>;

const SendMessageSchema = z.object({
  phoneNumber: z.string().min(1),
  message: z.string().min(1),
  mediaUrl: z.string().url().optional(),
  caption: z.string().optional(),
});

const SendMediaSchema = z.object({
  phoneNumber: z.string().min(1),
  caption: z.string().optional(),
});

export function createApp(client: WhatsAppClient) {
  const app = new Hono();

  // CORS middleware
  app.use("/*", cors());

  // Root endpoint
  app.get("/", (c) => {
    return c.json({
      service: "WhatsApp Bot API",
      status: "running",
    });
  });

  // Health check endpoint
  app.get("/health", (c) => {
    const isConnected = client.info !== undefined;
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      whatsappConnected: isConnected,
    });
  });

  // Bearer token auth middleware for API routes
  app.use("/api/*", bearerAuth({ token: WHATSAPP_BOT_TOKEN }));

  // Text message endpoint
  app.post("/api/send-message", async (c) => {
    try {
      const body = await c.req.json();
      const result = SendMessageSchema.safeParse(body);

      if (!result.success) {
        return c.json(
          { error: "Invalid request", details: result.error.issues },
          400,
        );
      }

      const { phoneNumber, message, mediaUrl, caption } = result.data;

      // If mediaUrl is provided, send as media message
      if (mediaUrl) {
        await sendMessageWithMediaUrl(
          client,
          phoneNumber,
          mediaUrl,
          caption || message,
        );
      } else {
        // Otherwise, send as text message
        await sendMessage(client, phoneNumber, message);
      }

      return c.json({ success: true });
    } catch (error) {
      console.error("Error sending message:", error);
      return c.json(
        {
          error: "Failed to send message",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  });

  // Media message endpoint
  app.post("/api/send-media", async (c) => {
    try {
      const body = await c.req.parseBody();

      // Validate fields
      const fieldsResult = SendMediaSchema.safeParse({
        phoneNumber: body.phoneNumber,
        caption: body.caption,
      });

      if (!fieldsResult.success) {
        return c.json(
          { error: "Invalid request", details: fieldsResult.error.issues },
          400,
        );
      }

      const { phoneNumber, caption } = fieldsResult.data;
      const file = body.file;

      if (!file || typeof file === "string") {
        return c.json(
          { error: "No file provided or invalid file format" },
          400,
        );
      }

      await sendMediaMessage(client, phoneNumber, file, caption);

      return c.json({ success: true });
    } catch (error) {
      console.error("Error sending media:", error);
      return c.json(
        {
          error: "Failed to send media",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500,
      );
    }
  });

  return app;
}
