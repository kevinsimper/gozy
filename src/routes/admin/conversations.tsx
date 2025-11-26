import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { usersTable } from "../../db/schema";
import { requireAdmin } from "../../lib/adminAuth";
import { AppLink, lk } from "../../lib/links";
import { sendWhatsappMessage } from "../../lib/whatsapp-sender";
import {
  createMessage,
  getMessagesWithFiles,
  type MessageWithFile,
} from "../../models/message";
import {
  getUsersInManualMode,
  setUserManualMode,
  type User,
} from "../../models/user";
import { Bindings } from "../..";
import { ConversationsList } from "../../views/admin/conversations-list";
import { ConversationDetail } from "../../views/admin/conversation-detail";

export type UserWithLastMessage = User & {
  lastMessageAt: Date | null;
  lastMessagePreview: string | null;
};

export const conversationsRoutes = new Hono<{ Bindings: Bindings }>()
  // List all users in manual mode
  .get("/", async (c) => {
    const admin = await requireAdmin(c);
    if (!admin || typeof admin !== "object" || !("id" in admin)) {
      return admin;
    }

    const usersInManualMode = await getUsersInManualMode(c);

    // Get last message for each user
    const usersWithLastMessage: UserWithLastMessage[] = await Promise.all(
      usersInManualMode.map(async (user) => {
        const messages = await getMessagesWithFiles(c, user.id, 1);
        return {
          ...user,
          lastMessageAt: messages[0]?.createdAt || null,
          lastMessagePreview: messages[0]?.content?.substring(0, 50) || null,
        };
      }),
    );

    return c.render(<ConversationsList users={usersWithLastMessage} />, {
      title: "Conversations - Admin - Gozy",
    });
  })

  // View conversation with specific user
  .get("/:id", async (c) => {
    const admin = await requireAdmin(c);
    if (!admin || typeof admin !== "object" || !("id" in admin)) {
      return admin;
    }

    const userId = parseInt(c.req.param("id"), 10);
    const db = drizzle(c.env.DB);

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user) {
      return c.redirect(lk(AppLink.AdminConversations));
    }

    const messages = await getMessagesWithFiles(c, userId, 100);

    return c.render(<ConversationDetail user={user} messages={messages} />, {
      title: `${user.name} - Conversation - Admin - Gozy`,
    });
  })

  // Send message to user
  .post("/:id/send-message", async (c) => {
    const admin = await requireAdmin(c);
    if (!admin || typeof admin !== "object" || !("id" in admin)) {
      return admin;
    }

    const userId = parseInt(c.req.param("id"), 10);
    const formData = await c.req.formData();
    const message = formData.get("message");

    if (!message || typeof message !== "string" || message.trim() === "") {
      return c.redirect(
        lk(AppLink.AdminConversationDetail, { id: String(userId) }),
      );
    }

    const db = drizzle(c.env.DB);
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user) {
      return c.redirect(lk(AppLink.AdminConversations));
    }

    // Send via WhatsApp
    const result = await sendWhatsappMessage(
      c,
      user.phoneNumber,
      message.trim(),
      user.id,
    );

    // Save to messages table with admin attribution
    // Mark messages sent during manual mode so they're excluded from AI context
    if (result.success) {
      await createMessage(
        c,
        user.id,
        "assistant",
        message.trim(),
        undefined,
        admin.id,
        user.manualMode, // sentDuringManualMode
      );
    }

    return c.redirect(
      lk(AppLink.AdminConversationDetail, { id: String(userId) }),
    );
  })

  // Toggle manual mode from conversation view
  .post("/:id/toggle-manual-mode", async (c) => {
    const admin = await requireAdmin(c);
    if (!admin || typeof admin !== "object" || !("id" in admin)) {
      return admin;
    }

    const userId = parseInt(c.req.param("id"), 10);
    const db = drizzle(c.env.DB);

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user) {
      return c.redirect(lk(AppLink.AdminConversations));
    }

    // Toggle manual mode
    await setUserManualMode(c, userId, !user.manualMode);

    // Redirect back to conversation detail
    return c.redirect(
      lk(AppLink.AdminConversationDetail, { id: String(userId) }),
    );
  });
