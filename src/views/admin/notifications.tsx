import { Notification } from "../../models/notification";
import { AppLink, lk } from "../../lib/links";

type AdminNotificationsProps = {
  notifications: Notification[];
};

export function AdminNotifications({ notifications }: AdminNotificationsProps) {
  return (
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-xl font-bold">Notifications</h1>
          <p class="text-gray-400 mt-1">View and test outgoing notifications</p>
        </div>
      </div>

      {/* Create Test Notification Form */}
      <div class="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
        <h2 class="text-sm font-semibold mb-4">Create Test Notification</h2>
        <form
          method="post"
          action={lk(AppLink.AdminNotificationsCreate)}
          class="space-y-4"
        >
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Channel</label>
              <select
                name="channel"
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                required
              >
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Recipient</label>
              <input
                type="text"
                name="recipient"
                placeholder="email@example.com or +45..."
                class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">
              Subject (for email)
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Optional subject line"
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Content</label>
            <textarea
              name="content"
              rows={3}
              placeholder="Notification content..."
              class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Create Test Notification
          </button>
        </form>
      </div>

      {/* Notifications List */}
      <div class="bg-gray-900 rounded-lg border border-gray-800">
        <div class="p-4 border-b border-gray-800">
          <h2 class="text-sm font-semibold">
            Recent Notifications ({notifications.length})
          </h2>
        </div>
        {notifications.length === 0 ? (
          <div class="p-8 text-center text-gray-500">
            No notifications yet. Create a test notification above.
          </div>
        ) : (
          <div class="divide-y divide-gray-800">
            {notifications.map((notification) => (
              <div key={notification.id} class="p-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <span
                        class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          notification.channel === "email"
                            ? "bg-blue-900 text-blue-300"
                            : notification.channel === "whatsapp"
                              ? "bg-green-900 text-green-300"
                              : "bg-purple-900 text-purple-300"
                        }`}
                      >
                        {notification.channel}
                      </span>
                      <span
                        class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          notification.status === "sent"
                            ? "bg-green-900 text-green-300"
                            : "bg-red-900 text-red-300"
                        }`}
                      >
                        {notification.status}
                      </span>
                      <span class="text-gray-400 text-xs">
                        {notification.recipient}
                      </span>
                    </div>
                    {notification.subject && (
                      <div class="font-medium text-sm mb-1">
                        {notification.subject}
                      </div>
                    )}
                    <div class="text-gray-400 text-xs line-clamp-2">
                      {notification.content.substring(0, 200)}
                      {notification.content.length > 200 ? "..." : ""}
                    </div>
                  </div>
                  <div class="text-xs text-gray-500 ml-4">
                    {new Date(notification.createdAt).toLocaleString("da-DK")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
