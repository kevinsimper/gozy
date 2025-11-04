type DashboardHeaderProps = {
  currentPath?: string;
};

export function DashboardHeader(props: DashboardHeaderProps) {
  const { currentPath = "/" } = props;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Gozy</h1>
          </div>

          <nav className="flex gap-6">
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

          <div>
            <form method="post" action="/logout">
              <button
                type="submit"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Log ud
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
