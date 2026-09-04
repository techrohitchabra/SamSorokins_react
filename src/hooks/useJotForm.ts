import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import useAuth from "./useAuth";

import { useQuery } from "@tanstack/react-query";

export default function useJotForm(
  formId?: string,
  submissionId?: string,
  search?: string,
  paginationModel?: GridPaginationModel,
  sortModel?: GridSortModel,
  status?: string,
  propertyName?: string,
  unitName?: string
  // isAddDetailsPage?: boolean
) {
  const { request } = useAuth();

  // Fetch form data by submission ID from jotform
  const {
    data: jotFormData,
    isPending: isLoadingJotFormData,
    refetch: refetchJotFormDataId,
  } = useQuery({
    queryKey: ["/jotformData", submissionId],
    queryFn: async () => {
      const response = await request.get(`/jotformData/${submissionId}`);

      return response.data;
    },
    enabled: !!submissionId && !!formId,
  });

  // Fetch form data by submission ID from jotform
  const {
    data: filesBySubmissionId,
    isPending: isLoadingFilesBySubmissionId,
    refetch: refetchFilesBySubmissionId,
  } = useQuery({
    queryKey: [
      "/files/submissionId",
      submissionId,
      search,
      paginationModel,
      sortModel,
    ],
    queryFn: async () => {
      const response = await request.get(
        `/files/submissionId/${submissionId}`,
        {
          params: {
            search,
            page: paginationModel?.page,
            pageSize: paginationModel?.pageSize,
            sortField: sortModel?.[0]?.field,
            sortOrder: sortModel?.[0]?.sort,
          },
        }
      );

      return response?.data;
    },
    enabled: !!submissionId,
  });

  // Fetch uploaded files for admin
  const {
    data: submissionsData,
    isPending: isLoadingSubmissionsData,
    refetch: refetchSubmissionsData,
  } = useQuery({
    queryKey: [
      "/submissionsData",
      search,
      paginationModel,
      sortModel,
      status,
      propertyName,
      unitName,
    ],
    queryFn: async () => {
      const response = await request.get(`/submissionsData`, {
        params: {
          search,
          status,
          propertyName: propertyName === "All" ? "" : propertyName,
          unitName: unitName === "All" ? "" : unitName,
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
    jotFormData,
    isLoadingJotFormData,
    refetchJotFormDataId,

    filesBySubmissionId: filesBySubmissionId?.files,
    totalFiles: filesBySubmissionId?.totalFiles,
    isLoadingFilesBySubmissionId,
    refetchFilesBySubmissionId,

    submissionsData: submissionsData?.submissions,
    totalSubmissions: submissionsData?.total,
    isLoadingSubmissionsData,
    refetchSubmissionsData,
  };
}

export function useSubmissionFilterOptions(selectedProperty?: string) {
  const { request } = useAuth();

  return useQuery({
    queryKey: ["/submissionsData/options", selectedProperty],
    queryFn: async () => {
      const response = await request.get("/submissionsData/options", {
        params: {
          propertyName: selectedProperty === "All" ? "" : selectedProperty,
        },
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDuplicateSubmissions(
  page = 0,
  pageSize = 8,
  enabled = true
) {
  const { request } = useAuth();

  return useQuery({
    queryKey: ["/submissionsData/duplicates", page, pageSize],
    queryFn: async () => {
      const response = await request.get("/submissionsData/duplicates", {
        params: { page, pageSize },
      });
      return response.data;
    },
    enabled,
  });
}

export function useResolvedDuplicateSubmissions(
  page = 0,
  pageSize = 8,
  enabled = true
) {
  const { request } = useAuth();

  return useQuery({
    queryKey: ["/submissionsData/resolved-duplicates", page, pageSize],
    queryFn: async () => {
      const response = await request.get(
        "/submissionsData/resolved-duplicates",
        {
          params: { page, pageSize },
        }
      );
      return response.data;
    },
    enabled,
  });
}
