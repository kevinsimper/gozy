import "dotenv/config";
import http from "http";
import qrcode from "qrcode-terminal";
import pkg from "whatsapp-web.js";
import { sendMessage } from "./lib/messageSender.js";
import { handleAskCommand, handleMessage } from "./lib/messageHandler.js";
const { Client, LocalAuth, MessageMedia } = pkg;

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

  // Schedule a message in 5 seconds
  setTimeout(async () => {
    await client.sendMessage(
      "4540360565@c.us",
      "Reminder: Your document expires soon!",
    );
    console.log("Sent scheduled message");
  }, 5000);
});

client.on("message_create", async (msg) => {
  console.log(`Message from ${msg.from} #${msg.id._serialized}: ${msg.body}`);

  // Handle !ask commands
  if (msg.body.startsWith("!ask ")) {
    await handleAskCommand(msg);
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

  // Handle all other messages (including media)
  await handleMessage(msg);
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected:", reason);
});

client.on("auth_failure", (message) => {
  console.error("Authentication failure:", message);
});

// Create HTTP server for API
const PORT = process.env.PORT || 3000;
const WHATSAPP_BOT_TOKEN = process.env.WHATSAPP_BOT_TOKEN || "";

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/send-message") {
    // Check bearer token
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (!token || token !== WHATSAPP_BOT_TOKEN) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    // Parse JSON body
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const { phoneNumber, message } = data;

        if (!phoneNumber || !message) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Missing required fields: phoneNumber, message",
            }),
          );
          return;
        }

        await sendMessage(client, phoneNumber, message);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        console.error("Error sending message:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "Failed to send message",
            details: error instanceof Error ? error.message : "Unknown error",
          }),
        );
      }
    });

    return;
  }

  // Handle 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

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
