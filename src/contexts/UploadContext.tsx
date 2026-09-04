import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as tus from "tus-js-client";
import { deleteUpload, getUploads, saveUpload } from "../utils/idb";
import { disableKeepAlive } from "../utils/keepAlive";
import { generateClientThumbnail } from "../utils/thumbnailGenerator";

export type UploadStatus =
  | "Pending"
  | "Uploading"
  | "Uploaded"
  | "Failed"
  | "Retrying"
  | "Failed";

export interface FileUpload {
  id: string; // The physical file name or a generated ID to identify this file upload
  file: File;
  progress: number;
  status: UploadStatus;
  url?: string;
  tusUpload?: tus.Upload;
  submissionId: string;
  userId: string;
  residentName?: string;
  residentEmail?: string;
  lastProgressTime?: number;
  lastProgressValue?: number;
  retryCount?: number; //
}

interface UploadContextType {
  uploads: FileUpload[];
  startUploads: (
    files: File[],
    submissionId: string,
    userId: string,
    residentName: string,
    residentEmail: string
  ) => void;
  clearUploads: () => void;
  cancelUpload: (filename: string, submissionId: string) => void;
  retryUpload: (filename: string, submissionId: string) => Promise<void>;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "https://api.premiumpd.com";

export const UploadProvider = ({ children }: { children: ReactNode }) => {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  // Tracks file IDs that currently have an active TUS upload started, to prevent double-starting
  const activeUploadIds = useRef<Set<string>>(new Set());

  // const uppyRef = useRef<any>(null);

  // console.log("Queue triggered", uploads);
  // Load from IndexedDB on startup and ONLY resume uploads from PREVIOUS sessions
  useEffect(() => {
    const loadFromDB = async () => {
      try {
        const storedUploads = await getUploads();

        // Convert IDBUploads to FileUploads, skipping Uploaded ones (clean them up)
        const toResume: FileUpload[] = [];
        for (const u of storedUploads) {
          if (u.status === "Uploaded") {
            // Clean up completed uploads from IDB — they don't need to be tracked anymore
            await deleteUpload(u.id);
            continue;
          }

          // 48-hour expiration check
          const timestampStr = u.id?.split("_")[0];
          const createdAt = parseInt(timestampStr, 10);
          if (
            !isNaN(createdAt) &&
            Date.now() - createdAt > 48 * 60 * 60 * 1000
          ) {
            console.warn(`[IDB] Clearing 48h+ expired upload ${u.id}`);
            await deleteUpload(u.id);
            if (u.file) {
              const customFingerprint = `tus-${u.submissionId}-${u.id}-${u.file.name}-${u.file.size}-${u.file.lastModified}`;
              localStorage.removeItem(customFingerprint);
              localStorage.removeItem(`tus-${customFingerprint}`); // Just in case tus prefixes it
            }
            continue;
          }
          if (!u.file) {
            // Can't resume without the original File object — skip
            console.warn(`[IDB] Skipping ${u.id} — no File object found`);
            continue;
          }
          toResume.push({
            id: u.id,
            file: u.file,
            progress: u.progress,
            status: "Pending", // Always reset to Pending on reload so they queue up cleanly instead of ghosting as "Uploading"
            url: u.url,
            submissionId: u.submissionId,
            userId: u.userId,
            residentName: u.residentName,
            residentEmail: u.residentEmail,
          });
        }

        setUploads(toResume);

        // The Queue Manager will automatically start these Pending files
      } catch (error) {
        console.error("Failed to load uploads from IDB", error);
      }
    };
    loadFromDB();
  }, []);

  // Monitor total upload completion to stop KeepAlive Audio and prevent accidental page refresh
  useEffect(() => {
    const hasActiveUploads = uploads.some(
      (u) => u.status === "Pending" || u.status === "Uploading"
    );

    if (!hasActiveUploads && uploads.length > 0) {
      disableKeepAlive();
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasActiveUploads) {
        e.preventDefault();
        e.returnValue =
          "You have uploads in progress. If you leave, they will be canceled and permanently lost.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [uploads]);

  // Queue Manager: Ensures we only have CONCURRENCY_LIMIT active uploads at a time
  useEffect(() => {
    let currentActive = activeUploadIds.current.size;
    const CONCURRENCY_LIMIT = 3; // Match old refine-uploadFiles branch — 3 parallel uploads
    if (currentActive < CONCURRENCY_LIMIT) {
      const pendingUploads = uploads.filter((u) => u.status === "Pending");
      for (const u of pendingUploads) {
        if (currentActive >= CONCURRENCY_LIMIT) break;
        if (!activeUploadIds.current.has(u.id)) {
          startSingleUpload(
            u.file,
            u.id,
            u.submissionId,
            u.userId,
            u.residentName,
            u.residentEmail
          );
          currentActive++;
        }
      }
    }
  }, [uploads]);

  // Watchdog Timer: Aborts uploads that have stalled for over 45 seconds
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setUploads((prev) => {
  //       let changed = false;
  //       const now = Date.now();
  //       const next = prev.map((u) => {
  //         if (
  //           u.status === "Uploading" &&
  //           u.lastProgressTime &&
  //           // now - u.lastProgressTime > 120000
  //           now - u.lastProgressTime >
  //             (u.file.size > 300 * 1024 * 1024 ? 300000 : 120000)
  //         ) {
  //           console.warn(
  //             `[Watchdog] Upload ${u.id} stalled for 2 minutes. Failing.`
  //           );
  //           changed = true;

  //           activeUploadIds.current.delete(u.id);

  //           // Notify backend
  //           fetch(`${API_URL}/upload/updateStatus`, {
  //             method: "PUT",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({
  //               submissionId: u.submissionId,
  //               filename: u.file?.name || "unknown",
  //               size: u.file?.size || 0,
  //               status: "Pending",
  //               failureReason: "Watchdog timeout (stalled >2m in frontend)",
  //             }),
  //           }).catch((e) => console.error("[Watchdog] Log Pending:", e));

  //           return { ...u, status: "Pending" as UploadStatus };
  //         }
  //         return u;
  //       });
  //       return changed ? next : prev;
  //     });
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

  // Sync state changes back to IDB whenever specific files update
  const syncToIDB = async (u: FileUpload) => {
    try {
      if (u.status === "Uploaded") {
        await saveUpload({
          id: u.id,
          file: u.file,
          submissionId: u.submissionId,
          userId: u.userId,
          residentName: u.residentName,
          residentEmail: u.residentEmail,
          progress: u.progress,
          status: u.status,
          url: u.url,
        });
      } else {
        await saveUpload({
          id: u.id,
          file: u.file,
          submissionId: u.submissionId,
          userId: u.userId,
          residentName: u.residentName,
          residentEmail: u.residentEmail,
          progress: u.progress,
          status: u.status,
          url: u.url,
        });
      }
    } catch (e) {
      console.error("IDB Sync Error:", e);
    }
  };

  // Function to initialize and start uploading a file via tus
  const startSingleUpload = (
    file: File,
    fileId: string,
    submissionId: string,
    userId: string,
    residentName?: string,
    residentEmail?: string
  ) => {
    // console.log("Starting upload", fileId);
    // GUARD: Prevent starting the same file twice (e.g., from React Strict Mode or IDB race)
    if (activeUploadIds.current.has(fileId)) {
      console.warn(
        `[Upload] Skipping duplicate startSingleUpload for: ${fileId}`
      );
      return;
    }
    activeUploadIds.current.add(fileId);
    // console.log(`[Upload] Starting upload for: ${fileId}`);

    try {
      let lastUpdate = 0;
      const upload = new tus.Upload(file, {
        endpoint: `${API_URL}/upload/tus`,
        // chunkSize MUST match server's S3Store partSize (10MB).
        // - Too large (e.g. 20MB): server must buffer+split → overhead, slower
        // - Infinity (no chunks): one big stream → "non-retryable streaming request" on any drop
        // - Exact match (10MB): S3 receives parts directly, no buffering, each chunk is retryable
        chunkSize: 10 * 1024 * 1024, // 10MB — exactly matches server S3Store partSize
        retryDelays: [0, 3000, 5000, 10000, 20000],
        removeFingerprintOnSuccess: true,
        // Custom fingerprint: include submissionId + fileId so files with identical names
        // across different submissions never share a tus resumability slot in localStorage.
        fingerprint: async (_file: File, _options: tus.UploadOptions) =>
          `tus-${submissionId}-${fileId}-${file.name}-${file.size}-${file.lastModified}`,
        metadata: {
          filename: file.name,
          filetype: file.type,
          submissionId,
          userId,
          residentName: residentName || "",
          residentEmail: residentEmail || "",
        },
        onError: function (error: any) {
          console.error("Failed because: " + error);

          // If it failed because the previous upload url expired (404), restart
          if (error?.originalResponse?.getStatus() === 404) {
            console.log("Upload URL expired (404), starting fresh...");

            // To force a fresh upload, we create a new TUS upload instance
            // without passing the previous URL, and make sure we don't try to resume.
            const freshOptions = { ...upload.options };
            const freshUpload = new tus.Upload(file, freshOptions);

            setUploads((prev) =>
              prev.map((u) =>
                u.id === fileId
                  ? {
                      ...u,
                      tusUpload: freshUpload,
                      status: "Uploading" as UploadStatus,
                      lastProgressTime: Date.now(),
                    }
                  : u
              )
            );
            freshUpload.start();
            return;
          }

          // Log the failure to the backend
          fetch(`${API_URL}/upload/updateStatus`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              submissionId,
              filename: file.name,
              size: file.size,
              status: "Failed",
              failureReason: error?.message || String(error),
            }),
          }).catch((e) =>
            console.error("[StatusLog] Failed to log status:", e)
          );

          setUploads((prev) => {
            const next = prev.map((u) =>
              u.id === fileId
                ? {
                    ...u,
                    status: "Failed" as UploadStatus,
                    lastProgressTime: undefined,
                  }
                : u
            );
            const updated = next.find((x) => x.id === fileId);
            if (updated) syncToIDB(updated);
            // Remove from active set so the queue can process the next file
            activeUploadIds.current.delete(fileId);
            return next;
          });
        },
        // onProgress: function (bytesUploaded, bytesTotal) {
        //   const percentage = Number(
        //     ((bytesUploaded / bytesTotal) * 100).toFixed(2)
        //   );
        //   // Optimize: don't sync IDB on every progress tick to avoid freeze, but sync it when status changes
        //   setUploads((prev) => {
        //     const next = prev.map((u) =>
        //       u.id === fileId
        //         ? {
        //             ...u,
        //             progress: Math.max(u.progress || 0, percentage),
        //             status: "Uploading" as UploadStatus,
        //             lastProgressTime: Date.now(),
        //           }
        //         : u
        //     );
        //     return next;
        //   });
        // },

        onProgress: (bytesUploaded, bytesTotal) => {
          const now = Date.now();

          if (now - lastUpdate < 500) return;
          lastUpdate = now;

          const percentage = Number(
            ((bytesUploaded / bytesTotal) * 100).toFixed(2)
          );

          setUploads((prev) =>
            prev.map((u) => {
              if (u.id !== fileId) return u;

              const changed = percentage !== u.lastProgressValue;

              return {
                ...u,
                progress: Math.max(u.progress || 0, percentage),
                status: "Uploading",
                lastProgressTime: changed ? Date.now() : u.lastProgressTime,
                lastProgressValue: percentage,
              };
            })
          );
        },
        onSuccess: function () {
          console.log(`[Upload] Completed: ${upload.file.name}`);

          // Notify backend of success
          fetch(`${API_URL}/upload/updateStatus`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              submissionId,
              filename: file.name,
              size: file.size,
              status: "Uploaded",
            }),
          }).catch((e) =>
            console.error("[StatusLog] Failed to log success status:", e)
          );

          // Generate and upload thumbnail in the background
          generateClientThumbnail(file).then((thumbnailBlob) => {
            if (thumbnailBlob) {
              const formData = new FormData();
              formData.append("submissionId", submissionId);
              formData.append("filename", file.name);
              formData.append("thumbnail", thumbnailBlob, "thumbnail.jpg");

              fetch(`${API_URL}/upload/thumbnail`, {
                method: "POST",
                body: formData,
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    console.log("[Thumbnail] Uploaded successfully:", data.thumbnailUrl);
                  }
                })
                .catch((err) => console.error("[Thumbnail] Upload failed:", err));
            }
          });

          setUploads((prev: any) => {
            const next = prev.map((u: any) =>
              u.id === fileId
                ? {
                    ...u,
                    progress: 100,
                    status: "Uploaded",
                    url: upload.url,
                    lastProgressTime: undefined,
                  }
                : u
            );
            // Remove from IDB — upload is done, no need to resume it on next load
            deleteUpload(fileId);
            // Remove from active set so the queue can process the next file
            activeUploadIds.current.delete(fileId);
            return next;
          });
        },
      });

      // Save the tusUpload reference and transition to Uploading
      setUploads((prev) =>
        prev.map((u) =>
          u.id === fileId
            ? {
                ...u,
                tusUpload: upload,
                status: "Uploading" as UploadStatus,
                lastProgressTime: Date.now(),
              }
            : u
        )
      );

      // Check if there are any previous uploads to continue.
      upload
        .findPreviousUploads()
        .then(function (previousUploads) {
          // Found previous uploads so we select the first one.
          if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0]);
          }

