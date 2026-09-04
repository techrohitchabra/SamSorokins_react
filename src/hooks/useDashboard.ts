import useAuth from "./useAuth";

import { useQuery } from "@tanstack/react-query";

export default function useDashboard() {
  const { request } = useAuth();

  // Fetch form data by submission ID from jotform
  const {
    data: dashboardData,
    isPending: isLoadingDashboardData,
    refetch: refetchDashboardData,
  } = useQuery({
    queryKey: ["/dashboard"],
    queryFn: async () => {
      const response = await request.get(`/dashboard`);

      return response?.data?.stats;
    },
  });

  return {
    dashboardData,
    isLoadingDashboardData,
    refetchDashboardData,
  };
}
