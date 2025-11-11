import { Hono } from "hono";
import { z } from "zod";
import { buildZodSchema } from "../../services/hform/formbuilder";
import { createFormRenderer } from "../../services/hform/createform";
import { createVehicleOffer } from "../../models/vehicleOffer";
import { getUserFromCookie } from "../../services/auth";
import { AppLink, lk } from "../../lib/links";

type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
};

const carLeadDefinitions = [
  {
    name: "carType",
    label: "Hvilken type bil ønsker du tilbud på?",
    htmlType: "select" as const,
    zodSchema: z.string().min(1, "Vælg venligst en biltype"),
    required: true,
    options: [
      { value: "", text: "Vælg biltype" },
      { value: "taxi", text: "Taxi" },
      { value: "limousine", text: "Limousine" },
      { value: "andet", text: "Andet" },
    ],
  },
  {
    name: "brand",
    label: "Har du et bestemt mærke i tankerne?",
    htmlType: "text" as const,
    zodSchema: z.string().optional(),
    placeholder: "Tesla, Mercedes, Toyota...",
    required: false,
  },
  {
    name: "budget",
    label: "Hvad ønsker du at betale pr. måned?",
    htmlType: "number" as const,
    zodSchema: z.coerce.number().positive("Indtast venligst et positivt beløb"),
    placeholder: "Fx 6.000–7.000 kr.",
    required: true,
  },
  {
    name: "leasingDuration",
    label: "Løbetid på leasing?",
    htmlType: "select" as const,
    zodSchema: z.string().min(1, "Vælg venligst løbetid"),
    required: true,
    options: [
      { value: "", text: "Vælg løbetid" },
      { value: "36", text: "36 måneder" },
      { value: "48", text: "48 måneder" },
    ],
  },
  {
    name: "taxiEquipment",
    label: "Skal bilen leveres med taxiudstyr?",
    htmlType: "select" as const,
    zodSchema: z.enum(["yes", "no"], {
      message: "Vælg venligst en mulighed",
    }),
    required: true,
    options: [
      { value: "", text: "Vælg" },
      { value: "yes", text: "Ja, med taxiudstyr" },
      { value: "no", text: "Nej, uden taxiudstyr" },
    ],
  },
  {
    name: "taxiCompany",
    label: "Hvilket taxiselskab ønsker du at være tilknyttet?",
    htmlType: "select" as const,
    zodSchema: z.string().min(1, "Vælg venligst taxiselskab"),
    required: true,
    options: [
      { value: "", text: "Vælg taxiselskab" },
      { value: "dantaxi", text: "Dantaxi" },
      { value: "4x35", text: "4x35" },
      { value: "bolt", text: "Bolt" },
      { value: "drivr", text: "Drivr" },
      { value: "4x27", text: "4X27" },
      { value: "taxi_syd", text: "Taxi Syd" },
      { value: "aarhus_taxi", text: "Århus Taxi" },
      { value: "other", text: "Andet" },
    ],
  },
  {
    name: "notes",
    label: "Har du andre ønsker eller spørgsmål?",
    htmlType: "textarea" as const,
    zodSchema: z.string().optional(),
    placeholder: "Valgfrit",
    required: false,
    rows: 4,
  },
] as const;

const { schema: carLeadSchema } = buildZodSchema(carLeadDefinitions);

const renderForm = createFormRenderer(carLeadDefinitions, {
  id: "car-lead-form",
  method: "POST",
  action: "/dashboard/car-lead",
});

export const carLeadRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    const formHtml = await renderForm({});

    return c.render(
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Få tilbud på ny bil
        </h1>
        <p className="text-gray-600 mb-6">GoZy – nemt og hurtigt</p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {formHtml}
        </div>
      </div>,
      {
        title: "Få tilbud på ny bil - GoZy",
      },
    );
  })
  .post("/", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    const body = await c.req.parseBody();
    const parsed = carLeadSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });

      const formHtml = await renderForm({
        values: body as Record<string, string>,
        errors,
      });

      return c.render(
        <div className="max-w-2xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Få tilbud på ny bil
          </h1>
          <p className="text-gray-600 mb-6">GoZy – nemt og hurtigt</p>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {formHtml}
          </div>
        </div>,
        {
          title: "Få tilbud på ny bil - GoZy",
        },
      );
    }

    await createVehicleOffer(c, userId, {
      carType: parsed.data.carType,
      brand: parsed.data.brand,
      budget: parsed.data.budget,
      leasingDuration: parsed.data.leasingDuration,
      taxiEquipment: parsed.data.taxiEquipment === "yes",
      taxiCompany: parsed.data.taxiCompany,
      notes: parsed.data.notes,
    });

    return c.render(
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <svg
            className="w-16 h-16 text-green-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tak for din forespørgsel!
          </h1>
          <p className="text-gray-600 mb-6">
            Vi behandler din anmodning og vender tilbage hurtigst muligt med de
            bedste tilbud.
          </p>
          <a
            href={lk(AppLink.Dashboard)}
            className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Tilbage til dashboard
          </a>
        </div>
      </div>,
      {
        title: "Tak for din forespørgsel - GoZy",
      },
    );
  });
