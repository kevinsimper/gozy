import { AppLink, lk } from "../lib/links";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <img
                src="/gozy_logo.png"
                alt="Gozy"
                className="h-16 sm:h-20 w-auto"
              />
            </div>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto">
              Din digitale hub som taxichauffør
            </p>

            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Gozy hjælper dig med at holde styr på dokumenter, påmindelser og
              meget mere - alt sammen direkte fra WhatsApp.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={lk(AppLink.Signup)}
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors no-underline"
              >
                Kom i gang
              </a>

              <a
                href={lk(AppLink.Login)}
                className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors no-underline"
              >
                Log ind
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
