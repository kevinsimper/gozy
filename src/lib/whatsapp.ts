import { z } from "zod";

const SendMessageRequestSchema = z.object({
  phoneNumber: z.string().min(1),
  message: z.string().min(1),
});

const SendMessageResponseSchema = z.object({
  success: z.boolean(),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

export async function sendWhatsAppMessage(
  botUrl: string,
  botToken: string,
  phoneNumber: string,
  message: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const requestBody = SendMessageRequestSchema.parse({
      phoneNumber,
      message,
    });

    const response = await fetch(`${botUrl}/api/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const parsedError = ErrorResponseSchema.safeParse(errorData);

      if (parsedError.success) {
        return {
          success: false,
          error: parsedError.data.details || parsedError.data.error,
        };
      }

      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const parsedResponse = SendMessageResponseSchema.safeParse(data);

    if (!parsedResponse.success) {
      return {
        success: false,
        error: "Invalid response from WhatsApp bot",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
