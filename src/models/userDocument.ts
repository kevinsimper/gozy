import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { userDocumentsTable, filesTable } from "../db/schema";

export type UserDocument = typeof userDocumentsTable.$inferSelect;

export async function createUserDocument(
  c: { env: { DB: D1Database } },
  data: {
    userId: number;
    fileId: number;
    documentType: string;
  },
): Promise<UserDocument> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(userDocumentsTable)
    .values({
      userId: data.userId,
      fileId: data.fileId,
      documentType: data.documentType,
    })
    .returning()
    .get();
  return result;
}

export async function findUserDocumentsByUserId(
  c: { env: { DB: D1Database } },
  userId: number,
): Promise<Array<UserDocument & { file: typeof filesTable.$inferSelect }>> {
  const db = drizzle(c.env.DB);
  const result = await db
    .select({
      id: userDocumentsTable.id,
      publicId: userDocumentsTable.publicId,
      userId: userDocumentsTable.userId,
      fileId: userDocumentsTable.fileId,
      documentType: userDocumentsTable.documentType,
      createdAt: userDocumentsTable.createdAt,
      updatedAt: userDocumentsTable.updatedAt,
      file: filesTable,
    })
    .from(userDocumentsTable)
    .innerJoin(filesTable, eq(userDocumentsTable.fileId, filesTable.id))
    .where(eq(userDocumentsTable.userId, userId))
    .orderBy(desc(userDocumentsTable.createdAt))
    .all();
  return result;
}

export async function findUserDocumentByPublicId(
  c: { env: { DB: D1Database } },
  publicId: string,
): Promise<
  (UserDocument & { file: typeof filesTable.$inferSelect }) | undefined
> {
  const db = drizzle(c.env.DB, { schema });
  const result = await db.query.userDocumentsTable.findFirst({
    where: eq(userDocumentsTable.publicId, publicId),
    with: {
      file: true,
    },
  });
  return result;
}

export async function deleteUserDocument(
  c: { env: { DB: D1Database } },
  publicId: string,
): Promise<void> {
  const db = drizzle(c.env.DB);
  await db
    .delete(userDocumentsTable)
    .where(eq(userDocumentsTable.publicId, publicId))
    .run();
}
