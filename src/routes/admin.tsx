import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { count, gte, desc, eq, getTableColumns } from "drizzle-orm";
import { usersTable, userDocumentsTable, filesTable } from "../db/schema";
import { requireAdmin } from "../lib/adminAuth";
import { AdminLayout } from "../views/admin/layout";
import { AdminDashboard } from "../views/admin/dashboard";
import { AdminDocuments } from "../views/admin/documents";
import { GenericTableView } from "../views/admin/genericTable";
import { GenericTableDetail } from "../views/admin/genericTableDetail";
import { AppLink, lk } from "../lib/links";
import { getTableByName } from "../lib/tableRegistry";
import { html } from "hono/html";

type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
};

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
  });
