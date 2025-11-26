import { PropsWithChildren } from "hono/jsx";
import { AppLink, lk } from "../../lib/links";
import { html, raw } from "hono/html";
import { getAllTableNames, formatTableName } from "../../lib/tableRegistry";

export function AdminLayout({ children }: PropsWithChildren) {
  return (
    <div class="bg-black text-white min-h-screen">
      <div class="relative">
        {/* Sidebar */}
        <div class="flex fixed top-0 bottom-0 left-0 h-screen overflow-y-auto flex-col border-r border-gray-800 bg-black/50 backdrop-blur-sm w-52 z-10">
          <div class="p-4">
            <a
              href={lk(AppLink.Root)}
              class="flex items-center gap-1.5 font-bold text-base text-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Gozy Admin
            </a>
          </div>
          <div class="flex-1 px-3 overflow-auto">
            <div class="space-y-0.5 py-1.5">
              <a
                href={lk(AppLink.AdminDashboard)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5 h-3.5 w-3.5"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
                Dashboard
              </a>
              <a
                href={lk(AppLink.AdminConversations)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5 h-3.5 w-3.5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Conversations
              </a>
              <a
                href={lk(AppLink.AdminDocuments)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5 h-3.5 w-3.5"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Documents
              </a>
              <a
                href={lk(AppLink.AdminReminders)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5 h-3.5 w-3.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Reminders
              </a>
              <a
                href={lk(AppLink.AdminDocumentTest)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5 h-3.5 w-3.5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M12 18v-6" />
                  <path d="m9 15 3 3 3-3" />
                </svg>
                Document Test
              </a>
              <a
                href={lk(AppLink.AdminQRGenerator)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5 h-3.5 w-3.5"
                >
                  <rect width="5" height="5" x="3" y="3" rx="1" />
                  <rect width="5" height="5" x="16" y="3" rx="1" />
                  <rect width="5" height="5" x="3" y="16" rx="1" />
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                  <path d="M21 21v.01" />
                  <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                  <path d="M3 12h.01" />
                  <path d="M12 3h.01" />
                  <path d="M12 16v.01" />
                  <path d="M16 12h1" />
                  <path d="M21 12v.01" />
                  <path d="M12 21v-1" />
                </svg>
                QR Generator
              </a>
              <a
                href={lk(AppLink.AdminQRCodes)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5 h-3.5 w-3.5"
                >
                  <rect width="5" height="5" x="3" y="3" rx="1" />
                  <rect width="5" height="5" x="16" y="3" rx="1" />
                  <rect width="5" height="5" x="3" y="16" rx="1" />
                  <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                  <path d="M21 21v.01" />
                  <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                  <path d="M3 12h.01" />
                  <path d="M12 3h.01" />
                  <path d="M12 16v.01" />
                  <path d="M16 12h1" />
                  <path d="M21 12v.01" />
                  <path d="M12 21v-1" />
                </svg>
                QR Codes
              </a>
              <a
                href={lk(AppLink.AdminHelpdesk)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5 h-3.5 w-3.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
                Helpdesk
              </a>
              <a
                href={lk(AppLink.AdminNotifications)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1.5 h-3.5 w-3.5"
                >
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                Notifications
              </a>
            </div>

            <div class="mt-4">
              <div class="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                Tables
              </div>
              <div class="space-y-0.5 py-1.5">
                {getAllTableNames().map((tableName) => (
                  <a
                    key={tableName}
                    href={lk(AppLink.AdminTable, { tableName })}
                    class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="mr-1.5 h-3.5 w-3.5"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <path d="M3 9h18" />
                      <path d="M3 15h18" />
                      <path d="M9 3v18" />
                    </svg>
                    {formatTableName(tableName)}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div class="p-3 mt-auto border-t border-gray-800">
            <a
              href={lk(AppLink.AdminDeveloper)}
              class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors mb-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="mr-1.5 h-3.5 w-3.5"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              Developer
            </a>
            <a
              href={lk(AppLink.Logout)}
              class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-800 text-gray-300 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="mr-1.5 h-3.5 w-3.5"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Logout
            </a>
          </div>
        </div>
        {/* Main Content */}
        <div class="ml-52">
          {/* Top Bar */}
          <div class="sticky top-0 border-b border-gray-800 bg-black/50 backdrop-blur-sm z-5">
            <div class="flex h-12 items-center px-4">
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4 text-blue-500 mr-1.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
                <span class="font-semibold text-xs">Admin Control Panel</span>
              </div>
            </div>
          </div>
          <div class="text-xs">{children}</div>
        </div>
      </div>
      {raw(`
        <script src="https://unpkg.com/htmx.org@2.0.3/dist/htmx.min.js"></script>
        <script src="https://unpkg.com/htmx-ext-sse@2.2.2/sse.js"></script>
      `)}
    </div>
  );
}
