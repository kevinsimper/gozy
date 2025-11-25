import { Hono } from "hono";
import QRCode from "qrcode";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { Bindings } from "../..";
import { requireAdmin } from "../../lib/adminAuth";
import {
  createQrCode,
  listQrCodes,
  getQrCodeByShortCode,
  updateQrCode,
  deleteQrCode,
  getQrCodeStats,
} from "../../models/qrcodes";
import { QrCodesListView, QrCodeDetailView } from "../../views/admin/qrcodes";
import { buildZodSchema } from "../../services/hform/formbuilder";
import { HForm } from "../../services/hform/form";
import { lk, AppLink } from "../../lib/links";

const createFields = [
  {
    name: "shortCode",
    label: "Short Code",
    htmlType: "text",
    required: true,
    zodSchema: z
      .string()
      .min(1, "Short code is required")
      .max(50, "Short code too long")
      .regex(
        /^[a-z0-9-]+$/,
        "Only lowercase letters, numbers, and hyphens allowed",
      ),
    placeholder: "checkin",
    description: "Lowercase letters, numbers, and hyphens only",
  },
  {
    name: "name",
    label: "Name",
    htmlType: "text",
    required: true,
    zodSchema: z.string().min(1, "Name is required").max(200),
    placeholder: "Check-in QR Code",
    description: "Descriptive name for this QR code",
  },
  {
    name: "whatsappPhone",
    label: "WhatsApp Phone Number (Optional)",
    htmlType: "text",
    required: false,
    zodSchema: z.string().optional(),
    placeholder: "4520429116",
    description: "Phone number without + or spaces (e.g., 4520429116)",
  },
  {
    name: "whatsappMessage",
    label: "WhatsApp Message (Optional)",
    htmlType: "textarea",
    required: false,
    zodSchema: z.string().optional(),
    placeholder: "Check in",
    description: "Pre-filled message for WhatsApp",
    rows: 2,
  },
  {
    name: "redirectUrl",
    label: "Custom Redirect URL",
    htmlType: "text",
    required: false,
    zodSchema: z.string().url("Must be a valid URL").optional(),
    placeholder: "https://example.com",
    description:
      "Leave empty to use WhatsApp fields above, or provide custom URL",
  },
] as const;

const editFields = [
  {
    name: "name",
    label: "Name",
    htmlType: "text",
    required: true,
    zodSchema: z.string().min(1, "Name is required").max(200),
    placeholder: "Check-in QR Code",
  },
  {
    name: "whatsappPhone",
    label: "WhatsApp Phone Number (Optional)",
    htmlType: "text",
    required: false,
    zodSchema: z.string().optional(),
    placeholder: "4520429116",
    description: "Phone number without + or spaces (e.g., 4520429116)",
  },
  {
    name: "whatsappMessage",
    label: "WhatsApp Message (Optional)",
    htmlType: "textarea",
    required: false,
    zodSchema: z.string().optional(),
    placeholder: "Check in",
    description: "Pre-filled message for WhatsApp",
    rows: 2,
  },
  {
    name: "redirectUrl",
    label: "Custom Redirect URL",
    htmlType: "text",
    required: false,
    zodSchema: z.string().url("Must be a valid URL").optional(),
    placeholder: "https://example.com",
    description:
      "Leave empty to use WhatsApp fields above, or provide custom URL",
  },
] as const;

const { schema: createSchema, formDefinition: createFormDefinition } =
  buildZodSchema(createFields);
const { schema: editSchema, formDefinition: editFormDefinition } =
  buildZodSchema(editFields);

function buildRedirectUrl(data: {
  redirectUrl?: string;
  whatsappPhone?: string;
  whatsappMessage?: string;
}): string | null {
  if (data.redirectUrl) {
    return data.redirectUrl;
  }

  if (data.whatsappPhone) {
    const message = data.whatsappMessage || "";
    return `https://wa.me/${data.whatsappPhone}?text=${encodeURIComponent(message)}`;
  }

  return null;
}

function parseWhatsAppUrl(url: string): {
  phone?: string;
  message?: string;
} | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "wa.me") {
      const phone = urlObj.pathname.substring(1);
      const message = urlObj.searchParams.get("text") || undefined;
      return { phone, message };
    }
  } catch (e) {
    // Invalid URL
  }
  return null;
}

