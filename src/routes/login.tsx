import { Hono } from "hono";
import { z } from "zod";
import type { Bindings } from "../index";
import { redirectIfSignedIn } from "../lib/auth";
import { AppLink, lk } from "../lib/links";
import { sendLoginPin } from "../lib/login";
import {
  clearLoginPin,
  findUserByPhoneNumber,
  updateLastLogin,
  updateLoginPin,
} from "../models/user";
import { setUserCookie } from "../services/auth";
import { LoginForm } from "../views/public/LoginForm";
import { PinVerificationForm } from "../views/public/PinVerificationForm";

declare module "hono" {
  interface ContextRenderer {
    (content: string | Promise<string>, props: { title: string }): Response;
  }
}

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\d{8}$/, "Must be 8 digits")
    .transform((val) => `+45${val}`),
});

const pinSchema = z.object({
  phoneNumber: z.string(),
  pin: z
    .string()
    .length(4, "PIN must be 4 digits")
    .regex(/^\d{4}$/, "PIN must be numeric"),
});

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const loginRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const redirect = await redirectIfSignedIn(c);
    if (redirect) {
      return redirect;
    }

    return c.render(<LoginForm />, {
      title: "Gozy - Log ind",
    });
  })
  .post("/", async (c) => {
    const body = await c.req.parseBody();
    const parsed = phoneSchema.safeParse(body);

    if (!parsed.success) {
      return c.render(
        <LoginForm
          error="Ugyldigt telefonnummer. Skal være 8 cifre."
          phoneNumber={
            typeof body.phoneNumber === "string" ? body.phoneNumber : ""
          }
        />,
        {
          title: "Gozy - Log ind",
        },
      );
    }

    const user = await findUserByPhoneNumber(c, parsed.data.phoneNumber);

    if (!user) {
      return c.redirect(lk(AppLink.Signup));
    }

    const pin = generatePin();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await updateLoginPin(c, user.id, pin, expiresAt);

    console.log(
      `Generated PIN ${pin} for user ${user.id} (${user.phoneNumber})`,
    );

    try {
      await sendLoginPin(c, user.phoneNumber, pin, user.id);
    } catch (error) {
      console.error("Failed to send PIN via WhatsApp:", error);
      return c.render(
        <LoginForm
          error="Kunne ikke sende PIN-kode. Prøv venligst igen."
          phoneNumber={parsed.data.phoneNumber.replace("+45", "")}
        />,
        {
          title: "Gozy - Log ind",
        },
      );
    }

    return c.render(
      <PinVerificationForm phoneNumber={parsed.data.phoneNumber} />,
      {
        title: "Gozy - Indtast PIN",
      },
    );
  })
  .post("/verify", async (c) => {
    const body = await c.req.parseBody();
    const parsed = pinSchema.safeParse(body);

    if (!parsed.success) {
      return c.render(
        <PinVerificationForm
          phoneNumber={
            typeof body.phoneNumber === "string" ? body.phoneNumber : ""
          }
          error="Ugyldig PIN-format. Skal være 4 cifre."
        />,
        {
          title: "Gozy - Indtast PIN",
        },
      );
    }

    const user = await findUserByPhoneNumber(c, parsed.data.phoneNumber);

    if (!user) {
      return c.render(
        <PinVerificationForm
          phoneNumber={parsed.data.phoneNumber}
          error="Bruger ikke fundet."
        />,
        {
          title: "Gozy - Indtast PIN",
        },
      );
    }

    if (!user.loginPin || !user.loginPinExpiry) {
      return c.render(
        <PinVerificationForm
          phoneNumber={parsed.data.phoneNumber}
          error="Ingen PIN fundet. Anmod venligst om en ny."
        />,
        {
          title: "Gozy - Indtast PIN",
        },
      );
    }

    if (user.loginPinExpiry < new Date()) {
      await clearLoginPin(c, user.id);
      return c.render(
        <PinVerificationForm
          phoneNumber={parsed.data.phoneNumber}
          error="PIN-koden er udløbet. Anmod venligst om en ny."
        />,
        {
          title: "Gozy - Indtast PIN",
        },
      );
    }

    if (user.loginPin !== parsed.data.pin) {
      return c.render(
        <PinVerificationForm
          phoneNumber={parsed.data.phoneNumber}
          error="Forkert PIN. Prøv venligst igen."
        />,
        {
          title: "Gozy - Indtast PIN",
        },
      );
    }

    await clearLoginPin(c, user.id);
    await updateLastLogin(c, user.id);
    await setUserCookie(c, user.id);

    return c.redirect(lk(AppLink.Dashboard));
  });
