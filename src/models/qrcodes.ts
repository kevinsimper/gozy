import { eq, sql, desc } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { qrCodesTable, qrCodeScansTable } from "../db/schema";

export async function createQrCode(
  db: DrizzleD1Database,
  data: {
    shortCode: string;
    name: string;
    redirectUrl: string;
    createdBy: number;
  },
): Promise<{ success: true; id: number } | { success: false; error: string }> {
  const existing = await db
    .select()
    .from(qrCodesTable)
    .where(eq(qrCodesTable.shortCode, data.shortCode))
    .get();

  if (existing) {
    return { success: false, error: "Short code already exists" };
  }

  const result = await db
    .insert(qrCodesTable)
    .values({
      shortCode: data.shortCode,
      name: data.name,
      redirectUrl: data.redirectUrl,
      createdBy: data.createdBy,
    })
    .returning({ id: qrCodesTable.id })
    .get();

  return { success: true, id: result.id };
}

export async function getQrCodeByShortCode(
  db: DrizzleD1Database,
  shortCode: string,
) {
  return await db
    .select()
    .from(qrCodesTable)
    .where(eq(qrCodesTable.shortCode, shortCode))
    .get();
}

export async function getQrCodeById(db: DrizzleD1Database, id: number) {
  return await db
    .select()
    .from(qrCodesTable)
    .where(eq(qrCodesTable.id, id))
    .get();
}

export async function updateQrCode(
  db: DrizzleD1Database,
  shortCode: string,
  data: {
    name?: string;
    redirectUrl?: string;
  },
): Promise<boolean> {
  const result = await db
    .update(qrCodesTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(qrCodesTable.shortCode, shortCode))
    .returning({ id: qrCodesTable.id })
    .get();

  return !!result;
}

export async function deleteQrCode(
  db: DrizzleD1Database,
  shortCode: string,
): Promise<boolean> {
  const qrCode = await getQrCodeByShortCode(db, shortCode);
  if (!qrCode) {
    return false;
  }

  await db
    .delete(qrCodeScansTable)
    .where(eq(qrCodeScansTable.qrCodeId, qrCode.id))
    .run();

  const result = await db
    .delete(qrCodesTable)
    .where(eq(qrCodesTable.shortCode, shortCode))
    .returning({ id: qrCodesTable.id })
    .get();

  return !!result;
}

export async function listQrCodes(db: DrizzleD1Database) {
  const qrCodes = await db
    .select({
      id: qrCodesTable.id,
      shortCode: qrCodesTable.shortCode,
      name: qrCodesTable.name,
      redirectUrl: qrCodesTable.redirectUrl,
      createdAt: qrCodesTable.createdAt,
      updatedAt: qrCodesTable.updatedAt,
      scanCount: sql<number>`(
        SELECT COUNT(*)
        FROM ${qrCodeScansTable}
        WHERE ${qrCodeScansTable.qrCodeId} = ${qrCodesTable.id}
      )`,
    })
    .from(qrCodesTable)
    .orderBy(desc(qrCodesTable.createdAt))
    .all();

  return qrCodes;
}

export async function recordScan(
  db: DrizzleD1Database,
  qrCodeId: number,
  data: {
    userAgent?: string;
    country?: string;
  },
): Promise<void> {
  await db
    .insert(qrCodeScansTable)
    .values({
      qrCodeId,
      userAgent: data.userAgent,
      country: data.country,
    })
    .run();
}

export async function getQrCodeStats(db: DrizzleD1Database, qrCodeId: number) {
  const totalScans = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(qrCodeScansTable)
    .where(eq(qrCodeScansTable.qrCodeId, qrCodeId))
    .get();

  const recentScans = await db
    .select()
    .from(qrCodeScansTable)
    .where(eq(qrCodeScansTable.qrCodeId, qrCodeId))
    .orderBy(desc(qrCodeScansTable.createdAt))
    .limit(10)
    .all();

  return {
    totalScans: totalScans?.count || 0,
    recentScans,
  };
}
