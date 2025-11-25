import { createFile, findFileById, type DatabaseFile } from "../models/file";

export type StorageContext =
  | "assistant-images"
  | "user-documents"
  | "whatsapp-media";

export async function copyFileToContext(
  c: { env: { DB: D1Database; FILES: R2Bucket } },
  sourceFileId: number,
  targetContext: StorageContext,
  options?: {
    userId?: number;
    filename?: string;
  },
): Promise<DatabaseFile> {
  const sourceFile = await findFileById(c, sourceFileId);
  if (!sourceFile) {
    throw new Error("Source file not found");
  }

  const sourceObject = await c.env.FILES.get(sourceFile.storageKey);
  if (!sourceObject) {
    throw new Error("File not found in storage");
  }

  // Generate storage key based on context
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const filename = options?.filename || sourceFile.originalFilename;

  let storageKey: string;
  switch (targetContext) {
    case "assistant-images":
      storageKey = `assistant-images/${timestamp}-${filename}`;
      break;
    case "user-documents":
      if (!options?.userId)
        throw new Error("userId required for user-documents");
      storageKey = `user-documents/${options.userId}/${timestamp}-${randomSuffix}-${filename}`;
      break;
    case "whatsapp-media":
      storageKey = `whatsapp-media/${timestamp}-${filename}`;
      break;
  }

  // Copy file to new location
  await c.env.FILES.put(storageKey, sourceObject.body, {
    httpMetadata: sourceObject.httpMetadata,
  });

  // Create new file record
  return await createFile(c, {
    storageKey,
    originalFilename: sourceFile.originalFilename,
    mimeType: sourceFile.mimeType,
    size: sourceFile.size,
  });
}
