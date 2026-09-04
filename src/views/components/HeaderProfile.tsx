import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import {
  Box,
  ButtonBase,
  ClickAwayListener,
  Fade,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import { useCallback, useState } from "react";
import ProfileSection from "./ProfileSection";
import { useNavigate } from "react-router";
import { useModal } from "mui-modal-provider";
import LogoutModal from "./LogoutModal";
// import LogoutModal from "./LogoutModal";

const HeaderProfile = () => {
  const [rotated, setRotated] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { showModal } = useModal();

  const handleClose = (event: any) => {
    const profileButton = document.getElementById("profile-button");
    if (profileButton && profileButton.contains(event.target)) return;
    setOpen(false);
    setRotated(false);
  };

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen);
    setRotated((prev) => !prev);
  };

  const handleProfileClick = () => {
    setOpen(false);
    setRotated(false);
    navigate("/account?tab=personal-info");
  };

  const handleLogoutClick = useCallback(() => {
    const modal: any = showModal(LogoutModal, {
      onClose: () => modal.hide(),
    });
  }, [showModal]);

  return (
    <Box
      sx={{
        flexShrink: 0,
        ml: 0.75,
        position: "relative",
      }}
    >
      <ButtonBase
        id="profile-button"
        disableRipple
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ProfileSection rotated={rotated} />
      </ButtonBase>

      <ClickAwayListener onClickAway={handleClose}>
        <Fade in={open} timeout={500} unmountOnExit>
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              top: "100%",
              right: 0,
              width: 220,
              borderRadius: 2,
              mt: 1.25,
              zIndex: 1301,
              bgcolor: "background.paper",
              overflow: "hidden",
              boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.12)",
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            <List
              component="nav"
              sx={{
                p: 1,
                "& .MuiListItemIcon-root": { minWidth: 32 },
                "& .MuiListItemButton-root": {
                  borderRadius: 1,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                },
              }}
            >
              <ListItemButton onClick={handleProfileClick}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="View Profile" />
              </ListItemButton>
              <ListItemButton onClick={handleLogoutClick}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </List>
          </Paper>
        </Fade>
      </ClickAwayListener>
    </Box>
  );
};

export default HeaderProfile;
