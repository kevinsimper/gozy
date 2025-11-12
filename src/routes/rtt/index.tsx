import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Bindings } from "../..";
import { RttLayout } from "../../views/rtt/layout";
import { rttCheckinsRoutes } from "./checkins";
import { rttSendMessageRoutes } from "./send-message";
import { AppLink, lk } from "../../lib/links";

declare module "hono" {
  interface ContextRenderer {
    (content: string | Promise<string>, props: { title: string }): Response;
  }
}

export const rttRoutes = new Hono<{ Bindings: Bindings }>()
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
              <RttLayout>{children}</RttLayout>
            </body>
          </html>
        );
      },
      {
        docType: true,
      },
    ),
  )
  .get("/", (c) => {
    return c.redirect(lk(AppLink.RttCheckins));
  })
  .route("/check-ins", rttCheckinsRoutes)
  .route("/check-ins/send-message", rttSendMessageRoutes);
