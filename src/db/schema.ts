import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  email: text(),
  loginPin: text("login_pin"),
  loginPinExpiry: int("login_pin_expiry", { mode: "timestamp" }),
  lastLoginAt: int("last_login_at", { mode: "timestamp" }),
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type User = typeof usersTable.$inferSelect;

export const filesTable = sqliteTable("files", {
  id: int().primaryKey({ autoIncrement: true }),
  publicId: text("public_id")
    .notNull()
    .unique()
    .$defaultFn(() => nanoid()),
  storageKey: text("storage_key").notNull(),
  originalFilename: text("original_filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: int().notNull(),
  compressedSize: int("compressed_size"),
  compression: text({ enum: ["BROTLI"] }),
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type File = typeof filesTable.$inferSelect;

export const userDocumentsTable = sqliteTable(
  "user_documents",
  {
    id: int().primaryKey({ autoIncrement: true }),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid()),
    userId: int("user_id").notNull(),
    fileId: int("file_id").notNull(),
    documentType: text("document_type").notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdCreatedAtIdx: index("user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export type UserDocument = typeof userDocumentsTable.$inferSelect;
