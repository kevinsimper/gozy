import { drizzle } from "drizzle-orm/d1";
import { remindersTable } from "../db/schema";

export type Reminder = typeof remindersTable.$inferSelect;

export async function createReminder(
  c: { env: { DB: D1Database } },
  data: {
    userId: number;
    documentId: number;
  },
): Promise<Reminder> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(remindersTable)
    .values({
      userId: data.userId,
      documentId: data.documentId,
    })
    .returning()
    .get();
  return result;
}
