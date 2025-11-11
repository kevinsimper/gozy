import { AppLink, lk } from "../../lib/links";

type DocumentWithReminder = {
  id: number;
  publicId: string;
  userId: number;
  documentType: string;
  expiryDate: Date | null;
  reminderDaysBefore: number | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    phoneNumber: string;
  };
  hasReminder: boolean;
  daysUntilExpiry: number | null;
  isDueForReminder: boolean;
};

type RemindersViewProps = {
  documents: DocumentWithReminder[];
  stats: {
    totalWithExpiry: number;
    dueForReminder: number;
    remindersSent: number;
  };
};

export function AdminReminders({ documents, stats }: RemindersViewProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-white mb-2">Reminders Debug</h1>
        <p class="text-gray-400 text-xs">
          Demo and test document expiry reminders
        </p>
      </div>

      {/* Stats */}
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-900 border border-gray-800 rounded p-4">
          <div class="text-gray-400 text-xs mb-1">Documents with Expiry</div>
          <div class="text-2xl font-bold text-white">
            {stats.totalWithExpiry}
          </div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded p-4">
          <div class="text-gray-400 text-xs mb-1">Due for Reminder</div>
          <div class="text-2xl font-bold text-yellow-500">
            {stats.dueForReminder}
          </div>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded p-4">
          <div class="text-gray-400 text-xs mb-1">Reminders Sent</div>
          <div class="text-2xl font-bold text-green-500">
            {stats.remindersSent}
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div class="bg-gray-900 border border-gray-800 rounded overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-800">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">
                  User
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">
                  Document Type
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">
                  Expiry Date
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">
                  Days Until
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">
                  Remind Before
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">
                  Status
                </th>
                <th class="px-3 py-2 text-left text-xs font-medium text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              {documents.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    class="px-3 py-8 text-center text-gray-400 text-xs"
                  >
                    No documents with expiry dates found
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const expiryDate = doc.expiryDate
                    ? new Date(doc.expiryDate).toLocaleDateString("da-DK")
                    : "N/A";
                  const statusColor = doc.hasReminder
                    ? "bg-green-900/30 text-green-400 border-green-700"
                    : doc.isDueForReminder
                      ? "bg-yellow-900/30 text-yellow-400 border-yellow-700"
                      : "bg-gray-800 text-gray-400 border-gray-700";
                  const statusText = doc.hasReminder
                    ? "Sent"
                    : doc.isDueForReminder
                      ? "Due"
                      : "Pending";

                  return (
                    <tr key={doc.id} class="hover:bg-gray-800/50">
                      <td class="px-3 py-2">
                        <div class="text-xs text-white">{doc.user.name}</div>
                        <div class="text-xs text-gray-500">
                          {doc.user.phoneNumber}
                        </div>
                      </td>
                      <td class="px-3 py-2">
                        <div class="text-xs text-gray-300">
                          {doc.documentType.replace(/_/g, " ")}
                        </div>
                      </td>
                      <td class="px-3 py-2">
                        <div class="text-xs text-gray-300">{expiryDate}</div>
                      </td>
                      <td class="px-3 py-2">
                        <div class="text-xs text-gray-300">
                          {doc.daysUntilExpiry !== null
                            ? `${doc.daysUntilExpiry} days`
                            : "N/A"}
                        </div>
                      </td>
                      <td class="px-3 py-2">
                        <div class="text-xs text-gray-300">
                          {doc.reminderDaysBefore !== null
                            ? `${doc.reminderDaysBefore} days`
                            : "N/A"}
                        </div>
                      </td>
                      <td class="px-3 py-2">
                        <span
                          class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColor}`}
                        >
                          {statusText}
                        </span>
                      </td>
                      <td class="px-3 py-2">
                        <div class="flex gap-1">
                          <form
                            method="post"
                            action={lk(AppLink.AdminReminderUpdateExpiry, {
                              id: doc.id.toString(),
                            })}
                          >
                            <input type="hidden" name="days" value="14" />
                            <button
                              type="submit"
                              class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                              2 weeks
                            </button>
                          </form>
                          <form
                            method="post"
                            action={lk(AppLink.AdminReminderUpdateExpiry, {
                              id: doc.id.toString(),
                            })}
                          >
                            <input type="hidden" name="days" value="7" />
                            <button
                              type="submit"
                              class="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                            >
                              1 week
                            </button>
                          </form>
                          <form
                            method="post"
                            action={lk(AppLink.AdminReminderSend, {
                              id: doc.id.toString(),
                            })}
                          >
                            <button
                              type="submit"
                              class="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                              disabled={doc.hasReminder}
                            >
                              Send Now
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-4 p-4 bg-blue-900/20 border border-blue-700/50 rounded">
        <div class="text-xs text-blue-300">
          <strong>How it works:</strong>
          <ul class="mt-2 space-y-1 list-disc list-inside">
            <li>
              Click "2 weeks" or "1 week" to set expiry date to that many days
              from now
            </li>
            <li>
              Documents become "Due" when current date &gt;= (expiry date -
              reminder days before)
            </li>
            <li>
              Click "Send Now" to manually trigger a reminder for that document
            </li>
            <li>
              Reminders can only be sent once per document (tracked in reminders
              table)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
