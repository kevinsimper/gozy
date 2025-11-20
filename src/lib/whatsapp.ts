import { z } from "zod";

const SendMessageRequestSchema = z.object({
  phoneNumber: z.string().min(1),
  message: z.string().min(1),
  mediaUrl: z.string().url().optional(),
  caption: z.string().optional(),
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
  mediaUrl?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const requestBody = SendMessageRequestSchema.parse({
      phoneNumber,
      message,
      mediaUrl,
      caption: mediaUrl ? message : undefined,
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
      let errorData;
      const responseText = await response.text();

      try {
        errorData = JSON.parse(responseText);
      } catch {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}. Response: ${responseText.substring(0, 200)}`,
        };
      }

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

    const responseText = await response.text();
    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      return {
        success: false,
        error: `Invalid JSON response from WhatsApp bot. Response: ${responseText.substring(0, 200)}. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }

    const parsedResponse = SendMessageResponseSchema.safeParse(data);

    if (!parsedResponse.success) {
      return {
        success: false,
        error: `Invalid response format from WhatsApp bot. Expected {success: boolean}, got: ${responseText.substring(0, 200)}`,
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
