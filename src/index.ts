import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { usersTable } from "./db/schema";
import { generateResponse } from "./services/gemini/client";
import { loginRoutes } from "./routes/login";
import { dashboardRoutes } from "./routes/dashboard";
import { uploadRoutes } from "./routes/upload";
import { logout } from "./services/auth";

type Bindings = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  FILES: R2Bucket;
  COOKIE_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.route("/login", loginRoutes);
app.route("/dashboard", dashboardRoutes);
app.route("/files", uploadRoutes);

app.get("/", (c) => {
  return c.text("Hello World");
});

app.post("/logout", (c) => {
  logout(c);
  return c.redirect("/login");
});

app.get("/users", async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(usersTable).all();
  return c.json(result);
});

app.get("/gemini", async (c) => {
  const query = c.req.query("q") || "Hej, hvad kan du hjælpe mig med?";
  const response = await generateResponse(c, query);
  return c.json({ query, response });
});

export default app;
