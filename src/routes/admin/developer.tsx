import { Hono } from "hono";
import { Bindings } from "../..";
import { DeveloperPage } from "../../views/admin/developer";

export const developerRoutes = new Hono<{ Bindings: Bindings }>().get(
  "/",
  (c) => {
    return c.render(<DeveloperPage />, {
      title: "Developer Configuration - Gozy Admin",
    });
  },
);
