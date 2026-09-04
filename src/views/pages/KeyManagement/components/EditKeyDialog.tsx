import { yupResolver } from "@hookform/resolvers/yup";
import { Button, type DialogProps } from "@mui/material";
import Grid from "@mui/material/Grid";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

import MuiTextField from "../../../components/inputs/MuiTextField";
import MultilineTextField from "../../../components/inputs/MultilineTextField";
import Select from "../../../components/inputs/Select";
import BasicModal from "../../../components/modal";

const STATUS_OPTIONS = [
  { label: "Requested", value: "Requested" },
  { label: "Checked Out", value: "Checked Out" },
  { label: "Checked Out Permanently", value: "Checked Out Permanently" },
  { label: "To Be Returned", value: "To Be Returned" },
  { label: "Checked In", value: "Checked In" },
  { label: "Lost", value: "Lost" },
];

interface EditKeyDialogProps extends DialogProps {
  onClose: () => void;
  keyData: any;
  onUpdate: (
    id: string,
    payload: {
      vendor?: string;
      rfId?: string;
      status?: string;
      lostReason?: string;
    }
  ) => Promise<any>;
  updatePending: boolean;
}

const EditKeyDialog: React.FC<EditKeyDialogProps> = ({
  open,
  onClose,
  keyData,
  onUpdate,
  updatePending,
  ...props
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = useMemo(
    () => ({
      vendor: keyData?.vendor || "",
      rfId: keyData?.rfId || keyData?.frId || "",
      status: keyData?.status || "Checked Out",
      lostReason: keyData?.lostReason || "",
    }),
    [keyData]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        vendor: Yup.string().required("Vendor is required"),
        rfId: Yup.string().required("RFID/ Key ID is required"),
        status: Yup.string().required("Status is required"),
        lostReason: Yup.string().when("status", {
          is: "Lost",
          then: (schema) =>
            schema.required(
              "Reason & Action Taken is required when status is Lost"
            ),
          otherwise: (schema) => schema.optional(),
        }),
      }),
    []
  );

  const formContext = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema as any),
  });

  const { watch, reset } = formContext;
  const watchStatus = watch("status");

  useEffect(() => {
    if (keyData) {
      reset({
        vendor: keyData.vendor || "",
        rfId: keyData.rfId || keyData.frId || "",
        status: keyData.status || "Checked Out",
        lostReason: keyData.lostReason || "",
      });
    }
  }, [keyData, reset]);

  const onFormSubmit = async (values: any) => {
    if (!keyData) return;
    setIsSubmitting(true);
    try {
      await onUpdate(keyData._id, {
        vendor: values.vendor.trim(),
        rfId: values.rfId.trim(),
        status: values.status,
        lostReason:
          values.status === "Lost"
            ? values.lostReason.trim()
            : values.lostReason?.trim() || "",
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BasicModal
      open={open}
      onClose={onClose}
      size="sm"
      title="Update Request Status & Vendor"
      isLoader={isSubmitting || updatePending}
      formContext={formContext}
      onSubmit={formContext.handleSubmit(onFormSubmit)}
      content={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <MuiTextField
              name="vendor"
              label="Vendor"
              required
              // disabled={isSubmitting}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MultilineTextField name="rfId" label="RFID/ Key ID" required />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Select
              name="status"
              label="Key Status"
              options={STATUS_OPTIONS}
              disabled={isSubmitting}
            />
          </Grid>
          {watchStatus === "Lost" && (
            <Grid size={{ xs: 12 }}>
              <MultilineTextField
                name="lostReason"
                label="Reason & Decision (What happened & action taken)"
                required
                rows={3}
                placeholder="Explain what happened to the key and what was decided..."
                disabled={isSubmitting}
              />
            </Grid>
          )}
        </Grid>
      }
      actions={
        <Grid
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <Button
            onClick={onClose}
            sx={{ textTransform: "none", color: "#64748b" }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              bgcolor: "#3b82f6",
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            {isSubmitting ? "Updating..." : "Update Details"}
          </Button>
        </Grid>
      }
      {...props}
    />
  );
};

export default EditKeyDialog;
