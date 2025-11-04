import { Hono } from "hono";
import { getUserFromCookie } from "../services/auth";
import { findUserById } from "../models/user";

type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
};

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>().get(
  "/",
  async (c) => {
    const userIdStr = await getUserFromCookie(c);

    if (!userIdStr) {
      return c.redirect("/login");
    }

    const userId = parseInt(userIdStr, 10);
    const user = await findUserById(c, userId);

    if (!user) {
      return c.redirect("/login");
    }

    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gozy Dashboard</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>Gozy Dashboard</h1>
          <p>Welcome, ${user.name}!</p>
          <p>Phone: ${user.phoneNumber}</p>
          <p>Last login: ${user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "First time"}</p>
          <form method="POST" action="/logout">
            <button type="submit">Logout</button>
          </form>
        </body>
      </html>
    `);
  },
);
