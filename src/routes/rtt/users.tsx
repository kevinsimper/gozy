import { Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { usersTable } from "../../db/schema";
import { requireRttStaff } from "../../lib/rttAuth";
import { RttUserDetailView } from "../../views/rtt/user-detail";
import { RttUploadDocumentView } from "../../views/rtt/upload-document";
import { uploadUserDocument } from "../../lib/userDocument";
import { findUserDocumentsByUserId } from "../../models/userDocument";
import { findTaxiIdsByUserId } from "../../models/taxiid";
import { AppLink, lk } from "../../lib/links";
import { Bindings } from "../..";
import { sendWhatsappMessage } from "../../lib/whatsapp-sender";

const UploadDocumentSchema = z.object({
  userId: z.coerce.number().int().positive("User ID is required"),
  documentType: z.string().optional(),
});

const SendMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const rttUsersRoutes = new Hono<{ Bindings: Bindings }>()
  .use("*", async (c, next) => {
    const user = await requireRttStaff(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }
    return next();
  })
  .get("/:id", async (c) => {
    const userId = parseInt(c.req.param("id"));

    if (isNaN(userId)) {
      return c.notFound();
    }

    const db = drizzle(c.env.DB);

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user) {
      return c.notFound();
    }

    const documents = await findUserDocumentsByUserId(c, userId);
    const taxiIds = await findTaxiIdsByUserId(c, userId);

    const messageSent = c.req.query("messageSent") === "true";
    const messageError = c.req.query("messageError");

    return c.render(
      <RttUserDetailView
        user={user}
        documents={documents}
        messageSent={messageSent}
        messageError={messageError}
        taxiIds={taxiIds}
      />,
      {
        title: `${user.name} - RTT Portal`,
      },
    );
  })
  .get("/:id/upload-document", async (c) => {
    const userId = parseInt(c.req.param("id"));

    if (isNaN(userId)) {
      return c.notFound();
    }

    const db = drizzle(c.env.DB);

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user) {
      return c.notFound();
    }

    const error = c.req.query("error");
    const success = c.req.query("success");

    return c.render(
      <RttUploadDocumentView user={user} error={error} success={success} />,
      {
        title: `Upload Document - ${user.name}`,
      },
    );
  })
  .post("/:id/upload-document", async (c) => {
    const userId = parseInt(c.req.param("id"));

    if (isNaN(userId)) {
      return c.notFound();
    }

    const db = drizzle(c.env.DB);

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user) {
      return c.notFound();
    }

    try {
      const formData = await c.req.formData();
      const file = formData.get("file");
      const documentType = formData.get("documentType");

      if (!file || !(file instanceof File)) {
        return c.redirect(
          lk(AppLink.RttUserDocumentUpload, {
            id: userId.toString(),
            query: { error: "No file selected" },
          }),
        );
      }

      await uploadUserDocument(
        c,
        userId,
        file,
        documentType && typeof documentType === "string" && documentType !== ""
          ? documentType
          : undefined,
      );

      return c.redirect(
        lk(AppLink.RttUserDocumentUpload, {
          id: userId.toString(),
          query: { success: "Document uploaded successfully" },
        }),
      );
    } catch (error) {
      console.error("Upload error:", error);
      return c.redirect(
        lk(AppLink.RttUserDocumentUpload, {
          id: userId.toString(),
          query: {
            error:
              error instanceof Error
                ? error.message
                : "Failed to upload document",
          },
        }),
      );
    }
  })
  .post("/:id/send-message", async (c) => {
    const userId = parseInt(c.req.param("id"));

    if (isNaN(userId)) {
      return c.notFound();
    }

    const db = drizzle(c.env.DB);

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .get();

    if (!user) {
      return c.notFound();
    }

    try {
      const formData = await c.req.parseBody();
      const validatedData = SendMessageSchema.parse(formData);

      const result = await sendWhatsappMessage(
        c,
        user.phoneNumber,
        validatedData.message,
        user.id,
      );

      if (result.success) {
        return c.redirect(
          lk(AppLink.RttUserDetail, {
            id: userId.toString(),
            query: { messageSent: "true" },
          }),
        );
      } else {
        return c.redirect(
          lk(AppLink.RttUserDetail, {
            id: userId.toString(),
            query: { messageError: result.error || "Failed to send message" },
          }),
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      return c.redirect(
        lk(AppLink.RttUserDetail, {
          id: userId.toString(),
          query: {
            messageError:
              error instanceof Error ? error.message : "Failed to send message",
          },
        }),
      );
    }
  });
