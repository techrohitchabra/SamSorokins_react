import useAuth from "./useAuth";

import { useMutation } from "@tanstack/react-query";

export default function usePasswordReset() {
  const { request } = useAuth();

  // Add new user mutation
  const { mutateAsync: forgotPassword, isPending: forgotPasswordLoading } =
    useMutation({
      mutationFn: (payload: any) =>
        request
          .post("/forgotPassword", payload)
          .then((response) => response?.data as any),
    });

  // Add new user mutation
  const { mutateAsync: changePassword, isPending: isChangingPassword } =
    useMutation({
      mutationFn: (payload: any) =>
        request
          .post("/forgotPassword/changePassword", payload)
          .then((response) => response?.data as any),
    });

  return {
    forgotPassword,
    forgotPasswordLoading,

    changePassword,
    isChangingPassword,
  };
}
