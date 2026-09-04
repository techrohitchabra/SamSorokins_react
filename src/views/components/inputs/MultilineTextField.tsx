import styled from "@emotion/styled";
import { TextField as MUITextField } from "@mui/material";
import React from "react";
import { Controller, type FieldError } from "react-hook-form";
import type { TextFieldProps as MUITextFieldProps } from "@mui/material";

// Type definition for the custom TextField props
export type TextFieldProps = Omit<MUITextFieldProps, "name"> & {
  name: string;
  optional?: boolean;
  parseError?: (error: FieldError) => string;
  isPassword?: boolean;
  max?: number;
  width?: string;
  rows?: number;
  minRows?: number;
  maxRows?: number;
};

// Styled TextField component with custom styles
const CustomTextField = styled(MUITextField, {
  shouldForwardProp: (prop) => prop !== "isPassword",
})<{ isPassword?: boolean }>(() => ({
  "& label.Mui-focused": {
    color: "#6F7E8C",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderRadius: "12px" },
    fontSize: "0.9rem",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f5f5f500",
    height: "auto !important", // Allow input root container to dynamically adjust to rows height
    "&.Mui-focused fieldset": {
      borderColor: "#6F7E8C",
    },
  },
  "& .MuiInputBase-input": {
    fontSize: "0.9rem",
    lineHeight: "1.4",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
  },
}));

/**
 * Custom Multiline TextField component wrapped with Controller from react-hook-form
 * @component MultilineTextField
 *
 */
const MultilineTextField = React.memo(
  ({
    parseError,
    type,
    required,
    name,
    width,
    label,
    defaultValue,
    optional,
    isPassword,
    rows = 3,
    minRows,
    maxRows,
    ...rest
  }: TextFieldProps): any => {
    return (
      <Controller
        name={name}
        defaultValue={defaultValue}
        render={({
          field: { value, onChange, onBlur },
          fieldState: { invalid, error },
        }) => (
          <CustomTextField
            {...rest}
            multiline
            rows={rows}
            minRows={minRows}
            maxRows={maxRows}
            inputProps={{ ...rest.inputProps }}
            name={name}
            label={optional ? `${label} (Optional)` : label}
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            type={type}
            error={invalid}
            sx={{ width: width ? width : "100%", ...rest.sx }}
            isPassword={type === "password"}
            helperText={
              error
                ? typeof parseError === "function"
                  ? parseError(error as any)
                  : error.message
                : rest.helperText
            }
          />
        )}
      />
    );
  }
);

export default MultilineTextField;
