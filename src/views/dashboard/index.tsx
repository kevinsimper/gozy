import type { User } from "../../db/schema";

type DashboardPageProps = {
  user: User;
};

export function DashboardPage(props: DashboardPageProps) {
  const { user } = props;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Gozy Dashboard</h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Velkommen, {user.name}!
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Telefon</p>
                <p className="text-lg font-medium text-gray-900">{user.phoneNumber}</p>
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

            <div className="pt-4 border-t border-gray-200">
              <form method="post" action="/logout">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Log ud
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
