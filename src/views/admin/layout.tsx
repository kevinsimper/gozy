import { PropsWithChildren } from "hono/jsx";
import { AppLink, lk } from "../../lib/links";
import { html, raw } from "hono/html";

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
            </div>
          </div>
          <div class="p-3 mt-auto border-t border-gray-800">
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
