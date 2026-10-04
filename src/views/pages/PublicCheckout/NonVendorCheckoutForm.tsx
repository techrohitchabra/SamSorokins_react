import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Grid, Typography, LinearProgress } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import axios from "axios";
import { useSnackbarHelper } from "../../components/snackbar";
import BasicAutocomplete from "../../components/inputs/BasicAutocomplete";
import MuiTextField from "../../components/inputs/MuiTextField";
import Select from "../../components/inputs/Select";
import BasicDatePicker from "../../components/inputs/BasicDatePicker";
import MultilineTextField from "../../components/inputs/MultilineTextField";

const API_URL = import.meta.env.VITE_API_URL || "";

// const STATUS_OPTIONS = [
//   { label: "Requested", value: "Requested" },
//   { label: "Checked Out", value: "Checked Out" },
//   { label: "Checked Out Permanently", value: "Checked Out Permanently" },
//   { label: "To Be Returned", value: "To Be Returned" },
//   { label: "Checked In", value: "Checked In" },
//   { label: "Lost", value: "Lost" },
// ];

const YES_NO_OPTIONS = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

const PURPOSE_OPTIONS = [
  { label: "Inspection - ASPI", value: "Inspection - ASPI" },
  { label: "Inspection - Insurance", value: "Inspection - Insurance" },
  { label: "Leasing", value: "Leasing" },
  { label: "Move In", value: "Move In" },
  { label: "Move Out", value: "Move Out" },
  { label: "Turnover", value: "Turnover" },
  { label: "Other", value: "Other" },
];

export interface OptionType {
  label: string;
  value: string;
  propertyId?: string | number;
  fullAddress?: string;
  phoneNumber?: string;
  email?: string;
}

interface NonVendorCheckoutFormProps {
  onSuccess?: () => void;
}

