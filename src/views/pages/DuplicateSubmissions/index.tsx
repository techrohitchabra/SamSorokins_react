import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SyncIcon from "@mui/icons-material/Sync";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TablePagination,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import { useModal } from "mui-modal-provider";

import { useQueryClient } from "@tanstack/react-query";
import useAuth from "../../../hooks/useAuth";
import useForcereminder from "../../../hooks/useForcereminder";
import {
  useDuplicateSubmissions,
  useResolvedDuplicateSubmissions,
} from "../../../hooks/useJotForm";
import DataGridTable from "../../components/DataGridTable";
import MainCard from "../../components/MainCard";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import { useSnackbarHelper } from "../../components/snackbar";
import SendReminderModal from "../Files/components/SendReminderModal";
import ResolveDuplicateGroupModal from "./components/ResolveDuplicateGroupModal";

const DuplicateSubmissions = () => {
  const queryClient = useQueryClient();
  const { request, userId } = useAuth();
  const showSnackbar = useSnackbarHelper();
  const { showModal } = useModal();
  const { sendReminder } = useForcereminder();
  const { userData } = useSelector((state: any) => state.user);

  if (userData?.role === "Key Manager") {
    return <Navigate to="/key-management" replace />;
  }

  const [rotated, setRotated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"unresolved" | "resolved">(
    "unresolved"
  );
  const [selectedGroupToResolve, setSelectedGroupToResolve] =
    useState<any>(null);

  // Accordion Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const {
    data: unresolvedData,
    isLoading: isLoadingUnresolved,
    isFetching: isFetchingUnresolved,
    refetch: refetchUnresolved,
  } = useDuplicateSubmissions(page, rowsPerPage, statusFilter === "unresolved");

  const {
    data: resolvedData,
    isLoading: isLoadingResolved,
    isFetching: isFetchingResolved,
    refetch: refetchResolved,
  } = useResolvedDuplicateSubmissions(
    page,
    rowsPerPage,
    statusFilter === "resolved"
  );

  const isResolvedMode = statusFilter === "resolved";
  const duplicateData = isResolvedMode ? resolvedData : unresolvedData;
  const isLoadingDuplicates =
    isRefreshing ||
    (isResolvedMode
      ? isLoadingResolved || isFetchingResolved
      : isLoadingUnresolved || isFetchingUnresolved);

  const refetchDuplicates = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchUnresolved(), refetchResolved()]);
    } catch (err) {
      console.error("Error refetching duplicate data", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenReminderModal = useCallback(
    (row: any) => {
      const modal = showModal(SendReminderModal, {
        submission: row,
        onSend: async ({ submissionId, recipients, subject, content }: any) => {
          try {
            await sendReminder({ submissionId, recipients, subject, content });
            showSnackbar("Reminder email sent successfully", "success");
            modal.hide();
          } catch (error) {
            console.error("Failed to send reminder email", error);
            showSnackbar("Failed to send reminder email", "error");
          }
        },
        onClose: () => {
          modal.hide();
        },
      });
    },
    [showModal, sendReminder, showSnackbar]
  );

  const handleRefetch = async () => {
    setRotated((prev) => !prev);
    await refetchDuplicates();
  };

  const handleStatusChange = (newStatus: "unresolved" | "resolved") => {
    setStatusFilter(newStatus);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        minWidth: 140,
        getActions: ({ row }: any) => {
          return [
            <Tooltip title="View Client Info">
              <GridActionsCellItem
                icon={<DescriptionIcon sx={{ color: "primary.main" }} />}
                label="Edit"
                onClick={() =>
                  window.open(
                    `/files/history/clientinfo?submissionId=${row?.submissionId}&page=ClientInfo`,
                    "_blank"
                  )
                }
              />
            </Tooltip>,
            <Tooltip title="View Files">
              <GridActionsCellItem
                icon={<CloudUploadIcon sx={{ color: "success.main" }} />}
                label="Files"
                style={{ color: "success.main" }}
                onClick={() =>
                  window.open(
                    `/files/history/files?submissionId=${row?.submissionId}&page=Files`,
                    "_blank"
                  )
                }
              />
            </Tooltip>,
            <Tooltip title="Send Email Reminder">
              <GridActionsCellItem
                icon={<EmailIcon sx={{ color: "primary.main" }} />}
                label="Reminder"
                onClick={() => handleOpenReminderModal(row)}
              />
            </Tooltip>,
            ...(userId == "69bd177472681b58e9c964b9" //show button only for developer
              ? [
                  <Tooltip title="Delete Submission" key="delete">
                    <GridActionsCellItem
                      icon={<DeleteIcon sx={{ color: "error.main" }} />}
                      label="Delete"
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to completely delete this submission and all its files?"
                          )
                        ) {
                          try {
                            await request.delete(
                              `/submissionsData/${row.submissionId}`
                            );
                            showSnackbar(
                              "Submission deleted successfully",
                              "success"
                            );
                            refetchDuplicates();
                          } catch (error) {
                            console.error("Failed to delete submission", error);
                            showSnackbar(
                              "Failed to delete submission",
                              "error"
                            );
                          }
                        }
                      }}
                    />
                  </Tooltip>,
                ]
              : []),
          ];
        },
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 80,
        renderCell: (params: any) => {
          const status = params?.row?.status;
          return (
            <Chip
              label={status || "-"}
              color={
                status === "Uploaded"
                  ? "success"
                  : status === "Failed"
                  ? "error"
                  : "warning"
              }
              size="small"
              variant="filled"
              sx={{ width: "80px" }}
            />
          );
        },
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "createdAt",
        headerName: "Created At",
        minWidth: 150,
        flex: 1,
        renderCell: (params: any) => {
          if (!params?.row?.createdAt) return "-";
          return (
            dayjs(params.row.createdAt).format("MM/DD/YYYY, h:mm A") || "-"
          );
        },
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "clientName",
        headerName: "Client Name",
        minWidth: 180,
        flex: 1,
        renderCell: (params: any) => params?.row?.clientName || "-",
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "clientEmail",
        headerName: "Email",
        minWidth: 200,
        flex: 1,
        renderCell: (params: any) => params?.row?.clientEmail || "-",
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "submissionId",
        headerName: "Submission ID",
        minWidth: 180,
        flex: 1,
        renderCell: (params: any) => params?.row?.submissionId || "-",
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
    ],
    [handleOpenReminderModal, request, showSnackbar, refetchDuplicates, userId]
  );

  const duplicateGroups = duplicateData?.duplicateGroups || [];
  const totalGroups = duplicateData?.totalGroups || 0;
  const totalDuplicateSubmissions =
    duplicateData?.totalDuplicateSubmissions || 0;

  const paginatedGroups = duplicateGroups;

  return (
    <MainCard
      title={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          flexWrap="wrap"
          gap={2}
        >
          {/* Left: Title + Segmented Control Tab Toggle */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            flexWrap="wrap"
          >
            <Typography variant="h5" fontWeight={700} color="#0f172a">
              Duplicate Submissions
            </Typography>

            {/* Segmented Tab Pill Control */}
            <Box
              sx={{
                bgcolor: "#f1f5f9",
                p: 0.5,
                borderRadius: "10px",
                display: "inline-flex",
                gap: 0.5,
              }}
            >
              <Button
                size="small"
                onClick={() => handleStatusChange("unresolved")}
                startIcon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.825rem",
                  fontWeight: statusFilter === "unresolved" ? 700 : 500,
                  bgcolor:
                    statusFilter === "unresolved" ? "#ffffff" : "transparent",
                  color: statusFilter === "unresolved" ? "#c2410c" : "#64748b",
                  boxShadow:
                    statusFilter === "unresolved"
                      ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)"
                      : "none",
                  "&:hover": {
                    bgcolor:
                      statusFilter === "unresolved"
                        ? "#ffffff"
                        : "rgba(255,255,255,0.5)",
                  },
                }}
              >
                Unresolved
              </Button>

              <Button
                size="small"
                onClick={() => handleStatusChange("resolved")}
                startIcon={<TaskAltIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 1.5,
                  py: 0.5,
                  fontSize: "0.825rem",
                  fontWeight: statusFilter === "resolved" ? 700 : 500,
                  bgcolor:
                    statusFilter === "resolved" ? "#ffffff" : "transparent",
                  color: statusFilter === "resolved" ? "#15803d" : "#64748b",
                  boxShadow:
                    statusFilter === "resolved"
                      ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)"
                      : "none",
                  "&:hover": {
                    bgcolor:
                      statusFilter === "resolved"
                        ? "#ffffff"
                        : "rgba(255,255,255,0.5)",
                  },
                }}
              >
                Resolved / Checked
              </Button>
            </Box>
          </Stack>

          {/* Right: Metrics Stats Badges */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "8px",
                bgcolor: "#f0f9ff",
                border: "1px solid #bae6fd",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#0369a1", fontWeight: 600 }}
              >
                Groups:
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: "#0284c7", fontWeight: 800 }}
              >
                {totalGroups}
              </Typography>
            </Box>

            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: "8px",
                bgcolor: "#faf5ff",
                border: "1px solid #e9d5ff",
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#7e22ce", fontWeight: 600 }}
              >
                Total Duplicates:
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: "#9333ea", fontWeight: 800 }}
              >
                {totalDuplicateSubmissions}
              </Typography>
            </Box>
          </Stack>
        </Box>
      }
      actions={
        <Stack direction="row" alignItems="center" spacing={2}>
          <Tooltip title="Refresh">
            <IconButton disableRipple onClick={handleRefetch}>
              <SyncIcon
                style={{
                  transform: rotated ? "rotate(360deg)" : "rotate(0deg)",
                  transition: "transform 1s ease",
                }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      }
      content={
        <>
          {isLoadingDuplicates ? (
            <Box py={2} width="100%">
              <TableSkeleton rows={6} />
            </Box>
          ) : duplicateGroups.length === 0 ? (
            <Box py={6} textAlign="center">
              <CopyAllIcon
                sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
              />
              <Typography variant="h6" color="text.secondary">
                No duplicate submissions found based on Form Name, Property &
                Unit.
              </Typography>
            </Box>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              height="calc(100vh - 160px)"
            >
              <Box flex={1} overflow="auto" pr={0.5}>
                <Stack spacing={2}>
                  {paginatedGroups.map((group: any, index: number) => (
                    <Accordion
                      key={`${group.formName}-${group.propertyName}-${group.unitName}-${index}`}
                      // defaultExpanded={index === 0}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "10px !important",
                        overflow: "hidden",
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary
                        component="div"
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          backgroundColor: "rgba(59, 130, 246, 0.05)",
                          px: 2,
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          width="100%"
                          pr={2}
                          flexWrap="wrap"
                          gap={1}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            flexWrap="wrap"
                          >
                            <Typography variant="subtitle1" fontWeight={600}>
                              Form: {group.formName || "N/A"}
                            </Typography>
                            <Chip
                              label={`Property: ${group.propertyName}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={`Unit: ${group.unitName}`}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          </Stack>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                          >
                            <Chip
                              label={`${group.count} Duplicate Submissions`}
                              size="small"
                              color={
                                statusFilter === "resolved"
                                  ? "success"
                                  : "error"
                              }
                              variant="filled"
                            />
                            {statusFilter === "unresolved" ? (
                              <Tooltip
                                title="Resolve / Mark as Checked"
                                disableFocusListener
                              >
                                <IconButton
                                  component="span"
                                  size="small"
                                  color="success"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    (e.currentTarget as HTMLElement)?.blur();
                                    setSelectedGroupToResolve(group);
                                  }}
                                  sx={{
                                    bgcolor: "rgba(22, 163, 74, 0.1)",
                                    border: "1px solid rgba(22, 163, 74, 0.3)",
                                    color: "#166534",
                                    "&:hover": {
                                      bgcolor: "rgba(22, 163, 74, 0.2)",
                                      borderColor: "rgba(22, 163, 74, 0.5)",
                                    },
                                  }}
                                >
                                  <TaskAltIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Chip
                                label="Marked as Checked"
                                color="success"
                                size="small"
                                variant="outlined"
                                icon={<TaskAltIcon />}
                                sx={{
                                  fontWeight: 600,
                                  bgcolor: "rgba(22, 163, 74, 0.08)",
                                }}
                              />
                            )}
                          </Stack>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <DataGridTable
                          column={columns}
                          rows={group.submissions || []}
                          totalRows={group.submissions?.length || 0}
                          isLoading={false}
                          paginationMode="client"
                          pageSizeOptions={[12, 20, 50, 100]}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </Box>

              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                borderTop="1px solid"
                borderColor="divider"
                bgcolor="background.paper"
                flexShrink={0}
              >
                <TablePagination
                  component="div"
                  count={totalGroups}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[8, 12, 20, 50, 100]}
                  labelRowsPerPage="Groups per page:"
                />
              </Box>
            </Box>
          )}
          {selectedGroupToResolve && (
            <ResolveDuplicateGroupModal
              open={Boolean(selectedGroupToResolve)}
              onClose={() => setSelectedGroupToResolve(null)}
              group={selectedGroupToResolve}
              onConfirm={async () => {
                try {
                  setIsRefreshing(true);
                  const submissions = selectedGroupToResolve?.submissions || [];
                  const submissionIds = submissions.map(
                    (sub: any) => sub.submissionId
                  );
                  await request.post("/submissionsData/resolve-duplicates", {
                    submissionIds,
                  });
                  showSnackbar(
                    `Successfully resolved duplicate group (${submissions.length} submissions).`,
                    "success"
                  );
                  setSelectedGroupToResolve(null);

                  if (paginatedGroups.length === 1 && page > 0) {
                    setPage((prev) => prev - 1);
                  }

                  await queryClient.invalidateQueries({
                    queryKey: ["/submissionsData/duplicates"],
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ["/submissionsData/resolved-duplicates"],
                  });
                  await refetchDuplicates();
                } catch (error) {
                  console.error("Failed to resolve duplicate group", error);
                  showSnackbar("Failed to resolve duplicate group", "error");
                } finally {
                  setIsRefreshing(false);
                }
              }}
            />
          )}
        </>
      }
    />
  );
};

export default DuplicateSubmissions;
