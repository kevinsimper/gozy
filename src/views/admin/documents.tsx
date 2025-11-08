import { User } from "../../db/schema";
import { AppLink, lk } from "../../lib/links";

type DocumentWithUserAndFile = {
  id: number;
  publicId: string;
  userId: number;
  fileId: number;
  documentType: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  file: {
    id: number;
    publicId: string;
    storageKey: string;
    originalFilename: string;
    mimeType: string;
    size: number;
    compressedSize: number | null;
    compression: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
};

type AdminDocumentsProps = {
  documents: DocumentWithUserAndFile[];
  stats: {
    totalDocuments: number;
    totalSize: number;
  };
};

export function AdminDocuments({ documents, stats }: AdminDocumentsProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">Documents</h1>

      {/* Stats Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-xs mb-1">Total Documents</p>
              <p class="text-2xl font-bold">{stats.totalDocuments}</p>
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
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-xs mb-1">Total Storage</p>
              <p class="text-2xl font-bold">
                {formatFileSize(stats.totalSize)}
              </p>
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
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div class="bg-gray-900 border border-gray-800 rounded-lg">
        <div class="p-4 border-b border-gray-800">
          <h2 class="text-lg font-semibold">All Documents</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-800">
              <tr>
                <th class="text-left p-3 text-gray-400 font-medium">User</th>
                <th class="text-left p-3 text-gray-400 font-medium">Type</th>
                <th class="text-left p-3 text-gray-400 font-medium">
                  Filename
                </th>
                <th class="text-left p-3 text-gray-400 font-medium">Size</th>
                <th class="text-left p-3 text-gray-400 font-medium">
                  Uploaded
                </th>
                <th class="text-left p-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6} class="text-center p-8 text-gray-500">
                    No documents yet
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr
                    key={doc.id}
                    class="border-b border-gray-800 last:border-0"
                  >
                    <td class="p-3">
                      <div>
                        <p class="text-white">{doc.user.name}</p>
                        <p class="text-gray-400 text-xs">
                          {doc.user.phoneNumber}
                        </p>
                      </div>
                    </td>
                    <td class="p-3">
                      <span class="bg-blue-500/10 text-blue-400 py-1 px-2 rounded text-xs">
                        {doc.documentType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td class="p-3 text-gray-300">
                      {doc.file.originalFilename}
                    </td>
                    <td class="p-3 text-gray-400">
                      {formatFileSize(doc.file.size)}
                    </td>
                    <td class="p-3 text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString("da-DK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td class="p-3">
                      <a
                        href={lk(AppLink.DashboardDocumentsPreview, {
                          publicId: doc.publicId,
                        })}
                        target="_blank"
                        class="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        View
                      </a>
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
