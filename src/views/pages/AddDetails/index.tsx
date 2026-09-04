// AddDetails.tsx
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CollectionsIcon from "@mui/icons-material/Collections";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SyncIcon from "@mui/icons-material/Sync";

import Grid from "@mui/material/Grid";
import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { useUpload } from "../../../contexts/UploadContext";
import useJotForm from "../../../hooks/useJotForm";
import MainCard from "../../components/MainCard";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import { useSnackbarHelper } from "../../components/snackbar";
import Spinner from "../../components/SpinnerLoader/SpinnerLoader";
// import * as tus from "tus-js-client";
import { enableKeepAlive } from "../../../utils/keepAlive";

const statusColor: any = {
  Uploaded: "success",
  Uploading: "warning",
  Failed: "error",
  Pending: "info",
};

const getFileType = (filename: string) => {
  const ext = filename?.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "")) return "image";
  if (["mp4", "webm", "ogg", "mov"].includes(ext || "")) return "video";
  return "file";
};

const AddDetails = () => {
  const { id } = useParams(); //param id is the jotform form id

  const theme = useTheme();
  const xs = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchParams] = useSearchParams();
  const submissionId = searchParams.get("submissionId") || "";

  const storedData = localStorage.getItem("formSubmited");

  const navigate = useNavigate();
  const showSnackbar = useSnackbarHelper();

  const { uploads, startUploads, cancelUpload } = useUpload();
  const [rotated, setRotated] = useState(false);

  // Gallery View
  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showGalleryView, setShowGalleryView] = useState(false);

  // const [stillSelectingFiles, setStillSelectingFiles] = useState(false); //to prevent showing the files view when user is still selecting files to upload

  // const [search, setSearch] = useState("");
  const search = "";
  const [fileTypeFilter, setFileTypeFilter] = useState("all");

  const sortModel: GridSortModel = [{ field: "status", sort: "asc" }];
  const paginationModel: GridPaginationModel = {
    page: 0,
    pageSize: 100,
  };
  const {
    jotFormData,
    isLoadingJotFormData,
    filesBySubmissionId,
    isLoadingFilesBySubmissionId,
    refetchFilesBySubmissionId,
  } = useJotForm(
    id,
    submissionId,
    search,
    paginationModel,
    sortModel,
    "false" // to avoid running the api /submissionsData, it's getting all the submissions data when we on the AddDetails page
  );

  const filteredFilesBySubmissionId = useMemo(() => {
    if (!filesBySubmissionId) return [];

    // First apply filter
    let processedFiles =
      fileTypeFilter === "all"
        ? [...filesBySubmissionId]
        : filesBySubmissionId.filter(
            (file: any) => getFileType(file.filename) === fileTypeFilter
          );

    // Sort by status: Uploading > Pending > Failed > Uploaded
    const statusPriority: Record<string, number> = {
      Uploading: 1,
      Pending: 2,
      Failed: 3,
      Uploaded: 4,
    };

    processedFiles.sort((a: any, b: any) => {
      const pA = statusPriority[a.status] || 5;
      const pB = statusPriority[b.status] || 5;
      if (pA !== pB) return pA - pB;
      // Secondary sort: newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return processedFiles;
  }, [filesBySubmissionId, fileTypeFilter]);

  const [loadingForm, setLoadingForm] = useState(true);

  //disable upload if the jotform submission is older than 7 days (or 7 days from last manual email reminder)
  const isOlderThan7days = useMemo(() => {
    const baseDateString =
      jotFormData?.formData?.lastManualReminderSentAt ||
      jotFormData?.formData?.createdAt;
    if (!baseDateString) return false;
    const baseDate = new Date(baseDateString);
    const now = new Date();
    const diffTime = now.getTime() - baseDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays > 7;
  }, [
    jotFormData?.formData?.lastManualReminderSentAt,
    jotFormData?.formData?.createdAt,
  ]);

  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [downloading, setDownloading] = useState(false);

  const [formSubmited, setFormSubmited] = useState(false); //to show the uplaoded files
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, msg: "", severity: "info" });

  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const moreFilesInputRef = useRef<HTMLInputElement>(null);

  //Gallery view
  const [currentIndex, setCurrentIndex] = useState(0);
  const uploadedFiles = filteredFilesBySubmissionId?.filter(
    (f: any) => f.status.toLowerCase() === "uploaded"
  );

  // Real-time upload progress tracking for the current submission
  const currentUploads = uploads.filter((u) => u.submissionId === submissionId);
  const pendingOrUploadingCount = currentUploads.filter(
    (u) => u.status === "Pending" || u.status === "Uploading"
  ).length;
  // const allUploadsComplete =
  //   currentUploads.length > 0 && pendingOrUploadingCount === 0;

  const API_URL = import.meta.env.VITE_API_URL || "https://api.premiumpd.com";

  const handleDownload = (url: string, filename: string) => {
    if (!url) {
      showSnackbar("No file URL to download", "warning");
      return;
    }

    try {
      // Build the backend proxy URL
      const proxyUrl = new URL(`${API_URL}/upload/download`);
      proxyUrl.searchParams.append("url", url);
      if (filename) {
        proxyUrl.searchParams.append("filename", filename);
      }

      // Use a hidden anchor to trigger download natively
      const link = document.createElement("a");
      link.href = proxyUrl.toString();
      link.download = filename || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to construct download URL:", error);
      showSnackbar("Failed to download file", "error");
    }
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % uploadedFiles.length;
    setCurrentIndex(nextIndex);
    setPreviewFile(uploadedFiles[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex =
      (currentIndex - 1 + uploadedFiles.length) % uploadedFiles.length;
    setCurrentIndex(prevIndex);
    setPreviewFile(uploadedFiles[prevIndex]);
  };

  // console.log(jotFormData?.formKeys);
  const requiredUploads = jotFormData?.formKeys?.requiredUploads || []; //Which uploads are required (videos,photos,or files)

  // //avoide to show the files list before submit the submissions
  const isSubmited = useMemo(
    () => jotFormData?.formData?.isSubmited,
    [jotFormData]
  );

  useEffect(() => {
    // alert(JSON.stringify(jotFormData.formKeys, null, 2));
    if (!id || !submissionId) {
      navigate("/login");
    }

    if (!isLoadingJotFormData && requiredUploads === "nothing_to_upload") {
      navigate("/jotform/files/nothingtoupload");
    }

    if (
      !isLoadingJotFormData &&
      jotFormData?.formKeys?.requiredUploads?.length === 0
    ) {
      navigate("/jotform/files/thankyou", {
        state: {
          submissionId: submissionId,
          id: id,
        },
      });
    }

    if (storedData) {
      const data = JSON.parse(storedData);

      if (submissionId == data.submissionId && id == data.formId) {
        setFormSubmited(true);
        setTimeout(() => {
          setLoadingForm(false);
        }, 3000);
      }
    }
  }, [id, submissionId, navigate, isLoadingJotFormData, jotFormData]);

  useEffect(() => {
    if (
      // filesBySubmissionId?.length > 0 &&
      // !isLoadingFilesBySubmissionId &&
      // !stillSelectingFiles &&
      jotFormData?.formData?.isSubmited
    ) {
      setFormSubmited(true);
    }
    setTimeout(() => {
      setLoadingForm(false);
    }, 3000);
    // }, [filesBySubmissionId, isLoadingFilesBySubmissionId]);
  }, [filesBySubmissionId, jotFormData?.formData]);

  // Restrict page refresh if there are unsubmitted files
  useEffect(() => {
    const hasUnsubmittedFiles =
      !isSubmitting &&
      !isSubmited &&
      !isLoadingJotFormData &&
      (photoFiles.length > 0 ||
        videoFiles.length > 0 ||
        documentFiles.length > 0);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsubmittedFiles) {
        e.preventDefault();
        e.returnValue =
          "You have selected files that are not yet submitted. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasUnsubmittedFiles) {
        // Block F5, Ctrl+R, and Cmd+R keyboard shortcuts
        if (
          e.key === "F5" ||
          (e.ctrlKey && (e.key === "r" || e.key === "R")) ||
          (e.metaKey && (e.key === "r" || e.key === "R"))
        ) {
          e.preventDefault();
          showSnackbar(
            "Page reload is strictly disabled while you have unsubmitted files.",
            "error"
          );
        }
      }
    };

    const handlePageHide = (e: PageTransitionEvent) => {
      console.log(e);
      if (hasUnsubmittedFiles) {
        const allFiles = [...photoFiles, ...videoFiles, ...documentFiles];
        const filenames = allFiles.map((f) => f.name);

        if (filenames.length > 0) {
          const payload = JSON.stringify({
            submissionId: submissionId || "",
            filenames,
          });
          const blob = new Blob([payload], { type: "text/plain" });
          navigator.sendBeacon(`${API_URL}/upload/deleteBatch`, blob);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pagehide", handlePageHide);
    // window.addEventListener("unload", handlePageHide);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pagehide", handlePageHide);
      // window.addEventListener("unload", handlePageHide);
    };
  }, [
    photoFiles,
    videoFiles,
    documentFiles,
    isSubmitting,
    submissionId,
    API_URL,
    isSubmited,
    // isLoadingJotFormData,
  ]);

  // Auto-refetch when ALL uploads for this submission finish.
  // Uses a ref to detect the transition from "had active uploads" → "all done",
  // which works correctly whether there is 1 file or 100 files.
  const hadActiveUploads = useRef(false);
  useEffect(() => {
    if (pendingOrUploadingCount > 0) {
      // Mark that uploads were active at some point
      hadActiveUploads.current = true;

      // Poll the backend every 5 seconds to update real-time status in UI
      const interval = setInterval(() => {
        refetchFilesBySubmissionId();
      }, 5000);
      return () => clearInterval(interval);
    } else if (hadActiveUploads.current) {
      // Transitioned from active → all done: refetch to show latest statuses
      hadActiveUploads.current = false;
      refetchFilesBySubmissionId();
    }
  }, [pendingOrUploadingCount]);

  const handleRefetch = () => {
    setRotated((prev) => !prev);
    refetchFilesBySubmissionId(); // Your function to refetch leads
  };

  // Reusable function to deduplicate names, register batch, and start uploading immediately
  const processAndStartUploads = async (
    newFiles: File[],
    currentTypeFiles: File[]
  ) => {
    // setStillSelectingFiles(true);
    if (!newFiles.length) return [];

    // Deduplicate names against existing files (both in DB and currently uploading)
    const usedNames = new Set([
      ...(filesBySubmissionId?.map((f: any) => f.filename) || []),
      ...photoFiles.map((f) => f.name),
      ...videoFiles.map((f) => f.name),
      ...documentFiles.map((f) => f.name),
      ...currentTypeFiles.map((f) => f.name), // include the ones we are adding to
    ]);

    const deduplicatedFiles = newFiles.map((f: File) => {
      let uniqueName = f.name;
      let counter = 1;
      const dotIndex = uniqueName.lastIndexOf(".");
      const baseName =
        dotIndex !== -1 ? uniqueName.substring(0, dotIndex) : uniqueName;
      const ext = dotIndex !== -1 ? uniqueName.substring(dotIndex) : "";

      while (usedNames.has(uniqueName)) {
        uniqueName = `${baseName}(${counter})${ext}`;
        counter++;
      }
      usedNames.add(uniqueName);

      return uniqueName !== f.name
        ? new File([f], uniqueName, { type: f.type })
        : f;
    });

    const residentName = jotFormData?.userData?.residentName || "";
    const residentEmail = jotFormData?.userData?.email || "";

    try {
      showSnackbar("Registering files for upload...", "info");

      enableKeepAlive();
      // startUploads handles the registerBatch API call asynchronously in the background
      startUploads(
        deduplicatedFiles,
        submissionId,
        id || "",
        residentName,
        residentEmail
      );
    } catch (e) {
      console.error("[Submit] error starting uploads:", e);
      showSnackbar("Failed to register uploads", "error");
    }

    return deduplicatedFiles;
  };

  const removeDocument = (index: number) => {
    const file = documentFiles[index];
    if (file) cancelUpload(file.name, submissionId);
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    const file = videoFiles[index];
    if (file) cancelUpload(file.name, submissionId);
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removePhoto = (index: number) => {
    const file = photoFiles[index];
    if (file) cancelUpload(file.name, submissionId);
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const rawSelectedFiles = [...photoFiles, ...videoFiles, ...documentFiles];

    if (photoFiles?.length === 0 && requiredUploads?.includes("Photos")) {
      showSnackbar("Please upload at least one photo", "error");
      setIsSubmitting(false);
      return;
    }
    if (videoFiles?.length === 0 && requiredUploads?.includes("Videos")) {
      showSnackbar("Please upload at least one video", "error");
      setIsSubmitting(false);
      return;
    }
    if (documentFiles?.length === 0 && requiredUploads?.includes("Files")) {
      showSnackbar("Please upload at least one file", "error");
      setIsSubmitting(false);
      return;
    }
    if (!rawSelectedFiles.length || !submissionId || !id) {
      showSnackbar("Please select files to upload.", "error");
      setIsSubmitting(false);
      return;
    }

    // 🚀 To bypass popup blockers, we MUST open the tab synchronously during the click handler
    let redirectTab: Window | null = null;
    if (jotFormData?.formKeys?.forwarding_URL) {
      redirectTab = window.open("about:blank", "_blank");
      if (redirectTab) {
        redirectTab.document.write(
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Processing Upload</title>
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      height: 100vh;
      width: 100vw;
      background: #0B0F19;
      color: #ffffff;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }

    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      width: 90%;
      max-width: 400px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      text-align: center;
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .spinner {
      width: 56px;
      height: 56px;
      border: 4px solid rgba(59, 130, 246, 0.15);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 24px;
    }

    h2 {
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 600;
      background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      margin: 0;
      font-size: 15px;
      color: #94a3b8;
      line-height: 1.6;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Processing Uploads</h2>
    <p>Please wait, you will be redirected shortly...</p>
  </div>
</body>
</html>`
        );
      }
    }

    localStorage.setItem(
      "formSubmited",
      JSON.stringify({
        submissionId,
        formId: id,
        residentName: jotFormData?.userData?.residentName,
        residentEmail: jotFormData?.userData?.email,
      })
    );

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "https://api.premiumpd.com";
      await fetch(`${apiUrl}/jotformData/${submissionId}/submit`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Failed to mark submission as submitted:", error);
    }

    const delay = (ms: any) => new Promise((res) => setTimeout(res, ms));

    setTimeout(() => {
      setFormSubmited(true);
      setIsSubmitting(false);
      // setStillSelectingFiles(false);
    }, 300);

    // Redirect the existing tab
    if (jotFormData?.formKeys?.forwarding_URL && redirectTab) {
      await delay(2000);
      redirectTab.location.href = jotFormData.formKeys.forwarding_URL;
    } else if (jotFormData?.formKeys?.forwarding_URL) {
      // Fallback if the tab was blocked anyway
      window.open(jotFormData.formKeys.forwarding_URL, "_blank");
    }
  };

  if (loadingForm || isLoadingJotFormData || loadingForm) {
    return <TableSkeleton />;
  }

  return (
    <Box
      minHeight="calc(100vh - 80px)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      // p={isMobile ? 1 : 2}
      sx={{ backgroundColor: "#2e69ff14" }}
    >
      {(loadingForm || isLoadingJotFormData || loadingForm) && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.6)", // optional overlay
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Stack justifyContent={"space-between"} alignItems="center">
            <Box>
              <Spinner />
            </Box>

            <Typography
              sx={{
                color: "#2e7d32",
                fontWeight: "bold",
                mt: 1,
              }}
            >
              loading...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Step 2: Upload */}

      {!formSubmited ? (
        <Card
          elevation={4}
          sx={{
            width: "100%",
            height: "calc(100vh - 20px)",
            borderRadius: 1,
            backgroundColor: "white",
            overflow: "hidden", // important
            display: "flex",
            flexDirection: "column",

            maxWidth: {
              xs: "100%", // mobile
              sm: "100%", // tablet
              md: 800, // laptops
              lg: 900, // large screens
              xl: 1000, // extra large screens
            },
            mx: "auto", // centers the box horizontally
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              overflowY: "auto", // scrollbar here
              p: 4,
            }}
          >
            <Box
              sx={{
                borderBottom: "1px solid #2626264f", // choose your color
                pb: 1, // padding bottom
                // mb: 2, // margin bottom
                textAlign: "center",
              }}
            >
              <Typography
                mb={1}
                textAlign="center"
                fontWeight={600}
                sx={{
                  fontSize: {
                    xs: "1.1rem", // mobile
                    sm: "1.4rem", // tablet
                    md: "1.5rem", // laptop
                    lg: "1.5rem", // large screen
                    xl: "1.6rem", // extra large
                  },
                }}
              >
                {/* Step 2: File Uploader Tool */}
                {`${jotFormData?.formKeys?.instTitle} File Uploader` ||
                  `File Uploader`}
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 1,
                mb: 2,
                p: { xs: 1.5, sm: 2 },
                textAlign: "center",
                color: "#d32f2f",
                backgroundColor: "#fff5f5",
                borderRadius: 4,
                border: "2px solid #ffcdd2",
                boxShadow: "0 4px 12px rgba(211, 47, 47, 0.1)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                ⚠️ PLEASE NOTE:
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                  lineHeight: 1,
                }}
              >
                Due to File Size and Low Internet Bandwidth, Occasionally, this
                Upload May Fail or Freeze.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                  color: "#5c1919",
                }}
              >
                Therefore, it is important that you are uploading files that are
                stored in your device.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: "0.8rem", sm: "1rem" },
                  textDecoration: "underline",
                }}
              >
                Do not take any photos or videos in the upload widget.
              </Typography>
              <Divider sx={{ my: 1, borderColor: "#ffcdd2", borderWidth: 1 }} />
              <Typography
                variant="body2"
                sx={{
                  mb: 1,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  color: "#7f1d1d",
                  lineHeight: 1.6,
                }}
              >
                Should you encounter a problem that prevents you from completing
                the upload, please go to the email we just sent you and select
                the link and you will be able to upload your files later.
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", sm: "0.8rem" },
                  mt: 0.5,
                  backgroundColor: "#d32f2f",
                  color: "#fff",
                  display: "inline-block",
                  px: 0.5,
                  py: 0.4,
                  borderRadius: 1,
                }}
              >
                Email us:{" "}
                <a
                  href={`mailto:${
                    jotFormData?.formData?.replyEmail ||
                    "turnovers@premiumpd.com"
                  }`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {jotFormData?.formData?.replyEmail ||
                    "turnovers@premiumpd.com"}
                </a>
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                borderRadius: 3,
                overflow: "hidden",

                padding: 1,
              }}
            >
              <Box>
                <Typography
                  color="text.secondary"
                  mb={2}
                  sx={{
                    fontFamily: "helvetica, arial, sans-serif",
                    fontSize: {
                      xs: "0.9rem",
                      sm: "1rem",
                      md: "1rem",
                      lg: "1rem",
                      xl: "1rem",
                    },
                  }}
                >
                  {jotFormData?.formKeys?.generalInstructions || `-`}
                </Typography>

                {/* FILE SECTION */}
                {requiredUploads?.includes("Files") && (
                  <>
                    <Box
                      sx={{
                        borderBottom: "1px solid #2626264f", // choose your color
                        pb: 0.5, // padding bottom
                        mb: 1, // margin bottom
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        mb={0.5}
                        sx={{
                          fontSize: {
                            xs: "0.9rem",
                            sm: "1rem",
                            md: "1rem",
                            lg: "1.1rem",
                            xl: "1.1rem",
                          },
                        }}
                      >
                        {"File Upload"}
                      </Typography>
                    </Box>
                    <Typography
                      color="text.secondary"
                      mb={2}
                      sx={{
                        fontFamily: "helvetica, arial, sans-serif",
                        fontSize: {
                          xs: "0.9rem",
                          sm: "1rem",
                          md: "1rem",
                          lg: "1rem",
                          xl: "1rem",
                        },
                      }}
                    >
                      {jotFormData?.formKeys?.fileUploadInstruction ||
                        `Upload Files `}
                    </Typography>

                    {/* DOCUMENT SECTION */}
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      // gap={3}
                      mt={2}
                    >
                      <Typography
                        width={150}
                        sx={{ display: { xs: "none", sm: "block" } }}
                      >
                        File Uploader
                      </Typography>

                      <Box
                        sx={{
                          border: "2px dashed #1976d2",
                          borderRadius: 2,
                          width: 300,
                          minHeight: 100,
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backgroundColor: "#f0f7ff",
                        }}
                        onClick={() => documentInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();

                          const files = Array.from(e.dataTransfer.files).filter(
                            (f) =>
                              f.type === "application/pdf" ||
                              f.type === "application/msword" ||
                              f.type ===
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          );

                          const deduped = await processAndStartUploads(
                            files,
                            documentFiles
                          );
                          if (deduped.length > 0) {
                            setDocumentFiles((prev) => [...prev, ...deduped]);
                          }
                        }}
                      >
                        <input
                          ref={documentInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          hidden
                          onChange={async (e) => {
                            if (e.target.files) {
                              const all = Array.from(e.target.files);
                              const allowedMimes = [
                                "application/pdf",
                                "application/msword",
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                              ];
                              const valid = all.filter((f) =>
                                allowedMimes.includes(f.type)
                              );
                              const rejected = all.length - valid.length;
                              if (rejected > 0) {
                                showSnackbar(
                                  `${rejected} file(s) rejected — only PDF or Word documents are accepted in this section.`,
                                  "warning"
                                );
                              }
                              if (valid.length > 0) {
                                const deduped = await processAndStartUploads(
                                  valid,
                                  documentFiles
                                );
                                setDocumentFiles((prev) => [
                                  ...prev,
                                  ...deduped,
                                ]);
                              }
                            }
                          }}
                        />

                        <Typography fontSize={28}>📄</Typography>
                        <Typography fontWeight={600}>
                          Browse Documents
                        </Typography>
                        <Typography variant="caption">
                          Drag & drop PDF or Word files here
                        </Typography>
                      </Box>
                    </Box>
                    <Box p={2}>
                      {documentFiles.length > 0 && (
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          {documentFiles.map((file, index) => (
                            <Box
                              key={index}
                              sx={{
                                border: "1px solid #ddd",
                                borderRadius: 2,
                                p: 1.5,
                                background: "#f9f9f9",
                              }}
                            >
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Typography fontSize={14}>
                                  📄 {file.name}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => removeDocument(index)}
                                >
                                  ❌
                                </IconButton>
                              </Box>
                              {/* Removed explicit preUploadProgress UI because mapping starts post-submit via contexts */}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {/* PHOTO SECTION */}
                {requiredUploads?.includes("Photos") && (
                  <>
                    <Box
                      sx={{
                        borderBottom: "1px solid #2626264f", // choose your color
                        pb: 0.5, // padding bottom
                        mb: 1, // margin bottom
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        mb={0.5}
                        sx={{
                          fontSize: {
                            xs: "0.9rem",
                            sm: "1rem",
                            md: "1rem",
                            lg: "1.1rem",
                            xl: "1.1rem",
                          },
                        }}
                      >
                        {"Photo Upload"}
                      </Typography>
                    </Box>
                    <Typography
                      color="text.secondary"
                      mb={1}
                      sx={{
                        fontFamily: "helvetica, arial, sans-serif",
                        fontSize: {
                          xs: "0.9rem",
                          sm: "1rem",
                          md: "1rem",
                          lg: "1rem",
                          xl: "1rem",
                        },
                      }}
                    >
                      {jotFormData?.formKeys?.photoUploadInstruction || `-`}
                    </Typography>

                    <Box
                      display="flex"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      // gap={3}
                      mt={2}
                    >
                      <Typography
                        width={150}
                        sx={{ display: { xs: "none", sm: "block" } }}
                      >
                        Photo Uploader
                      </Typography>

                      {/* Unified Upload Button */}
                      {/* <Box display="flex" gap={2} flexWrap="wrap" flex={1}> */}
                      <Box
                        sx={{
                          border: "2px dashed #1976d2",
                          borderRadius: 2,
                          width: 300,
                          minHeight: 100,
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backgroundColor: "#f0f7ff",
                        }}
                        onClick={() => photoInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();
                          const files = Array.from(e.dataTransfer.files).filter(
                            (f) => f.type.startsWith("image/")
                          );
                          const deduped = await processAndStartUploads(
                            files,
                            photoFiles
                          );
                          if (deduped.length > 0) {
                            setPhotoFiles((prev) => [...prev, ...deduped]);
                          }
                        }}
                      >
                        <input
                          ref={photoInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          // accept=".jpg,.jpeg,.png,.webp"
                          hidden
                          onChange={async (e) => {
                            if (e.target.files) {
                              const all = Array.from(e.target.files);
                              const valid = all.filter((f) =>
                                f.type.startsWith("image/")
                              );
                              const rejected = all.length - valid.length;
                              if (rejected > 0) {
                                showSnackbar(
                                  `${rejected} file(s) rejected — only image files are accepted in this section.`,
                                  "warning"
                                );
                              }
                              if (valid.length > 0) {
                                const deduped = await processAndStartUploads(
                                  valid,
                                  photoFiles
                                );
                                setPhotoFiles((prev) => [...prev, ...deduped]);
                              }
                            }
                          }}
                        />

                        {/* <input type="file" accept="application/octet-stream" /> */}

                        <Typography fontSize={26}>📸</Typography>
                        <Typography
                          fontWeight={600}
                          fontSize={13}
                          color="primary"
                          textAlign="center"
                        >
                          {/* Upload / Capture Photo */}
                          Upload Photo
                        </Typography>
                        <Typography variant="caption" textAlign="center">
                          {/* Select or capture from device */}
                          Select from device
                        </Typography>
                      </Box>
                      {/* </Box> */}
                    </Box>
                    <Box p={2}>
                      {photoFiles.length > 0 && (
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            flexWrap: "wrap", // auto next row
                            gap: 1.5,
                          }}
                        >
                          {photoFiles.map((file, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: 124,
                              }}
                            >
                              {/* Thumbnail */}
                              <Box
                                sx={{
                                  position: "relative",
                                  width: 120,
                                  height: 80,
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  border: "1px solid #ddd",
                                  background: "#f5f5f5",
                                }}
                              >
                                {/* Image Preview */}
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                                {/* Remove Button */}
                                <IconButton
                                  size="small"
                                  onClick={() => removePhoto(index)}
                                  sx={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    p: "2px",
                                    background: "rgba(0,0,0,0.6)",
                                    color: "#fff",
                                    "&:hover": {
                                      background: "rgba(0,0,0,0.8)",
                                    },
                                  }}
                                >
                                  ❌
                                </IconButton>
                              </Box>
                              {/* Removed Pre-upload progress UI */}
                              {/* Save to Gallery */}
                              <Tooltip title="Save to device / gallery">
                                <a
                                  href={URL.createObjectURL(file)}
                                  download={file.name}
                                  style={{ textDecoration: "none" }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#1976d2",
                                      fontSize: 11,
                                      cursor: "pointer",
                                    }}
                                  >
                                    ⬇ Save
                                  </Typography>
                                </a>
                              </Tooltip>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </>
                )}
                {/* VIDEO SECTION */}
                {requiredUploads?.includes("Videos") && (
                  <>
                    <Box
                      sx={{
                        borderBottom: "1px solid #2626264f", // choose your color
                        pb: 0.5, // padding bottom
                        mb: 1, // margin bottom
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        mb={0.5}
                        sx={{
                          fontSize: {
                            xs: "0.9rem",
                            sm: "1rem",
                            md: "1rem",
                            lg: "1.1rem",
                            xl: "1.1rem",
                          },
                        }}
                      >
                        {"Video Upload"}
                      </Typography>
                    </Box>
                    <Typography
                      color="text.secondary"
                      mb={1}
                      sx={{
                        fontFamily: "helvetica, arial, sans-serif",
                        fontSize: {
                          xs: "0.9rem",
                          sm: "1rem",
                          md: "1rem",
                          lg: "1rem",
                          xl: "1rem",
                        },
                      }}
                    >
                      {jotFormData?.formKeys?.videoUploadInstruction || `-`}
                    </Typography>

                    <Box
                      display="flex"
                      alignItems="flex-start"
                      justifyContent="space-between"
                      gap={3}
                    >
                      <Typography
                        width={150}
                        sx={{ display: { xs: "none", sm: "block" } }}
                      >
                        Video Uploader
                      </Typography>

                      {/* Unified Upload Button */}
                      {/* <Box display="flex" gap={2} flexWrap="wrap"> */}
                      <Box
                        sx={{
                          border: "2px dashed #1976d2",
                          borderRadius: 2,
                          width: 300,
                          minHeight: 100,
                          p: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          backgroundColor: "#f0f7ff",
                        }}
                        onClick={() => videoInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={async (e) => {
                          e.preventDefault();
                          const files = Array.from(e.dataTransfer.files).filter(
                            (f) => f.type.startsWith("video/")
                          );
                          const deduped = await processAndStartUploads(
                            files,
                            videoFiles
                          );
                          if (deduped.length > 0) {
                            setVideoFiles((prev) => [...prev, ...deduped]);
                          }
                        }}
                      >
                        <input
                          ref={videoInputRef}
                          type="file"
                          multiple
                          accept="video/*"
                          // accept=".mp4,.webm,.mov,.pdf"
                          hidden
                          onChange={async (e) => {
                            if (e.target.files) {
                              const all = Array.from(e.target.files);
                              const valid = all.filter((f) =>
                                f.type.startsWith("video/")
                              );
                              const rejected = all.length - valid.length;
                              if (rejected > 0) {
                                showSnackbar(
                                  `${rejected} file(s) rejected — only video files are accepted in this section.`,
                                  "warning"
                                );
                              }
                              if (valid.length > 0) {
                                const deduped = await processAndStartUploads(
                                  valid,
                                  videoFiles
                                );
                                setVideoFiles((prev) => [...prev, ...deduped]);
                              }
                            }
                          }}
                        />
                        <Typography fontSize={26}>🎥</Typography>
                        <Typography
                          fontWeight={600}
                          fontSize={13}
                          color="primary"
                          textAlign="center"
                        >
                          {/* Upload / Capture Video */}
                          Upload Video
                        </Typography>
                        <Typography variant="caption" textAlign="center">
                          {/* Select or record from device */}
                          Select from device
                        </Typography>
                      </Box>
                      {/* </Box> */}
                    </Box>
                    {/* Video Preview Section */}
                    <Box p={2}>
                      {videoFiles.length > 0 && (
                        <Box
                          sx={{
                            mt: 2,
                            display: "flex",
                            flexWrap: "wrap", // 👈 automatically next row
                            gap: 1.5,
                          }}
                        >
                          {videoFiles.map((file, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: 124,
                              }}
                            >
                              {/* Thumbnail */}
                              <Box
                                sx={{
                                  position: "relative",
                                  width: 120,
                                  height: 80,
                                  borderRadius: 2,
                                  overflow: "hidden",
                                  border: "1px solid #ddd",
                                  background: "#000",
                                }}
                              >
                                <video
                                  src={URL.createObjectURL(file)}
                                  controls
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => removeVideo(index)}
                                  sx={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                    p: "2px",
                                    background: "rgba(0,0,0,0.6)",
                                    color: "#fff",
                                    "&:hover": {
                                      background: "rgba(0,0,0,0.8)",
                                    },
                                  }}
                                >
                                  ❌
                                </IconButton>
                              </Box>
                              {/* Removed Pre-upload progress UI */}
                              {/* Save to Gallery */}
                              <Tooltip title="Save to device / gallery">
                                <a
                                  href={URL.createObjectURL(file)}
                                  download={file.name}
                                  style={{ textDecoration: "none" }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#1976d2",
                                      fontSize: 11,
                                      cursor: "pointer",
                                    }}
                                  >
                                    ⬇ Save
                                  </Typography>
                                </a>
                              </Tooltip>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                <Typography
                  variant="h2"
                  color="text.secondary"
                  mb={4}
                  sx={{
                    fontFamily: "helvetica, arial, sans-serif",
                    fontSize: {
                      xs: "0.9rem",
                      sm: "1rem",
                      md: "1rem",
                      lg: "1rem",
                      xl: "1rem",
                    },
                  }}
                >
                  {jotFormData?.formKeys?.finalInstructions || `-`}
                </Typography>
              </Box>
            </Box>
          </CardContent>

          {/* Fixed Bottom Action Bar */}
          <Box
            sx={{
              p: 1,
              px: { xs: 1, sm: 2 },
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              zIndex: 10,
              boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={isSubmitting || loadingForm || isOlderThan7days}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: 140,
                py: 1,
                fontWeight: 600,
              }}
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </Button>
          </Box>
        </Card>
      ) : (
        <Card
          elevation={4}
          sx={{
            width: "100%",
            height: "calc(100vh - 20px)",
            borderRadius: 4,
            backgroundColor: "white",
            overflow: "hidden", // important
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent
            sx={{
              flex: 1,
              overflowY: "auto", // scrollbar here
              p: 2,
            }}
          >
            <Box>
              {/* Upload Progress Banner */}
              {/* {formSubmited && currentUploads.length > 0 && (
                <Box
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor:
                      pendingOrUploadingCount > 0 ? "#fff8e1" : "#e8f5e9",
                    border: `1px solid ${
                      pendingOrUploadingCount > 0 ? "#ffe082" : "#a5d6a7"
                    }`,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    mb={pendingOrUploadingCount > 0 ? 1 : 0}
                  >
                    {pendingOrUploadingCount > 0 ? (
                      <CircularProgress size={16} thickness={5} />
                    ) : (
                      <Typography fontSize={16}>✅</Typography>
                    )}
                    <Typography variant="body2" fontWeight={600}>
                      {pendingOrUploadingCount > 0
                        ? `Uploading… ${pendingOrUploadingCount} of ${currentUploads.length} file(s) still in progress. Keep this tab open.`
                        : `All ${currentUploads.length} file(s) uploaded successfully!`}
                    </Typography>
                  </Stack>
                  {pendingOrUploadingCount > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={Math.round(
                        ((currentUploads.length - pendingOrUploadingCount) /
                          currentUploads.length) *
                          100
                      )}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                </Box>
              )} */}
              <MainCard
                title={
                  <Typography
                    variant="h4"
                    // sx={{ fontSize: { xs: "14px", sm: "16px" } }}
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    {showGalleryView ? "Gallery" : "Files Upload History"}
                  </Typography>
                }
                actions={
                  <Stack direction={"row"} alignItems={"center"} spacing={1}>
                    <Select
                      size="small"
                      value={fileTypeFilter}
                      onChange={(e) => setFileTypeFilter(e.target.value)}
                      sx={{
                        height: 36,
                        minWidth: 120,
                        backgroundColor: "#f5f5f5",
                        borderRadius: 2,
                        "& .MuiSelect-select": { py: 0.5 },
                        mr: 1,
                      }}
                      displayEmpty
                    >
                      <MenuItem value="all">All Files</MenuItem>
                      <MenuItem value="image">Images</MenuItem>
                      <MenuItem value="video">Videos</MenuItem>
                      <MenuItem value="file">Documents</MenuItem>
                    </Select>

                    <Tooltip
                      title={showGalleryView ? "File History" : "Gallery View"}
                    >
                      <IconButton
                        disableRipple
                        onClick={() => setShowGalleryView(!showGalleryView)}
                      >
                        {showGalleryView ? (
                          <ReceiptLongIcon
                            sx={{
                              //   color: "#3b82f6",
                              color: "#1c3260",
                            }}
                          />
                        ) : (
                          <CollectionsIcon sx={{ color: "#1c3260" }} />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={"Refresh"}>
                      <IconButton disableRipple onClick={() => handleRefetch()}>
                        <SyncIcon
                          style={{
                            transform: rotated
                              ? "rotate(360deg)"
                              : "rotate(0deg)",
                            transition: "transform 1s ease",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    {/* <Box sx={{ display: { xs: "none", sm: "block" } }}>
                      <SearchField
                        onChange={handleSearchChange}
                        // onChange={handleGallerySearchChange}
                        size="small"
                        placeholder="Search with file name"
                        style={{ display: { xs: "none", sm: "block" } }}
                      />
                    </Box> */}
                    {filesBySubmissionId?.length > 0 && (
                      <Tooltip title="Download ZIP">
                        <IconButton
                          disabled={downloading}
                          onClick={() => {
                            setDownloading(true);
                            window.open(
                              `${API_URL}/upload/downloadZip?submissionId=${submissionId}`,
                              "_blank"
                            );
                            setTimeout(() => setDownloading(false), 4000);
                          }}
                        >
                          {downloading ? (
                            <CircularProgress
                              size={20}
                              sx={{ color: "primary.main" }}
                            />
                          ) : (
                            <DownloadIcon
                              sx={{
                                color: "#1c3260",
                                "&:hover": { color: "#2a4a85" },
                              }}
                            />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Upload More Files">
                      <IconButton
                        color="primary"
                        onClick={() => moreFilesInputRef.current?.click()}
                        disabled={isOlderThan7days}
                      >
                        <CloudUploadIcon
                          color={isOlderThan7days ? "disabled" : "success"}
                        />
                      </IconButton>
                    </Tooltip>
                    <input
                      ref={moreFilesInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,application/pdf"
                      hidden
                      onChange={async (e) => {
                        const all = Array.from(e.target.files || []);
                        if (!all.length) return;

                        const allowedTypes = [
                          "image/",
                          "video/",
                          "application/pdf",
                        ];
                        const valid = all.filter((f) =>
                          allowedTypes.some((t) => f.type.startsWith(t))
                        );
                        const rejected = all.length - valid.length;

                        if (rejected > 0) {
                          showSnackbar(
                            `${rejected} file(s) rejected — only images, videos, and PDFs are accepted.`,
                            "warning"
                          );
                        }

                        if (!valid.length) {
                          if (moreFilesInputRef.current)
                            moreFilesInputRef.current.value = "";
                          return;
                        }

                        const residentName =
                          jotFormData?.userData?.residentName || "";
                        const residentEmail =
                          jotFormData?.userData?.email || "";

                        try {
                          showSnackbar("Upload started...", "info");
                          enableKeepAlive();
                          await startUploads(
                            valid,
                            submissionId,
                            id || "",
                            residentName,
                            residentEmail
                          );
                          if (moreFilesInputRef.current)
                            moreFilesInputRef.current.value = "";
                          setTimeout(() => handleRefetch(), 1000);
                        } catch (error) {
                          console.error("Failed to start upload:", error);
                          showSnackbar("Failed to start upload", "error");
                        }
                      }}
                    />
                  </Stack>
                }
                content={
                  <>
                    <Box
                      sx={{
                        mb: 1,
                        mt: -1,
                        p: 1,
                        borderRadius: 3,
                        backgroundColor: "#e4e2ca",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 0.5, sm: 1 },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      {xs ? (
                        <>
                          <Box sx={{ width: "100%", textAlign: "center" }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                color: "#1c3260",
                              }}
                            >
                              {jotFormData?.formKeys?.formName || "-"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              // marginTop: "-8px",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: 14,
                                color: "#1c3260",
                              }}
                            >
                              Property:{" "}
                              {jotFormData?.formKeys?.propertyName || "-"}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: 14,
                                color: "#1c3260",
                              }}
                            >
                              Unit: {jotFormData?.formKeys?.unitName || "-"}
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        <>
                          {/* Form Name */}
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                textTransform: "uppercase",
                                fontWeight: 700,
                                color: "text.secondary",
                                letterSpacing: "0.5px",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Form Name
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#1c3260" }}
                            >
                              {jotFormData?.formKeys?.formName || "-"}
                            </Typography>
                          </Box>

                          {/* Property */}
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                textTransform: "uppercase",
                                fontWeight: 700,
                                color: "text.secondary",
                                letterSpacing: "0.5px",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Property
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#1c3260" }}
                            >
                              {jotFormData?.formKeys?.propertyName || "-"}
                            </Typography>
                          </Box>

                          {/* Unit Name */}
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                textTransform: "uppercase",
                                fontWeight: 700,
                                color: "text.secondary",
                                letterSpacing: "0.5px",
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Unit Name
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#1c3260" }}
                            >
                              {jotFormData?.formKeys?.unitName || "-"}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>

                    {!showGalleryView ? (
                      <Box sx={{ minWidth: 320 }}>
                        {!isLoadingFilesBySubmissionId &&
                          filteredFilesBySubmissionId?.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                              <Box textAlign="center" py={5}>
                                <Typography color="text.secondary">
                                  No files found
                                </Typography>
                              </Box>
                            </Grid>
                          )}

                        <Stack spacing={1}>
                          {filteredFilesBySubmissionId?.map(
                            (upload: any, index: number) => {
                              // const extension = upload?.filename
                              //   ?.split(".")
                              //   .pop()
                              //   ?.toUpperCase();

                              return (
                                <Box
                                  key={index}
                                  sx={{
                                    p: 1,
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 3,
                                    backgroundColor: "#f9f9f9",
                                  }}
                                >
                                  {/* 🔹 Top Row */}
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    {/* 🟦 Timestamp */}
                                    <Typography
                                      sx={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        color: "#333",
                                        minWidth: 80,
                                      }}
                                    >
                                      {new Date(
                                        upload.createdAt
                                      ).toLocaleString()}
                                    </Typography>

                                    {/* 🟡 STATUS */}
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      spacing={1}
                                    >
                                      <Chip
                                        label={upload?.status || "-"}
                                        color={
                                          statusColor[upload?.status] ||
                                          "default"
                                        }
                                        size="small"
                                      />
                                    </Stack>
                                  </Stack>

                                  {/* 🔹 File Name */}
                                  <Box
                                    display="flex"
                                    justifyContent="space-between"
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        mt: 0.5,
                                        color: "#555",
                                        wordBreak: "break-all",
                                      }}
                                    >
                                      {upload?.filename || "-"}
                                    </Typography>
                                  </Box>

                                  {/* 🔹 Progress Bar (for Pending / Uploading) */}
                                  {(upload?.status === "Pending" ||
                                    upload?.status === "Uploading") &&
                                    (() => {
                                      const match = currentUploads.find(
                                        (u) =>
                                          u.file?.name === upload.filename ||
                                          u.id?.endsWith(upload.filename)
                                      );
                                      const pct = match?.progress ?? 0;
                                      return (
                                        <Box mt={0.5}>
                                          <LinearProgress
                                            variant={
                                              pct > 0 ||
                                              upload?.status === "Pending"
                                                ? "determinate"
                                                : "indeterminate"
                                            }
                                            value={pct}
                                            sx={{ borderRadius: 1 }}
                                          />
                                          {pct > 0 && (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                            >
                                              {pct.toFixed(0)}%
                                            </Typography>
                                          )}
                                        </Box>
                                      );
                                    })()}

                                  {/* 🔹 Restart Button (Uploading only) */}
                                  {/* {upload?.status === "Uploading" &&
                                  (() => {
                                    const match = currentUploads.find(
                                      (u) =>
                                        u.file?.name === upload.filename ||
                                        u.id?.endsWith(upload.filename)
                                    );
                                    return match ? (
                                      <Box
                                        mt={0.5}
                                        display="flex"
                                        justifyContent="flex-end"
                                      >
                                        <Button
                                          size="small"
                                          startIcon={
                                            <ReplayIcon fontSize="inherit" />
                                          }
                                          onClick={() =>
                                            retryUpload(
                                              upload.filename,
                                              submissionId
                                            )
                                          }
                                          sx={{
                                            color: "#f59e0b",
                                            fontSize: "11px",
                                            p: "2px 6px",
                                            minWidth: 0,
                                            textTransform: "none",
                                          }}
                                        >
                                          Restart
                                        </Button>
                                      </Box>
                                    ) : null;
                                  })()} */}
                                </Box>
                              );
                            }
                          )}
                        </Stack>
                      </Box>
                    ) : (
                      <>
                        <Box
                          display="flex"
                          flexDirection="column"
                          minHeight="calc(100vh - 180px)" // adjust based on your layout
                        >
                          <Grid container spacing={2}>
                            {/* Loading Skeleton */}
                            {isLoadingFilesBySubmissionId &&
                              [...Array(6)].map((_, i) => (
                                <Grid
                                  size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
                                  key={i}
                                >
                                  <Skeleton variant="rounded" height={120} />
                                </Grid>
                              ))}

                            {/* No Files */}
                            {!isLoadingFilesBySubmissionId &&
                              filteredFilesBySubmissionId?.length === 0 && (
                                <Grid size={{ xs: 12 }}>
                                  <Box textAlign="center" py={5}>
                                    <Typography color="text.secondary">
                                      No files found
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}

                            {/* Files */}
                            {filteredFilesBySubmissionId?.map((file: any) => {
                              const type = getFileType(file.filename);
                              const isUploaded =
                                file.status.toLowerCase() === "uploaded";

                              return (
                                <Grid
                                  size={{ xs: 6, sm: 4, md: 3, lg: 2 }} // 👈 better mobile layout
                                  key={file._id}
                                >
                                  <Card
                                    sx={{
                                      cursor: isUploaded
                                        ? "pointer"
                                        : "default",
                                      borderRadius: 2,
                                      overflow: "hidden",
                                      transition: "0.2s",
                                      position: "relative",
                                      opacity: isUploaded ? 1 : 0.6,
                                      "&:hover": {
                                        boxShadow: isUploaded ? 6 : 1,
                                        transform: isUploaded
                                          ? "translateY(-2px)"
                                          : "none",
                                      },
                                    }}
                                    onClick={() => {
                                      if (isUploaded) {
                                        setPreviewFile(file);
                                        setOpenDialog(true);
                                      }
                                    }}
                                  >
                                    {/* IMAGE */}
                                    {type === "image" && (
                                      <Box
                                        sx={{
                                          width: "100%",
                                          aspectRatio: "4/3", // ✅ keeps layout stable
                                          overflow: "hidden",
                                          background: "#f3f4f6",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        {isUploaded ? (
                                          // <CardMedia
                                          //   component="img"
                                          //   image={file.s3Url}
                                          //   alt={file.filename}
                                          <img
                                            src={
                                              file?.thumbnailUrl || file?.s3Url
                                            }
                                            alt={file?.filename}
                                            loading="lazy"
                                            style={{
                                              width: "100%",
                                              height: "100%",
                                              objectFit: "cover",
                                            }}
                                          />
                                        ) : (
                                          <InsertDriveFileIcon
                                            fontSize="large"
                                            sx={{ color: "#9e9e9e" }}
                                          />
                                        )}
                                      </Box>
                                    )}

                                    {/* VIDEO */}
                                    {type === "video" && (
                                      <Box
                                        sx={{
                                          aspectRatio: "4/3",
                                          background: "#111", // Darker background for videos
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        {isUploaded ? (
                                          <Box
                                            display="flex"
                                            flexDirection="column"
                                            alignItems="center"
                                            justifyContent="center"
                                          >
                                            <PlayCircleOutlineIcon
                                              sx={{
                                                fontSize: 50,
                                                color: "#fff",
                                                opacity: 0.8,
                                              }}
                                            />
                                          </Box>
                                        ) : (
                                          <Box
                                            display="flex"
                                            width="100%"
                                            height="100%"
                                            alignItems="center"
                                            justifyContent="center"
                                          >
                                            <InsertDriveFileIcon
                                              fontSize="large"
                                              sx={{ color: "#555" }}
                                            />
                                          </Box>
                                        )}
                                      </Box>
                                    )}

                                    {/* OTHER FILE */}
                                    {type === "file" && (
                                      <Box
                                        sx={{
                                          aspectRatio: "4/3",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          background: "#f9fafb",
                                        }}
                                      >
                                        <InsertDriveFileIcon fontSize="large" />
                                      </Box>
                                    )}

                                    {/* CONTENT */}
                                    <CardContent
                                      sx={{
                                        p: 1,
                                        display: { xs: "none", sm: "block" },
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        noWrap
                                        title={file.filename}
                                      >
                                        {file.filename}
                                      </Typography>

                                      <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                      >
                                        {(file.size / 1024 / 1024).toFixed(1)}{" "}
                                        MB
                                      </Typography>

                                      {!isUploaded && (
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          sx={{
                                            color:
                                              file.status.toLowerCase() ===
                                              "failed"
                                                ? "#d32f2f"
                                                : "#ed6c02",
                                            fontWeight: 600,
                                            mt: 0.5,
                                          }}
                                        >
                                          {file.status}
                                        </Typography>
                                      )}
                                    </CardContent>
                                  </Card>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </Box>
                        <Dialog
                          open={openDialog}
                          onClose={() => setOpenDialog(false)}
                          PaperProps={{
                            sx: {
                              width: "80vw", // fixed width
                              height: "80vh", // fixed height
                              maxWidth: "none", // prevent shrinking
                              borderRadius: 2,
                              flexDirection: "column", // ✅ important
                              overflow: "hidden", // ✅ prevents scroll
                              // overflow: "hidden",
                            },
                          }}
                        >
                          {/* HEADER */}
                          <DialogTitle
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              pr: 1,
                              borderBottom: "1px solid rgba(255,255,255,0.1)",
                              bgcolor: "#1a1a1a",
                              color: "#fff",
                            }}
                          >
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                noWrap
                                maxWidth="60vw"
                                fontWeight={600}
                              >
                                {previewFile?.filename}
                              </Typography>
                              {previewFile?.size && (
                                <Typography
                                  variant="caption"
                                  color="rgba(255,255,255,0.6)"
                                >
                                  {(previewFile.size / 1024 / 1024).toFixed(1)}{" "}
                                  MB
                                </Typography>
                              )}
                            </Box>

                            <Box display="flex" alignItems="center" gap={0.5}>
                              {/* Download */}
                              <Tooltip title="Download">
                                <IconButton
                                  onClick={() =>
                                    handleDownload(
                                      previewFile?.s3Url,
                                      previewFile?.filename
                                    )
                                  }
                                  sx={{ color: "#fff" }}
                                >
                                  <DownloadIcon />
                                </IconButton>
                              </Tooltip>

                              {/* Open in new tab */}
                              {/* <Tooltip title="Open in new tab">
                              <IconButton
                                component="a"
                                href={previewFile?.s3Url}
                                target="_blank"
                                sx={{ color: "#fff" }}
                              >
                                <OpenInNewIcon />
                              </IconButton>
                            </Tooltip> */}

                              <Tooltip title="Close">
                                <IconButton
                                  onClick={() => setOpenDialog(false)}
                                  sx={{ color: "#fff" }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </DialogTitle>

                          {/* CONTENT */}
                          {previewFile && (
                            <Box
                              sx={{
                                flex: 1, // ✅ takes remaining space after header
                                position: "relative",
                                bgcolor: "#111",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                // height: "100%",
                                // p: 2,
                                overflow: "hidden", // ✅ no scroll
                              }}
                            >
                              {/* LEFT BUTTON */}
                              {uploadedFiles.length > 1 && (
                                <Tooltip title="Previous">
                                  <IconButton
                                    onClick={handlePrev}
                                    sx={{
                                      position: "absolute",
                                      left: 10,
                                      color: "#fff",
                                      bgcolor: "rgba(0,0,0,0.4)",
                                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                                      zIndex: 10,
                                    }}
                                  >
                                    <ArrowBackIosNewIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* RIGHT BUTTON */}
                              {uploadedFiles.length > 1 && (
                                <Tooltip title="Next">
                                  <IconButton
                                    onClick={handleNext}
                                    sx={{
                                      position: "absolute",
                                      right: 10,
                                      color: "#fff",
                                      bgcolor: "rgba(0,0,0,0.4)",
                                      "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                                      zIndex: 10,
                                    }}
                                  >
                                    <ArrowForwardIosIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* FILE RENDER */}
                              {(() => {
                                const type = getFileType(previewFile?.filename);

                                const url = previewFile?.s3Url;

                                // IMAGE
                                if (type === "image") {
                                  return (
                                    <img
                                      src={url}
                                      alt={previewFile?.filename}
                                      style={{
                                        // maxWidth: "100%",
                                        // maxHeight: "90vh",
                                        // objectFit: "contain",
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain", // ✅ perfectly fits
                                      }}
                                    />
                                  );
                                }

                                // VIDEO
                                if (type === "video") {
                                  return (
                                    <video
                                      src={url}
                                      controls
                                      style={{
                                        // maxWidth: "100%",
                                        // maxHeight: "90vh",
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                      }}
                                    />
                                  );
                                }

                                // PDF (🔥 NEW)
                                if (
                                  previewFile.filename
                                    .toLowerCase()
                                    .endsWith(".pdf")
                                ) {
                                  return (
                                    <iframe
                                      src={url}
                                      title="pdf"
                                      style={{
                                        // width: "100%",
                                        // height: "90vh",
                                        // border: "none",
                                        width: "100%",
                                        height: "100%",
                                        border: "none",
                                      }}
                                    />
                                  );
                                }

                                // OTHER FILES (DOC, XLS, etc.)
                                return (
                                  <Box textAlign="center" color="#fff">
                                    <InsertDriveFileIcon
                                      sx={{ fontSize: 80, mb: 2 }}
                                    />

                                    <Typography mb={2}>
                                      {previewFile.filename}
                                    </Typography>

                                    <Button
                                      variant="contained"
                                      href={url}
                                      target="_blank"
                                    >
                                      Open File
                                    </Button>
                                  </Box>
                                );
                              })()}
                            </Box>
                          )}
                        </Dialog>
                      </>
                    )}
                  </>
                }
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* )} */}

      <Dialog
        open={showRedirectModal}
        onClose={() => {
          setShowRedirectModal(false);
          if (jotFormData?.formKeys?.forwarding_URL) {
            window.open(jotFormData.formKeys.forwarding_URL, "_blank");
          }
        }} // prevent closing by clicking outside
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "18px",
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            color: "warning.main",
          }}
        >
          Important
        </DialogTitle>
        <Box sx={{ textAlign: "center", p: 2, pt: 1 }}>
          <Typography mb={3} color="text.secondary">
            You’ll be redirected to another form.
            <br /> You can track the upload status by returning to this tab.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            // size="large"
            onClick={() => {
              setShowRedirectModal(false);
              if (jotFormData?.formKeys?.forwarding_URL) {
                window.open(jotFormData.formKeys.forwarding_URL, "_blank");
              }
            }}
          >
            Continue
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={8000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddDetails;
