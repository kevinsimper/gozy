import { Hono } from "hono";
import { getUserFromCookie } from "../../services/auth";
import { ChatPage } from "../../views/dashboard/chat";
import { AppLink, lk } from "../../lib/links";
import {
  createMessage,
  getMessagesWithFiles,
  getMessageByPublicId,
} from "../../models/message";
import { generateAssistantResponse } from "../../lib/conversation";
import { uploadAndCreateFile } from "../../lib/fileUpload";
import type { Bindings } from "../../index";

export const chatRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/files/:publicId", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }
    const publicId = c.req.param("publicId");

    try {
      const message = await getMessageByPublicId(c, publicId);

      if (!message || message.userId !== userId || !message.file) {
        return c.notFound();
      }

      const fileObject = await c.env.FILES.get(message.file.storageKey);

      if (!fileObject) {
        return c.notFound();
      }

      const encodedFilename = encodeURIComponent(message.file.originalFilename);
      return c.body(fileObject.body, {
        headers: {
          "Content-Type": message.file.mimeType,
          "Content-Disposition": `inline; filename*=UTF-8''${encodedFilename}`,
        },
      });
    } catch (error) {
      console.error("File serve error:", error);
      return c.notFound();
    }
  })
  .get("/", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }
    const messages = await getMessagesWithFiles(c, userId, 50);

    return c.render(<ChatPage messages={messages} />, {
      title: "Chat med Gozy",
    });
  })
  .post("/", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    try {
      const formData = await c.req.formData();
      const messageInput = formData.get("message");
      const fileInput = formData.get("file");

      const message =
        messageInput && typeof messageInput === "string" ? messageInput : "";

      if (!message) {
        if (
          !fileInput ||
          !(fileInput instanceof File) ||
          fileInput.size === 0
        ) {
          return c.redirect(lk(AppLink.DashboardChat));
        }
      }

      // Handle optional file upload
      let uploadedFile;
      if (fileInput && fileInput instanceof File && fileInput.size > 0) {
        uploadedFile = await uploadAndCreateFile(c, fileInput);
      }

      // Save user message with optional file
      await createMessage(c, userId, "user", message || "Image", uploadedFile);

      // Generate assistant response (handles conversation history, files, and function calls)
      const responseResult = await generateAssistantResponse(c, userId);

      if (!responseResult.ok) {
        console.error("Assistant response error:", responseResult.val);
        return c.redirect(
          lk(AppLink.DashboardChat, { query: { error: "chat_failed" } }),
        );
      }

      // Get updated messages including the new ones
      const messages = await getMessagesWithFiles(c, userId, 50);

      return c.render(<ChatPage messages={messages} />, {
        title: "Chat med Gozy",
      });
    } catch (error) {
      console.error("Chat error:", error);
      return c.redirect(
        lk(AppLink.DashboardChat, { query: { error: "chat_failed" } }),
      );
    }
  });
