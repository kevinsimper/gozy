import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import {
  count,
  gte,
  desc,
  eq,
  getTableColumns,
  isNotNull,
  sql,
  and,
  notInArray,
} from "drizzle-orm";
import {
  usersTable,
  userDocumentsTable,
  filesTable,
  remindersTable,
} from "../db/schema";
import { requireAdmin } from "../lib/adminAuth";
import { AdminLayout } from "../views/admin/layout";
import { AdminDashboard } from "../views/admin/dashboard";
import { AdminDocuments } from "../views/admin/documents";
import { AdminReminders } from "../views/admin/reminders";
import { GenericTableView } from "../views/admin/genericTable";
import { GenericTableDetail } from "../views/admin/genericTableDetail";
import { UserDetail } from "../views/admin/userdetail";
import { AppLink, lk } from "../lib/links";
import { getTableByName } from "../lib/tableRegistry";
import { html } from "hono/html";
import { sendWhatsAppMessage } from "../lib/whatsapp";
import { updateUserDocument } from "../models/userDocument";
import { createReminder } from "../models/reminder";
import { Bindings } from "..";

export const adminRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const db = drizzle(c.env.DB);

    // Get total users count
    const totalUsersResult = await db
      .select({ count: count() })
      .from(usersTable)
      .get();
    const totalUsers = totalUsersResult?.count || 0;

    // Get users from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const usersLast7DaysResult = await db
      .select({ count: count() })
      .from(usersTable)
      .where(gte(usersTable.createdAt, sevenDaysAgo))
      .get();
    const usersLast7Days = usersLast7DaysResult?.count || 0;

    // Get users from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const usersLast30DaysResult = await db
      .select({ count: count() })
      .from(usersTable)
      .where(gte(usersTable.createdAt, thirtyDaysAgo))
      .get();
    const usersLast30Days = usersLast30DaysResult?.count || 0;

    // Get recent users (last 10)
    const recentUsers = await db
      .select()
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(10)
      .all();

    const stats = {
      totalUsers,
      usersLast7Days,
      usersLast30Days,
      recentUsers,
    };

    return c.html(html`
      <!DOCTYPE html>
      <html lang="da">
        <head>
          <meta charset="UTF-8" />
          <title>Admin Dashboard - Gozy</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body>
          ${AdminLayout({
            children: AdminDashboard({ stats }),
          })}
        </body>
      </html>
    `);
  })
  .get("/documents", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const db = drizzle(c.env.DB);

    // Get all documents with user and file information
    const documents = await db
      .select({
        id: userDocumentsTable.id,
        publicId: userDocumentsTable.publicId,
        userId: userDocumentsTable.userId,
        fileId: userDocumentsTable.fileId,
        documentType: userDocumentsTable.documentType,
        createdAt: userDocumentsTable.createdAt,
        updatedAt: userDocumentsTable.updatedAt,
        user: usersTable,
        file: filesTable,
      })
      .from(userDocumentsTable)
      .innerJoin(filesTable, eq(userDocumentsTable.fileId, filesTable.id))
      .innerJoin(usersTable, eq(userDocumentsTable.userId, usersTable.id))
      .orderBy(desc(userDocumentsTable.createdAt))
      .all();

    // Get total documents count
    const totalDocsResult = await db
      .select({ count: count() })
      .from(userDocumentsTable)
      .get();
    const totalDocuments = totalDocsResult?.count || 0;

    // Calculate total size
    const totalSize = documents.reduce((acc, doc) => acc + doc.file.size, 0);

    const stats = {
      totalDocuments,
      totalSize,
    };

    return c.html(html`
      <!DOCTYPE html>
      <html lang="da">
        <head>
          <meta charset="UTF-8" />
          <title>Documents - Admin - Gozy</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body>
          ${AdminLayout({
            children: AdminDocuments({ documents, stats }),
          })}
        </body>
      </html>
    `);
  })
  .get("/reminders", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const db = drizzle(c.env.DB);

    // Get all documents with expiry dates
    const documentsWithExpiry = await db
      .select({
        id: userDocumentsTable.id,
        publicId: userDocumentsTable.publicId,
        userId: userDocumentsTable.userId,
        documentType: userDocumentsTable.documentType,
        expiryDate: userDocumentsTable.expiryDate,
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
      .innerJoin(usersTable, eq(userDocumentsTable.userId, usersTable.id))
      .where(isNotNull(userDocumentsTable.expiryDate))
      .orderBy(desc(userDocumentsTable.expiryDate))
      .all();

    // Get all reminders to check which documents have been reminded
    const allReminders = await db
      .select({
        documentId: remindersTable.documentId,
      })
      .from(remindersTable)
      .all();

    const remindedDocumentIds = new Set(allReminders.map((r) => r.documentId));

    // Calculate days until expiry and reminder status
    const now = new Date();
    const documents = documentsWithExpiry.map((doc) => {
      const expiryDate = doc.expiryDate ? new Date(doc.expiryDate) : null;
      const daysUntilExpiry = expiryDate
        ? Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          )
        : null;

      const isDueForReminder =
        doc.reminderDaysBefore !== null &&
        daysUntilExpiry !== null &&
        daysUntilExpiry <= doc.reminderDaysBefore;

      return {
        ...doc,
        hasReminder: remindedDocumentIds.has(doc.id),
        daysUntilExpiry,
        isDueForReminder,
      };
    });

    const stats = {
      totalWithExpiry: documents.length,
      dueForReminder: documents.filter((d) => d.isDueForReminder).length,
      remindersSent: documents.filter((d) => d.hasReminder).length,
    };

    return c.html(html`
      <!DOCTYPE html>
      <html lang="da">
        <head>
          <meta charset="UTF-8" />
          <title>Reminders - Admin - Gozy</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body>
          ${AdminLayout({
            children: AdminReminders({ documents, stats }),
          })}
        </body>
      </html>
    `);
  })
  .post("/reminders/:id/update-expiry", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const documentId = parseInt(c.req.param("id"), 10);
    const db = drizzle(c.env.DB);

    const document = await db
      .select()
      .from(userDocumentsTable)
      .where(eq(userDocumentsTable.id, documentId))
      .get();

    if (!document) {
      return c.redirect(lk(AppLink.AdminReminders));
    }

    const formData = await c.req.formData();
    const days = parseInt(formData.get("days") as string, 10);

    if (isNaN(days) || days <= 0) {
      return c.redirect(lk(AppLink.AdminReminders));
    }

    // Set expiry date to X days from now
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + days);

    await updateUserDocument(c, document.publicId, {
      expiryDate: newExpiryDate,
    });

    return c.redirect(lk(AppLink.AdminReminders));
  })
  .post("/reminders/:id/send", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const documentId = parseInt(c.req.param("id"), 10);
    const db = drizzle(c.env.DB);

    // Get document with user info
    const document = await db
      .select({
        id: userDocumentsTable.id,
        publicId: userDocumentsTable.publicId,
        userId: userDocumentsTable.userId,
        documentType: userDocumentsTable.documentType,
        expiryDate: userDocumentsTable.expiryDate,
        description: userDocumentsTable.description,
        user: usersTable,
      })
      .from(userDocumentsTable)
      .innerJoin(usersTable, eq(userDocumentsTable.userId, usersTable.id))
      .where(eq(userDocumentsTable.id, documentId))
      .get();

    if (!document) {
      return c.redirect(lk(AppLink.AdminReminders));
    }

    // Check if reminder already sent
    const existingReminder = await db
      .select()
      .from(remindersTable)
      .where(eq(remindersTable.documentId, documentId))
      .get();

    if (existingReminder) {
      return c.redirect(lk(AppLink.AdminReminders));
    }

    // Send reminder
    const expiryDate = document.expiryDate
      ? new Date(document.expiryDate).toLocaleDateString("da-DK")
      : "ukendt";
    const documentTypeDanish = document.documentType.replace(/_/g, " ");

    const message = `Hej ${document.user.name}!

Din ${documentTypeDanish} udløber snart: ${expiryDate}

${document.description ? `Note: ${document.description}\n\n` : ""}Husk at forny dokumentet i tide for at undgå problemer.

Du kan se og opdatere dine dokumenter på https://gozy.dk/dashboard/documents`;

    try {
      await sendWhatsAppMessage(
        c.env.WHATSAPP_BOT_URL,
        c.env.WHATSAPP_BOT_TOKEN,
        document.user.phoneNumber,
        message,
      );

      // Record reminder
      await createReminder(c, {
        userId: document.userId,
        documentId: document.id,
      });
    } catch (error) {
      console.error("Failed to send reminder:", error);
    }

    return c.redirect(lk(AppLink.AdminReminders));
  })
  .get("/tables/:tableName", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const tableName = c.req.param("tableName");
    const table = getTableByName(tableName);

    if (!table) {
      return c.html(
        html`
          <!DOCTYPE html>
          <html lang="da">
            <head>
              <meta charset="UTF-8" />
              <title>Table Not Found</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body
              class="bg-black text-white min-h-screen flex items-center justify-center"
            >
              <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">Table Not Found</h1>
                <p class="text-gray-400 mb-6">
                  The table "${tableName}" does not exist.
                </p>
                <a
                  href=${lk(AppLink.AdminDashboard)}
                  class="text-blue-500 hover:underline"
                  >Go to Admin Dashboard</a
                >
              </div>
            </body>
          </html>
        `,
        404,
      );
    }

    const db = drizzle(c.env.DB);

    const columns = Object.keys(getTableColumns(table));

    const rows = await db
      .select()
      .from(table)
      .orderBy(desc(table.id))
      .limit(100)
      .all();

    const totalCountResult = await db
      .select({ count: count() })
      .from(table)
      .get();
    const totalCount = totalCountResult?.count || 0;

    return c.html(html`
      <!DOCTYPE html>
      <html lang="da">
        <head>
          <meta charset="UTF-8" />
          <title>${tableName} - Admin - Gozy</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body>
          ${AdminLayout({
            children: GenericTableView({
              tableName,
              columns,
              rows,
              totalCount,
            }),
          })}
        </body>
      </html>
    `);
  })
  .get("/tables/:tableName/:id", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const tableName = c.req.param("tableName");
    const id = c.req.param("id");
    const table = getTableByName(tableName);

    if (!table) {
      return c.html(
        html`
          <!DOCTYPE html>
          <html lang="da">
            <head>
              <meta charset="UTF-8" />
              <title>Table Not Found</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body
              class="bg-black text-white min-h-screen flex items-center justify-center"
            >
              <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">Table Not Found</h1>
                <p class="text-gray-400 mb-6">
                  The table "${tableName}" does not exist.
                </p>
                <a
                  href=${lk(AppLink.AdminDashboard)}
                  class="text-blue-500 hover:underline"
                  >Go to Admin Dashboard</a
                >
              </div>
            </body>
          </html>
        `,
        404,
      );
    }

    const db = drizzle(c.env.DB);

    const record = await db
      .select()
      .from(table)
      .where(eq(table.id, parseInt(id, 10)))
      .get();

    if (!record) {
      return c.html(
        html`
          <!DOCTYPE html>
          <html lang="da">
            <head>
              <meta charset="UTF-8" />
              <title>Record Not Found</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body
              class="bg-black text-white min-h-screen flex items-center justify-center"
            >
              <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">Record Not Found</h1>
                <p class="text-gray-400 mb-6">
                  No record found with ID ${id} in ${tableName}.
                </p>
                <a
                  href=${lk(AppLink.AdminTable, { tableName })}
                  class="text-blue-500 hover:underline"
                  >Back to ${tableName}</a
                >
              </div>
            </body>
          </html>
        `,
        404,
      );
    }

    return c.html(html`
      <!DOCTYPE html>
      <html lang="da">
        <head>
          <meta charset="UTF-8" />
          <title>${tableName} #${id} - Admin - Gozy</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body>
          ${AdminLayout({
            children: GenericTableDetail({ tableName, record }),
          })}
        </body>
      </html>
    `);
  })
  .get("/users/:id", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const userId = c.req.param("id");
    const db = drizzle(c.env.DB);

    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, parseInt(userId, 10)))
      .get();

    if (!targetUser) {
      return c.html(
        html`
          <!DOCTYPE html>
          <html lang="da">
            <head>
              <meta charset="UTF-8" />
              <title>User Not Found</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body
              class="bg-black text-white min-h-screen flex items-center justify-center"
            >
              <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">User Not Found</h1>
                <p class="text-gray-400 mb-6">
                  No user found with ID ${userId}.
                </p>
                <a
                  href=${lk(AppLink.AdminTable, { tableName: "users" })}
                  class="text-blue-500 hover:underline"
                  >Back to Users</a
                >
              </div>
            </body>
          </html>
        `,
        404,
      );
    }

    return c.html(html`
      <!DOCTYPE html>
      <html lang="da">
        <head>
          <meta charset="UTF-8" />
          <title>${targetUser.name} - User - Admin - Gozy</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body>
          ${AdminLayout({
            children: UserDetail({ user: targetUser }),
          })}
        </body>
      </html>
    `);
  })
  .post("/users/:id/send-message", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const userId = c.req.param("id");
    const db = drizzle(c.env.DB);

    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, parseInt(userId, 10)))
      .get();

    if (!targetUser) {
      return c.redirect(lk(AppLink.AdminTable, { tableName: "users" }));
    }

    const formData = await c.req.formData();
    const message = formData.get("message");

    if (!message || typeof message !== "string" || message.trim() === "") {
      return c.html(html`
        <!DOCTYPE html>
        <html lang="da">
          <head>
            <meta charset="UTF-8" />
            <title>${targetUser.name} - User - Admin - Gozy</title>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
          </head>
          <body>
            ${AdminLayout({
              children: UserDetail({
                user: targetUser,
                messageError: "Message cannot be empty",
              }),
            })}
          </body>
        </html>
      `);
    }

    const result = await sendWhatsAppMessage(
      c.env.WHATSAPP_BOT_URL,
      c.env.WHATSAPP_BOT_TOKEN,
      targetUser.phoneNumber,
      message.trim(),
    );

    return c.html(html`
      <!DOCTYPE html>
      <html lang="da">
        <head>
          <meta charset="UTF-8" />
          <title>${targetUser.name} - User - Admin - Gozy</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body>
          ${AdminLayout({
            children: UserDetail({
              user: targetUser,
              messageSent: result.success,
              messageError: result.error,
            }),
          })}
        </body>
      </html>
    `);
  });
