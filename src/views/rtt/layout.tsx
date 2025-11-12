import { PropsWithChildren } from "hono/jsx";
import { AppLink, lk } from "../../lib/links";

export function RttLayout({ children }: PropsWithChildren) {
  return (
    <div class="bg-gray-50 text-gray-900 min-h-screen">
      <div class="relative">
        {/* Sidebar */}
        <div class="flex fixed top-0 bottom-0 left-0 h-screen overflow-y-auto flex-col border-r border-gray-200 bg-white shadow-sm w-52 z-10">
          <div class="p-4">
            <a
              href={lk(AppLink.RttCheckins)}
              class="flex items-center gap-1.5 font-bold text-base text-blue-600"
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              RTT Portal
            </a>
          </div>
          <div class="flex-1 px-3 overflow-auto">
            <div class="space-y-0.5 py-1.5">
              <a
                href={lk(AppLink.RttCheckins)}
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
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
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Check-ins
              </a>
            </div>
          </div>
          <div class="p-3 mt-auto border-t border-gray-200">
            <form method="post" action={lk(AppLink.Logout)}>
              <button
                type="submit"
                class="flex items-center w-full justify-start h-8 text-xs rounded px-2 py-1.5 hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
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
              </button>
            </form>
          </div>
        </div>
        {/* Main Content */}
        <div class="ml-52">
          {/* Top Bar */}
          <div class="sticky top-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm z-5">
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
                  class="h-4 w-4 text-blue-600 mr-1.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span class="font-semibold text-xs">RTT Staff Portal</span>
              </div>
            </div>
          </div>
          <div class="text-xs">{children}</div>
        </div>
      </div>
    </div>
  );
}
