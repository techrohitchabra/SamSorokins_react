"use client";

import { Lock, Person } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Grid from "@mui/material/Grid";
import { useModal } from "mui-modal-provider";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import useAuth from "../../../hooks/useAuth";
import useUser from "../../../hooks/useUser";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import { useSnackbarHelper } from "../../components/snackbar";
import ChangePassword from "./ChangePassword";
import CropImageModal from "./CropImageModal";
import PersonalInfo from "./PersonalInfo";

/**
 * Profile component for which shows the tabs and the otions to change details
 * @component Profile
 *
 */

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

export default function Account() {
  const fileInputRef = useRef<any>(null);
  const showSnackbar = useSnackbarHelper();
  const { userId } = useAuth();
  // const { user, isLoadingUser, uploadProfileImage, isuploadingProfileImage } =
  //   useUser(userId);
  const { user, isLoadingUser, uploadProfileImage, isUploadingProfileImage } =
    useUser(userId);
  const { userData } = useSelector((state: any) => state.user);

  const { showModal } = useModal();
  // const router = useRouter();

  // Extract the active tab from the URL or default to "personal-info"
  // const location = useLocation();
  // const navigate = useNavigate();

  // const searchParams = new URLSearchParams(location.search);

  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "personal-info";

  const [activeTab, setActiveTab] = useState(tab);
  const [image, setImage] = useState("profilepic.avif");

  useEffect(() => {
    if (user?.profileImg) {
      setTimeout(() => {
        setImage(user.profileImg);
      }, 0);
    }
  }, [user?.profileImg]);

  // Function to render the active tabs
  const renderActiveTab = () => {
    switch (activeTab) {
      case "personal-info":
        return <PersonalInfo />;
      case "change-password":
        return <ChangePassword />;
      default:
        return <PersonalInfo />;
    }
  };

  // Handle Avatar click
  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleCroppedFileChange = async (croppedFile: any) => {
    const formData: any = new FormData();
    formData.append("file", croppedFile);

    try {
      const data = await uploadProfileImage(formData);
      setImage(data?.url);
      const message = data?.message || "Profile image updated successfully";
      showSnackbar(message, "success");
      //  event.target.value = "";
    } catch (error: any) {
      const message = error?.response?.data?.message || "An error occurred";
      showSnackbar(message, "error");
    }
  };

  const handleFileChange = async (event: any) => {
    try {
      const file = event?.target?.files[0];
      if (file && !["image/png", "image/jpeg"].includes(file.type)) {
        alert(
          "Only JPEG and PNG files are allowed."
          // "error"
        );
        event.target.value = ""; // Reset the input
        return;
      }
      if (!file) {
        return alert(
          "Please select a file"
          // "error"
        );
      }
      if (file?.size > 5 * 1024 * 1024) {
        return alert(
          "File size should be less than 5MB"
          // "error"
        );
      }

      const preview = URL.createObjectURL(file);
      handleCrop(preview, handleCroppedFileChange);
      event.target.value = "";
    } catch (error) {
      console.log(error);
    }
  };

  const handleCrop = (preview: any, handleCroppedFileChange: any) => {
    const modal: any = showModal(CropImageModal, {
      onClose: () => modal.hide(),
      preview,
      handleCroppedFileChange,
    });
  };

  // const handleCrop = useCallback(
  //   (preview: any, handleCroppedFileChange: any) => {
  //     const modal: any = showModal(CropImageModal, {
  //       onClose: () => modal.hide(),
  //       preview,
  //       handleCroppedFileChange,
  //     });
  //   },
  //   [showModal]
  // );

  const menuItems: MenuItem[] = [
    { text: "Personal Information", icon: <Person />, path: "personal-info" },
    { text: "Change Password", icon: <Lock />, path: "change-password" },
  ];

  const handleNavClick = (path: string) => {
    setActiveTab(path);

    const params = new URLSearchParams(window.location.search);
    params.set("tab", path);

    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  if (isLoadingUser || isUploadingProfileImage) {
    <TableSkeleton />;
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader
        title={
          <Typography variant="h3" sx={{ mx: 2 }}>
            Account Setting
          </Typography>
        }
      />
      <Divider />

      <CardContent
        sx={{
          flex: 1,
          overflow: "hidden", // important
        }}
      >
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                borderRadius: 3,
                height: "calc(100vh - 220px)",
                display: "flex",
                flexDirection: "column",
                border: 2,
                borderColor: "primary.50",
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Profile Header */}
                <Stack
                  direction="column"
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    {/* {isuploadingProfileImage ? ( */}
                    {isLoadingUser || isUploadingProfileImage ? (
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          border: "2px solid  #008EBB",
                          cursor: "pointer",
                          borderRadius: 15,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Avatar
                        alt="Profile Image"
                        sx={{
                          width: 120,
                          height: 120,
                          border: "2px solid  #008EBB",
                          cursor: "pointer",
                        }}
                        src={image}
                        onClick={handleAvatarClick}
                      />
                    )}
                    <IconButton
                      color="primary"
                      onClick={handleAvatarClick}
                      disableRipple
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 10,
                        backgroundColor: "#008EBB",
                        border: "1px solid #008EBB",
                        color: "#fff",
                        padding: "2px",
                      }}
                    >
                      <CameraAltIcon
                      // stroke={2} size={18}
                      />
                    </IconButton>
                  </Box>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={(event) => handleFileChange(event)}
                  />
                  <Typography
                    variant="subtitle1"
                    color="inherit"
                    sx={{
                      textTransform: "capitalize",
                      color: "#808080",
                      fontWeight: 400,
                      maxWidth: 200,
                      wordWrap: "break-word", // Allows breaking words if necessary
                      overflow: "hidden", // Ensures content doesn't overflow
                      whiteSpace: "normal", // Allows wrapping to the next line
                    }}
                  >
                    {userData?.fullName}
                  </Typography>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* Navigation */}
                <List
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    minHeight: 0,
                  }}
                >
                  {/* <ListItemButton
                  onClick={() => setActiveTab("personal-info")}
                  selected={tab === "personal-info"}
                >
                  <ListItemIcon>
                    <Person color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={"Personal Information"} />
                </ListItemButton>
                <ListItemButton
                  onClick={() => setActiveTab("change-password")}
                  selected={tab === "change-password"}
                >
                  <ListItemIcon>
                    <Lock color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={"Change Password"} />
                </ListItemButton> */}

                  {menuItems.map((item) => {
                    const isActive = activeTab === item.path;

                    return (
                      <ListItem
                        key={item?.text}
                        disablePadding
                        sx={{
                          // justifyContent: shouldShowText ? "initial" : "center",
                          justifyContent: "initial",
                          px: 1,
                        }}
                      >
                        <ListItemButton
                          // onClick={() => {
                          //   setActiveTab(item?.path);
                          // }}

                          onClick={() => handleNavClick(item.path)}
                          sx={{
                            position: "relative",
                            // justifyContent: shouldShowText ? "initial" : "center",
                            justifyContent: "initial",
                            px: 2,
                            py: 1.2,
                            mx: 0.5,
                            borderRadius: 2,
                            transition: "all 0.25s ease",

                            // backgroundColor: isActive ? "primary.50" : "transparent",
                            backgroundColor: isActive
                              ? "primary.200"
                              : "transparent",

                            "&:hover": {
                              backgroundColor: "rgba(109,145,235,0.25)",
                            },

                            // "&:hover": {
                            //   backgroundColor: "primary.100",
                            //   transform: "translateX(4px)",
                            // },

                            // Active left indicator
                            "&::before": isActive
                              ? {
                                  content: '""',
                                  position: "absolute",
                                  left: 0,
                                  top: 8,
                                  bottom: 8,
                                  width: "4px",
                                  borderRadius: "0 4px 4px 0",
                                  backgroundColor: "primary.main",
                                }
                              : {},
                          }}
                        >
                          {/* <Tooltip
                                  title={!shouldShowText ? item.text : ""}
                                  placement="right"
                                  arrow
                                > */}
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              // mr: shouldShowText ? 2 : "auto",
                              justifyContent: "center",
                              color: isActive
                                ? "primary.main"
                                : "text.secondary",
                              transition: "all 0.25s ease",
                              transform: isActive ? "scale(1.1)" : "scale(1)",
                            }}
                          >
                            {item?.icon}
                          </ListItemIcon>
                          {/* </Tooltip> */}

                          {/* {shouldShowText && ( */}
                          <ListItemText
                            primary={item?.text}
                            primaryTypographyProps={{
                              fontSize: 14,
                              fontWeight: isActive ? 600 : 500,
                              letterSpacing: "0.2px",
                            }}
                          />
                          {/* )} */}
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                borderRadius: 3,
                height: "calc(100vh - 220px)",
                display: "flex",
                flexDirection: "column",
                border: 2,
                borderColor: "primary.50",
              }}
            >
              <CardContent>{renderActiveTab()}</CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
      {/* </Box> */}
      {/* }
    /> */}
    </Card>
  );
}
