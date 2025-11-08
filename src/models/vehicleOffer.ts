import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { vehicleOffersTable } from "../db/schema";
import type { Context } from "hono";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export type VehicleOffer = typeof vehicleOffersTable.$inferSelect;

export type VehicleOfferInput = {
  brand?: string;
  budget?: number;
  model?: string;
  financing?: "lease" | "loan" | "cash";
  timeframe?: string;
  notes?: string;
};

export type VehicleOfferUpdate = {
  brand?: string;
  budget?: number;
  model?: string;
  financing?: "lease" | "loan" | "cash";
  timeframe?: string;
  notes?: string;
  status?: "collecting_info" | "submitted" | "responded";
};

export async function createVehicleOffer<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  data: VehicleOfferInput,
): Promise<VehicleOffer> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(vehicleOffersTable)
    .values({
      userId,
      brand: data.brand ?? null,
      budget: data.budget ?? null,
      model: data.model ?? null,
      financing: data.financing ?? null,
      timeframe: data.timeframe ?? null,
      notes: data.notes ?? null,
      questionsAsked: JSON.stringify([]),
      status: "collecting_info",
    })
    .returning()
    .get();
  return result;
}

export async function updateVehicleOffer<Env extends DatabaseContext>(
  c: Context<Env>,
  offerId: number,
  updates?: VehicleOfferUpdate,
  questionsAsked?: string[],
): Promise<VehicleOffer> {
  const db = drizzle(c.env.DB);

  const currentOffer = await db
    .select()
    .from(vehicleOffersTable)
    .where(eq(vehicleOffersTable.id, offerId))
    .get();

  if (!currentOffer) {
    throw new Error(`Vehicle offer with id ${offerId} not found`);
  }

  const existingQuestions = currentOffer.questionsAsked
    ? JSON.parse(currentOffer.questionsAsked)
    : [];

  const mergedQuestions = questionsAsked
    ? Array.from(new Set([...existingQuestions, ...questionsAsked]))
    : existingQuestions;

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
    questionsAsked: JSON.stringify(mergedQuestions),
  };

  if (updates) {
    if (updates.brand !== undefined) updateData.brand = updates.brand;
    if (updates.budget !== undefined) updateData.budget = updates.budget;
    if (updates.model !== undefined) updateData.model = updates.model;
    if (updates.financing !== undefined)
      updateData.financing = updates.financing;
    if (updates.timeframe !== undefined)
      updateData.timeframe = updates.timeframe;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.status !== undefined) updateData.status = updates.status;
  }

  const result = await db
    .update(vehicleOffersTable)
    .set(updateData)
    .where(eq(vehicleOffersTable.id, offerId))
    .returning()
    .get();

  return result;
}

export async function getOpenOffers<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
): Promise<VehicleOffer[]> {
  const db = drizzle(c.env.DB);
  const results = await db
    .select()
    .from(vehicleOffersTable)
    .where(
      and(
        eq(vehicleOffersTable.userId, userId),
        eq(vehicleOffersTable.status, "collecting_info"),
      ),
    )
    .all();
  return results;
}

export async function getVehicleOfferById<Env extends DatabaseContext>(
  c: Context<Env>,
  offerId: number,
): Promise<VehicleOffer | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(vehicleOffersTable)
    .where(eq(vehicleOffersTable.id, offerId))
    .get();
  return result;
}

export async function getVehicleOfferByPublicId<Env extends DatabaseContext>(
  c: Context<Env>,
  publicId: string,
): Promise<VehicleOffer | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(vehicleOffersTable)
    .where(eq(vehicleOffersTable.publicId, publicId))
    .get();
  return result;
}

export function getMissingFields(offer: VehicleOffer): string[] {
  const missing: string[] = [];
  if (!offer.brand) missing.push("brand");
  if (!offer.budget) missing.push("budget");
  if (!offer.model) missing.push("model");
  if (!offer.financing) missing.push("financing");
  if (!offer.timeframe) missing.push("timeframe");
  return missing;
}

export function getQuestionsAsked(offer: VehicleOffer): string[] {
  if (!offer.questionsAsked) return [];
  try {
    return JSON.parse(offer.questionsAsked);
  } catch {
    return [];
  }
}
