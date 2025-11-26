import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { count, desc, eq, getTableColumns } from "drizzle-orm";
import { requireAdmin } from "../../lib/adminAuth";
import { GenericTableView } from "../../views/admin/genericTable";
import { GenericTableDetail } from "../../views/admin/genericTableDetail";
import { GenericTableEdit } from "../../views/admin/genericTableEdit";
import { AppLink, lk } from "../../lib/links";
import { getTableByName } from "../../lib/tableRegistry";
import { html } from "hono/html";
import { Bindings } from "../..";
import {
  buildGenericFormFields,
  buildGenericZodSchema,
} from "../../lib/genericFormBuilder";

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
  .get("/:tableName/create", async (c) => {
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

    const fields = buildGenericFormFields(table);

    return c.render(
      <GenericTableEdit
        tableName={tableName}
        fields={fields}
        isCreate={true}
      />,
      {
        title: `Create ${tableName} - Admin - Gozy`,
      },
    );
  })
  .post("/:tableName/create", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const tableName = c.req.param("tableName");
    const table = getTableByName(tableName);

    if (!table) {
      return c.redirect(lk(AppLink.AdminDashboard));
    }

    const fields = buildGenericFormFields(table);
    const schema = buildGenericZodSchema(fields);

    const formData = await c.req.parseBody();
    const parseResult = schema.safeParse(formData);

    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        } else {
          errors.general = err.message;
        }
      });

      return c.render(
        <GenericTableEdit
          tableName={tableName}
          fields={fields}
          values={formData}
          errors={errors}
          isCreate={true}
        />,
        {
          title: `Create ${tableName} - Admin - Gozy`,
        },
      );
    }

    const db = drizzle(c.env.DB);

    try {
      const result = await db
        .insert(table)
        .values(parseResult.data)
        .returning();
      const newRecord = result[0];
      const newId = String((newRecord as { id: number }).id);

      return c.redirect(lk(AppLink.AdminTableDetail, { tableName, id: newId }));
    } catch (error) {
      const errors = {
        general: `Failed to create record: ${error instanceof Error ? error.message : "Unknown error"}`,
      };

      return c.render(
        <GenericTableEdit
          tableName={tableName}
          fields={fields}
          values={formData}
          errors={errors}
          isCreate={true}
        />,
        {
          title: `Create ${tableName} - Admin - Gozy`,
        },
      );
    }
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
  })
  .get("/:tableName/:id/edit", async (c) => {
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

    const fields = buildGenericFormFields(table);

    return c.render(
      <GenericTableEdit
        tableName={tableName}
        recordId={id}
        fields={fields}
        values={record}
      />,
      {
        title: `Edit ${tableName} #${id} - Admin - Gozy`,
      },
    );
  })
  .post("/:tableName/:id/update", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const tableName = c.req.param("tableName");
    const id = c.req.param("id");
    const table = getTableByName(tableName);

    if (!table) {
      return c.redirect(lk(AppLink.AdminDashboard));
    }

    const db = drizzle(c.env.DB);

    const record = await db
      .select()
      .from(table)
      .where(eq(table.id, parseInt(id, 10)))
      .get();

    if (!record) {
      return c.redirect(lk(AppLink.AdminTable, { tableName }));
    }

    const fields = buildGenericFormFields(table);
    const schema = buildGenericZodSchema(fields);

    const formData = await c.req.parseBody();
    const parseResult = schema.safeParse(formData);

    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      parseResult.error.issues.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        } else {
          errors.general = err.message;
        }
      });

      return c.render(
        <GenericTableEdit
          tableName={tableName}
          recordId={id}
          fields={fields}
          values={formData}
          errors={errors}
        />,
        {
          title: `Edit ${tableName} #${id} - Admin - Gozy`,
        },
      );
    }

    try {
      await db
        .update(table)
        .set(parseResult.data)
        .where(eq(table.id, parseInt(id, 10)))
        .run();

      return c.redirect(lk(AppLink.AdminTableDetail, { tableName, id }));
    } catch (error) {
      const errors = {
        general: `Failed to update record: ${error instanceof Error ? error.message : "Unknown error"}`,
      };

      return c.render(
        <GenericTableEdit
          tableName={tableName}
          recordId={id}
          fields={fields}
          values={formData}
          errors={errors}
        />,
        {
          title: `Edit ${tableName} #${id} - Admin - Gozy`,
        },
      );
    }
  });
