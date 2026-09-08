import InboxIcon from "@mui/icons-material/MoveToInbox";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CopyAllIcon from "@mui/icons-material/CopyAll";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  useMediaQuery,
  type Theme,
} from "@mui/material";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import KeyIcon from "@mui/icons-material/Key";
import { useSelector } from "react-redux";
import useAuth from "../../hooks/useAuth";

const drawerWidth = 200;
const collapsedDrawerWidth = 72;

type Props = {
  mobileOpen: boolean;
  onMobileToggle: () => void;
  desktopOpen: boolean;
};

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

/**
 * Sidebar component for navigation drawer
 * @component Sidebar
 * @author Sanjay
 *
 */

const Sidebar = ({ mobileOpen, onMobileToggle, desktopOpen }: Props) => {
  // Media query to detect large screens
  const isLargeScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("lg")
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();
  const { userData } = useSelector((state: any) => state.user);
  const userRole = userData?.role;

  const isKeyManager = (role?: string | null) => {
    return role === "Key Manager";
  };

  // const isAdmin = (role?: string | null) => {
  //   if (!role) return false;
  //   const r = role.toUpperCase().replace(/[-_]/g, " ");
  //   return r === "ADMIN" || r === "SUPER ADMIN";
  // };

  const isReceptionist = (role?: string | null) => {
    if (!role) return false;
    // const r = role.toUpperCase().replace(/[-_]/g, " ");
    // return r === "ADMIN" || r === "SUPER ADMIN";
    return role.toLowerCase() === "receptionist";
  };

  const isStaff = (role?: string | null) => {
    if (!role) return false;
    return role.toLowerCase() === "staff";
  };

  // Determine if we should show text based on screen size and state
  const shouldShowText = isLargeScreen ? desktopOpen : mobileOpen;

  // Compute menu items dynamically based on role segregation
  let menuItems: MenuItem[] = [];

  if (isKeyManager(userRole) || isReceptionist(userRole)) {
    // Receptionist & Key Manager roles see ONLY Key Management
    menuItems = [
      {
        text: "Key Management",
        icon: <KeyIcon />,
        path: "/key-management",
      },
    ];
  } else if (isStaff(userRole)) {
    // Staff role sees Dashboard, Submissions and Duplicate Submissions
    menuItems = [
      { text: "Dashboard", icon: <InboxIcon />, path: "/dashboard" },
      { text: "Submissions", icon: <PeopleIcon />, path: "/submissions" },
      {
        text: "Duplicate Submissions",
        icon: <CopyAllIcon />,
        path: "/duplicate-submissions",
      },
    ];
  } else {
    // Standard menus
    menuItems = [
      { text: "Dashboard", icon: <InboxIcon />, path: "/dashboard" },
      { text: "Submissions", icon: <PeopleIcon />, path: "/submissions" },
      {
        text: "Duplicate Submissions",
        icon: <CopyAllIcon />,
        path: "/duplicate-submissions",
      },

      ...(userId === "69bd177472681b58e9c964b9"
        ? [
            {
              text: "Rent Manager",
              icon: <ApartmentIcon />,
              path: "/rent-manager",
            },
            {
              text: "Key Management",
              icon: <KeyIcon />,
              path: "/key-management",
            },
            {
              text: "Logs",
              icon: <ListAltIcon />,
              path: "/logs",
            },
            {
              text: "Test Submissions",
              icon: <AssignmentIcon />,
              path: "/test-submissions",
            },
          ]
        : []),
    ];
  }

  // Sidebar drawer content
  const drawerContent = (
    <Box
      sx={{
        bgcolor: "#1c3260", // dark slate
        color: "#e5e7eb",
        height: "100%",
      }}
    >
      {/* Logo Section */}
      <Toolbar
        sx={{
          justifyContent: "center",
          minHeight: "64px !important",
          px: 2,
        }}
      >
        <img
          src={shouldShowText ? "/samlogo.png" : "/small_logo.png"}
          alt="Logo"
          style={{
            height: 50,
            width: "auto",
            display: "block",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        />
      </Toolbar>

      <Divider />

      {/* Menu */}
      <List sx={{ mt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem
              key={item.text}
              disablePadding
              sx={{
                justifyContent: shouldShowText ? "initial" : "center",
                px: 1,
              }}
            >
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (!isLargeScreen) onMobileToggle();
                }}
                sx={{
                  position: "relative",
                  justifyContent: shouldShowText ? "initial" : "center",
                  px: 1,
                  py: 1,
                  mx: 0.4,
                  borderRadius: 2,
                  transition: "all 0.25s ease",

                  backgroundColor: isActive
                    ? "rgba(59,130,246,0.15)" // soft blue
                    : "transparent",

                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.06)",
                    transform: "translateX(4px)",
                  },

                  "&::before": isActive
                    ? {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 6,
                        bottom: 6,
                        width: "3px",
                        borderRadius: "0 4px 4px 0",
                        backgroundColor: "#3b82f6",
                      }
                    : {},
                }}
              >
                <Tooltip
                  title={!shouldShowText ? item.text : ""}
                  placement="right"
                  arrow
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: shouldShowText ? 2 : "auto",
                      justifyContent: "center",
                      color: isActive ? "#3b82f6" : "#9ca3af",
                      transform: isActive ? "scale(1.1)" : "scale(1)",
                      transition: "0.25s",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>

                {shouldShowText && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#fff" : "#d1d5db",
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open={desktopOpen}
        sx={{
          display: { xs: "none", lg: "block" },
          width: desktopOpen ? drawerWidth : collapsedDrawerWidth,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: desktopOpen ? drawerWidth : collapsedDrawerWidth,
            boxSizing: "border-box",
            transition: "width 0.3s ease",
            overflowX: "hidden",
            // borderRight: "1px solid #e5e7eb",
            // backgroundColor: "#fff",
            backgroundColor: "#111827",
            borderRight: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
