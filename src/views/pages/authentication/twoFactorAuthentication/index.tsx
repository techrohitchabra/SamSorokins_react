import { Stack, Typography, Box, Button } from "@mui/material";
import Grid from "@mui/material/Grid";

// import laywerLogo from "../../../../assets/images/2.jpg";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AuthCardWrapper from "../../../Layout/Wrappers/AuthCardWrapper";
import JWTTwoFactorAuthentication from "./JWTTwoFactorAuthentication";
import { useSnackbarHelper } from "../../../components/snackbar";
import useUser from "../../../../hooks/useUser";
// import JWTTwoFactorAuthentication from "../../../components/authentication/JWTTwoFactorAuthentication";

// ============================|| AUTH - TWO FACTOR AUTHENTICATION ||============================ //

/**
 * Two factor authentication UI component
 * @component TwoFactorAuthentication
 * @author Sanjay
 *
 */

const TwoFactorAuthentication = () => {
  const { resendOTP, isResendOTPLoading } = useUser();
  const showSnackbar = useSnackbarHelper();

  const navigate = useNavigate();
  const [showCount, setShowCount] = useState(false);
  const [count, setCount] = useState<number>();

  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    const storedOtpCount = localStorage.getItem("otpCount");

    if (storedOtpCount) {
      const resendCount = Number(storedOtpCount);
      setCount(3 - resendCount);
      setShowCount(true);
    }
  }, []);

  const handleResendOTP = useCallback(async () => {
    const payload = {
      email,
    };

    try {
      const response = await resendOTP(payload);
      const message = response?.message;

      setShowCount(true);
      localStorage.setItem("otpCount", response?.resendCount);
      setCount(3 - response?.resendCount);

      showSnackbar(message, "success");
    } catch (err: any) {
      const response = err?.response;
      const message = response?.data?.message;
      setShowCount(false);
      showSnackbar(message, "error");

      if (response?.status === 429) {
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      }
    }

    //eslint-disable-next-line
  }, []);

  return (
    <AuthCardWrapper>
      <Box
        sx={{
          // minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Logo */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <img src="/samlogo.png" alt="Logo" style={{ height: 60 }} />
          </Box>

          <Grid container spacing={1} direction="column">
            <Grid size={{ xs: 12 }}>
              <Stack spacing={1}>
                <Typography gutterBottom variant="h3">
                  Two Step Verification
                </Typography>

                <Typography
                  variant="subtitle1"
                  textAlign="left"
                  color="text.secondary"
                >
                  Enter your code that has been sent to your registered email.
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }} mt={1}>
              <JWTTwoFactorAuthentication />
            </Grid>

            <Grid container alignItems="center">
              {showCount && (
                <Grid size={{ xs: 6 }}>
                  <Typography color="#9c27b0" fontSize="15px" pr={2}>
                    {count} Attempt left
                  </Typography>
                </Grid>
              )}

              <Grid size={{ xs: showCount ? 6 : 12 }}>
                <Grid container direction="column" alignItems="flex-end">
                  <Button
                    color="secondary"
                    sx={{
                      backgroundColor: "transparent",
                      "&:hover": { backgroundColor: "transparent" },
                    }}
                    onClick={handleResendOTP}
                  >
                    {isResendOTPLoading ? "Sending..." : "Resend OTP?"}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AuthCardWrapper>
  );
};
export default TwoFactorAuthentication;
