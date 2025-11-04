import { Hono } from "hono";
import { z } from "zod";
import { setUserCookie } from "../services/auth";
import {
  findUserByPhoneNumber,
  updateLoginPin,
  clearLoginPin,
  updateLastLogin,
  createUser,
} from "../models/user";

type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
};

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+45\d{8}$/, "Must be a valid Danish phone number (+45xxxxxxxx)"),
});

const pinSchema = z.object({
  phoneNumber: z.string(),
  pin: z
    .string()
    .length(4, "PIN must be 4 digits")
    .regex(/^\d{4}$/, "PIN must be numeric"),
});

function generatePin(): string {
  return "1234";
}

export const loginRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", (c) => {
    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gozy Login</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>Gozy Login</h1>
          <form method="POST" action="/login">
            <label for="phoneNumber">Phone Number:</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="+4512345678"
              required
            />
            <button type="submit">Send PIN</button>
          </form>
        </body>
      </html>
    `);
  })
  .post("/", async (c) => {
    const body = await c.req.parseBody();
    const parsed = phoneSchema.safeParse(body);

    if (!parsed.success) {
      return c.html(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gozy Login - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <h1>Gozy Login</h1>
            <p style="color: red;">Invalid phone number. Please use format: +45xxxxxxxx</p>
            <form method="POST" action="/login">
              <label for="phoneNumber">Phone Number:</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+4512345678"
                value="${body.phoneNumber || ""}"
                required
              />
              <button type="submit">Send PIN</button>
            </form>
          </body>
        </html>
      `,
        400,
      );
    }

    let user = await findUserByPhoneNumber(c, parsed.data.phoneNumber);

    if (!user) {
      user = await createUser(c, parsed.data.phoneNumber, "New User");
      console.log(`Created new user ${user.id} for ${user.phoneNumber}`);
    }

    const pin = generatePin();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await updateLoginPin(c, user.id, pin, expiresAt);

    console.log(
      `Generated PIN ${pin} for user ${user.id} (${user.phoneNumber})`,
    );

    return c.html(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gozy Login - Enter PIN</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>Enter PIN</h1>
          <p>A 4-digit PIN has been sent to your WhatsApp.</p>
          <p>PIN expires in 10 minutes.</p>
          <form method="POST" action="/login/verify">
            <input type="hidden" name="phoneNumber" value="${parsed.data.phoneNumber}" />
            <label for="pin">PIN:</label>
            <input
              type="text"
              id="pin"
              name="pin"
              placeholder="1234"
              maxlength="4"
              pattern="[0-9]{4}"
              required
              autofocus
            />
            <button type="submit">Login</button>
          </form>
        </body>
      </html>
    `);
  })
  .post("/verify", async (c) => {
    const body = await c.req.parseBody();
    const parsed = pinSchema.safeParse(body);

    if (!parsed.success) {
      return c.html(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gozy Login - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <h1>Error</h1>
            <p style="color: red;">Invalid PIN format. Must be 4 digits.</p>
            <a href="/login">Try again</a>
          </body>
        </html>
      `,
        400,
      );
    }

    const user = await findUserByPhoneNumber(c, parsed.data.phoneNumber);

    if (!user) {
      return c.html(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gozy Login - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <h1>Error</h1>
            <p style="color: red;">User not found.</p>
            <a href="/login">Try again</a>
          </body>
        </html>
      `,
        404,
      );
    }

    if (!user.loginPin || !user.loginPinExpiry) {
      return c.html(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gozy Login - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <h1>Error</h1>
            <p style="color: red;">No PIN found. Please request a new one.</p>
            <a href="/login">Try again</a>
          </body>
        </html>
      `,
        400,
      );
    }

    if (user.loginPinExpiry < new Date()) {
      await clearLoginPin(c, user.id);
      return c.html(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gozy Login - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <h1>Error</h1>
            <p style="color: red;">PIN has expired. Please request a new one.</p>
            <a href="/login">Try again</a>
          </body>
        </html>
      `,
        400,
      );
    }

    if (user.loginPin !== parsed.data.pin) {
      return c.html(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Gozy Login - Error</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <h1>Error</h1>
            <p style="color: red;">Incorrect PIN. Please try again.</p>
            <form method="POST" action="/login/verify">
              <input type="hidden" name="phoneNumber" value="${parsed.data.phoneNumber}" />
              <label for="pin">PIN:</label>
              <input
                type="text"
                id="pin"
                name="pin"
                placeholder="1234"
                maxlength="4"
                pattern="[0-9]{4}"
                required
                autofocus
              />
              <button type="submit">Login</button>
            </form>
          </body>
        </html>
      `,
        400,
      );
    }

    await clearLoginPin(c, user.id);
    await updateLastLogin(c, user.id);
    await setUserCookie(c, user.id.toString());

    return c.redirect("/");
  });
