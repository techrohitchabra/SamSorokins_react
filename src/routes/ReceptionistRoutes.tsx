import { Navigate } from "react-router";
import MainLayout from "../views/Layout/MainLayout";
import KeyManagement from "../views/pages/KeyManagement";
import Account from "../views/pages/Account";

/**
 * ReceptionistRoutes component for Receptionist role users.
 * @component ReceptionistRoutes
 */

const ReceptionistRoutes = () => ({
  path: "/",
  element: <MainLayout />,
  children: [
    {
      path: "/",
      element: <Navigate to="/key-management" replace />,
    },
    {
      path: "/key-management",
      element: <KeyManagement />,
    },
    {
      path: "/account",
      element: <Account />,
    },
    {
      path: "*",
      element: <Navigate to="/key-management" replace />,
    },
  ],
});

export default ReceptionistRoutes;
