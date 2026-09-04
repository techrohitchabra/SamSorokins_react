import { useEffect } from "react";
// import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

/**
 * AuthGuard component to protect routes based on user authentication status.
 * @component AuthGuard
 * @author Sanjay
 *
 */

const AuthGuard = ({ children }: any) => {
  // const { user } = useSelector((state: any) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect((): any => {
    // If user is authenticated, redirect to "/cases"
    // if (user) {
    //   return navigate("/home");
    // }
    if (location.pathname === "/") {
      return navigate("/login");
    }
  }, [navigate, location]);

  return children;
};

export default AuthGuard;
