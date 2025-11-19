import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { Bindings } from "../../index";
import { whatsappWebhookRoutes } from "./whatsapp";

export const apiRoutes = new Hono<{ Bindings: Bindings }>()
  .use("*", async (c, next) => {
    const token = c.env.GOZY_API_KEY;
    const bearer = bearerAuth({ token });
    return bearer(c, next);
  })
  .route("/whatsapp", whatsappWebhookRoutes);
