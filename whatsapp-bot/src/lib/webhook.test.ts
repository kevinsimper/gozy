import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendToWebhook } from "./webhook";

describe("webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendToWebhook", () => {
    it("should send message without media", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, response: "Message received" }),
      });
      global.fetch = mockFetch;

      const result = await sendToWebhook({
        from: "4540360565@c.us",
        text: "Hello world",
        messageId: "msg123",
        timestamp: 1234567890,
      });

      expect(result).toEqual({
        text: "Message received",
        mediaUrl: undefined,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/whatsapp"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer /),
          }),
          body: expect.any(FormData),
        }),
      );

      const callArgs = mockFetch.mock.calls[0];
      const formData = callArgs[1].body as FormData;

      expect(formData.get("from")).toBe("4540360565@c.us");
      expect(formData.get("text")).toBe("Hello world");
      expect(formData.get("messageId")).toBe("msg123");
      expect(formData.get("timestamp")).toBe("1234567890");
      expect(formData.get("media")).toBeNull();
    });

    it("should send message with media", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, response: "Photo received" }),
      });
      global.fetch = mockFetch;

      const base64Data = Buffer.from("test image data").toString("base64");

      const result = await sendToWebhook({
        from: "4540360565@c.us",
        text: "Check this out",
        media: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
        messageId: "msg456",
        timestamp: 1234567890,
      });

      expect(result).toEqual({
        text: "Photo received",
        mediaUrl: undefined,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/whatsapp"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer /),
          }),
          body: expect.any(FormData),
        }),
      );

      const callArgs = mockFetch.mock.calls[0];
      const formData = callArgs[1].body as FormData;

      expect(formData.get("from")).toBe("4540360565@c.us");
      expect(formData.get("text")).toBe("Check this out");
      expect(formData.get("messageId")).toBe("msg456");
      expect(formData.get("timestamp")).toBe("1234567890");

      const mediaFile = formData.get("media") as File;
      expect(mediaFile).toBeInstanceOf(File);
      expect(mediaFile.type).toBe("image/jpeg");
      expect(mediaFile.name).toBe("media");
    });
  });
});
