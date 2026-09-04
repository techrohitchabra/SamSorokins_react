import type { DialogProps } from "@mui/material";
import { Box, Button } from "@mui/material";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { logoutUser } from "../../redux/user/userSlice";
import BasicModal from "./modal";
import { useSnackbarHelper } from "./snackbar";

interface Props extends DialogProps {
  onClose: () => void;
}

const LogoutModal = ({ onClose, ...props }: Props) => {
  // const { userId } = useAuth();
  // const { userLogout, isLoggingOut } = useUser(userId);
  const showSnackbar = useSnackbarHelper();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const onSubmit = async () => {
    try {
      // const data = await userLogout();
      // const message = data?.message || "Success";

      // console.log(message, "success");
      dispatch(logoutUser());
      localStorage.removeItem("persist:user");
      navigate("/login");
      showSnackbar("User Logged out Successfully", "success");
      // onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message || "An error occurred";
      showSnackbar(message, "error");
    }
  };

  return (
    <Box>
      <BasicModal
        // isLoader={isLoggingOut}
        onClose={onClose}
        title={"Logout"}
        content={"Do you really want to logout?"}
        actions={
          <>
            <Button
              color="error"
              variant="outlined"
              sx={{ textTransform: "capitalize" }}
              onClick={() => onClose()}
              // disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ textTransform: "capitalize" }}
              onClick={onSubmit}
              // disabled={isLoggingOut}
            >
              Logout
            </Button>
          </>
        }
        {...props}
      />
    </Box>
  );
};

export default LogoutModal;
