import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { desc, eq } from "drizzle-orm";
import { filesTable, documentTestEvalsTable } from "../../db/schema";
import { requireAdmin } from "../../lib/adminAuth";
import { DocumentTestView } from "../../views/admin/documentTest";
import { DocumentTestDetail } from "../../views/admin/documentTestDetail";
import { AppLink, lk } from "../../lib/links";
import { html } from "hono/html";
import { Bindings } from "../..";
import { buildZodSchema } from "../../services/hform/formbuilder";
import { HForm } from "../../services/hform/form";
import { z } from "zod";
import { DOCUMENT_TYPES } from "../../lib/documentTypes";

const expectedValuesFields = [
  {
    name: "expectedDocumentType",
    label: "Expected Document Type",
    htmlType: "select" as const,
    options: [{ value: "", text: "Not set" }, ...DOCUMENT_TYPES],
    zodSchema: z.string().optional(),
  },
  {
    name: "expectedExpiryDate",
    label: "Expected Expiry Date",
    htmlType: "date" as const,
    zodSchema: z.string().optional(),
  },
  {
    name: "isCorrect",
    label: "Is Correct?",
    htmlType: "select" as const,
    options: [
      { value: "", text: "Not evaluated" },
      { value: "true", text: "Correct" },
      { value: "false", text: "Incorrect" },
    ],
    zodSchema: z.string().optional(),
  },
] as const;

const {
  schema: expectedValuesSchema,
  formDefinition: expectedValuesFormDefinition,
} = buildZodSchema(expectedValuesFields);

