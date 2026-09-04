import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";

export default function useUniqueId(uniqueId?: string) {
  const { request } = useAuth();

  const {
    data,
    isPending: isLoading,
    error,
  } = useQuery({
    queryKey: ["/jotformData/uniqueId", uniqueId],
    queryFn: async () => {
      const response = await request.get(`/jotformData/uniqueId/${uniqueId}`);
      return response.data;
    },
    enabled: !!uniqueId,
    retry: false, // You may adjust the retry behavior based on requirements
  });

  return {
    submissionDataByUniqueId: data,
    isLoading,
    error,
  };
}
