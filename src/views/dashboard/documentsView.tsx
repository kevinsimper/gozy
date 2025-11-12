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

  return (
    <a
      href={lk(AppLink.DashboardDocumentsEdit, { publicId: doc.publicId })}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col no-underline cursor-pointer"
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
            <span className="text-sm text-gray-900">
              {new Date(doc.expiryDate).toLocaleDateString("da-DK")}
              {isExpired && (
                <span className="ml-2 inline-block px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded">
                  Udløbet
                </span>
              )}
              {isExpiringSoon && (
                <span className="ml-2 inline-block px-2 py-1 text-xs border border-amber-600 text-amber-700 rounded">
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
          <span className="text-sm text-gray-900">
            {Math.round(doc.file.size / 1024)} KB
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Uploadet:</span>
          <span className="text-sm text-gray-900">
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
      <div className="text-center py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">📁</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Kom godt i gang med din dokumentmappe
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Upload dit første dokument og hold styr på vigtige datoer
          </p>

          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Fordele ved at uploade dine dokumenter:
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className="font-medium">Automatiske påmindelser</p>
                <p className="text-xs mt-1 text-gray-600">
                  Få besked inden dokumenter udløber
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="font-medium">Altid tilgængelige</p>
                <p className="text-xs mt-1 text-gray-600">
                  Dine dokumenter, uanset hvor du er
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-gray-600"
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
                </div>
                <p className="font-medium">Hurtig adgang</p>
                <p className="text-xs mt-1 text-gray-600">
                  Vis dokumenter ved kontroller
                </p>
              </div>
            </div>
          </div>

          <a
            href={lk(AppLink.DashboardDocumentsUpload)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold no-underline hover:bg-blue-700 transition-colors text-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload dit første dokument
          </a>
        </div>
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
      <div className="text-center py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-6">📁</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Kom godt i gang med din dokumentmappe
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Upload dit første dokument og hold styr på vigtige datoer
          </p>

          <div className="border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Fordele ved at uploade dine dokumenter:
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <p className="font-medium">Automatiske påmindelser</p>
                <p className="text-xs mt-1 text-gray-600">
                  Få besked inden dokumenter udløber
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="font-medium">Altid tilgængelige</p>
                <p className="text-xs mt-1 text-gray-600">
                  Dine dokumenter, uanset hvor du er
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 border border-gray-200 rounded-full flex items-center justify-center mb-2">
                  <svg
                    className="w-6 h-6 text-gray-600"
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
                </div>
                <p className="font-medium">Hurtig adgang</p>
                <p className="text-xs mt-1 text-gray-600">
                  Vis dokumenter ved kontroller
                </p>
              </div>
            </div>
          </div>

          <a
            href={lk(AppLink.DashboardDocumentsUpload)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold no-underline hover:bg-blue-700 transition-colors text-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload dit første dokument
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-3 font-semibold text-gray-900">Type</th>
            <th className="text-left p-3 font-semibold text-gray-900">
              Filnavn
            </th>
            <th className="text-left p-3 font-semibold text-gray-900">
              Udløbsdato
            </th>
            <th className="text-left p-3 font-semibold text-gray-900">
              Størrelse
            </th>
            <th className="text-left p-3 font-semibold text-gray-900">
              Uploadet
            </th>
            <th className="text-left p-3 font-semibold text-gray-900">
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
                  <span className="border border-gray-200 text-gray-700 py-1 px-3 rounded text-sm inline-flex items-center gap-2">
                    <span>{getDocumentTypeIcon(doc.documentType)}</span>
                    {getDocumentTypeLabel(doc.documentType)}
                  </span>
                </td>
                <td className="p-3 text-gray-900">
                  {doc.file.originalFilename}
                </td>
                <td className="p-3">
                  {doc.expiryDate ? (
                    <span className="text-sm text-gray-900">
                      {new Date(doc.expiryDate).toLocaleDateString("da-DK")}
                      {isExpired && (
                        <span className="ml-2 inline-block px-2 py-1 text-xs border border-gray-300 text-gray-700 rounded">
                          Udløbet
                        </span>
                      )}
                      {isExpiringSoon && (
                        <span className="ml-2 inline-block px-2 py-1 text-xs border border-amber-600 text-amber-700 rounded">
                          Snart udløb
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Ingen udløbsdato
                    </span>
                  )}
                </td>
                <td className="p-3 text-gray-700">
                  {Math.round(doc.file.size / 1024)} KB
                </td>
                <td className="p-3 text-gray-700">
                  {new Date(doc.createdAt).toLocaleDateString("da-DK")}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <a
                      href={lk(AppLink.DashboardDocumentsEdit, {
                        publicId: doc.publicId,
                      })}
                      className="text-gray-700 no-underline font-medium hover:text-gray-900 transition-colors"
                    >
                      Rediger
                    </a>
                    <a
                      href={lk(AppLink.DashboardDocumentsPreview, {
                        publicId: doc.publicId,
                      })}
                      target="_blank"
                      className="text-gray-700 no-underline font-medium hover:text-gray-900 transition-colors"
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
