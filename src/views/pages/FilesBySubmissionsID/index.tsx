import { Stack, Typography, Box, LinearProgress, Chip } from "@mui/material";
import MainCard from "../../components/MainCard";
import { useUpload } from "../../../contexts/UploadContext";

const FilesBySubmissionsID = () => {
  const { uploads } = useUpload();

  // Group uploads by submissionId
  const groupedUploads = uploads.reduce((acc, current) => {
    const id = current.submissionId || "Unknown Submission";
    if (!acc[id]) acc[id] = [];
    acc[id].push(current);
    return acc;
  }, {} as Record<string, typeof uploads>);

  return (
    <MainCard
      title={
        <Typography variant={window.innerWidth < 1420 ? "h3" : "h4"}>
          Background Uploads
        </Typography>
      }
      content={
        <Box sx={{ mt: 2 }}>
          {uploads.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No active uploads.
            </Typography>
          ) : (
            <Stack spacing={4}>
              {Object.entries(groupedUploads).map(([submissionId, files]) => (
                <Box
                  key={submissionId}
                  sx={{
                    p: 2,
                    border: "2px solid #e0e0e0",
                    borderRadius: 3,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Typography
                    variant="h6"
                    mb={2}
                    color="primary"
                    fontWeight={700}
                  >
                    Submission ID: {submissionId}
                  </Typography>
                  <Stack spacing={2}>
                    {files.map((upload) => (
                      <Box
                        key={upload.id}
                        sx={{
                          p: 2,
                          border: "1px solid #eee",
                          borderRadius: 2,
                          backgroundColor: "#fff",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                            sx={{ maxWidth: "70%" }}
                          >
                            {upload.file.name}
                          </Typography>
                          <Chip
                            label={upload.status}
                            color={
                              upload.status === "Uploaded"
                                ? "success"
                                : upload.status === "Failed"
                                ? "error"
                                : "primary"
                            }
                            size="small"
                          />
                        </Stack>
                        {(upload.status === "Uploading" ||
                          upload.status === "Pending") && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box sx={{ width: "100%", mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={upload.progress}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >{`${upload.progress.toFixed(0)}%`}</Typography>
                            </Box>
                          </Box>
                        )}
                        {upload.status === "Uploaded" && upload.url && (
                          <Typography
                            variant="caption"
                            color="success.main"
                            display="block"
                            sx={{ wordBreak: "break-all" }}
                          >
                            S3 URL: {upload.url}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      }
    />
  );
};
export default FilesBySubmissionsID;
