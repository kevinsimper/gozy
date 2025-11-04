import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { usersTable } from "./db/schema";
import { generateResponse } from "./services/gemini/client";
import { loginRoutes } from "./routes/login";
import { dashboardRoutes } from "./routes/dashboard";
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

app.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }

  const key = `uploads/${Date.now()}-${file.name}`;

  await c.env.FILES.put(key, file, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  return c.json({
    success: true,
    key,
    filename: file.name,
    size: file.size,
    type: file.type,
  });
});

app.get("/download/:key{.+}", async (c) => {
  const key = c.req.param("key");

  const object = await c.env.FILES.get(key);

  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }

  return c.body(object.body, 200, {
    "Content-Type":
      object.httpMetadata?.contentType || "application/octet-stream",
    "Content-Length": object.size.toString(),
  });
});

export default app;
