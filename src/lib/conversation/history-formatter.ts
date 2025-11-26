import { type Context } from "hono";
import { type Content } from "@google/genai";
import { Bindings } from "../..";
import { getMessagesWithFiles } from "../../models/message";

export async function formatConversationHistory(
  c: Context<{ Bindings: Bindings }>,
  userId: number,
  limit: number,
): Promise<Content[]> {
  const recentMessages = await getMessagesWithFiles(c, userId, limit);

  // Filter out messages that would confuse the AI:
  // - sentDuringManualMode: messages exchanged during manual mode
  // - sentByAdminId: admin-sent messages (AI would think it wrote them)
  const filteredMessages = recentMessages.filter(
    (msg) => !msg.sentDuringManualMode && !msg.sentByAdminId,
  );

  return await Promise.all(
    filteredMessages.map(async (msg) => {
      const parts: Array<Record<string, unknown>> = [];

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (msg.file) {
        try {
          const fileObject = await c.env.FILES.get(msg.file.storageKey);
          if (fileObject) {
            const arrayBuffer = await fileObject.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString("base64");
            parts.push({
              inlineData: {
                mimeType: msg.file.mimeType,
                data: base64,
              },
            });
            parts.push({
              text: `[File ID: ${msg.file.id}, Filename: ${msg.file.originalFilename}]`,
            });
          }
        } catch (error) {
          console.error("Error loading image from R2:", error);
        }
      }

      return {
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        parts,
      };
    }),
  );
}
