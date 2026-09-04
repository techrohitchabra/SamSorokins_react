// SubmitButton.js
import { Button } from "@mui/material";
// import { color } from "../../../constants/colors";

/**
 *  customizable button component designed for form submission.
 * @component SubmitButton
 * @author Sanjay
 *
 */
export default function SubmitButton({
  variant = "contained",
  type = "submit",
  sx = {},
  children,
  ...props
}: any) {
  return (
    <Button
      variant={variant}
      type={type}
      sx={{
        borderRadius: "5px",
        // backgroundColor: color.dark,
        // "&:hover": { bgcolor: color.dark },
        fontFamily: "'Poppins', sans-serif",
        fontSize: "15px",
        fontWeight: 500,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
