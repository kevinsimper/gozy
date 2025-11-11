import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendDelayedReply,
  handleAskCommand,
  handleMessage,
} from "./messageHandler";
import * as webhook from "./webhook";
import * as delay from "./delay";

vi.mock("./webhook");
vi.mock("./delay");

describe("messageHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(delay.calculateReplyDelay).mockReturnValue(1000);
    vi.mocked(delay.sleep).mockResolvedValue();
  });

  describe("sendDelayedReply", () => {
    it("should calculate delay and send reply", async () => {
      const mockMessage = {
        from: "4540360565@c.us",
        body: "test",
        id: { _serialized: "msg1" },
        timestamp: 123456,
        hasMedia: false,
        reply: vi.fn().mockResolvedValue({}),
        downloadMedia: vi.fn(),
      };

      await sendDelayedReply(mockMessage, "Test response");

      expect(delay.calculateReplyDelay).toHaveBeenCalledWith(13);
      expect(delay.sleep).toHaveBeenCalledWith(1000);
      expect(mockMessage.reply).toHaveBeenCalledWith("Test response");
    });
  });

  describe("handleAskCommand", () => {
    it("should handle !ask command with question", async () => {
      const mockMessage = {
        from: "4540360565@c.us",
        body: "!ask What is the weather?",
        id: { _serialized: "msg1" },
        timestamp: 123456,
        hasMedia: false,
        reply: vi.fn().mockResolvedValue({}),
        downloadMedia: vi.fn(),
      };

      vi.mocked(webhook.sendToWebhook).mockResolvedValue("It's sunny!");

      await handleAskCommand(mockMessage);

      expect(webhook.sendToWebhook).toHaveBeenCalledWith({
        from: "4540360565@c.us",
        text: "What is the weather?",
        messageId: "msg1",
        timestamp: 123456,
      });
      expect(mockMessage.reply).toHaveBeenCalledWith("It's sunny!");
    });

    it("should reply with error if no question provided", async () => {
      const mockMessage = {
        from: "4540360565@c.us",
        body: "!ask ",
        id: { _serialized: "msg1" },
        timestamp: 123456,
        hasMedia: false,
        reply: vi.fn().mockResolvedValue({}),
        downloadMedia: vi.fn(),
      };

      await handleAskCommand(mockMessage);

      expect(mockMessage.reply).toHaveBeenCalledWith(
        "Please provide a question after !ask",
      );
      expect(webhook.sendToWebhook).not.toHaveBeenCalled();
    });

    it("should not reply if webhook returns null", async () => {
      const mockMessage = {
        from: "4540360565@c.us",
        body: "!ask Test?",
        id: { _serialized: "msg1" },
        timestamp: 123456,
        hasMedia: false,
        reply: vi.fn().mockResolvedValue({}),
        downloadMedia: vi.fn(),
      };

      vi.mocked(webhook.sendToWebhook).mockResolvedValue(null);

      await handleAskCommand(mockMessage);

      expect(webhook.sendToWebhook).toHaveBeenCalled();
      expect(delay.sleep).not.toHaveBeenCalled();
    });
  });

  describe("handleMessage", () => {
    it("should handle media message successfully", async () => {
      const mockMessage = {
        from: "4540360565@c.us",
        body: "Check this out",
        id: { _serialized: "msg1" },
        timestamp: 123456,
        hasMedia: true,
        reply: vi.fn().mockResolvedValue({}),
        downloadMedia: vi.fn().mockResolvedValue({
          mimetype: "image/jpeg",
          filename: "photo.jpg",
          data: "base64data",
        }),
      };

      vi.mocked(webhook.sendToWebhook).mockResolvedValue("Nice photo!");

      await handleMessage(mockMessage);

      expect(mockMessage.downloadMedia).toHaveBeenCalled();
      expect(webhook.sendToWebhook).toHaveBeenCalledWith({
        from: "4540360565@c.us",
        text: "Check this out",
        media: {
          data: "base64data",
          mimeType: "image/jpeg",
        },
        messageId: "msg1",
        timestamp: 123456,
      });
      expect(mockMessage.reply).toHaveBeenCalledWith("Nice photo!");
    });

    it("should handle failed media download", async () => {
      const mockMessage = {
        from: "4540360565@c.us",
        body: "",
        id: { _serialized: "msg1" },
        timestamp: 123456,
        hasMedia: true,
        reply: vi.fn().mockResolvedValue({}),
        downloadMedia: vi.fn().mockResolvedValue(undefined),
      };

      await handleMessage(mockMessage);

      expect(mockMessage.downloadMedia).toHaveBeenCalled();
      expect(mockMessage.reply).toHaveBeenCalledWith(
        "Sorry, I couldn't download that file.",
      );
      expect(webhook.sendToWebhook).not.toHaveBeenCalled();
    });

    it("should not reply if webhook returns null", async () => {
      const mockMessage = {
        from: "4540360565@c.us",
        body: "Look at this",
        id: { _serialized: "msg1" },
        timestamp: 123456,
        hasMedia: true,
        reply: vi.fn().mockResolvedValue({}),
        downloadMedia: vi.fn().mockResolvedValue({
          mimetype: "image/png",
          filename: null,
          data: "base64",
        }),
      };

      vi.mocked(webhook.sendToWebhook).mockResolvedValue(null);

      await handleMessage(mockMessage);

      expect(webhook.sendToWebhook).toHaveBeenCalledWith({
        from: "4540360565@c.us",
        text: "Look at this",
        media: {
          data: "base64",
          mimeType: "image/png",
        },
        messageId: "msg1",
        timestamp: 123456,
      });
      expect(delay.sleep).not.toHaveBeenCalled();
    });

    it("should handle text-only message", async () => {
      const mockMessage = {
        from: "4540360565@c.us",
        body: "Just a text message",
        id: { _serialized: "msg1" },
        timestamp: 123456,
        hasMedia: false,
        reply: vi.fn().mockResolvedValue({}),
        downloadMedia: vi.fn(),
      };

      vi.mocked(webhook.sendToWebhook).mockResolvedValue("Got it!");

      await handleMessage(mockMessage);

      expect(mockMessage.downloadMedia).not.toHaveBeenCalled();
      expect(webhook.sendToWebhook).toHaveBeenCalledWith({
        from: "4540360565@c.us",
        text: "Just a text message",
        media: undefined,
        messageId: "msg1",
        timestamp: 123456,
      });
      expect(mockMessage.reply).toHaveBeenCalledWith("Got it!");
    });
  });
});
