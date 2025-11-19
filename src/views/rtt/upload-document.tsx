import { AppLink, lk } from "../../lib/links";
import { DOCUMENT_TYPES } from "../../lib/documentTypes";
import type { User } from "../../db/schema";

type RttUploadDocumentViewProps = {
  user: User;
  error?: string;
  success?: string;
};

export function RttUploadDocumentView({
  user,
  error,
  success,
}: RttUploadDocumentViewProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <div class="flex gap-4 mb-2">
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
          <span class="text-gray-400">|</span>
          <a
            href={lk(AppLink.RttUserDetail, { id: user.id.toString() })}
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
            Back to User Details
          </a>
        </div>
      </div>

      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2 text-gray-900">Upload Document</h1>
        <p class="text-gray-600">
          Upload a document for <span class="font-medium">{user.name}</span>
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div class="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div class="flex items-center">
            <svg
              class="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div class="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <div class="flex items-center">
            <svg
              class="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div class="p-6">
          <form
            method="post"
            action={lk(AppLink.RttUserDocumentUpload, {
              id: user.id.toString(),
            })}
            enctype="multipart/form-data"
          >
            <div class="mb-4">
              <label
                for="file"
                class="block text-sm text-gray-700 mb-2 font-medium"
              >
                Choose File
              </label>
              <input
                type="file"
                name="file"
                id="file"
                required
                class="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="mt-2 text-sm text-gray-600">
                Maximum file size: 10MB. AI will automatically detect document
                type and expiry date.
              </p>
            </div>

            <div class="mb-6">
              <label
                for="documentType"
                class="block text-sm text-gray-700 mb-2 font-medium"
              >
                Document Type (Optional)
              </label>
              <select
                name="documentType"
                id="documentType"
                class="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Let AI detect automatically --</option>
                {DOCUMENT_TYPES.map((docType) => (
                  <option key={docType.value} value={docType.value}>
                    {docType.text}
                  </option>
                ))}
              </select>
              <p class="mt-2 text-sm text-gray-600">
                Leave blank to let AI automatically detect the document type.
              </p>
            </div>

            <div class="flex gap-3">
              <button
                type="submit"
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition font-medium"
              >
                Upload Document
              </button>
              <a
                href={lk(AppLink.RttUserDetail, { id: user.id.toString() })}
                class="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded transition font-medium no-underline inline-block"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
