import React, { useState } from "react";
import { Box, Paper, Typography, Container, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useLocation } from "react-router-dom";
import VendorCheckoutForm from "./VendorCheckoutForm";
import NonVendorCheckoutForm from "./NonVendorCheckoutForm";

interface PublicCheckoutProps {
  defaultUserType?: "Vendor" | "Non-Vendor";
}

const PublicCheckout: React.FC<PublicCheckoutProps> = ({ defaultUserType }) => {
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);

  // Determine user type from prop or URL pathname
  const userType: "Vendor" | "Non-Vendor" =
    defaultUserType ||
    (location.pathname.includes("non-vendor") ? "Non-Vendor" : "Vendor");

  const isNonVendor = userType === "Non-Vendor";

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={4}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 2.5, textAlign: "center" }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: "50%",
              bgcolor: isNonVendor ? "#fef3c7" : "#dcfce7",
              color: isNonVendor ? "#d97706" : "#16a34a",
              mb: 0.5,
            }}
          >
            <VpnKeyIcon sx={{ fontSize: 25 }} />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              fontSize: { xs: "1rem", sm: "1.5rem" },
            }}
          >
            {/* {isNonVendor ? "Non-Vendor Key Requestfffffff" : "Vendor Key Request"} */}
            {"Key Request Form"}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#64748b", mt: 0.5, maxWidth: 500, mx: "auto" }}
          >
            {/* {isNonVendor
              ? "Complete the form below to submit a non-vendor key checkout request."
              : "Complete the form below to submit a vendor key checkout request."} */}
            {"One Submission Per Property"}
          </Typography>
        </Box>

        {submitted ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 72, color: "#16a34a", mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}
            >
              Key Request Submitted Successfully!
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              Your key request has been logged into the system.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setSubmitted(false)}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb" },
              }}
            >
              Submit Another Key Request
            </Button>
          </Box>
        ) : isNonVendor ? (
          <NonVendorCheckoutForm onSuccess={() => setSubmitted(true)} />
        ) : (
          <VendorCheckoutForm onSuccess={() => setSubmitted(true)} />
        )}
      </Paper>
    </Container>
  );
};

export default PublicCheckout;
