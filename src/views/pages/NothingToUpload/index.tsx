import { Box, Paper, Typography } from "@mui/material";
import CloudDoneIcon from "@mui/icons-material/CloudDone";

const NothingToUpload = () => {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 50px)",
        background: "#dcdde3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: 900,
          textAlign: "center",
          py: 8,
          px: 4,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 90,
            height: 90,
            bgcolor: "#22c55e",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            mb: 4,
          }}
        >
          <CloudDoneIcon sx={{ color: "#fff", fontSize: 40 }} />
        </Box>

        {/* Title */}
        <Typography
          sx={{
            fontSize: { xs: 30, md: 40 },
            fontWeight: 700,
            color: "#1f2937",
          }}
        >
          Nothing to Upload
        </Typography>

        {/* Subtitle */}
        <Typography
          sx={{
            mt: 1,
            color: "#6b7280",
            fontSize: 16,
          }}
        >
          You currently have no files pending for upload.
        </Typography>
      </Paper>
    </Box>
  );
};

export default NothingToUpload;
