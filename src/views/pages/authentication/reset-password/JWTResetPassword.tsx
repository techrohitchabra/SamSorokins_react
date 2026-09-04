import * as Yup from "yup";
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";

import { useLocation, useNavigate } from "react-router";
import FormContainer from "../../../components/inputs/FormContainer";
import Password from "../../../components/inputs/Password";
import MotionButton from "../../../buttons/MotionButton";
import SubmitButton from "../../../buttons/SubmitButton";
import { useSnackbarHelper } from "../../../components/snackbar";
import usePasswordReset from "../../../../hooks/usePasswordReset";
import { useEffect } from "react";

// ===============================|| JWT Reset Password ||=============================== //

type Props = {
  isCreatingNewPassword?: boolean;
};

/**
 *  Reset/Forgot Password UI
 * @hook JWTResetPassword
 * @author Sanjay
 *
 */

const JWTResetPassword = ({ isCreatingNewPassword = false }: Props) => {
  const { changePassword, isChangingPassword } = usePasswordReset();
  const showSnackbar = useSnackbarHelper();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const challenge = searchParams.get("challenge") || "";
  // const encodedEmail = searchParams.get("address");
  // const email = encodedEmail ? decodeURIComponent(encodedEmail) : "";
  useEffect(() => {
    if (!challenge) {
      navigate("/login");
    }
  }, [challenge]);

  const initialValues = {
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .max(255)
      .required("Password is required")
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        "Password must contain at least 8 characters, one uppercase, one number and one special case character"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  });

  const onFormSubmit = async (values: any) => {
    const { password: newPassword } = values;

    try {
      const data = await changePassword({
        newPassword,
        challenge,
      });

      const message = data?.message || "Success";
      showSnackbar(message, "success");
      navigate("/login");
    } catch (error: any) {
      console.log(error?.response?.data?.message);
      const message = error?.response?.data?.message || "An error occurred";

      showSnackbar(message, "error");
    }
  };

  return (
    <FormContainer
      validation={validationSchema}
      // formContext={formContext}
      defaultValues={initialValues}
      onSuccess={onFormSubmit}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Password name="password" label={"Password"} required />
          {/* <PasswordStrength /> */}
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Password
            name="confirmPassword"
            label={"Confirm Password"}
            required
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box sx={{ mt: 1 }}>
            <MotionButton>
              <SubmitButton
                disableElevation
                fullWidth
                disabled={isChangingPassword}
                size="large"
                type="submit"
                variant="contained"
              >
                {isCreatingNewPassword ? "Set Password" : "Reset Password"}
              </SubmitButton>
            </MotionButton>
          </Box>
        </Grid>
      </Grid>
    </FormContainer>
  );
};

export default JWTResetPassword;
