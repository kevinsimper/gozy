import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode-terminal";

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: ".wwebjs_auth",
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
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
  console.log(`Message from ${msg.from}: ${msg.body}`);

  if (msg.body === "!ping") {
    await msg.reply("pong");
  }
});

client.on("disconnected", (reason) => {
  console.log("Client was disconnected:", reason);
});

client.on("auth_failure", (message) => {
  console.error("Authentication failure:", message);
});

console.log("Starting WhatsApp bot...");
client.initialize();
