import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
// import Header from "./Header";

/**
 * Main AuthLayout in which all the auth component renders
 * @component AuthLayout
 * @author Sanjay
 *
 */

export default function AuthLayout() {
  return (
    <Box sx={{ backgroundColor: "white", width: "100%" }}>
      <Outlet />
    </Box>
  );
}
