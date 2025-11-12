import { Hono } from "hono";
import QRCode from "qrcode";
import { Bindings } from "../..";
import { requireAdmin } from "../../lib/adminAuth";
import { QRGeneratorView } from "../../views/admin/qrgenerator";

export const qrGeneratorRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const phoneNumber = "4520429116";

    return c.render(<QRGeneratorView phoneNumber={phoneNumber} />, {
      title: "QR Code Generator - Gozy Admin",
    });
  })
  .post("/", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const formData = await c.req.formData();
    const message = (formData.get("message") as string) || "Check in";
    const phoneNumber = (formData.get("phoneNumber") as string) || "4520429116";

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    const qrCodeSvg = await QRCode.toString(whatsappUrl, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      width: 400,
    });

    return c.render(
      <QRGeneratorView
        qrCodeSvg={qrCodeSvg}
        message={message}
        phoneNumber={phoneNumber}
      />,
      {
        title: "QR Code Generator - Gozy Admin",
      },
    );
  });
