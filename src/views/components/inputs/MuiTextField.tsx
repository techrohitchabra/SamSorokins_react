import styled from "@emotion/styled";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // Import eye icons
import {
  IconButton,
  InputAdornment,
  TextField as MUITextField,
} from "@mui/material";
import type { TextFieldProps as MUITextFieldProps } from "@mui/material";
import React, { useState } from "react";
import { Controller, type FieldError } from "react-hook-form";

// Type definition for the custom TextField props
export type TextFieldProps = Omit<MUITextFieldProps, "name"> & {
  name: string;
  optional?: boolean;
  parseError?: (error: FieldError) => string;
  isPassword?: boolean;
  numberOnly?: boolean; // Enable numeric input
  symbol?: string; // Symbol to prepend or append
  max?: number;
  width?: any;
};

// Styled TextField component with custom styles
const CustomTextField = styled(MUITextField, {
  shouldForwardProp: (prop) => prop !== "isPassword",
})<{ isPassword?: boolean }>(({ isPassword }) => ({
  "& .MuiInputBase-root": {
    height: "45px", // Example height
  },
  "& label": {
    marginTop: "2px", // Negative margin when not focused
  },
  "& label.Mui-focused": {
    marginTop: "0",
    color: "#6F7E8C",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderRadius: "12px" },
    fontFamily: "'Arial', sans-serif", // Set common font family for both fields
    backgroundColor: "#f5f5f500", // Set different background colors if needed
    "&.Mui-focused fieldset": {
      borderColor: "#6F7E8C",
    },
  },
  "& .MuiInputBase-input": {
    fontSize: isPassword ? "1rem" : "1rem", // Adjust font size for password fields
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
    marginTop: "4px",
  },
}));

/**
 * Custom TextField component wrapped with Controller from react-hook-form
 * @component MuiTextField
 * @author Sanjay
 *
 */
const MuiTextField: React.FC<TextFieldProps> = React.memo(
  ({
    parseError,
    type,
    required,
    name,
    defaultValue,
    label,
    optional,
    isPassword,
    numberOnly,
    symbol,
    width,
    ...rest
  }: TextFieldProps): any => {
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const validateField = (value: any) => {
      if (type === "Email field") {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (value === "") {
          return "Email is required";
        } else if (!emailRegex.test(value)) {
          return "Please enter a valid email format";
        }
        return true;
      }
    };
    return (
      <Controller
        name={name}
        defaultValue={defaultValue}
        rules={{
          validate: validateField, // Validate email format
        }}
        render={({
          field: { value, onChange, onBlur },
          fieldState: { invalid, error },
        }) => (
          <CustomTextField
            {...rest}
            size="small"
            name={name}
            label={optional ? `${label} (Optional)` : label}
            value={value || ""}
            onChange={(e) => {
              let newValue = e.target.value;
              if (numberOnly) {
                // Allow numbers and a single decimal point
                newValue = newValue.replace(/[^0-9.]/g, ""); // Remove non-numeric characters except dot
                const parts = newValue.split(".");
                if (parts.length > 2) {
                  newValue = `${parts[0]}.${parts.slice(1).join("")}`; // Keep only one decimal point
                }
              }
              onChange(newValue);
            }}
            onBlur={onBlur}
            required={required}
            type={type === "password" && !showPassword ? "password" : "text"} // Toggle password visibility
            inputMode={numberOnly ? "decimal" : undefined} // Set inputMode for decimal input
            error={invalid}
            sx={{ width: width ? width : "100%" }}
            isPassword={type === "password"} // Pass isPassword prop to styled component
            helperText={
              error
                ? typeof parseError === "function"
                  ? parseError(error as any)
                  : error.message
                : rest.helperText
            }
            InputProps={{
              // Merge custom InputProps with default InputProps
              ...rest.InputProps, // Preserve any other InputProps passed to the component
              startAdornment: symbol ? (
                <InputAdornment position="start">{symbol}</InputAdornment>
              ) : undefined,
              // Add endAdornment for password toggle icon if type is "password"
              endAdornment:
                type === "password" ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {!showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
            }}
          />
        )}
      />
    );
  }
);

export default MuiTextField;
