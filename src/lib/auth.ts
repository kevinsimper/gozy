import type { Context } from "hono";
import { getUserFromCookie, logout } from "../services/auth";
import { findUserById } from "../models/user";
import { AppLink, lk } from "./links";

type AuthContext = {
  Bindings: {
    DB: D1Database;
    COOKIE_SECRET: string;
  };
};

/**
 * Checks if user is already signed in and redirects to dashboard if so.
 * Use this for public pages like login and signup that authenticated users shouldn't access.
 *
 * @returns Response with redirect if user is signed in, undefined otherwise
 */
export async function redirectIfSignedIn<Env extends AuthContext>(
  c: Context<Env>,
): Promise<Response | undefined> {
  const userId = await getUserFromCookie(c);

  if (!userId) {
    return undefined;
  }

  const user = await findUserById(c, userId);

  if (user) {
    return c.redirect(lk(AppLink.Dashboard));
  }

  // Cookie exists but user doesn't exist - logout
  logout(c);
  return undefined;
}

/**
 * Checks if user is authenticated and redirects to login if not.
 * Use this for protected pages that require authentication.
 *
 * @returns User ID if authenticated, Response with redirect to login otherwise
 */
export async function requireAuth<Env extends AuthContext>(
  c: Context<Env>,
): Promise<{ userId: number } | Response> {
  const userId = await getUserFromCookie(c);

  if (!userId) {
    return c.redirect(lk(AppLink.Login));
  }

  const user = await findUserById(c, userId);

  if (!user) {
    return c.redirect(lk(AppLink.Login));
  }

  return { userId };
}
