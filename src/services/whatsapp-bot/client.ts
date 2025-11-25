import { z } from "zod";
import type { Bindings } from "../../index";

const SuccessResponseSchema = z.object({
  success: z.boolean(),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

/**
 * WhatsApp Bot API client
 * @param c - Context with env bindings (WHATSAPP_BOT_URL, WHATSAPP_BOT_TOKEN)
 */
export function createWhatsAppBotClient(c: { env: Bindings }) {
  const botUrl = c.env.WHATSAPP_BOT_URL;
  const botToken = c.env.WHATSAPP_BOT_TOKEN;

  return {
    /**
     * POST to an endpoint with JSON body
     * @param endpoint - API endpoint path (e.g. "/api/send-message")
     * @param body - Request body to be JSON stringified
     */
    async post<T>(
      endpoint: string,
      body: T,
    ): Promise<{ success: boolean; error?: string }> {
      const response = await fetch(`${botUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${botToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const parsed = ErrorResponseSchema.parse(JSON.parse(text));
          return { success: false, error: parsed.details || parsed.error };
        } catch {
          return { success: false, error: `HTTP ${response.status}: ${text}` };
        }
      }

      const data = await response.json();
      const parsed = SuccessResponseSchema.safeParse(data);
      if (!parsed.success) {
        return { success: false, error: "Invalid response format" };
      }
      return { success: true };
    },
  };
}
