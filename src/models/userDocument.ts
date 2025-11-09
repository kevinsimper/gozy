import { drizzle } from "drizzle-orm/d1";
import { desc, eq, isNotNull, sql, and, notInArray } from "drizzle-orm";
import * as schema from "../db/schema";
import { userDocumentsTable, filesTable, remindersTable } from "../db/schema";

export type UserDocument = typeof userDocumentsTable.$inferSelect;

export async function createUserDocument(
  c: { env: { DB: D1Database } },
  data: {
    userId: number;
    fileId: number;
    documentType: string;
    expiryDate?: Date;
    description?: string;
    reminderDaysBefore?: number;
  },
): Promise<UserDocument> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(userDocumentsTable)
    .values({
      userId: data.userId,
      fileId: data.fileId,
      documentType: data.documentType,
      expiryDate: data.expiryDate,
      description: data.description,
      reminderDaysBefore: data.reminderDaysBefore,
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
      expiryDate: userDocumentsTable.expiryDate,
      description: userDocumentsTable.description,
      reminderDaysBefore: userDocumentsTable.reminderDaysBefore,
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

export async function updateUserDocument(
  c: { env: { DB: D1Database } },
  publicId: string,
  data: {
    documentType?: string;
    expiryDate?: Date | null;
    description?: string | null;
    reminderDaysBefore?: number | null;
  },
): Promise<UserDocument> {
  const db = drizzle(c.env.DB);
  const result = await db
    .update(userDocumentsTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userDocumentsTable.publicId, publicId))
    .returning()
    .get();
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

export async function findDocumentsDueForReminder(c: {
  env: { DB: D1Database };
}): Promise<
  Array<
    UserDocument & { user: { id: number; name: string; phoneNumber: string } }
  >
> {
  const db = drizzle(c.env.DB);

  const remindedDocumentIds = db
    .select({ documentId: remindersTable.documentId })
    .from(remindersTable);

  const result = await db
    .select({
      id: userDocumentsTable.id,
      publicId: userDocumentsTable.publicId,
      userId: userDocumentsTable.userId,
      fileId: userDocumentsTable.fileId,
      documentType: userDocumentsTable.documentType,
      expiryDate: userDocumentsTable.expiryDate,
      description: userDocumentsTable.description,
      reminderDaysBefore: userDocumentsTable.reminderDaysBefore,
      createdAt: userDocumentsTable.createdAt,
      updatedAt: userDocumentsTable.updatedAt,
      user: {
        id: sql<number>`users.id`,
        name: sql<string>`users.name`,
        phoneNumber: sql<string>`users.phone_number`,
      },
    })
    .from(userDocumentsTable)
    .innerJoin(sql`users`, sql`users.id = ${userDocumentsTable.userId}`)
    .where(
      and(
        isNotNull(userDocumentsTable.expiryDate),
        isNotNull(userDocumentsTable.reminderDaysBefore),
        sql`date(${userDocumentsTable.expiryDate} / 1000, 'unixepoch', '-' || ${userDocumentsTable.reminderDaysBefore} || ' days') <= date('now')`,
        notInArray(userDocumentsTable.id, remindedDocumentIds),
      ),
    )
    .all();

  return result;
}
