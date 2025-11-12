import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { usersTable } from "../../db/schema";
import { requireAdmin } from "../../lib/adminAuth";
import { UserDetail } from "../../views/admin/userdetail";
import { AppLink, lk } from "../../lib/links";
import { html } from "hono/html";
import { sendWhatsAppMessage } from "../../lib/whatsapp";
import { Bindings } from "../..";

export const usersRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/:id", async (c) => {
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

    return c.render(<UserDetail user={targetUser} />, {
      title: `${targetUser.name} - User - Admin - Gozy`,
    });
  })
  .post("/:id/send-message", async (c) => {
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
      return c.render(
        <UserDetail user={targetUser} messageError="Message cannot be empty" />,
        {
          title: `${targetUser.name} - User - Admin - Gozy`,
        },
      );
    }

    const result = await sendWhatsAppMessage(
      c.env.WHATSAPP_BOT_URL,
      c.env.WHATSAPP_BOT_TOKEN,
      targetUser.phoneNumber,
      message.trim(),
    );

    return c.render(
      <UserDetail
        user={targetUser}
        messageSent={result.success}
        messageError={result.error}
      />,
      {
        title: `${targetUser.name} - User - Admin - Gozy`,
      },
    );
  });
