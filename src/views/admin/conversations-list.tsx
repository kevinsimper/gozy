import { AppLink, lk } from "../../lib/links";
import type { UserWithLastMessage } from "../../routes/admin/conversations";

type ConversationsListProps = {
  users: UserWithLastMessage[];
};

export function ConversationsList({ users }: ConversationsListProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Manual Mode Conversations</h1>
        <p class="text-gray-400 text-sm mt-1">
          Users currently in manual mode - AI responses disabled
        </p>
      </div>

      {users.length === 0 ? (
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <p class="text-gray-400">No users in manual mode</p>
          <p class="text-gray-500 text-sm mt-2">
            Enable manual mode from a user's detail page to take over their
            conversation
          </p>
        </div>
      ) : (
        <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div class="divide-y divide-gray-800">
            {users.map((user) => (
              <a
                key={user.id}
                href={lk(AppLink.AdminConversationDetail, {
                  id: String(user.id),
                })}
                class="flex items-center p-4 hover:bg-gray-800 transition-colors"
              >
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-white">{user.name}</span>
                    <span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                      Manual Mode
                    </span>
                  </div>
                  <p class="text-sm text-gray-400 font-mono mt-1">
                    {user.phoneNumber}
                  </p>
                  {user.lastMessagePreview && (
                    <p class="text-sm text-gray-500 mt-1 truncate">
                      {user.lastMessagePreview}...
                    </p>
                  )}
                </div>
                <div class="text-right">
                  {user.lastMessageAt && (
                    <p class="text-xs text-gray-500">
                      {new Date(user.lastMessageAt).toLocaleString("da-DK")}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
