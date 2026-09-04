import { Navigate } from "react-router";
import MainLayout from "../views/Layout/MainLayout";
import Dashboard from "../views/pages/Dashboard";
import Files from "../views/pages/Files";
import EditFilesBySubmissionId from "../views/pages/EditFilesBySubmissionId";
import Account from "../views/pages/Account";
import DuplicateSubmissions from "../views/pages/DuplicateSubmissions";

/**
 * StaffRoutes component for Staff role users.
 * Does NOT allow access to /key-management or /rent-manager.
 * @component StaffRoutes
 */

const StaffRoutes = () => ({
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/submissions",
      element: <Files />,
    },
    {
      path: "/duplicate-submissions",
      element: <DuplicateSubmissions />,
    },
    {
      path: "/files/history/clientinfo",
      element: <EditFilesBySubmissionId />,
    },
    {
      path: "/files/history/files",
      element: <EditFilesBySubmissionId />,
    },
    {
      path: "/account",
      element: <Account />,
    },
    {
      path: "*",
      element: <Navigate to="/dashboard" replace />,
    },
  ],
});

export default StaffRoutes;
