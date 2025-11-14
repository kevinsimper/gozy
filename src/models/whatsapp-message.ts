import { drizzle } from "drizzle-orm/d1";
import { desc } from "drizzle-orm";
import { whatsappMessagesTable } from "../db/schema";
import type { Context } from "hono";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export type WhatsappMessage = typeof whatsappMessagesTable.$inferSelect;

export async function createWhatsappMessage<Env extends DatabaseContext>(
  c: Context<Env>,
  phoneNumber: string,
  message: string,
  status: "sent" | "failed",
  userId?: number,
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
    })
    .returning()
    .get();
  return result;
}

export async function getAllWhatsappMessages<Env extends DatabaseContext>(
  c: Context<Env>,
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
