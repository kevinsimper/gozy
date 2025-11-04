import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import type { Context } from "hono";
import { z } from "zod";

const cookieName = "userId";

type AuthContext = {
  Bindings: {
    COOKIE_SECRET: string;
  };
};

export async function setUserCookie<Env extends AuthContext>(
  c: Context<Env>,
  userId: string,
): Promise<void> {
  await setSignedCookie(c, cookieName, userId, c.env.COOKIE_SECRET, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
}

export async function getUserFromCookie<Env extends AuthContext>(
  c: Context<Env>,
): Promise<string | undefined> {
  const userIdStr = await getSignedCookie(c, c.env.COOKIE_SECRET, cookieName);
  const userIdSchema = z.string();
  const result = userIdSchema.safeParse(userIdStr);
  return result.success ? result.data : undefined;
}

export function logout<Env extends AuthContext>(c: Context<Env>): void {
  deleteCookie(c, cookieName);
}
