import PropTypes from "prop-types";

// material-ui
import Grid from "@mui/material/Grid";

import Box from "@mui/material/Box";
// import Logo from "../../components/logo/LogoMain";
// import AuthBackground from "../../components/authentication/AuthBackground";
// import AuthCard from "../../components/authentication/AuthCard";
// import Logo from "../../components/logo";
import AuthBackground from "../../authontication/AuthBackground";
import AuthCard from "../../authontication/AuthCard";
// import AuthFooter from "../../components/authentication/AuthFooter";

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

/**
 * Main Auth Card Wraper Component
 * @component AuthCardWrapper
 * @author Sanjay
 *
 */

export default function AuthCardWrapper({ children }: any) {
  return (
    <Box
      sx={{
        minHeight: "95vh",
        position: "relative", // Ensure the Box is a positioned element
      }}
    >
      <AuthBackground />
      <Grid
        container
        direction="column"
        justifyContent="flex-end"
        sx={{
          minHeight: "95vh",
          position: "relative", // Ensure the Grid is a positioned element
          zIndex: 10,
        }}
      >
        {/* <Grid sx={{ ml: 3 }} size={{ xs: 12 }}>
          <Logo />
        </Grid> */}
        {/* <Logo /> */}

        <Grid size={{ xs: 12 }}>
          <Grid
            size={{ xs: 12 }}
            container
            justifyContent="center"
            alignItems="center"
            sx={{
              minHeight: {
                xs: "calc(100vh - 134px)",
                sm: "calc(100vh - 134px)",
                md: "calc(100vh - 134px)",
              },
            }}
          >
            <Grid>
              <AuthCard>{children}</AuthCard>
            </Grid>
          </Grid>
        </Grid>
        {/* <Grid size={{ xs: 12 }} sx={{ m: 3, mt: 1 }}>
          <AuthFooter />
        </Grid> */}
      </Grid>
    </Box>
  );
}

AuthCardWrapper.propTypes = { children: PropTypes.node };
