import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import Tus from "@uppy/tus";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://api.premiumpd.com";

const AddDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formCompleted, setFormCompleted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info"
  >("info");

  const dashboardRef = useRef<HTMLDivElement>(null);
  const uppyRef = useRef<Uppy | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Redirect to login if ID is missing
  useEffect(() => {
    if (!id) {
      navigate("/login");
    }
  }, [id, navigate]);

  // Listen for form completion
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === "submission-completed") {
        console.log({ event });
        setLoading(true);

        setTimeout(() => {
          setSubmissionId(event.data.formID);
          setFormCompleted(true);
          setLoading(false);
        }, 1000);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Initialize Uppy when form is completed
  useEffect(() => {
    if (
      formCompleted &&
      submissionId &&
      !uppyRef.current &&
      dashboardRef.current
    ) {
      const uppyInstance: any = new Uppy({
        id: "video-uploader",
        autoProceed: false,
        allowMultipleUploadBatches: true,
        restrictions: {
          maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
          allowedFileTypes: ["video/*", "image/*"],
          maxNumberOfFiles: 10,
        },
        meta: {
          submissionId: submissionId,
          userId: id,
        },
      })
        .use(Tus, {
          endpoint: `${API_URL}/upload/tus`,
          retryDelays: [0, 1000, 3000, 5000, 10000],
          chunkSize: 10 * 1024 * 1024, // 10MB chunks
          removeFingerprintOnSuccess: true,
          metadata: {
            submissionId: submissionId,
            userId: id || "",
            filename: "",
            filetype: "",
          },
        })
        .use(Dashboard, {
          target: dashboardRef.current,
          inline: true,
          height: isMobile ? "48vh" : "55vh", // upload files section
          width: "100%",
          proudlyDisplayPoweredByUppy: false,
          showProgressDetails: true,
          showRemoveButtonAfterComplete: true,
          theme: "light",
          note: "Images & Videos allowed — up to 5GB per file",
        });

      // Event listeners
      uppyInstance.on("file-added", (file: any) => {
        // Add metadata to each file
        uppyInstance.setFileMeta(file.id, {
          submissionId: submissionId,
          userId: id,
          filename: file.name,
          filetype: file.type,
        });
      });

      uppyInstance.on("upload", () => {
        setUploadStatus("Uploading videos/images in background...");
        setSnackbarMessage(
          "Your videos/images are uploading in the background. You can close this page."
        );
        setSnackbarSeverity("info");
        setShowSnackbar(true);
      });

      uppyInstance.on("progress", (progress: any) => {
        setUploadStatus(`Uploading: ${progress}%`);
      });

      uppyInstance.on("upload-success", (file: any, response: any) => {
        console.log("File uploaded successfully:", file?.name, response);
      });

      uppyInstance.on("complete", (result: any) => {
        console.log("Upload complete:", result);

        if (result.successful.length > 0) {
          setSnackbarMessage(
            `All ${result.successful.length} video(s) uploaded successfully! ✅`
          );
          setSnackbarSeverity("success");
          setShowSnackbar(true);
          setUploadStatus("All videos uploaded successfully!");
        }

        if (result.failed.length > 0) {
          setSnackbarMessage(
            `${result.failed.length} video(s) failed to upload. Please try again.`
          );
          setSnackbarSeverity("error");
          setShowSnackbar(true);
        }
      });

      uppyInstance.on("upload-error", (file: any, error: any) => {
        console.error("Upload error:", file?.name, error);
        setSnackbarMessage(`Upload error: ${error.message}`);
        setSnackbarSeverity("error");
        setShowSnackbar(true);
      });

      uppyInstance.on("retry-all", () => {
        setSnackbarMessage("Retrying failed uploads...");
        setSnackbarSeverity("info");
        setShowSnackbar(true);
      });

      // Network status detection
      const handleOnline = () => {
        setSnackbarMessage("Connection restored! Resuming uploads...");
        setSnackbarSeverity("success");
        setShowSnackbar(true);
        uppyInstance.retryAll();
      };

      const handleOffline = () => {
        setSnackbarMessage("Connection lost. Upload will resume when online.");
        setSnackbarSeverity("error");
        setShowSnackbar(true);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      uppyRef.current = uppyInstance;

      // Cleanup
      return () => {
        uppyInstance.close();
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, [formCompleted, submissionId, id]);

  return (
    <Box
      height="calc(100vh - 80px)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      p={isMobile ? 1 : 4}
      sx={{
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* Title */}
      {/* <Typography
        variant={isMobile ? "h5" : "h4"}
        fontWeight={700}
        mb={2}
        textAlign="center"
        letterSpacing={0.3}
      >
        Property Inspection
      </Typography> */}

      {/* Stepper */}
      {/* <Box width="100%" maxWidth="900px" mb={4}>
        <Stepper
          activeStep={formCompleted ? 1 : 0}
          alternativeLabel
          sx={{
            "& .MuiStepLabel-label": { fontSize: isMobile ? "0.8rem" : "1rem" },
          }}
        >
          <Step>
            <StepLabel>Fill Form</StepLabel>
          </Step>
          <Step>
            <StepLabel>Upload Videos</StepLabel>
          </Step>
        </Stepper>
      </Box> */}

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Step 1 — Responsive Form */}
      {!formCompleted && !loading && (
        <Card
          elevation={4}
          sx={{
            width: "100%",
            // maxWidth: "1200px",
            height: isMobile ? "78vh" : "95vh",
            p: 1,
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
          }}
        >
          <CardContent
            sx={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h6" mb={1} textAlign="center" fontWeight={600}>
              Step 1: Complete the Inspection Form
            </Typography>

            <Box
              sx={{
                flex: 1,
                width: "100%",
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #e0e0e0",
                backgroundColor: "#fff",
              }}
            >
              <iframe
                title="inspection-form"
                src="https://form.jotform.com/253244899129065"
                // src="https://premiumpd.jotform.com/260627148085965"
                width="100%"
                height="100%"
                style={{
                  border: "none",
                }}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Best Video Upload UI */}
      {formCompleted && submissionId && !loading && (
        <Card
          elevation={4}
          sx={{
            width: "100%",
            // maxWidth: "1000px",
            height: isMobile ? "78vh" : "95vh",
            overflow: "auto",
            p: 1,
            borderRadius: 4,
            backgroundColor: "white",
          }}
        >
          <CardContent>
            <Typography variant="h6" mb={1} textAlign="center" fontWeight={600}>
              Step 2: Upload Your Inspection Videos
            </Typography>

            <Typography
              variant="body2"
              mb={2}
              color="text.secondary"
              textAlign="center"
            >
              Submission ID: <strong>{submissionId}</strong>
            </Typography>

            {uploadStatus && (
              <Alert severity="info" sx={{ mb: 2, textAlign: "center" }}>
                {uploadStatus}
              </Alert>
            )}

            {/* Upload Panel */}
            <Box
              ref={dashboardRef}
              mt={2}
              sx={{
                border: "2px dashed #bdbdbd",
                borderRadius: 3,
                p: 1,
                minHeight: "100px",
                backgroundColor: "#fafafa",
                textAlign: "center",
              }}
            />

            <Typography
              variant="caption"
              display="block"
              mt={2}
              color="text.secondary"
              textAlign="center"
            >
              📤 Your uploads continue in the background. You can safely close
              this page.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddDetails;
