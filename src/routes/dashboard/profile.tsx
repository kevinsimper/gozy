import { Hono } from "hono";
import { z } from "zod";
import { getUserFromCookie } from "../../services/auth";
import { findUserById, updateUser } from "../../models/user";
import { ProfilePage } from "../../views/dashboard/profile";
import { AppLink, lk } from "../../lib/links";
import { buildZodSchema } from "../../services/hform/formbuilder";
import { HForm } from "../../services/hform/form";
import type { Bindings } from "../../index";

const profileFields = [
  {
    name: "name",
    label: "Navn",
    htmlType: "text" as const,
    required: true,
    placeholder: "Indtast dit navn",
    zodSchema: z.string().min(2, "Navn skal være mindst 2 tegn"),
  },
] as const;

const { schema: profileSchema, formDefinition: profileFormDefinition } =
  buildZodSchema(profileFields);
const profileForm = HForm(profileFormDefinition, {
  id: "profile-form",
  hxPost: "/dashboard/profile",
  hxTarget: "#profile-form-container",
  hxSwap: "innerHTML",
  hxIndicator: "#profile-spinner",
});

export const profileRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }
    const user = await findUserById(c, userId);

    if (!user) {
      return c.redirect(lk(AppLink.Login));
    }

    const formHtml = profileForm.render({ name: user.name });

    return c.render(<ProfilePage user={user} formHtml={formHtml} />, {
      title: "Profil",
    });
  })
  .post("/", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }
    const user = await findUserById(c, userId);

    if (!user) {
      return c.redirect(lk(AppLink.Login));
    }

    const body = await c.req.parseBody();
    const parseResult = profileSchema.safeParse(body);

    if (!parseResult.success) {
      const errors = profileForm.handleValidation(parseResult);
      const formHtml = profileForm.render(body, errors);
      return c.html(formHtml);
    }

    await updateUser(c, userId, { name: parseResult.data.name });

    const updatedUser = await findUserById(c, userId);
    if (!updatedUser) {
      return c.redirect(lk(AppLink.Login));
    }

    const formHtml = profileForm.render({ name: updatedUser.name });
    const successFormHtml = (
      <div>
        <div className="mb-4 rounded bg-green-100 border border-green-300 px-4 py-3 text-green-700 text-sm">
          Profil opdateret succesfuldt
        </div>
        {formHtml}
        <span id="profile-spinner" className="htmx-indicator">
          Behandler...
        </span>
      </div>
    );
    return c.html(successFormHtml);
  });
