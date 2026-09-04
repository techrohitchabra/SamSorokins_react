import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import KeyIcon from "@mui/icons-material/Key";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { useModal } from "mui-modal-provider";
import { useCallback, useEffect, useMemo, useState } from "react";

import useKeyManagement, {
  type KeyData,
} from "../../../hooks/useKeyManagement";

// Import modular dialog & table components
import DataGridTable from "../../components/DataGridTable";
import MainCard from "../../components/MainCard";
import CheckoutKeyDialog from "./components/CheckoutKeyDialog";
import DeleteKeyDialog from "./components/DeleteKeyDialog";
import EditKeyDialog from "./components/EditKeyDialog";
import KeyDetailsDialog from "./components/KeyDetailsDialog";

const KeyManagement = () => {
  const { showModal } = useModal();

  // Search and filter states - Default statusFilter is "All" to show all keys
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 12,
  });

  // Debounce search input to avoid API request on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Hook usage
  const {
    keys,
    totalKeys,
    statusCounts: apiStatusCounts,
    properties,
    loadingKeys,
    // refetchKeys,
    checkOutKey,
    updateKey,
    deleteKey,
    fetchRMVendors,
    fetchRMUsers,
    fetchRMProperties,
    fetchRMUnits,
  } = useKeyManagement(debouncedSearchTerm, statusFilter, paginationModel);

  // 1. Check Out Key Modal Caller
  const handleCheckoutOpen = useCallback(() => {
    const modal = showModal(CheckoutKeyDialog, {
      properties,
      onCheckout: checkOutKey,
      checkoutPending: loadingKeys,
      fetchRMVendors,
      fetchRMUsers,
      fetchRMProperties,
      fetchRMUnits,
      onClose: () => {
        modal.hide();
      },
    });
  }, [
    showModal,
    properties,
    checkOutKey,
    loadingKeys,
    fetchRMVendors,
    fetchRMUsers,
    fetchRMProperties,
    fetchRMUnits,
  ]);

  // 2. Edit Key Modal Caller
  const handleEditOpen = useCallback(
    (row: KeyData) => {
      const modal = showModal(EditKeyDialog, {
        keyData: row,
        updatePending: loadingKeys,
        onUpdate: async (
          id: string,
          payload: {
            vendor?: string;
            rfId?: string;
            status?: string;
            lostReason?: string;
          }
        ) => {
          const updated = await updateKey(id, payload);
          if (updated) {
            modal.hide();
          }
        },
        onClose: () => {
          modal.hide();
        },
      });
    },
    [showModal, updateKey, loadingKeys]
  );

  // 3. View Key Details Modal Caller
  const handleDetailsOpen = useCallback(
    (row: KeyData) => {
      const modal = showModal(KeyDetailsDialog, {
        keyData: row,
        onClose: () => {
          modal.hide();
        },
      });
    },
    [showModal]
  );

  // 4. Delete Key Modal Caller (Soft Delete Confirmation)
  const handleDeleteOpen = useCallback(
    (row: KeyData) => {
      const modal = showModal(DeleteKeyDialog, {
        keyData: row,
        deletePending: loadingKeys,
        onDelete: async (id: string) => {
          const result = await deleteKey(id);
          if (result) {
            modal.hide();
          }
        },
        onClose: () => {
          modal.hide();
        },
      });
    },
    [showModal, deleteKey, loadingKeys]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Checked Out":
      case "Key Checked Out":
        return {
          bg: "#fff7ed",
          text: "#c2410c",
          border: "#ffedd5",
          dot: "#f97316",
        };
      case "Checked In":
      case "Returned / Checked In":
        // case "Key Checked In":
        return {
          bg: "#f0fdf4",
          text: "#15803d",
          border: "#dcfce7",
          dot: "#22c55e",
        };
      case "Outstanding":
      case "To Be Returned":
        // case "Key To Be Returned":
        return {
          bg: "#faf5ff",
          text: "#7e22ce",
          border: "#f3e8ff",
          dot: "#a855f7",
        };
      case "Requested":
        // case "Key Requested":
        return {
          bg: "#f0f9ff",
          text: "#0369a1",
          border: "#bae6fd",
          dot: "#0284c7",
        };
      case "Checked Out Permanently":
        return {
          bg: "#f8fafc",
          text: "#334155",
          border: "#e2e8f0",
          dot: "#64748b",
        };
      case "Lost":
        return {
          bg: "#fef2f2",
          text: "#b91c1c",
          border: "#fee2e2",
          dot: "#ef4444",
        };
      default:
        return {
          bg: "#f8fafc",
          text: "#475569",
          border: "#e2e8f0",
          dot: "#94a3b8",
        };
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 130,
        flex: 0.9,
        sortable: false,
        renderCell: (params) => (
          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title="View Details" arrow placement="top">
              <IconButton
                size="small"
                onClick={() => handleDetailsOpen(params.row)}
                sx={{
                  color: "#0284c7",
                  bgcolor: "rgba(2, 132, 199, 0.08)",
                  "&:hover": { bgcolor: "rgba(2, 132, 199, 0.18)" },
                  transition: "all 0.2s",
                  p: 0.6,
                }}
              >
                <InfoIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit Status" arrow placement="top">
              <IconButton
                size="small"
                onClick={() => handleEditOpen(params.row)}
                sx={{
                  color: "#d97706",
                  bgcolor: "rgba(217, 119, 6, 0.08)",
                  "&:hover": { bgcolor: "rgba(217, 119, 6, 0.18)" },
                  transition: "all 0.2s",
                  p: 0.6,
                }}
              >
                <EditIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Key Request" arrow placement="top">
              <IconButton
                size="small"
                onClick={() => handleDeleteOpen(params.row)}
                sx={{
                  color: "#dc2626",
                  bgcolor: "rgba(220, 38, 38, 0.08)",
                  "&:hover": { bgcolor: "rgba(220, 38, 38, 0.18)" },
                  transition: "all 0.2s",
                  p: 0.6,
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 160,
        flex: 1.1,
        sortable: true,
        renderCell: (params) => {
          const style = getStatusColor(params.value);
          const isLost = params.row.status === "Lost";
          const lostReason = params.row.lostReason;

          return (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              sx={{ width: "100%", py: 0.25 }}
            >
              <Chip
                label={
                  <Box display="flex" alignItems="center" gap={0.75}>
                    <Box
                      component="span"
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: style.dot,
                        boxShadow: `0 0 0 2px ${style.border}`,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: style.text,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        letterSpacing: "0.1px",
                      }}
                    >
                      {params.value || "Unknown"}
                    </Typography>
                  </Box>
                }
                size="small"
                sx={{
                  height: 24,
                  width: "fit-content",
                  maxWidth: 155,
                  bgcolor: style.bg,
                  border: `1px solid ${style.border}`,
                  borderRadius: "12px",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  px: 0.5,
                  "& .MuiChip-label": {
                    px: 0.5,
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              />
              {isLost && lostReason && (
                <Tooltip title={`Reason: ${lostReason}`} arrow placement="top">
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#dc2626",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                      mt: 0.2,
                      lineHeight: 1.2,
                    }}
                  >
                    Reason: {lostReason}
                  </Typography>
                </Tooltip>
              )}
            </Box>
          );
        },
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "vendor",
        headerName: "Vendor / Requester",
        minWidth: 170,
        flex: 1.2,
        sortable: true,
        renderCell: (params) => {
          const isKeysForOther =
            (params.row.areKeysForYou || "").toLowerCase() === "no";
          const pickerName = params.row.whoWillPickUp;
          const mainName =
            isKeysForOther && pickerName
              ? pickerName
              : params.row.vendor || params.row.whoHasIt || "-";

          return (
            <Box display="flex" flexDirection="column" justifyContent="center">
              <Tooltip title={mainName || ""} arrow placement="top">
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 650, color: "#1e293b" }}
                >
                  {mainName}
                </Typography>
              </Tooltip>
              {isKeysForOther && (
                <Tooltip
                  title={params.row.vendor || "N/A"}
                  arrow
                  placement="top"
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#7c3aed",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                    }}
                  >
                    Picker (Req: {params.row.vendor || "N/A"})
                  </Typography>
                </Tooltip>
              )}
            </Box>
          );
        },
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "requestType",
        headerName: "User Type",
        minWidth: 120,
        flex: 0.9,
        sortable: true,
        renderCell: (params) => {
          const typeVal = params.value || params.row.userType || "Vendor";
          const isNonVendor = typeVal === "Non-Vendor";
          return (
            <Chip
              label={typeVal}
              size="small"
              sx={{
                height: 22,
                px: 0.5,
                fontSize: "0.72rem",
                fontWeight: 700,
                bgcolor: isNonVendor ? "#fef3c7" : "#dcfce7",
                color: isNonVendor ? "#b45309" : "#15803d",
                border: `1px solid ${isNonVendor ? "#fde68a" : "#bbf7d0"}`,
                borderRadius: "12px",
              }}
            />
          );
        },
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "serviceIssue",
        headerName: "Service Issue #",
        minWidth: 130,
        flex: 1,
        sortable: true,
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{ color: "#64748b", fontWeight: 600 }}
          >
            {params.row.serviceIssue || params.row.serviceRequest || "-"}
          </Typography>
        ),
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "property",
        headerName: "Property",
        minWidth: 180,
        flex: 1,
        sortable: true,
        renderCell: (params) => {
          const propName =
            params.row.property || params.row.communityCode || "-";
          const unitName = params.row.unit;
          return (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Chip
                label={propName}
                size="small"
                sx={{
                  fontWeight: 650,
                  bgcolor: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "12px",
                }}
              />
              {unitName && (
                <Chip
                  label={`${unitName}`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.68rem",
                    height: 20,
                    bgcolor: "#e0f2fe",
                    color: "#0369a1",
                    border: "1px solid #bae6fd",
                    borderRadius: "10px",
                  }}
                />
              )}
            </Box>
          );
        },
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "rfId",
        headerName: "RFID",
        minWidth: 120,
        flex: 1,
        sortable: true,
        renderCell: (params) => {
          const rfidVal =
            params.row.rfId || params.row.rfid || params.row.frId || "-";
          return (
            <Typography
              variant="body2"
              sx={{ color: "#334155", fontWeight: 600 }}
            >
              {rfidVal}
            </Typography>
          );
        },
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "keysNeeded",
        headerName: "Keys Needed",
        minWidth: 150,
        flex: 1.2,
        sortable: true,
        renderCell: (params) => (
          <Tooltip title={params.row.keysNeeded || ""} arrow placement="top">
            <Typography
              variant="body2"
              sx={{
                color: "#334155",
                fontWeight: 500,
                maxWidth: 140,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {params.row.keysNeeded || "-"}
            </Typography>
          </Tooltip>
        ),
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "pickUpDateTime",
        headerName: "Pick Up Date",
        minWidth: 160,
        flex: 1.2,
        sortable: true,
        renderCell: (params) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 650, color: "#2563eb" }}
          >
            {params.row.pickUpDateTime || "-"}
          </Typography>
        ),
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "byWhen",
        headerName: "By When",
        minWidth: 110,
        flex: 0.9,
        sortable: true,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "#475569" }}>
            {params.row.byWhen || "-"}
          </Typography>
        ),
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
      {
        field: "createdAt",
        headerName: "Created At",
        minWidth: 150,
        flex: 1.1,
        sortable: true,
        renderCell: (params) => (
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            {new Date(params.value).toLocaleString()}
          </Typography>
        ),
        renderHeader: (params: any) => params?.colDef?.headerName,
      },
    ],
    [handleDetailsOpen, handleEditOpen, handleDeleteOpen]
  );

  // Status counts returned directly from API
  const statusCounts = apiStatusCounts || {
    all: 0,
    requested: 0,
    checkedOut: 0,
    permanently: 0,
    toBeReturned: 0,
    checkedIn: 0,
    lost: 0,
  };

  // Chip configurations with distinct visual identity and filter values
  const statusChips = useMemo(
    () => [
      {
        label: "All",
        filterValue: "All",
        count: statusCounts.all,
        color: {
          activeBg: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          activeText: "#ffffff",
          activeBorder: "#1d4ed8",
          activeShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
          inactiveBg: "#f8fafc",
          inactiveText: "#475569",
          inactiveBorder: "#cbd5e1",
          dot: "#3b82f6",
        },
      },
      {
        label: "Requested",
        filterValue: "Requested",
        count: statusCounts.requested,
        color: {
          activeBg: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
          activeText: "#ffffff",
          activeBorder: "#0369a1",
          activeShadow: "0 4px 14px rgba(2, 132, 199, 0.35)",
          inactiveBg: "#f0f9ff",
          inactiveText: "#0369a1",
          inactiveBorder: "#bae6fd",
          dot: "#0284c7",
        },
      },
      {
        label: "Checked Out",
        filterValue: "Checked Out",
        count: statusCounts.checkedOut,
        color: {
          activeBg: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
          activeText: "#ffffff",
          activeBorder: "#c2410c",
          activeShadow: "0 4px 14px rgba(234, 88, 12, 0.35)",
          inactiveBg: "#fff7ed",
          inactiveText: "#c2410c",
          inactiveBorder: "#ffedd5",
          dot: "#f97316",
        },
      },
      {
        label: "Checked Out Permanently",
        filterValue: "Checked Out Permanently",
        count: statusCounts.permanently,
        color: {
          activeBg: "linear-gradient(135deg, #475569 0%, #334155 100%)",
          activeText: "#ffffff",
          activeBorder: "#334155",
          activeShadow: "0 4px 14px rgba(71, 85, 105, 0.35)",
          inactiveBg: "#f8fafc",
          inactiveText: "#334155",
          inactiveBorder: "#e2e8f0",
          dot: "#64748b",
        },
      },
      {
        label: "To Be Returned",
        filterValue: "To Be Returned",
        count: statusCounts.toBeReturned,
        color: {
          activeBg: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)",
          activeText: "#ffffff",
          activeBorder: "#7e22ce",
          activeShadow: "0 4px 14px rgba(147, 51, 234, 0.35)",
          inactiveBg: "#faf5ff",
          inactiveText: "#7e22ce",
          inactiveBorder: "#f3e8ff",
          dot: "#a855f7",
        },
      },
      {
        label: "Checked In",
        filterValue: "Checked In",
        count: statusCounts.checkedIn,
        color: {
          activeBg: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          activeText: "#ffffff",
          activeBorder: "#15803d",
          activeShadow: "0 4px 14px rgba(22, 163, 74, 0.35)",
          inactiveBg: "#f0fdf4",
          inactiveText: "#15803d",
          inactiveBorder: "#dcfce7",
          dot: "#22c55e",
        },
      },
      {
        label: "Lost",
        filterValue: "Lost",
        count: statusCounts.lost,
        color: {
          activeBg: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
          activeText: "#ffffff",
          activeBorder: "#b91c1c",
          activeShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
          inactiveBg: "#fef2f2",
          inactiveText: "#b91c1c",
          inactiveBorder: "#fee2e2",
          dot: "#ef4444",
        },
      },
    ],
    [statusCounts]
  );

  // Reset pagination to page 0 whenever search term or status filter changes
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [searchTerm, statusFilter]);

  return (
    <Box sx={{ p: 0.5 }}>
      {/* 1. PREMIUM HEADER HERO CARD */}
      <Card
        sx={{
          mb: 1,
          background:
            "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%)",
          color: "#ffffff",
          borderRadius: 2.5,
          boxShadow: "0 6px 20px -5px rgba(59, 130, 246, 0.2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: "-35%",
            right: "-10%",
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.08)",
            filter: "blur(40px)",
          }}
        />
        <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    width: 38,
                    height: 38,
                  }}
                >
                  <KeyIcon sx={{ fontSize: 20, color: "#fff" }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      fontSize: "1.25rem",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Key Vault System
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid
              size={{ xs: 12, md: 7 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "flex-start", md: "flex-end" },
                gap: 1.5,
              }}
            >
              {/* Search input field in front of Log Key Checkout */}
              <TextField
                size="small"
                placeholder="Search keys..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      fontSize="small"
                      sx={{ color: "#64748b", mr: 0.75 }}
                    />
                  ),
                  sx: {
                    borderRadius: 2,
                    bgcolor: "#ffffff",
                    color: "#0f172a",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    width: { xs: "100%", sm: 240 },
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                    "& fieldset": {
                      borderColor: "#cbd5e1",
                    },
                    "&:hover fieldset": {
                      borderColor: "#94a3b8 !important",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563eb !important",
                      borderWidth: "2px",
                    },
                    "& input::placeholder": {
                      color: "#64748b",
                      opacity: 1,
                    },
                    "& input": {
                      color: "#0f172a",
                    },
                    transition: "all 0.2s",
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleCheckoutOpen}
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#2563eb",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.75,
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.95)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s",
                }}
              >
                Key Request
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 2. ATTRACTIVE & FUNCTIONAL STATUS CHIPS FILTER BAR */}
      <Box
        sx={{
          mb: 1.5,
          p: 1,
          bgcolor: "#ffffff",
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            overflowX: "auto",
            py: 0.5,
            px: 0.2,
            "&::-webkit-scrollbar": { height: 5 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#cbd5e1",
              borderRadius: 3,
            },
          }}
        >
          {statusChips.map((chip) => {
            const isSelected =
              statusFilter === chip.filterValue ||
              (chip.filterValue === "Requested" &&
                statusFilter === "Requested") ||
              (chip.filterValue === "To Be Returned" &&
                (statusFilter === "To Be Returned" ||
                  statusFilter === "Outstanding")) ||
              (chip.filterValue === "Checked Out" &&
                (statusFilter === "Checked Out" ||
                  statusFilter === "Key Checked Out")) ||
              (chip.filterValue === "Checked In" &&
                statusFilter === "Checked In");

            return (
              <Box
                key={chip.label}
                onClick={() => setStatusFilter(chip.filterValue)}
                sx={{
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  border: `1.5px solid ${
                    isSelected
                      ? chip.color.activeBorder
                      : chip.color.inactiveBorder
                  }`,
                  background: isSelected
                    ? chip.color.activeBg
                    : chip.color.inactiveBg,
                  boxShadow: isSelected
                    ? chip.color.activeShadow
                    : "0 1px 2px rgba(0,0,0,0.02)",
                  px: 0.5,
                  py: 0.4,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  userSelect: "none",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: isSelected
                      ? chip.color.activeShadow
                      : "0 4px 12px rgba(0, 0, 0, 0.08)",
                  },
                }}
              >
                {/* Status Dot Indicator */}
                <Box
                // sx={{
                //   width: 8,
                //   height: 8,
                //   borderRadius: "50%",
                //   bgcolor: isSelected ? "#ffffff" : chip.color.dot,
                //   boxShadow: isSelected
                //     ? "0 0 0 2px rgba(255,255,255,0.4)"
                //     : `0 0 0 2px ${chip.color.inactiveBorder}`,
                //   flexShrink: 0,
                //   transition: "all 0.2s",
                // }}
                />

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isSelected ? 700 : 600,
                    color: isSelected
                      ? chip.color.activeText
                      : chip.color.inactiveText,
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.1px",
                  }}
                >
                  {chip.label}
                </Typography>

                {/* Count Badge */}
                <Box
                  sx={{
                    height: 20,
                    minWidth: 22,
                    px: 0.75,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    bgcolor: isSelected
                      ? "rgba(255, 255, 255, 0.25)"
                      : chip.color.dot,
                    color: "#ffffff",
                    backdropFilter: isSelected ? "blur(4px)" : "none",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    lineHeight: 1,
                  }}
                >
                  {chip.count}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 3. PAGINATED DATAGRID TABLE */}
      <MainCard
        content={
          <DataGridTable
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            paginationModel={paginationModel}
            column={columns}
            rows={keys}
            isLoading={loadingKeys}
            totalRows={totalKeys}
            pageSizeOptions={[12, 20, 50, 100]}
            height="300px"
          />
        }
      />
    </Box>
  );
};

export default KeyManagement;
