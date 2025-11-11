import type { UserDocument } from "../../db/schema";
import type { File } from "../../db/schema";
import { AppLink, lk } from "../../lib/links";
import {
  getDocumentTypeLabel,
  getDocumentTypeIcon,
} from "../../lib/documentTypes";

type DocumentWithFile = UserDocument & { file: File };

type ViewToggleProps = {
  currentView: "cards" | "table";
};

export function ViewToggle({ currentView }: ViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
      <a
        href={lk(AppLink.DashboardDocuments, { query: { view: "cards" } })}
        className={`px-4 py-2 rounded-md text-sm font-medium no-underline transition-colors ${
          currentView === "cards"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <svg
          className="w-5 h-5 inline-block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      </a>
      <a
        href={lk(AppLink.DashboardDocuments, { query: { view: "table" } })}
        className={`px-4 py-2 rounded-md text-sm font-medium no-underline transition-colors ${
          currentView === "table"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        <svg
          className="w-5 h-5 inline-block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
      </a>
    </div>
  );
}

type DocumentCardProps = {
  doc: DocumentWithFile;
};

function DocumentCard({ doc }: DocumentCardProps) {
  const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
  const isExpiringSoon =
    doc.expiryDate &&
    !isExpired &&
    doc.reminderDaysBefore &&
    new Date(doc.expiryDate).getTime() - Date.now() <
      doc.reminderDaysBefore * 24 * 60 * 60 * 1000;

  const borderColor = isExpired
    ? "border-red-300"
    : isExpiringSoon
      ? "border-orange-300"
      : "border-gray-200";

  return (
    <a
      href={lk(AppLink.DashboardDocumentsEdit, { publicId: doc.publicId })}
      className={`bg-white rounded-lg border-2 ${borderColor} shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col no-underline cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            {getDocumentTypeIcon(doc.documentType)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {getDocumentTypeLabel(doc.documentType)}
            </h3>
            <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
              {doc.file.originalFilename}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 flex-grow">
        {doc.expiryDate ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Udløbsdato:</span>
            <span
              className={`text-sm font-semibold ${isExpired ? "text-red-600" : isExpiringSoon ? "text-orange-600" : "text-gray-700"}`}
            >
              {new Date(doc.expiryDate).toLocaleDateString("da-DK")}
              {isExpired && (
                <span className="ml-2 inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                  Udløbet
                </span>
              )}
              {isExpiringSoon && (
                <span className="ml-2 inline-block px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                  Snart udløb
                </span>
              )}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Udløbsdato:</span>
            <span className="text-sm text-gray-400">Ingen udløbsdato</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Størrelse:</span>
          <span className="text-sm text-gray-700">
            {Math.round(doc.file.size / 1024)} KB
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Uploadet:</span>
          <span className="text-sm text-gray-700">
            {new Date(doc.createdAt).toLocaleDateString("da-DK")}
          </span>
        </div>
      </div>
    </a>
  );
}

type CardsViewProps = {
  documents: DocumentWithFile[];
};

export function CardsView({ documents }: CardsViewProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-gray-500 text-lg">
          Ingen dokumenter uploadet endnu.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} doc={doc} />
      ))}
    </div>
  );
}

type TableViewProps = {
  documents: DocumentWithFile[];
};

export function TableView({ documents }: TableViewProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📄</div>
        <p className="text-gray-500 text-lg">
          Ingen dokumenter uploadet endnu.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="text-left p-3 font-semibold text-gray-700">Type</th>
            <th className="text-left p-3 font-semibold text-gray-700">
              Filnavn
            </th>
            <th className="text-left p-3 font-semibold text-gray-700">
              Udløbsdato
            </th>
            <th className="text-left p-3 font-semibold text-gray-700">
              Størrelse
            </th>
            <th className="text-left p-3 font-semibold text-gray-700">
              Uploadet
            </th>
            <th className="text-left p-3 font-semibold text-gray-700">
              Handlinger
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const isExpired =
              doc.expiryDate && new Date(doc.expiryDate) < new Date();
            const isExpiringSoon =
              doc.expiryDate &&
              !isExpired &&
              doc.reminderDaysBefore &&
              new Date(doc.expiryDate).getTime() - Date.now() <
                doc.reminderDaysBefore * 24 * 60 * 60 * 1000;

            return (
              <tr
                key={doc.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="p-3">
                  <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded text-sm inline-flex items-center gap-2">
                    <span>{getDocumentTypeIcon(doc.documentType)}</span>
                    {getDocumentTypeLabel(doc.documentType)}
                  </span>
                </td>
                <td className="p-3 text-gray-700">
                  {doc.file.originalFilename}
                </td>
                <td className="p-3">
                  {doc.expiryDate ? (
                    <span
                      className={`text-sm ${isExpired ? "text-red-600 font-semibold" : isExpiringSoon ? "text-orange-600 font-semibold" : "text-gray-700"}`}
                    >
                      {new Date(doc.expiryDate).toLocaleDateString("da-DK")}
                      {isExpired && " (udløbet)"}
                      {isExpiringSoon && " (snart udløb)"}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Ingen udløbsdato
                    </span>
                  )}
                </td>
                <td className="p-3 text-gray-500">
                  {Math.round(doc.file.size / 1024)} KB
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString("da-DK")}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <a
                      href={lk(AppLink.DashboardDocumentsEdit, {
                        publicId: doc.publicId,
                      })}
                      className="text-blue-600 no-underline font-medium hover:text-blue-800 transition-colors"
                    >
                      Rediger
                    </a>
                    <a
                      href={lk(AppLink.DashboardDocumentsPreview, {
                        publicId: doc.publicId,
                      })}
                      target="_blank"
                      className="text-blue-600 no-underline font-medium hover:text-blue-800 transition-colors"
                    >
                      Vis
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
