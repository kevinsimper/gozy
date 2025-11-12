import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Bindings } from "../..";
import { AdminLayout } from "../../views/admin/layout";
import { dashboardRoutes } from "./dashboard";
import { documentsRoutes } from "./documents";
import { remindersRoutes } from "./reminders";
import { tablesRoutes } from "./tables";
import { usersRoutes } from "./users";
import { documentTestRoutes } from "./documenttest";

declare module "hono" {
  interface ContextRenderer {
    (content: string | Promise<string>, props: { title: string }): Response;
  }
}

export const adminRoutes = new Hono<{ Bindings: Bindings }>()
  .use(
    "*",
    jsxRenderer(
      ({ children, title }) => {
        return (
          <html lang="da">
            <head>
              <meta charset="UTF-8" />
              <title>{title}</title>
              <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
            </head>
            <body>
              <AdminLayout>{children}</AdminLayout>
            </body>
          </html>
        );
      },
      {
        docType: true,
      },
    ),
  )
  .route("/", dashboardRoutes)
  .route("/documents", documentsRoutes)
  .route("/reminders", remindersRoutes)
  .route("/tables", tablesRoutes)
  .route("/users", usersRoutes)
  .route("/document-test", documentTestRoutes);
