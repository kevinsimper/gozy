import { drizzle } from "drizzle-orm/d1";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { checkinsTable } from "../db/schema";
import type { Context } from "hono";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export type Checkin = typeof checkinsTable.$inferSelect;

export async function createCheckin<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  locationId: number,
): Promise<Checkin> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(checkinsTable)
    .values({
      userId,
      locationId,
    })
    .returning()
    .get();
  return result;
}

export async function findRecentCheckinsByUserId<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  limit: number = 10,
): Promise<Checkin[]> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(checkinsTable)
    .where(eq(checkinsTable.userId, userId))
    .orderBy(desc(checkinsTable.checkedInAt))
    .limit(limit)
    .all();
  return result;
}

export async function findCheckinsByLocationAndDate<
  Env extends DatabaseContext,
>(c: Context<Env>, locationId: number, date: Date): Promise<Checkin[]> {
  const db = drizzle(c.env.DB);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db
    .select()
    .from(checkinsTable)
    .where(
      and(
        eq(checkinsTable.locationId, locationId),
        gte(checkinsTable.checkedInAt, startOfDay),
        lte(checkinsTable.checkedInAt, endOfDay),
      ),
    )
    .all();
  return result;
}
