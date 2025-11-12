import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { count, desc, eq } from "drizzle-orm";
import { usersTable, userDocumentsTable, filesTable } from "../../db/schema";
import { requireAdmin } from "../../lib/adminAuth";
import { AdminDocuments } from "../../views/admin/documents";
import { Bindings } from "../..";

export const documentsRoutes = new Hono<{ Bindings: Bindings }>().get(
  "/",
  async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const db = drizzle(c.env.DB);

    // Get all documents with user and file information
    const documents = await db
      .select({
        id: userDocumentsTable.id,
        publicId: userDocumentsTable.publicId,
        userId: userDocumentsTable.userId,
        fileId: userDocumentsTable.fileId,
        documentType: userDocumentsTable.documentType,
        createdAt: userDocumentsTable.createdAt,
        updatedAt: userDocumentsTable.updatedAt,
        user: usersTable,
        file: filesTable,
      })
      .from(userDocumentsTable)
      .innerJoin(filesTable, eq(userDocumentsTable.fileId, filesTable.id))
      .innerJoin(usersTable, eq(userDocumentsTable.userId, usersTable.id))
      .orderBy(desc(userDocumentsTable.createdAt))
      .all();

    // Get total documents count
    const totalDocsResult = await db
      .select({ count: count() })
      .from(userDocumentsTable)
      .get();
    const totalDocuments = totalDocsResult?.count || 0;

    // Calculate total size
    const totalSize = documents.reduce((acc, doc) => acc + doc.file.size, 0);

    const stats = {
      totalDocuments,
      totalSize,
    };

    return c.render(<AdminDocuments documents={documents} stats={stats} />, {
      title: "Documents - Admin - Gozy",
    });
  },
);
