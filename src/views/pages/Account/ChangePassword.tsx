import { Box, Button, Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useUser from "../../../hooks/useUser";
import useAuth from "../../../hooks/useAuth";
import { useSnackbarHelper } from "../../components/snackbar";
import FormContainer from "../../components/inputs/FormContainer";
import Password from "../../components/inputs/Password";

/**
 * Change Password component from where the password can be changed by the user
 * @component Change Password
 *
 */

const ChangePassword = () => {
  const { userId } = useAuth();
  const showSnackbar = useSnackbarHelper();
  const { changePassword, isChangingPassword } = useUser(userId);
  const initialValues = {
    // currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object().shape({
    // currentPassword: Yup.string().max(255).required("Required"),
    newPassword: Yup.string()
      .max(255)
      .required("Required")
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Password must contain at least 8 characters, one uppercase, one number and one special case character"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  });

  const formContext = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  // Submit Form
  const onFormSubmit = async (values: any) => {
    try {
      const payload = {
        // currentPassword: values?.currentPassword,
        newPassword: values?.newPassword,
      };
      const res = await changePassword(payload);
      showSnackbar(res?.message, "success");
      formContext.reset();
    } catch (error: any) {
      const message = error?.response?.data?.message || "An error occurred";
      showSnackbar(message, "error");
    }
  };

  return (
    <FormContainer onSuccess={onFormSubmit} formContext={formContext}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Box>
            <Typography variant="h4">Change Password</Typography>
          </Box>
          <Divider sx={{ mb: 2, mt: 2 }} />
        </Grid>
        <Grid container size={{ xs: 12 }} spacing={2} justifyContent={"center"}>
          {/* <Grid size={{ xs: 9 }}>
            <Password
              name="currentPassword"
              label={"Current Password"}
              required
              fullWidth
              autoComplete="current-password"
            />
          </Grid>{" "} */}
          <Grid size={{ xs: 9 }}>
            <Password
              name="newPassword"
              placeholder={"New Password"}
              required
              fullWidth
              autoComplete="new-password"
            />
          </Grid>
          <Grid size={{ xs: 9 }}>
            <Password
              name="confirmPassword"
              placeholder={"Confirm Password"}
              required
              fullWidth
              autoComplete="new-password"
            />
          </Grid>
        </Grid>
        <Grid container size={{ xs: 12 }} sx={{ mt: 2 }}>
          <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              sx={{ textTransform: "none" }}
              disabled={isChangingPassword}
            >
              Update Password
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </FormContainer>
  );
};

export default ChangePassword;
