import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { pageviewsTable } from "../db/schema";

export type Pageview = typeof pageviewsTable.$inferSelect;

export async function createPageview(
  c: { env: { DB: D1Database } },
  data: {
    userId: number;
    method: string;
    path: string;
  },
): Promise<Pageview> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(pageviewsTable)
    .values({
      userId: data.userId,
      method: data.method,
      path: data.path,
    })
    .returning()
    .get();
  return result;
}

export async function findPageviewsByUserId(
  c: { env: { DB: D1Database } },
  userId: number,
  limit?: number,
): Promise<Pageview[]> {
  const db = drizzle(c.env.DB);
  const query = db
    .select()
    .from(pageviewsTable)
    .where(eq(pageviewsTable.userId, userId))
    .orderBy(desc(pageviewsTable.createdAt));

  if (limit) {
    return await query.limit(limit).all();
  }

  return await query.all();
}
