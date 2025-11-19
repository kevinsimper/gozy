import { AppLink, lk } from "../../lib/links";
import type { User } from "../../db/schema";

type UserDocument = {
  publicId: string;
  documentType: string;
  expiryDate: Date | null;
  createdAt: Date;
  file: {
    originalFilename: string;
    mimeType: string;
  };
};

type RttUserDetailViewProps = {
  user: User;
  documents: UserDocument[];
  messageSent?: boolean;
  messageError?: string;
};

export function RttUserDetailView({
  user,
  documents,
  messageSent,
  messageError,
}: RttUserDetailViewProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <a
          href={lk(AppLink.RttCheckins)}
          class="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Check-ins
        </a>
      </div>

      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2 text-gray-900">{user.name}</h1>
        <p class="text-gray-600">Driver Details</p>
      </div>

      {/* User Information Card */}
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            Contact Information
          </h2>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Name</label>
              <p class="text-gray-900 font-medium">{user.name}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">
                Phone Number
              </label>
              <p class="text-gray-900 font-medium">{user.phoneNumber}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">
                Driver Type
              </label>
              <p class="text-gray-900 font-medium">
                {user.driverType === "vehicle_owner"
                  ? "Vehicle Owner"
                  : user.driverType === "driver"
                    ? "Driver"
                    : "-"}
              </p>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Taxi ID</label>
              <p class="text-gray-900 font-medium">{user.taxiId || "-"}</p>
            </div>
            {user.email && (
              <div>
                <label class="block text-sm text-gray-600 mb-1">Email</label>
                <p class="text-gray-900 font-medium">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Message Section */}
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            Send WhatsApp Message
          </h2>
        </div>
        <div class="p-4">
          {messageSent && (
            <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              Message sent successfully!
            </div>
          )}
          {messageError && (
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              Error: {messageError}
            </div>
          )}
          <form
            method="post"
            action={lk(AppLink.RttUserSendMessage, { id: user.id.toString() })}
          >
            <div class="mb-4">
              <label
                for="message"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                class="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Documents Section */}
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">
            Documents ({documents.length})
          </h2>
          <a
            href={lk(AppLink.RttUserDocumentUpload, {
              id: user.id.toString(),
            })}
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition no-underline inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
            Upload Document
          </a>
        </div>
        <div class="overflow-x-auto">
          {documents.length === 0 ? (
            <div class="text-center p-8 text-gray-500">
              No documents uploaded yet
            </div>
          ) : (
            <table class="w-full">
              <thead class="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th class="text-left p-3 text-gray-700 font-medium">
                    Document Type
                  </th>
                  <th class="text-left p-3 text-gray-700 font-medium">
                    File Name
                  </th>
                  <th class="text-left p-3 text-gray-700 font-medium">
                    Expiry Date
                  </th>
                  <th class="text-left p-3 text-gray-700 font-medium">
                    Uploaded
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.publicId}
                    class="border-b border-gray-200 last:border-0 hover:bg-gray-50"
                  >
                    <td class="p-3 text-gray-900 font-medium">
                      {doc.documentType}
                    </td>
                    <td class="p-3 text-gray-600">
                      {doc.file.originalFilename}
                    </td>
                    <td class="p-3 text-gray-600">
                      {doc.expiryDate
                        ? new Date(doc.expiryDate).toLocaleDateString("da-DK")
                        : "-"}
                    </td>
                    <td class="p-3 text-gray-600">
                      {new Date(doc.createdAt).toLocaleDateString("da-DK")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
