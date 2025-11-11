import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Layout } from "../../views/layout";
import { handleTextMessage } from "../../lib/conversation";
import { Bindings } from "../../index";
import { uploadAndCreateFile } from "../../lib/fileUpload";
import { DatabaseFile } from "../../models/file";
import { sendEmail } from "../../lib/email";

export const whatsappMockRoute = new Hono<{ Bindings: Bindings }>()
  .use(
    "*",
    jsxRenderer(
      ({ children, title }) => {
        return <Layout title={title}>{children}</Layout>;
      },
      {
        docType: true,
      },
    ),
  )
  .get("/whatsapp-mock", async (c) => {
    const phoneNumber = c.req.query("phone") || "";
    const lastResponse = c.req.query("response") || "";

    return c.render(
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WhatsApp Mock</h1>
              <p className="text-xs text-gray-400 font-mono">DEV ENVIRONMENT</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300 font-medium">
                    Test Webhook
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  /api/whatsapp
                </span>
              </div>
            </div>

            <div className="p-6">
              {lastResponse && (
                <div className="mb-6 bg-gray-900 border border-green-600 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-white"
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
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-green-400 mb-1">
                        RESPONSE RECEIVED
                      </p>
                      <p className="text-sm text-gray-200 bg-gray-800 p-3 rounded border border-gray-700 font-mono">
                        {lastResponse}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form
                method="post"
                action="/dev/whatsapp-mock"
                enctype="multipart/form-data"
                className="space-y-5"
              >
                <div>
                  <label
                    for="phoneNumber"
                    className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">
                      +45
                    </span>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={phoneNumber}
                      placeholder="40360565"
                      required
                      pattern="\d{8}"
                      maxLength={8}
                      className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500 font-mono"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 font-mono">
                    8 digits → converted to +45XXXXXXXX@c.us
                  </p>
                </div>

                <div>
                  <label
                    for="image"
                    className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide"
                  >
                    Image (Optional)
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 font-mono">
                    Supported: JPG, PNG, GIF, WebP
                  </p>
                </div>

                <div>
                  <label
                    for="message"
                    className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide"
                  >
                    Message Content
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Hej, hvad kan du hjælpe mig med?"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white placeholder-gray-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 font-mono">
                    Optional when sending an image
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Send to Webhook
                </button>
              </form>
            </div>

            <div className="bg-gray-900 px-4 py-3 border-t border-gray-700">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-mono">
                  Messages persist to database and can be viewed in dashboard
                  chat
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>,
      {
        title: "WhatsApp Mock - Gozy Dev",
      },
    );
  })
  .post("/whatsapp-mock", async (c) => {
    const body = await c.req.parseBody({ all: true });
    console.log("Form submission:", body);
    const phoneNumber = body.phoneNumber as string;
    const message = (body.message as string) || "";
    const imageFile = body.image;

    console.log("Form submission:", {
      phoneNumber,
      message: message ? message.substring(0, 50) : "(empty)",
      hasImage: imageFile instanceof File,
      imageSize: imageFile instanceof File ? imageFile.size : 0,
    });

    if (!phoneNumber) {
      return c.redirect("/dev/whatsapp-mock?error=missing_phone");
    }

    const hasFile = imageFile instanceof File && imageFile.size > 0;

    if (!message && !hasFile) {
      return c.redirect("/dev/whatsapp-mock?error=missing_content");
    }

    const normalizedPhone = `+45${phoneNumber}`;

    let file: DatabaseFile | undefined;

    if (hasFile && imageFile instanceof File) {
      try {
        file = await uploadAndCreateFile(c, imageFile);
        console.log(`File uploaded successfully, fileId: ${file.id}`);
      } catch (error) {
        console.error("Error uploading file:", error);
        return c.redirect("/dev/whatsapp-mock?error=file_upload_failed");
      }
    }

    const result = await handleTextMessage(c, normalizedPhone, message, file);

    let responseText = "";
    if (result.ok) {
      responseText = result.val;
    } else {
      responseText = `Error: ${result.err}`;
    }

    return c.redirect(
      `/dev/whatsapp-mock?phone=${encodeURIComponent(phoneNumber)}&response=${encodeURIComponent(responseText)}`,
    );
  });