const NonVendorCheckoutForm: React.FC<NonVendorCheckoutFormProps> = ({
  onSuccess,
}) => {
  const showSnackbar = useSnackbarHelper();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options state
  const [userOptions, setUserOptions] = useState<OptionType[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<OptionType[]>([]);
  const [rawRMProperties, setRawRMProperties] = useState<OptionType[]>([]);
  const [unitOptions, setUnitOptions] = useState<OptionType[]>([]);

  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const initialValues = useMemo(
    () => ({
      userType: "Non-Vendor",
      vendor: "",
      vendorDescription: "",
      property: "",
      unit: "",
      phoneNumber: "",
      email: "",
      repairsEmail: "repairs@premiumpd.com",
      fullAddress: "",
      pickUpDateTime: Date.now(),
      byWhen: null,
      keysNeeded: "",
      rfId: "",
      status: "Requested",
      lostReason: "",
      purpose: "Inspection - ASPI",
      purposeDescription: "",
      areKeysForYou: "Yes",
      whoWillPickUp: "",
      pickerPhoneNumber: "",
      pickerEmail: "",
      willBeReturned: "Yes",
      whyNotReturned: "",
    }),
    []
  );

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        vendor: Yup.string().required("Requester Name is required"),
        vendorDescription: Yup.string().when("vendor", {
          is: (val: any) => {
            const vStr =
              typeof val === "object" ? val?.value : String(val || "");
            return vStr === "Other";
          },
          then: (schema) =>
            schema.required("Specify Requester Name is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        property: Yup.string().required("Property is required"),
        unit: Yup.string(),
        phoneNumber: Yup.string().required("Phone Number is required"),
        email: Yup.string()
          .email("Invalid email format")
          .required("Email is required"),
        repairsEmail: Yup.string()
          .email("Invalid email format")
          .required("Repairs Email is required"),
        purpose: Yup.string().required("Purpose is required"),
        purposeDescription: Yup.string().when("purpose", {
          is: "Other",
          then: (schema) => schema.required("Specify Purpose is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        pickUpDateTime: Yup.mixed().required("Pick Up Date is required"),
        byWhen: Yup.mixed().nullable(),
        keysNeeded: Yup.string(),
        rfId: Yup.string().when("status", {
          is: (val: string) => val !== "Checked Out Permanently",
          then: (schema) => schema.required("RFID / Key ID is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        status: Yup.string().required("Key Status is required"),
        lostReason: Yup.string().when("status", {
          is: "Lost",
          then: (schema) => schema.required("Reason is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        areKeysForYou: Yup.string().default("Yes"),
        willBeReturned: Yup.string().default("Yes"),
        whoWillPickUp: Yup.string().when("areKeysForYou", {
          is: "No",
          then: (schema) => schema.required("Picker Name is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        pickerPhoneNumber: Yup.string().when("areKeysForYou", {
          is: "No",
          then: (schema) => schema.required("Picker Phone Number is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        pickerEmail: Yup.string().when("areKeysForYou", {
          is: "No",
          then: (schema) =>
            schema.email("Invalid email").required("Picker Email is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
        whyNotReturned: Yup.string().when("willBeReturned", {
          is: "No",
          then: (schema) =>
            schema.required("Reason why not returned is required"),
          otherwise: (schema) => schema.notRequired(),
        }),
      }),
    []
  );

  const formContext = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
    mode: "onChange",
  });

  const { watch, setValue, reset } = formContext;

  const currentVendor = watch("vendor");
  const selectedProperty = watch("property");
  const currentStatus = watch("status");
  const currentPurpose = watch("purpose");
  const areKeysForYou = watch("areKeysForYou");
  const willBeReturned = watch("willBeReturned");

  const isOtherVendor =
    (typeof currentVendor === "object"
      ? (currentVendor as any)?.value
      : currentVendor) === "Other";

  const isKeysForOther = areKeysForYou === "No";
  const isNotReturned = willBeReturned === "No";

  // Auto-fill Contact Info on User Selection
  useEffect(() => {
    const vendorValStr =
      typeof currentVendor === "object"
        ? (currentVendor as any)?.value || (currentVendor as any)?.label || ""
        : String(currentVendor || "");

    if (!vendorValStr || vendorValStr === "Other") {
      setValue("email", "");
      setValue("phoneNumber", "");
      return;
    }

    const matchedOpt = userOptions.find(
      (opt) =>
        opt.value === vendorValStr ||
        opt.label.toLowerCase() === vendorValStr.toLowerCase()
    );

    if (matchedOpt) {
      setValue("email", matchedOpt.email || "");
      setValue("phoneNumber", matchedOpt.phoneNumber || "");
    }
  }, [currentVendor, userOptions, setValue]);

  // Initial load for Rent Manager data
  useEffect(() => {
    reset(initialValues);
    let isMounted = true;

    // Fetch Users
    setLoadingUsers(true);
    axios
      .get(`${API_URL}/rentManager/users`)
      .then((res) => {
        if (!isMounted) return;
        const uList = res.data?.users || [];
        if (Array.isArray(uList) && uList.length > 0) {
          const mapped: OptionType[] = uList
            .map((u: any) => {
              const displayName =
                u.Name ||
                [u.Firstname, u.Lastname].filter(Boolean).join(" ") ||
                u.Username ||
                `User ${u.UserID}`;
              const email = u.Email || "";
              const phoneObjs = Array.isArray(u.PhoneNumbers)
                ? u.PhoneNumbers
                : [];
              const primaryPhone =
                phoneObjs.find((p: any) => p.IsPrimary) || phoneObjs[0];
              const phoneNumber =
                primaryPhone?.PhoneNumber ||
                primaryPhone?.StrippedPhoneNumber ||
                "";
              return {
                label: displayName,
                value: displayName,
                vendorId: u.UserID,
                email,
                phoneNumber,
              };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
          mapped.push({ label: "Other", value: "Other" });
          setUserOptions(mapped);
        } else {
          setUserOptions([{ label: "Other", value: "Other" }]);
        }
      })
      .catch(() => setUserOptions([{ label: "Other", value: "Other" }]))
      .finally(() => isMounted && setLoadingUsers(false));

    // Fetch Properties
    setLoadingProperties(true);
    axios
      .get(`${API_URL}/rentManager/properties`)
      .then((res) => {
        if (!isMounted) return;
        const pList = res.data?.properties || [];
        if (Array.isArray(pList) && pList.length > 0) {
          const mapped: OptionType[] = pList
            .map((item: any) => {
              const propId =
                item.PropertyID ||
                item.ParentID ||
                item.Property?.PropertyID ||
                "";
              const propName =
                item.Value ||
                item.Name ||
                item.Property?.Name ||
                item.Property?.Code ||
                "";
              return {
                label: propName,
                value: propName,
                propertyId: propId,
              };
            })
            .filter((p) => p.value)
            .sort((a, b) => a.label.localeCompare(b.label));
          setRawRMProperties(mapped);
          setPropertyOptions(mapped);
        }
      })
      .catch(() => {})
      .finally(() => isMounted && setLoadingProperties(false));

    return () => {
      isMounted = false;
    };
  }, [reset, initialValues]);

  // Dynamic Units fetch
  useEffect(() => {
    if (!selectedProperty) {
      setUnitOptions([]);
      return;
    }

    const propVal =
      typeof selectedProperty === "object"
        ? (selectedProperty as any)?.value || ""
        : String(selectedProperty);

    if (!propVal.trim()) {
      setUnitOptions([]);
      return;
    }

    const matchedProp =
      propertyOptions.find(
        (p) => p.value.toLowerCase() === propVal.trim().toLowerCase()
      ) ||
      rawRMProperties.find(
        (p) => p.value.toLowerCase() === propVal.trim().toLowerCase()
      );

    const propId = matchedProp?.propertyId;
    if (propId) {
      setLoadingUnits(true);
      axios
        .get(`${API_URL}/rentManager/units`, { params: { propertyId: propId } })
        .then((res) => {
          const unitsData = res.data?.units || [];
          if (Array.isArray(unitsData) && unitsData.length > 0) {
            const mappedUnits = unitsData
              .map((u: any) => {
                const unitLabel = u.Name || u.UnitNumber || `Unit ${u.UnitID}`;
                return { label: unitLabel, value: unitLabel };
              })
              .sort((a, b) => a.label.localeCompare(b.label));
            setUnitOptions(mappedUnits);
          } else {
            setUnitOptions([]);
          }
        })
        .catch(() => setUnitOptions([]))
        .finally(() => setLoadingUnits(false));
    }
  }, [selectedProperty, propertyOptions, rawRMProperties]);

  const onFormSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const propVal =
        typeof values.property === "object"
          ? values.property?.value || ""
          : values.property || "";
      const rawVendorVal =
        typeof values.vendor === "object"
          ? values.vendor?.value || ""
          : values.vendor || "";
      const finalVendorVal =
        rawVendorVal === "Other" && values.vendorDescription?.trim()
          ? values.vendorDescription.trim()
          : rawVendorVal;
      const unitVal =
        typeof values.unit === "object"
          ? values.unit?.value || ""
          : values.unit || "";
      const byWhenFormatted = values.byWhen
        ? dayjs(values.byWhen).isValid()
          ? dayjs(values.byWhen).format("MM/DD/YYYY")
          : String(values.byWhen)
        : "";
      const pickUpFormatted = values.pickUpDateTime
        ? dayjs(values.pickUpDateTime).isValid()
          ? dayjs(values.pickUpDateTime).format("MM/DD/YYYY")
          : String(values.pickUpDateTime)
        : "";
      const finalPurpose =
        values.purpose === "Other" && values.purposeDescription?.trim()
          ? `Other - ${values.purposeDescription.trim()}`
          : values.purpose || "";

      const payload = {
        userType: "Non-Vendor",
        vendor: finalVendorVal.trim(),
        phoneNumber: values.phoneNumber?.trim() || "",
        email: values.email?.trim() || "",
        repairsEmail: values.repairsEmail?.trim() || "repairs@premiumpd.com",
        property: propVal.trim(),
        unit: unitVal.trim(),
        pickUpDateTime: pickUpFormatted,
        byWhen: byWhenFormatted,
        keysNeeded: values.keysNeeded?.trim() || "",
        rfId: values.rfId?.trim() || "",
        status: values.status,
        lostReason: values.status === "Lost" ? values.lostReason?.trim() : "",
        purpose: finalPurpose,
        purposeDescription: values.purposeDescription?.trim() || "",
        areKeysForYou: values.areKeysForYou || "Yes",
        whoWillPickUp: isKeysForOther ? values.whoWillPickUp?.trim() : "",
        pickerPhoneNumber: isKeysForOther
          ? values.pickerPhoneNumber?.trim()
          : "",
        pickerEmail: isKeysForOther ? values.pickerEmail?.trim() : "",
        willBeReturned: values.willBeReturned || "Yes",
        whyNotReturned: isNotReturned ? values.whyNotReturned?.trim() : "",
        createdBy: null,
      };

      const res = await axios.post(
        `${API_URL}/keys/public-checkout/non-vendor`,
        payload
      );

      if (res.data?.success ?? true) {
        // showSnackbar(
        //   "Non-Vendor key request submitted successfully!",
        //   "success"
        // );
        reset(initialValues);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.message ||
          "Failed to submit non-vendor key request",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading =
    isSubmitting || loadingUsers || loadingProperties || loadingUnits;

  return (
    <FormProvider {...formContext}>
      <Box
        component="form"
        onSubmit={formContext.handleSubmit(onFormSubmit)}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: { xs: "calc(100vh - 160px)", sm: "calc(100vh - 150px)" },
          minHeight: { xs: 450, sm: 520 },
          width: "100%",
        }}
      >
        {isLoading && <LinearProgress sx={{ mb: 1.5, borderRadius: 1 }} />}

        {/* Scrollable Fields Container */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: { xs: 0.5, sm: 1.5 },
            py: 0.5,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f5f9",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: "8px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#94a3b8",
            },
          }}
        >
          {/* EVERY field uses size={{ xs: 12 }} so in one row ONLY ONE field is displayed */}
          <Grid container spacing={2}>
            {/* Requester Name Dropdown */}
            <Grid size={{ xs: 12 }}>
              <BasicAutocomplete
                name="vendor"
                label="Requester Name"
                required
                options={userOptions}
                getOptionValue={(option: any) =>
                  typeof option === "string" ? option : option?.value || ""
                }
                placeholder={
                  loadingUsers ? "Loading RM Users..." : "Select user..."
                }
                disabled={isSubmitting}
              />
            </Grid>

            {/* Specify Requester Name if "Other" */}
            {isOtherVendor && (
              <Grid size={{ xs: 12 }}>
                <MuiTextField
                  name="vendorDescription"
                  label="Specify Requester Name"
                  required
                  placeholder="e.g. John Doe"
                  disabled={isSubmitting}
                />
              </Grid>
            )}

            {/* Property */}
            <Grid size={{ xs: 12 }}>
              <BasicAutocomplete
                name="property"
                label="Property"
                required
                options={propertyOptions}
                getOptionValue={(option: any) =>
                  typeof option === "string" ? option : option?.value || ""
                }
                placeholder={
                  loadingProperties
                    ? "Loading RM Properties..."
                    : "Select property..."
                }
                disabled={isSubmitting}
              />
            </Grid>

            {/* Unit */}
            <Grid size={{ xs: 12 }}>
              <BasicAutocomplete
                name="unit"
                label="Unit"
                loading={loadingUnits}
                loadingText="Loading Units..."
                options={unitOptions}
                getOptionValue={(option: any) =>
                  typeof option === "string" ? option : option?.value || ""
                }
                placeholder={
                  loadingUnits
                    ? "Loading Units for property..."
                    : unitOptions.length > 0
                    ? "Select unit..."
                    : "Select property to view units..."
                }
                disabled={isSubmitting}
              />
            </Grid>

            {/* Phone Number */}
            <Grid size={{ xs: 12 }}>
              <MuiTextField
                name="phoneNumber"
                label="Phone Number"
                placeholder="e.g. (211) 111-11100"
                disabled={isSubmitting}
                required
                inputProps={{ maxLength: 25 }}
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12 }}>
              <MuiTextField
                name="email"
                label="Email"
                placeholder="e.g. test@example.com"
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* Purpose */}
            <Grid size={{ xs: 12 }}>
              <Select
                name="purpose"
                label="Purpose"
                options={PURPOSE_OPTIONS}
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* Specify Purpose */}
            {currentPurpose === "Other" && (
              <Grid size={{ xs: 12 }}>
                <MuiTextField
                  name="purposeDescription"
                  label="Specify Purpose"
                  placeholder="e.g. Custom Purpose Reason..."
                  disabled={isSubmitting}
                  required
                />
              </Grid>
            )}

            {/* Pick Up Date */}
            <Grid size={{ xs: 12 }}>
              <BasicDatePicker
                name="pickUpDateTime"
                label="Pick Up Date"
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* By When Date */}
            <Grid size={{ xs: 12 }}>
              <BasicDatePicker
                name="byWhen"
                label="By When (Date)"
                disabled={isSubmitting}
              />
            </Grid>

            {/* Key Status */}
            {/* <Grid size={{ xs: 12 }}>
              <Select
                name="status"
                label="Key Status"
                options={STATUS_OPTIONS}
                disabled={isSubmitting}
                required
              />
            </Grid> */}

            {/* Repairs Email */}
            {/* <Grid size={{ xs: 12 }}>
              <MuiTextField
                name="repairsEmail"
                label="Repairs Email"
                placeholder="e.g. repairs@premiumpd.com"
                disabled={isSubmitting}
                required
              />
            </Grid> */}

            {/* RFID/ Key ID */}
            {currentStatus !== "Checked Out Permanently" && (
              <Grid size={{ xs: 12 }}>
                <MultilineTextField
                  name="rfId"
                  label="RFID/ Key ID"
                  rows={3}
                  disabled={isSubmitting}
                  required={currentStatus !== "Checked Out Permanently"}
                />
              </Grid>
            )}

            {/* Keys Needed */}
            <Grid size={{ xs: 12 }}>
              <MultilineTextField
                name="keysNeeded"
                label="Keys Needed"
                rows={3}
                placeholder="List the Units and Types of Keys Needed"
                disabled={isSubmitting}
              />
            </Grid>

            {/* Are the Keys for You? */}
            <Grid size={{ xs: 12 }}>
              <Select
                name="areKeysForYou"
                label="Are the Keys for You?"
                options={YES_NO_OPTIONS}
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* Will they be returned? */}
            <Grid size={{ xs: 12 }}>
              <Select
                name="willBeReturned"
                label="Will they be returned?"
                options={YES_NO_OPTIONS}
                disabled={isSubmitting}
                required
              />
            </Grid>

            {/* Designated Key Picker Info (if Are Keys For You === No) */}
            {isKeysForOther && (
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#f5f3ff",
                    border: "1.5px solid #ddd6fe",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#6d28d9", mb: 1.5 }}
                  >
                    Designated Key Picker Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <MuiTextField
                        name="whoWillPickUp"
                        label="Who will pick them up?"
                        placeholder="Picker's Full Name"
                        disabled={isSubmitting}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <MuiTextField
                        name="pickerPhoneNumber"
                        label="Picker Phone Number"
                        placeholder="e.g. (211) 111-11100"
                        disabled={isSubmitting}
                        required
                        inputProps={{ maxLength: 25 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <MuiTextField
                        name="pickerEmail"
                        label="Picker Email"
                        placeholder="picker@example.com"
                        disabled={isSubmitting}
                        required
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}

            {/* Reason Why Not Returned (if Will Be Returned === No) */}
            {isNotReturned && (
              <Grid size={{ xs: 12 }}>
                <MultilineTextField
                  name="whyNotReturned"
                  label="Why? (Reason why keys won't be returned)"
                  rows={2}
                  placeholder="Provide reason why keys will not be returned..."
                  disabled={isSubmitting}
                  required
                />
              </Grid>
            )}

            {/* Lost Reason if status is Lost */}
            {currentStatus === "Lost" && (
              <Grid size={{ xs: 12 }}>
                <MultilineTextField
                  name="lostReason"
                  label="Reason & Decision (What happened & action taken)"
                  required
                  rows={2}
                  placeholder="Explain what happened to the key..."
                  disabled={isSubmitting}
                />
              </Grid>
            )}
          </Grid>
        </Box>

        {/* Sticky Submit Button */}
        <Box
          sx={{
            position: "sticky",
            bottom: 0,
            zIndex: 10,
            bgcolor: "#ffffff",
            pt: 1,
            // pb: 0.5,
            mt: 1,
            borderTop: "1.5px solid #e2e8f0",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              width: "100%",
              py: 0.9,
              fontWeight: 700,
              textTransform: "none",
              bgcolor: "#d97706",
              "&:hover": { bgcolor: "#b45309" },
              borderRadius: 2,
              fontSize: "0.95rem",
            }}
          >
            {isSubmitting ? "Submitting Request..." : "Submit Key Request"}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default NonVendorCheckoutForm;
