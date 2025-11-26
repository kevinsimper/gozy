import { raw } from "hono/html";
import { AppLink, lk } from "../../lib/links";
import type { User } from "../../db/schema";
import type { MessageWithFile } from "../../models/message";

type ConversationDetailProps = {
  user: User;
  messages: MessageWithFile[];
};

export function ConversationDetail({
  user,
  messages,
}: ConversationDetailProps) {
  return (
    <div class="flex flex-col">
      {/* Header */}
      <div class="p-4 border-b border-gray-800 bg-gray-900">
        <div class="flex items-center justify-between">
          <div>
            <a
              href={lk(AppLink.AdminConversations)}
              class="text-blue-500 hover:text-blue-400 text-sm mb-2 inline-block"
            >
              Back to Conversations
            </a>
            <h1 class="text-xl font-bold">{user.name}</h1>
            <p class="text-gray-400 text-sm font-mono">{user.phoneNumber}</p>
          </div>
          <div class="flex items-center gap-3">
            {user.manualMode && (
              <span class="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Manual Mode Active
              </span>
            )}
            <form
              method="post"
              action={
                lk(AppLink.AdminConversationDetail, {
                  id: String(user.id),
                }).replace("/conversations/", "/conversations/") +
                "/toggle-manual-mode"
              }
            >
              <button
                type="submit"
                class={`text-sm px-3 py-1.5 rounded transition-colors ${
                  user.manualMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {user.manualMode ? "Disable Manual Mode" : "Enable Manual Mode"}
              </button>
            </form>
            <a
              href={lk(AppLink.AdminUserDetail, { id: String(user.id) })}
              class="text-sm bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded"
            >
              View User
            </a>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        id="messages-container"
        class="overflow-y-auto p-4 space-y-4 bg-gray-950"
        style="max-height: 60vh;"
      >
        {messages.length === 0 ? (
          <div class="text-center text-gray-500 py-8">No messages yet</div>
        ) : (
          messages.map((message) => {
            const isUser = message.role === "user";
            const isAdminMessage = message.sentByAdminId !== null;
            const isDuringManualMode = message.sentDuringManualMode;
            const timestamp = new Date(message.createdAt);

            return (
              <div
                key={message.id}
                class={`flex ${isUser ? "justify-start" : "justify-end"}`}
              >
                <div
                  class={`max-w-[70%] rounded-lg p-3 ${
                    isUser
                      ? isDuringManualMode
                        ? "bg-green-700 text-white"
                        : "bg-gray-800 text-white"
                      : isAdminMessage
                        ? "bg-green-700 text-white"
                        : "bg-blue-600 text-white"
                  }`}
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-semibold opacity-75">
                      {isUser
                        ? isDuringManualMode
                          ? "User (Manual mode)"
                          : "User"
                        : isAdminMessage
                          ? "Admin"
                          : "Gozy (AI)"}
                    </span>
                    <span class="text-xs opacity-50">
                      {timestamp.toLocaleString("da-DK")}
                    </span>
                  </div>
                  {message.file &&
                    message.file.mimeType.startsWith("image/") && (
                      <img
                        src={lk(AppLink.ApiFiles, {
                          publicId: message.publicId,
                        })}
                        alt="Attached image"
                        class="max-w-full rounded mb-2"
                        style="max-height: 200px;"
                      />
                    )}
                  <p class="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            );
          })
        )}
        {raw(`
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const container = document.getElementById('messages-container');
              if (container) {
                container.scrollTop = container.scrollHeight;
              }
            });
          </script>
        `)}
      </div>

      {/* Message Input */}
      <div class="p-4 border-t border-gray-800 bg-gray-900">
        <form
          method="post"
          action={lk(AppLink.AdminConversationSendMessage, {
            id: String(user.id),
          })}
          class="flex gap-3"
        >
          <textarea
            name="message"
            rows={2}
            placeholder="Type your message..."
            class="flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors self-end"
          >
            Send as Admin
          </button>
        </form>
      </div>
    </div>
  );
}
