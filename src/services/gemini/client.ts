import {
  ContentListUnion,
  GoogleGenAI,
  FunctionDeclaration,
  FunctionCall,
} from "@google/genai";

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

export type GenerateResponseResult = {
  text?: string;
  functionCalls?: FunctionCall[];
};

export async function generateResponse(
  c: { env: GeminiBindings },
  contents: ContentListUnion,
  systemInstruction?: string,
  tools?: FunctionDeclaration[],
): Promise<GenerateResponseResult> {
  const client = await generateClient(c);
  const response = await client.models.generateContent({
    config: {
      systemInstruction:
        systemInstruction ||
        "Du er en hjælpsom assistant til taxachauffører i København. Svar ALTID med ren tekst uden markdown formatering. Brug ALDRIG *, #, _, eller andre markdown tegn.",
      tools: tools
        ? [
            {
              functionDeclarations: tools,
            },
          ]
        : undefined,
    },
    model: googleModels.flash,
    contents,
  });

  return {
    text: response.text,
    functionCalls: response.functionCalls,
  };
}
