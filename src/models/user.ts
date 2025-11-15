import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { usersTable } from "../db/schema";
import type { Context } from "hono";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export type User = typeof usersTable.$inferSelect;

export async function findUserByPhoneNumber<Env extends DatabaseContext>(
  c: Context<Env>,
  phoneNumber: string,
): Promise<User | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.phoneNumber, phoneNumber))
    .get();
  return result;
}

export async function findUserById<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
): Promise<User | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .get();
  return result;
}

export async function updateLoginPin<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  pin: string,
  expiresAt: Date,
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db
    .update(usersTable)
    .set({
      loginPin: pin,
      loginPinExpiry: expiresAt,
    })
    .where(eq(usersTable.id, userId))
    .run();
}

export async function clearLoginPin<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db
    .update(usersTable)
    .set({
      loginPin: null,
      loginPinExpiry: null,
    })
    .where(eq(usersTable.id, userId))
    .run();
}

export async function updateLastLogin<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db
    .update(usersTable)
    .set({
      lastLoginAt: new Date(),
    })
    .where(eq(usersTable.id, userId))
    .run();
}

export async function createUser<Env extends DatabaseContext>(
  c: Context<Env>,
  phoneNumber: string,
  name: string,
): Promise<User> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(usersTable)
    .values({
      phoneNumber,
      name,
    })
    .returning()
    .get();
  return result;
}

export async function updateUser<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  updates: { name?: string; email?: string },
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, userId))
    .run();
}

export async function updateUserPreferredLocation<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  locationId: number | null,
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db
    .update(usersTable)
    .set({
      preferredRttLocationId: locationId,
    })
    .where(eq(usersTable.id, userId))
    .run();
}

export async function updateUserDriverInfo<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  updates: {
    driverType?: "vehicle_owner" | "driver";
    taxiId?: string;
  },
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, userId))
    .run();
}
