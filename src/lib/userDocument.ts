import {
  createUserDocument as createUserDocumentModel,
  findUserDocumentsByUserId,
  deleteUserDocument as deleteUserDocumentModel,
} from "../models/userDocument";
import {
  createFile,
  deleteFile as deleteFileModel,
  findFileById,
} from "../models/file";

export async function uploadUserDocument(
  c: { env: { DB: D1Database; FILES: R2Bucket } },
  userId: number,
  file: File,
  documentType: string,
): Promise<void> {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const storageKey = `user-documents/${userId}/${timestamp}-${randomSuffix}-${file.name}`;

  await c.env.FILES.put(storageKey, file, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  const fileRecord = await createFile(c, {
    storageKey,
    originalFilename: file.name,
    mimeType: file.type,
    size: file.size,
  });

  await createUserDocumentModel(c, {
    userId,
    fileId: fileRecord.id,
    documentType,
  });
}

export async function saveConversationFileAsUserDocument(
  c: { env: { DB: D1Database; FILES: R2Bucket } },
  userId: number,
  messageFileId: number,
  documentType: string,
): Promise<void> {
  const sourceFile = await findFileById(c, messageFileId);
  if (!sourceFile) {
    throw new Error("Message file not found");
  }

  const sourceObject = await c.env.FILES.get(sourceFile.storageKey);
  if (!sourceObject) {
    throw new Error("File not found in storage");
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const newStorageKey = `user-documents/${userId}/${timestamp}-${randomSuffix}-${sourceFile.originalFilename}`;

  await c.env.FILES.put(newStorageKey, sourceObject.body, {
    httpMetadata: sourceObject.httpMetadata,
  });

  const fileRecord = await createFile(c, {
    storageKey: newStorageKey,
    originalFilename: sourceFile.originalFilename,
    mimeType: sourceFile.mimeType,
    size: sourceFile.size,
  });

  await createUserDocumentModel(c, {
    userId,
    fileId: fileRecord.id,
    documentType,
  });
}

export async function deleteUserDocumentWithFile(
  c: { env: { DB: D1Database; FILES: R2Bucket } },
  userId: number,
  publicId: string,
): Promise<void> {
  const documents = await findUserDocumentsByUserId(c, userId);
  const document = documents.find((d) => d.publicId === publicId);

  if (!document) {
    throw new Error("Document not found");
  }

  await c.env.FILES.delete(document.file.storageKey);
  await deleteFileModel(c, document.file.publicId);
  await deleteUserDocumentModel(c, publicId);
}
