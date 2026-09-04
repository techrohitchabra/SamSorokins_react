import { Box, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import AuthCardWrapper from "../../../Layout/Wrappers/AuthCardWrapper";
import JWTForgotPassword from "./JWTForgotPassword";
// import JWTForgotPassword from "../../../components/authentication/JWTForgotPassword";

// ============================|| AUTH - FORGOT PASSWORD ||============================ //
/**
 * Forgot Password UI component
 * @component ForgotPassword
 * @author Sanjay
 *
 */
const ForgotPassword = () => {
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
            <Grid size={{ xs: 12 }} mb={1}>
              <Stack justifyContent="center" spacing={1}>
                <Typography gutterBottom variant="h3">
                  Forgot password?
                </Typography>

                <Typography
                  variant="subtitle1"
                  textAlign="left"
                  color="text.secondary"
                >
                  Enter your email address below and we'll send you password
                  reset link.
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <JWTForgotPassword />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Grid container direction="column" alignItems="flex-end">
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <Typography variant="body1" color="primary.900">
                    Back to login
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AuthCardWrapper>
  );
};
export default ForgotPassword;
