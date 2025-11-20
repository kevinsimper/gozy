import { expect, test, vi, beforeEach } from "vitest";
import { testClient } from "hono/testing";
import { whatsappWebhookRoutes } from "./whatsapp";
import { uploadAndCreateFile } from "../../lib/fileUpload";
import { handleWhatsappWebhook } from "../../lib/whatsapp-webhook-handler";
import { Ok, Err } from "@casperlabs/ts-results/esm/index";

vi.mock("../../lib/whatsapp-webhook-handler");
vi.mock("../../lib/fileUpload");

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(uploadAndCreateFile).mockResolvedValue({
    id: 1,
    publicId: "test-file-id",
    storageKey: "test-key",
    originalFilename: "test.jpg",
    mimeType: "image/jpeg",
    size: 1000,
    compressedSize: null,
    compression: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

const mockEnv = {
  DB: {} as D1Database,
  WHATSAPP_WEBHOOK_TOKEN: "test-token",
  GEMINI_API_KEY: "test-api-key",
  FILES: {
    put: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  } as unknown as R2Bucket,
  COOKIE_SECRET: "test-secret",
  RESEND_API_KEY: "test-resend-key",
};

let client: ReturnType<typeof testClient<typeof whatsappWebhookRoutes>>;

beforeEach(() => {
  client = testClient(whatsappWebhookRoutes, {
    env: mockEnv,
  });
});

test("webhook returns 400 for missing required fields", async () => {
  const res = await client.index.$post({
    form: {
      from: "4540360565@c.us",
    },
  });

  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body).toHaveProperty("error", "Invalid payload");
});

test("webhook processes text message successfully", async () => {
  vi.mocked(handleWhatsappWebhook).mockResolvedValue(
    Ok({ text: "Hej! Hvordan kan jeg hjælpe dig?" }),
  );

  const res = await client.index.$post({
    form: {
      from: "4540360565@c.us",
      text: "Hej",
      messageId: "msg123",
      timestamp: Date.now().toString(),
    },
  });

  expect(res.status).toBe(200);
  expect(handleWhatsappWebhook).toHaveBeenCalledWith(
    expect.anything(),
    "+4540360565",
    "Hej",
    undefined,
  );

  const body = await res.json();
  expect(body).toEqual({
    success: true,
    response: "Hej! Hvordan kan jeg hjælpe dig?",
  });
});

test("webhook handles media messages with file uploads", async () => {
  vi.mocked(handleWhatsappWebhook).mockResolvedValue(
    Ok({ text: "Jeg kan se dit billede!" }),
  );

  const fakeImageBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const buffer = Uint8Array.from(atob(fakeImageBase64), (char) =>
    char.charCodeAt(0),
  );
  const file = new File([buffer], "test.png", { type: "image/png" });

  const res = await client.index.$post({
    form: {
      from: "4540360565@c.us",
      text: "Se dette billede",
      media: file,
      messageId: "msg789",
      timestamp: Date.now().toString(),
    },
  });

  expect(res.status).toBe(200);
  expect(handleWhatsappWebhook).toHaveBeenCalledWith(
    expect.anything(),
    "+4540360565",
    "Se dette billede",
    expect.objectContaining({
      id: expect.any(Number),
      publicId: expect.any(String),
      storageKey: expect.any(String),
      mimeType: expect.any(String),
    }),
  );

  const body = await res.json();
  expect(body).toEqual({
    success: true,
    response: "Jeg kan se dit billede!",
  });
});

test("webhook handles image-only messages without text", async () => {
  vi.mocked(handleWhatsappWebhook).mockResolvedValue(
    Ok({ text: "Det er et flot billede!" }),
  );

  const fakeImageBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const buffer = Uint8Array.from(atob(fakeImageBase64), (char) =>
    char.charCodeAt(0),
  );
  const file = new File([buffer], "test.jpg", { type: "image/jpeg" });

  const res = await client.index.$post({
    form: {
      from: "4540360565@c.us",
      media: file,
      messageId: "msg790",
      timestamp: Date.now().toString(),
    },
  });

  expect(res.status).toBe(200);
  expect(handleWhatsappWebhook).toHaveBeenCalledWith(
    expect.anything(),
    "+4540360565",
    "",
    expect.objectContaining({
      id: expect.any(Number),
      publicId: expect.any(String),
      storageKey: expect.any(String),
      mimeType: expect.any(String),
    }),
  );

  const body = await res.json();
  expect(body).toEqual({
    success: true,
    response: "Det er et flot billede!",
  });
});

test("webhook extracts phone number correctly from WhatsApp ID", async () => {
  vi.mocked(handleWhatsappWebhook).mockResolvedValue(Ok({ text: "Svar" }));

  await client.index.$post({
    form: {
      from: "4512345678@c.us",
      text: "Test",
      messageId: "msg999",
      timestamp: Date.now().toString(),
    },
  });

  expect(handleWhatsappWebhook).toHaveBeenCalledWith(
    expect.anything(),
    "+4512345678",
    "Test",
    undefined,
  );
});

test("webhook handles errors gracefully", async () => {
  vi.mocked(handleWhatsappWebhook).mockResolvedValue(
    Err("Internal server error"),
  );

  const res = await client.index.$post({
    form: {
      from: "4540360565@c.us",
      text: "Test",
      messageId: "msg202",
      timestamp: Date.now().toString(),
    },
  });

  expect(res.status).toBe(500);
  const body = await res.json();
  expect(body).toHaveProperty("error");
});

test("webhook passes text message to conversation handler", async () => {
  vi.mocked(handleWhatsappWebhook).mockResolvedValue(
    Ok({ text: "AI response" }),
  );

  await client.index.$post({
    form: {
      from: "4540360565@c.us",
      text: "Hvad er din opgave?",
      messageId: "msg101",
      timestamp: Date.now().toString(),
    },
  });

  expect(handleWhatsappWebhook).toHaveBeenCalledWith(
    expect.anything(),
    "+4540360565",
    "Hvad er din opgave?",
    undefined,
  );
});
