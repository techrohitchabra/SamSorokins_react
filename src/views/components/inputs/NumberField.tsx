import { TextField } from "@mui/material";
import type { TextFieldProps as MUITextFieldProps } from "@mui/material";

import React, { useCallback } from "react";
import { Controller, type FieldError } from "react-hook-form";
import { NumericFormat } from "react-number-format";

export type NumberFieldProps = Omit<MUITextFieldProps, "name"> & {
  name: string;
  parseError?: (error: FieldError) => string;
  isCurrency?: boolean;
  max?: number;
  prefix?: string;
  decimalScale?: number;
  fixedDecimalScale?: boolean;
};
/**
 * NumberField component for accepting number only for React Hook Form.
 * @component NumberField
 * @author Sanjay
 *
 */
const NumberField = React.memo(
  ({
    parseError,
    name,
    label,
    required,
    max,
    prefix,
    isCurrency,
    decimalScale = 2, // Default value for decimal places
    fixedDecimalScale = false, // Default to false if not provided
    hidden,
    ...rest
  }: NumberFieldProps): any => {
    const withValueLimit = useCallback(
      ({ floatValue }: any) =>
        floatValue === undefined || floatValue <= (max || 999),
      [max]
    );

    const CustomTextField = (props: any) => (
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
            "& fieldset": { borderRadius: "12px" },
            fontFamily: "'Arial', sans-serif", // Set common font family for both fields
            backgroundColor: "#f5f5f500", // Set different background colors if needed
            "&.Mui-focused fieldset": {
              borderColor: "#6F7E8C",
            },
          },
        }}
        label={`${label} ${required ? " *" : ""}`}
        fullWidth
        {...rest}
        {...props}
      />
    );

    return (
      <Controller
        name={name}
        render={({
          field: { value = 0, onChange },
          fieldState: { invalid, error },
        }) => (
          <NumericFormat
            customInput={CustomTextField}
            thousandSeparator
            isAllowed={withValueLimit}
            error={invalid}
            helperText={
              error
                ? typeof parseError === "function"
                  ? parseError(error as any)
                  : error.message
                : rest.helperText
            }
            prefix={prefix}
            decimalScale={decimalScale}
            fixedDecimalScale={fixedDecimalScale}
            value={value}
            // allowEmptyFormatting
            max={max || 9999}
            allowNegative={false}
            onValueChange={(v: any) => {
              onChange(v.floatValue === undefined ? 0 : v.floatValue);
            }}
          />
        )}
      />
    );
  }
);

export default NumberField;
