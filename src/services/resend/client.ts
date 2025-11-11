import { z } from "zod";

export const ResendEmailSchema = z.object({
  from: z.string(),
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string(),
  html: z.string().optional(),
  text: z.string().optional(),
  cc: z.union([z.string(), z.array(z.string())]).optional(),
  bcc: z.union([z.string(), z.array(z.string())]).optional(),
  replyTo: z.union([z.string(), z.array(z.string())]).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  attachments: z
    .array(
      z.object({
        content: z.string(),
        filename: z.string(),
        path: z.string().optional(),
        contentType: z.string().optional(),
      }),
    )
    .optional(),
  tags: z
    .array(
      z.object({
        name: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});

export type ResendEmail = z.infer<typeof ResendEmailSchema>;

export const ResendEmailResponseSchema = z.object({
  id: z.string(),
});

export type ResendEmailResponse = z.infer<typeof ResendEmailResponseSchema>;

export const ResendErrorSchema = z.object({
  message: z.string(),
  name: z.string(),
});

export type ResendError = z.infer<typeof ResendErrorSchema>;

export type ResendResponse<T = any> = {
  data: T | null;
  error: ResendError | null;
};

/**
 * Lightweight Resend API client
 * Replaces the official SDK to avoid React dependencies
 */
export class Resend {
  private apiKey: string;
  private baseUrl = "https://api.resend.com";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error(
        'Missing API key. Pass it to the constructor `new Resend("re_123")`',
      );
    }
    this.apiKey = apiKey;
  }

  /**
   * Send an email using Resend API
   */
  async send(email: ResendEmail): Promise<ResendResponse<ResendEmailResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(email),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          const parsedError = ResendErrorSchema.safeParse(errorJson);
          if (parsedError.success) {
            return { data: null, error: parsedError.data };
          }
          return {
            data: null,
            error: {
              name: "api_error",
              message:
                errorJson.message ||
                `Request failed with status ${response.status}`,
            },
          };
        } catch {
          return {
            data: null,
            error: {
              name: "api_error",
              message: `Request failed with status ${response.status}: ${response.statusText}`,
            },
          };
        }
      }

      const responseData = await response.json();
      const parsed = ResendEmailResponseSchema.safeParse(responseData);

      if (!parsed.success) {
        return {
          data: null,
          error: {
            name: "parse_error",
            message: "Invalid response format from Resend API",
          },
        };
      }

      return { data: parsed.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          name: "network_error",
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  /**
   * Compatibility layer for existing code
   * Maps to the same API as the official SDK
   */
  get emails() {
    return {
      send: (email: ResendEmail) => this.send(email),
    };
  }
}
