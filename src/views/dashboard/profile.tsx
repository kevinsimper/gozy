import type { User, RttLocation, DriverTaxiId } from "../../db/schema";

type ProfilePageProps = {
  user: User;
  formHtml: Promise<string>;
  preferredLocation?: RttLocation | null;
  success?: boolean;
  taxiIds?: DriverTaxiId[];
};

export function ProfilePage(props: ProfilePageProps) {
  const { user, formHtml, preferredLocation, success, taxiIds = [] } = props;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profil</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {success && (
          <div className="mb-4 rounded bg-green-100 border border-green-300 px-4 py-3 text-green-700 text-sm">
            Profil opdateret succesfuldt
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Rediger din profil
            </h2>
            <div id="profile-form-container">{formHtml}</div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Taxi ID
            </h2>
            <div id="taxi-ids-section">
              {taxiIds.length > 0 && (
                <div className="mb-4 space-y-2">
                  {taxiIds.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-gray-50 rounded px-4 py-2"
                    >
                      <span className="flex-1 text-gray-900">
                        {item.taxiId}
                      </span>
                      <form
                        hx-post={`/dashboard/profile/taxi-id/delete/${item.id}`}
                        hx-target="#taxi-ids-section"
                        hx-swap="outerHTML"
                      >
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800"
                          title="Slet"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            className="h-5 w-5"
                          >
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              <form
                hx-post="/dashboard/profile/taxi-id/add"
                hx-target="#taxi-ids-section"
                hx-swap="outerHTML"
                className="flex gap-2"
              >
                <input
                  type="text"
                  name="taxiId"
                  placeholder="Indtast nyt Taxi ID"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Tilføj
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Kontoinformation
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Telefon</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.phoneNumber}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Seneste login</p>
                <p className="text-lg font-medium text-gray-900">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString("da-DK")
                    : "Første gang"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