export const documentTestRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const db = drizzle(c.env.DB);

    const evals = await db
      .select({
        id: documentTestEvalsTable.id,
        fileId: documentTestEvalsTable.fileId,
        geminiDocumentType: documentTestEvalsTable.geminiDocumentType,
        geminiExpiryDate: documentTestEvalsTable.geminiExpiryDate,
        geminiConfidence: documentTestEvalsTable.geminiConfidence,
        geminiNotes: documentTestEvalsTable.geminiNotes,
        expectedDocumentType: documentTestEvalsTable.expectedDocumentType,
        expectedExpiryDate: documentTestEvalsTable.expectedExpiryDate,
        isCorrect: documentTestEvalsTable.isCorrect,
        createdAt: documentTestEvalsTable.createdAt,
        file: filesTable,
      })
      .from(documentTestEvalsTable)
      .innerJoin(filesTable, eq(documentTestEvalsTable.fileId, filesTable.id))
      .orderBy(desc(documentTestEvalsTable.createdAt))
      .all();

    const latestResult = evals.length > 0 ? evals[0] : undefined;

    return c.render(
      <DocumentTestView evals={evals} latestResult={latestResult} />,
      {
        title: "Document Extraction Test - Admin - Gozy",
      },
    );
  })
  .post("/upload", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.redirect(lk(AppLink.AdminDocumentTest));
    }

    const db = drizzle(c.env.DB);

    const arrayBuffer = await file.arrayBuffer();
    const compressedData = arrayBuffer;

    const storageKey = `test-documents/${Date.now()}-${file.name}`;
    await c.env.FILES.put(storageKey, compressedData);

    const fileRecord = await db
      .insert(filesTable)
      .values({
        storageKey,
        originalFilename: file.name,
        mimeType: file.type,
        size: arrayBuffer.byteLength,
      })
      .returning()
      .get();

    const reconstructedFile = new File([arrayBuffer], file.name, {
      type: file.type,
    });

    const { analyzeDocument } = await import("../../lib/documents/analysis");
    const analysisResult = await analyzeDocument(c, reconstructedFile);

    await db.insert(documentTestEvalsTable).values({
      fileId: fileRecord.id,
      geminiDocumentType: analysisResult.documentType,
      geminiExpiryDate: analysisResult.expiryDate,
      geminiConfidence: analysisResult.confidence,
      geminiNotes: analysisResult.notes,
    });

    return c.redirect(lk(AppLink.AdminDocumentTest));
  })
  .get("/:id", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const id = parseInt(c.req.param("id"), 10);
    const db = drizzle(c.env.DB);

    const testEval = await db
      .select({
        id: documentTestEvalsTable.id,
        fileId: documentTestEvalsTable.fileId,
        geminiDocumentType: documentTestEvalsTable.geminiDocumentType,
        geminiExpiryDate: documentTestEvalsTable.geminiExpiryDate,
        geminiConfidence: documentTestEvalsTable.geminiConfidence,
        geminiNotes: documentTestEvalsTable.geminiNotes,
        expectedDocumentType: documentTestEvalsTable.expectedDocumentType,
        expectedExpiryDate: documentTestEvalsTable.expectedExpiryDate,
        isCorrect: documentTestEvalsTable.isCorrect,
        createdAt: documentTestEvalsTable.createdAt,
        file: filesTable,
      })
      .from(documentTestEvalsTable)
      .innerJoin(filesTable, eq(documentTestEvalsTable.fileId, filesTable.id))
      .where(eq(documentTestEvalsTable.id, id))
      .get();

    if (!testEval) {
      return c.html(
        html`
          <!DOCTYPE html>
          <html lang="da">
            <head>
              <meta charset="UTF-8" />
              <title>Test Not Found</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            </head>
            <body
              class="bg-black text-white min-h-screen flex items-center justify-center"
            >
              <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">Test Not Found</h1>
                <p class="text-gray-400 mb-6">
                  No test result found with ID ${id}.
                </p>
                <a
                  href=${lk(AppLink.AdminDocumentTest)}
                  class="text-blue-500 hover:underline"
                  >Back to Document Test</a
                >
              </div>
            </body>
          </html>
        `,
        404,
      );
    }

    const expectedValuesForm = HForm(expectedValuesFormDefinition, {
      id: "expected-values-form",
      hxPost: `/admin/document-test/${id}/update`,
      hxTarget: "#update-form-container",
      hxSwap: "innerHTML",
      hxIndicator: "#update-spinner",
    });

    const formHtml = expectedValuesForm.render({
      expectedDocumentType: testEval.expectedDocumentType || "",
      expectedExpiryDate: testEval.expectedExpiryDate || "",
      isCorrect:
        testEval.isCorrect === null
          ? ""
          : testEval.isCorrect
            ? "true"
            : "false",
    });

    return c.render(
      <DocumentTestDetail
        testEval={testEval}
        updateFormHtml={await formHtml}
      />,
      {
        title: `Test #${id} - Admin - Gozy`,
      },
    );
  })
  .post("/:id/update", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const id = parseInt(c.req.param("id"), 10);
    const db = drizzle(c.env.DB);

    const testEval = await db
      .select()
      .from(documentTestEvalsTable)
      .where(eq(documentTestEvalsTable.id, id))
      .get();

    if (!testEval) {
      return c.notFound();
    }

    const expectedValuesForm = HForm(expectedValuesFormDefinition, {
      id: "expected-values-form",
      hxPost: `/admin/document-test/${id}/update`,
      hxTarget: "#update-form-container",
      hxSwap: "innerHTML",
      hxIndicator: "#update-spinner",
    });

    const body = await c.req.parseBody();
    const parseResult = expectedValuesSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = expectedValuesForm.handleValidation(parseResult);
      const formHtml = expectedValuesForm.render(body, errors);
      return c.html(formHtml);
    }

    await db
      .update(documentTestEvalsTable)
      .set({
        expectedDocumentType: parseResult.data.expectedDocumentType || null,
        expectedExpiryDate: parseResult.data.expectedExpiryDate || null,
        isCorrect:
          parseResult.data.isCorrect === "true"
            ? true
            : parseResult.data.isCorrect === "false"
              ? false
              : null,
      })
      .where(eq(documentTestEvalsTable.id, id));

    const updatedTestEval = await db
      .select()
      .from(documentTestEvalsTable)
      .where(eq(documentTestEvalsTable.id, id))
      .get();

    if (!updatedTestEval) {
      return c.notFound();
    }

    const formHtml = expectedValuesForm.render({
      expectedDocumentType: updatedTestEval.expectedDocumentType || "",
      expectedExpiryDate: updatedTestEval.expectedExpiryDate || "",
      isCorrect:
        updatedTestEval.isCorrect === null
          ? ""
          : updatedTestEval.isCorrect
            ? "true"
            : "false",
    });

    const successFormHtml = (
      <div>
        <div class="mb-4 rounded bg-green-900/30 border border-green-700 px-4 py-3 text-green-400 text-sm">
          Expected values updated successfully
        </div>
        {formHtml}
        <span id="update-spinner" class="htmx-indicator text-gray-400">
          Updating...
        </span>
      </div>
    );
    return c.html(successFormHtml);
  })
  .get("/:id/preview", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const id = parseInt(c.req.param("id"), 10);
    const db = drizzle(c.env.DB);

    const testEval = await db
      .select({
        fileId: documentTestEvalsTable.fileId,
        file: filesTable,
      })
      .from(documentTestEvalsTable)
      .innerJoin(filesTable, eq(documentTestEvalsTable.fileId, filesTable.id))
      .where(eq(documentTestEvalsTable.id, id))
      .get();

    if (!testEval) {
      return c.notFound();
    }

    const fileObject = await c.env.FILES.get(testEval.file.storageKey);

    if (!fileObject) {
      return c.notFound();
    }

    const encodedFilename = encodeURIComponent(testEval.file.originalFilename);
    return c.body(fileObject.body, {
      headers: {
        "Content-Type": testEval.file.mimeType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodedFilename}`,
      },
    });
  });
