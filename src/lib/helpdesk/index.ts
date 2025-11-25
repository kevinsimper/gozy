import type { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import type { Bindings } from "../../index";
import { generateEmbedding, cosineSimilarity } from "../embeddings";
import {
  getArticleById,
  getQuestionsByArticleId,
  updateArticle,
  getAllArticlesWithEmbeddings,
} from "../../models/helpdesk";
import type { HelpdeskArticle } from "../../db/schema";

export type ArticleWithScore = HelpdeskArticle & {
  score: number;
};

/**
 * Build the text content to embed for an article
 * Combines title, description, and all trigger questions
 */
function buildEmbeddingText(
  title: string,
  description: string,
  questions: string[],
): string {
  let text = `${title}\n\n${description}`;

  if (questions.length > 0) {
    text += "\n\nQuestions:\n" + questions.map((q) => `- ${q}`).join("\n");
  }

  return text;
}

/**
 * Regenerate the embedding for an article based on its current content
 */
export async function regenerateEmbedding(
  c: Context<{ Bindings: Bindings }>,
  articleId: number,
): Promise<void> {
  const db = drizzle(c.env.DB);

  const article = await getArticleById(db, articleId);
  if (!article) {
    throw new Error(`Article ${articleId} not found`);
  }

  const questions = await getQuestionsByArticleId(db, articleId);
  const questionTexts = questions.map((q) => q.question);

  const text = buildEmbeddingText(
    article.title,
    article.description,
    questionTexts,
  );

  const embedding = await generateEmbedding(c.env.AI, text);
  const embeddingJson = JSON.stringify(embedding);

  await updateArticle(db, articleId, { embedding: embeddingJson });
}

/**
 * Search articles by semantic similarity to the query
 * Returns articles sorted by similarity score (highest first)
 */
export async function searchArticles(
  c: Context<{ Bindings: Bindings }>,
  query: string,
  limit: number = 5,
): Promise<ArticleWithScore[]> {
  const db = drizzle(c.env.DB);

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(c.env.AI, query);

  // Get all articles with embeddings
  const articles = await getAllArticlesWithEmbeddings(db);

  // Calculate similarity scores
  const articlesWithScores: ArticleWithScore[] = articles
    .map((article) => {
      const articleEmbedding = JSON.parse(article.embedding!) as number[];
      const score = cosineSimilarity(queryEmbedding, articleEmbedding);
      return { ...article, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return articlesWithScores;
}
