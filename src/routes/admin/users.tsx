import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { usersTable } from "../../db/schema";
import { requireAdmin } from "../../lib/adminAuth";
import { UserDetail } from "../../views/admin/userdetail";
import { UserSystemPrompt } from "../../views/admin/usersystemprompt";
import { AppLink, lk } from "../../lib/links";
import { html } from "hono/html";
import { sendWhatsappMessage } from "../../lib/whatsapp-sender";
import { createMessage } from "../../models/message";
import { setUserManualMode } from "../../models/user";
import { Bindings } from "../..";
import { CONVERSATION_SYSTEM_PROMPT } from "../../lib/prompts";
import { findTaxiIdsByUserId } from "../../models/taxiid";
import { findRttLocationById } from "../../models/rttlocation";
import {
  updateUserNameFunction,
  updateDriverInfoFunction,
  saveMessageFileToDocumentsFunction,
  getUserDocumentsFunction,
  sendDocumentLinkFunction,
  createVehicleOfferFunction,
  updateVehicleOfferFunction,
  getOpenOffersFunction,
  askVehicleOfferQuestionFunction,
  lookupRttLocationInfoFunction,
  checkInAtLocationFunction,
  updatePreferredLocationFunction,
  addTaxiIdFunction,
  getTaxiIdsFunction,
} from "../../lib/conversation/functions";

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

    const result = await sendWhatsappMessage(
      c,
      targetUser.phoneNumber,
      message.trim(),
      targetUser.id,
    );

    // Also save to messages table for conversation history
    if (result.success) {
      await createMessage(c, targetUser.id, "assistant", message.trim());
    }

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
  })
  .get("/:id/systemprompt", async (c) => {
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

    // Fetch taxi IDs
    const taxiIds = await findTaxiIdsByUserId(c, targetUser.id);
    const taxiIdStrings = taxiIds.map((t) => t.taxiId);

    // Fetch preferred location name
    let preferredLocationName: string | undefined;
    if (targetUser.preferredRttLocationId) {
      const location = await findRttLocationById(
        c,
        targetUser.preferredRttLocationId,
      );
      if (location) {
        preferredLocationName = location.name;
      }
    }

    const systemPrompt = CONVERSATION_SYSTEM_PROMPT({
      ...targetUser,
      taxiIds: taxiIdStrings,
      preferredLocationName,
    });
    const functions = [
      updateUserNameFunction,
      updateDriverInfoFunction,
      saveMessageFileToDocumentsFunction,
      getUserDocumentsFunction,
      sendDocumentLinkFunction,
      createVehicleOfferFunction,
      updateVehicleOfferFunction,
      getOpenOffersFunction,
      askVehicleOfferQuestionFunction,
      lookupRttLocationInfoFunction,
      checkInAtLocationFunction,
      updatePreferredLocationFunction,
      addTaxiIdFunction,
      getTaxiIdsFunction,
    ];

    return c.render(
      <UserSystemPrompt
        user={targetUser}
        systemPrompt={systemPrompt}
        functions={functions}
      />,
      {
        title: `System Prompt - ${targetUser.name} - Admin - Gozy`,
      },
    );
  })
  .post("/:id/toggle-manual-mode", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const userId = parseInt(c.req.param("id"), 10);
    const db = drizzle(c.env.DB);

    const targetUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!targetUser) {
      return c.redirect(lk(AppLink.AdminTable, { tableName: "users" }));
    }

    // Toggle manual mode
    await setUserManualMode(c, userId, !targetUser.manualMode);

    // Redirect back to user detail page
    return c.redirect(lk(AppLink.AdminUserDetail, { id: String(userId) }));
  });
