import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { Bindings } from "../../index";
import { whatsappWebhookRoutes } from "./whatsapp";
import { filesRoutes } from "./files";

export const apiRoutes = new Hono<{ Bindings: Bindings }>()
  .route("/files", filesRoutes)
  .use("*", async (c, next) => {
    const token = c.env.GOZY_API_KEY;
    const bearer = bearerAuth({ token });
    return bearer(c, next);
  })
  .route("/whatsapp", whatsappWebhookRoutes);
