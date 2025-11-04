import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { getUserFromCookie } from "../services/auth";
import { findUserById } from "../models/user";
import { Layout } from "../views/layout";
import { DashboardPage } from "../views/dashboard";

type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
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
  });
