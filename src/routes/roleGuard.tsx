import React from "react";
import { Navigate } from "react-router-dom";
// import Loader from "../views/components/Loader";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[]; // List of roles that can access this route
  userRole: string; // Current user's role
  isLoadingUser: boolean; // Whether
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  userRole,
  isLoadingUser,
}) => {
  console.log({ isLoadingUser });
  // if (isLoadingUser) {
  //   return <Loader />;
  // }
  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }
  // if (userRole === "CLIENT") {
  //   return <Navigate to="/list" replace />;
  // }
  // Redirect if the user's role is not allowed
  return <Navigate to="/dashboard" replace />;
};

export default RoleGuard;
