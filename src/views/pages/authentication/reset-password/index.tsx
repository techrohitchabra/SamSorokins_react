import { Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import AuthCardWrapper from "../../../Layout/Wrappers/AuthCardWrapper";
import JWTResetPassword from "./JWTResetPassword";

/**
 * Reset Password UI Component
 * @component ForgotPassword
 * @author Sanjay
 *
 */

export default function ResetPassword() {
  return (
    <AuthCardWrapper>
      <Grid
        container
        spacing={1}
        direction={"column"}
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "100%",
          alignItems: "center",
        }}
      >
        <Stack spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Stack justifyContent="center" spacing={1}>
              <Typography
                // color="black"
                gutterBottom
                variant={"h2"}
              >
                Reset Password
              </Typography>

              <Typography variant="subtitle1" textAlign="left" sx={{ pl: 0.5 }}>
                Please enter your new password
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <JWTResetPassword />
          </Grid>
        </Stack>
      </Grid>
    </AuthCardWrapper>
  );
}
