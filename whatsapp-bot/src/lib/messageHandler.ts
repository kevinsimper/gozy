import { calculateReplyDelay, sleep } from "./delay.js";
import { sendToWebhook } from "./webhook.js";
import pkg from "whatsapp-web.js";
const { MessageMedia } = pkg;

type Media = {
  mimetype: string;
  filename?: string | null;
  data: string;
};

type WhatsAppClient = InstanceType<typeof pkg.Client>;

type Message = {
  from: string;
  body: string;
  id: { _serialized: string };
  timestamp: number;
  hasMedia: boolean;
  reply: (text: string) => Promise<unknown>;
  downloadMedia: () => Promise<Media | undefined>;
};

export async function sendDelayedReply(
  message: Message,
  text: string,
): Promise<void> {
  const delay = calculateReplyDelay(text.length);
  console.log(`Waiting ${Math.round(delay)}ms before replying...`);
  await sleep(delay);
  await message.reply(text);
}

export async function sendDelayedMediaReply(
  client: WhatsAppClient,
  from: string,
  mediaUrl: string,
  caption: string,
): Promise<void> {
  const delay = calculateReplyDelay(caption.length);
  console.log(`Waiting ${Math.round(delay)}ms before replying with media...`);
  await sleep(delay);
  const media = await MessageMedia.fromUrl(mediaUrl, { unsafeMime: true });
  await client.sendMessage(from, media, { caption });
}

export async function handleMessage(
  client: WhatsAppClient,
  msg: Message,
  text?: string,
): Promise<void> {
  let media: { data: string; mimeType: string } | undefined;

  if (msg.hasMedia) {
    console.log("Message has media, downloading...");
    const downloadedMedia = await msg.downloadMedia();

    if (!downloadedMedia) {
      console.log(
        "Failed to download media - file may be deleted or unavailable",
      );
      await msg.reply("Sorry, I couldn't download that file.");
      return;
    }

    console.log("Media downloaded successfully:");
    console.log(`- Mimetype: ${downloadedMedia.mimetype}`);
    console.log(`- Filename: ${downloadedMedia.filename || "No filename"}`);
    console.log(`- Size: ${downloadedMedia.data.length} bytes (base64)`);

    media = {
      data: downloadedMedia.data,
      mimeType: downloadedMedia.mimetype,
    };
  }

  const aiResponse = await sendToWebhook({
    from: msg.from,
    text: text || msg.body || undefined,
    media,
    messageId: msg.id._serialized,
    timestamp: msg.timestamp,
  });

  if (aiResponse) {
    if (aiResponse.mediaUrl) {
      await sendDelayedMediaReply(
        client,
        msg.from,
        aiResponse.mediaUrl,
        aiResponse.text,
      );
    } else {
      await sendDelayedReply(msg, aiResponse.text);
    }
  }
}

export async function handleAskCommand(
  client: WhatsAppClient,
  msg: Message,
): Promise<void> {
  const question = msg.body.slice(5).trim();

  if (!question) {
    await msg.reply("Please provide a question after !ask");
    return;
  }

  await handleMessage(client, msg, question);
}
