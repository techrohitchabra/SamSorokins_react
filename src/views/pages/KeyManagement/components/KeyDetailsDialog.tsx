import React from "react";
import {
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  Button,
  type DialogProps,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import BasicModal from "../../../components/modal";

interface KeyDetailsDialogProps extends DialogProps {
  onClose: () => void;
  keyData: any;
}

const KeyDetailsDialog: React.FC<KeyDetailsDialogProps> = ({
  open,
  onClose,
  keyData,
  ...props
}) => {
  if (!keyData) return null;

  const requestType = keyData.requestType || keyData.userType || "Vendor";
  const isNonVendor = requestType === "Non-Vendor";
  const isKeysForOther = (keyData.areKeysForYou || "").toLowerCase() === "no";
  const isNotReturned = (keyData.willBeReturned || "").toLowerCase() === "no";

  return (
    <BasicModal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <Box>
          Key Request Details
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "#64748b",
              fontWeight: 400,
              mt: 0.5,
            }}
          >
            Status: {keyData.status} | Created:{" "}
            {keyData.createdAt && new Date(keyData.createdAt).toLocaleString()}
          </Typography>
        </Box>
      }
      content={
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          {/* Main Key Parameters */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper
              sx={{
                p: 2,
                border: "1px solid #e2e8f0",
                borderRadius: 2.5,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}
              >
                Request Fields
              </Typography>
              <Box
                display="flex"
                flexDirection="column"
                gap={1.2}
                sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2 }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" color="textSecondary">
                    Request / User Type
                  </Typography>
                  <Chip
                    label={requestType}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      bgcolor: isNonVendor ? "#fef3c7" : "#dcfce7",
                      color: isNonVendor ? "#b45309" : "#15803d",
                      border: `1px solid ${
                        isNonVendor ? "#fde68a" : "#bbf7d0"
                      }`,
                    }}
                  />
                </Box>
                <Divider />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Requester Name
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {keyData.vendor || "-"}
                  </Typography>
                </Box>
                <Divider />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Property
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {keyData.property || "-"}
                  </Typography>
                </Box>
                <Divider />

                {keyData.unit && (
                  <>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        Unit
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#0284c7" }}
                      >
                        {keyData.unit}
                      </Typography>
                    </Box>
                    <Divider />
                  </>
                )}

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Requester Phone
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {keyData.phoneNumber || "-"}
                  </Typography>
                </Box>
                <Divider />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Requester Email
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {keyData.email || "-"}
                  </Typography>
                </Box>
                <Divider />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Repairs Email
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {keyData?.repairsEmail || "repairs@premiumpd.com"}
                  </Typography>
                </Box>
                <Divider />

                {keyData.purpose && (
                  <>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        Purpose
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {keyData.purpose}
                      </Typography>
                    </Box>
                    <Divider />
                  </>
                )}

                {keyData.serviceIssue && (
                  <>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        Service Issue #
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {keyData.serviceIssue}
                      </Typography>
                    </Box>
                    <Divider />
                  </>
                )}

                {keyData.fullAddress && (
                  <>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        Full Address
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {keyData.fullAddress}
                      </Typography>
                    </Box>
                    <Divider />
                  </>
                )}

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="textSecondary">
                    Pick Up Date & Time
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#2563eb" }}
                  >
                    {keyData.pickUpDateTime || "-"}
                  </Typography>
                </Box>
                <Divider />

                {keyData.areKeysForYou && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="textSecondary">
                      Are Keys for You?
                    </Typography>
                    <Chip
                      label={keyData.areKeysForYou}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        bgcolor: isKeysForOther ? "#f3e8ff" : "#e0f2fe",
                        color: isKeysForOther ? "#7e22ce" : "#0284c7",
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Dedicated Picker Information Card when areKeysForYou is No */}
              {isKeysForOther && (
                <Paper
                  sx={{
                    p: 2,
                    border: "1.5px solid #ddd6fe",
                    bgcolor: "#f5f3ff",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#6d28d9", mb: 1 }}
                  >
                    👤 Designated Key Picker Information
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        Who Will Pick Up?
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: "#6d28d9" }}
                      >
                        {keyData.whoWillPickUp || "-"}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        Picker Phone Number
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {keyData.pickerPhoneNumber || "-"}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="textSecondary">
                        Picker Email
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {keyData.pickerEmail || "-"}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}

              {/* Return Policy Card when Will They Be Returned is No */}
              {isNotReturned && (
                <Paper
                  sx={{
                    p: 2,
                    border: "1.5px solid #fecaca",
                    bgcolor: "#fef2f2",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#dc2626", mb: 1 }}
                  >
                    🔄 Return Policy: Will Not Be Returned
                  </Typography>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="textSecondary">
                      Why Not Returned?
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#991b1b" }}
                    >
                      {keyData.whyNotReturned || "Not specified"}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Paper>
          </Grid>

          {/* Keys Needed & Audit Logs */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box display="flex" flexDirection="column" gap={2} height="100%">
              {/* Keys Needed Textarea output */}
              <Paper
                sx={{
                  p: 2,
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}
                >
                  Keys Needed
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 2,
                    fontFamily: "monospace",
                    fontSize: 13,
                    whiteSpace: "pre-wrap",
                    color: "#0f172a",
                    minHeight: 60,
                  }}
                >
                  {keyData.keysNeeded || "N/A"}
                </Box>
              </Paper>

              {/* Audit Logs */}
              <Paper
                sx={{
                  p: 2,
                  border: "1px solid #e2e8f0",
                  borderRadius: 2.5,
                  flexGrow: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5 }}
                >
                  Access Audit Logs
                </Typography>
                <Box
                  sx={{
                    pl: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    borderLeft: "2px solid #e2e8f0",
                    // maxHeight: 220,
                    height: "100%",
                    overflowY: "auto",
                  }}
                >
                  {keyData.accessLog?.map((log: string, idx: number) => (
                    <Box key={idx} sx={{ position: "relative", pl: 2 }}>
                      <Box
                        sx={{
                          position: "absolute",
                          left: -13.5,
                          top: 5,
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          bgcolor:
                            idx === keyData.accessLog.length - 1
                              ? "#3b82f6"
                              : "#cbd5e1",
                          border: "2px solid #ffffff",
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#64748b",
                          display: "block",
                          fontWeight: 600,
                        }}
                      >
                        Step {idx + 1}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#334155", mt: 0.2 }}
                      >
                        {log}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Grid>

          {/* Lost Key Reason section */}
          {keyData.lostReason && (
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{
                  p: 2,
                  border: "1.5px solid #fca5a5",
                  bgcolor: "#fff5f5",
                  borderRadius: 2.5,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#991b1b", mb: 1 }}
                >
                  ⚠️ Lost Key Reason & Action Taken
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#7f1d1d", whiteSpace: "pre-wrap" }}
                >
                  {keyData.lostReason}
                </Typography>
              </Paper>
            </Grid>
          )}

          {/* Raw JSON Webhook Payload */}
          {/* {keyData.rawData && Object.keys(keyData.rawData).length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Paper
                sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2.5 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#1e293b", mb: 1.5 }}
                >
                  Raw Webhook Payload Data
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#0f172a",
                    color: "#38bdf8",
                    borderRadius: 2,
                    overflowX: "auto",
                    fontFamily: "Courier, monospace",
                    fontSize: 11.5,
                    maxHeight: 200,
                  }}
                >
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {JSON.stringify(keyData.rawData, null, 2)}
                  </pre>
                </Box>
              </Paper>
            </Grid>
          )} */}
        </Grid>
      }
      actions={
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ textTransform: "none", bgcolor: "#3b82f6" }}
        >
          Close Details
        </Button>
      }
      {...props}
    />
  );
};

export default KeyDetailsDialog;
