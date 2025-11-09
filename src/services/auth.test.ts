import { expect, test, vi } from "vitest";
import { getUserFromCookie, setUserCookie, logout } from "./auth";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";

vi.mock("hono/cookie");

test("setUserCookie should set a signed cookie with userId", async () => {
  const c = {
    env: {
      COOKIE_SECRET: "secret",
    },
  } as any;
  const userId = 123;
  await setUserCookie(c, userId);

  expect(setSignedCookie).toHaveBeenCalledWith(c, "userId", "123", "secret", {
    expires: expect.any(Date),
    httpOnly: true,
    sameSite: "Lax",
    secure: true,
  });
});

test("getUserFromCookie should get the userId from the signed cookie", async () => {
  const c = {
    env: {
      COOKIE_SECRET: "secret",
    },
  } as any;
  const expectedUserId = 456;
  vi.mocked(getSignedCookie).mockResolvedValue("456");

  const actualUserId = await getUserFromCookie(c);

  expect(getSignedCookie).toHaveBeenCalledWith(c, "secret", "userId");
  expect(actualUserId).toBe(expectedUserId);
});

test("getUserFromCookie should return undefined if cookie is invalid or missing", async () => {
  const c = {
    env: {
      COOKIE_SECRET: "secret",
    },
  } as any;

  vi.mocked(getSignedCookie).mockResolvedValue(undefined);

  const actualUserId = await getUserFromCookie(c);

  expect(getSignedCookie).toHaveBeenCalledWith(c, "secret", "userId");
  expect(actualUserId).toBeUndefined();
});

test("logout should delete the userId cookie", () => {
  const c = {
    env: {
      COOKIE_SECRET: "secret",
    },
  } as any;
  logout(c);

  expect(deleteCookie).toHaveBeenCalledWith(c, "userId");
});
