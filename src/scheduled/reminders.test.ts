import { expect, test, describe, beforeEach, vi } from "vitest";
import { handleDocumentReminders } from "./reminders";
import type { Bindings } from "../index";

// Mock the dependencies
vi.mock("../models/userDocument", () => ({
  findDocumentsDueForReminder: vi.fn(),
}));

vi.mock("../models/reminder", () => ({
  createReminder: vi.fn(),
}));

vi.mock("../lib/whatsapp-sender", () => ({
  sendWhatsappMessage: vi.fn(),
}));

import { findDocumentsDueForReminder } from "../models/userDocument";
import { createReminder } from "../models/reminder";
import { sendWhatsappMessage } from "../lib/whatsapp-sender";

describe("handleDocumentReminders", () => {
  let mockEnv: Bindings;
  let mockEvent: ScheduledEvent;
  let mockCtx: ExecutionContext;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup mock environment
    mockEnv = {
      DB: {} as D1Database,
      FILES: {} as R2Bucket,
      GEMINI_API_KEY: "test-key",
      COOKIE_SECRET: "test-secret",
      GOZY_API_KEY: "test-token",
      RESEND_API_KEY: "test-resend-key",
      WHATSAPP_BOT_TOKEN: "test-whatsapp-token",
      WHATSAPP_BOT_URL: "https://test.example.com",
      WHATSAPP_ENABLED: "true",
      DEV: "false",
      ENVIRONMENT: "test",
    };

    mockEvent = {
      scheduledTime: Date.now(),
      cron: "0 8 * * *",
    } as ScheduledEvent;

    mockCtx = {
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn(),
    } as unknown as ExecutionContext;
  });

  test("sends WhatsApp reminders with correct formatting", async () => {
    const mockDocuments = [
      {
        id: 1,
        publicId: "doc-123",
        userId: 101,
        fileId: 1,
        documentType: "Taxi_tilladelse_København",
        expiryDate: new Date("2025-01-05"),
        description: "Husk at forny",
        reminderDaysBefore: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 101,
          name: "Lars Hansen",
          phoneNumber: "+4512345678",
        },
      },
      {
        id: 2,
        publicId: "doc-456",
        userId: 102,
        fileId: 2,
        documentType: "Forsikring",
        expiryDate: new Date("2025-11-30"),
        description: null,
        reminderDaysBefore: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 102,
          name: "Anna Nielsen",
          phoneNumber: "+4587654321",
        },
      },
    ];

    vi.mocked(findDocumentsDueForReminder).mockResolvedValue(mockDocuments);
    vi.mocked(sendWhatsappMessage).mockResolvedValue({ success: true });
    vi.mocked(createReminder).mockResolvedValue({
      id: 1,
      userId: 101,
      documentId: 1,
      sentAt: new Date(),
    });

    await handleDocumentReminders(mockEvent, mockEnv, mockCtx);

    expect(findDocumentsDueForReminder).toHaveBeenCalledWith({ env: mockEnv });
    expect(sendWhatsappMessage).toHaveBeenCalledTimes(2);
    expect(createReminder).toHaveBeenCalledTimes(2);

    expect(sendWhatsappMessage).toHaveBeenCalledWith(
      { env: mockEnv },
      "+4512345678",
      expect.stringContaining("Hej Lars Hansen!"),
      101,
    );
    expect(sendWhatsappMessage).toHaveBeenCalledWith(
      { env: mockEnv },
      "+4512345678",
      expect.stringContaining("Taxi tilladelse København"),
      101,
    );
    expect(sendWhatsappMessage).toHaveBeenCalledWith(
      { env: mockEnv },
      "+4512345678",
      expect.stringContaining("5.1.2025"),
      101,
    );
    expect(sendWhatsappMessage).toHaveBeenCalledWith(
      { env: mockEnv },
      "+4512345678",
      expect.stringContaining("Note: Husk at forny"),
      101,
    );
    expect(sendWhatsappMessage).toHaveBeenCalledWith(
      { env: mockEnv },
      "+4512345678",
      expect.stringContaining("https://gozy.dk/dashboard/documents"),
      101,
    );
    expect(sendWhatsappMessage).toHaveBeenCalledWith(
      { env: mockEnv },
      "+4512345678",
      expect.not.stringContaining("_"),
      101,
    );

    expect(sendWhatsappMessage).toHaveBeenCalledWith(
      { env: mockEnv },
      "+4587654321",
      expect.stringContaining("Hej Anna Nielsen!"),
      102,
    );
    expect(sendWhatsappMessage).toHaveBeenCalledWith(
      { env: mockEnv },
      "+4587654321",
      expect.not.stringContaining("Note:"),
      102,
    );
  });

  test("handles errors gracefully", async () => {
    const mockDocuments = [
      {
        id: 1,
        publicId: "doc-123",
        userId: 101,
        fileId: 1,
        documentType: "Kørekort",
        expiryDate: new Date("2025-12-31"),
        description: null,
        reminderDaysBefore: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 101,
          name: "Lars Hansen",
          phoneNumber: "+4512345678",
        },
      },
      {
        id: 2,
        publicId: "doc-456",
        userId: 102,
        fileId: 2,
        documentType: "Forsikring",
        expiryDate: new Date("2025-11-30"),
        description: null,
        reminderDaysBefore: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 102,
          name: "Anna Nielsen",
          phoneNumber: "+4587654321",
        },
      },
    ];

    vi.mocked(findDocumentsDueForReminder).mockResolvedValue(mockDocuments);
    vi.mocked(sendWhatsappMessage)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ success: false, error: "Invalid number" });
    vi.mocked(createReminder).mockResolvedValue({
      id: 1,
      userId: 102,
      documentId: 2,
      sentAt: new Date(),
    });

    await handleDocumentReminders(mockEvent, mockEnv, mockCtx);

    expect(sendWhatsappMessage).toHaveBeenCalledTimes(2);
    expect(createReminder).not.toHaveBeenCalled();
  });
});
