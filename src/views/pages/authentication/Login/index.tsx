import { Box, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import AuthCardWrapper from "../../../Layout/Wrappers/AuthCardWrapper";
import JWTLogin from "../JWTLogin";
// import JWTLogin from "../../../components/authentication/JWTLogin";

// import JWTLogin from "../../../components/authentication/JWTLogin";

/**
 * To Login with Credentials
 * @component Login
 * @author Sanjay
 *
 */

export default function Login() {
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
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          {/* Logo */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <img src="/samlogo.png" alt="Logo" style={{ height: 60 }} />
          </Box>

          {/* Login Section */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="baseline"
                sx={{ mb: 1 }}
              >
                <Typography variant="h3">Login</Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <JWTLogin />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </AuthCardWrapper>
  );
}
