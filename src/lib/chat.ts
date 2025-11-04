import { getChatSystemPrompt } from "./prompts";
import { generateResponse } from "../services/gemini/client";
import type { Context } from "hono";

type ChatContext = {
  Bindings: {
    GEMINI_API_KEY: string;
  };
};

type DocumentData = {
  filename: string;
  mimeType: string;
  data: string;
  documentType: string;
};

export async function sendMessage<Env extends ChatContext>(
  c: Context<Env>,
  message: string,
  documents?: Array<DocumentData>,
): Promise<string> {
  const systemPrompt = getChatSystemPrompt();

  let content: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  >;

  if (documents && documents.length > 0) {
    content = [];
    documents.forEach((doc, index) => {
      const typeLabel = doc.documentType.replace(/_/g, " ");
      content.push({
        text: `File ${index + 1} - ${typeLabel} (${doc.filename}):`,
      });
      content.push({
        inlineData: {
          mimeType: doc.mimeType,
          data: doc.data,
        },
      });
    });
    content.push({ text: message });
  } else {
    content = [{ text: message }];
  }

  const response = await generateResponse(c, content, systemPrompt);
  return response || "Beklager, jeg kunne ikke behandle din besked.";
}
