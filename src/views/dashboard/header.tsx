import { raw } from "hono/html";

type DashboardHeaderProps = {
  currentPath?: string;
};

export function DashboardHeader(props: DashboardHeaderProps) {
  const { currentPath = "/" } = props;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Gozy</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              <a
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === "/dashboard"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </a>
              <a
                href="/dashboard/documents"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === "/dashboard/documents"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dokumenter
              </a>
              <a
                href="/dashboard/chat"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPath === "/dashboard/chat"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Chat
              </a>
            </nav>

            {/* Desktop Logout */}
            <div className="hidden md:block">
              <form method="post" action="/logout">
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Log ud
                </button>
              </form>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-button"
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Sidebar */}
      <aside
        id="mobile-sidebar"
        className="fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-xl transform translate-x-full transition-transform duration-300 ease-in-out md:hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-xl font-bold">Menu</span>
          <button
            id="mobile-menu-close"
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        <nav className="p-4">
          <a
            href="/dashboard"
            className={`block py-3 px-3 rounded-md text-base font-medium transition-colors ${
              currentPath === "/dashboard"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Dashboard
          </a>
          <a
            href="/dashboard/documents"
            className={`block py-3 px-3 rounded-md text-base font-medium transition-colors ${
              currentPath === "/dashboard/documents"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Dokumenter
          </a>
          <a
            href="/dashboard/chat"
            className={`block py-3 px-3 rounded-md text-base font-medium transition-colors ${
              currentPath === "/dashboard/chat"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            Chat
          </a>

          <div className="border-t border-gray-200 mt-4 pt-4">
            <form method="post" action="/logout">
              <button
                type="submit"
                className="block w-full text-center py-3 text-base font-medium bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Log ud
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      <div
        id="mobile-overlay"
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 hidden md:hidden"
      ></div>

      {/* Mobile Menu Script */}
      <script>
        {raw(`
          document.addEventListener('DOMContentLoaded', function() {
            const menuButton = document.getElementById('mobile-menu-button');
            const closeButton = document.getElementById('mobile-menu-close');
            const sidebar = document.getElementById('mobile-sidebar');
            const overlay = document.getElementById('mobile-overlay');

            function openMenu() {
              sidebar.classList.remove('translate-x-full');
              sidebar.classList.add('translate-x-0');
              overlay.classList.remove('hidden');
              document.body.classList.add('overflow-hidden');
            }

            function closeMenu() {
              sidebar.classList.add('translate-x-full');
              sidebar.classList.remove('translate-x-0');
              overlay.classList.add('hidden');
              document.body.classList.remove('overflow-hidden');
            }

            if (menuButton) {
              menuButton.addEventListener('click', openMenu);
            }

            if (closeButton) {
              closeButton.addEventListener('click', closeMenu);
            }

            if (overlay) {
              overlay.addEventListener('click', closeMenu);
            }
          });
        `)}
      </script>
    </>
  );
}
