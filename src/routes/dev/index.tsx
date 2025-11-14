import { Hono } from "hono";
import { Bindings } from "../../index";
import { whatsappMockRoute } from "./whatsapp-mock";
import { whatsappMessagesRoute } from "./whatsapp-messages";

export const devRoutes = new Hono<{ Bindings: Bindings }>()
  .use("*", (c, next) => {
    if (c.env.ENVIRONMENT === "production") {
      return c.text("Access Denied", 403);
    }
    return next();
  })
  .route("/", whatsappMockRoute)
  .route("/", whatsappMessagesRoute);
