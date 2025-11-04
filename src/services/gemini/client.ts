import { ContentListUnion, GoogleGenAI } from "@google/genai";

export type GeminiBindings = {
  GEMINI_API_KEY: string;
};

export const googleModels = {
  pro: "gemini-2.5-pro",
  flash: "gemini-2.5-flash-preview-09-2025",
  flashLite: "gemini-2.5-flash-lite-preview-09-2025",
};

export async function generateClient(c: { env: GeminiBindings }) {
  const apiKey = c.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
}

export async function generateResponse(
  c: { env: GeminiBindings },
  contents: ContentListUnion,
  systemInstruction?: string,
): Promise<string | undefined> {
  const response = await (
    await generateClient(c)
  ).models.generateContent({
    config: {
      systemInstruction:
        systemInstruction ||
        "Du er en hjælpsom assistant til taxachauffører i København. Svar kun med tekst, ikke markdown!",
    },
    model: googleModels.flash,
    contents,
  });
  return response.text;
}
