import { Box, Button, CircularProgress, type DialogProps } from "@mui/material";
import { useState } from "react";
import BasicModal from "../../components/modal";

interface Props extends DialogProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  // fileId: any;
  // submissionId: string;
}

const DeleteFileModal = ({ onClose, onConfirm, ...props }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box>
      <BasicModal
        onClose={onClose}
        title="Delete File"
        content="Are you sure you want to permanently delete this file? This action cannot be undone."
        actions={
          <>
            <Button
              variant="contained"
              color="error"
              sx={{ textTransform: "capitalize", minWidth: 90 }}
              onClick={handleConfirm}
              disabled={isDeleting}
              startIcon={
                isDeleting ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              color="error"
              variant="outlined"
              sx={{ textTransform: "capitalize" }}
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </>
        }
        {...props}
      />
    </Box>
  );
};

export default DeleteFileModal;
