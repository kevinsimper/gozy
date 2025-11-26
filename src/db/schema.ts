import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  email: text(),
  role: text({ enum: ["driver", "rtt_staff", "admin"] })
    .notNull()
    .default("driver"),
  driverType: text("driver_type", { enum: ["vehicle_owner", "driver"] }),
  loginPin: text("login_pin"),
  loginPinExpiry: int("login_pin_expiry", { mode: "timestamp" }),
  lastLoginAt: int("last_login_at", { mode: "timestamp" }),
  preferredRttLocationId: int("preferred_rtt_location_id"),
  manualMode: int("manual_mode", { mode: "boolean" }).notNull().default(false),
  manualModeEnabledAt: int("manual_mode_enabled_at", { mode: "timestamp" }),
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
    sentByAdminId: int("sent_by_admin_id"),
    sentDuringManualMode: int("sent_during_manual_mode", { mode: "boolean" })
      .notNull()
      .default(false),
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

export const driverTaxiIdsTable = sqliteTable(
  "driver_taxi_ids",
  {
    id: int().primaryKey({ autoIncrement: true }),
    userId: int("user_id").notNull(),
    taxiId: text("taxi_id").notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("driver_taxi_ids_user_id_idx").on(table.userId),
  }),
);

export type DriverTaxiId = typeof driverTaxiIdsTable.$inferSelect;

export const driverTaxiIdsRelations = relations(
  driverTaxiIdsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [driverTaxiIdsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  vehicleOffers: many(vehicleOffersTable),
  taxiIds: many(driverTaxiIdsTable),
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

export const checkinsTable = sqliteTable(
  "checkins",
  {
    id: int().primaryKey({ autoIncrement: true }),
    userId: int("user_id").notNull(),
    locationId: int("location_id").notNull(),
    checkedInAt: int("checked_in_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdIdx: index("checkins_user_id_idx").on(table.userId),
    locationIdIdx: index("checkins_location_id_idx").on(table.locationId),
    userIdCheckedInAtIdx: index("checkins_user_id_checked_in_at_idx").on(
      table.userId,
      table.checkedInAt,
    ),
  }),
);

export type Checkin = typeof checkinsTable.$inferSelect;

export const checkinsRelations = relations(checkinsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [checkinsTable.userId],
    references: [usersTable.id],
  }),
  location: one(rttLocationsTable, {
    fields: [checkinsTable.locationId],
    references: [rttLocationsTable.id],
  }),
}));

export const whatsappMessagesTable = sqliteTable(
  "whatsapp_messages",
  {
    id: int().primaryKey({ autoIncrement: true }),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid()),
    userId: int("user_id"),
    phoneNumber: text("phone_number").notNull(),
    message: text().notNull(),
    mediaUrl: text("media_url"),
    type: text().notNull(),
    status: text({ enum: ["sent", "failed"] }).notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    userIdCreatedAtIdx: index("whatsapp_messages_user_id_created_at_idx").on(
      table.userId,
      table.createdAt,
    ),
  }),
);

export type WhatsappMessage = typeof whatsappMessagesTable.$inferSelect;

export const rateLimitsTable = sqliteTable(
  "rate_limits",
  {
    id: int().primaryKey({ autoIncrement: true }),
    identifier: text().notNull(),
    endpoint: text().notNull(),
    requests: int().notNull().default(0),
    resetsAt: int("resets_at", { mode: "timestamp" }).notNull(),
    isOverThreshold: int("is_over_threshold", { mode: "boolean" })
      .notNull()
      .default(false),
    lastAlarmSentAt: int("last_alarm_sent_at", { mode: "timestamp" }),
    alarmCount: int("alarm_count").notNull().default(0),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    identifierEndpointIdx: index("rate_limits_identifier_endpoint_idx").on(
      table.identifier,
      table.endpoint,
    ),
    resetsAtIdx: index("rate_limits_resets_at_idx").on(table.resetsAt),
  }),
);

export type RateLimit = typeof rateLimitsTable.$inferSelect;

