import { Box, Button, CircularProgress, type DialogProps } from "@mui/material";
import { useState } from "react";
import BasicModal from "../../components/modal";

interface Props extends DialogProps {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  submissionId?: string;
}

const DeleteTestSubmissionModal = ({
  onClose,
  onConfirm,
  submissionId,
  ...props
}: Props) => {
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
        title="Confirm Permanent Delete"
        content={`Are you sure you want to permanently delete submission ID ${
          submissionId || ""
        }? This action cannot be undone.`}
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
              {isDeleting ? "Deleting..." : "Delete Permanently"}
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

export default DeleteTestSubmissionModal;
