import type { HelpdeskArticle, HelpdeskQuestion } from "../../db/schema";
import { AppLink, lk } from "../../lib/links";

export function HelpdeskArticlePage({
  article,
  questions,
}: {
  article: HelpdeskArticle;
  questions: HelpdeskQuestion[];
}) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <a
        href={lk(AppLink.DashboardHelpdesk)}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Tilbage til oversigten
      </a>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <p className="text-lg text-gray-700">{article.description}</p>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-lg font-semibold text-gray-800 mb-4">
          Løste denne artikel dit problem?
        </p>
        <div className="flex space-x-4">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            onclick="alert('Funktionaliteten er ikke implementeret endnu.')"
          >
            Ja
          </button>
          <button
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            onclick="alert('Funktionaliteten er ikke implementeret endnu.')"
          >
            Nej
          </button>
        </div>
      </div>
    </div>
  );
}
