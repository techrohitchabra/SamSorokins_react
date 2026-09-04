import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  // DialogProps,
  Typography,
  Box,
  Stack,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import type { DialogProps } from "@mui/material";
import FormContainer from "../inputs/FormContainer";
import DialogClose from "../../buttons/DialogClose";

interface Props extends DialogProps {
  onClose?: () => void;
  title?: any;
  content: any;
  actions?: any;
  formContext?: any;
  onSubmit?: any;
  size?: any;
  isLoader?: boolean;
  style?: any;
  height?: any;
  isDownloading?: boolean;
  loadingTitle?: any;
}

/**
 * Custom Basic Modal component
 * @component BasicModal
 * @author Sanjay
 *
 */

const BasicModal = ({
  isLoader = false,
  isDownloading = false,
  title,
  content,
  actions,
  onClose,
  formContext,
  onSubmit,
  size,
  style,
  height,
  loadingTitle,
  ...props
}: Props) => {
  return (
    <Dialog
      onClose={onClose}
      maxWidth={size ? size : "sm"}
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "15px",
          p: 0,
          ...style,
        },
      }}
      {...props}
    >
      <FormContainer formContext={formContext} onSuccess={onSubmit}>
        <DialogTitle
          sx={{
            fontSize: "20px",
            color: "#364152",
            fontWeight: 600,
            fontFamily: "'Noto Sans Arabic', sans-serif",
            zIndex: 1050,
          }}
        >
          {title}
          <DialogClose onClose={onClose} />
        </DialogTitle>
        {isDownloading ? <LinearProgress /> : <Divider />}

        {isLoader && (
          <Stack
            justifyContent={"space-between"}
            position={"absolute"}
            sx={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              alignItems: "center",
              zIndex: 1400,
            }}
          >
            <Box>
              <CircularProgress />
            </Box>
            <Typography
              sx={{
                color: "#2e7d32",
                fontWeight: "bold",
              }}
            >
              {loadingTitle}
            </Typography>
          </Stack>
        )}
        <DialogContent
          sx={{
            color: "#364152",
            maxHeight: height ? height : 450,
            fontSize: "16px",
            fontWeight: 500,
            fontFamily: "'Poppins', sans-serif",
            position: "relative", // Ensure the spinner is positioned correctly
            filter: isLoader ? "blur(0.8px)" : "none", // Apply blur when loader is true
            pointerEvents: isLoader ? "none" : "auto", // Disable interaction when loader is true
          }}
        >
          {content}
        </DialogContent>
        <Divider />
        <DialogActions>{actions}</DialogActions>
      </FormContainer>
    </Dialog>
  );
};

export default BasicModal;
