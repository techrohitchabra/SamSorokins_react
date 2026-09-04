import { MenuItem, TextField, type TextFieldProps } from "@mui/material";
import React, { createElement } from "react";
import {
  Controller,
  type ControllerProps,
  type FieldError,
} from "react-hook-form";
export type SelectElementProps = Omit<
  TextFieldProps,
  "name" | "type" | "onChange"
> & {
  validation?: ControllerProps["rules"];
  name: string;
  options?: any[];
  valueKey?: string;
  labelKey?: string;
  type?: "string" | "number";
  parseError?: (error: FieldError) => string;
  onChange?: (value: any) => void;
  backgroundColor?: string;
};

/**
 * Custom Select field component wrapped with Controller from react-hook-form
 * @component Select
 * @author Sanjay
 *
 */

const Select = React.memo(
  ({
    name,
    label,
    required,
    valueKey = "value",
    labelKey = "label",
    options = [],
    parseError,
    type,
    backgroundColor,
    disabled = false,
    ...rest
  }: SelectElementProps): any => {
    const isNativeSelect = !!rest.SelectProps?.native;
    const ChildComponent = isNativeSelect ? "option" : MenuItem;

    return (
      <Controller
        name={name}
        render={({
          field: { onBlur, onChange, value },
          fieldState: { invalid, error },
        }) => {
          // handle shrink on number input fields
          if (type === "number" && value) {
            rest.InputLabelProps = rest.InputLabelProps || {};
            rest.InputLabelProps.shrink = true;
          }
          // if (typeof value === 'object') {
          //   value = value[valueKey] // if value is object get key
          // }
          return (
            <TextField
              sx={{
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
                  "& fieldset": { borderRadius: "10px" },
                  // fontSize: "1rem", // Set common font size for both fields
                  fontFamily: "'Arial', sans-serif", // Set common font family for both fields
                  backgroundColor: "#f5f5f500", // Set different background colors if needed
                  // height: "3.2em", // Adjust height to match the email field
                  "&.Mui-focused fieldset": {
                    borderColor: "#6F7E8C",
                  },
                },
              }}
              fullWidth
              disabled={disabled}
              size="small"
              name={name}
              label={label ? `${label}` : ""}
              value={value || ""}
              onBlur={onBlur}
              onChange={(event) => {
                let item: number | string = event.target.value;
                if (type === "number") {
                  item = Number(item);
                }
                onChange(item);
              }}
              select
              required={required}
              error={invalid}
              // eslint-disable-next-line no-nested-ternary
              helperText={
                error
                  ? typeof parseError === "function"
                    ? parseError(error as any)
                    : error.message
                  : rest.helperText
              }
              {...rest}
            >
              {isNativeSelect && <option />}
              {options.map((item: any) => {
                const value = typeof item === "object" ? item[valueKey] : item;
                const label = typeof item === "object" ? item[labelKey] : item;
                return createElement(
                  ChildComponent,
                  {
                    key: `${name}_${value}`,
                    value,
                  },
                  label
                );
              })}
            </TextField>
          );
        }}
      />
    );
  }
);

export default Select;
