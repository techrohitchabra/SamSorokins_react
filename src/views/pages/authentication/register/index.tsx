import Grid from "@mui/material/Grid";

import { Link } from "react-router-dom";

// mui
import { Stack, Typography } from "@mui/material";
import AuthCardWrapper from "../../../Layout/Wrappers/AuthCardWrapper";
import JWTRegister from "./JWTRegister";
// import JWTRegister from "../../../components/authentication/JWTRegister";

//components

/**
 * To Register the new User
 * @component Register
 * @author Sanjay
 *
 */

export default function Register() {
  return (
    <AuthCardWrapper>
      <Grid container spacing={1} direction={"column"}>
        <Grid size={{ xs: 12 }}>
          <Stack justifyContent="center" spacing={1}>
            <Typography gutterBottom variant={"h3"}>
              Sign Up
            </Typography>
            <Typography
              variant="subtitle1"
              textAlign="left"
              color="text.secondary"
            >
              Enter Information below to register
            </Typography>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <JWTRegister />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Stack direction={"row"} spacing={1} justifyContent="flex-end">
            <Typography
              component={Link}
              to="/login"
              variant="body1"
              sx={{ textDecoration: "none" }}
              color="primary.900"
            >
              Already have an account?
            </Typography>
          </Stack>
        </Grid>
        {/* </Stack> */}
      </Grid>
    </AuthCardWrapper>
  );
}
