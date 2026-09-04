import { useRoutes } from "react-router-dom";
import MainRoutes from "./MainRoutes";
import AuthRoutes from "./AuthRoutes";
import ReceptionistRoutes from "./ReceptionistRoutes";
import StaffRoutes from "./StaffRoutes";
import { useSelector } from "react-redux";

/**
 * Routes component that conditionally renders application routes based on user authentication status and role.
 * @component Routes
 * @author Sanjay
 */

const Routes = () => {
  const { user: reduxUser, userData } = useSelector((state: any) => state.user);
  const userRole = String(userData?.role || "").toLowerCase();

  let routes;
  if (!reduxUser) {
    routes = AuthRoutes();
  } else if (userRole === "receptionist") {
    routes = ReceptionistRoutes();
  } else if (userRole === "staff") {
    routes = StaffRoutes();
  } else {
    routes = MainRoutes();
  }

  return useRoutes([routes]);
};

export default Routes;
