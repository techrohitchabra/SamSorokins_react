import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
// import HeaderProfile from "./HeaderProfile";
// assets
import FormatIndentDecreaseIcon from "@mui/icons-material/FormatIndentDecrease";
import FormatIndentIncreaseIcon from "@mui/icons-material/FormatIndentIncrease";
import HeaderProfile from "./HeaderProfile";

// Props
type Props = {
  onDrawerToggle: () => void;
  open: boolean;
  isLargeScreen: boolean;
  userName: string;
  // walletPrice: number;
  // userRole: string;
};

//Set the drawer width
const DRAWER_WIDTH_OPEN = 200;
const DRAWER_WIDTH_COLLAPSED = 72;

/**
 * Styled AppBar component that adjusts layout based on drawer state and screen size
 */
const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "isLargeScreen",
})<{ open: boolean; isLargeScreen: boolean }>(
  ({ theme, open, isLargeScreen }) => ({
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(isLargeScreen && {
      zIndex: theme.zIndex.drawer + 1,
      marginLeft: open ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_COLLAPSED,
      width: `calc(100% - ${
        open ? DRAWER_WIDTH_OPEN : DRAWER_WIDTH_COLLAPSED
      }px)`,
    }),
  })
);

/**
 * Main header component (Navbar)
 * @component Header
 * @author Sanjay
 *
 */
const Header = ({ onDrawerToggle, open, isLargeScreen, userName }: Props) => {
  return (
    <StyledAppBar
      position="fixed"
      open={open}
      isLargeScreen={isLargeScreen}
      sx={{ bgcolor: "#1c3260" }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2 }}
        >
          {!open ? <FormatIndentIncreaseIcon /> : <FormatIndentDecreaseIcon />}
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {/* My App */}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* {userRole === "CLIENT" && (
            <Typography variant="h5" sx={{ mr: 1, color: "white" }}>
              Wallet: ${walletPrice}
            </Typography>
          )} */}
          <Typography variant="h6" sx={{ mr: 1, color: "white" }}>
            {/* Hi, {userName} */}
            {userName}
          </Typography>
          <HeaderProfile />
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;
