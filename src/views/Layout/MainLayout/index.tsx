import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

/**
 * Main MainLayout in which all the component renders
 * @component MainLayout
 * @author Sanjay
 *
 */

const MainLayout = () => {
  const theme = useTheme();
  const { userData } = useSelector((state: any) => state.user);
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const [open, setOpen] = useState(true);

  // Function for toggling the drawer
  const toggleDrawer = () => setOpen((prev) => !prev);
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* 🔝 Header */}
      <Header
        onDrawerToggle={toggleDrawer}
        open={open}
        isLargeScreen={isLargeScreen}
        userName={userData?.fullName || ""}
        // userRole={userData?.role}
        // walletPrice={userData?.walletPrice || 0}
      />

      {/* 📚 Sidebar */}
      <Sidebar
        mobileOpen={!isLargeScreen && open}
        onMobileToggle={toggleDrawer}
        desktopOpen={isLargeScreen ? open : false}
      />
      {/* <ChatBot /> */}
      {/* 📦 Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          px: { xs: 1, sm: 1, md: 1.5 },
          pt: "70px",
          pb: 1.5,
          width: "100%",
          boxSizing: "border-box",
          bgcolor: "#f5f7fa",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
