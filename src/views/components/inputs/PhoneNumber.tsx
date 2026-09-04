import { FormControl, FormHelperText, InputLabel } from "@mui/material";
import React, { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";

interface PhoneNumberHelperProps {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  onlyCountries?: string[];
  disableDropdown?: boolean;
}

const PhoneNumberHelper: React.FC<PhoneNumberHelperProps> = ({
  name,
  label,
  required = false,
  defaultValue,
  disabled = false,
  onlyCountries,
  disableDropdown = false,
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasError = !!errors[name];
  // const hasValue = control._formValues[name]?.length > 0;

  const getBorderColor = () => {
    if (hasError) return "#d32f2f";
    if (focused) return "#6F7E8C";
    if (hovered) return "black";
    return "rgba(0, 0, 0, 0.23)";
  };

  return (
    <FormControl fullWidth error={hasError}>
      <InputLabel
        htmlFor={name}
        shrink={false}
        sx={{
          position: "absolute",
          left: "12px",
          top: "5px",
          transform: "translateY(-50%) scale(0.75)",
          fontSize: "0.875rem",
          color: hasError
            ? "#d32f2f"
            : focused
            ? "#6F7E8C"
            : "rgba(0, 0, 0, 0.6)",
          backgroundColor: "white",
          padding: "0 4px",
          pointerEvents: "none",
        }}
      >
        {label}
        {required && " *"}
      </InputLabel>
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue || ""}
        rules={{
          required: required ? `${label} is required` : false,
          pattern: {
            value:
              /^[+]*[0-9]{1,4}[ ]?[(]?[0-9]{1,4}[)]?[ ]?[0-9]{1,4}[ ]?[0-9]{1,4}$/,
            message: "Invalid phone number format",
          },
        }}
        render={({ field: { ref, ...field } }) => (
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <PhoneInput
              {...field}
              country="us"
              onlyCountries={onlyCountries}
              disableDropdown={disableDropdown}
              specialLabel=""
              disabled={disabled}
              inputProps={{
                name: name,
                ref: (e: HTMLInputElement) => {
                  ref(e);
                  inputRef.current = e;
                },
                autoComplete: "tel",
                id: name,
                onFocus: () => setFocused(true),
                onBlur: () => {
                  setFocused(false);
                  setHovered(false);
                },
                style: {
                  width: "100%",
                  height: "45px",
                  padding: "16px 14px 16px 58px",
                  fontSize: "1rem",
                  borderColor: getBorderColor(),
                  borderRadius: "12px",
                  border: `1px solid ${getBorderColor()}`,
                  backgroundColor: "transparent",
                  // transition: "border-color 0.2s",
                  fontFamily: "'Arial', sans-serif",
                  outline: "none", // This removes the default blue focus outline
                  boxShadow: "none", // This removes any focus shadow
                },
              }}
              containerStyle={{
                width: "100%",
              }}
              dropdownStyle={{
                zIndex: 9999,
                width: "280px",
              }}
              buttonStyle={{
                backgroundColor: "transparent",
                border: "none",
                borderRight: `1px solid ${getBorderColor()}`,
                borderRadius: "4px 0 0 4px",
              }}
            />
          </div>
        )}
      />
      {hasError && (
        <FormHelperText
          sx={{
            ml: 0,
            color: "#d32f2f",
            fontSize: "0.75rem",
          }}
        >
          {(errors[name] as any)?.message}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default PhoneNumberHelper;
