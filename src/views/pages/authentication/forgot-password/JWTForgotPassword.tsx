// material-ui
import { Box, Stack } from "@mui/material";

// third party
import * as Yup from "yup";
import { useSnackbarHelper } from "../../../components/snackbar";
import FormContainer from "../../../components/inputs/FormContainer";
import MuiTextField from "../../../components/inputs/MuiTextField";
import MotionButton from "../../../buttons/MotionButton";
import SubmitButton from "../../../buttons/SubmitButton";
import usePasswordReset from "../../../../hooks/usePasswordReset";
import { useNavigate } from "react-router-dom";

// ========================|| FIREBASE - FORGOT PASSWORD ||======================== //

/**
 * This component provides a UI for users to request a password reset.
 * @component ForgotPassword
 * @author Sanjay
 *
 */
const JWTForgotPassword = () => {
  const { forgotPassword, forgotPasswordLoading } = usePasswordReset();
  const showSnackbar = useSnackbarHelper();
  const navigate = useNavigate();

  // const intl = useIntl();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Must be a valid email")
      .max(255)
      .required("Required")
      .matches(emailRegex, "Must be a valid email"),
  });

  const initialValues = {
    email: "",
  };

  type FormValues = Yup.InferType<typeof validationSchema>;

  const onFormSubmit = async (values: FormValues) => {
    const { email } = values;
    try {
      const data = await forgotPassword({ email });
      const message = data?.message || "Success";
      showSnackbar(message, "success");
      navigate("/login");
    } catch (error: any) {
      const message = error?.response?.data?.message || "An error occurred";
      showSnackbar(message, "error");
    }
  };

  return (
    <FormContainer
      validation={validationSchema}
      defaultValues={initialValues}
      onSuccess={onFormSubmit}
    >
      <Stack sx={{ mb: 2 }} spacing={1}>
        <MuiTextField
          name="email"
          //   onKeyUp={checkEmailFirst}
          type="email"
          label={"Email"}
          required
        />
      </Stack>

      <Box sx={{ mt: 2 }}>
        <MotionButton>
          <SubmitButton
            disableElevation
            fullWidth
            disabled={forgotPasswordLoading}
            size="large"
            type="submit"
            variant="contained"
            // color="primary"
            sx={{ backgroundColor: "primary.900" }}
          >
            Send Mail
          </SubmitButton>
        </MotionButton>
      </Box>
    </FormContainer>
  );
};

export default JWTForgotPassword;
