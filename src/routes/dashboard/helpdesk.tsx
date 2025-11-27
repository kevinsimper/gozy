import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../db/schema";
import { getUserFromCookie } from "../../services/auth";
import {
  listArticles,
  getArticleByPublicId,
  getQuestionsByArticleId,
} from "../../models/helpdesk";
import { HelpdeskPage } from "../../views/dashboard/helpdesk";
import type { Bindings } from "../../index";
import { AppLink, lk } from "../../lib/links";
import { HelpdeskArticlePage } from "../../views/dashboard/helpdesk-article";

export const helpdeskRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const userId = await getUserFromCookie(c);
    const query = c.req.query("q");

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    const db = drizzle(c.env.DB, { schema });

    let articles;

    if (query) {
      const searchPattern = `%${query}%`;
      const allArticles = await db.query.helpdeskArticlesTable.findMany({
        with: {
          questions: true,
        },
        orderBy: (articles, { desc }) => [desc(articles.createdAt)],
      });

      // Filter articles that match the search query in title, description, or questions
      articles = allArticles.filter((article) => {
        const titleMatch = article.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const descMatch = article.description
          .toLowerCase()
          .includes(query.toLowerCase());
        const questionMatch = article.questions.some((q) =>
          q.question.toLowerCase().includes(query.toLowerCase()),
        );
        return titleMatch || descMatch || questionMatch;
      });
    } else {
      articles = await listArticles(db);
    }

    return c.render(<HelpdeskPage articles={articles} query={query} />, {
      title: "Helpdesk",
    });
  })
  .get("/:publicId", async (c) => {
    const userId = await getUserFromCookie(c);
    const publicId = c.req.param("publicId");

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    const db = drizzle(c.env.DB);
    const article = await getArticleByPublicId(db, publicId);

    if (!article) {
      return c.notFound();
    }

    const questions = await getQuestionsByArticleId(db, article.id);

    return c.render(
      <HelpdeskArticlePage article={article} questions={questions} />,
      {
        title: article.title,
      },
    );
  });
