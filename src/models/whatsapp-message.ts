import { drizzle } from "drizzle-orm/d1";
import { desc } from "drizzle-orm";
import { whatsappMessagesTable } from "../db/schema";

export type WhatsappMessage = typeof whatsappMessagesTable.$inferSelect;

export async function createWhatsappMessage(
  c: { env: { DB: D1Database } },
  phoneNumber: string,
  message: string,
  status: "sent" | "failed",
  userId?: number,
  mediaUrl?: string,
): Promise<WhatsappMessage> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(whatsappMessagesTable)
    .values({
      phoneNumber,
      message,
      type: "whatsapp",
      status,
      userId: userId ?? null,
      mediaUrl: mediaUrl ?? null,
    })
    .returning()
    .get();
  return result;
}

export async function getAllWhatsappMessages(
  c: { env: { DB: D1Database } },
  limit: number = 100,
): Promise<WhatsappMessage[]> {
  const db = drizzle(c.env.DB);
  const messages = await db
    .select()
    .from(whatsappMessagesTable)
    .orderBy(desc(whatsappMessagesTable.createdAt))
    .limit(limit)
    .all();

  return messages;
}
