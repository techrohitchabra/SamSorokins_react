import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import MainCard from "../../components/MainCard";
import { useSnackbarHelper } from "../../components/snackbar";

interface TestSubmissionItem {
  _id: string;
  submissionId: string;
  formId: string;
  ip?: string;
  status?: string;
  uniqueId?: string;
  replyEmail?: string;
  formName?: string;
  propertyName?: string;
  unitName?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TestSubmissions: React.FC = () => {
  const { request } = useAuth();
  const showSnackbar = useSnackbarHelper();

  const [submissions, setSubmissions] = useState<TestSubmissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formIdInput, setFormIdInput] = useState<string>("");
  const [syncing, setSyncing] = useState<boolean>(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await request.get("/testSubmissions");
      if (res.data?.success) {
        setSubmissions(res.data.data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch test submissions:", error);
      showSnackbar(
        error?.response?.data?.message || "Failed to load test submissions",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenModal = () => {
    setFormIdInput("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!syncing) {
      setModalOpen(false);
    }
  };

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIdInput.trim()) {
      showSnackbar("Please enter a valid Form ID", "warning");
      return;
    }

    setSyncing(true);
    try {
      const res = await request.post("/testSubmissions/sync", {
        formId: formIdInput.trim(),
      });

      if (res.data?.success) {
        showSnackbar(
          res.data.message || "Submissions synced successfully!",
          "success"
        );
        setModalOpen(false);
        fetchSubmissions();
      }
    } catch (error: any) {
      console.error("Error syncing submissions:", error);
      showSnackbar(
        error?.response?.data?.message ||
          "Failed to sync submissions from Jotform",
        "error"
      );
    } finally {
      setSyncing(false);
    }
  };

  // Filter & Group Submissions by formId
  const filteredSubmissions = useMemo(() => {
    if (!search.trim()) return submissions;
    const q = search.toLowerCase();
    return submissions.filter(
      (item) =>
        item.submissionId?.toLowerCase().includes(q) ||
        item.formId?.toLowerCase().includes(q) ||
        item.formName?.toLowerCase().includes(q) ||
        item.propertyName?.toLowerCase().includes(q) ||
        item.unitName?.toLowerCase().includes(q) ||
        item.replyEmail?.toLowerCase().includes(q) ||
        item.uniqueId?.toLowerCase().includes(q)
    );
  }, [submissions, search]);

  const groupedSubmissions = useMemo(() => {
    const groups: { [key: string]: TestSubmissionItem[] } = {};
    filteredSubmissions.forEach((item) => {
      const fId = item.formId || "Unknown Form";
      if (!groups[fId]) groups[fId] = [];
      groups[fId].push(item);
    });
    return groups;
  }, [filteredSubmissions]);

  const groupKeys = Object.keys(groupedSubmissions);

  return (
    <Box sx={{ p: 1 }}>
      <MainCard
        title={
          <Box display="flex" alignItems="center" gap={1.5}>
            <FolderIcon sx={{ color: "#1c3260" }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#1c3260" }}>
              Test Submissions
            </Typography>
          </Box>
        }
        actions={
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search submissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 220 }}
            />

            <Tooltip title="Refresh Table">
              <IconButton onClick={fetchSubmissions} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<CloudDownloadIcon />}
              onClick={handleOpenModal}
              sx={{
                bgcolor: "#1c3260",
                "&:hover": { bgcolor: "#152548" },
                borderRadius: 2,
                px: 2.5,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Fetch Jotform Submissions
            </Button>
          </Stack>
        }
        content={
          <Box>
            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
              </Box>
            ) : groupKeys.length === 0 ? (
              <Box textAlign="center" py={6}>
                <Typography variant="body1" color="text.secondary">
                  No submissions found. Click{" "}
                  <strong>Fetch Jotform Submissions</strong> to sync data by
                  Form ID.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                {groupKeys.map((formId) => {
                  const items = groupedSubmissions[formId];
                  const formTitle = items[0]?.formName || `Form ID: ${formId}`;

                  return (
                    <Accordion
                      key={formId}
                      defaultExpanded
                      sx={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px !important",
                        overflow: "hidden",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          bgcolor: "#f8fafc",
                          borderBottom: "1px solid #e2e8f0",
                          py: 0.5,
                          px: 2,
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          width="100%"
                          justifyContent="space-between"
                          pr={2}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <Chip
                              label={`Form ID: ${formId}`}
                              color="primary"
                              size="small"
                              sx={{ fontWeight: 700, bgcolor: "#1c3260" }}
                            />
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, color: "#1e293b" }}
                            >
                              {formTitle}
                            </Typography>
                          </Stack>

                          <Chip
                            label={`${items.length} ${
                              items.length === 1 ? "Submission" : "Submissions"
                            }`}
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 600, borderColor: "#cbd5e1" }}
                          />
                        </Box>
                      </AccordionSummary>

                      <AccordionDetails sx={{ p: 0 }}>
                        <TableContainer
                          component={Paper}
                          elevation={0}
                          sx={{ borderRadius: 0 }}
                        >
                          <Table size="small">
                            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Submission ID
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Property Name
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Unit Name
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Reply Email
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Unique ID
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Status
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                  Created At
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {items.map((row) => (
                                <TableRow
                                  key={row._id || row.submissionId}
                                  hover
                                >
                                  <TableCell
                                    sx={{ fontWeight: 600, color: "#2563eb" }}
                                  >
                                    {row.submissionId}
                                  </TableCell>
                                  <TableCell>
                                    {row.propertyName || "-"}
                                  </TableCell>
                                  <TableCell>{row.unitName || "-"}</TableCell>
                                  <TableCell>{row.replyEmail || "-"}</TableCell>
                                  <TableCell>{row.uniqueId || "-"}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={row.status || "ACTIVE"}
                                      size="small"
                                      color={
                                        row.status === "ACTIVE" || !row.status
                                          ? "success"
                                          : "default"
                                      }
                                      variant="outlined"
                                      sx={{ fontSize: 11, fontWeight: 600 }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {row.createdAt
                                      ? dayjs(row.createdAt).format(
                                          "MM/DD/YYYY h:mm A"
                                        )
                                      : "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </Stack>
            )}
          </Box>
        }
      />

      {/* Fetch Jotform Submissions Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5, p: 1 } }}
      >
        <form onSubmit={handleSyncSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1, color: "#1c3260" }}>
            Fetch Jotform Submissions
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the Jotform <strong>Form ID</strong> below to import all
              existing submissions for that form and store them in the{" "}
              <code>testsubmissions</code> table.
            </Typography>
            <TextField
              autoFocus
              label="Jotform Form ID"
              placeholder="e.g. 24123456789012"
              fullWidth
              required
              value={formIdInput}
              onChange={(e) => setFormIdInput(e.target.value)}
              disabled={syncing}
              variant="outlined"
              size="medium"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleCloseModal}
              disabled={syncing}
              color="inherit"
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={syncing}
              startIcon={
                syncing ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CloudDownloadIcon />
                )
              }
              sx={{
                bgcolor: "#1c3260",
                "&:hover": { bgcolor: "#152548" },
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
            >
              {syncing ? "Fetching..." : "Submit"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TestSubmissions;
