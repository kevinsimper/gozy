import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { z } from "zod";
import { Bindings } from "../..";
import { requireAdmin } from "../../lib/adminAuth";
import * as schema from "../../db/schema";
import {
  createArticle,
  listArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  addQuestion,
  removeQuestion,
  getQuestionsByArticleId,
  getQuestionById,
} from "../../models/helpdesk";
import { regenerateEmbedding } from "../../lib/helpdesk";
import {
  HelpdeskListView,
  HelpdeskDetailView,
} from "../../views/admin/helpdesk";
import { buildZodSchema } from "../../services/hform/formbuilder";
import { HForm } from "../../services/hform/form";
import { lk, AppLink } from "../../lib/links";

const createFields = [
  {
    name: "title",
    label: "Title",
    htmlType: "text",
    required: true,
    zodSchema: z.string().min(1, "Title is required").max(200),
    placeholder: "How to renew my taxi license",
    description: "A descriptive title for the article",
  },
  {
    name: "description",
    label: "Description",
    htmlType: "textarea",
    required: true,
    zodSchema: z.string().min(1, "Description is required"),
    placeholder: "To renew your taxi license, you need to...",
    description: "The article content that answers the question",
    rows: 6,
  },
] as const;

const editFields = [
  {
    name: "title",
    label: "Title",
    htmlType: "text",
    required: true,
    zodSchema: z.string().min(1, "Title is required").max(200),
    placeholder: "How to renew my taxi license",
  },
  {
    name: "description",
    label: "Description",
    htmlType: "textarea",
    required: true,
    zodSchema: z.string().min(1, "Description is required"),
    placeholder: "To renew your taxi license, you need to...",
    rows: 6,
  },
] as const;

const questionFields = [
  {
    name: "question",
    label: "Question",
    htmlType: "text",
    required: true,
    zodSchema: z.string().min(1, "Question is required").max(500),
    placeholder: "How do I renew my license?",
    description: "A question that should trigger this article",
  },
] as const;

const { schema: createSchema, formDefinition: createFormDefinition } =
  buildZodSchema(createFields);
const { schema: editSchema, formDefinition: editFormDefinition } =
  buildZodSchema(editFields);
const { schema: questionSchema, formDefinition: questionFormDefinition } =
  buildZodSchema(questionFields);

