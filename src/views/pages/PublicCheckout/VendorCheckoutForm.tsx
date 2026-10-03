import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Grid, LinearProgress } from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import * as Yup from "yup";
import BasicAutocomplete from "../../components/inputs/BasicAutocomplete";
import BasicDatePicker from "../../components/inputs/BasicDatePicker";
import MuiTextField from "../../components/inputs/MuiTextField";
import MultilineTextField from "../../components/inputs/MultilineTextField";
import Select from "../../components/inputs/Select";
import { useSnackbarHelper } from "../../components/snackbar";

const API_URL = import.meta.env.VITE_API_URL || "";

const STATUS_OPTIONS = [
  { label: "Requested", value: "Requested" },
  { label: "Checked Out", value: "Checked Out" },
  { label: "Checked Out Permanently", value: "Checked Out Permanently" },
  { label: "To Be Returned", value: "To Be Returned" },
  { label: "Checked In", value: "Checked In" },
  { label: "Lost", value: "Lost" },
];

export interface OptionType {
  label: string;
  value: string;
  propertyId?: string | number;
  fullAddress?: string;
  phoneNumber?: string;
  email?: string;
}

interface VendorCheckoutFormProps {
  onSuccess?: () => void;
}

const VendorCheckoutForm: React.FC<VendorCheckoutFormProps> = ({
  onSuccess,
}) => {
  const showSnackbar = useSnackbarHelper();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options state
  const [vendorOptions, setVendorOptions] = useState<OptionType[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<OptionType[]>([]);
  const [rawRMProperties, setRawRMProperties] = useState<OptionType[]>([]);
  const [unitOptions, setUnitOptions] = useState<OptionType[]>([]);

  // Loading states
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingServiceIssue, setLoadingServiceIssue] = useState(false);
  const pendingAutoFillUnitRef = React.useRef<string | null>(null);

  const initialValues = useMemo(
    () => ({
      userType: "Vendor",
      vendor: "",
      vendorDescription: "",
      property: "",
      unit: "",
      phoneNumber: "",
      email: "",
      repairsEmail: "repairs@premiumpd.com",
      serviceIssue: "",
      fullAddress: "",
      pickUpDateTime: Date.now(),
      byWhen: null,
      keysNeeded: "",
      rfId: "",
      status: "Requested",
      lostReason: "",
    }),
    []
  );

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        serviceIssue: Yup.string().required("Service Issue # is required"),
        vendor: Yup.string().required("Vendor is required"),
        vendorDescription: Yup.string().when("vendor", {
          is: (val: any) => {
            const vStr =
              typeof val === "object" ? val?.value : String(val || "");
            return vStr === "Other";
          },
          then: (schema) => schema.required("Specify Vendor Name is required"),
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
        fullAddress: Yup.string().required("Full Address is required"),
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
  const currentServiceIssue = watch("serviceIssue");

  const isOtherVendor =
    (typeof currentVendor === "object"
      ? (currentVendor as any)?.value
      : currentVendor) === "Other";

  // Auto-fill Service Issue details
  useEffect(() => {
    const issueIdStr = String(currentServiceIssue || "").trim();
    if (!issueIdStr || !/^\d+$/.test(issueIdStr)) return;

    const timer = setTimeout(() => {
      setLoadingServiceIssue(true);
      axios
        .get(`${API_URL}/rentManager/serviceIssue/${issueIdStr}`)
        .then((res) => {
          if (res.data?.success) {
            const { vendor, property, unit, phoneNumber, email, fullAddress } =
              res.data;

            const vStr = (vendor || "").trim();
            if (vStr) {
              setVendorOptions((prev) => {
                const matchedVendor = prev.find(
                  (opt) =>
                    opt.value.toLowerCase() === vStr.toLowerCase() ||
                    opt.label.toLowerCase() === vStr.toLowerCase()
                );
                if (matchedVendor) {
                  setValue("vendor", matchedVendor.value);
                  return prev;
                } else {
                  setValue("vendor", vStr);
                  return [{ label: vStr, value: vStr }, ...prev];
                }
              });
            }

            const propStr = (property || "").trim();
            if (propStr) {
              setPropertyOptions((prev) => {
                const matchedProp = prev.find(
                  (p) =>
                    p.value.toLowerCase() === propStr.toLowerCase() ||
                    p.label.toLowerCase() === propStr.toLowerCase()
                );
                if (matchedProp) {
                  setValue("property", matchedProp.value);
                  return prev;
                } else {
                  setValue("property", propStr);
                  return [
                    {
                      label: propStr,
                      value: propStr,
                      fullAddress: fullAddress || "",
                    },
                    ...prev,
                  ];
                }
              });
            }

            const unitStr = (unit || "").trim();
            if (unitStr) {
              pendingAutoFillUnitRef.current = unitStr;
              setValue("unit", unitStr);
            }

            if (phoneNumber) setValue("phoneNumber", phoneNumber);
            if (email) setValue("email", email);
            if (fullAddress) setValue("fullAddress", fullAddress);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingServiceIssue(false));
    }, 600);

    return () => clearTimeout(timer);
  }, [currentServiceIssue, setValue]);

  // Auto-fill Contact Info on Vendor Selection
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

    const matchedOpt = vendorOptions.find(
      (opt) =>
        opt.value === vendorValStr ||
        opt.label.toLowerCase() === vendorValStr.toLowerCase()
    );

    if (matchedOpt) {
      setValue("email", matchedOpt.email || "");
      setValue("phoneNumber", matchedOpt.phoneNumber || "");
    }
  }, [currentVendor, vendorOptions, setValue]);

  // Auto-fill Property Address
  useEffect(() => {
    const propValStr =
      typeof selectedProperty === "object"
        ? (selectedProperty as any)?.value ||
          (selectedProperty as any)?.label ||
          ""
        : String(selectedProperty || "");

    if (!propValStr) {
      setValue("fullAddress", "");
      return;
    }

    const matchedProp = propertyOptions.find(
      (opt) =>
        opt.value === propValStr ||
        opt.label.toLowerCase() === propValStr.toLowerCase()
    );

    if (matchedProp && matchedProp.fullAddress) {
      setValue("fullAddress", matchedProp.fullAddress);
    }
  }, [selectedProperty, propertyOptions, setValue]);

  // Initial load for Rent Manager data
  useEffect(() => {
    reset(initialValues);
    let isMounted = true;

    // Fetch Vendors
    setLoadingVendors(true);
    axios
      .get(`${API_URL}/rentManager/vendors`)
      .then((res) => {
        if (!isMounted) return;
        const vList = res.data?.vendors || [];
        if (Array.isArray(vList) && vList.length > 0) {
          const mapped: OptionType[] = vList
            .map((v: any) => {
              const email = v.Contact?.Email || "";
              const phoneObjs = Array.isArray(v.Contact?.PhoneNumbers)
                ? v.Contact.PhoneNumbers
                : [];
              const primaryPhone =
                phoneObjs.find((p: any) => p.IsPrimary) || phoneObjs[0];
              const phoneNumber =
                primaryPhone?.PhoneNumber ||
                primaryPhone?.StrippedPhoneNumber ||
                "";
              return {
                label: v.Name || `Vendor ${v.VendorID}`,
                value: v.Name || String(v.VendorID),
                vendorId: v.VendorID,
                email,
                phoneNumber,
              };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
          mapped.push({ label: "Other", value: "Other" });
          setVendorOptions(mapped);
        } else {
          setVendorOptions([{ label: "Other", value: "Other" }]);
        }
      })
      .catch(() => setVendorOptions([{ label: "Other", value: "Other" }]))
      .finally(() => isMounted && setLoadingVendors(false));

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
              const primaryAddrObj =
                item.PrimaryAddress ||
                item.Property?.PrimaryAddress ||
                (Array.isArray(item.Addresses)
                  ? item.Addresses.find((a: any) => a.IsPrimary) ||
                    item.Addresses[0]
                  : null);
              let fullAddress = "";
              if (primaryAddrObj) {
                fullAddress = primaryAddrObj.Address
                  ? primaryAddrObj.Address.replace(/\r?\n/g, ", ").trim()
                  : [primaryAddrObj.Street, primaryAddrObj.City]
                      .filter(Boolean)
                      .join(", ");
              }
              return {
                label: propName,
                value: propName,
                propertyId: propId,
                fullAddress,
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
    if (!pendingAutoFillUnitRef.current) {
      setValue("unit", "");
    }

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

            if (pendingAutoFillUnitRef.current) {
              const pendingUnit = pendingAutoFillUnitRef.current;
              pendingAutoFillUnitRef.current = null;
              const found = mappedUnits.find(
                (u) => u.value.toLowerCase() === pendingUnit.toLowerCase()
              );
              if (found) {
                setValue("unit", found.value);
              } else {
                setValue("unit", pendingUnit);
              }
            }
          } else {
            setUnitOptions([]);
          }
        })
        .catch(() => setUnitOptions([]))
        .finally(() => setLoadingUnits(false));
    }
  }, [selectedProperty, propertyOptions, rawRMProperties, setValue]);

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

      const payload = {
        userType: "Vendor",
        vendor: finalVendorVal.trim(),
        phoneNumber: values.phoneNumber?.trim() || "",
        email: values.email?.trim() || "",
        repairsEmail: values.repairsEmail?.trim() || "repairs@premiumpd.com",
        property: propVal.trim(),
        unit: unitVal.trim(),
        serviceIssue: values.serviceIssue?.trim() || "",
        fullAddress: values.fullAddress?.trim() || "",
        pickUpDateTime: pickUpFormatted,
        byWhen: byWhenFormatted,
        keysNeeded: values.keysNeeded?.trim() || "",
        rfId: values.rfId?.trim() || "",
        status: values.status,
        lostReason: values.status === "Lost" ? values.lostReason?.trim() : "",
        createdBy: null,
      };

      const res = await axios.post(
        `${API_URL}/keys/public-checkout/vendor`,
        payload
      );

      if (res.data?.success ?? true) {
        showSnackbar("Vendor key request submitted successfully!", "success");
        reset(initialValues);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.message || "Failed to submit vendor key request",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading =
    isSubmitting ||
    loadingVendors ||
    loadingProperties ||
    loadingUnits ||
    loadingServiceIssue;

  return (
    <FormProvider {...formContext}>
      <Box
        component="form"
        onSubmit={formContext.handleSubmit(onFormSubmit)}
        noValidate
        sx={{ width: "100%" }}
      >
        {isLoading && <LinearProgress sx={{ mb: 2.5, borderRadius: 1 }} />}

        {/* EVERY field uses size={{ xs: 12 }} so in one row ONLY ONE field is displayed */}
        <Grid container spacing={2.5}>
          {/* Service Issue # */}
          <Grid size={{ xs: 12 }}>
            <MuiTextField
              name="serviceIssue"
              label="Service Issue #"
              placeholder="e.g. 12121212121"
              disabled={isSubmitting}
              required
            />
          </Grid>

          {/* Vendor Dropdown */}
          <Grid size={{ xs: 12 }}>
            <BasicAutocomplete
              name="vendor"
              label="Vendor"
              required
              options={vendorOptions}
              getOptionValue={(option: any) =>
                typeof option === "string" ? option : option?.value || ""
              }
              placeholder={
                loadingVendors ? "Loading RM Vendors..." : "Select vendor..."
              }
              disabled={isSubmitting}
            />
          </Grid>

          {/* Specify Vendor Name if "Other" is selected */}
          {isOtherVendor && (
            <Grid size={{ xs: 12 }}>
              <MuiTextField
                name="vendorDescription"
                label="Specify Vendor Name"
                required
                placeholder="e.g. Custom Vendor Company"
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

          {/* Full Address */}
          <Grid size={{ xs: 12 }}>
            <MuiTextField
              name="fullAddress"
              label="Full Address"
              placeholder="e.g. 123 Main St, Suite A"
              disabled={isSubmitting}
              required
            />
          </Grid>

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
          <Grid size={{ xs: 12 }}>
            <Select
              name="status"
              label="Key Status"
              options={STATUS_OPTIONS}
              disabled={isSubmitting}
              required
            />
          </Grid>

          {/* Repairs Email */}
          <Grid size={{ xs: 12 }}>
            <MuiTextField
              name="repairsEmail"
              label="Repairs Email"
              placeholder="e.g. repairs@premiumpd.com"
              disabled={isSubmitting}
              required
            />
          </Grid>

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

        {/* Submit Button */}
        <Box sx={{ mt: 3.5, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              width: "100%",
              py: 1.5,
              fontWeight: 700,
              textTransform: "none",
              bgcolor: "#16a34a",
              "&:hover": { bgcolor: "#15803d" },
              borderRadius: 2,
              fontSize: "1.05rem",
            }}
          >
            {isSubmitting
              ? "Submitting Vendor Request..."
              : "Submit Vendor Key Request"}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default VendorCheckoutForm;
