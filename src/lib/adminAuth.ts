import { Context } from "hono";
import { getUserFromCookie } from "../services/auth";
import { findUserById } from "../models/user";
import { AppLink, lk } from "./links";
import { html } from "hono/html";
import { Bindings } from "..";

const ALLOWED_ADMIN_PHONE_NUMBERS = ["+4540360565", "+4520586016"];

export async function requireAdmin(c: Context<{ Bindings: Bindings }>) {
  const userId = await getUserFromCookie(c);

  if (!userId) {
    return c.redirect(lk(AppLink.Login));
  }

  const user = await findUserById(c, userId);

  if (!user) {
    return c.redirect(lk(AppLink.Login));
  }

  if (!ALLOWED_ADMIN_PHONE_NUMBERS.includes(user.phoneNumber)) {
    return c.html(
      html`
        <!DOCTYPE html>
        <html lang="da">
          <head>
            <meta charset="UTF-8" />
            <title>Access Denied</title>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          </head>
          <body
            class="bg-black text-white min-h-screen flex items-center justify-center"
          >
            <div class="text-center">
              <h1 class="text-2xl font-bold mb-4">Access Denied</h1>
              <p class="text-gray-400 mb-6">
                You do not have permission to access this page.
              </p>
              <a
                href=${lk(AppLink.Dashboard)}
                class="text-blue-500 hover:underline"
                >Go to Dashboard</a
              >
            </div>
          </body>
        </html>
      `,
      403,
    );
  }

  return user;
}
