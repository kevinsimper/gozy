import { Hono } from "hono";
import { Bindings } from "../..";
import { dashboardRoutes } from "./dashboard";
import { documentsRoutes } from "./documents";
import { remindersRoutes } from "./reminders";
import { tablesRoutes } from "./tables";
import { usersRoutes } from "./users";
import { documentTestRoutes } from "./documenttest";

export const adminRoutes = new Hono<{ Bindings: Bindings }>()
  .route("/", dashboardRoutes)
  .route("/documents", documentsRoutes)
  .route("/reminders", remindersRoutes)
  .route("/tables", tablesRoutes)
  .route("/users", usersRoutes)
  .route("/document-test", documentTestRoutes);
