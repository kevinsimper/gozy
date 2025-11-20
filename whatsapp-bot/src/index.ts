import "dotenv/config";
import { serve } from "@hono/node-server";
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import { handleAskCommand, handleMessage } from "./lib/messageHandler.js";
import { createApp } from "./server.js";
const { Client, LocalAuth, MessageMedia } = pkg;

const DEV_MODE = process.env.DEV === "true";

if (DEV_MODE) {
  console.log("Running in DEV mode - !ask prefix required");
} else {
  console.log("Running in PROD mode - all messages forwarded to webhook");
}

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: ".wwebjs_auth",
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("loading_screen", (screen, stage) => {
  console.log(screen, stage);
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("Scan the QR code above with WhatsApp");
});

client.on("authenticated", () => {
  console.log("Authentication successful!");
});

client.on("ready", () => {
  console.log("Bot is ready and connected!");
});

client.on("message_create", async (msg) => {
  // Skip messages sent by the bot itself to prevent infinite loops
  if (msg.fromMe) {
    return;
  }

  console.log(
    `Message from ${msg.from} #${msg.id._serialized} ${msg.timestamp}: ${msg.body}`,
  );

  // Handle !ask commands
  if (msg.body.startsWith("!ask ")) {
    await handleAskCommand(client, msg);
    return;
  }

  // Handle special commands
  if (msg.body === "!ping") {
    await msg.reply("pong");
    return;
  }

  if (msg.body === "!send-local") {
    try {
      const media = MessageMedia.fromFilePath("./assets/demo.png");
      await client.sendMessage(msg.from, media, {
        caption: "Here's a local file demo",
      });
    } catch (error) {
      console.error("Error sending local file:", error);
      await msg.reply(
        "Error: Could not send local file. Make sure ./assets/demo.png exists.",
      );
    }
    return;
  }

  if (msg.body === "!send-url") {
    try {
      await msg.reply("Downloading image from URL...");
      const media = await MessageMedia.fromUrl(
        "https://via.assets.so/img.jpg?w=400&h=300&bg=e5e7eb&f=png",
      );
      await client.sendMessage(msg.from, media, {
        caption: "Here's an image downloaded from URL",
      });
    } catch (error) {
      console.error("Error sending file from URL:", error);
      await msg.reply("Error: Could not download or send file from URL.");
    }
    return;
  }

  // In PROD mode, forward all non-command messages to webhook
  if (!DEV_MODE) {
    await handleMessage(client, msg);
  }
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected:", reason);
});

client.on("auth_failure", (message) => {
  console.error("Authentication failure:", message);
});

// Create Hono server for API
const PORT = Number(process.env.PORT) || 3000;
const app = createApp(client);

const server = serve({
  fetch: app.fetch,
  port: PORT,
});

console.log(`HTTP server listening on port ${PORT}`);

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed");
  });
  await client.destroy();
  console.log("Client destroyed, exiting...");
  process.exit(0);
});

console.log("Starting WhatsApp bot...");
client.initialize();
