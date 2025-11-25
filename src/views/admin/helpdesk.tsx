import type { HelpdeskArticle, HelpdeskQuestion } from "../../db/schema";
import type { HForm } from "../../services/hform/form";
import { lk, AppLink } from "../../lib/links";
import type { ArticleWithQuestionCount } from "../../models/helpdesk";

type HelpdeskListViewProps = {
  articles: ArticleWithQuestionCount[];
  form: ReturnType<typeof HForm>;
  formData?: Record<string, unknown>;
  formErrors?: Record<string, string | undefined>;
};

export function HelpdeskListView({
  articles,
  form,
  formData,
  formErrors,
}: HelpdeskListViewProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">Helpdesk Articles</h1>
        <p class="text-gray-400 mt-1">
          Manage FAQ articles and trigger questions for AI assistance
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">Create New Article</h2>
          {form.render(formData, formErrors)}
        </div>

        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4">Existing Articles</h2>

          {articles.length === 0 ? (
            <div class="text-center py-8 text-gray-500">
              <p>No articles yet. Create your first one!</p>
            </div>
          ) : (
            <div class="space-y-3">
              {articles.map((article) => (
                <a
                  href={lk(AppLink.AdminHelpdeskDetail, {
                    articleId: String(article.id),
                  })}
                  class="block p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg transition-colors"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <h3 class="font-medium text-white truncate">
                        {article.title}
                      </h3>
                      <p class="text-sm text-gray-400 mt-1 line-clamp-2">
                        {article.description}
                      </p>
                    </div>
                    <div class="ml-4 flex-shrink-0 text-right">
                      <div class="text-sm font-medium text-blue-400">
                        {article.questionCount}
                      </div>
                      <div class="text-xs text-gray-500">questions</div>
                      {article.embedding && (
                        <div class="text-xs text-green-500 mt-1">embedded</div>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type HelpdeskDetailViewProps = {
  article: HelpdeskArticle;
  questions: HelpdeskQuestion[];
  form: ReturnType<typeof HForm>;
  questionForm: ReturnType<typeof HForm>;
  formValues?: Record<string, unknown>;
  formData?: Record<string, unknown>;
  formErrors?: Record<string, string | undefined>;
  questionFormData?: Record<string, unknown>;
  questionFormErrors?: Record<string, string | undefined>;
};

export function HelpdeskDetailView({
  article,
  questions,
  form,
  questionForm,
  formValues,
  formData,
  formErrors,
  questionFormData,
  questionFormErrors,
}: HelpdeskDetailViewProps) {
  const values = formData ||
    formValues || {
      title: article.title,
      description: article.description,
    };

  return (
    <div class="p-6">
      <div class="mb-6">
        <div class="flex items-center justify-between">
          <div>
            <a
              href={lk(AppLink.AdminHelpdesk)}
              class="text-sm text-gray-400 hover:text-gray-300 mb-2 inline-block"
            >
              Back to Helpdesk Articles
            </a>
            <h1 class="text-2xl font-bold">{article.title}</h1>
            {article.embedding ? (
              <span class="text-xs text-green-500 mt-1 inline-block">
                Embedding generated
              </span>
            ) : (
              <span class="text-xs text-yellow-500 mt-1 inline-block">
                No embedding yet
              </span>
            )}
          </div>
          <form
            method="post"
            action={lk(AppLink.AdminHelpdeskDelete, {
              articleId: String(article.id),
            })}
            onsubmit="return confirm('Are you sure you want to delete this article? This will also delete all associated questions.')"
          >
            <button
              type="submit"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Delete Article
            </button>
          </form>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-6">
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 class="text-lg font-semibold mb-4">Edit Article</h2>
            {form.render(values, formErrors)}
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 class="text-lg font-semibold mb-4">Trigger Questions</h2>
            <p class="text-sm text-gray-400 mb-4">
              Add questions that help the AI find this article when users ask
              similar questions.
            </p>

            {questionForm.render(questionFormData, questionFormErrors)}

            {questions.length > 0 && (
              <div class="mt-6 space-y-2">
                <h3 class="text-sm font-medium text-gray-300 mb-3">
                  Existing Questions ({questions.length})
                </h3>
                {questions.map((question) => (
                  <div class="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg">
                    <span class="text-sm text-gray-300 flex-1">
                      {question.question}
                    </span>
                    <form
                      method="post"
                      action={lk(AppLink.AdminHelpdeskDeleteQuestion, {
                        articleId: String(article.id),
                        questionId: String(question.id),
                      })}
                      class="ml-2"
                    >
                      <button
                        type="submit"
                        class="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
