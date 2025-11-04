import { Hono } from "hono";
import { z } from "zod";
import { createFile, findFileByPublicId, deleteFile } from "../models/file";

type Bindings = {
  DB: D1Database;
  FILES: R2Bucket;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const uploadRoutes = new Hono<{ Bindings: Bindings }>()
  .post("/", async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof File)) {
        return c.json({ error: "No file provided" }, 400);
      }

      if (file.size > MAX_FILE_SIZE) {
        return c.json(
          {
            error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          },
          400,
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return c.json(
          {
            error: `File type not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
          },
          400,
        );
      }

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const storageKey = `uploads/${timestamp}-${randomSuffix}-${file.name}`;

      await c.env.FILES.put(storageKey, file, {
        httpMetadata: {
          contentType: file.type,
        },
      });

      const fileRecord = await createFile(c, {
        storageKey,
        originalFilename: file.name,
        mimeType: file.type,
        size: file.size,
      });

      return c.json({
        success: true,
        publicId: fileRecord.publicId,
        filename: fileRecord.originalFilename,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return c.json({ error: "Failed to upload file" }, 500);
    }
  })
  .get("/:publicId", async (c) => {
    try {
      const publicId = c.req.param("publicId");

      const fileRecord = await findFileByPublicId(c, publicId);

      if (!fileRecord) {
        return c.json({ error: "File not found" }, 404);
      }

      const object = await c.env.FILES.get(fileRecord.storageKey);

      if (!object) {
        return c.json({ error: "File not found in storage" }, 404);
      }

      return c.body(object.body, 200, {
        "Content-Type": fileRecord.mimeType,
        "Content-Length": fileRecord.size.toString(),
        "Content-Disposition": `inline; filename="${fileRecord.originalFilename}"`,
      });
    } catch (error) {
      console.error("Download error:", error);
      return c.json({ error: "Failed to download file" }, 500);
    }
  })
  .delete("/:publicId", async (c) => {
    try {
      const publicId = c.req.param("publicId");

      const fileRecord = await findFileByPublicId(c, publicId);

      if (!fileRecord) {
        return c.json({ error: "File not found" }, 404);
      }

      await c.env.FILES.delete(fileRecord.storageKey);

      await deleteFile(c, publicId);

      return c.json({ success: true });
    } catch (error) {
      console.error("Delete error:", error);
      return c.json({ error: "Failed to delete file" }, 500);
    }
  });
