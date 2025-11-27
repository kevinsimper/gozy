import type { ArticleWithQuestionCount } from "../../models/helpdesk";
import { AppLink, lk } from "../../lib/links";

function ArticleCard({ article }: { article: ArticleWithQuestionCount }) {
  return (
    <a
      href={lk(AppLink.DashboardHelpdeskArticle, { publicId: article.publicId })}
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
}: {
  articles: ArticleWithQuestionCount[];
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Helpdesk</h1>
      <p className="text-lg text-gray-700 mb-8">
        Her finder du en samling af artikler og svar på ofte stillede spørgsmål. Søg efter emner eller gennemse kategorier for at finde den information du har brug for.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
