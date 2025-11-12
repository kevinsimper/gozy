import { z } from "zod";
import { generateClient, googleModels } from "../../services/gemini/client";

const documentAnalysisResultSchema = z.object({
  documentType: z
    .enum([
      "taximeter_certificate",
      "vehicle_inspection",
      "taxi_id",
      "winter_tires",
      "drivers_license",
      "vehicle_registration",
      "insurance",
      "tax_card",
      "criminal_record",
      "leasing_agreement",
      "other",
    ])
    .nullable()
    .describe("The detected document type, or null if unclear"),
  expiryDate: z
    .string()
    .nullable()
    .describe(
      "The expiry date in ISO format (YYYY-MM-DD), or null if not found",
    ),
  confidence: z
    .enum(["high", "medium", "low"])
    .describe("Confidence level of the detection"),
  notes: z
    .string()
    .optional()
    .describe("Additional notes or context about the document"),
});

export type DocumentAnalysisResult = z.infer<
  typeof documentAnalysisResultSchema
>;

const DOCUMENT_ANALYSIS_PROMPT = `Du er en ekspert i at analysere dokumenter for taxachauffører i København.

Analyser dette billede og identificer:
1. **Dokumenttype**: Hvilket af disse dokumenter er det?
   - taximeter_certificate (Taximeterattest)
   - vehicle_inspection (Synsrapport)
   - taxi_id (Taxi ID)
   - winter_tires (Vinterdæk dokumentation)
   - drivers_license (Kørekort)
   - vehicle_registration (Registreringsattest)
   - insurance (Forsikring)
   - tax_card (Skattekort)
   - criminal_record (Straffeattest)
   - leasing_agreement (Leasingaftale)
   - other (Andet dokument)

2. **Udløbsdato**: Find udløbsdatoen hvis den findes på dokumentet. Svar i ISO format (YYYY-MM-DD).

3. **Sikkerhed**: Hvor sikker er du på din identifikation? (high/medium/low)

4. **Noter**: Eventuelle vigtige observationer

Returner dit svar som JSON i dette format:
{
  "documentType": "vehicle_inspection" eller null,
  "expiryDate": "2025-12-31" eller null,
  "confidence": "high" | "medium" | "low",
  "notes": "Eventuelle noter"
}`;

export async function analyzeDocument(
  c: { env: { GEMINI_API_KEY: string } },
  file: File,
): Promise<DocumentAnalysisResult> {
  const client = await generateClient(c);

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const response = await client.models.generateContent({
    config: {
      systemInstruction: DOCUMENT_ANALYSIS_PROMPT,
      responseMimeType: "application/json",
    },
    model: googleModels.flash,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
          {
            text: "Analyser dette dokument og returner resultatet som JSON.",
          },
        ],
      },
    ],
  });

  if (!response.text) {
    throw new Error("No response from Gemini API");
  }

  const parsed = documentAnalysisResultSchema.safeParse(
    JSON.parse(response.text),
  );

  if (!parsed.success) {
    throw new Error(`Failed to parse Gemini response: ${parsed.error.message}`);
  }

  return parsed.data;
}
