import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { newsTable } from "../db/schema";

export type News = typeof newsTable.$inferSelect;
export type NewNews = typeof newsTable.$inferInsert;

type DatabaseContext = {
  Bindings: { DB: D1Database };
};

export async function getPublishedNews<Env extends DatabaseContext>(
  c: Context<Env>,
  limit: number = 5,
): Promise<News[]> {
  const db = drizzle(c.env.DB);

  return db
    .select()
    .from(newsTable)
    .where(eq(newsTable.isPublished, true))
    .orderBy(desc(newsTable.publishedAt))
    .limit(limit)
    .all();
}
