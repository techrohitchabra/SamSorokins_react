import PropTypes from "prop-types";

// material-ui
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import AuthMainCard from "../Layout/Wrappers/AuthMainCard";
// import MainCard from "../input/MainCard";
// import AuthMainCard from "../../Layout/Wrappers/AuthMainCard";

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

/**
 *  Custom Card for the auth routes.
 * @hook AuthCard
 * @author Sanjay
 *
 */

export default function AuthCard({ children, ...other }: any) {
  return (
    <AuthMainCard
      sx={{
        maxWidth: { xs: 400, lg: 475 },
        // margin: { xs: 2.5, md: 3 },
        mt: -15,
        "& > *": { flexGrow: 1, flexBasis: "50%" },
        boxShadow: (theme: any) =>
          `0px 2px 8px ${alpha(theme.palette.grey[900], 0.15)}`,

        "&:hover": {
          boxShadow: (theme: any) =>
            `0px 2px 8px ${alpha(theme.palette.grey[900], 0.15)}`,
        },
      }}
      content={false}
      {...other}
      border={false}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>{children}</Box>
    </AuthMainCard>
  );
}

AuthCard.propTypes = { children: PropTypes.node, other: PropTypes.any };
