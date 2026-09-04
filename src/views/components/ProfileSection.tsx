import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Avatar, Chip } from "@mui/material";
import useAuth from "../../hooks/useAuth";
import useUser from "../../hooks/useUser";

/**
 * Header profile Section to show chip and avatar
 * @component ProfileSection
 * @author Sanjay
 *
 */

export default function ProfileSection({ rotated }: any) {
  const { userId } = useAuth();
  const { user } = useUser(userId);
  return (
    <Chip
      sx={{
        height: "40px",
        width: "80px",
        alignItems: "center",
        color: "black",
        backgroundColor: "lightgrey",
        border: "none",
        borderRadius: "27px",
        "&:hover": {
          //   backgroundColor: "primary.main",
          //   color: "white",
          borderColor: "lightgrey",
        },
      }}
      icon={
        <Avatar
          src={user?.profileImg || "profilepic.avif"}
          sx={{ bgcolor: "white", height: "35px", width: "35px" }}
        />
      }
      label={
        <SettingsOutlinedIcon
          style={{
            transform: rotated ? "rotate(360deg)" : "rotate(0deg)",
            transition: "transform 1s ease",
          }}
        />
      }
      variant="outlined"
    />
  );
}
