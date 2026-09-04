import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";

export interface IDBUpload {
  id: string;
  file: File;
  submissionId: string;
  userId: string;
  residentName?: string;
  residentEmail?: string;
  progress: number;
  status:
    | "Pending"
    | "Uploading"
    | "Uploaded"
    | "Failed"
    | "Retrying"
    | "Failed";
  url?: string;
}

interface UploadDB extends DBSchema {
  uploads: {
    key: string;
    value: IDBUpload;
  };
}

let dbPromise: Promise<IDBPDatabase<UploadDB>> | null = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<UploadDB>("UploadsDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("uploads")) {
          db.createObjectStore("uploads", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
};

export const saveUpload = async (upload: IDBUpload) => {
  const db = await initDB();
  await db.put("uploads", upload);
};

export const getUploads = async (): Promise<IDBUpload[]> => {
  const db = await initDB();
  const allUploads = await db.getAll("uploads");

  // Cleanup uploads older than 96 hours to prevent zombie queues
  const now = Date.now();
  const validUploads: IDBUpload[] = [];

  for (const u of allUploads) {
    // Extract timestamp from the start of the ID (e.g. "1713753232123_filename")
    const match = u.id.match(/^(\d+)_/);
    if (match) {
      const timestamp = parseInt(match[1], 10);
      if (now - timestamp > 96 * 60 * 60 * 1000) {
        console.warn(`[IDB] Cleaning up ancient upload: ${u.id} (> 96h)`);
        await db.delete("uploads", u.id);
        continue;
      }
    }
    validUploads.push(u);
  }

  return validUploads;
};

export const deleteUpload = async (id: string) => {
  const db = await initDB();
  await db.delete("uploads", id);
};

export const clearAllUploads = async () => {
  const db = await initDB();
  await db.clear("uploads");
};
