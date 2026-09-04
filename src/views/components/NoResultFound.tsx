import { Box, Typography } from "@mui/material";

const NoResultFound = ({ children, ...props }: any) => (
  <Box
    sx={{
      background: "#d9edf7",
      borderRadius: "10px",
      textAlign: "center",
      py: 5,
    }}
    {...props}
  >
    <Typography variant="subtitle1">{children}</Typography>
  </Box>
);

export default NoResultFound;
