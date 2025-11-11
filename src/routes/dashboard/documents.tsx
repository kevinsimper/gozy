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

const documentEditFields = [
  {
    name: "documentType",
    label: "Dokumenttype",
    htmlType: "select" as const,
    required: true,
    options: [
      { value: "", text: "Vælg dokumenttype" },
      { value: "taximeter_certificate", text: "Taximeterattest" },
      { value: "vehicle_inspection", text: "Synsrapport" },
      { value: "taxi_id", text: "Taxi ID" },
      { value: "winter_tires", text: "Vinterdæk" },
      { value: "drivers_license", text: "Kørekort" },
      { value: "vehicle_registration", text: "Registreringsattest" },
      { value: "insurance", text: "Forsikring" },
      { value: "tax_card", text: "Skattekort" },
      { value: "criminal_record", text: "Straffeattest" },
      { value: "leasing_agreement", text: "Leasingaftale" },
      { value: "other", text: "Andet" },
    ],
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

    return c.render(
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dokumenter</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Documents
            </h2>
            <a
              href={lk(AppLink.DashboardDocumentsUpload)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium no-underline inline-flex items-center gap-2"
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
              Upload Document
            </a>
          </div>
          {documents.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      Filename
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      Expiry Date
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      Size
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      Uploaded
                    </th>
                    <th className="text-left p-3 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => {
                    const isExpired =
                      doc.expiryDate && new Date(doc.expiryDate) < new Date();
                    const isExpiringSoon =
                      doc.expiryDate &&
                      !isExpired &&
                      doc.reminderDaysBefore &&
                      new Date(doc.expiryDate).getTime() - Date.now() <
                        doc.reminderDaysBefore * 24 * 60 * 60 * 1000;

                    return (
                      <tr key={doc.id} className="border-b border-gray-200">
                        <td className="p-3">
                          <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded text-sm">
                            {doc.documentType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-3">{doc.file.originalFilename}</td>
                        <td className="p-3">
                          {doc.expiryDate ? (
                            <span
                              className={`text-sm ${isExpired ? "text-red-600 font-semibold" : isExpiringSoon ? "text-orange-600 font-semibold" : "text-gray-700"}`}
                            >
                              {new Date(doc.expiryDate).toLocaleDateString(
                                "da-DK",
                              )}
                              {isExpired && " (udløbet)"}
                              {isExpiringSoon && " (snart udløb)"}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Ingen udløbsdato
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-gray-500">
                          {Math.round(doc.file.size / 1024)} KB
                        </td>
                        <td className="p-3 text-gray-500">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <a
                              href={lk(AppLink.DashboardDocumentsEdit, {
                                publicId: doc.publicId,
                              })}
                              className="text-blue-600 no-underline font-medium"
                            >
                              Edit
                            </a>
                            <a
                              href={lk(AppLink.DashboardDocumentsPreview, {
                                publicId: doc.publicId,
                              })}
                              target="_blank"
                              className="text-blue-600 no-underline font-medium"
                            >
                              View
                            </a>
                            <form
                              method="post"
                              action={lk(AppLink.DashboardDocumentsDelete, {
                                publicId: doc.publicId,
                              })}
                              className="inline"
                            >
                              <button
                                type="submit"
                                className="text-red-600 bg-transparent border-0 cursor-pointer font-medium p-0"
                              >
                                Delete
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>,
      { title: "My Documents" },
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

      if (!documentType || typeof documentType !== "string") {
        return c.redirect(
          lk(AppLink.DashboardDocumentsUpload, { query: { error: "no_type" } }),
        );
      }

      await uploadUserDocument(c, userId, file, documentType);

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
