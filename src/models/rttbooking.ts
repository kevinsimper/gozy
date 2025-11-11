import { drizzle } from "drizzle-orm/d1";
import { eq, and, gte, lte } from "drizzle-orm";
import { rttBookingsTable, rttLocationsTable } from "../db/schema";
import type { Context } from "hono";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export type RttBooking = typeof rttBookingsTable.$inferSelect;

export async function createRttBooking<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  data: {
    locationId: number;
    appointmentDate: Date;
    appointmentHour: number;
    description?: string;
    notes?: string;
  },
): Promise<RttBooking> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(rttBookingsTable)
    .values({
      userId,
      locationId: data.locationId,
      appointmentDate: data.appointmentDate,
      appointmentHour: data.appointmentHour,
      description: data.description || null,
      notes: data.notes || null,
    })
    .returning()
    .get();
  return result;
}

export async function findRttBookingsByUserId<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
): Promise<RttBooking[]> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(rttBookingsTable)
    .where(eq(rttBookingsTable.userId, userId))
    .all();
  return result;
}

export async function findActiveRttBookingsByUserId<
  Env extends DatabaseContext,
>(c: Context<Env>, userId: number): Promise<RttBooking[]> {
  const db = drizzle(c.env.DB);
  const now = new Date();

  const result = await db
    .select()
    .from(rttBookingsTable)
    .where(
      and(
        eq(rttBookingsTable.userId, userId),
        gte(rttBookingsTable.appointmentDate, now),
      ),
    )
    .all();
  return result;
}

export async function countRttBookingsByDateAndHour<
  Env extends DatabaseContext,
>(
  c: Context<Env>,
  locationId: number,
  appointmentDate: Date,
  appointmentHour: number,
): Promise<number> {
  const db = drizzle(c.env.DB);

  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await db
    .select()
    .from(rttBookingsTable)
    .where(
      and(
        eq(rttBookingsTable.locationId, locationId),
        eq(rttBookingsTable.appointmentHour, appointmentHour),
        gte(rttBookingsTable.appointmentDate, startOfDay),
        lte(rttBookingsTable.appointmentDate, endOfDay),
      ),
    )
    .all();
  return result.length;
}
