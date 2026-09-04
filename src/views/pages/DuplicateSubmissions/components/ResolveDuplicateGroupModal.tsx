import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import {
  Box,
  Button,
  Chip,
  Divider,
  // Grid2 as Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  type DialogProps,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";

import BasicModal from "../../../components/modal";

interface ResolveDuplicateGroupModalProps extends DialogProps {
  onClose: () => void;
  group: {
    formName: string;
    propertyName: string;
    unitName: string;
    count: number;
    submissions: any[];
  } | null;
  onConfirm: () => Promise<void>;
}

const ResolveDuplicateGroupModal: React.FC<ResolveDuplicateGroupModalProps> = ({
  open,
  onClose,
  group,
  onConfirm,
  ...props
}) => {
  const [loading, setLoading] = useState(false);

  if (!group) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const count = group?.count || group?.submissions?.length || 0;
  const submissions = group?.submissions || [];

  return (
    <BasicModal
      open={open}
      onClose={onClose}
      size="md"
      isLoader={loading}
      title={
        <Box display="flex" alignItems="center" gap={1.5}>
          <CheckCircleIcon sx={{ fontSize: 28, color: "success.main" }} />
          <Box>
            <Typography variant="h6" fontWeight={700} color="#1e293b">
              Resolve Duplicate Group
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: "block", color: "#64748b", fontWeight: 500 }}
            >
              Form: {group.formName || "N/A"} | Property: {group.propertyName} |
              Unit: {group.unitName}
            </Typography>
          </Box>
        </Box>
      }
      content={
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          {/* Top Info Banner */}
          <Grid size={{ xs: 12 }}>
            <Paper
              sx={{
                p: 2,
                bgcolor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 2.5,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="#166534">
                Marking {count} Submissions as Resolved
              </Typography>
              <Typography variant="body2" color="#15803d" sx={{ mt: 0.5 }}>
                Submissions will remain safely stored in the database, but this
                group will no longer trigger duplicate alerts.
              </Typography>
            </Paper>
          </Grid>

          {/* Group Parameters Card */}
          <Grid size={{ xs: 12, sm: 5 }}>
            <Paper
              sx={{
                p: 2,
                border: "1px solid #e2e8f0",
                borderRadius: 2.5,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                Group Summary
              </Typography>

              <Box
                display="flex"
                flexDirection="column"
                gap={1.2}
                sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2 }}
              >
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Form Name
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, maxWidth: 180, textAlign: "right" }}
                  >
                    {group.formName || "N/A"}
                  </Typography>
                </Box>
                <Divider />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Property
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {group.propertyName || "-"}
                  </Typography>
                </Box>
                <Divider />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Unit
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#0284c7" }}
                  >
                    {group.unitName || "-"}
                  </Typography>
                </Box>
                <Divider />

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" color="textSecondary">
                    Duplicate Submissions
                  </Typography>
                  <Chip
                    label={`${count} Submissions`}
                    size="small"
                    color="error"
                    sx={{ height: 22, fontWeight: 700 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Submissions List Card */}
          <Grid size={{ xs: 12, sm: 7 }}>
            <Paper
              sx={{
                p: 2,
                border: "1px solid #e2e8f0",
                borderRadius: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#1e293b" }}
              >
                Submissions in Group ({count})
              </Typography>

              <TableContainer
                sx={{
                  maxHeight: 250,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>
                        Client Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>
                        Submission ID
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((sub: any, idx: number) => (
                      <TableRow key={sub.submissionId || idx} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {sub.clientName || "N/A"}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            display="block"
                          >
                            {sub.createdAt
                              ? dayjs(sub.createdAt).format(
                                  "MM/DD/YYYY, h:mm A"
                                )
                              : "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: "monospace", fontWeight: 600 }}
                          >
                            {sub.submissionId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={sub.status || "Pending"}
                            size="small"
                            color={
                              sub.status === "Uploaded"
                                ? "success"
                                : sub.status === "Failed"
                                ? "error"
                                : "warning"
                            }
                            sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      }
      actions={
        <Box display="flex" justifyContent="flex-end" gap={1.5} width="100%">
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{
              textTransform: "none",
              color: "#64748b",
              borderColor: "#cbd5e1",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<TaskAltIcon />}
            disabled={loading}
            onClick={handleConfirm}
            sx={{
              textTransform: "none",
              bgcolor: "#16a34a",
              "&:hover": { bgcolor: "#15803d" },
              px: 2.5,
            }}
          >
            {loading ? "Resolving..." : "Mark as Resolved"}
          </Button>
        </Box>
      }
      {...props}
    />
  );
};

export default ResolveDuplicateGroupModal;
