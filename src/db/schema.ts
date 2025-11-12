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
    expiryDate: int("expiry_date", { mode: "timestamp" }),
    description: text(),
    reminderDaysBefore: int("reminder_days_before"),
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
    expiryDateIdx: index("user_documents_expiry_date_idx").on(table.expiryDate),
  }),
);

export type UserDocument = typeof userDocumentsTable.$inferSelect;

export const remindersTable = sqliteTable(
  "reminders",
  {
    id: int().primaryKey({ autoIncrement: true }),
    userId: int("user_id").notNull(),
    documentId: int("document_id").notNull(),
    sentAt: int("sent_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    documentIdIdx: index("reminders_document_id_idx").on(table.documentId),
    userIdIdx: index("reminders_user_id_idx").on(table.userId),
  }),
);

export type Reminder = typeof remindersTable.$inferSelect;

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
    carType: text("car_type"),
    brand: text(),
    budget: int(),
    model: text(),
    financing: text({ enum: ["lease", "loan", "cash"] }),
    leasingDuration: text("leasing_duration"),
    taxiEquipment: int("taxi_equipment", { mode: "boolean" }),
    taxiCompany: text("taxi_company"),
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

export const pageviewsTable = sqliteTable(
  "pageviews",
  {
    id: int().primaryKey({ autoIncrement: true }),
    userId: int("user_id").notNull(),
    method: text().notNull(),
    path: text().notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    idIdx: index("pageviews_id_idx").on(table.id),
    userIdCreatedAtIdx: index("pageviews_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export type Pageview = typeof pageviewsTable.$inferSelect;

export const eventLogsTable = sqliteTable(
  "event_logs",
  {
    id: int().primaryKey({ autoIncrement: true }),
    event: text().notNull(),
    log: text(),
    detailsLink: text("details_link"),
    userId: int("user_id"),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    idIdx: index("event_logs_id_idx").on(table.id),
    userIdIdx: index("event_logs_user_id_idx").on(table.userId),
  }),
);

export type EventLog = typeof eventLogsTable.$inferSelect;

export const rttLocationsTable = sqliteTable("rtt_locations", {
  id: int().primaryKey({ autoIncrement: true }),
  slug: text().notNull().unique(),
  name: text().notNull(),
  address: text().notNull(),
  postalCode: text("postal_code").notNull(),
  city: text().notNull(),
  phone: text().notNull(),
  email: text().notNull(),
  openingHoursMonThu: text("opening_hours_mon_thu"),
  openingHoursFri: text("opening_hours_fri"),
  openingHoursSat: text("opening_hours_sat"),
  emergencyHours: text("emergency_hours"),
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type RttLocation = typeof rttLocationsTable.$inferSelect;

export const rttBookingsTable = sqliteTable(
  "rtt_bookings",
  {
    id: int().primaryKey({ autoIncrement: true }),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid()),
    userId: int("user_id").notNull(),
    locationId: int("location_id").notNull(),
    appointmentDate: int("appointment_date", { mode: "timestamp" }).notNull(),
    appointmentHour: int("appointment_hour").notNull(),
    description: text(),
    notes: text(),
    status: text({
      enum: ["pending", "confirmed", "completed", "cancelled"],
    })
      .notNull()
      .default("pending"),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdCreatedAtIdx: index("rtt_bookings_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
    statusIdx: index("rtt_bookings_status_idx").on(table.status),
    locationDateHourIdx: index("rtt_bookings_location_date_hour_idx").on(
      table.locationId,
      table.appointmentDate,
      table.appointmentHour,
    ),
  }),
);

export type RttBooking = typeof rttBookingsTable.$inferSelect;

export const rttBookingsRelations = relations(rttBookingsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [rttBookingsTable.userId],
    references: [usersTable.id],
  }),
  location: one(rttLocationsTable, {
    fields: [rttBookingsTable.locationId],
    references: [rttLocationsTable.id],
  }),
}));

export const documentTestEvalsTable = sqliteTable("document_test_evals", {
  id: int().primaryKey({ autoIncrement: true }),
  fileId: int("file_id").notNull(),
  geminiDocumentType: text("gemini_document_type"),
  geminiExpiryDate: text("gemini_expiry_date"),
  geminiConfidence: text("gemini_confidence"),
  geminiNotes: text("gemini_notes"),
  expectedDocumentType: text("expected_document_type"),
  expectedExpiryDate: text("expected_expiry_date"),
  isCorrect: int("is_correct", { mode: "boolean" }),
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type DocumentTestEval = typeof documentTestEvalsTable.$inferSelect;

export const documentTestEvalsRelations = relations(
  documentTestEvalsTable,
  ({ one }) => ({
    file: one(filesTable, {
      fields: [documentTestEvalsTable.fileId],
      references: [filesTable.id],
    }),
  }),
);
