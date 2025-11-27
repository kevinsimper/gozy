import { eq, desc, sql } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
  helpdeskArticlesTable,
  helpdeskQuestionsTable,
  type HelpdeskArticle,
  type HelpdeskQuestion,
} from "../db/schema";
import * as schema from "../db/schema";

export type ArticleWithQuestions = HelpdeskArticle & {
  questions: HelpdeskQuestion[];
};

export async function createArticle(
  db: DrizzleD1Database,
  data: {
    title: string;
    description: string;
    embedding?: string;
  },
): Promise<HelpdeskArticle> {
  const result = await db
    .insert(helpdeskArticlesTable)
    .values({
      title: data.title,
      description: data.description,
      embedding: data.embedding,
    })
    .returning()
    .get();

  return result;
}

export async function getArticleById(
  db: DrizzleD1Database,
  id: number,
): Promise<HelpdeskArticle | undefined> {
  return await db
    .select()
    .from(helpdeskArticlesTable)
    .where(eq(helpdeskArticlesTable.id, id))
    .get();
}

export async function getArticleByPublicId(
  db: DrizzleD1Database,
  publicId: string,
): Promise<HelpdeskArticle | undefined> {
  return await db
    .select()
    .from(helpdeskArticlesTable)
    .where(eq(helpdeskArticlesTable.publicId, publicId))
    .get();
}

export async function listArticles(
  db: DrizzleD1Database<typeof schema>,
): Promise<ArticleWithQuestions[]> {
  const articles = await db.query.helpdeskArticlesTable.findMany({
    with: {
      questions: true,
    },
    orderBy: (articles, { desc }) => [desc(articles.createdAt)],
  });

  return articles;
}

export async function updateArticle(
  db: DrizzleD1Database,
  id: number,
  data: {
    title?: string;
    description?: string;
    embedding?: string;
  },
): Promise<HelpdeskArticle | undefined> {
  const result = await db
    .update(helpdeskArticlesTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(helpdeskArticlesTable.id, id))
    .returning()
    .get();

  return result;
}

export async function deleteArticle(
  db: DrizzleD1Database,
  id: number,
): Promise<boolean> {
  // Delete all questions first
  await db
    .delete(helpdeskQuestionsTable)
    .where(eq(helpdeskQuestionsTable.articleId, id))
    .run();

  const result = await db
    .delete(helpdeskArticlesTable)
    .where(eq(helpdeskArticlesTable.id, id))
    .returning({ id: helpdeskArticlesTable.id })
    .get();

  return !!result;
}

export async function addQuestion(
  db: DrizzleD1Database,
  articleId: number,
  question: string,
): Promise<HelpdeskQuestion> {
  const result = await db
    .insert(helpdeskQuestionsTable)
    .values({
      articleId,
      question,
    })
    .returning()
    .get();

  return result;
}

export async function removeQuestion(
  db: DrizzleD1Database,
  questionId: number,
): Promise<boolean> {
  const result = await db
    .delete(helpdeskQuestionsTable)
    .where(eq(helpdeskQuestionsTable.id, questionId))
    .returning({ id: helpdeskQuestionsTable.id })
    .get();

  return !!result;
}

export async function getQuestionsByArticleId(
  db: DrizzleD1Database,
  articleId: number,
): Promise<HelpdeskQuestion[]> {
  return await db
    .select()
    .from(helpdeskQuestionsTable)
    .where(eq(helpdeskQuestionsTable.articleId, articleId))
    .orderBy(desc(helpdeskQuestionsTable.createdAt))
    .all();
}

export async function getQuestionById(
  db: DrizzleD1Database,
  questionId: number,
): Promise<HelpdeskQuestion | undefined> {
  return await db
    .select()
    .from(helpdeskQuestionsTable)
    .where(eq(helpdeskQuestionsTable.id, questionId))
    .get();
}

export async function getAllArticlesWithEmbeddings(
  db: DrizzleD1Database,
): Promise<HelpdeskArticle[]> {
  return await db
    .select()
    .from(helpdeskArticlesTable)
    .where(sql`${helpdeskArticlesTable.embedding} IS NOT NULL`)
    .all();
}
