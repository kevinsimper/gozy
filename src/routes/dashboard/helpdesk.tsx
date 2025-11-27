import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { sql, like, or, exists, and, eq, desc, getTableColumns } from "drizzle-orm";
import { helpdeskArticlesTable, helpdeskQuestionsTable } from "../../db/schema";
import { getUserFromCookie } from "../../services/auth";
import { listArticles, getArticleByPublicId, getQuestionsByArticleId } from "../../models/helpdesk";
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

    const db = drizzle(c.env.DB);
    
    let articles;
    
    if (query) {
      const searchPattern = `%${query}%`;
      articles = await db
        .select({
          ...getTableColumns(helpdeskArticlesTable),
          questionCount: sql<number>`(
            SELECT COUNT(*)
            FROM ${helpdeskQuestionsTable}
            WHERE ${helpdeskQuestionsTable.articleId} = ${helpdeskArticlesTable.id}
          )`,
        })
        .from(helpdeskArticlesTable)
        .where(
          or(
            like(helpdeskArticlesTable.title, searchPattern),
            like(helpdeskArticlesTable.description, searchPattern),
            exists(
              db
                .select()
                .from(helpdeskQuestionsTable)
                .where(
                  and(
                    eq(
                      helpdeskQuestionsTable.articleId,
                      helpdeskArticlesTable.id,
                    ),
                    like(helpdeskQuestionsTable.question, searchPattern),
                  ),
                ),
            ),
          ),
        )
        .orderBy(desc(helpdeskArticlesTable.createdAt))
        .all();
    } else {
      articles = await listArticles(db);
    }

    return c.render(
      <HelpdeskPage articles={articles as any} query={query} />,
      {
        title: "Helpdesk",
      },
    );
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
