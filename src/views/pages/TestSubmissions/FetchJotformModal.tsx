import React from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

interface FetchJotformModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formIdInput: string;
  setFormIdInput: (val: string) => void;
  syncing: boolean;
}

const FetchJotformModal: React.FC<FetchJotformModalProps> = ({
  open,
  onClose,
  onSubmit,
  formIdInput,
  setFormIdInput,
  syncing,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !syncing && onClose()}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2.5, p: 1 } }}
    >
      <form onSubmit={onSubmit}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: "#1c3260" }}>
          Fetch Jotform Submissions
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the Jotform <strong>Form ID</strong> below to import all
            existing submissions for that form and store them in the{" "}
            <code>testsubmissions</code> table.
          </Typography>
          <TextField
            autoFocus
            label="Jotform Form ID"
            placeholder="e.g. 24123456789012"
            fullWidth
            required
            value={formIdInput}
            onChange={(e) => setFormIdInput(e.target.value)}
            disabled={syncing}
            variant="outlined"
            size="medium"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={onClose}
            disabled={syncing}
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={syncing}
            startIcon={
              syncing ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CloudDownloadIcon />
              )
            }
            sx={{
              bgcolor: "#1c3260",
              "&:hover": { bgcolor: "#152548" },
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            {syncing ? "Fetching..." : "Submit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FetchJotformModal;
