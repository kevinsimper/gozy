import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { Layout } from "../../views/layout";
import { getAllWhatsappMessages } from "../../models/whatsapp-message";
import { Bindings } from "../../index";

export const whatsappMessagesRoute = new Hono<{ Bindings: Bindings }>()
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
  .get("/whatsapp-messages", async (c) => {
    const messages = await getAllWhatsappMessages(c, 100);

    return c.render(
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
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
              <h1 className="text-xl font-bold text-white">
                WhatsApp Messages Log
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                DEV ENVIRONMENT - All outbound messages
              </p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-medium">
                  {messages.length} messages
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  Last {messages.length} messages
                </span>
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p>No messages sent yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-4 hover:bg-gray-750">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          msg.status === "sent" ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {msg.status === "sent" ? (
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
                        ) : (
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white font-mono">
                            {msg.phoneNumber}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              msg.status === "sent"
                                ? "bg-green-900 text-green-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {msg.status}
                          </span>
                          {msg.userId && (
                            <span className="text-xs text-gray-500">
                              User #{msg.userId}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 bg-gray-900 p-3 rounded border border-gray-700 whitespace-pre-wrap break-words">
                          {msg.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          {new Date(msg.createdAt).toLocaleString("da-DK", {
                            dateStyle: "short",
                            timeStyle: "medium",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 bg-gray-800 rounded-lg border border-gray-700 p-4">
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
              <div>
                <p className="font-mono">
                  Messages are logged here whether they are actually sent or
                  skipped.
                </p>
                <p className="font-mono mt-1">
                  Set WHATSAPP_ENABLED=false in staging to skip actual sending.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>,
      {
        title: "WhatsApp Messages - Gozy Dev",
      },
    );
  });
