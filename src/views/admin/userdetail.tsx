import { AppLink, lk } from "../../lib/links";
import type { User } from "../../db/schema";

type UserDetailProps = {
  user: User;
  messageSent?: boolean;
  messageError?: string;
};

function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("da-DK", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function UserDetail({
  user,
  messageSent,
  messageError,
}: UserDetailProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <a
          href={lk(AppLink.AdminTable, { tableName: "users" })}
          class="inline-flex items-center text-blue-500 hover:text-blue-400 text-sm mb-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4 mr-1"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to Users
        </a>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">User Detail</h1>
            <p class="text-gray-400 text-sm mt-1">User ID: {user.id}</p>
          </div>
          <div class="flex gap-2">
            <a
              href={lk(AppLink.AdminUserSystemPrompt, {
                id: String(user.id),
              })}
              class="inline-flex items-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4 mr-2"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
              System Prompt
            </a>
            <a
              href={lk(AppLink.AdminTableEdit, {
                tableName: "users",
                id: String(user.id),
              })}
              class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-4 w-4 mr-2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </a>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Information */}
        <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div class="p-4 border-b border-gray-800">
            <h2 class="text-sm font-semibold text-gray-300">
              User Information
            </h2>
          </div>
          <div class="divide-y divide-gray-800">
            <div class="p-4">
              <div class="text-xs font-semibold text-gray-400 uppercase mb-1">
                Name
              </div>
              <div class="text-sm text-white">{user.name}</div>
            </div>
            <div class="p-4">
              <div class="text-xs font-semibold text-gray-400 uppercase mb-1">
                Phone Number
              </div>
              <div class="text-sm text-white font-mono">{user.phoneNumber}</div>
            </div>
            <div class="p-4">
              <div class="text-xs font-semibold text-gray-400 uppercase mb-1">
                Email
              </div>
              <div class="text-sm text-white">{user.email || "-"}</div>
            </div>
            <div class="p-4">
              <div class="text-xs font-semibold text-gray-400 uppercase mb-1">
                Created At
              </div>
              <div class="text-sm text-white">{formatDate(user.createdAt)}</div>
            </div>
            <div class="p-4">
              <div class="text-xs font-semibold text-gray-400 uppercase mb-1">
                Last Login
              </div>
              <div class="text-sm text-white">
                {formatDate(user.lastLoginAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Send Message */}
        <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div class="p-4 border-b border-gray-800">
            <h2 class="text-sm font-semibold text-gray-300">
              Send WhatsApp Message
            </h2>
          </div>
          <div class="p-4">
            {messageSent && (
              <div class="mb-4 p-3 bg-green-900/30 border border-green-700 rounded text-sm text-green-400">
                Message sent successfully!
              </div>
            )}
            {messageError && (
              <div class="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
                Error: {messageError}
              </div>
            )}
            <form
              method="post"
              action={lk(AppLink.AdminUserSendMessage, { id: String(user.id) })}
            >
              <div class="mb-4">
                <label
                  for="message"
                  class="block text-xs font-semibold text-gray-400 uppercase mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  class="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              <button
                type="submit"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Raw JSON */}
      <div class="mt-6 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-800">
          <h2 class="text-sm font-semibold text-gray-300">Raw JSON</h2>
        </div>
        <div class="p-4">
          <pre class="text-xs font-mono text-gray-400 overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