export const qrCodesRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const db = drizzle(c.env.DB);
    const qrCodes = await listQrCodes(db);

    const createForm = HForm(createFormDefinition, {
      id: "create-qr-code-form",
      method: "POST",
      action: lk(AppLink.AdminQRCodes),
    });

    return c.render(<QrCodesListView qrCodes={qrCodes} form={createForm} />, {
      title: "QR Codes - Gozy Admin",
    });
  })
  .post("/", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const formData = await c.req.parseBody();
    const parseResult = createSchema.safeParse(formData);

    const createForm = HForm(createFormDefinition, {
      id: "create-qr-code-form",
      method: "POST",
      action: lk(AppLink.AdminQRCodes),
    });

    if (!parseResult.success) {
      const errors = createForm.handleValidation(parseResult);
      const db = drizzle(c.env.DB);
      const qrCodes = await listQrCodes(db);

      return c.render(
        <QrCodesListView
          qrCodes={qrCodes}
          form={createForm}
          formData={formData}
          formErrors={errors}
        />,
        {
          title: "QR Codes - Gozy Admin",
        },
      );
    }

    const redirectUrl = buildRedirectUrl({
      redirectUrl: parseResult.data.redirectUrl,
      whatsappPhone: parseResult.data.whatsappPhone,
      whatsappMessage: parseResult.data.whatsappMessage,
    });

    if (!redirectUrl) {
      const errors = {
        redirectUrl:
          "Either provide a custom URL or fill in WhatsApp phone number",
      };
      const db = drizzle(c.env.DB);
      const qrCodes = await listQrCodes(db);

      return c.render(
        <QrCodesListView
          qrCodes={qrCodes}
          form={createForm}
          formData={formData}
          formErrors={errors}
        />,
        {
          title: "QR Codes - Gozy Admin",
        },
      );
    }

    const db = drizzle(c.env.DB);
    const result = await createQrCode(db, {
      shortCode: parseResult.data.shortCode,
      name: parseResult.data.name,
      redirectUrl,
      createdBy: user.id,
    });

    if (!result.success) {
      const errors = { shortCode: result.error };
      const qrCodes = await listQrCodes(db);

      return c.render(
        <QrCodesListView
          qrCodes={qrCodes}
          form={createForm}
          formData={formData}
          formErrors={errors}
        />,
        {
          title: "QR Codes - Gozy Admin",
        },
      );
    }

    return c.redirect(
      lk(AppLink.AdminQRCodeDetail, { id: parseResult.data.shortCode }),
    );
  })
  .get("/:id", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const shortCode = c.req.param("id");
    const db = drizzle(c.env.DB);
    const qrCode = await getQrCodeByShortCode(db, shortCode);

    if (!qrCode) {
      return c.notFound();
    }

    const stats = await getQrCodeStats(db, qrCode.id);

    const protocol = c.req.header("x-forwarded-proto") || "http";
    const host = c.req.header("host") || "localhost:8787";
    const qrUrl = `${protocol}://${host}/qr/${qrCode.shortCode}`;

    const qrCodeSvg = await QRCode.toString(qrUrl, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      width: 400,
    });

    const editForm = HForm(editFormDefinition, {
      id: "edit-qr-code-form",
      method: "POST",
      action: lk(AppLink.AdminQRCodeDetail, { id: shortCode }),
    });

    const whatsappData = parseWhatsAppUrl(qrCode.redirectUrl);
    const formValues = {
      name: qrCode.name,
      whatsappPhone: whatsappData?.phone,
      whatsappMessage: whatsappData?.message,
      redirectUrl: whatsappData ? undefined : qrCode.redirectUrl,
    };

    return c.render(
      <QrCodeDetailView
        qrCode={qrCode}
        qrCodeSvg={qrCodeSvg}
        qrUrl={qrUrl}
        stats={stats}
        form={editForm}
        formValues={formValues}
      />,
      {
        title: `${qrCode.name} - QR Code - Gozy Admin`,
      },
    );
  })
  .post("/:id", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const shortCode = c.req.param("id");
    const db = drizzle(c.env.DB);
    const qrCode = await getQrCodeByShortCode(db, shortCode);

    if (!qrCode) {
      return c.notFound();
    }

    const formData = await c.req.parseBody();
    const parseResult = editSchema.safeParse(formData);

    const editForm = HForm(editFormDefinition, {
      id: "edit-qr-code-form",
      method: "POST",
      action: lk(AppLink.AdminQRCodeDetail, { id: shortCode }),
    });

    if (!parseResult.success) {
      const errors = editForm.handleValidation(parseResult);
      const stats = await getQrCodeStats(db, qrCode.id);

      const protocol = c.req.header("x-forwarded-proto") || "http";
      const host = c.req.header("host") || "localhost:8787";
      const qrUrl = `${protocol}://${host}/qr/${qrCode.shortCode}`;

      const qrCodeSvg = await QRCode.toString(qrUrl, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 2,
        width: 400,
      });

      return c.render(
        <QrCodeDetailView
          qrCode={qrCode}
          qrCodeSvg={qrCodeSvg}
          qrUrl={qrUrl}
          stats={stats}
          form={editForm}
          formData={formData}
          formErrors={errors}
        />,
        {
          title: `${qrCode.name} - QR Code - Gozy Admin`,
        },
      );
    }

    const redirectUrl = buildRedirectUrl({
      redirectUrl: parseResult.data.redirectUrl,
      whatsappPhone: parseResult.data.whatsappPhone,
      whatsappMessage: parseResult.data.whatsappMessage,
    });

    if (!redirectUrl) {
      const errors = {
        redirectUrl:
          "Either provide a custom URL or fill in WhatsApp phone number",
      };
      const stats = await getQrCodeStats(db, qrCode.id);

      const protocol = c.req.header("x-forwarded-proto") || "http";
      const host = c.req.header("host") || "localhost:8787";
      const qrUrl = `${protocol}://${host}/qr/${qrCode.shortCode}`;

      const qrCodeSvg = await QRCode.toString(qrUrl, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 2,
        width: 400,
      });

      return c.render(
        <QrCodeDetailView
          qrCode={qrCode}
          qrCodeSvg={qrCodeSvg}
          qrUrl={qrUrl}
          stats={stats}
          form={editForm}
          formData={formData}
          formErrors={errors}
        />,
        {
          title: `${qrCode.name} - QR Code - Gozy Admin`,
        },
      );
    }

    await updateQrCode(db, shortCode, {
      name: parseResult.data.name,
      redirectUrl,
    });

    return c.redirect(lk(AppLink.AdminQRCodeDetail, { id: shortCode }));
  })
  .post("/:id/delete", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const shortCode = c.req.param("id");
    const db = drizzle(c.env.DB);

    await deleteQrCode(db, shortCode);

    return c.redirect(lk(AppLink.AdminQRCodes));
  });
