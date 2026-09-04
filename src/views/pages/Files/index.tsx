import { useCallback, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import EmailIcon from "@mui/icons-material/Email";
import SyncIcon from "@mui/icons-material/Sync";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from "@mui/x-data-grid";

import { debounce } from "lodash";
import { useModal } from "mui-modal-provider";
import useAuth from "../../../hooks/useAuth";
import useForcereminder from "../../../hooks/useForcereminder";
import useJotForm, {
  useSubmissionFilterOptions,
} from "../../../hooks/useJotForm";
import DataGridTable from "../../components/DataGridTable";
import SearchField from "../../components/inputs/SearchField";
import MainCard from "../../components/MainCard";
import { useSnackbarHelper } from "../../components/snackbar";
import SendReminderModal from "./components/SendReminderModal";

const Files = () => {
  // const navigate = useNavigate();
  const { request, userId } = useAuth();
  const showSnackbar = useSnackbarHelper();
  const { showModal } = useModal();
  const { userData } = useSelector((state: any) => state.user);

  if (userData?.role === "Key Manager") {
    return <Navigate to="/key-management" replace />;
  }
  const { sendReminder } = useForcereminder();

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

  const [search, setSearch] = useState("");
  const [rotated, setRotated] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<string>("All");
  const [selectedUnit, setSelectedUnit] = useState<string>("All");

  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: "createdAt", sort: "desc" },
  ]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 12,
  });
  const [statusFilter, setStatusFilter] = useState("");

  // Fetch all unique Property and Unit options from complete table data
  const {
    data: filterOptionsData,
    isLoading: isLoadingFilterOptions,
    isFetching: isFetchingFilterOptions,
  } = useSubmissionFilterOptions(selectedProperty);

  const isOptionsLoading = isLoadingFilterOptions || isFetchingFilterOptions;
  const propertyOptions = filterOptionsData?.properties || ["All"];
  const unitOptions = filterOptionsData?.units || ["All"];

  // Fetch submissions filtered across complete table data
  const {
    submissionsData,
    totalSubmissions,
    isLoadingSubmissionsData,
    refetchSubmissionsData,
  } = useJotForm(
    "",
    "",
    search,
    paginationModel,
    sortModel,
    statusFilter,
    selectedProperty,
    selectedUnit
  );

  const columns: GridColDef[] = [
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
                          refetchSubmissionsData();
                        } catch (error) {
                          console.error("Failed to delete submission", error);
                          showSnackbar("Failed to delete submission", "error");
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
      sortable: false,
      sortComparator: (v1, v2) => {
        // Handle undefined/null cases
        if (!v1) return -1;
        if (!v2) return 1;
        // Parse the messy strings into Dates and compare algebraically
        return new Date(v1).getTime() - new Date(v2).getTime();
      },
      renderCell: (params: any) => {
        if (!params?.row?.createdAt) return "-";
        // Strip out the GMT timezone so dayjs treats it as absolute local, avoiding timezone push-forwards
        // const cleanDateStr = params.row.createdAt.replace(/GMT.*/, "").trim();
        // return dayjs(cleanDateStr).format("MM/DD/YYYY, h:mm A");
        return dayjs(params.row.createdAt).format("MM/DD/YYYY, h:mm A") || "-";
      },
      renderHeader: (params: any) => params?.colDef?.headerName,
    },
    {
      field: "formName",
      headerName: "Form Name",
      minWidth: 200,
      flex: 1,
      renderCell: (params: any) => params?.row?.formName || "-",
      renderHeader: (params: any) => params?.colDef?.headerName,
    },
    {
      field: "propertyName",
      headerName: "Property",
      minWidth: 150,
      flex: 1,
      renderCell: (params: any) => params?.row?.propertyName || "-",
      renderHeader: (params: any) => params?.colDef?.headerName,
    },
    {
      field: "unitName",
      headerName: "Unit",
      minWidth: 100,
      flex: 1,
      renderCell: (params: any) => params?.row?.unitName || "-",
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
  ];

  const handleSortModelChange = (newModel: any[]) => {
    setSortModel(newModel);
  };

  // Add debounce to hold render events
  const debouncedSetSearch = useRef(
    debounce((value) => {
      setSearch(value);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 400)
  ).current;
  const handleSearchChange = useCallback(
    (event: any) => {
      debouncedSetSearch(event.target.value);
    },
    [debouncedSetSearch]
  );

  const handleStatusClick = (status: string) => {
    setStatusFilter((prev) => (prev === status ? "" : status));
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleRefetch = () => {
    setRotated((prev) => !prev);
    refetchSubmissionsData();
  };

  return (
    <Box>
      <MainCard
        title={
          <Box display={"flex"} alignItems={"center"} gap={1} flexWrap={"wrap"}>
            {/* <Typography variant="h5">Submissions</Typography> */}
            <Chip
              label="All"
              color="primary"
              size="small"
              onClick={() => handleStatusClick("")}
              variant={statusFilter === "" ? "filled" : "outlined"}
              sx={{ cursor: "pointer", width: "70px" }}
            />
            <Chip
              label="Uploaded"
              color="success"
              size="small"
              onClick={() => handleStatusClick("Uploaded")}
              variant={statusFilter === "Uploaded" ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label="Uploading"
              color="warning"
              size="small"
              onClick={() => handleStatusClick("Uploading")}
              variant={statusFilter === "Uploading" ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label="Pending"
              color="warning"
              size="small"
              onClick={() => handleStatusClick("Pending")}
              variant={statusFilter === "Pending" ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
            <Chip
              label="Failed"
              color="error"
              size="small"
              onClick={() => handleStatusClick("Failed")}
              variant={statusFilter === "Failed" ? "filled" : "outlined"}
              sx={{ cursor: "pointer" }}
            />
          </Box>
        }
        actions={
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.5}
            flexWrap="wrap"
          >
            <Tooltip title={"Refresh"}>
              <IconButton disableRipple onClick={() => handleRefetch()}>
                <SyncIcon
                  style={{
                    transform: rotated ? "rotate(360deg)" : "rotate(0deg)",
                    transition: "transform 1s ease",
                  }}
                />
              </IconButton>
            </Tooltip>

            <Autocomplete
              size="small"
              options={propertyOptions}
              value={selectedProperty}
              loading={isOptionsLoading}
              loadingText="Loading options..."
              onChange={(_, newValue) => {
                const val = newValue || "All";
                setSelectedProperty(val);
                setSelectedUnit("All");
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              disableClearable
              sx={{
                minWidth: { xs: "100%", sm: 140 },
                "& .MuiOutlinedInput-root": {
                  height: 35,
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Property"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isOptionsLoading ? (
                          <CircularProgress
                            color="inherit"
                            size={18}
                            sx={{ mr: 1 }}
                          />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Autocomplete
              size="small"
              options={unitOptions}
              value={selectedUnit}
              loading={isOptionsLoading}
              loadingText="Loading options..."
              onChange={(_, newValue) => {
                setSelectedUnit(newValue || "All");
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              disableClearable
              sx={{
                minWidth: { xs: "100%", sm: 100 },
                "& .MuiOutlinedInput-root": {
                  height: 35,
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Unit"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {isOptionsLoading ? (
                          <CircularProgress
                            color="inherit"
                            size={18}
                            sx={{ mr: 1 }}
                          />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <SearchField
              onChange={handleSearchChange}
              size="small"
              placeholder="Search with ID"
              height={35}
            />
          </Stack>
        }
        content={
          <DataGridTable
            onPaginationModelChange={setPaginationModel}
            paginationModel={paginationModel}
            column={columns}
            rows={submissionsData || []}
            isLoading={isLoadingSubmissionsData}
            totalRows={totalSubmissions || 0}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
          />
        }
      />
    </Box>
  );
};
export default Files;
