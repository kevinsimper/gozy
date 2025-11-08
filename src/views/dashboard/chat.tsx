import { AppLink, lk } from "../../lib/links";
import type { MessageWithFile } from "../../models/message";
import { raw } from "hono/html";

type ChatPageProps = {
  messages: MessageWithFile[];
};

export function ChatPage(props: ChatPageProps) {
  const { messages } = props;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-100">
      <div className="flex-1 overflow-hidden flex flex-col">
        {messages.length > 0 && (
          <div
            id="chat-messages"
            className="flex-1 p-6 space-y-4 overflow-y-auto max-w-7xl mx-auto w-full bg-white border-l border-r border-gray-200"
          >
            {messages.map((message) => {
              const timestamp = new Date(message.createdAt);
              const timeString = timestamp.toLocaleTimeString("da-DK", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const dateString = timestamp.toLocaleDateString("da-DK", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`flex items-baseline gap-2 mb-1 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <p className="text-sm font-medium text-gray-700">
                      {message.role === "user" ? "Du" : "Gozy"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {timeString} • {dateString}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg py-3 px-4 max-w-2xl ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.file &&
                      message.file.mimeType.startsWith("image/") && (
                        <img
                          src={`/dashboard/chat/files/${message.publicId}`}
                          alt={message.file.originalFilename}
                          className="max-w-sm rounded mb-2"
                          style="height: 300px; width: auto; object-fit: contain;"
                        />
                      )}
                    <p style="white-space: pre-wrap;">{message.content}</p>
                  </div>
                </div>
              );
            })}
            <script>
              {raw(`
                document.addEventListener('DOMContentLoaded', function() {
                  const container = document.getElementById('chat-messages');
                  if (container) {
                    container.scrollTop = container.scrollHeight;
                  }
                });
              `)}
            </script>
          </div>
        )}

        <div>
          <form
            method="post"
            action={lk(AppLink.DashboardChat)}
            enctype="multipart/form-data"
            className="max-w-7xl mx-auto w-full bg-white border-l border-r border-t border-gray-200 px-6 py-4"
          >
            <div className="flex flex-col gap-3">
              <div className="flex-1">
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Hvordan kan jeg hjælpe dig i dag?"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="file"
                    name="file"
                    id="file"
                    accept="image/*,application/pdf"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
