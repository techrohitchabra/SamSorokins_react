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
    <Container maxWidth="md" sx={{ py: { xs: 1.5, sm: 2 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1, sm: 1.5 },
          borderRadius: 3,
          background: "#ffffff",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        {/* Header: Key Logo on Left, Heading & Subheading Centered */}
        <Box
          sx={{
            mb: 1.5,
            pb: 1.5,
            borderBottom: "1.5px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Key Logo on Left Side */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 42,
              height: 42,
              borderRadius: 2.5,
              bgcolor: isNonVendor ? "#fef3c7" : "#dcfce7",
              color: isNonVendor ? "#d97706" : "#16a34a",
              position: "absolute",
              left: 0,
            }}
          >
            <VpnKeyIcon sx={{ fontSize: 24 }} />
          </Box>

          {/* Heading & Subheading Centered */}
          <Box sx={{ width: "100%", textAlign: "center", px: 5 }}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                fontSize: { xs: "1.15rem", sm: "1.35rem" },
                lineHeight: 1.2,
              }}
            >
              {isNonVendor ? "Non-Vendor Key Request" : "Vendor Key Request"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                mt: 0.2,
                fontWeight: 500,
                fontSize: "0.85rem",
              }}
            >
              One submission per property.
            </Typography>
          </Box>
        </Box>

        {submitted ? (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 64, color: "#16a34a", mb: 1.5 }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "#0f172a", mb: 1 }}
            >
              Key Request Submitted Successfully!
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
              Your key request has been recorded into the system.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setSubmitted(false)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                px: 4,
                py: 1,
                borderRadius: 2,
                bgcolor: "#3b82f6",
                "&:hover": { bgcolor: "#2563eb" },
                fontSize: "0.95rem",
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
