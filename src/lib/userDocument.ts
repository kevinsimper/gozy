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
import { analyzeDocument } from "./documents/analysis";

const DEFAULT_REMINDER_DAYS: Record<string, number> = {
  taximeter_certificate: 30,
  vehicle_inspection: 30,
  taxi_id: 30,
  winter_tires: 60,
  drivers_license: 60,
  vehicle_registration: 30,
  insurance: 60,
  tax_card: 30,
  criminal_record: 30,
  leasing_agreement: 30,
};

export async function uploadUserDocument(
  c: { env: { DB: D1Database; FILES: R2Bucket; GEMINI_API_KEY: string } },
  userId: number,
  file: File,
  documentType?: string,
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

  let finalDocumentType = documentType || "other";
  let expiryDate: Date | undefined;
  let reminderDaysBefore: number | undefined;
  let description: string | undefined;

  try {
    const analysis = await analyzeDocument(c, file);

    if (
      analysis.documentType &&
      (analysis.confidence === "high" || analysis.confidence === "medium")
    ) {
      finalDocumentType = analysis.documentType;
    }

    if (analysis.expiryDate) {
      expiryDate = new Date(analysis.expiryDate);
    }

    if (analysis.notes) {
      description = analysis.notes;
    }

    if (expiryDate && finalDocumentType !== "other") {
      reminderDaysBefore = DEFAULT_REMINDER_DAYS[finalDocumentType] || 30;
    }
  } catch (error) {
    console.error("Document analysis failed, using defaults:", error);
  }

  await createUserDocumentModel(c, {
    userId,
    fileId: fileRecord.id,
    documentType: finalDocumentType,
    expiryDate,
    description,
    reminderDaysBefore,
  });
}

export async function saveConversationFileAsUserDocument(
  c: { env: { DB: D1Database; FILES: R2Bucket; GEMINI_API_KEY: string } },
  userId: number,
  messageFileId: number,
  documentType?: string,
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

  const [body1, body2] = sourceObject.body.tee();

  await c.env.FILES.put(newStorageKey, body1, {
    httpMetadata: sourceObject.httpMetadata,
  });

  const fileRecord = await createFile(c, {
    storageKey: newStorageKey,
    originalFilename: sourceFile.originalFilename,
    mimeType: sourceFile.mimeType,
    size: sourceFile.size,
  });

  let finalDocumentType = documentType || "other";
  let expiryDate: Date | undefined;
  let reminderDaysBefore: number | undefined;
  let description: string | undefined;

  try {
    const arrayBuffer = await new Response(body2).arrayBuffer();
    const file = new File([arrayBuffer], sourceFile.originalFilename, {
      type: sourceFile.mimeType,
    });

    const analysis = await analyzeDocument(c, file);

    if (
      analysis.documentType &&
      (analysis.confidence === "high" || analysis.confidence === "medium")
    ) {
      finalDocumentType = analysis.documentType;
    }

    if (analysis.expiryDate) {
      expiryDate = new Date(analysis.expiryDate);
    }

    if (analysis.notes) {
      description = analysis.notes;
    }

    if (expiryDate && finalDocumentType !== "other") {
      reminderDaysBefore = DEFAULT_REMINDER_DAYS[finalDocumentType] || 30;
    }
  } catch (error) {
    console.error("Document analysis failed, using defaults:", error);
  }

  await createUserDocumentModel(c, {
    userId,
    fileId: fileRecord.id,
    documentType: finalDocumentType,
    expiryDate,
    description,
    reminderDaysBefore,
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
