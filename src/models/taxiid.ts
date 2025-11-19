import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { driverTaxiIdsTable } from "../db/schema";
import type { Context } from "hono";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export type DriverTaxiId = typeof driverTaxiIdsTable.$inferSelect;

export async function findTaxiIdsByUserId<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
): Promise<DriverTaxiId[]> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(driverTaxiIdsTable)
    .where(eq(driverTaxiIdsTable.userId, userId))
    .all();
  return result;
}

export async function createTaxiId<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  taxiId: string,
): Promise<DriverTaxiId> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(driverTaxiIdsTable)
    .values({
      userId,
      taxiId,
    })
    .returning()
    .get();
  return result;
}

export async function deleteTaxiId<Env extends DatabaseContext>(
  c: Context<Env>,
  id: number,
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db
    .delete(driverTaxiIdsTable)
    .where(eq(driverTaxiIdsTable.id, id))
    .run();
}
