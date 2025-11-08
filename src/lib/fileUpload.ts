import { createFile, DatabaseFile } from "../models/file";

type UploadFileContext = {
  env: {
    DB: D1Database;
    FILES: R2Bucket;
  };
};

const storageKeyPrefix = "whatsapp-media";

export async function uploadAndCreateFile(
  c: UploadFileContext,
  file: File,
): Promise<DatabaseFile> {
  const timestamp = Date.now();
  const storageKey = `${storageKeyPrefix}/${timestamp}-${file.name}`;

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

  return fileRecord;
}
