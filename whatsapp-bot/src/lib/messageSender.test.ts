import { describe, it, expect, vi } from "vitest";
import { sendMessage } from "./messageSender";

describe("messageSender", () => {
  describe("sendMessage", () => {
    it("should convert phone number and send message", async () => {
      const mockClient = {
        sendMessage: vi.fn().mockResolvedValue({}),
      };

      await sendMessage(mockClient, "+4540360565", "Test message");

      expect(mockClient.sendMessage).toHaveBeenCalledWith(
        "4540360565@c.us",
        "Test message",
      );
    });

    it("should handle phone numbers without +", async () => {
      const mockClient = {
        sendMessage: vi.fn().mockResolvedValue({}),
      };

      await sendMessage(mockClient, "4540360565", "Another test");

      expect(mockClient.sendMessage).toHaveBeenCalledWith(
        "4540360565@c.us",
        "Another test",
      );
    });

    it("should throw if client.sendMessage fails", async () => {
      const mockClient = {
        sendMessage: vi.fn().mockRejectedValue(new Error("Network error")),
      };

      await expect(
        sendMessage(mockClient, "+4540360565", "Test"),
      ).rejects.toThrow("Network error");
    });
  });
});
