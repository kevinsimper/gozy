import { expect, test, describe, beforeEach, vi } from "vitest";
import { sendWhatsappMessage } from "./whatsapp-sender";
import type { Context } from "hono";

// Mock the dependencies
vi.mock("./whatsapp", () => ({
  sendWhatsAppMessage: vi.fn(),
}));

vi.mock("../models/whatsapp-message", () => ({
  createWhatsappMessage: vi.fn(),
}));

import { sendWhatsAppMessage as sendWhatsAppMessageService } from "./whatsapp";
import { createWhatsappMessage } from "../models/whatsapp-message";

describe("sendWhatsappMessage", () => {
  let mockContext: Context;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContext = {
      env: {
        DB: {} as D1Database,
        WHATSAPP_BOT_URL: "https://whatsapp.example.com",
        WHATSAPP_BOT_TOKEN: "test-token-123",
        WHATSAPP_ENABLED: "true",
      },
    } as unknown as Context;
  });

  test("sends WhatsApp message when enabled", async () => {
    vi.mocked(sendWhatsAppMessageService).mockResolvedValue({
      success: true,
    });

    vi.mocked(createWhatsappMessage).mockResolvedValue({
      id: 1,
      publicId: "test-123",
      phoneNumber: "+4512345678",
      message: "Test message",
      type: "whatsapp",
      status: "sent",
      userId: 100,
      mediaUrl: null,
      createdAt: new Date(),
    });

    const result = await sendWhatsappMessage(
      mockContext,
      "+4512345678",
      "Test message",
      100,
    );

    expect(result).toEqual({ success: true });

    // Verify the service was called with correct parameters
    expect(sendWhatsAppMessageService).toHaveBeenCalledWith(
      "https://whatsapp.example.com",
      "test-token-123",
      "+4512345678",
      "Test message",
      undefined,
    );

    // Verify message was logged to database
    expect(createWhatsappMessage).toHaveBeenCalledWith(
      mockContext,
      "+4512345678",
      "Test message",
      "sent",
      100,
      undefined,
    );
  });

  test("skips actual sending when WhatsApp is disabled", async () => {
    mockContext.env.WHATSAPP_ENABLED = "false";

    vi.mocked(createWhatsappMessage).mockResolvedValue({
      id: 1,
      publicId: "test-456",
      phoneNumber: "+4512345678",
      message: "Test message",
      type: "whatsapp",
      status: "sent",
      userId: null,
      mediaUrl: null,
      createdAt: new Date(),
    });

    const result = await sendWhatsappMessage(
      mockContext,
      "+4512345678",
      "Test message",
    );

    expect(result).toEqual({ success: true });

    // Service should not be called
    expect(sendWhatsAppMessageService).not.toHaveBeenCalled();

    // But message should still be logged
    expect(createWhatsappMessage).toHaveBeenCalledWith(
      mockContext,
      "+4512345678",
      "Test message",
      "sent",
      undefined,
      undefined,
    );
  });

  test("handles sending failures and logs them", async () => {
    vi.mocked(sendWhatsAppMessageService).mockResolvedValue({
      success: false,
      error: "Invalid phone number",
    });

    vi.mocked(createWhatsappMessage).mockResolvedValue({
      id: 1,
      publicId: "test-789",
      phoneNumber: "+45invalid",
      message: "Test message",
      type: "whatsapp",
      status: "failed",
      userId: null,
      mediaUrl: null,
      createdAt: new Date(),
    });

    const result = await sendWhatsappMessage(
      mockContext,
      "+45invalid",
      "Test message",
    );

    expect(result).toEqual({
      success: false,
      error: "Invalid phone number",
    });

    // Verify service was called
    expect(sendWhatsAppMessageService).toHaveBeenCalled();

    // Verify failure was logged with "failed" status
    expect(createWhatsappMessage).toHaveBeenCalledWith(
      mockContext,
      "+45invalid",
      "Test message",
      "failed",
      undefined,
      undefined,
    );
  });

  test("continues even if database logging fails", async () => {
    vi.mocked(sendWhatsAppMessageService).mockResolvedValue({
      success: true,
    });

    vi.mocked(createWhatsappMessage).mockRejectedValue(
      new Error("Database error"),
    );

    const result = await sendWhatsappMessage(
      mockContext,
      "+4512345678",
      "Test message",
      100,
    );

    // Should still return success even though logging failed
    expect(result).toEqual({ success: true });

    expect(sendWhatsAppMessageService).toHaveBeenCalled();
    expect(createWhatsappMessage).toHaveBeenCalled();
  });

  test("works without userId parameter", async () => {
    vi.mocked(sendWhatsAppMessageService).mockResolvedValue({
      success: true,
    });

    vi.mocked(createWhatsappMessage).mockResolvedValue({
      id: 1,
      publicId: "test-abc",
      phoneNumber: "+4512345678",
      message: "Test message",
      type: "whatsapp",
      status: "sent",
      userId: null,
      mediaUrl: null,
      createdAt: new Date(),
    });

    const result = await sendWhatsappMessage(
      mockContext,
      "+4512345678",
      "Test message",
    );

    expect(result).toEqual({ success: true });

    expect(createWhatsappMessage).toHaveBeenCalledWith(
      mockContext,
      "+4512345678",
      "Test message",
      "sent",
      undefined,
      undefined,
    );
  });

  test("handles long messages", async () => {
    const longMessage = "A".repeat(1000);

    vi.mocked(sendWhatsAppMessageService).mockResolvedValue({
      success: true,
    });

    vi.mocked(createWhatsappMessage).mockResolvedValue({
      id: 1,
      publicId: "test-def",
      phoneNumber: "+4512345678",
      message: longMessage,
      type: "whatsapp",
      status: "sent",
      userId: null,
      mediaUrl: null,
      createdAt: new Date(),
    });

    const result = await sendWhatsappMessage(
      mockContext,
      "+4512345678",
      longMessage,
    );

    expect(result).toEqual({ success: true });

    expect(sendWhatsAppMessageService).toHaveBeenCalledWith(
      "https://whatsapp.example.com",
      "test-token-123",
      "+4512345678",
      longMessage,
      undefined,
    );
  });
});
