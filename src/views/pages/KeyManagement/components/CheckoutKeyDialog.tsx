import { yupResolver } from "@hookform/resolvers/yup";
import { Button, type DialogProps, Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

import BasicAutocomplete from "../../../components/inputs/BasicAutocomplete";
import BasicDatePicker from "../../../components/inputs/BasicDatePicker";
// import BasicDateTimePicker from "../../../components/inputs/BasicDateTimePicker";
import MuiTextField from "../../../components/inputs/MuiTextField";
import MultilineTextField from "../../../components/inputs/MultilineTextField";
import Select from "../../../components/inputs/Select";
import BasicModal from "../../../components/modal";
// import PhoneNumberHelper from "../../../components/inputs/PhoneNumber";
import useAuth from "../../../../hooks/useAuth";

const STATUS_OPTIONS = [
  { label: "Requested", value: "Requested" },
  { label: "Checked Out", value: "Checked Out" },
  { label: "Checked Out Permanently", value: "Checked Out Permanently" },
  { label: "To Be Returned", value: "To Be Returned" },
  { label: "Checked In", value: "Checked In" },
  { label: "Lost", value: "Lost" },
];

const USER_TYPE_OPTIONS = [
  { label: "Vendor Request", value: "Vendor" },
  { label: "Non-Vendor Request", value: "Non-Vendor" },
];

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

export interface PropertyOption {
  label: string;
  value: string;
  propertyId?: string | number;
  fullAddress?: string;
}

export interface UnitOption {
  label: string;
  value: string;
}

export interface VendorOption {
  label: string;
  value: string;
  vendorId?: number | string;
  phoneNumber?: string;
  email?: string;
}

interface CheckoutKeyDialogProps extends DialogProps {
  onClose: () => void;
  properties: string[];
  fetchRMVendors?: () => Promise<any[]>;
  fetchRMUsers?: () => Promise<any[]>;
  fetchRMProperties?: () => Promise<any[]>;
  fetchRMUnits?: (propertyId: string | number) => Promise<any[]>;
  onCheckout: (payload: {
    userType?: string;
    vendor: string;
    phoneNumber?: string;
    email?: string;
    repairsEmail?: string;
    property: string;
    unit?: string;
    serviceIssue?: string;
    fullAddress?: string;
    pickUpDateTime?: string;
    byWhen?: string;
    keysNeeded?: string;
    status?: string;
    lostReason?: string;
    purpose?: string;
    purposeDescription?: string;
    areKeysForYou?: string;
    whoWillPickUp?: string;
    pickerPhoneNumber?: string;
    pickerEmail?: string;
    willBeReturned?: string;
    whyNotReturned?: string;
  }) => Promise<boolean>;
  checkoutPending: boolean;
}

const CheckoutKeyDialog: React.FC<CheckoutKeyDialogProps> = ({
  open,
  onClose,
  properties = [],
  fetchRMVendors,
  fetchRMUsers,
  fetchRMProperties,
  fetchRMUnits,
  onCheckout,
  checkoutPending,
  ...props
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { request } = useAuth();

  // Options from Rent Manager API
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [userOptions, setUserOptions] = useState<VendorOption[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<PropertyOption[]>([]);
  const [rawRMProperties, setRawRMProperties] = useState<PropertyOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);

  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
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
        userType: Yup.string().default("Vendor"),
        vendor: Yup.string().required("Requester Name / Vendor is required"),
        vendorDescription: Yup.string().when("vendor", {
          is: (val: any) => {
            const vStr =
              typeof val === "object" ? val?.value : String(val || "");
            return vStr === "Other";
          },
          then: (schema) =>
            schema.required("Vendor Name is required when Other is selected"),
          otherwise: (schema) => schema.optional(),
        }),
        property: Yup.string().required("Property is required"),
        unit: Yup.string(),
        phoneNumber: Yup.string()
          .transform((val) => (val ? val.trim() : val))
          .required("Phone Number is required")
          .test(
            "valid-phone-format",
            "Phone Number contains invalid characters",
            (val) => {
              if (!val) return false;
              return /^[0-9+\-()\s.]+$/.test(val);
            }
          )
          .test(
            "valid-phone-digit-count",
            "Phone Number must contain between 8 and 14 digits",
            (val) => {
              if (!val) return false;
              const digits = val.replace(/\D/g, "");
              return digits.length >= 8 && digits.length <= 14;
            }
          ),
        email: Yup.string()
          .email("Must be a valid email")
          .required("Email is required"),
        repairsEmail: Yup.string()
          .email("Must be a valid email")
          .required("Repairs Email is required"),
        serviceIssue: Yup.string().when("userType", {
          is: "Vendor",
          then: (schema) => schema.required("Service Issue ID is required"),
          otherwise: (schema) => schema.optional(),
        }),
        fullAddress: Yup.string().required("Full Address is required"),
        pickUpDateTime: Yup.mixed().required("Pick Up Date is required"),
        byWhen: Yup.mixed().nullable(),
        // .when("userType", {
        //   is: "Vendor",
        //   then: (schema) =>
        //     schema.required("By When is required for Vendor Requests"),
        //   otherwise: (schema) => schema.optional().nullable(),
        // }),
        keysNeeded: Yup.string().required("Keys Needed is required"),
        status: Yup.string().required("Status is required"),
        purpose: Yup.string().required("Purpose is required"),
        purposeDescription: Yup.string(),
        areKeysForYou: Yup.string(),
        whoWillPickUp: Yup.string().when(["userType", "areKeysForYou"], {
          is: (uType: string, keysForYou: string) =>
            uType === "Non-Vendor" && keysForYou === "No",
          then: (schema) => schema.required("Picker Name is required"),
          otherwise: (schema) => schema.optional(),
        }),
        pickerPhoneNumber: Yup.string().when(["userType", "areKeysForYou"], {
          is: (uType: string, keysForYou: string) =>
            uType === "Non-Vendor" && keysForYou === "No",
          then: (schema) =>
            schema
              .transform((val) => (val ? val.trim() : val))
              .required("Picker Phone Number is required")
              .test(
                "valid-picker-phone-format",
                "Picker Phone Number contains invalid characters",
                (val) => {
                  if (!val) return false;
                  return /^[0-9+\-()\s.]+$/.test(val);
                }
              )
              .test(
                "valid-picker-phone-digit-count",
                "Picker Phone Number must contain between 8 and 14 digits",
                (val) => {
                  if (!val) return false;
                  const digits = val.replace(/\D/g, "");
                  return digits.length >= 8 && digits.length <= 14;
                }
              ),
          otherwise: (schema) =>
            schema
              .optional()
              .transform((val) => (val ? val.trim() : val))
              .test(
                "valid-picker-phone-format",
                "Picker Phone Number contains invalid characters",
                (val) => {
                  if (!val || val.trim() === "") return true;
                  return /^[0-9+\-()\s.]+$/.test(val);
                }
              )
              .test(
                "valid-picker-phone-digit-count",
                "Picker Phone Number must contain between 8 and 14 digits",
                (val) => {
                  if (!val || val.trim() === "") return true;
                  const digits = val.replace(/\D/g, "");
                  return digits.length >= 8 && digits.length <= 14;
                }
              ),
        }),
        pickerEmail: Yup.string()
          .email("Must be a valid email")
          .when(["userType", "areKeysForYou"], {
            is: (uType: string, keysForYou: string) =>
              uType === "Non-Vendor" && keysForYou === "No",
            then: (schema) => schema.required("Picker Email is required"),
            otherwise: (schema) => schema.optional(),
          }),
        willBeReturned: Yup.string(),
        whyNotReturned: Yup.string().when(["userType", "willBeReturned"], {
          is: (uType: string, ret: string) =>
            uType === "Non-Vendor" && ret === "No",
          then: (schema) =>
            schema.required("Reason why keys will not be returned is required"),
          otherwise: (schema) => schema.optional(),
        }),
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

  const { watch, reset, setValue } = formContext;
  const currentServiceIssue = watch("serviceIssue");
  const currentUserType = watch("userType");
  const currentVendor = watch("vendor");
  const currentStatus = watch("status");
  const currentPurpose = watch("purpose");
  const currentAreKeysForYou = watch("areKeysForYou");
  const currentWillBeReturned = watch("willBeReturned");
  const selectedProperty = watch("property");

  const vendorValStr =
    typeof currentVendor === "object"
      ? (currentVendor as any)?.value || ""
      : String(currentVendor || "");
  const isOtherVendor = vendorValStr === "Other";

  const isNonVendor = currentUserType === "Non-Vendor";
  const isKeysForOther = currentAreKeysForYou === "No";
  const isNotReturned = currentWillBeReturned === "No";

  // Reset vendor, email & phone when request type changes (Vendor vs Non-Vendor)
  useEffect(() => {
    if (!open) return;
    setValue("vendor", "");
    setValue("vendorDescription", "");
    setValue("email", "");
    setValue("phoneNumber", "");
  }, [open, currentUserType, setValue]);

  // Auto-fill fields from Rent Manager Service Manager Issue ID
  useEffect(() => {
    if (!open || !currentServiceIssue || isNonVendor) return;

    const issueIdStr = String(currentServiceIssue).trim();
    if (!issueIdStr || issueIdStr.length < 2) return;

    const handler = setTimeout(() => {
      setLoadingServiceIssue(true);
      request
        .get(`/rentManager/serviceIssue/${issueIdStr}`)
        .then((res) => {
          if (res.data?.success) {
            const { vendor, property, unit, phoneNumber, email, fullAddress } =
              res.data;

            // 1. Match & Set Vendor
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

            // 2. Match & Set Property (Case-Insensitive matching against propertyOptions)
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
                  const newPropOpt = {
                    label: propStr,
                    value: propStr,
                    fullAddress: fullAddress || "",
                  };
                  return [newPropOpt, ...prev];
                }
              });
            }

            // 3. Store Pending Unit for auto-selection when property units load
            const unitStr = (unit || "").trim();
            if (unitStr) {
              pendingAutoFillUnitRef.current = unitStr;
              setValue("unit", unitStr);
            }

            // 4. Set Contact & Address fields
            if (phoneNumber) setValue("phoneNumber", phoneNumber);
            if (email) setValue("email", email);
            if (fullAddress) setValue("fullAddress", fullAddress);
          }
        })
        .catch((err) => {
          console.warn("Failed to fetch Service Issue details:", err);
          setValue("vendor", "");
          setValue("property", "");
          setValue("phoneNumber", "");
          setValue("email", "");
          setValue("fullAddress", "");
          setValue("unit", "");
        })
        .finally(() => {
          setLoadingServiceIssue(false);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [open, currentServiceIssue, isNonVendor]);

  // Auto-fill default Email and Phone Number when a vendor or user is selected or changed
  useEffect(() => {
    if (!open) return;

    const vendorValStr =
      typeof currentVendor === "object"
        ? (currentVendor as any)?.value || (currentVendor as any)?.label || ""
        : String(currentVendor || "");

    if (!vendorValStr || vendorValStr === "Other") {
      setValue("email", "");
      setValue("phoneNumber", "");
      return;
    }

    const targetOptions = isNonVendor ? userOptions : vendorOptions;

    const matchedOpt = targetOptions.find(
      (opt) =>
        opt.value === vendorValStr ||
        opt.label.toLowerCase() === vendorValStr.toLowerCase()
    );

    if (matchedOpt) {
      setValue("email", matchedOpt.email || "");
      setValue("phoneNumber", matchedOpt.phoneNumber || "");
    } else {
      setValue("email", "");
      setValue("phoneNumber", "");
    }
  }, [open, currentVendor, vendorOptions, userOptions, isNonVendor, setValue]);

  // Auto-fill default fullAddress when a property is selected or changed
  useEffect(() => {
    if (!open) return;

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

    if (matchedProp) {
      if (matchedProp.fullAddress) {
        setValue("fullAddress", matchedProp.fullAddress);
      } else if (matchedProp.propertyId) {
        // Fetch full property address from RM if not in option
        request
          .get(`/rentManager/properties/${matchedProp.propertyId}`)
          .then((res) => {
            const pObj = res.data?.property;
            const primaryAddrObj =
              pObj?.PrimaryAddress ||
              (Array.isArray(pObj?.Addresses)
                ? pObj.Addresses.find((a: any) => a.IsPrimary) ||
                  pObj.Addresses[0]
                : null);

            let addrStr = "";
            if (primaryAddrObj) {
              if (primaryAddrObj.Address) {
                addrStr = primaryAddrObj.Address.replace(/\r?\n/g, ", ").trim();
              } else {
                const parts = [
                  primaryAddrObj.Street,
                  primaryAddrObj.City,
                  [primaryAddrObj.State, primaryAddrObj.PostalCode]
                    .filter(Boolean)
                    .join(" "),
                ].filter(Boolean);
                addrStr = parts.join(", ").trim();
              }
            }
            setValue("fullAddress", addrStr);
            matchedProp.fullAddress = addrStr;
          })
          .catch(() => {
            setValue("fullAddress", "");
          });
      } else {
        setValue("fullAddress", "");
      }
    } else {
      setValue("fullAddress", "");
    }
  }, [open, selectedProperty, propertyOptions, setValue, request]);

  // Initial load for Rent Manager Vendors & Properties
  useEffect(() => {
    if (!open) return;
    reset(initialValues);

    let isMounted = true;

    // 1. Fetch Vendors & sort A-Z + append "Other"
    if (fetchRMVendors) {
      setLoadingVendors(true);
      fetchRMVendors()
        .then((vList) => {
          if (!isMounted) return;
          if (Array.isArray(vList) && vList.length > 0) {
            const mapped: VendorOption[] = vList
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
              .sort((a, b) =>
                a.label.localeCompare(b.label, undefined, {
                  numeric: true,
                  sensitivity: "base",
                })
              );
            mapped.push({ label: "Other", value: "Other" });
            setVendorOptions(mapped);
          } else {
            setVendorOptions([{ label: "Other", value: "Other" }]);
          }
        })
        .finally(() => {
          if (isMounted) setLoadingVendors(false);
        });
    }

    // 2. Fetch Non-Vendor Users & sort A-Z + append "Other"
    if (fetchRMUsers) {
      setLoadingUsers(true);
      fetchRMUsers()
        .then((uList) => {
          if (!isMounted) return;
          if (Array.isArray(uList) && uList.length > 0) {
            const mapped: VendorOption[] = uList
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
              .sort((a, b) =>
                a.label.localeCompare(b.label, undefined, {
                  numeric: true,
                  sensitivity: "base",
                })
              );
            // mapped.push({ label: "Other", value: "Other" });
            setUserOptions(mapped);
          } else {
            // setUserOptions([{ label: "Other", value: "Other" }]);
          }
        })
        .finally(() => {
          if (isMounted) setLoadingUsers(false);
        });
    }

    // 3. Fetch Properties & sort A-Z
    if (fetchRMProperties) {
      setLoadingProperties(true);
      fetchRMProperties()
        .then((pList) => {
          if (!isMounted) return;
          if (Array.isArray(pList) && pList.length > 0) {
            const mapped: PropertyOption[] = pList
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
                    : null) ||
                  (Array.isArray(item.Property?.Addresses)
                    ? item.Property.Addresses.find((a: any) => a.IsPrimary) ||
                      item.Property.Addresses[0]
                    : null);

                let fullAddress = "";
                if (primaryAddrObj) {
                  if (primaryAddrObj.Address) {
                    fullAddress = primaryAddrObj.Address.replace(
                      /\r?\n/g,
                      ", "
                    ).trim();
                  } else {
                    const parts = [
                      primaryAddrObj.Street,
                      primaryAddrObj.City,
                      [primaryAddrObj.State, primaryAddrObj.PostalCode]
                        .filter(Boolean)
                        .join(" "),
                    ].filter(Boolean);
                    fullAddress = parts.join(", ").trim();
                  }
                }

                return {
                  label: propName,
                  value: propName,
                  propertyId: propId,
                  fullAddress,
                };
              })
              .filter((p) => p.value);

            const uniqueMap = new Map<string, PropertyOption>();
            mapped.forEach((p) => {
              if (!uniqueMap.has(p.value.toLowerCase())) {
                uniqueMap.set(p.value.toLowerCase(), p);
              } else {
                const existing = uniqueMap.get(p.value.toLowerCase());
                if (existing && !existing.fullAddress && p.fullAddress) {
                  existing.fullAddress = p.fullAddress;
                }
              }
            });

            const uniqueList = Array.from(uniqueMap.values()).sort((a, b) =>
              a.label.localeCompare(b.label, undefined, {
                numeric: true,
                sensitivity: "base",
              })
            );
            setRawRMProperties(mapped);
            setPropertyOptions(uniqueList);
          } else if (properties && properties.length > 0) {
            const sortedProps = properties
              .map((p) => ({ label: p, value: p }))
              .sort((a, b) =>
                a.label.localeCompare(b.label, undefined, {
                  numeric: true,
                  sensitivity: "base",
                })
              );
            setPropertyOptions(sortedProps);
          }
        })
        .finally(() => {
          if (isMounted) setLoadingProperties(false);
        });
    } else if (properties && properties.length > 0) {
      const sortedProps = properties
        .map((p) => ({ label: p, value: p }))
        .sort((a, b) =>
          a.label.localeCompare(b.label, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );
      setPropertyOptions(sortedProps);
    }

    return () => {
      isMounted = false;
    };
  }, [
    open,
    reset,
    initialValues,
    fetchRMVendors,
    fetchRMProperties,
    properties,
  ]);

  // Dynamic Units fetch when property is selected (Sorted A-Z)
  useEffect(() => {
    // Only reset unit if there is no pending auto-fill unit
    if (!pendingAutoFillUnitRef.current) {
      setValue("unit", "");
    }

    if (!open || !selectedProperty) {
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
    if (propId && fetchRMUnits) {
      setLoadingUnits(true);
      fetchRMUnits(propId)
        .then((unitsData) => {
          if (Array.isArray(unitsData) && unitsData.length > 0) {
            const mappedUnits = unitsData
              .map((u: any) => {
                const unitLabel = u.Name || u.UnitNumber || `Unit ${u.UnitID}`;
                return { label: unitLabel, value: unitLabel };
              })
              .sort((a: any, b: any) =>
                a.label.localeCompare(b.label, undefined, {
                  numeric: true,
                  sensitivity: "base",
                })
              );

            // Apply pending auto-fill unit if present
            if (pendingAutoFillUnitRef.current) {
              const targetU = pendingAutoFillUnitRef.current;
              const matchedU = mappedUnits.find(
                (u) =>
                  u.value.toLowerCase() === targetU.toLowerCase() ||
                  u.label.toLowerCase() === targetU.toLowerCase()
              );
              if (matchedU) {
                setValue("unit", matchedU.value);
              } else {
                mappedUnits.unshift({ label: targetU, value: targetU });
                setValue("unit", targetU);
              }
              pendingAutoFillUnitRef.current = null;
            }
            setUnitOptions(mappedUnits);
          } else {
            if (pendingAutoFillUnitRef.current) {
              const targetU = pendingAutoFillUnitRef.current;
              setUnitOptions([{ label: targetU, value: targetU }]);
              setValue("unit", targetU);
              pendingAutoFillUnitRef.current = null;
            } else {
              setUnitOptions([]);
            }
          }
        })
        .finally(() => {
          setLoadingUnits(false);
        });
    } else {
      if (pendingAutoFillUnitRef.current) {
        const targetU = pendingAutoFillUnitRef.current;
        setUnitOptions([{ label: targetU, value: targetU }]);
        setValue("unit", targetU);
        pendingAutoFillUnitRef.current = null;
      } else {
        setUnitOptions([]);
      }
    }
  }, [
    open,
    selectedProperty,
    propertyOptions,
    rawRMProperties,
    fetchRMUnits,
    setValue,
  ]);

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

      const success = await onCheckout({
        userType: values.userType || "Vendor",
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
      });

      if (success) {
        reset(initialValues);
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BasicModal
      open={open}
      onClose={onClose}
      size="md"
      title="Create Key Request"
      isLoader={
        isSubmitting ||
        checkoutPending ||
        loadingVendors ||
        loadingUsers ||
        loadingProperties ||
        loadingServiceIssue
      }
      formContext={formContext}
      onSubmit={formContext.handleSubmit(onFormSubmit)}
      content={
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* User / Request Type Toggle */}
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: isNonVendor ? "#fffbe8" : "#f0fdf4",
                border: `1.5px solid ${isNonVendor ? "#fde68a" : "#bbf7d0"}`,
                borderRadius: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: isNonVendor ? "#92400e" : "#166534",
                  mb: 1,
                }}
              >
                Select Request Type (Vendor vs Non-Vendor)
              </Typography>
              <Select
                name="userType"
                label="Request Type"
                options={USER_TYPE_OPTIONS}
                disabled={isSubmitting}
              />
            </Box>
          </Grid>

          {/* Requester Name / Vendor Dropdown */}

          {isNonVendor ? (
            <Grid size={{ xs: 12, sm: isOtherVendor ? 6 : 6 }}>
              <BasicAutocomplete
                name="vendor"
                label="Requester Name"
                required
                // loading={loadingUsers}
                // loadingText="Loading RM Users..."
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
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <MuiTextField
                  name="serviceIssue"
                  label="Service Issue #"
                  placeholder="e.g. 12121212121"
                  disabled={isSubmitting}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: isOtherVendor ? 6 : 6 }}>
                <BasicAutocomplete
                  name="vendor"
                  label="Vendor"
                  required
                  // loading={loadingVendors}
                  // loadingText="Loading RM Vendors..."
                  options={vendorOptions}
                  getOptionValue={(option: any) =>
                    typeof option === "string" ? option : option?.value || ""
                  }
                  placeholder={
                    loadingVendors
                      ? "Loading RM Vendors..."
                      : "Select vendor..."
                  }
                  disabled={isSubmitting}
                />
              </Grid>
            </>
          )}

          {/* If Vendor / User is "Other", show text field for Name */}
          {isOtherVendor && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <MuiTextField
                name="vendorDescription"
                label={
                  isNonVendor ? "Specify Requester Name" : "Specify Vendor Name"
                }
                required
                placeholder={
                  isNonVendor ? "e.g. John Doe" : "e.g. Custom Vendor Company"
                }
                disabled={isSubmitting}
              />
            </Grid>
          )}

          {/* Property Dropdown (Sorted A-Z) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BasicAutocomplete
              name="property"
              label="Property"
              required
              // loading={loadingProperties}
              // loadingText="Loading RM Properties..."
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

          {/* Unit Dropdown (Dynamic & Sorted A-Z) */}
          <Grid size={{ xs: 12, sm: 6 }}>
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
          <Grid size={{ xs: 12, sm: 6 }}>
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <MuiTextField
              name="email"
              label="Email"
              placeholder="e.g. test@example.com"
              disabled={isSubmitting}
              required
            />
          </Grid>

          {/* Vendor Specific: Service Issue & By When */}
          {!isNonVendor && (
            <>
              {/* <Grid size={{ xs: 12, sm: 6 }}>
                <MuiTextField
                  name="serviceIssue"
                  label="Service Issue #"
                  placeholder="e.g. 12121212121"
                  disabled={isSubmitting}
                  required
                />
              </Grid> */}

              <Grid size={{ xs: 12 }}>
                <MuiTextField
                  name="fullAddress"
                  label="Full Address"
                  placeholder="e.g. 123 Main St, Suite A"
                  disabled={isSubmitting}
                  required
                />
              </Grid>
            </>
          )}

          {/* Non-Vendor Specific: Purpose Dropdown */}
          {isNonVendor && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Select
                  name="purpose"
                  label="Purpose"
                  options={PURPOSE_OPTIONS}
                  disabled={isSubmitting}
                  required
                />
              </Grid>

              {currentPurpose === "Other" && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <MuiTextField
                    name="purposeDescription"
                    label="Specify Purpose"
                    placeholder="e.g. Custom Purpose Reason..."
                    disabled={isSubmitting}
                    required
                  />
                </Grid>
              )}
            </>
          )}

          {/* Pick Up Date & Time Picker */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <BasicDatePicker
              name="pickUpDateTime"
              label="Pick Up Date"
              disabled={isSubmitting}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <BasicDatePicker
              name="byWhen"
              label="By When (Date)"
              disabled={isSubmitting}
              // required
            />
          </Grid>

          {/* Initial Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Select
              name="status"
              label="Key Status"
              options={STATUS_OPTIONS}
              disabled={isSubmitting}
              required
            />
          </Grid>

          {/* Repairs Email */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <MuiTextField
              name="repairsEmail"
              label="Repairs Email"
              placeholder="e.g. repairs@premiumpd.com"
              disabled={isSubmitting}
              required
            />
          </Grid>

          {/* Keys Needed */}
          <Grid size={{ xs: 12 }}>
            <MultilineTextField
              name="keysNeeded"
              label="Keys Needed"
              rows={3}
              placeholder="e.g. 43D main key&#10;41D storage key"
              disabled={isSubmitting}
              required
            />
          </Grid>

          {/* Non-Vendor Conditional Questions */}
          {isNonVendor && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Select
                  name="areKeysForYou"
                  label="Are the Keys for You?"
                  options={YES_NO_OPTIONS}
                  disabled={isSubmitting}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Select
                  name="willBeReturned"
                  label="Will they be returned?"
                  options={YES_NO_OPTIONS}
                  disabled={isSubmitting}
                  required
                />
              </Grid>

              {/* If Are Keys for You is NO */}
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
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <MuiTextField
                          name="whoWillPickUp"
                          label="Who will pick them up?"
                          placeholder="Picker's Full Name"
                          disabled={isSubmitting}
                          required={isNonVendor}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <MuiTextField
                          name="pickerPhoneNumber"
                          label="Picker Phone Number"
                          placeholder="e.g. (211) 111-11100"
                          disabled={isSubmitting}
                          required={isNonVendor}
                          inputProps={{ maxLength: 25 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <MuiTextField
                          name="pickerEmail"
                          label="Picker Email"
                          placeholder="picker@example.com"
                          disabled={isSubmitting}
                          required={isNonVendor}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}

              {/* If Will They Be Returned is NO */}
              {isNotReturned && (
                <Grid size={{ xs: 12 }}>
                  <MultilineTextField
                    name="whyNotReturned"
                    label="Why? (Reason why keys won't be returned)"
                    rows={2}
                    placeholder="Provide reason why keys will not be returned..."
                    disabled={isSubmitting}
                    required={isNonVendor}
                  />
                </Grid>
              )}
            </>
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
      }
      actions={
        <>
          {/* Form Actions */}
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
              {isSubmitting ? "Creating Request..." : "Create Request"}
            </Button>
          </Grid>
        </>
      }
      {...props}
    />
  );
};

export default CheckoutKeyDialog;
