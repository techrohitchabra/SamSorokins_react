import Grid from "@mui/material/Grid";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CollectionsIcon from "@mui/icons-material/Collections";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SyncIcon from "@mui/icons-material/Sync";

import { useModal } from "mui-modal-provider";
import { useUpload } from "../../../contexts/UploadContext";
import useEditFiles from "../../../hooks/useEditFiles";
import MainCard from "../../components/MainCard";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import { useSnackbarHelper } from "../../components/snackbar";
import DeleteFileModal from "./DeleteFileModal";

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

const EditFilesBySubmissionId = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showModal } = useModal();
  const showSnackbar = useSnackbarHelper();

  // const submissionId = location.state?.submissionId;
  // const page = location.state?.page;

  const queryParams = new URLSearchParams(location.search);
  const submissionId =
    location.state?.submissionId || queryParams.get("submissionId");
  const page = location.state?.page || queryParams.get("page");

  // Delete confirmation modal
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);

  const {
    filesWithFormData,
    isLoadingfilesWithFormData,
    refetchfilesWithFormData,
    deleteFile,
    isDeletingFile,
  } = useEditFiles(submissionId, fileToDelete ?? undefined);
  const { startUploads } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery View

  const [previewFile, setPreviewFile] = useState<any | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [showGalleryView, setShowGalleryView] = useState(false);

  const [downloading, setDownloading] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState("all");

  //   const [search, setSearch] = useState("");
  const search = "";
  const [rotated, setRotated] = useState(false);

  useEffect(() => {
    if (!submissionId) navigate("/login");
  }, [submissionId]);

  const formData = filesWithFormData?.formData || {};
  const files = filesWithFormData?.files || [];

  const filteredFiles = useMemo(() => {
    //sort based on status
    const getPriority = (status: string) => {
      const map: any = {
        failed: 1,
        pending: 2,
        uploading: 3,
        uploaded: 4,
      };
      return map[status?.toLowerCase()] || 99;
    };

    return files
      .filter((file: any) =>
        file.filename.toLowerCase().includes(search.toLowerCase())
      )
      .filter((file: any) => {
        if (fileTypeFilter === "all") return true;
        return getFileType(file.filename) === fileTypeFilter;
      })
      .sort((a: any, b: any) => getPriority(a.status) - getPriority(b.status));
  }, [files, search, fileTypeFilter]);

  const handleRefetch = () => {
    setRotated((prev) => !prev);
    refetchfilesWithFormData(); // Your function to refetch leads
  };

  //Gallery view
  const [currentIndex, setCurrentIndex] = useState(0);
  const uploadedFiles = filteredFiles?.filter(
    (f: any) => f.status.toLowerCase() === "uploaded"
  );
  const API_URL = import.meta.env.VITE_API_URL || "https://api.premiumpd.com";

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

  const handleDeleteFile = useCallback(
    (fileId: any) => {
      setFileToDelete(fileId);
      const modal: any = showModal(DeleteFileModal, {
        onClose: () => {
          modal.hide();
          setFileToDelete(null);
        },
        // fileId,
        // submissionId,
        // Pass the parent's mutation so both the icon AND modal share the same state
        onConfirm: async () => {
          try {
            await deleteFile(fileId);
            showSnackbar("File deleted successfully", "success");
            modal.hide();
          } catch (error) {
            console.error("Failed to delete file:", error);
            showSnackbar("Failed to delete file", "error");
          } finally {
            setFileToDelete(null);
          }
        },
        // isDeletingFile,
      });
    },
    [showModal, deleteFile, isDeletingFile, submissionId, showSnackbar]
  );

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

  if (isLoadingfilesWithFormData) {
    return <TableSkeleton />;
  }
  return (
    <>
      {page === "ClientInfo" && (
        <MainCard
          title={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h4">Submission Details</Typography>
              <Tooltip title={"File Upload History"}>
                <IconButton
                  disableRipple
                  onClick={() =>
                    navigate(
                      `/files/history/clientinfo?submissionId=${submissionId}&page=Files`,
                      {
                        state: {
                          submissionId: submissionId,
                          page: "Files",
                        },
                      }
                    )
                  }
                >
                  <ReceiptLongIcon sx={{ color: "success.main" }} />
                </IconButton>
              </Tooltip>
            </Box>
          }
          //   actions={filesWithFormData?.submissionId}
          content={
            <Grid container spacing={2}>
              {Object.entries(formData).map(([key, value]: any) => (
                <Grid size={{ xs: 12, md: 6 }} key={key}>
                  <Typography variant="body1">{key}</Typography>

                  <Typography variant="caption" color="text.secondary">
                    {value || "-"}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          }
        />
      )}
      {page === "Files" && (
        <Card
          elevation={4}
          sx={{
            width: "100%",
            height: "calc(100vh - 100px)",
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
              <MainCard
                title={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="h4"
                      sx={{ display: { xs: "none", sm: "block" } }}
                    >
                      {showGalleryView ? "Gallery" : "Files Upload History"}
                    </Typography>
                  </Box>
                }
                actions={
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    spacing={1}
                    justifyContent="space-between"
                  >
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

                    <Tooltip title={"Submission Details"}>
                      <IconButton
                        disableRipple
                        // sx={{ display: { xs: "none", sm: "block" } }}
                        onClick={() =>
                          navigate(
                            `/files/history/files?submissionId=${submissionId}&page=ClientInfo`,
                            {
                              state: {
                                submissionId: submissionId,
                                page: "ClientInfo",
                              },
                            }
                          )
                        }
                      >
                        <DescriptionIcon
                          sx={{
                            color: "#1c3260",
                            "&:hover": { color: "#2a4a85" },
                          }}
                        />
                      </IconButton>
                    </Tooltip>

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
                          sx={{
                            color: "#1c3260",
                            "&:hover": { color: "#2a4a85" },
                            transform: rotated
                              ? "rotate(360deg)"
                              : "rotate(0deg)",
                            transition: "transform 1s ease, color 0.2s",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    {filteredFiles?.length > 0 && (
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
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <CloudUploadIcon color="success" />
                      </IconButton>
                    </Tooltip>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,application/pdf"
                      hidden
                      onChange={async (e) => {
                        const all = Array.from(e.target.files || []);
                        if (!all.length) return;

                        // Filter by allowed types
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
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                          return;
                        }

                        const residentName = formData?.Name || "";
                        const residentEmail = formData?.Email || "";
                        const formId = filesWithFormData?.formId || null;

                        try {
                          showSnackbar("Upload started...", "info");
                          await startUploads(
                            valid,
                            submissionId,
                            formId,
                            residentName,
                            residentEmail
                          );
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                          setTimeout(() => {
                            handleRefetch();
                          }, 1000);
                        } catch (error) {
                          console.error("Failed to start upload:", error);
                          showSnackbar("Failed to start upload", "error");
                        }
                      }}
                    />
                  </Stack>
                }
                content={
                  !showGalleryView ? (
                    <>
                      <Box sx={{ minWidth: 320 }}>
                        {!isLoadingfilesWithFormData &&
                          filteredFiles?.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                              <Box textAlign="center" py={5}>
                                <Typography color="text.secondary">
                                  No files found
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        <Stack spacing={1}>
                          {filteredFiles?.map((upload: any, index: number) => {
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
                                  {/* createdAt */}
                                  <Typography
                                    sx={{
                                      fontSize: "12px",
                                      fontWeight: 700,
                                      //   letterSpacing: 1,
                                      color: "#333",
                                      minWidth: 80,
                                    }}
                                  >
                                    {new Date(
                                      upload.createdAt
                                    ).toLocaleString()}
                                  </Typography>

                                  {/* 🟡 STATUS + DELETE */}
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                  >
                                    <Chip
                                      label={upload?.status || "-"}
                                      color={
                                        statusColor[upload?.status] || "default"
                                      }
                                      size="small"
                                    />

                                    <Tooltip title="Delete File">
                                      <IconButton
                                        size="small"
                                        color="info"
                                        disabled={
                                          isDeletingFile &&
                                          upload?._id === fileToDelete
                                        }
                                        onClick={() =>
                                          handleDeleteFile(upload?._id)
                                        }
                                      >
                                        {isDeletingFile &&
                                        upload?._id === fileToDelete ? (
                                          <CircularProgress
                                            size={20}
                                            sx={{ color: "#3b82f6" }}
                                          />
                                        ) : (
                                          <DeleteIcon
                                            fontSize="small"
                                            sx={{ color: "#a61818" }}
                                          />
                                        )}
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                </Stack>

                                {/* 🔹 File Name (Bottom Row) */}
                                <Box
                                  display="flex"
                                  gap={1}
                                  // justifyContent="space-between"
                                >
                                  <Typography
                                    variant="caption"
                                    mt={1}
                                    // sx={{
                                    //   mt: 1,
                                    //   color: "#555",
                                    //   wordBreak: "break-all",
                                    // }}
                                  >
                                    {upload?.filename || "-"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    display="block"
                                    color="text.secondary"
                                    mt={1}
                                  >
                                    {(upload.size / 1024 / 1024).toFixed(1)} MB
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          })}
                        </Stack>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box
                        display="flex"
                        flexDirection="column"
                        minHeight="calc(100vh - 180px)" // adjust based on your layout
                      >
                        <Grid container spacing={2}>
                          {/* Loading Skeleton */}
                          {isLoadingfilesWithFormData &&
                            [...Array(6)].map((_, i) => (
                              <Grid
                                size={{ xs: 6, sm: 4, md: 3, lg: 2 }}
                                key={i}
                              >
                                <Skeleton variant="rounded" height={120} />
                              </Grid>
                            ))}

                          {/* No Files */}
                          {!isLoadingfilesWithFormData &&
                            filteredFiles?.length === 0 && (
                              <Grid size={{ xs: 12 }}>
                                <Box textAlign="center" py={5}>
                                  <Typography color="text.secondary">
                                    No files found
                                  </Typography>
                                </Box>
                              </Grid>
                            )}

                          {/* Files */}
                          {filteredFiles
                            ?.filter(
                              (file: any) =>
                                file.status.toLowerCase() === "uploaded"
                            )
                            .map((file: any) => {
                              const type = getFileType(file.filename);

                              return (
                                <Grid
                                  size={{ xs: 6, sm: 4, md: 3, lg: 2 }} // 👈 better mobile layout
                                  key={file._id}
                                >
                                  <Card
                                    sx={{
                                      cursor: "pointer",
                                      borderRadius: 2,
                                      overflow: "hidden",
                                      position: "relative",
                                      transition: "0.2s",
                                      "&:hover": {
                                        boxShadow: 6,
                                        transform: "translateY(-2px)",
                                      },
                                      "&:hover .card-delete-btn": {
                                        opacity: 1,
                                      },
                                    }}
                                    onClick={() => {
                                      setPreviewFile(file);
                                      setOpenDialog(true);
                                    }}
                                  >
                                    {/* IMAGE — Hybrid: Fast Static CDN download + Local Compression */}
                                    {type === "image" && (
                                      <Box
                                        sx={{
                                          width: "100%",
                                          aspectRatio: "4/3", // ✅ keeps layout stable
                                          overflow: "hidden",
                                          background: "#f3f4f6",
                                        }}
                                      >
                                        <img
                                          src={
                                            file?.thumbnailUrl || file?.s3Url
                                          }
                                          alt={file?.filename}
                                          loading="lazy"
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover", // or "contain" if you want full image
                                          }}
                                        />
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
                                        <PlayCircleOutlineIcon
                                          sx={{
                                            fontSize: 50,
                                            color: "#fff",
                                            opacity: 0.8,
                                          }}
                                        />
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

                                    {/* HOVER DELETE BUTTON */}
                                    <Tooltip title="Delete File">
                                      <IconButton
                                        className="card-delete-btn"
                                        size="small"
                                        disabled={
                                          isDeletingFile &&
                                          file._id === fileToDelete
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteFile(file._id);
                                        }}
                                        sx={{
                                          position: "absolute",
                                          top: 8,
                                          right: 8,
                                          opacity: 0,
                                          transition: "opacity 0.2s",
                                          bgcolor: "rgba(255,0,0,0.7)",
                                          color: "#fff",
                                          p: "6px",
                                          "&:hover": {
                                            bgcolor: "rgba(255,0,0,0.9)",
                                          },
                                        }}
                                      >
                                        {/* <DeleteIcon sx={{ fontSize: 16 }} /> */}
                                        {isDeletingFile &&
                                        file._id === fileToDelete ? (
                                          <CircularProgress
                                            size={16}
                                            color="inherit"
                                          />
                                        ) : (
                                          <DeleteIcon fontSize="small" />
                                        )}
                                      </IconButton>
                                    </Tooltip>

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
                        maxWidth={false}
                        PaperProps={{
                          sx: {
                            width: "80vw",
                            height: "80vh",
                            maxWidth: "none",
                            borderRadius: 2,
                            display: "flex", // ✅ important
                            flexDirection: "column", // ✅ important
                            overflow: "hidden", // ✅ prevents scrollbar
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
                            <Typography noWrap maxWidth="60vw" fontWeight={600}>
                              {previewFile?.filename}
                            </Typography>
                            {previewFile?.size && (
                              <Typography
                                variant="caption"
                                color="rgba(255,255,255,0.6)"
                              >
                                {(previewFile.size / 1024 / 1024).toFixed(1)} MB
                              </Typography>
                            )}
                          </Box>

                          <Box display="flex" alignItems="center" gap={0.5}>
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
                                <DownloadIcon
                                // sx={{
                                //   color: "#1c3260",
                                //   "&:hover": { color: "#2a4a85" },
                                // }}
                                />
                              </IconButton>
                            </Tooltip>

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
                              flex: 1, // ✅ takes remaining height
                              position: "relative",
                              bgcolor: "#111",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              overflow: "hidden", // ✅ prevents scroll
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
                              // Full-res CDN URL for lightbox (no resize params)

                              const url = previewFile?.s3Url;

                              // ✅ IMAGE — full-resolution via CloudFront
                              if (type === "image") {
                                return (
                                  <img
                                    src={url}
                                    alt={previewFile?.filename}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain", // 🔥 key fix
                                    }}
                                  />
                                );
                              }

                              // ✅ VIDEO — full-resolution via CloudFront
                              if (type === "video") {
                                return (
                                  <video
                                    src={url}
                                    controls
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                );
                              }

                              // ✅ PDF
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
                                      width: "100%",
                                      height: "100%",
                                      border: "none",
                                    }}
                                  />
                                );
                              }

                              // OTHER FILES
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
                  )
                }
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default EditFilesBySubmissionId;
