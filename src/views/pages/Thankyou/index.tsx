import { Box, Paper, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useJotForm from "../../../hooks/useJotForm";
import Spinner from "../../components/SpinnerLoader/SpinnerLoader";

const Thankyou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const submissionId = location.state?.submissionId;
  const id = location.state?.id;

  const { jotFormData, isLoadingJotFormData } = useJotForm(id, submissionId);
  const requiredUploads = jotFormData?.formKeys?.requiredUploads || [];
  //   console.log(isLoadingJotFormData);
  useEffect(() => {
    // localStorage.clear();
    if (!submissionId) {
      navigate("/login");
    }

    if (requiredUploads === "nothing_to_upload") {
      navigate("/jotform/files/nothingtoupload");
    }
  }, [jotFormData, requiredUploads]);

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
      {isLoadingJotFormData && (
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
        {/* Icon Illustration */}
        <Box
          sx={{
            position: "relative",
            width: 140,
            height: 110,
            margin: "0 auto",
            mb: 4,
          }}
        >
          {/* Green Paper */}
          <Box
            sx={{
              position: "absolute",
              top: -30,
              left: "50%",
              transform: "translateX(-50%)",
              width: 90,
              height: 90,
              bgcolor: "#22c55e",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            <CheckIcon sx={{ color: "#fff", fontSize: 40 }} />
          </Box>

          {/* Envelope */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: 80,
              bgcolor: "#e5e7eb",
              borderRadius: 2,
            }}
          />

          {/* Envelope Flaps */}
          <Box
            sx={{
              position: "absolute",
              bottom: 40,
              left: 0,
              width: "50%",
              height: 40,
              bgcolor: "#d1d5db",
              clipPath: "polygon(0 0, 100% 100%, 0 100%)",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              bottom: 40,
              right: 0,
              width: "50%",
              height: 40,
              bgcolor: "#d1d5db",
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            }}
          />
        </Box>

        {/* Text */}
        <Typography
          sx={{
            fontSize: { xs: 34, md: 44 },
            fontWeight: 700,
            color: "#1f2937",
          }}
        >
          Thank You!
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "#6b7280",
            fontSize: 16,
          }}
        >
          Your submission has been received.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Thankyou;
