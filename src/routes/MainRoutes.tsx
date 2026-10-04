import { Navigate } from "react-router";
import MainLayout from "../views/Layout/MainLayout";

import Account from "../views/pages/Account";
import Dashboard from "../views/pages/Dashboard";
import Files from "../views/pages/Files";
import Logs from "../views/pages/Logs";
import MainGuard from "./route-guard/MainGuard";
import EditFilesBySubmissionId from "../views/pages/EditFilesBySubmissionId";
import RentManager from "../views/pages/RentManager";
import KeyManagement from "../views/pages/KeyManagement";
import DuplicateSubmissions from "../views/pages/DuplicateSubmissions";

import PublicCheckout from "../views/pages/PublicCheckout";

/**
 * Routes component that conditionally renders application routes based on user authentication status.
 * @component MainRoutes
 * @author Sanjay
 */

const MainRoutes = () => ({
  path: "/", // Base path for the main routes
  element: (
    <MainGuard>
      <MainLayout />
    </MainGuard>
  ),
  children: [
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/keys/request/vendor",
      element: <PublicCheckout defaultUserType="Vendor" />,
    },
    {
      path: "/keys/request/non-vendor",
      element: <PublicCheckout defaultUserType="Non-Vendor" />,
    },
    // {
    //   path: "/checkout-vendor",
    //   element: <PublicCheckout defaultUserType="Vendor" />,
    // },
    // {
    //   path: "/checkout-non-vendor",
    //   element: <PublicCheckout defaultUserType="Non-Vendor" />,
    // },
    {
      path: "/submissions",
      element: <Files />,
    },
    {
      path: "/duplicate-submissions",
      element: <DuplicateSubmissions />,
    },
    {
      path: "/logs",
      element: <Logs />,
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
      path: "/rent-manager",
      element: <RentManager />,
    },
    {
      path: "/key-management",
      element: <KeyManagement />,
    },
    {
      path: "*",
      element: <Navigate to={"/dashboard"} />,
    },
  ],
});

export default MainRoutes;
