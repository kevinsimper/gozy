import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import * as schema from "../db/schema";
import { messagesTable, type File } from "../db/schema";
import type { Context } from "hono";
import { DatabaseFile } from "./file";

type DatabaseContext = {
  Bindings: {
    DB: D1Database;
  };
};

export type Message = typeof messagesTable.$inferSelect;

export async function createMessage<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  role: "user" | "assistant",
  content: string,
  file?: DatabaseFile,
): Promise<Message> {
  const db = drizzle(c.env.DB);
  const result = await db
    .insert(messagesTable)
    .values({
      userId,
      role,
      content,
      fileId: file?.id ?? null,
    })
    .returning()
    .get();
  return result;
}

export async function getRecentMessages<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  limit: number = 10,
): Promise<Message[]> {
  const db = drizzle(c.env.DB);
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.userId, userId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit)
    .all();

  // Return in chronological order (oldest first)
  return messages.reverse();
}

export type MessageWithFile = Message & {
  file: File | null;
};

export async function getMessagesWithFiles<Env extends DatabaseContext>(
  c: Context<Env>,
  userId: number,
  limit: number = 10,
): Promise<MessageWithFile[]> {
  const db = drizzle(c.env.DB, { schema });
  const messages = await db.query.messagesTable.findMany({
    where: eq(messagesTable.userId, userId),
    orderBy: desc(messagesTable.createdAt),
    limit,
    with: {
      file: true,
    },
  });

  // Return in chronological order (oldest first)
  return messages.reverse();
}

export async function getMessageByPublicId<Env extends DatabaseContext>(
  c: Context<Env>,
  publicId: string,
): Promise<MessageWithFile | undefined> {
  const db = drizzle(c.env.DB, { schema });
  const message = await db.query.messagesTable.findFirst({
    where: eq(messagesTable.publicId, publicId),
    with: {
      file: true,
    },
  });

  return message;
}
