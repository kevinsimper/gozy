import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeDocument } from "./analysis";
import type { DocumentAnalysisResult } from "./analysis";
import { generateClient } from "../../services/gemini/client";

vi.mock("../../services/gemini/client", () => {
  const mockGenerateContent = vi.fn();

  const mockGenerateClient = vi.fn().mockResolvedValue({
    models: {
      generateContent: mockGenerateContent,
    },
  });

  return {
    generateClient: mockGenerateClient,
    googleModels: {
      flash: "gemini-2.5-flash-preview-09-2025",
      pro: "gemini-2.5-pro",
      flashLite: "gemini-2.5-flash-lite-preview-09-2025",
    },
  };
});

describe("analyzeDocument", () => {
  const mockEnv = {
    GEMINI_API_KEY: "test-api-key",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract vehicle inspection document with expiry date", async () => {
    const mockFile = new File(["mock image data"], "synsrapport.jpg", {
      type: "image/jpeg",
    });

    const mockResponse: DocumentAnalysisResult = {
      documentType: "vehicle_inspection",
      expiryDate: "2025-12-31",
      confidence: "high",
      notes: "Clear and readable document",
    };

    vi.mocked(generateClient).mockResolvedValueOnce({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify(mockResponse),
        }),
      },
    } as any);

    const result = await analyzeDocument({ env: mockEnv }, mockFile);

    expect(result.documentType).toBe("vehicle_inspection");
    expect(result.expiryDate).toBe("2025-12-31");
    expect(result.confidence).toBe("high");
  });

  it("should return null for unclear document type", async () => {
    const mockFile = new File(["mock image data"], "unclear.jpg", {
      type: "image/jpeg",
    });

    const mockResponse: DocumentAnalysisResult = {
      documentType: null,
      expiryDate: null,
      confidence: "low",
      notes: "Document is too blurry to identify",
    };

    vi.mocked(generateClient).mockResolvedValueOnce({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify(mockResponse),
        }),
      },
    } as any);

    const result = await analyzeDocument({ env: mockEnv }, mockFile);

    expect(result.documentType).toBeNull();
    expect(result.expiryDate).toBeNull();
    expect(result.confidence).toBe("low");
  });

  it("should handle documents without expiry dates", async () => {
    const mockFile = new File(["mock image data"], "drivers-license.jpg", {
      type: "image/jpeg",
    });

    const mockResponse: DocumentAnalysisResult = {
      documentType: "drivers_license",
      expiryDate: null,
      confidence: "high",
      notes: "No expiry date visible on this document",
    };

    vi.mocked(generateClient).mockResolvedValueOnce({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify(mockResponse),
        }),
      },
    } as any);

    const result = await analyzeDocument({ env: mockEnv }, mockFile);

    expect(result.documentType).toBe("drivers_license");
    expect(result.expiryDate).toBeNull();
  });

  it("should throw error when Gemini API returns no response", async () => {
    const mockFile = new File(["mock image data"], "test.jpg", {
      type: "image/jpeg",
    });

    vi.mocked(generateClient).mockResolvedValueOnce({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: null,
        }),
      },
    } as any);

    await expect(analyzeDocument({ env: mockEnv }, mockFile)).rejects.toThrow(
      "No response from Gemini API",
    );
  });

  it("should throw error when response does not match schema", async () => {
    const mockFile = new File(["mock image data"], "test.jpg", {
      type: "image/jpeg",
    });

    const invalidResponse = {
      invalidField: "invalid",
    };

    vi.mocked(generateClient).mockResolvedValueOnce({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify(invalidResponse),
        }),
      },
    } as any);

    await expect(analyzeDocument({ env: mockEnv }, mockFile)).rejects.toThrow(
      "Failed to parse Gemini response",
    );
  });
});
