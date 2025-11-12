import { File, DocumentTestEval } from "../../db/schema";
import { lk, AppLink } from "../../lib/links";
import { DOCUMENT_ANALYSIS_PROMPT } from "../../lib/documents/analysis";

type DocumentTestDetailProps = {
  testEval: DocumentTestEval & { file: File };
  updateFormHtml?: string;
};

export function DocumentTestDetail({
  testEval,
  updateFormHtml,
}: DocumentTestDetailProps) {
  return (
    <div class="p-6 space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <a
            href={lk(AppLink.AdminDocumentTest)}
            class="text-sm text-blue-500 hover:underline mb-2 inline-block"
          >
            &larr; Back to test list
          </a>
          <h1 class="text-2xl font-bold text-white">
            {testEval.file.originalFilename}
          </h1>
          <p class="text-sm text-gray-400 mt-1">
            Uploaded: {new Date(testEval.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-6">
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-white">
                Gemini Extraction Results
              </h2>
              <form
                method="post"
                action={`/admin/document-test/${testEval.id}/rerun`}
              >
                <button
                  type="submit"
                  class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Rerun Analysis
                </button>
              </form>
            </div>
            <div class="space-y-3 text-sm">
              <div>
                <span class="text-gray-400">Document Type:</span>
                <span class="text-white ml-2 font-medium">
                  {testEval.geminiDocumentType || "Unknown"}
                </span>
              </div>
              <div>
                <span class="text-gray-400">Expiry Date:</span>
                <span class="text-white ml-2 font-medium">
                  {testEval.geminiExpiryDate || "None"}
                </span>
              </div>
              <div>
                <span class="text-gray-400">Confidence:</span>
                <span
                  class={`ml-2 font-medium ${
                    testEval.geminiConfidence === "high"
                      ? "text-green-400"
                      : testEval.geminiConfidence === "medium"
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {testEval.geminiConfidence || "Unknown"}
                </span>
              </div>
              {testEval.geminiNotes && (
                <div>
                  <span class="text-gray-400">Notes:</span>
                  <p class="text-white mt-1">{testEval.geminiNotes}</p>
                </div>
              )}
            </div>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <details class="group">
              <summary class="text-lg font-semibold text-white cursor-pointer select-none list-none flex items-center justify-between">
                <span>System Prompt</span>
                <span class="text-gray-400 group-open:rotate-90 transition-transform">
                  ▶
                </span>
              </summary>
              <div class="mt-4 pt-4 border-t border-gray-800">
                <pre class="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-black/50 p-4 rounded border border-gray-700 overflow-x-auto">
                  {DOCUMENT_ANALYSIS_PROMPT}
                </pre>
              </div>
            </details>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-white mb-4">
              Expected Values
            </h2>
            <div id="update-form-container">
              {updateFormHtml ? (
                <div>
                  {updateFormHtml}
                  <span
                    id="update-spinner"
                    class="htmx-indicator text-gray-400"
                  >
                    Updating...
                  </span>
                </div>
              ) : (
                <div class="space-y-3 text-sm">
                  <div>
                    <span class="text-gray-400">Expected Type:</span>
                    <span class="text-white ml-2">
                      {testEval.expectedDocumentType || "Not set"}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-400">Expected Expiry:</span>
                    <span class="text-white ml-2">
                      {testEval.expectedExpiryDate || "Not set"}
                    </span>
                  </div>
                  <div>
                    <span class="text-gray-400">Status:</span>
                    <span class="text-white ml-2">
                      {testEval.isCorrect === null
                        ? "Not evaluated"
                        : testEval.isCorrect
                          ? "Correct"
                          : "Incorrect"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 class="text-lg font-semibold text-white mb-4">File Info</h2>
            <div class="space-y-2 text-sm">
              <div>
                <span class="text-gray-400">Filename:</span>
                <span class="text-white ml-2">
                  {testEval.file.originalFilename}
                </span>
              </div>
              <div>
                <span class="text-gray-400">Type:</span>
                <span class="text-white ml-2">{testEval.file.mimeType}</span>
              </div>
              <div>
                <span class="text-gray-400">Size:</span>
                <span class="text-white ml-2">
                  {(testEval.file.size / 1024).toFixed(2)} KB
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Preview</h2>
          <div class="bg-black rounded border border-gray-700 overflow-hidden">
            <iframe
              src={lk(AppLink.AdminDocumentTestPreview, {
                id: testEval.id.toString(),
              })}
              class="w-full"
              style="height: 600px;"
              title="Document preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
