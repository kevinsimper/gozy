import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq, isNotNull, sql } from "drizzle-orm";
import {
  usersTable,
  userDocumentsTable,
  remindersTable,
} from "../../db/schema";
import { requireAdmin } from "../../lib/adminAuth";
import { AdminLayout } from "../../views/admin/layout";
import { AdminReminders } from "../../views/admin/reminders";
import { AppLink, lk } from "../../lib/links";
import { html } from "hono/html";
import { sendWhatsAppMessage } from "../../lib/whatsapp";
import { updateUserDocument } from "../../models/userDocument";
import { createReminder } from "../../models/reminder";
import { Bindings } from "../..";

export const remindersRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
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
  .post("/:id/update-expiry", async (c) => {
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
  .post("/:id/send", async (c) => {
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
  });