export const rateLimitLogsTable = sqliteTable(
  "rate_limit_logs",
  {
    id: int().primaryKey({ autoIncrement: true }),
    identifier: text().notNull(),
    endpoint: text().notNull(),
    action: text({
      enum: ["allowed", "blocked_ip", "blocked_global"],
    }).notNull(),
    globalCount: int("global_count"),
    ipCount: int("ip_count"),
    userAgent: text("user_agent"),
    country: text(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    identifierCreatedAtIdx: index(
      "rate_limit_logs_identifier_created_at_idx",
    ).on(table.identifier, table.createdAt),
    endpointCreatedAtIdx: index("rate_limit_logs_endpoint_created_at_idx").on(
      table.endpoint,
      table.createdAt,
    ),
  }),
);

export type RateLimitLog = typeof rateLimitLogsTable.$inferSelect;

export const qrCodesTable = sqliteTable("qr_codes", {
  id: int().primaryKey({ autoIncrement: true }),
  shortCode: text("short_code").notNull().unique(),
  name: text().notNull(),
  redirectUrl: text("redirect_url").notNull(),
  createdBy: int("created_by").notNull(),
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type QrCode = typeof qrCodesTable.$inferSelect;

export const qrCodeScansTable = sqliteTable(
  "qr_code_scans",
  {
    id: int().primaryKey({ autoIncrement: true }),
    qrCodeId: int("qr_code_id").notNull(),
    userAgent: text("user_agent"),
    country: text(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    qrCodeIdIdx: index("qr_code_scans_qr_code_id_idx").on(table.qrCodeId),
    createdAtIdx: index("qr_code_scans_created_at_idx").on(table.createdAt),
  }),
);

export type QrCodeScan = typeof qrCodeScansTable.$inferSelect;

export const qrCodesRelations = relations(qrCodesTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [qrCodesTable.createdBy],
    references: [usersTable.id],
  }),
  scans: many(qrCodeScansTable),
}));

export const qrCodeScansRelations = relations(qrCodeScansTable, ({ one }) => ({
  qrCode: one(qrCodesTable, {
    fields: [qrCodeScansTable.qrCodeId],
    references: [qrCodesTable.id],
  }),
}));

// Helpdesk Articles
export const helpdeskArticlesTable = sqliteTable("helpdesk_articles", {
  id: int().primaryKey({ autoIncrement: true }),
  publicId: text("public_id")
    .notNull()
    .unique()
    .$defaultFn(() => nanoid()),
  title: text().notNull(),
  description: text().notNull(),
  embedding: text(),
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type HelpdeskArticle = typeof helpdeskArticlesTable.$inferSelect;

export const helpdeskQuestionsTable = sqliteTable(
  "helpdesk_questions",
  {
    id: int().primaryKey({ autoIncrement: true }),
    articleId: int("article_id").notNull(),
    question: text().notNull(),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    articleIdIdx: index("helpdesk_questions_article_id_idx").on(
      table.articleId,
    ),
  }),
);

export type HelpdeskQuestion = typeof helpdeskQuestionsTable.$inferSelect;

export const helpdeskArticlesRelations = relations(
  helpdeskArticlesTable,
  ({ many }) => ({
    questions: many(helpdeskQuestionsTable),
  }),
);

export const helpdeskQuestionsRelations = relations(
  helpdeskQuestionsTable,
  ({ one }) => ({
    article: one(helpdeskArticlesTable, {
      fields: [helpdeskQuestionsTable.articleId],
      references: [helpdeskArticlesTable.id],
    }),
  }),
);

// News
export const newsTable = sqliteTable(
  "news",
  {
    id: int().primaryKey({ autoIncrement: true }),
    publicId: text("public_id")
      .notNull()
      .unique()
      .$defaultFn(() => nanoid()),
    title: text().notNull(),
    summary: text().notNull(),
    category: text(),
    author: text(),
    isPublished: int("is_published", { mode: "boolean" })
      .notNull()
      .default(true),
    publishedAt: int("published_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    isPublishedIdx: index("news_is_published_idx").on(table.isPublished),
    publishedAtIdx: index("news_published_at_idx").on(table.publishedAt),
  }),
);

export type News = typeof newsTable.$inferSelect;
