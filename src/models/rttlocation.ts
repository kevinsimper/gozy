import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { rttLocationsTable } from "../db/schema";
import type { Context } from "hono";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export type RttLocation = typeof rttLocationsTable.$inferSelect;

export async function findAllRttLocations<Env extends DatabaseContext>(
  c: Context<Env>,
): Promise<RttLocation[]> {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(rttLocationsTable).all();
  return result;
}

export async function findRttLocationBySlug<Env extends DatabaseContext>(
  c: Context<Env>,
  slug: string,
): Promise<RttLocation | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(rttLocationsTable)
    .where(eq(rttLocationsTable.slug, slug))
    .get();
  return result;
}

export async function findRttLocationById<Env extends DatabaseContext>(
  c: Context<Env>,
  id: number,
): Promise<RttLocation | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(rttLocationsTable)
    .where(eq(rttLocationsTable.id, id))
    .get();
  return result;
}
