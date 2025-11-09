import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { eventLogsTable } from "../db/schema";

export type EventLog = typeof eventLogsTable.$inferSelect;

export async function insertEventLog(
  c: { env: { DB: D1Database } },
  data: {
    event: string;
    log?: Record<string, unknown>;
    detailsLink?: string;
    userId?: number;
  },
): Promise<EventLog> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(eventLogsTable)
    .values({
      event: data.event,
      log: data.log ? JSON.stringify(data.log) : undefined,
      detailsLink: data.detailsLink,
      userId: data.userId,
    })
    .returning()
    .get();
  return result;
}

export async function findRecentEventLogs(
  c: { env: { DB: D1Database } },
  limit = 100,
): Promise<EventLog[]> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(eventLogsTable)
    .orderBy(desc(eventLogsTable.id))
    .limit(limit)
    .all();
  return result;
}

export async function findEventLogsByUserId(
  c: { env: { DB: D1Database } },
  userId: number,
  limit = 100,
): Promise<EventLog[]> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(eventLogsTable)
    .where(eq(eventLogsTable.userId, userId))
    .orderBy(desc(eventLogsTable.id))
    .limit(limit)
    .all();
  return result;
}