export const helpdeskRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const db = drizzle(c.env.DB, { schema });
    const articles = await listArticles(db);

    const createForm = HForm(createFormDefinition, {
      id: "create-article-form",
      method: "POST",
      action: lk(AppLink.AdminHelpdesk),
    });

    return c.render(
      <HelpdeskListView articles={articles} form={createForm} />,
      {
        title: "Helpdesk Articles - Gozy Admin",
      },
    );
  })
  .post("/", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const formData = await c.req.parseBody();
    const parseResult = createSchema.safeParse(formData);

    const createForm = HForm(createFormDefinition, {
      id: "create-article-form",
      method: "POST",
      action: lk(AppLink.AdminHelpdesk),
    });

    if (!parseResult.success) {
      const errors = createForm.handleValidation(parseResult);
      const db = drizzle(c.env.DB, { schema });
      const articles = await listArticles(db);

      return c.render(
        <HelpdeskListView
          articles={articles}
          form={createForm}
          formData={formData}
          formErrors={errors}
        />,
        {
          title: "Helpdesk Articles - Gozy Admin",
        },
      );
    }

    const db = drizzle(c.env.DB);
    const article = await createArticle(db, {
      title: parseResult.data.title,
      description: parseResult.data.description,
    });

    // Generate embedding for the new article
    try {
      await regenerateEmbedding(c, article.id);
    } catch (error) {
      console.error("Failed to generate embedding:", error);
    }

    return c.redirect(
      lk(AppLink.AdminHelpdeskDetail, { articleId: String(article.id) }),
    );
  })
  .get("/:articleId", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const articleId = parseInt(c.req.param("articleId"), 10);
    if (isNaN(articleId)) {
      return c.notFound();
    }

    const db = drizzle(c.env.DB);
    const article = await getArticleById(db, articleId);

    if (!article) {
      return c.notFound();
    }

    const questions = await getQuestionsByArticleId(db, articleId);

    const editForm = HForm(editFormDefinition, {
      id: "edit-article-form",
      method: "POST",
      action: lk(AppLink.AdminHelpdeskDetail, { articleId: String(articleId) }),
    });

    const questionForm = HForm(questionFormDefinition, {
      id: "add-question-form",
      method: "POST",
      action: lk(AppLink.AdminHelpdeskAddQuestion, {
        articleId: String(articleId),
      }),
    });

    return c.render(
      <HelpdeskDetailView
        article={article}
        questions={questions}
        form={editForm}
        questionForm={questionForm}
      />,
      {
        title: `${article.title} - Helpdesk - Gozy Admin`,
      },
    );
  })
  .post("/:articleId", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const articleId = parseInt(c.req.param("articleId"), 10);
    if (isNaN(articleId)) {
      return c.notFound();
    }

    const db = drizzle(c.env.DB);
    const article = await getArticleById(db, articleId);

    if (!article) {
      return c.notFound();
    }

    const formData = await c.req.parseBody();
    const parseResult = editSchema.safeParse(formData);

    const editForm = HForm(editFormDefinition, {
      id: "edit-article-form",
      method: "POST",
      action: lk(AppLink.AdminHelpdeskDetail, { articleId: String(articleId) }),
    });

    if (!parseResult.success) {
      const errors = editForm.handleValidation(parseResult);
      const questions = await getQuestionsByArticleId(db, articleId);

      const questionForm = HForm(questionFormDefinition, {
        id: "add-question-form",
        method: "POST",
        action: lk(AppLink.AdminHelpdeskAddQuestion, {
          articleId: String(articleId),
        }),
      });

      return c.render(
        <HelpdeskDetailView
          article={article}
          questions={questions}
          form={editForm}
          questionForm={questionForm}
          formData={formData}
          formErrors={errors}
        />,
        {
          title: `${article.title} - Helpdesk - Gozy Admin`,
        },
      );
    }

    await updateArticle(db, articleId, {
      title: parseResult.data.title,
      description: parseResult.data.description,
    });

    // Regenerate embedding after update
    try {
      await regenerateEmbedding(c, articleId);
    } catch (error) {
      console.error("Failed to regenerate embedding:", error);
    }

    return c.redirect(
      lk(AppLink.AdminHelpdeskDetail, { articleId: String(articleId) }),
    );
  })
  .post("/:articleId/delete", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const articleId = parseInt(c.req.param("articleId"), 10);
    if (isNaN(articleId)) {
      return c.notFound();
    }

    const db = drizzle(c.env.DB);
    await deleteArticle(db, articleId);

    return c.redirect(lk(AppLink.AdminHelpdesk));
  })
  .post("/:articleId/questions", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const articleId = parseInt(c.req.param("articleId"), 10);
    if (isNaN(articleId)) {
      return c.notFound();
    }

    const db = drizzle(c.env.DB);
    const article = await getArticleById(db, articleId);

    if (!article) {
      return c.notFound();
    }

    const formData = await c.req.parseBody();
    const parseResult = questionSchema.safeParse(formData);

    if (!parseResult.success) {
      const questions = await getQuestionsByArticleId(db, articleId);

      const editForm = HForm(editFormDefinition, {
        id: "edit-article-form",
        method: "POST",
        action: lk(AppLink.AdminHelpdeskDetail, {
          articleId: String(articleId),
        }),
      });

      const questionForm = HForm(questionFormDefinition, {
        id: "add-question-form",
        method: "POST",
        action: lk(AppLink.AdminHelpdeskAddQuestion, {
          articleId: String(articleId),
        }),
      });

      const errors = questionForm.handleValidation(parseResult);

      return c.render(
        <HelpdeskDetailView
          article={article}
          questions={questions}
          form={editForm}
          questionForm={questionForm}
          questionFormData={formData}
          questionFormErrors={errors}
        />,
        {
          title: `${article.title} - Helpdesk - Gozy Admin`,
        },
      );
    }

    await addQuestion(db, articleId, parseResult.data.question);

    // Regenerate embedding after adding question
    try {
      await regenerateEmbedding(c, articleId);
    } catch (error) {
      console.error("Failed to regenerate embedding:", error);
    }

    return c.redirect(
      lk(AppLink.AdminHelpdeskDetail, { articleId: String(articleId) }),
    );
  })
  .post("/:articleId/questions/:questionId/delete", async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const articleId = parseInt(c.req.param("articleId"), 10);
    const questionId = parseInt(c.req.param("questionId"), 10);

    if (isNaN(articleId) || isNaN(questionId)) {
      return c.notFound();
    }

    const db = drizzle(c.env.DB);

    // Verify the question belongs to this article
    const question = await getQuestionById(db, questionId);
    if (!question || question.articleId !== articleId) {
      return c.notFound();
    }

    await removeQuestion(db, questionId);

    // Regenerate embedding after removing question
    try {
      await regenerateEmbedding(c, articleId);
    } catch (error) {
      console.error("Failed to regenerate embedding:", error);
    }

    return c.redirect(
      lk(AppLink.AdminHelpdeskDetail, { articleId: String(articleId) }),
    );
  });
