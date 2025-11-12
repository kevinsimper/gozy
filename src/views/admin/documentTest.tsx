import { File, DocumentTestEval } from "../../db/schema";
import { lk, AppLink } from "../../lib/links";

type DocumentTestViewProps = {
  evals: Array<DocumentTestEval & { file: File }>;
  latestResult?: DocumentTestEval & { file: File };
};

export function DocumentTestView({
  evals,
  latestResult,
}: DocumentTestViewProps) {
  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-white">Document Extraction Test</h1>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-white mb-4">
            Upload Test Document
          </h2>
          <form
            action={lk(AppLink.AdminDocumentTestUpload)}
            method="post"
            enctype="multipart/form-data"
            class="space-y-4"
          >
            <div>
              <label
                for="file"
                class="block text-sm font-medium text-gray-300 mb-2"
              >
                Select Document
              </label>
              <input
                type="file"
                id="file"
                name="file"
                accept="image/*,application/pdf"
                required
                class="block w-full text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition-colors"
            >
              Upload & Extract
            </button>
          </form>
        </div>

        {latestResult && (
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-white mb-4">
              Latest Extraction Result
            </h2>
            <div class="space-y-3 text-sm">
              <div>
                <span class="text-gray-400">File:</span>
                <span class="text-white ml-2">
                  {latestResult.file.originalFilename}
                </span>
              </div>
              <div>
                <span class="text-gray-400">Document Type:</span>
                <span class="text-white ml-2">
                  {latestResult.geminiDocumentType || "Unknown"}
                </span>
              </div>
              <div>
                <span class="text-gray-400">Expiry Date:</span>
                <span class="text-white ml-2">
                  {latestResult.geminiExpiryDate || "None"}
                </span>
              </div>
              <div>
                <span class="text-gray-400">Confidence:</span>
                <span
                  class={`ml-2 ${
                    latestResult.geminiConfidence === "high"
                      ? "text-green-400"
                      : latestResult.geminiConfidence === "medium"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {latestResult.geminiConfidence || "Unknown"}
                </span>
              </div>
              {latestResult.geminiNotes && (
                <div>
                  <span class="text-gray-400">Notes:</span>
                  <p class="text-white mt-1">{latestResult.geminiNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-lg">
        <div class="px-6 py-4 border-b border-gray-800">
          <h2 class="text-lg font-semibold text-white">Test Results</h2>
          <p class="text-sm text-gray-400 mt-1">Total tests: {evals.length}</p>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-800/50 text-xs text-gray-300 uppercase">
                <th class="px-6 py-3 text-left font-medium">File</th>
                <th class="px-6 py-3 text-left font-medium">Detected Type</th>
                <th class="px-6 py-3 text-left font-medium">Expiry Date</th>
                <th class="px-6 py-3 text-left font-medium">Confidence</th>
                <th class="px-6 py-3 text-left font-medium">Expected Type</th>
                <th class="px-6 py-3 text-left font-medium">Expected Expiry</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
                <th class="px-6 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-800">
              {evals.length === 0 ? (
                <tr>
                  <td
                    colspan={8}
                    class="px-6 py-8 text-center text-gray-400 text-sm"
                  >
                    No test results yet. Upload a document to start testing.
                  </td>
                </tr>
              ) : (
                evals.map((result) => (
                  <tr
                    key={result.id}
                    class="hover:bg-gray-800/30 transition-colors"
                  >
                    <td class="px-6 py-4 text-sm">
                      <a
                        href={lk(AppLink.AdminDocumentTestDetail, {
                          id: result.id.toString(),
                        })}
                        class="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        {result.file.originalFilename}
                      </a>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-300">
                      {result.geminiDocumentType || "-"}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-300">
                      {result.geminiExpiryDate || "-"}
                    </td>
                    <td class="px-6 py-4 text-sm">
                      <span
                        class={`px-2 py-1 rounded text-xs ${
                          result.geminiConfidence === "high"
                            ? "bg-green-900/30 text-green-400"
                            : result.geminiConfidence === "medium"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {result.geminiConfidence || "unknown"}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-400">
                      {result.expectedDocumentType || "-"}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-400">
                      {result.expectedExpiryDate || "-"}
                    </td>
                    <td class="px-6 py-4 text-sm">
                      {result.isCorrect === null ? (
                        <span class="text-gray-500">Not evaluated</span>
                      ) : result.isCorrect ? (
                        <span class="text-green-400">Correct</span>
                      ) : (
                        <span class="text-red-400">Incorrect</span>
                      )}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-400">
                      {new Date(result.createdAt).toLocaleDateString()}
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
