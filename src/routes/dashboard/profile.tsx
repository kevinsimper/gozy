import { Hono } from "hono";
import { z } from "zod";
import { getUserFromCookie } from "../../services/auth";
import {
  findUserById,
  updateUser,
  updateUserPreferredLocation,
  updateUserDriverInfo,
} from "../../models/user";
import { ProfilePage } from "../../views/dashboard/profile";
import { AppLink, lk } from "../../lib/links";
import { buildZodSchema } from "../../services/hform/formbuilder";
import { HForm } from "../../services/hform/form";
import {
  findRttLocationById,
  findAllRttLocations,
} from "../../models/rttlocation";
import {
  findTaxiIdsByUserId,
  createTaxiId,
  deleteTaxiId,
} from "../../models/taxiid";
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
  {
    name: "driverType",
    label: "Chauffør type",
    htmlType: "select" as const,
    required: false,
    zodSchema: z.enum(["vehicle_owner", "driver"]).optional(),
    asyncOptions: true,
  },
  {
    name: "preferredRttLocationId",
    label: "Foretrukket RTT lokation",
    htmlType: "select" as const,
    required: false,
    zodSchema: z.string().optional(),
    asyncOptions: true,
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

    const preferredLocation = user.preferredRttLocationId
      ? await findRttLocationById(c, user.preferredRttLocationId)
      : null;

    const locations = await findAllRttLocations(c);
    const taxiIds = await findTaxiIdsByUserId(c, userId);

    const dynamicSelectOptions = {
      driverType: [
        { value: "", text: "Vælg type" },
        { value: "vehicle_owner", text: "Vognmand" },
        { value: "driver", text: "Chauffør" },
      ],
      preferredRttLocationId: [
        { value: "", text: "Ingen valgt" },
        ...locations.map((loc) => ({
          value: loc.id.toString(),
          text: `${loc.name}, ${loc.city}`,
        })),
      ],
    };

    const formHtml = profileForm.render(
      {
        name: user.name,
        driverType: user.driverType || undefined,
        preferredRttLocationId: user.preferredRttLocationId?.toString() || "",
      },
      {},
      dynamicSelectOptions,
    );

    return c.render(
      <ProfilePage
        user={user}
        formHtml={formHtml}
        preferredLocation={preferredLocation}
        taxiIds={taxiIds}
      />,
      {
        title: "Profil",
      },
    );
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

    const locations = await findAllRttLocations(c);
    const dynamicSelectOptions = {
      driverType: [
        { value: "", text: "Vælg type" },
        { value: "vehicle_owner", text: "Vognmand" },
        { value: "driver", text: "Chauffør" },
      ],
      preferredRttLocationId: [
        { value: "", text: "Ingen valgt" },
        ...locations.map((loc) => ({
          value: loc.id.toString(),
          text: `${loc.name}, ${loc.city}`,
        })),
      ],
    };

    if (!parseResult.success) {
      const errors = profileForm.handleValidation(parseResult);
      const formHtml = profileForm.render(body, errors, dynamicSelectOptions);
      return c.html(formHtml);
    }

    await updateUser(c, userId, { name: parseResult.data.name });

    const driverType = parseResult.data.driverType || undefined;
    await updateUserDriverInfo(c, userId, {
      driverType: driverType as "vehicle_owner" | "driver" | undefined,
    });

    const locationId = parseResult.data.preferredRttLocationId
      ? parseInt(parseResult.data.preferredRttLocationId)
      : null;
    await updateUserPreferredLocation(c, userId, locationId);

    const updatedUser = await findUserById(c, userId);
    if (!updatedUser) {
      return c.redirect(lk(AppLink.Login));
    }

    const formHtml = profileForm.render(
      {
        name: updatedUser.name,
        driverType: updatedUser.driverType || undefined,
        preferredRttLocationId:
          updatedUser.preferredRttLocationId?.toString() || "",
      },
      {},
      dynamicSelectOptions,
    );

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
  })
  .post("/taxi-id/add", async (c) => {
    const userId = await getUserFromCookie(c);
    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    const body = await c.req.parseBody();
    const taxiId = body.taxiId;

    if (!taxiId || typeof taxiId !== "string" || taxiId.trim() === "") {
      const taxiIds = await findTaxiIdsByUserId(c, userId);
      return c.html(
        <div id="taxi-ids-section">
          <div className="mb-2 rounded bg-red-100 border border-red-300 px-4 py-3 text-red-700 text-sm">
            Taxi ID kan ikke være tomt
          </div>
          {renderTaxiIdsSection(taxiIds)}
        </div>,
      );
    }

    await createTaxiId(c, userId, taxiId.trim());
    const taxiIds = await findTaxiIdsByUserId(c, userId);

    return c.html(
      <div id="taxi-ids-section">
        <div className="mb-2 rounded bg-green-100 border border-green-300 px-4 py-3 text-green-700 text-sm">
          Taxi ID tilføjet
        </div>
        {renderTaxiIdsSection(taxiIds)}
      </div>,
    );
  })
  .post("/taxi-id/delete/:id", async (c) => {
    const userId = await getUserFromCookie(c);
    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    const taxiIdId = c.req.param("id");
    await deleteTaxiId(c, parseInt(taxiIdId, 10));

    const taxiIds = await findTaxiIdsByUserId(c, userId);

    return c.html(
      <div id="taxi-ids-section">
        <div className="mb-2 rounded bg-green-100 border border-green-300 px-4 py-3 text-green-700 text-sm">
          Taxi ID slettet
        </div>
        {renderTaxiIdsSection(taxiIds)}
      </div>,
    );
  });

function renderTaxiIdsSection(taxiIds: { id: number; taxiId: string }[]) {
  return (
    <div>
      {taxiIds.length > 0 && (
        <div className="mb-4 space-y-2">
          {taxiIds.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-gray-50 rounded px-4 py-2"
            >
              <span className="flex-1 text-gray-900">{item.taxiId}</span>
              <form
                hx-post={`/dashboard/profile/taxi-id/delete/${item.id}`}
                hx-target="#taxi-ids-section"
                hx-swap="outerHTML"
              >
                <button
                  type="submit"
                  className="text-red-600 hover:text-red-800"
                  title="Slet"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                  </svg>
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form
        hx-post="/dashboard/profile/taxi-id/add"
        hx-target="#taxi-ids-section"
        hx-swap="outerHTML"
        className="flex gap-2"
      >
        <input
          type="text"
          name="taxiId"
          placeholder="Indtast nyt Taxi ID"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="h-4 w-4"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          Tilføj
        </button>
      </form>
    </div>
  );
}
