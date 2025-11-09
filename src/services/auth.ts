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
  userId: number,
): Promise<void> {
  if (!c.env.COOKIE_SECRET) {
    throw new Error("COOKIE_SECRET environment variable is not set");
  }
  await setSignedCookie(c, cookieName, userId.toString(), c.env.COOKIE_SECRET, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
}

export async function getUserFromCookie<Env extends AuthContext>(
  c: Context<Env>,
): Promise<number | undefined> {
  if (!c.env.COOKIE_SECRET) {
    throw new Error("COOKIE_SECRET environment variable is not set");
  }
  const userIdStr = await getSignedCookie(c, c.env.COOKIE_SECRET, cookieName);
  if (!userIdStr) {
    return undefined;
  }
  const userId = Number(userIdStr);
  const userIdSchema = z.number();
  const result = userIdSchema.safeParse(userId);
  return result.success ? result.data : undefined;
}

export function logout<Env extends AuthContext>(c: Context<Env>): void {
  deleteCookie(c, cookieName);
}
