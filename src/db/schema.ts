import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
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
    userIdCreatedAtIdx: index("user_documents_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export type UserDocument = typeof userDocumentsTable.$inferSelect;

export const messagesTable = sqliteTable(
  "messages",
  {
    id: int().primaryKey({ autoIncrement: true }),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid()),
    userId: int("user_id").notNull(),
    role: text({ enum: ["user", "assistant"] }).notNull(),
    content: text().notNull(),
    fileId: int("file_id"),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdCreatedAtIdx: index("messages_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    fileIdIdx: index("messages_file_id_idx").on(table.fileId),
  }),
);

export type Message = typeof messagesTable.$inferSelect;

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  file: one(filesTable, {
    fields: [messagesTable.fileId],
    references: [filesTable.id],
  }),
}));

export const userDocumentsRelations = relations(
  userDocumentsTable,
  ({ one }) => ({
    file: one(filesTable, {
      fields: [userDocumentsTable.fileId],
      references: [filesTable.id],
    }),
  }),
);

export const vehicleOffersTable = sqliteTable(
  "vehicle_offers",
  {
    id: int().primaryKey({ autoIncrement: true }),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid()),
    userId: int("user_id").notNull(),
    brand: text(),
    budget: int(),
    model: text(),
    financing: text({ enum: ["lease", "loan", "cash"] }),
    timeframe: text(),
    notes: text(),
    questionsAsked: text("questions_asked"),
    status: text({ enum: ["collecting_info", "submitted", "responded"] })
      .notNull()
      .default("collecting_info"),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdCreatedAtIdx: index("vehicle_offers_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    statusIdx: index("vehicle_offers_status_idx").on(table.status),
  }),
);

export type VehicleOffer = typeof vehicleOffersTable.$inferSelect;

export const vehicleOffersRelations = relations(
  vehicleOffersTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [vehicleOffersTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  vehicleOffers: many(vehicleOffersTable),
}));
