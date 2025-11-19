import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Bindings } from "../../index";
import { Layout } from "../../views/layout";
import { whatsappMockRoute } from "./whatsapp-mock";
import { whatsappMessagesRoute } from "./whatsapp-messages";

export const devRoutes = new Hono<{ Bindings: Bindings }>()
  .use("*", async (c, next) => {
    if (c.env.ENVIRONMENT === "production") {
      return c.text("Access Denied", 403);
    }
    return await next();
  })
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
  .get("/", async (c) => {
    return c.render(
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
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
              <h1 className="text-2xl font-bold text-white">
                Development Tools
              </h1>
              <p className="text-xs text-gray-400 font-mono">DEV ENVIRONMENT</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <a
              href="/dev/whatsapp-mock"
              className="block bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
                    <svg
                      className="w-5 h-5 text-white"
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
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    WhatsApp Mock
                  </h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Send test messages to the WhatsApp webhook with optional image
                  uploads. Test conversation flows and AI responses in a
                  controlled environment.
                </p>
                <div className="flex items-center text-xs text-green-400 font-mono">
                  <span>Open tool</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>

            <a
              href="/dev/whatsapp-messages"
              className="block bg-gray-800 rounded-lg shadow-lg border border-gray-700 hover:border-green-500 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-500 transition-colors">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white">Messages Log</h2>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  View all outbound WhatsApp messages sent by the system.
                  Monitor message status, content, and delivery timestamps.
                </p>
                <div className="flex items-center text-xs text-green-400 font-mono">
                  <span>Open tool</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-4">
            <div className="flex items-start gap-2 text-xs text-gray-400">
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5"
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
              <p className="font-mono">
                These tools are only available in development and staging
                environments. Access is blocked in production.
              </p>
            </div>
          </div>
        </div>
      </div>,
      {
        title: "Dev Tools - Gozy",
      },
    );
  })
  .route("/", whatsappMockRoute)
  .route("/", whatsappMessagesRoute);
