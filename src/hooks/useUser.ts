import type { GridPaginationModel, GridSortModel } from "@mui/x-data-grid";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser, logoutUser, setUserData } from "../redux/user/userSlice";
import useAuth from "./useAuth";

// // Type definitions for various payloads and responses
// type Login = {
//   email: string;
//   password: string;
//   isSocialAccount?: boolean;
// };

type VerifyOtp = {
  otp: string;
  email: string;
};

type User = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  password?: string;
  country?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  state?: string;
  role?: string;
  profileImg?: string;
  isActive?: boolean;
  canChangeEmail?: boolean;
  canChangeMobileNumber?: boolean;
  canChangePhoneNumber?: boolean;
  canChangePassword?: boolean;
  signatureName?: string;
  signatureTeam?: string;
  signatureTitle?: string;
  signatureCompany?: string;
  companyLogo?: any;
};

// type ProfileImage = {
//   profileImg: string;
//   signature: string;
// };

// type LoginResponse = {
//   email: string;
//   message: string;
//   token: string;
//   user?: any;
// };

type VerifyOtpResponse = {
  token: string;
  message: string;
  user: any;
};

/**
 *  Custom hook for managing user.
 * @hook useUser
 *
 */

export default function useUser(
  userId?: string,
  search?: string,
  paginationModel?: GridPaginationModel,
  sortModel?: GridSortModel,
  showDeletedUsers?: boolean,
  role?: string
) {
  const { request } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((state: any) => state.user);

  // refetch list of all users
  const handleRefetchUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  // refetch a single user's details
  const handleRefetchUser = () => {
    queryClient.invalidateQueries({ queryKey: ["user", userId] });
  };

  // User login mutation
  const { mutateAsync: userLogin, isPending: isLoggingIn } = useMutation({
    mutationKey: ["login"],
    mutationFn: async (payload: any) => {
      const response = await request.post("/auth", payload);
      return response.data as any;
    },
    onSuccess: (data) => {
      const verifyEmail = data?.email || "";

      navigate("/twoFactorAuthentication", {
        state: { email: verifyEmail },
      });
    },
  });

  // Verify OTP mutation
  const { mutateAsync: verifyOtp, isPending: isOtpVerifying } = useMutation({
    mutationKey: ["verifyOtp"],
    mutationFn: async (payload: VerifyOtp) => {
      const response = await request.post("/auth/verifyOtp", payload);
      return response.data as VerifyOtpResponse;
    },
    onSuccess: (data) => {
      localStorage.removeItem("verifyEmail");

      const token = data?.token || "";
      if (!token) return console.error("Token not found");

      const decoded: any = jwtDecode(token);
      const userId = decoded?.id;
      if (!userId) return console.error("User ID not found");

      dispatch(loginUser({ token, userId }));

      dispatch(
        setUserData({
          fullName: data.user?.fullName,
          role: data.user?.role,
          firstName: data.user?.firstName,
          lastName: data.user?.lastName,
          userId,
          // profileImg:data?.user?.profileImg
        })
      );

      const userRole = String(data.user?.role || "").toLowerCase();
      if (
        userRole === "receptionist"
        // ||
        // userId === "69bd177472681b58e9c964b9"
      ) {
        navigate("/key-management", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
  });

  // const logoutAPI = useMutation(() => request.post("/auth/logout"));

  // User logout mutation
  const { mutateAsync: userLogout, isPending: isLoggingOut } = useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      const response = await request.post("/auth/logout", { userId });
      return response.data;
    },
    onSuccess: () => {
      dispatch(logoutUser());
      localStorage.removeItem("persist:user");
      navigate("/login");
      // Handle logout success actions like clearing local storage, redirecting, etc.
    },
    onError: (error) => {
      dispatch(logoutUser());
      localStorage.removeItem("persist:user");
      navigate("/login");
      console.error("Logout error:", error);
      // Handle logout error, such as displaying an error message
    },
  });

  // Fetch users query
  const {
    data: usersData,
    isPending: isLoadingUsers,
    refetch: refetchUserData,
  } = useQuery({
    queryKey: [
      "users",
      { search, paginationModel, sortModel, showDeletedUsers, role },
    ],
    queryFn: async () => {
      const response = await request.get("/users", {
        params: {
          searchFields: "firstName,lastName,email,phoneNumber",
          searchValue: search,
          paginationModel,
          sortModel,
          isDeleted: showDeletedUsers ? 1 : 0,
          role,
        },
      });
      return response.data;
    },
    enabled: !!user,
  });

  // Fetch single user by ID
  const {
    data: userData,
    isPending: isLoadingUser,
    refetch: refetchUserDataId,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await request.get(`/users/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });

  // Add new user mutation
  const { mutateAsync: addUser, isPending: isAddingUser } = useMutation({
    mutationKey: ["addUser"],
    mutationFn: async (payload: User) => {
      const response = await request.post("/users/register", payload);
      return response.data;
    },
    onSuccess: () => {
      handleRefetchUsers();
    },
  });

  // Add new user mutation
  const { mutateAsync: registerUser, isPending: isRegisteringUser } =
    useMutation({
      mutationKey: ["registerUser"],
      mutationFn: async (payload: User) => {
        const response = await request.post("/registerUser", payload);
        return response.data;
      },
      onSuccess: () => {
        handleRefetchUsers();
        if (userId) navigate("/login");
      },
    });

  // Update user mutation
  const { mutateAsync: updateUser, isPending: isUpdatingUser } = useMutation({
    mutationKey: ["updateUser", userId],
    mutationFn: async (payload: User) => {
      const response = await request.put(`/users/${userId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      handleRefetchUsers();
      refetchUserDataId();
    },
  });

  // Restore deleted user mutation
  const { mutateAsync: restoreUser, isPending: isRestoreUserLoading } =
    useMutation({
      mutationKey: ["restoreUser", userId],
      mutationFn: async () => {
        const response = await request.put(`/users/${userId}/restore`);
        return response.data;
      },
      onSuccess: handleRefetchUsers,
    });

  const {
    mutateAsync: uploadProfileImage,
    isPending: isUploadingProfileImage,
  } = useMutation({
    mutationKey: ["uploadProfileImage", userId],
    mutationFn: async (formData: FormData) => {
      const response = await request.put(
        `/users/${userId}/profileImg`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      handleRefetchUsers();
      handleRefetchUser();
    },
  });

  // const { mutateAsync: fetchUrl, isPending: isFetchingUrl } = useMutation({
  //   mutationKey: ["uploadUserImage", userId],
  //   mutationFn: async (formData: FormData) => {
  //     const response = await request.post(
  //       `/uploadImage/user/${userId}/profilePicture`,
  //       formData
  //     );
  //     return response.data;
  //   },
  //   onSuccess: () => {
  //     handleRefetchUsers();
  //     handleRefetchUser();
  //   },
  // });

  // Delete user mutation
  const { mutateAsync: deleteUser, isPending: isDeletingUser } = useMutation({
    mutationKey: ["deleteUser", userId],
    mutationFn: async () => {
      const response = await request.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: handleRefetchUsers,
  });

  const { mutateAsync: changePassword, isPending: isChangingPassword } =
    useMutation({
      mutationKey: ["changePassword", userId],
      mutationFn: async (payload: any) => {
        const response = await request.put(
          `/users/${userId}/change-password`,
          payload
        );
        return response.data;
      },
    });

  const { mutateAsync: resendOTP, isPending: isResendOTPLoading } = useMutation(
    {
      mutationKey: ["resendOtp"],
      mutationFn: async (payload: any) => {
        const response = await request.post("/auth/resendOtp", payload);
        return response.data;
      },
      onSuccess: handleRefetchUsers,
    }
  );

  return {
    addUser,
    isAddingUser,
    registerUser,
    isRegisteringUser,
    verifyOtp,
    isOtpVerifying,
    userLogin,
    isLoggingIn,
    userLogout,
    isLoggingOut,
    users: usersData?.users || [],
    totalUsers: usersData?.userCount || 0,
    isLoadingUsers,
    updateUser,
    isUpdatingUser,
    deleteUser,
    isDeletingUser,
    user: userData?.user,
    permissions: userData?.data?.permissions || [],
    refetchUserData,
    isLoadingUser,
    refetchUserDataId,
    changePassword,
    isChangingPassword,
    //
    resendOTP,
    isResendOTPLoading,
    restoreUser,
    isRestoreUserLoading,
    // fetchUrl,
    // isFetchingUrl,
    handleRefetchUser,
    uploadProfileImage,
    isUploadingProfileImage,
  };
}
