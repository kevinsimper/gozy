import { AppLink, lk } from "../../lib/links";

export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
            <a href="/">
              <img
                src="/gozy_logo.png"
                alt="Gozy Logo"
                className="h-10 w-auto"
              />
            </a>
          </div>
          <nav className="flex items-center space-x-4">
            <a
              href={lk(AppLink.Login)}
              className="text-base font-medium text-blue-600 hover:text-blue-500 no-underline"
            >
              Log ind
            </a>
            <a
              href={lk(AppLink.Signup)}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors no-underline"
            >
              Opret konto
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
