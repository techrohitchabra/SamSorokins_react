import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import KeyIcon from "@mui/icons-material/Key";
import SearchIcon from "@mui/icons-material/Search";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  type DialogProps,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import BasicModal from "../../../components/modal";
import { getCreatorName } from "../../../../hooks/useKeyManagement";

interface ReturnKeyDialogProps extends DialogProps {
  onClose: () => void;
  fetchKeysByRfid: (rfId: string) => Promise<any[]>;
  onReturn: (id: string) => Promise<any>;
  refetchKeys?: () => void;
}

const ReturnKeyDialog: React.FC<ReturnKeyDialogProps> = ({
  open,
  onClose,
  fetchKeysByRfid,
  onReturn,
  refetchKeys,
  ...props
}) => {
  // State variables for RFID search input and search results management
  const [rfId, setRfId] = useState("");
  // const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [keysList, setKeysList] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);

  /**
   * Triggers key lookup by RFID code input.
   * Validates input, updates search loading state, and handles success/error responses.
   */
  const handleSearch = async () => {
    const trimmed = rfId.trim();
    // Condition: Do not execute search if RFID input is empty or whitespace
    if (!trimmed) return;

    setIsSearching(true);
    setErrorMessage(null);
    // setSearched(true);
    setKeysList([]);

    try {
      const results = await fetchKeysByRfid(trimmed);
      // Condition: Populate key list if records found, otherwise set error message
      if (results && results.length > 0) {
        setKeysList(results);
      } else {
        setErrorMessage("No Key Record Found");
      }
    } catch (err: any) {
      setErrorMessage("No Key Record Found");
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handles keyboard shortcuts in RFID input field.
   * Triggers search automatically when Enter key is pressed.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Condition: Check for Enter key press
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  /**
   * Processes the key return check-in action for a given key record ID.
   * Updates state during API execution and updates local list upon success.
   */
  const handleReturnKey = async (id: string) => {
    setReturningId(id);
    try {
      await onReturn(id);
      // Condition: Remove returned key record from local search results list
      setKeysList((prev) => prev.filter((k) => k._id !== id));
      // Condition: Invoke refetchKeys callback if provided by parent component
      if (refetchKeys) {
        refetchKeys();
      }
    } catch (err) {
      console.error("Error returning key:", err);
    } finally {
      setReturningId(null);
    }
  };

  /**
   * Returns theme styling object based on key status value.
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      // Condition: Checked out key status
      case "Checked Out":
      case "Key Checked Out":
        return {
          bg: "#fff7ed",
          text: "#c2410c",
          border: "#ffedd5",
          dot: "#f97316",
        };
      // Condition: Outstanding / To Be Returned key status
      case "To Be Returned":
      case "Outstanding":
        return {
          bg: "#faf5ff",
          text: "#7e22ce",
          border: "#f3e8ff",
          dot: "#a855f7",
        };
      // Condition: Lost key status
      case "Lost":
        return {
          bg: "#fef2f2",
          text: "#b91c1c",
          border: "#fee2e2",
          dot: "#ef4444",
        };
      // Condition: Default fallback (Available / Returned) status
      default:
        return {
          bg: "#f0fdf4",
          text: "#15803d",
          border: "#dcfce7",
          dot: "#22c55e",
        };
    }
  };

  return (
    <BasicModal
      open={open}
      onClose={onClose}
      size="md"
      /* Dialog Header Title & Subtitle */
      title={
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              bgcolor: "#eff6ff",
              color: "#2563eb",
              p: 0.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AssignmentReturnIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.1 }}
            >
              Key Return
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "#64748b", lineHeight: 1.15, mt: 0 }}
            >
              Scan or enter RFID / Key ID to process key check-in
            </Typography>
          </Box>
        </Box>
      }
      content={
        <Box display="flex" flexDirection="column" gap={1.5} sx={{ pt: -1 }}>
          {/* RFID Search Input Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 1,
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 2.5,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "#334155", mb: 0.2 }}
            >
              Enter or Scan RFID
            </Typography>
            <Box display="flex" gap={1.5} alignItems="center">
              <TextField
                fullWidth
                size="small"
                placeholder="Type or scan RFID code..."
                value={rfId}
                onChange={(e) => setRfId(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: "#ffffff",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              {/* Search Button: Disabled during active search or when RFID input is empty */}
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={isSearching || !rfId.trim()}
                startIcon={
                  /* Condition: Display loader when search API call is in progress */
                  isSearching ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SearchIcon sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  bgcolor: "#2563eb",
                  "&:hover": { bgcolor: "#1d4ed8" },
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </Box>
          </Paper>

          {/* Condition: Display error alert message if no key records found or API fails */}
          {errorMessage && (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                bgcolor: "#fef2f2",
                color: "#991b1b",
                border: "1px solid #fecaca",
                "& .MuiAlert-icon": {
                  color: "#dc2626",
                },
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {/* Condition: Render list of matching key cards when search returns key records */}
          {keysList.length > 0 && (
            <Box display="flex" flexDirection="column" gap={0.5}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "#475569" }}
              >
                Found Key Records ({keysList.length})
              </Typography>

              {keysList.map((keyItem) => {
                // Determine badge styles and request type condition for each key card
                const statusStyle = getStatusColor(keyItem.status);
                const reqType =
                  keyItem.requestType || keyItem.userType || "Vendor";
                const isNonVendor = reqType === "Non-Vendor";
                // Condition: Check if this specific key record is currently being returned
                const isReturningThis = returningId === keyItem._id;

                return (
                  <Card
                    key={keyItem._id}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      borderColor: "#cbd5e1",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "#93c5fd",
                        boxShadow: "0 4px 16px rgba(59, 130, 246, 0.1)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        mb={0.5}
                      >
                        {/* Status Badge & User Type Chip */}
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          flexWrap="wrap"
                        >
                          <Chip
                            label={
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={0.75}
                              >
                                <Box
                                  component="span"
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    bgcolor: statusStyle.dot,
                                  }}
                                />
                                <Typography
                                  component="span"
                                  sx={{
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: statusStyle.text,
                                  }}
                                >
                                  {keyItem.status || "Checked Out"}
                                </Typography>
                              </Box>
                            }
                            size="small"
                            sx={{
                              bgcolor: statusStyle.bg,
                              border: `1px solid ${statusStyle.border}`,
                              borderRadius: "12px",
                              height: 24,
                            }}
                          />
                          {/* Request Type Chip: Styled conditionally based on Vendor vs Non-Vendor */}
                          <Chip
                            label={reqType}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              bgcolor: isNonVendor ? "#fef3c7" : "#dcfce7",
                              color: isNonVendor ? "#b45309" : "#15803d",
                              border: `1px solid ${
                                isNonVendor ? "#fde68a" : "#bbf7d0"
                              }`,
                              borderRadius: "12px",
                            }}
                          />
                        </Box>

                        {/* Return Action Button: Disabled during key return operation */}
                        <Button
                          variant="contained"
                          color="success"
                          disabled={isReturningThis}
                          onClick={() => handleReturnKey(keyItem._id)}
                          startIcon={
                            /* Condition: Show loading spinner when return API is processing */
                            isReturningThis ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                            )
                          }
                          sx={{
                            bgcolor: "#16a34a",
                            "&:hover": { bgcolor: "#15803d" },
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 2.5,
                            py: 0.6,
                            boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
                          }}
                        >
                          {isReturningThis ? "Returning..." : "Return"}
                        </Button>
                      </Box>

                      <Divider sx={{ mb: 1.5 }} />

                      <Grid container spacing={1.5}>
                        {/* Vendor / Requester Info */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            Vendor / Requester
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: "#0f172a" }}
                          >
                            {keyItem.vendor || keyItem.whoHasIt || "-"}
                          </Typography>
                        </Grid>

                        {/* Service Issue Info */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            Service Issue #
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: "#334155" }}
                          >
                            {keyItem.serviceIssue ||
                              keyItem.serviceRequest ||
                              "-"}
                          </Typography>
                        </Grid>

                        {/* Property & Unit Info */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            Property / Unit
                          </Typography>
                          <Box
                            display="flex"
                            alignItems="center"
                            gap={1}
                            mt={0.25}
                          >
                            <Chip
                              label={keyItem.property || "-"}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                bgcolor: "#f1f5f9",
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                height: 22,
                                fontSize: "0.72rem",
                              }}
                            />
                            {/* Condition: Render unit chip only if unit number exists */}
                            {keyItem.unit && (
                              <Chip
                                label={`Unit: ${keyItem.unit}`}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: "#e0f2fe",
                                  color: "#0369a1",
                                  border: "1px solid #bae6fd",
                                  height: 22,
                                  fontSize: "0.72rem",
                                }}
                              />
                            )}
                          </Box>
                        </Grid>

                        {/* Keys Needed Quantity */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            Keys Needed
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: "#334155" }}
                          >
                            {keyItem.keysNeeded || "-"}
                          </Typography>
                        </Grid>

                        {/* Pick Up Date & Time */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            Pick Up Date & Time
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700, color: "#2563eb" }}
                          >
                            {keyItem.pickUpDateTime || "-"}
                          </Typography>
                        </Grid>

                        {/* By When Deadline */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            By When
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: "#475569" }}
                          >
                            {keyItem.byWhen || "-"}
                          </Typography>
                        </Grid>

                        {/* Creation Timestamp */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              fontWeight: 600,
                              display: "block",
                            }}
                          >
                            Created At
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: "#64748b" }}
                          >
                            {/* Condition: Format ISO date string with creator name or fallback dash */}
                            {keyItem.createdAt
                              ? `${new Date(keyItem.createdAt).toLocaleString()}${
                                  getCreatorName(keyItem.createdBy)
                                    ? ` - ${getCreatorName(keyItem.createdBy)}`
                                    : ""
                                }`
                              : "-"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Box>
      }
      actions={
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ textTransform: "none", color: "#64748b", fontWeight: 600 }}
        >
          Close
        </Button>
      }
      {...props}
    />
  );
};

export default ReturnKeyDialog;
