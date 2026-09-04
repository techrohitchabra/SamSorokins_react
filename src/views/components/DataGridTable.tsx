import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid/DataGrid";
import type { GridPaginationModel } from "@mui/x-data-grid";

import NoResultFound from "./NoResultFound";
import TableSkeleton from "./skeleton/TableSkeleton";

type Props = {
  column: any[];
  rows: any[];
  checkboxSelection?: boolean;
  isLoading?: boolean;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: any;
  totalRows?: number;
  pageSizeOptions?: any[];
  sortModel?: any;
  onSortModelChange?: any;
  paginationMode?: "server" | "client";
  sortingMode?: "server" | "client";
  height?: string;
};

function DataGridTable({
  column,
  rows,
  checkboxSelection = false,
  isLoading,
  paginationModel,
  onPaginationModelChange,
  totalRows,
  pageSizeOptions = [12, 20, 50, 100],
  sortModel,
  onSortModelChange,
  paginationMode = "server",
  sortingMode = "server",
  height = "220px",
}: Props) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  const isSmallScreen =
    typeof window !== "undefined" && window.innerWidth < 1420;
  const headerHeight = isSmallScreen ? 28 : 30;
  const rowHeight = isSmallScreen ? 40 : 42;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {rows?.length > 0 ? (
        <DataGrid
          columnHeaderHeight={headerHeight}
          rowHeight={rowHeight}
          getRowId={(row) => row?._id || row?.id}
          rows={rows}
          columns={column}
          className="tableWidth"
          paginationMode={paginationMode}
          sortingMode={sortingMode}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          checkboxSelection={checkboxSelection}
          pageSizeOptions={pageSizeOptions}
          rowCount={paginationMode === "server" ? totalRows : undefined}
          disableColumnMenu
          disableRowSelectionOnClick
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          slotProps={{
            cell: {
              style: {
                outline: "none",
                boxShadow: "none",
              },
            },
            columnHeaders: {
              style: {
                outline: "none",
                boxShadow: "none",
              },
            },
          }}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          sx={{
            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeaderTitleContainer":
              {
                outline: "none !important",
                boxShadow: "none !important",
              },
            "& .MuiDataGrid-cell, & .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within":
              {
                outline: "none !important",
                boxShadow: "none !important",
              },
            "& .MuiDataGrid-main": {
              overflow: "hidden",
            },
            "& .MuiDataGrid-virtualScroller": {
              overflowY: "auto !important",
              overflowX: "auto !important",
              maxHeight: `calc(100vh - ${height})`,
            },
            "& .MuiDataGrid-cell": {
              border: "none",
              display: "flex",
              alignItems: "center",
              fontSize: isSmallScreen ? "13px" : "14px",
              color: "#364152",
              fontWeight: 400,
              fontFamily: "'Poppins', sans-serif",
            },
            "& .even": {
              backgroundColor: "#F3F6FE",
            },
            "& .odd": {
              backgroundColor: "#ffffff",
            },
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              fontSize: isSmallScreen ? "14px" : "15px",
              color: "#364152",
              fontWeight: 600,
              fontFamily: "'Noto Sans Arabic', sans-serif",
              alignItems: "center",
              marginTop: "-5px",
            },
            "& .MuiDataGrid-footerContainer": {
              minHeight: "40px !important",
              height: "40px !important",
              borderTop: "1px solid #E5E7EB",
              backgroundColor: "#ffffff",
              position: "relative",
              zIndex: 10,
              overflow: "hidden",
            },
            "& .MuiTablePagination-toolbar": {
              minHeight: "40px !important",
              height: "40px !important",
              margin: "0 !important",
            },
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                margin: "0 !important",
              },
            "& ::-webkit-scrollbar": {
              width: "6px",
              height: "6px",
            },
            "& ::-webkit-scrollbar-button": {
              display: "none !important",
              width: "0px !important",
              height: "0px !important",
            },
            "& ::-webkit-scrollbar-thumb": {
              backgroundColor: "#8080809c",
              borderRadius: "4px",
            },
            "& ::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#94a3b8",
            },
            "& ::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
            border: "none",
            "--DataGrid-rowBorderColor": "none",
          }}
        />
      ) : (
        <Box sx={{ m: 2 }}>
          <NoResultFound>No data found!</NoResultFound>
        </Box>
      )}
    </Box>
  );
}

export default DataGridTable;
