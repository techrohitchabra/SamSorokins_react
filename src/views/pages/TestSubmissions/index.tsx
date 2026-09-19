import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useModal } from "mui-modal-provider";
import useAuth from "../../../hooks/useAuth";
import MainCard from "../../components/MainCard";
import { useSnackbarHelper } from "../../components/snackbar";
import DeleteTestSubmissionModal from "./DeleteTestSubmissionModal";
import FetchJotformModal from "./FetchJotformModal";

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
  const { showModal } = useModal();

  const [submissions, setSubmissions] = useState<TestSubmissionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  // Modal State for Syncing
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formIdInput, setFormIdInput] = useState<string>("");
  const [syncing, setSyncing] = useState<boolean>(false);

  // Track item targeted for deletion
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

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

  // Delete Action via mui-modal-provider showModal
  const handleDeleteSubmission = useCallback(
    (row: TestSubmissionItem) => {
      const id = row._id || row.submissionId;
      setSubmissionToDelete(id);

      const modal: any = showModal(DeleteTestSubmissionModal, {
        onClose: () => {
          modal.hide();
          setSubmissionToDelete(null);
        },
        submissionId: row.submissionId,
        onConfirm: async () => {
          try {
            const res = await request.delete(`/testSubmissions/${id}`);
            if (res.data?.success) {
              showSnackbar(
                res.data.message ||
                  "Test submission permanently deleted successfully!",
                "success"
              );
              setSubmissions((prev) =>
                prev.filter(
                  (item) => item._id !== id && item.submissionId !== id
                )
              );
              modal.hide();
            }
          } catch (error: any) {
            console.error("Failed to delete test submission:", error);
            showSnackbar(
              error?.response?.data?.message ||
                "Failed to delete test submission",
              "error"
            );
          } finally {
            setSubmissionToDelete(null);
          }
        },
      });
    },
    [showModal, request, showSnackbar]
  );

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
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 700 }}
                                >
                                  Action
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
                                  <TableCell align="center">
                                    <Tooltip title="Delete Permanently">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        disabled={
                                          submissionToDelete ===
                                          (row._id || row.submissionId)
                                        }
                                        onClick={() =>
                                          handleDeleteSubmission(row)
                                        }
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
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
      <FetchJotformModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSyncSubmit}
        formIdInput={formIdInput}
        setFormIdInput={setFormIdInput}
        syncing={syncing}
      />
    </Box>
  );
};

export default TestSubmissions;
