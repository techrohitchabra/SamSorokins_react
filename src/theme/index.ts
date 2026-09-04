import { createTheme } from "@mui/material/styles";

import { red, green, blue } from "@mui/material/colors";
/**
 * Create a custom theme for the project
 * @component CustomTheme
 * @author Sanjay
 *
 */

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      50: blue[50], // Adjust for dark mode
      100: blue[100],
      200: blue[200],
      light: blue[300],
      400: blue[400],
      main: blue[500], // Adjust contrast
      dark: blue[600],
      700: blue[700],
      900: blue[900],
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
    error: {
      light: red[200],
      main: red[500],
      dark: red[700],
      contrastText: "#fff",
    },
    success: {
      light: green[200],
      main: green[500],
      dark: green[700],
      contrastText: "#fff",
    },
    // background: {
    //   default:  "#ffffff" ,
    //   paper:  "#f5f5f5",
    // },
    text: {
      primary: "#000000",
      secondary: "#4f4f4f",
    },
  },
  typography: {
    fontFamily: "Public Sans, sans-serif",
    htmlFontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontWeight: 600,
      fontSize: "2.375rem",
      lineHeight: 1.21,
    },
    h2: {
      fontWeight: 600,
      fontSize: "1.875rem",
      lineHeight: 1.27,
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.33,
      color: "#262626",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.5,
      color: "#262626",
    },
    h6: {
      fontWeight: 400,
      fontSize: "0.875rem",
      lineHeight: 1.57,
    },
    caption: {
      fontWeight: 400,
      fontSize: "0.75rem",
      lineHeight: 1.66,
    },
    body1: {
      fontSize: "0.875rem",
      lineHeight: 1.57,
    },
    body2: {
      fontSize: "0.75rem",
      lineHeight: 1.66,
    },
    subtitle1: {
      fontSize: "0.875rem",
      fontWeight: 600,
      lineHeight: 1.57,
      color: "#262626",
      fontFamily: "Public Sans, sans-serif",
    },
    subtitle2: {
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.66,
    },
    overline: {
      lineHeight: 1.66,
    },
    button: {
      textTransform: "capitalize",
    },
  },
});

export default theme;
