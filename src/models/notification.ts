import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { notificationsTable } from "../db/schema";

export type Notification = typeof notificationsTable.$inferSelect;

export async function createNotification(
  c: { env: { DB: D1Database } },
  data: {
    channel: "email" | "whatsapp" | "sms";
    recipient: string;
    subject?: string;
    content: string;
    status: "sent" | "failed";
    userId?: number;
  },
): Promise<Notification> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(notificationsTable)
    .values({
      channel: data.channel,
      recipient: data.recipient,
      subject: data.subject,
      content: data.content,
      status: data.status,
      userId: data.userId,
    })
    .returning()
    .get();
  return result;
}

export async function getNotifications(
  c: { env: { DB: D1Database } },
  options?: {
    channel?: "email" | "whatsapp" | "sms";
    limit?: number;
  },
): Promise<Notification[]> {
  const db = drizzle(c.env.DB);
  const limit = options?.limit ?? 50;

  if (options?.channel) {
    return await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.channel, options.channel))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit)
      .all();
  }

  return await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.createdAt))
    .limit(limit)
    .all();
}
