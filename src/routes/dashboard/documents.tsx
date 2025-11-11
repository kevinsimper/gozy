import { Hono } from "hono";
import { z } from "zod";
import { getUserFromCookie } from "../../services/auth";
import { findUserById } from "../../models/user";
import { UploadPage } from "../../views/dashboard/upload";
import { DocumentEditPage } from "../../views/dashboard/documentEdit";
import {
  findUserDocumentsByUserId,
  findUserDocumentByPublicId,
  updateUserDocument,
} from "../../models/userDocument";
import {
  uploadUserDocument,
  deleteUserDocumentWithFile,
} from "../../lib/userDocument";
import { AppLink, lk } from "../../lib/links";
import { buildZodSchema } from "../../services/hform/formbuilder";
import { HForm } from "../../services/hform/form";
import type { Bindings } from "../../index";
import { DOCUMENT_TYPES } from "../../lib/documentTypes";
import {
  ViewToggle,
  CardsView,
  TableView,
} from "../../views/dashboard/documentsView";

const documentEditFields = [
  {
    name: "documentType",
    label: "Dokumenttype",
    htmlType: "select" as const,
    required: true,
    options: [{ value: "", text: "Vælg dokumenttype" }, ...DOCUMENT_TYPES],
    zodSchema: z.string().min(1, "Dokumenttype er påkrævet"),
  },
  {
    name: "expiryDate",
    label: "Udløbsdato",
    htmlType: "date" as const,
    zodSchema: z.string().optional(),
  },
  {
    name: "reminderDaysBefore",
    label: "Påmind dage før udløb",
    htmlType: "number" as const,
    placeholder: "f.eks. 60 for forsikring",
    zodSchema: z.coerce.number().int().min(1).optional(),
  },
  {
    name: "description",
    label: "Beskrivelse (valgfri)",
    htmlType: "textarea" as const,
    rows: 4,
    placeholder: "Tilføj noter om dokumentet",
    zodSchema: z.string().optional(),
  },
] as const;

const {
  schema: documentEditSchema,
  formDefinition: documentEditFormDefinition,
} = buildZodSchema(documentEditFields);

