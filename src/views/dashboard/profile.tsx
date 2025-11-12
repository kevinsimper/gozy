import type { User, RttLocation } from "../../db/schema";

type ProfilePageProps = {
  user: User;
  formHtml: Promise<string>;
  preferredLocation?: RttLocation | null;
  success?: boolean;
};

export function ProfilePage(props: ProfilePageProps) {
  const { user, formHtml, preferredLocation, success } = props;

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
