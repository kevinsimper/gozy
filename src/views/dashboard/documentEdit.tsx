import type { UserDocument } from "../../db/schema";
import { AppLink, lk } from "../../lib/links";

type DocumentEditPageProps = {
  document: UserDocument;
  formHtml: Promise<string>;
  success?: boolean;
};

export function DocumentEditPage(props: DocumentEditPageProps) {
  const { document, formHtml, success } = props;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a
          href={lk(AppLink.DashboardDocuments)}
          className="text-blue-600 no-underline font-medium inline-flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Tilbage til dokumenter
        </a>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Rediger dokument
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Dokument forhåndsvisning
          </h2>
          <div
            className="border border-gray-300 rounded-lg overflow-hidden"
            style="height: 600px;"
          >
            <iframe
              src={lk(AppLink.DashboardDocumentsPreview, {
                publicId: document.publicId,
              })}
              className="w-full h-full"
              title="Document preview"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Rediger oplysninger
          </h2>
          {success && (
            <div className="mb-4 rounded bg-green-100 border border-green-300 px-4 py-3 text-green-700 text-sm">
              Dokument opdateret succesfuldt
            </div>
          )}

          <div id="document-form-container">{formHtml}</div>
        </div>
      </div>
    </div>
  );
}