export const documentsRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }
    const user = await findUserById(c, userId);

    if (!user) {
      return c.redirect(lk(AppLink.Login));
    }

    const documents = await findUserDocumentsByUserId(c, userId);
    const viewParam = c.req.query("view");
    const currentView: "cards" | "table" =
      viewParam === "table" ? "table" : "cards";

    return c.render(
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Dokumenter</h1>
            <ViewToggle currentView={currentView} />
          </div>
          <a
            href={lk(AppLink.DashboardDocumentsUpload)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium no-underline inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload dokument
          </a>
        </div>

        {currentView === "cards" ? (
          <CardsView documents={documents} />
        ) : (
          <TableView documents={documents} />
        )}
      </div>,
      { title: "Mine dokumenter" },
    );
  })
  .get("/upload", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    return c.render(<UploadPage />, { title: "Upload Document" });
  })
  .post("/upload", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    try {
      const formData = await c.req.formData();
      const file = formData.get("file");
      const documentType = formData.get("documentType");

      if (!file || !(file instanceof File)) {
        return c.redirect(
          lk(AppLink.DashboardDocumentsUpload, { query: { error: "no_file" } }),
        );
      }

      await uploadUserDocument(
        c,
        userId,
        file,
        documentType && typeof documentType === "string"
          ? documentType
          : undefined,
      );

      return c.redirect(lk(AppLink.DashboardDocuments));
    } catch (error) {
      console.error("Upload error:", error);
      return c.redirect(
        lk(AppLink.DashboardDocumentsUpload, {
          query: { error: "upload_failed" },
        }),
      );
    }
  })
  .get("/:publicId/preview", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }
    const publicId = c.req.param("publicId");

    try {
      const document = await findUserDocumentByPublicId(c, publicId);

      if (!document || document.userId !== userId) {
        return c.notFound();
      }

      const fileObject = await c.env.FILES.get(document.file.storageKey);

      if (!fileObject) {
        return c.notFound();
      }

      const encodedFilename = encodeURIComponent(
        document.file.originalFilename,
      );
      return c.body(fileObject.body, {
        headers: {
          "Content-Type": document.file.mimeType,
          "Content-Disposition": `inline; filename*=UTF-8''${encodedFilename}`,
        },
      });
    } catch (error) {
      console.error("Preview error:", error);
      return c.notFound();
    }
  })
  .post("/:publicId/delete", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }
    const publicId = c.req.param("publicId");

    try {
      await deleteUserDocumentWithFile(c, userId, publicId);
      return c.redirect(lk(AppLink.DashboardDocuments));
    } catch (error) {
      console.error("Delete error:", error);
      return c.redirect(
        lk(AppLink.DashboardDocuments, { query: { error: "delete_failed" } }),
      );
    }
  })
  .get("/:publicId/edit", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }
    const publicId = c.req.param("publicId");

    const document = await findUserDocumentByPublicId(c, publicId);

    if (!document || document.userId !== userId) {
      return c.notFound();
    }

    const documentEditForm = HForm(documentEditFormDefinition, {
      id: "document-form",
      hxPost: `/dashboard/documents/${publicId}/edit`,
      hxTarget: "#document-form-container",
      hxSwap: "innerHTML",
      hxIndicator: "#document-spinner",
    });

    const formHtml = documentEditForm.render({
      documentType: document.documentType,
      expiryDate: document.expiryDate
        ? new Date(document.expiryDate).toISOString().split("T")[0]
        : "",
      reminderDaysBefore: document.reminderDaysBefore
        ? document.reminderDaysBefore
        : undefined,
      description: document.description || "",
    });

    return c.render(
      <DocumentEditPage document={document} formHtml={formHtml} />,
      {
        title: "Rediger dokument",
      },
    );
  })
  .post("/:publicId/edit", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }
    const publicId = c.req.param("publicId");

    const document = await findUserDocumentByPublicId(c, publicId);

    if (!document || document.userId !== userId) {
      return c.notFound();
    }

    const documentEditForm = HForm(documentEditFormDefinition, {
      id: "document-form",
      hxPost: `/dashboard/documents/${publicId}/edit`,
      hxTarget: "#document-form-container",
      hxSwap: "innerHTML",
      hxIndicator: "#document-spinner",
    });

    const body = await c.req.parseBody();
    const parseResult = documentEditSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = documentEditForm.handleValidation(parseResult);
      const formHtml = documentEditForm.render(body, errors);
      return c.html(formHtml);
    }

    await updateUserDocument(c, publicId, {
      documentType: parseResult.data.documentType,
      expiryDate: parseResult.data.expiryDate
        ? new Date(parseResult.data.expiryDate)
        : null,
      reminderDaysBefore: parseResult.data.reminderDaysBefore || null,
      description: parseResult.data.description || null,
    });

    const updatedDocument = await findUserDocumentByPublicId(c, publicId);
    if (!updatedDocument) {
      return c.notFound();
    }

    const formHtml = documentEditForm.render({
      documentType: updatedDocument.documentType,
      expiryDate: updatedDocument.expiryDate
        ? new Date(updatedDocument.expiryDate).toISOString().split("T")[0]
        : "",
      reminderDaysBefore: updatedDocument.reminderDaysBefore
        ? updatedDocument.reminderDaysBefore
        : undefined,
      description: updatedDocument.description || "",
    });

    const successFormHtml = (
      <div>
        <div className="mb-4 rounded bg-green-100 border border-green-300 px-4 py-3 text-green-700 text-sm">
          Dokument opdateret succesfuldt
        </div>
        {formHtml}
        <span id="document-spinner" className="htmx-indicator">
          Behandler...
        </span>
      </div>
    );
    return c.html(successFormHtml);
  });