          // Start the upload
          upload.start();
        })
        .catch((error) => {
          console.error("Failed to find previous uploads:", error);

          // If resuming fails (e.g., 404 Not Found from server),
          // we should try to clear the local tus fingerprint and start fresh.
          if (
            error &&
            error.originalResponse &&
            (error.originalResponse.getStatus() === 404 ||
              error.originalResponse.getStatus() === 410)
          ) {
            console.log(
              "Server rejected resume (404/410), starting fresh upload..."
            );
            // This will force tus to create a new upload
            const freshOptions = { ...upload.options };
            const freshUpload = new tus.Upload(file, freshOptions);

            setUploads((prev) =>
              prev.map((u) =>
                u.id === fileId ? { ...u, tusUpload: freshUpload } : u
              )
            );

            freshUpload.start();
          } else {
            upload.start();
          }
        });
    } catch (err: any) {
      console.error(
        `[Upload] Synchronous error starting upload for ${fileId}:`,
        err
      );
      // Fallback: Mark as failed if it couldn't even initialize
      setUploads((prev) => {
        const next = prev.map((u) =>
          u.id === fileId
            ? {
                ...u,
                status: "Failed" as UploadStatus,
                lastProgressTime: undefined,
              }
            : u
        );
        activeUploadIds.current.delete(fileId);
        return next;
      });
    }
  };

  const startUploads = async (
    files: File[],
    submissionId: string,
    userId: string,
    residentName?: string,
    residentEmail?: string
  ) => {
    // 1. Pre-register the batch with "Pending" status in the backend
    try {
      console.log(
        `[Batch] Registering ${files.length} files at ${API_URL}/upload/registerBatch ...`
      );
      const response = await fetch(`${API_URL}/upload/registerBatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          userId,
          residentName,
          residentEmail,
          files: files.map((f) => ({ name: f.name, size: f.size })),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("[Batch] Registered successfully:", result);
      } else {
        const errorText = await response.text();
        console.error(
          `[Batch] Failed to register batch: ${response.status} ${response.statusText}`,
          errorText
        );
      }
    } catch (e: any) {
      console.error("[Batch] Network error registering batch:", e.message);
    }

    // 2. Create local upload records ONLY for files that aren't already queued/uploaded
    const newFiles = files.filter(
      (file) =>
        !uploads.some(
          (u) => u.submissionId === submissionId && u.file?.name === file.name
        )
    );

    if (newFiles.length === 0) {
      console.log(
        "[Upload] All selected files are already queued or uploaded."
      );
      return;
    }

    const newUploads = newFiles.map((file) => ({
      id: `${Date.now()}_${file.name}`,
      file,
      progress: 0,
      status: "Pending" as UploadStatus,
      submissionId,
      userId,
      residentName,
      residentEmail,
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // 3. Save to IDB. The Queue Manager will pick them up automatically.
    newUploads.forEach((u) => {
      syncToIDB(u);
    });
  };

  const clearUploads = () => {
    setUploads([]);
  };

  /**
   * Abort the current tus connection for a stuck/stalled upload and reset it
   * back to "Pending" so the queue manager restarts it automatically.
   * Passes `false` to abort() so server-side partial data is preserved for resuming.
   */
  const retryUpload = async (filename: string, submissionId: string) => {
    const targetUpload = uploads.find(
      (u) => u.file.name === filename && u.submissionId === submissionId
    );

    if (!targetUpload) {
      console.warn(`[Retry] No upload found for ${filename}`);
      return;
    }

    if (targetUpload.tusUpload) {
      try {
        // abort(false) = stop network, keep server-side partial upload intact
        await targetUpload.tusUpload.abort(false);
      } catch (e) {
        console.warn("[Retry] Error aborting tus upload before retry:", e);
      }
    }

    activeUploadIds.current.delete(targetUpload.id);
    setUploads((prev) =>
      prev.map((u) =>
        u.id === targetUpload.id
          ? {
              ...u,
              tusUpload: undefined,
              status: "Pending" as UploadStatus,
              lastProgressTime: undefined,
              lastProgressValue: undefined,
            }
          : u
      )
    );
    console.log(
      `[Retry] Reset ${filename} to Pending — queue manager will restart it.`
    );
  };

  const cancelUpload = async (filename: string, submissionId: string) => {
    // console.log(`[Upload] Cancelling upload for: ${filename}`);

    // Find the file locally
    const targetUpload = uploads.find(
      (u) => u.file.name === filename && u.submissionId === submissionId
    );

    if (targetUpload) {
      // Abort the running TUS upload if it exists
      if (targetUpload.tusUpload) {
        try {
          targetUpload.tusUpload.abort(true);
        } catch (e) {
          console.error("Failed to abort tus upload", e);
        }
      }
      // Remove from IDB
      deleteUpload(targetUpload.id);
      activeUploadIds.current.delete(targetUpload.id);

      // Remove from local React state
      setUploads((prev) => prev.filter((u) => u.id !== targetUpload.id));
    }

    // Call backend to ensure DB/S3 are cleaned up
    try {
      await fetch(
        `${API_URL}/upload/deleteByName?filename=${encodeURIComponent(
          filename
        )}&submissionId=${encodeURIComponent(submissionId)}`,
        { method: "DELETE" }
      );
    } catch (e) {
      console.error("[Upload] Failed to call delete backend API:", e);
    }
  };

  return (
    <UploadContext.Provider
      value={{ uploads, startUploads, clearUploads, cancelUpload, retryUpload }}
    >
      {children}
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
};
