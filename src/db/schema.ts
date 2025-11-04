import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
