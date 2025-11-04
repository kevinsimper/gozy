import pkg from "whatsapp-web.js";
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from "qrcode-terminal";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { sendToWebhook } from "./lib/webhook.js";

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
      "Reminder: Your document expires soon!"
    );
    console.log("Sent scheduled message");
  }, 5000);
});

client.on("message_create", async (msg) => {
  console.log(`Message from ${msg.from} #${msg.id}: ${msg.body}`);

  // Send to webhook API
  await sendToWebhook({
    from: msg.from,
    text: msg.body || undefined,
    messageId: msg.id._serialized,
    timestamp: msg.timestamp,
  });

  if (msg.hasMedia) {
    console.log("Message has media, downloading...");
    const media = await msg.downloadMedia();

    if (media) {
      console.log("Media downloaded successfully:");
      console.log(`- Mimetype: ${media.mimetype}`);
      console.log(`- Filename: ${media.filename || "No filename"}`);
      console.log(`- Size: ${media.data.length} bytes (base64)`);

      const extension = media.mimetype.split("/")[1].split(";")[0];
      const timestamp = Date.now();
      const filename = media.filename || `media_${timestamp}.${extension}`;
      const filepath = path.join("downloads", filename);

      fs.writeFileSync(filepath, media.data, "base64");
      console.log(`- Saved to: ${filepath}`);

      await msg.reply(`Received your ${media.mimetype} file!`);
    } else {
      console.log(
        "Failed to download media - file may be deleted or unavailable"
      );
      await msg.reply("Sorry, I couldn't download that file.");
    }
  }

  if (msg.body === "!ping") {
    await msg.reply("pong");
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
        "Error: Could not send local file. Make sure ./assets/demo.png exists."
      );
    }
  }

  if (msg.body === "!send-url") {
    try {
      await msg.reply("Downloading image from URL...");
      const media = await MessageMedia.fromUrl(
        "https://via.assets.so/img.jpg?w=400&h=300&bg=e5e7eb&f=png"
      );
      await client.sendMessage(msg.from, media, {
        caption: "Here's an image downloaded from URL",
      });
    } catch (error) {
      console.error("Error sending file from URL:", error);
      await msg.reply("Error: Could not download or send file from URL.");
    }
  }
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected:", reason);
});

client.on("auth_failure", (message) => {
  console.error("Authentication failure:", message);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down gracefully...");
  await client.destroy();
  console.log("Client destroyed, exiting...");
  process.exit(0);
});

console.log("Starting WhatsApp bot...");
client.initialize();
