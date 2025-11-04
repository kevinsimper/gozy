import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { filesTable } from "../db/schema";
import type { Context } from "hono";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export type File = typeof filesTable.$inferSelect;
export type NewFile = typeof filesTable.$inferInsert;

export async function createFile<Env extends DatabaseContext>(
  c: Context<Env>,
  data: {
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    compressedSize?: number;
    compression?: "BROTLI";
  },
): Promise<File> {
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

export async function findFileByPublicId<Env extends DatabaseContext>(
  c: Context<Env>,
  publicId: string,
): Promise<File | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.publicId, publicId))
    .get();
  return result;
}

export async function findFileById<Env extends DatabaseContext>(
  c: Context<Env>,
  fileId: number,
): Promise<File | undefined> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select()
    .from(filesTable)
    .where(eq(filesTable.id, fileId))
    .get();
  return result;
}

export async function deleteFile<Env extends DatabaseContext>(
  c: Context<Env>,
  publicId: string,
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db.delete(filesTable).where(eq(filesTable.publicId, publicId)).run();
}
