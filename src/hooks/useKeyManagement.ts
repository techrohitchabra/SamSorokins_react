import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GridPaginationModel } from "@mui/x-data-grid";
import useAuth from "./useAuth";
import { useSnackbarHelper } from "../views/components/snackbar";

export interface KeyData {
  _id: string;
  vendor: string;
  rfId?: string;
  phoneNumber?: string;
  email?: string;
  repairsEmail?: string;
  property: string;
  unit?: string;
  serviceIssue?: string;
  fullAddress?: string;
  pickUpDateTime?: string;
  byWhen?: string;
  keysNeeded?: string;
  status: string;
  lostReason?: string;
  source?: string;
  accessLog: string[];
  rawData: any;
  createdAt: string;
  details?: MergedDetails;
}

export interface MergedDetails {
  property: {
    ppdShortName: string;
    address: string;
    city: string;
    fullAddress: string;
    portfolioManager: string;
    portfolioManagerEmail: string;
    siteManager: string;
    siteManagerPhone: string;
    siteManagerEmail: string;
    turnoverCoordinator: string;
    turnoverCoordinatorPhone: string;
    turnoverCoordinatorEmail: string;
    turnoverContractorCompany: string;
    turnoverContractor: string;
    turnoverContractorPhone: string;
    turnoverContractorEmail: string;
  };
}

export type CreateKeyPayload = {
  userType?: string;
  vendor: string;
  phoneNumber?: string;
  email?: string;
  repairsEmail?: string;
  property: string;
  unit?: string;
  serviceIssue?: string;
  fullAddress?: string;
  pickUpDateTime?: string;
  byWhen?: string;
  keysNeeded?: string;
  status?: string;
  lostReason?: string;
  purpose?: string;
  purposeDescription?: string;
  areKeysForYou?: string;
  whoWillPickUp?: string;
  pickerPhoneNumber?: string;
  pickerEmail?: string;
  willBeReturned?: string;
  whyNotReturned?: string;
};

export type UpdateKeyPayload = {
  vendor?: string;
  rfId?: string;
  status?: string;
  lostReason?: string;
};

/**
 * Custom hook for managing key requests using React Query mutations & queries.
 * @hook useKeyManagement
 */
export const useKeyManagement = (
  search?: string,
  status?: string,
  paginationModel?: GridPaginationModel
) => {
  const { request } = useAuth();
  const showSnackbar = useSnackbarHelper();
  const queryClient = useQueryClient();

  // 1. Fetch keys & properties query
  const {
    data: keysData,
    isPending,
    isFetching,
    refetch: refetchKeys,
  } = useQuery({
    queryKey: [
      "keys",
      search,
      status,
      paginationModel?.page,
      paginationModel?.pageSize,
    ],
    queryFn: async () => {
      const response = await request.get("/keys", {
        params: {
          search: search || undefined,
          status: status && status !== "All" ? status : undefined,
          page: paginationModel?.page ?? 0,
          pageSize: paginationModel?.pageSize ?? 12,
        },
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const loadingKeys = isPending || isFetching;

  // Rent Manager API helpers
  const fetchRMVendors = async () => {
    try {
      const response = await request.get("/rentManager/vendors");
      return response.data?.vendors || [];
    } catch (e) {
      console.warn("Failed to fetch RM Vendors:", e);
      return [];
    }
  };

  const fetchRMUsers = async () => {
    try {
      const response = await request.get("/rentManager/users");
      return response.data?.users || [];
    } catch (e) {
      console.warn("Failed to fetch RM Users:", e);
      return [];
    }
  };

  const fetchRMProperties = async () => {
    try {
      const response = await request.get("/rentManager/properties");
      return response.data?.properties || [];
    } catch (e) {
      console.warn("Failed to fetch RM Properties:", e);
      return [];
    }
  };

  const fetchRMUnits = async (propertyId: string | number) => {
    if (!propertyId) return [];
    try {
      const response = await request.get("/rentManager/units", {
        params: { propertyId },
      });
      return response.data?.units || [];
    } catch (e) {
      console.warn("Failed to fetch RM Units:", e);
      return [];
    }
  };

  // 2. Create / Checkout Key Request mutation
  const { mutateAsync: checkOutKey, isPending: isCheckingOut } = useMutation({
    mutationKey: ["checkOutKey"],
    mutationFn: async (payload: CreateKeyPayload) => {
      const response = await request.post("/keys/checkout", payload);
      return response.data;
    },
    onSuccess: () => {
      showSnackbar("Key request created successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
    onError: (err: any) => {
      const message =
        err.response?.data?.message || "Failed to create key request.";
      showSnackbar(message, "error");
    },
  });

  // 3. Update Key Request mutation
  const { mutateAsync: updateKeyMutation, isPending: isUpdatingKey } =
    useMutation({
      mutationKey: ["updateKey"],
      mutationFn: async ({
        id,
        payload,
      }: {
        id: string;
        payload: UpdateKeyPayload;
      }) => {
        const response = await request.put(`/keys/${id}`, payload);
        return response.data;
      },
      onSuccess: () => {
        showSnackbar("Key request updated successfully!", "success");
        queryClient.invalidateQueries({ queryKey: ["keys"] });
      },
      onError: (err: any) => {
        const message =
          err.response?.data?.message || "Failed to update key request.";
        showSnackbar(message, "error");
      },
    });

  const updateKey = async (
    idOrPayload: string | { id: string; payload: UpdateKeyPayload },
    maybePayload?: UpdateKeyPayload
  ) => {
    if (typeof idOrPayload === "string") {
      return await updateKeyMutation({
        id: idOrPayload,
        payload: maybePayload!,
      });
    }
    return await updateKeyMutation(idOrPayload);
  };

  // 4. Return Key Request mutation
  const { mutateAsync: returnKey, isPending: isReturningKey } = useMutation({
    mutationKey: ["returnKey"],
    mutationFn: async (id: string) => {
      const response = await request.post(`/keys/${id}/return`);
      return response.data;
    },
    onSuccess: () => {
      showSnackbar("Key returned successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["keys"] });
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || "Failed to return key.";
      showSnackbar(message, "error");
    },
  });

  // 5. Delete Key Request mutation (Soft Delete)
  const { mutateAsync: deleteKeyMutation, isPending: isDeletingKey } =
    useMutation({
      mutationKey: ["deleteKey"],
      mutationFn: async (id: string) => {
        const response = await request.delete(`/keys/${id}`);
        return response.data;
      },
      onSuccess: () => {
        showSnackbar("Key request deleted successfully!", "success");
        queryClient.invalidateQueries({ queryKey: ["keys"] });
      },
      onError: (err: any) => {
        const message =
          err.response?.data?.message || "Failed to delete key request.";
        showSnackbar(message, "error");
      },
    });

  const deleteKey = async (id: string) => {
    return await deleteKeyMutation(id);
  };

  return {
    keys: keysData?.keys || [],
    totalKeys: keysData?.total ?? 0,
    statusCounts: keysData?.statusCounts,
    properties: keysData?.properties || [],
    loadingKeys,
    refetchKeys,
    checkOutKey,
    isCheckingOut,
    updateKey,
    isUpdatingKey,
    returnKey,
    isReturningKey,
    deleteKey,
    isDeletingKey,
    fetchRMVendors,
    fetchRMUsers,
    fetchRMProperties,
    fetchRMUnits,
  };
};

export default useKeyManagement;
