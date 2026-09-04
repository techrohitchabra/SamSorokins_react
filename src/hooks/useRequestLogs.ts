import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import useAuth from "./useAuth";
import { useQuery } from "@tanstack/react-query";

export default function useRequestLogs(
  search?: string,
  paginationModel?: GridPaginationModel,
  sortModel?: GridSortModel
) {
  const { request } = useAuth();

  const {
    data: logsData,
    isPending: isLoadingLogs,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["/requestLogs", search, paginationModel, sortModel],
    queryFn: async () => {
      const response = await request.get(`/requestLogs`, {
        params: {
          search,
          page: paginationModel?.page,
          pageSize: paginationModel?.pageSize,
          sortField: sortModel?.[0]?.field,
          sortOrder: sortModel?.[0]?.sort,
        },
      });
      return response?.data;
    },
  });

  return {
    logs: logsData?.logs || [],
    totalLogs: logsData?.total || 0,
    isLoadingLogs,
    refetchLogs,
  };
}
