import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { requireAdmin } from "../../lib/adminAuth";
import { GenericTableView } from "../../views/admin/genericTable";
import { GenericTableDetail } from "../../views/admin/genericTableDetail";
import { AppLink, lk } from "../../lib/links";
import { getTableByName } from "../../lib/tableRegistry";
import { html } from "hono/html";
import { Bindings } from "../..";

export const tablesRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/:tableName", async (c) => {
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

    return c.render(
      <GenericTableView
        tableName={tableName}
        columns={columns}
        rows={rows}
        totalCount={totalCount}
      />,
      {
        title: `${tableName} - Admin - Gozy`,
      },
    );
  })
  .get("/:tableName/:id", async (c) => {
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

    return c.render(
      <GenericTableDetail tableName={tableName} record={record} />,
      {
        title: `${tableName} #${id} - Admin - Gozy`,
      },
    );
  });
