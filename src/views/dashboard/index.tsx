import type { User } from "../../db/schema";

type DashboardPageProps = {
  user: User;
};

export function DashboardPage(props: DashboardPageProps) {
  const { user } = props;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Velkommen, {user.name}!
            </h2>
          </div>

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
  );
}
