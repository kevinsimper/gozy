import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { filesTable } from "../db/schema";

export type DatabaseFile = typeof filesTable.$inferSelect;
export type NewFile = typeof filesTable.$inferInsert;

export async function createFile(
  c: { env: { DB: D1Database } },
  data: {
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    compressedSize?: number;
    compression?: "BROTLI";
  },
): Promise<DatabaseFile> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(filesTable)
    .values({
      storageKey: data.storageKey,
      originalFilename: data.originalFilename,
      mimeType: data.mimeType,
      size: data.size,
      compressedSize: data.compressedSize,
      compression: data.compression,
    })
    .returning()
    .get();
  return result;
}

export async function findFileByPublicId(
  c: { env: { DB: D1Database } },
  publicId: string,
): Promise<DatabaseFile | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.publicId, publicId))
    .get();
  return result;
}

export async function findFileById(
  c: { env: { DB: D1Database } },
  fileId: number,
): Promise<DatabaseFile | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.id, fileId))
    .get();
  return result;
}

export async function deleteFile(
  c: { env: { DB: D1Database } },
  publicId: string,
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db.delete(filesTable).where(eq(filesTable.publicId, publicId)).run();
}
