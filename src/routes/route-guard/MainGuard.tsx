import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

/**
 * MainGuard component to manage access to routes based on user authentication.
 * @component MainGuard
 * @author Sanjay
 *
 */
const MainGuard = ({ children }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useSelector((state: any) => state.user);
  const userRole = String(userData?.role || "").toLowerCase();
  const userId = String(userData?.userId || "");

  useEffect((): any => {
    if (location.pathname === "/") {
      if (
        userRole === "receptionist"
        // ||
        // userRole === "key manager" ||
        // userId === "69bd177472681b58e9c964b9"
      ) {
        return navigate("/key-management", { replace: true });
      }
      return navigate("/dashboard", { replace: true });
    }
  }, [navigate, location, userRole, userId]);

  return children;
};

export default MainGuard;
