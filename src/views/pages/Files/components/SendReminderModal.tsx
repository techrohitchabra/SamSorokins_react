import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import DialogClose from "../../../buttons/DialogClose";
import FormContainer from "../../../components/inputs/FormContainer";
import MuiTextField from "../../../components/inputs/MuiTextField";
import MultilineTextField from "../../../components/inputs/MultilineTextField";

interface Props {
  onClose?: () => void;
  submission: any;
  onSend: (params: {
    submissionId: string;
    recipients: string;
    subject: string;
    content: string;
  }) => Promise<void>;
  isLoading?: boolean;
  [key: string]: any;
}

const SendReminderModal = ({
  onClose,
  submission,
  onSend,
  isLoading = false,
  ...props
}: Props) => {
  const [isSending, setIsSending] = useState(false);

  const defaultValues = useMemo(() => {
    if (!submission) return { recipients: "", subject: "", content: "" };
    const defaultEmail = submission.clientEmail || "";
    const formName = submission.formName || "Upload Form";
    const clientName = submission.clientName || "Resident";
    const propertyName = submission.propertyName || "-";
    const unitName = submission.unitName || "-";

    return {
      recipients: defaultEmail,
      subject: `Reminder: Pending Document Upload for ${formName}`,
      content: `Dear ${clientName},\n\nThis is a friendly reminder that we are still waiting for the required document uploads for the submission details outlined below.\n\nForm Name: ${formName}\nProperty: ${propertyName}\nUnit: ${unitName}\n\nTo prevent any delays in processing, please complete your pending file uploads.\n\nSincerely,\nPremium Property`,
    };
  }, [submission]);

  const handleFormSuccess = async (values: any) => {
    if (!submission?.submissionId) return;
    setIsSending(true);
    try {
      await onSend({
        submissionId: submission.submissionId,
        recipients: values.recipients,
        subject: values.subject,
        content: values.content,
      });
      if (onClose) onClose();
    } finally {
      setIsSending(false);
    }
  };

  const loadingState = isLoading || isSending;

  return (
    <Dialog
      open
      onClose={loadingState ? undefined : onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "12px",
          p: 0,
        },
      }}
      {...props}
    >
      <FormContainer
        defaultValues={defaultValues}
        onSuccess={handleFormSuccess}
      >
        <DialogTitle
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#1c3260",
            fontFamily: "'Poppins', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 2,
            px: 3,
          }}
        >
          <Typography
            component="span"
            variant="h6"
            fontWeight={600}
            color="#1c3260"
          >
            Send Email Reminder
          </Typography>
          <DialogClose onClose={onClose} />
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <MuiTextField
              name="recipients"
              label="Recipients"
              placeholder="e.g. resident@example.com, admin@example.com"
              required
              helperText="Separate multiple email addresses with commas"
            />

            <MuiTextField name="subject" label="Subject" required />

            <MultilineTextField
              name="content"
              label="Content"
              rows={10}
              required
            />
          </Stack>
        </DialogContent>
        <Divider />

        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={loadingState}
            sx={{ textTransform: "capitalize", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loadingState}
            startIcon={
              loadingState ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
            sx={{ textTransform: "capitalize", borderRadius: 2, minWidth: 120 }}
          >
            {loadingState ? "Sending..." : "Send Email"}
          </Button>
        </DialogActions>
      </FormContainer>
    </Dialog>
  );
};

export default SendReminderModal;
