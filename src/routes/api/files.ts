import { Hono } from "hono";
import { Bindings } from "../../index";
import { getMessageByPublicId } from "../../models/message";

export const filesRoutes = new Hono<{ Bindings: Bindings }>().get(
  "/:publicId",
  async (c) => {
    const publicId = c.req.param("publicId");

    try {
      const message = await getMessageByPublicId(c, publicId);

      if (!message || !message.file) {
        return c.notFound();
      }

      // Check if message is less than 1 hour old
      const now = new Date();
      const messageAge = now.getTime() - message.createdAt.getTime();
      const oneHourInMs = 60 * 60 * 1000;

      if (messageAge > oneHourInMs) {
        return c.json({ error: "File access expired" }, 403);
      }

      // Fetch file from R2
      const fileObject = await c.env.FILES.get(message.file.storageKey);

      if (!fileObject) {
        return c.notFound();
      }

      const encodedFilename = encodeURIComponent(message.file.originalFilename);
      return c.body(fileObject.body, {
        headers: {
          "Content-Type": message.file.mimeType,
          "Content-Disposition": `inline; filename*=UTF-8''${encodedFilename}`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (error) {
      console.error("Public file serve error:", error);
      return c.notFound();
    }
  },
);
