import { User } from "../../db/schema";

type DashboardStats = {
  totalUsers: number;
  usersLast7Days: number;
  usersLast30Days: number;
  recentUsers: User[];
};

export function AdminDashboard({ stats }: { stats: DashboardStats }) {
  return (
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-xs mb-1">Total Users</p>
              <p class="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
            <div class="bg-blue-500/10 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-6 w-6 text-blue-500"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-xs mb-1">Last 7 Days</p>
              <p class="text-2xl font-bold">{stats.usersLast7Days}</p>
            </div>
            <div class="bg-green-500/10 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-6 w-6 text-green-500"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-xs mb-1">Last 30 Days</p>
              <p class="text-2xl font-bold">{stats.usersLast30Days}</p>
            </div>
            <div class="bg-purple-500/10 p-3 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-6 w-6 text-purple-500"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div class="bg-gray-900 border border-gray-800 rounded-lg">
        <div class="p-4 border-b border-gray-800">
          <h2 class="text-lg font-semibold">Recent Users</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-800">
              <tr>
                <th class="text-left p-3 text-gray-400 font-medium">ID</th>
                <th class="text-left p-3 text-gray-400 font-medium">Name</th>
                <th class="text-left p-3 text-gray-400 font-medium">
                  Phone Number
                </th>
                <th class="text-left p-3 text-gray-400 font-medium">Email</th>
                <th class="text-left p-3 text-gray-400 font-medium">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} class="text-center p-8 text-gray-500">
                    No users yet
                  </td>
                </tr>
              ) : (
                stats.recentUsers.map((user) => (
                  <tr
                    key={user.id}
                    class="border-b border-gray-800 last:border-0"
                  >
                    <td class="p-3 text-gray-300">{user.id}</td>
                    <td class="p-3 text-white">{user.name}</td>
                    <td class="p-3 text-gray-300">{user.phoneNumber}</td>
                    <td class="p-3 text-gray-300">{user.email || "-"}</td>
                    <td class="p-3 text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("da-DK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
