// import PropTypes from "prop-types";
import { forwardRef } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
// import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

// header style
const headerSX = {
  p: 2.5,
  "& .MuiCardHeader-action": { m: "0px auto", alignSelf: "center" },
};

/**
 * Auth main card wrapper component
 * @component MainCard
 * @author Sanjay
 *
 */

function MainCard(
  {
    border = true,
    boxShadow,
    children,
    content = true,
    contentSX = {},
    darkTitle,
    elevation,
    secondary,
    shadow,
    sx = {},
    title,
    ...others
  }: any,
  ref: any
) {
  const theme: any = useTheme();
  boxShadow = theme.palette.mode === "dark" ? boxShadow || true : boxShadow;

  return (
    <Card
      elevation={elevation || 0}
      ref={ref}
      {...others}
      sx={{
        border: border ? "1px solid" : "none",
        borderRadius: 2,
        borderColor:
          theme.palette.mode === "dark"
            ? theme.palette.divider
            : theme.palette.grey.A800,
        boxShadow:
          boxShadow && (!border || theme.palette.mode === "dark")
            ? shadow || theme?.customShadows?.z1
            : "inherit",
        ":hover": {
          boxShadow: boxShadow ? shadow || theme?.customShadows?.z1 : "inherit",
        },
        "& pre": {
          m: 0,
          p: "16px !important",
          fontFamily: theme.typography.fontFamily,
          fontSize: "0.75rem",
        },
        ...sx,
      }}
    >
      {/* card header and action */}
      {!darkTitle && title && (
        <CardHeader
          sx={headerSX}
          titleTypographyProps={{ variant: "subtitle1" }}
          title={title}
          action={secondary}
        />
      )}
      {darkTitle && title && (
        <CardHeader
          sx={headerSX}
          title={<Typography variant="h3">{title}</Typography>}
          action={secondary}
        />
      )}

      {/* card content */}
      {content && <CardContent sx={contentSX}>{children}</CardContent>}
      {!content && children}
    </Card>
  );
}

export default forwardRef(MainCard);
