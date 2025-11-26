import { Hono } from "hono";
import { Bindings } from "../..";
import { requireAdmin } from "../../lib/adminAuth";
import { AppLink, lk } from "../../lib/links";
import { getNotifications } from "../../models/notification";
import { sendAndLogEmail } from "../../lib/email";
import { AdminNotifications } from "../../views/admin/notifications";

export const notificationsRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const notifications = await getNotifications(c, { limit: 100 });

    return c.render(<AdminNotifications notifications={notifications} />, {
      title: "Notifications - Admin - Gozy",
    });
  })
  .post("/create", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const formData = await c.req.formData();
    const channel = formData.get("channel") as "email" | "whatsapp" | "sms";
    const recipient = formData.get("recipient") as string;
    const subject = formData.get("subject") as string | null;
    const content = formData.get("content") as string;

    if (!channel || !recipient || !content) {
      return c.redirect(lk(AppLink.AdminNotifications));
    }

    if (channel === "email") {
      await sendAndLogEmail(c, {
        to: recipient,
        subject: subject || "Test notification from Gozy",
        html: content,
      });
    }

    return c.redirect(lk(AppLink.AdminNotifications));
  });
