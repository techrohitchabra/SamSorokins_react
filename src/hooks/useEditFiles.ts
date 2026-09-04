import useAuth from "./useAuth";

import { useQuery, useMutation } from "@tanstack/react-query";

export default function useEditFiles(submissionId?: string, fileId?: string) {
  const { request } = useAuth();

  // Fetch form data by submission ID from jotform
  const {
    data: filesWithFormData,
    isPending: isLoadingfilesWithFormData,
    refetch: refetchfilesWithFormData,
  } = useQuery({
    queryKey: ["/files/formData/", submissionId],
    queryFn: async () => {
      const response = await request.get(`/files/formData/${submissionId}`);

      return response.data;
    },
    enabled: !!submissionId,
  });

  // Delete file mutation — reacts to fileId changes
  const { mutateAsync: deleteFile, isPending: isDeletingFile } = useMutation({
    mutationKey: ["/upload/deleteFile/", fileId],
    mutationFn: async (idOverride?: string) => {
      const id = idOverride || fileId;
      const response = await request.delete(`/upload/deleteFile/${id}`);
      return response.data;
    },
    onSuccess: refetchfilesWithFormData,
  });

  return {
    filesWithFormData,
    isLoadingfilesWithFormData,
    refetchfilesWithFormData,

    //delete file by id
    deleteFile,
    isDeletingFile,
  };
}
