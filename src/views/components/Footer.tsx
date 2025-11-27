export function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <img
            src="/gozy_logo.png"
            alt="Gozy Logo"
            className="h-10 w-auto mx-auto mb-4"
          />
          <div className="mt-4 flex justify-center space-x-4">
            <a
              href="/terms"
              className="text-sm text-gray-400 hover:text-white no-underline"
            >
              Betingelser
            </a>
            <a
              href="/privacy"
              className="text-sm text-gray-400 hover:text-white no-underline"
            >
              Privatlivspolitik
            </a>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            GOZY A/S &bull; CVR: 46036824
          </p>
          <p className="mt-2 text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Gozy. Alle rettigheder
            forbeholdes.
          </p>
        </div>
      </div>
    </footer>
  );
}
