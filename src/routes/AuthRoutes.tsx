import { Navigate } from "react-router";
import AuthLayout from "../views/Layout/AuthLayout";
import AuthGuard from "./route-guard/AuthGuard";
import Login from "../views/pages/authentication/Login";
import Register from "../views/pages/authentication/register";
import ForgotPassword from "../views/pages/authentication/forgot-password";
import ResetPassword from "../views/pages/authentication/reset-password";
import TwoFactorAuthentication from "../views/pages/authentication/twoFactorAuthentication";
import AddDetails from "../views/pages/AddDetails";
import Thankyou from "../views/pages/Thankyou";
import NothingToUpload from "../views/pages/NothingToUpload";
import RedirectToAddDetails from "../views/pages/RedirectToAddDetails";
/**
 * AuthRoutes component that defines the routing structure for authentication-related pages.
 * @component AuthRoutes
 * @author Sanjay
 *
 */
const AuthRoutes = () => ({
  path: "/", // Base path for authentication routes
  element: (
    <AuthGuard>
      <AuthLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/forgotPassword",
      element: <ForgotPassword />,
    },
    {
      path: "/password/reset",
      element: <ResetPassword />,
    },
    {
      path: "/password/create",
      element: <ResetPassword />,
      // element: <CreatePassword />,
    },
    {
      path: "/twoFactorAuthentication",
      element: <TwoFactorAuthentication />,
    },
    {
      path: "/jotform/form/:id", //used to upload/view the files by client
      element: <AddDetails />,
    },
    {
      path: "/jotform/files/:id",
      element: <AddDetails />,
    },
    {
      path: "/jotform/submission/:id",
      element: <RedirectToAddDetails />,
    },
    {
      path: "/jotform/files/thankyou",
      element: <Thankyou />,
    },
    {
      path: "/jotform/files/nothingtoupload",
      element: <NothingToUpload />,
    },
    {
      path: "*",
      element: <Navigate to={"/login"} />,
    },
  ],
});

export default AuthRoutes;
