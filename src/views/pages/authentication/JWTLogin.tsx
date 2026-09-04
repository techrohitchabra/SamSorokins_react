import { Link } from "react-router-dom";

// material-ui
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";

// components
import * as Yup from "yup";
import useUser from "../../../hooks/useUser";
import MotionButton from "../../buttons/MotionButton";
import FormContainer from "../../components/inputs/FormContainer";
import MuiTextField from "../../components/inputs/MuiTextField";
import Password from "../../components/inputs/Password";
import { useSnackbarHelper } from "../../components/snackbar";

/**
 *  Login Form UI
 * @hook JWTLogin
 * @author Sanjay
 *
 */

const JWTLogin = () => {
  const { userLogin, isLoggingIn } = useUser();
  // const { request } = useAuth();
  const showSnackbar = useSnackbarHelper();
  // const navigate = useNavigate();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Must be a valid email")
      .max(255)
      .required("Required")
      .matches(emailRegex, "Must be a valid email"),
    password: Yup.string().max(255).required("Required"),
  });

  type FormValues = Yup.InferType<typeof validationSchema>;

  const initialValues = {
    email: "",
    password: "",
  };

  const onFormSubmit = async (values: FormValues) => {
    try {
      const data = await userLogin(values);
      const message = data?.message || "Success";
      showSnackbar(message, "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || "An error occurred";

      showSnackbar(message, "error");
    }
  };

  return (
    <Box position="relative">
      {/* Spinner Overlay */}
      {/* {false && ( */}
      {isLoggingIn && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "black",
            zIndex: 9999,
            opacity: 0.5,
            // backdropFilter: "blur(1.5px)",
          }}
          // sx={{position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999, background: "black", opacity: 0.8,}}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Main Form */}
      <FormContainer
        validation={validationSchema}
        defaultValues={initialValues}
        onSuccess={onFormSubmit}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Stack spacing={1}>
              <MuiTextField name="email" type="text" label={"Email"} required />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack spacing={1}>
              <Password name="password" label={"Password"} required />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12 }} sx={{ mt: -1 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <FormControlLabel
                control={
                  <Checkbox name="checked" color="primary" size="small" />
                }
                label={<Typography variant="h6">Keep me signed in</Typography>}
              />
              <Link to="/forgotPassword" style={{ textDecoration: "none" }}>
                <Typography
                  variant="body1"
                  sx={{ textDecoration: "none" }}
                  color="primary.900"
                >
                  Forgot password?
                </Typography>
              </Link>
            </Stack>
          </Grid>

          <Box width={"100%"}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <MotionButton>
                  <Button
                    disableElevation
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    color="primary"
                    // disabled={isLoggingIn}
                    sx={{
                      backgroundColor: "primary.900",
                      "&:hover": { backgroundColor: "primary.dark" },
                    }}
                  >
                    Login
                  </Button>
                </MotionButton>
              </Grid>

              {/* <Grid size={{ xs: 12 }} sx={{ textAlign: "right" }}>
                <Typography
                  component={Link}
                  to="/register"
                  variant="body1"
                  sx={{ textDecoration: "none" }}
                  color="primary.900"
                >
                  Don't have an account?
                </Typography>
              </Grid> */}
              {/* <Box pl={10} pr={6}>
                <Grid size={{xs:12}}>
                  <GoogleOAuthProvider clientId={authClientId}>
                    <GoogleLogin
                      onSuccess={getAuthDetails}
                      onError={handleAuthError}
                      theme="filled_blue"
                      shape="rectangular"
                      text="continue_with"
                      size="large"
                      width="250px"
                    />
                  </GoogleOAuthProvider>
                </Grid>
              </Box>
              <Box>
                <Grid size={{xs:12}} container justifyContent="center">
                  <LoginSocialFacebook
                    appId="1625529821407197"
                    onResolve={(response) => {
                      getFacebookCredentials(response);
                    }}
                    onReject={(error) => {
                      console.log(error);
                    }}
                  >
                    <FacebookLoginButton
                      style={{
                        fontWeight: 500,
                        fontSize: "15px",
                        height: "40px",
                        width: "250px",
                        display: "flex",
                        marginLeft: "80px",
                      }}
                    >
                      <span
                        style={{
                          marginLeft: "20px", // Optional: Add some space between icon and text
                          //  textAlign: "center", // Center text
                          // flexGrow: 1, // Allow text to take up remaining space and center it
                        }}
                      >
                        <FormattedMessage
                          defaultMessage={"Login with Facebook"}
                        />
                      </span>
                    </FacebookLoginButton>
                  </LoginSocialFacebook>
                </Grid>
              </Box> */}
            </Grid>
          </Box>
        </Grid>
      </FormContainer>
    </Box>
  );
};

export default JWTLogin;
