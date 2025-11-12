import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { usersTable } from "./db/schema";
import { generateResponse } from "./services/gemini/client";
import { loginRoutes } from "./routes/login";
import { dashboardRoutes } from "./routes/dashboard/index";
import { adminRoutes } from "./routes/admin/index";
import { rttRoutes } from "./routes/rtt/index";
import { apiRoutes } from "./routes/api/index";
import { whatsappMockRoute } from "./routes/dev/whatsapp-mock";
import { logout } from "./services/auth";
import { jsxRenderer } from "hono/jsx-renderer";
import { HTTPException } from "hono/http-exception";
import { Layout } from "./views/layout";
import { LandingPage } from "./views/landing";
import { SignupPage } from "./views/public/SignupPage";
import { PublicLayout } from "./views/public/layout";
import { AppLink, lk } from "./lib/links";
import { redirectIfSignedIn } from "./lib/auth";

export type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  FILES: R2Bucket;
  COOKIE_SECRET: string;
  GOZY_API_TOKEN: string;
  RESEND_API_KEY: string;
  WHATSAPP_BOT_TOKEN: string;
  WHATSAPP_BOT_URL: string;
  DEV: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/",
  jsxRenderer(
    ({ children, title }) => {
      return <Layout title={title}>{children}</Layout>;
    },
    {
      docType: true,
    },
  ),
);

app.route("/login", loginRoutes);
app.route("/dashboard", dashboardRoutes);
app.route("/admin", adminRoutes);
app.route("/rtt", rttRoutes);
app.route("/api", apiRoutes);
app.route("/dev", whatsappMockRoute);

app.get("/", (c) => {
  return c.render(<LandingPage />, {
    title: "Gozy - Din digitale hub som taxichauffør",
  });
});

app.get("/signup", async (c) => {
  const redirect = await redirectIfSignedIn(c);
  if (redirect) {
    return redirect;
  }

  return c.html(
    <PublicLayout title="Gozy - Opret konto">
      <SignupPage />
    </PublicLayout>,
  );
});

app.post("/logout", (c) => {
  logout(c);
  return c.redirect(lk(AppLink.Login));
});

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    console.error("HTTPException:", error);
    console.error("Cause:", error.cause);
    return error.getResponse();
  }
  console.error("Unhandled error:", error);

  const acceptHeader = c.req.header("Accept") || "";
  const expectsHtml = acceptHeader.includes("text/html");

  if (expectsHtml) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    const errorStack = error instanceof Error ? error.stack : "";

    return c.html(
      <Layout title="Error">
        <div style="min-height: 100vh; background: #f9fafb; display: flex; align-items: center; justify-content: center; padding: 1rem;">
          <div style="max-width: 42rem; width: 100%;">
            <div style="background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); padding: 2rem;">
              <div style="background: #FEE2E2; border: 1px solid #FCA5A5; color: #B91C1C; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <h1 style="font-size: 1.5rem; font-weight: bold; margin: 0 0 0.5rem 0;">
                  Error
                </h1>
                <p style="margin: 0; font-size: 1rem;">{errorMessage}</p>
              </div>
              {errorStack && (
                <details style="margin-top: 1rem;">
                  <summary style="cursor: pointer; color: #6B7280; font-size: 0.875rem;">
                    Stack trace
                  </summary>
                  <pre style="margin-top: 0.5rem; padding: 1rem; background: #F3F4F6; border-radius: 0.375rem; overflow-x: auto; font-size: 0.75rem; color: #374151;">
                    {errorStack}
                  </pre>
                </details>
              )}
              <div style="margin-top: 1.5rem;">
                <a
                  href="/"
                  style="color: #2563EB; text-decoration: none; font-weight: 500;"
                >
                  Go back home
                </a>
              </div>
            </div>
          </div>
        </div>
      </Layout>,
      500,
    );
  }

  return c.json({ error: "Internal Server Error" }, 500);
});

app.post("/create", (c) => {
  if (c.env.DEV === "true") {
    return c.json({ error: "DEV mode is enabled" }, 400);
  }

  return c.json({ message: "DEV mode is disabled" }, 200);
});

export default app;

export { handleDocumentReminders as scheduled } from "./scheduled/reminders";
