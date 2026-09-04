import React, { useState } from "react";
import { Button, Typography, Box, type DialogProps } from "@mui/material";
import BasicModal from "../../../components/modal";

interface DeleteKeyDialogProps extends DialogProps {
  onClose: () => void;
  keyData: any;
  onDelete: (id: string) => Promise<any>;
  deletePending?: boolean;
}

const DeleteKeyDialog: React.FC<DeleteKeyDialogProps> = ({
  open,
  onClose,
  keyData,
  onDelete,
  deletePending = false,
  ...props
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!keyData) return null;

  const requesterName = keyData.vendor || keyData.whoHasIt || "Key Request";
  const propertyName = keyData.property || "N/A";

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(keyData._id || keyData.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <BasicModal
      open={open}
      onClose={onClose}
      size="xs"
      title="Confirm Delete Request"
      isLoader={isDeleting || deletePending}
      content={
        <Box sx={{ py: 1 }}>
          <Typography variant="body1" sx={{ color: "#334155", mb: 1.5 }}>
            Are you sure you want to delete the key request for{" "}
            <strong>{requesterName}</strong> (Property: <strong>{propertyName}</strong>)?
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#dc2626", fontWeight: 600, display: "block" }}
          >
            ⚠️ Note: This request will be soft-deleted and removed from the active list.
          </Typography>
        </Box>
      }
      actions={
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button
            onClick={onClose}
            disabled={isDeleting || deletePending}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting || deletePending}
            sx={{
              textTransform: "none",
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
            }}
          >
            {isDeleting ? "Deleting..." : "Delete Key Request"}
          </Button>
        </Box>
      }
      {...props}
    />
  );
};

export default DeleteKeyDialog;
