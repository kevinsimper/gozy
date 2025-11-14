import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { usersTable } from "../../db/schema";
import { requireRttStaff } from "../../lib/rttAuth";
import { sendWhatsappMessage } from "../../lib/whatsapp-sender";
import { AppLink, lk } from "../../lib/links";
import { Bindings } from "../..";

const SendMessageSchema = z.object({
  userId: z.coerce.number().int().positive("User ID is required"),
  message: z.string().min(1, "Message is required"),
});

export const rttSendMessageRoutes = new Hono<{ Bindings: Bindings }>().post(
  "/",
  async (c) => {
    const staffUser = await requireRttStaff(c);
    if (!staffUser || typeof staffUser !== "object" || !("id" in staffUser)) {
      return staffUser;
    }

    try {
      const formData = await c.req.parseBody();
      const validatedData = SendMessageSchema.parse(formData);

      const db = drizzle(c.env.DB);

      // Look up the driver user to get their phone number
      const driver = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, validatedData.userId))
        .get();

      if (!driver) {
        return c.redirect(
          lk(AppLink.RttCheckins, {
            query: { error: "Driver not found" },
          }),
        );
      }

      const result = await sendWhatsappMessage(
        c,
        driver.phoneNumber,
        validatedData.message,
        driver.id,
      );

      if (result.success) {
        // Redirect back to check-ins with success message
        return c.redirect(
          lk(AppLink.RttCheckins, {
            query: { success: "Message sent successfully" },
          }),
        );
      } else {
        // Redirect back to check-ins with error message
        return c.redirect(
          lk(AppLink.RttCheckins, {
            query: { error: result.error || "Failed to send message" },
          }),
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      return c.redirect(
        lk(AppLink.RttCheckins, {
          query: {
            error:
              error instanceof Error ? error.message : "Failed to send message",
          },
        }),
      );
    }
  },
);
