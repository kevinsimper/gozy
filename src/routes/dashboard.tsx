import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { getUserFromCookie } from "../services/auth";
import { findUserById } from "../models/user";
import { Layout } from "../views/layout";
import { DashboardPage } from "../views/dashboard";
import { findUserDocumentsByUserId } from "../models/userDocument";
import {
  uploadUserDocument,
  deleteUserDocumentWithFile,
} from "../lib/userDocument";

type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
  FILES: R2Bucket;
};

declare module "hono" {
  interface ContextRenderer {
    (content: string | Promise<string>, props: { title: string }): Response;
  }
}

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>()
  .use(
    "*",
    jsxRenderer(
      ({ children, title }) => {
        return <Layout title={title}>{children}</Layout>;
      },
      {
        docType: true,
      },
    ),
  )
  .get("/", async (c) => {
    const userIdStr = await getUserFromCookie(c);

    if (!userIdStr) {
      return c.redirect("/login");
    }

    const userId = parseInt(userIdStr, 10);
    const user = await findUserById(c, userId);

    if (!user) {
      return c.redirect("/login");
    }

    return c.render(<DashboardPage user={user} />, {
      title: "Gozy Dashboard",
    });
  })
  .get("/documents", async (c) => {
    const userIdStr = await getUserFromCookie(c);

    if (!userIdStr) {
      return c.redirect("/login");
    }

    const userId = parseInt(userIdStr, 10);
    const user = await findUserById(c, userId);

    if (!user) {
      return c.redirect("/login");
    }

    const documents = await findUserDocumentsByUserId(c, userId);

    return c.render(
      <div style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
        <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem;">
          My Documents
        </h1>

        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 2rem;">
          <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">
            Upload Document
          </h2>
          <form
            method="post"
            action="/dashboard/documents"
            enctype="multipart/form-data"
            style="display: flex; flex-direction: column; gap: 1rem;"
          >
            <div>
              <label
                for="file"
                style="display: block; font-weight: 500; margin-bottom: 0.5rem;"
              >
                Choose File
              </label>
              <input
                type="file"
                name="file"
                id="file"
                required
                style="display: block; width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem;"
              />
            </div>
            <div>
              <label
                for="documentType"
                style="display: block; font-weight: 500; margin-bottom: 0.5rem;"
              >
                Document Type
              </label>
              <select
                name="documentType"
                id="documentType"
                required
                style="display: block; width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 0.375rem; background: white;"
              >
                <option value="drivers_license">Driver's License</option>
                <option value="vehicle_registration">
                  Vehicle Registration
                </option>
                <option value="insurance">Insurance</option>
                <option value="tax_card">Tax Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              style="background: #2563eb; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; font-weight: 500; cursor: pointer; width: fit-content;"
            >
              Upload Document
            </button>
          </form>
        </div>

        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem;">
          <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">
            Your Documents
          </h2>
          {documents.length === 0 ? (
            <p style="color: #6b7280; padding: 2rem; text-align: center;">
              No documents uploaded yet.
            </p>
          ) : (
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e7eb;">
                    <th style="text-align: left; padding: 0.75rem; font-weight: 600; color: #374151;">
                      Type
                    </th>
                    <th style="text-align: left; padding: 0.75rem; font-weight: 600; color: #374151;">
                      Filename
                    </th>
                    <th style="text-align: left; padding: 0.75rem; font-weight: 600; color: #374151;">
                      Size
                    </th>
                    <th style="text-align: left; padding: 0.75rem; font-weight: 600; color: #374151;">
                      Uploaded
                    </th>
                    <th style="text-align: left; padding: 0.75rem; font-weight: 600; color: #374151;">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 0.75rem;">
                        <span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.875rem;">
                          {doc.documentType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td style="padding: 0.75rem;">
                        {doc.file.originalFilename}
                      </td>
                      <td style="padding: 0.75rem; color: #6b7280;">
                        {Math.round(doc.file.size / 1024)} KB
                      </td>
                      <td style="padding: 0.75rem; color: #6b7280;">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>
                      <td style="padding: 0.75rem;">
                        <div style="display: flex; gap: 0.5rem;">
                          <a
                            href={`/files/${doc.file.publicId}`}
                            target="_blank"
                            style="color: #2563eb; text-decoration: none; font-weight: 500;"
                          >
                            View
                          </a>
                          <form
                            method="post"
                            action={`/dashboard/documents/${doc.publicId}/delete`}
                            style="display: inline;"
                          >
                            <button
                              type="submit"
                              style="color: #dc2626; background: none; border: none; cursor: pointer; font-weight: 500; padding: 0;"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>,
      { title: "My Documents" },
    );
  })
  .post("/documents", async (c) => {
    const userIdStr = await getUserFromCookie(c);

    if (!userIdStr) {
      return c.redirect("/login");
    }

    const userId = parseInt(userIdStr, 10);

    try {
      const formData = await c.req.formData();
      const file = formData.get("file");
      const documentType = formData.get("documentType");

      if (!file || !(file instanceof File)) {
        return c.redirect("/dashboard/documents?error=no_file");
      }

      if (!documentType || typeof documentType !== "string") {
        return c.redirect("/dashboard/documents?error=no_type");
      }

      await uploadUserDocument(c, userId, file, documentType);

      return c.redirect("/dashboard/documents");
    } catch (error) {
      console.error("Upload error:", error);
      return c.redirect("/dashboard/documents?error=upload_failed");
    }
  })
  .post("/documents/:publicId/delete", async (c) => {
    const userIdStr = await getUserFromCookie(c);

    if (!userIdStr) {
      return c.redirect("/login");
    }

    const userId = parseInt(userIdStr, 10);
    const publicId = c.req.param("publicId");

    try {
      await deleteUserDocumentWithFile(c, userId, publicId);
      return c.redirect("/dashboard/documents");
    } catch (error) {
      console.error("Delete error:", error);
      return c.redirect("/dashboard/documents?error=delete_failed");
    }
  });
