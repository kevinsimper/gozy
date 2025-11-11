import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { getUserFromCookie } from "../../services/auth";
import { findUserById } from "../../models/user";
import { findUserDocumentsByUserId } from "../../models/userDocument";
import { Layout } from "../../views/layout";
import { DashboardPage } from "../../views/dashboard";
import { DashboardHeader } from "../../views/dashboard/header";
import { createPageview } from "../../models/pageview";
import { AppLink, lk } from "../../lib/links";
import { documentsRoutes } from "./documents";
import { chatRoutes } from "./chat";
import { profileRoutes } from "./profile";
import { carLeadRoutes } from "./carlead";
import type { Bindings } from "../../index";

declare module "hono" {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      props: { title: string; currentPath?: string },
    ): Response;
  }
}

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>()
  .use(
    "*",
    jsxRenderer(
      ({ children, title }, c) => {
        const currentPath = c.req.path;
        return (
          <Layout title={title}>
            <div style="min-height: 100vh; background: #f9fafb;">
              <DashboardHeader currentPath={currentPath} />
              {children}
            </div>
          </Layout>
        );
      },
      {
        docType: true,
      },
    ),
  )
  .use("*", async (c, next) => {
    const userId = await getUserFromCookie(c);

    if (userId) {
      createPageview(c, {
        userId,
        method: c.req.method,
        path: c.req.path,
      }).catch((error) => {
        console.error("Failed to log pageview:", error);
      });
    }

    return next();
  })
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
    const documentCount = documents.length;

    return c.render(
      <DashboardPage user={user} documentCount={documentCount} />,
      {
        title: "Gozy Dashboard",
      },
    );
  })
  .route("/documents", documentsRoutes)
  .route("/chat", chatRoutes)
  .route("/profile", profileRoutes)
  .route("/car-lead", carLeadRoutes);
