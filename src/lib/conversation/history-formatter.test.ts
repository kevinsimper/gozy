import { expect, test, vi, beforeEach } from "vitest";
import { formatConversationHistory } from "./history-formatter";
import { getMessagesWithFiles } from "../../models/message";
import type { MessageWithFile } from "../../models/message";

vi.mock("../../models/message");

const mockContext = {
  env: {
    DB: {} as D1Database,
    FILES: {
      get: vi.fn().mockResolvedValue(null),
    } as unknown as R2Bucket,
  },
} as Parameters<typeof formatConversationHistory>[0];

function createMockMessage(
  overrides: Partial<MessageWithFile> = {},
): MessageWithFile {
  return {
    id: 1,
    publicId: "test-id",
    userId: 1,
    role: "user",
    content: "Test message",
    fileId: null,
    sentByAdminId: null,
    sentDuringManualMode: false,
    createdAt: new Date(),
    file: null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

test("includes regular messages in conversation history", async () => {
  const messages: MessageWithFile[] = [
    createMockMessage({ id: 1, content: "Hello", role: "user" }),
    createMockMessage({ id: 2, content: "Hi there!", role: "assistant" }),
  ];

  vi.mocked(getMessagesWithFiles).mockResolvedValue(messages);

  const result = await formatConversationHistory(mockContext, 1, 10);

  expect(result).toHaveLength(2);
  expect(result[0]).toEqual({
    role: "user",
    parts: [{ text: "Hello" }],
  });
  expect(result[1]).toEqual({
    role: "model",
    parts: [{ text: "Hi there!" }],
  });
});

test("filters out messages sent during manual mode", async () => {
  const messages: MessageWithFile[] = [
    createMockMessage({ id: 1, content: "Before manual mode", role: "user" }),
    createMockMessage({
      id: 2,
      content: "During manual mode",
      role: "user",
      sentDuringManualMode: true,
    }),
    createMockMessage({
      id: 3,
      content: "Admin reply during manual",
      role: "assistant",
      sentDuringManualMode: true,
      sentByAdminId: 1,
    }),
    createMockMessage({ id: 4, content: "After manual mode", role: "user" }),
  ];

  vi.mocked(getMessagesWithFiles).mockResolvedValue(messages);

  const result = await formatConversationHistory(mockContext, 1, 10);

  expect(result).toHaveLength(2);
  expect(result[0].parts).toEqual([{ text: "Before manual mode" }]);
  expect(result[1].parts).toEqual([{ text: "After manual mode" }]);
});

test("filters out admin-sent messages even outside manual mode", async () => {
  const messages: MessageWithFile[] = [
    createMockMessage({ id: 1, content: "User question", role: "user" }),
    createMockMessage({
      id: 2,
      content: "Admin response",
      role: "assistant",
      sentByAdminId: 5,
    }),
    createMockMessage({ id: 3, content: "AI response", role: "assistant" }),
  ];

  vi.mocked(getMessagesWithFiles).mockResolvedValue(messages);

  const result = await formatConversationHistory(mockContext, 1, 10);

  expect(result).toHaveLength(2);
  expect(result[0].parts).toEqual([{ text: "User question" }]);
  expect(result[1].parts).toEqual([{ text: "AI response" }]);
});

test("filters out both manual mode and admin messages together", async () => {
  const messages: MessageWithFile[] = [
    createMockMessage({ id: 1, content: "Normal user msg", role: "user" }),
    createMockMessage({
      id: 2,
      content: "Manual mode user msg",
      role: "user",
      sentDuringManualMode: true,
    }),
    createMockMessage({
      id: 3,
      content: "Admin msg outside manual",
      role: "assistant",
      sentByAdminId: 1,
    }),
    createMockMessage({
      id: 4,
      content: "Admin msg during manual",
      role: "assistant",
      sentByAdminId: 1,
      sentDuringManualMode: true,
    }),
    createMockMessage({
      id: 5,
      content: "Normal AI response",
      role: "assistant",
    }),
  ];

  vi.mocked(getMessagesWithFiles).mockResolvedValue(messages);

  const result = await formatConversationHistory(mockContext, 1, 10);

  expect(result).toHaveLength(2);
  expect(result[0].parts).toEqual([{ text: "Normal user msg" }]);
  expect(result[1].parts).toEqual([{ text: "Normal AI response" }]);
});

test("returns empty array when all messages are filtered", async () => {
  const messages: MessageWithFile[] = [
    createMockMessage({
      id: 1,
      content: "Manual mode msg",
      role: "user",
      sentDuringManualMode: true,
    }),
    createMockMessage({
      id: 2,
      content: "Admin msg",
      role: "assistant",
      sentByAdminId: 1,
    }),
  ];

  vi.mocked(getMessagesWithFiles).mockResolvedValue(messages);

  const result = await formatConversationHistory(mockContext, 1, 10);

  expect(result).toHaveLength(0);
});

test("converts assistant role to model for Gemini API", async () => {
  const messages: MessageWithFile[] = [
    createMockMessage({ id: 1, content: "User msg", role: "user" }),
    createMockMessage({ id: 2, content: "Assistant msg", role: "assistant" }),
  ];

  vi.mocked(getMessagesWithFiles).mockResolvedValue(messages);

  const result = await formatConversationHistory(mockContext, 1, 10);

  expect(result[0].role).toBe("user");
  expect(result[1].role).toBe("model");
});
