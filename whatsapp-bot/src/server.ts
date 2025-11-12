import { Hono } from "hono";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
import { z } from "zod";
import type pkg from "whatsapp-web.js";

const WHATSAPP_BOT_TOKEN = process.env.WHATSAPP_BOT_TOKEN || "";

type WhatsAppClient = InstanceType<typeof pkg.Client>;

const SendMessageSchema = z.object({
  phoneNumber: z.string().min(1),
  message: z.string().min(1),
});

const SendMediaSchema = z.object({
  phoneNumber: z.string().min(1),
  caption: z.string().optional(),
});

export function createApp(client: WhatsAppClient) {
  const app = new Hono();

  // CORS middleware
  app.use("/*", cors());

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

      const { phoneNumber, message } = result.data;

      // Import sendMessage function
      const { sendMessage } = await import("./lib/messageSender.js");
      await sendMessage(client, phoneNumber, message);

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

      // Import sendMediaMessage function
      const { sendMediaMessage } = await import("./lib/mediaMessageSender.js");
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
