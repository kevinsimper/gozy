import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { count, gte, desc, eq, sum } from "drizzle-orm";
import { usersTable, userDocumentsTable, filesTable } from "../db/schema";
import { getUserFromCookie } from "../services/auth";
import { findUserById } from "../models/user";
import { AdminLayout } from "../views/admin/layout";
import { AdminDashboard } from "../views/admin/dashboard";
import { AdminDocuments } from "../views/admin/documents";
import { AppLink, lk } from "../lib/links";
import { html } from "hono/html";

type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
};

const ALLOWED_ADMIN_PHONE_NUMBERS = ["+4540360565", "+4520586016"];

export const adminRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const userIdStr = await getUserFromCookie(c);

    if (!userIdStr) {
      return c.redirect(lk(AppLink.Login));
    }

    const userId = parseInt(userIdStr, 10);
    const user = await findUserById(c, userId);

    if (!user) {
      return c.redirect(lk(AppLink.Login));
    }

    // Check if user is admin
    if (!ALLOWED_ADMIN_PHONE_NUMBERS.includes(user.phoneNumber)) {
      return c.html(
        html`
          <!DOCTYPE html>
          <html lang="da">
            <head>
              <meta charset="UTF-8" />
              <title>Access Denied</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body
              class="bg-black text-white min-h-screen flex items-center justify-center"
            >
              <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">Access Denied</h1>
                <p class="text-gray-400 mb-6">
                  You do not have permission to access this page.
                </p>
                <a
                  href=${lk(AppLink.Dashboard)}
                  class="text-blue-500 hover:underline"
                  >Go to Dashboard</a
                >
              </div>
            </body>
          </html>
        `,
        403,
      );
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
    const userIdStr = await getUserFromCookie(c);

    if (!userIdStr) {
      return c.redirect(lk(AppLink.Login));
    }

    const userId = parseInt(userIdStr, 10);
    const user = await findUserById(c, userId);

    if (!user) {
      return c.redirect(lk(AppLink.Login));
    }

    // Check if user is admin
    if (!ALLOWED_ADMIN_PHONE_NUMBERS.includes(user.phoneNumber)) {
      return c.html(
        html`
          <!DOCTYPE html>
          <html lang="da">
            <head>
              <meta charset="UTF-8" />
              <title>Access Denied</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body
              class="bg-black text-white min-h-screen flex items-center justify-center"
            >
              <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">Access Denied</h1>
                <p class="text-gray-400 mb-6">
                  You do not have permission to access this page.
                </p>
                <a
                  href=${lk(AppLink.Dashboard)}
                  class="text-blue-500 hover:underline"
                  >Go to Dashboard</a
                >
              </div>
            </body>
          </html>
        `,
        403,
      );
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
  });
