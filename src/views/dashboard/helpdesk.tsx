import type { ArticleWithQuestions } from "../../models/helpdesk";
import { AppLink, lk } from "../../lib/links";

function ArticleCard({ article }: { article: ArticleWithQuestions }) {
  return (
    <a
      href={lk(AppLink.DashboardHelpdeskArticle, {
        publicId: article.publicId,
      })}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col no-underline cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {article.title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {article.description.length > 100
                ? article.description.substring(0, 100) + "..."
                : article.description}
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}

export function HelpdeskPage({
  articles,
  query,
}: {
  articles: ArticleWithQuestions[];
  query?: string;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Helpdesk</h1>
      <p className="text-lg text-gray-700 mb-8">
        Her finder du en samling af artikler og svar på ofte stillede spørgsmål.
        Søg efter emner eller gennemse kategorier for at finde den information
        du har brug for.
      </p>

      <form
        method="get"
        action={lk(AppLink.DashboardHelpdesk)}
        className="mb-10"
      >
        <div className="relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            name="q"
            value={query || ""}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
            placeholder="Søg efter artikler eller spørgsmål..."
          />
        </div>
      </form>

      {articles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Ingen resultater fundet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Prøv at søge efter noget andet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
