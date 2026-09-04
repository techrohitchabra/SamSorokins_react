import React, { useCallback } from "react";
import { Controller, useFormContext, type FieldError } from "react-hook-form";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";

export type AutocompleteFieldProps<T> = {
  name: string;
  label?: string;
  parseError?: (error: FieldError) => string;
  getOptionValue?: (option: any) => string | number | null | undefined;
  options?: T[];
  multiple?: boolean;
  helperText?: string;
  required?: boolean;
  freeSolo?: boolean;
  disablePortal?: boolean;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  placeholder?: string;
  defaultValue?: T | T[];
  isOptionEqualToValue?: (option: any, value: any) => boolean;
  getOptionLabel?: (option: any) => string;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: T
  ) => React.ReactNode;
};

/**
 * BasicAutocomplete component for selecting options with support for React Hook Form.
 * @component BasicAutocomplete
 * @author Sanjay
 */

const BasicAutocomplete = <T,>({
  parseError,
  name,
  label,
  options = [],
  defaultValue,
  isOptionEqualToValue,
  getOptionLabel,
  renderOption,
  required,
  getOptionValue,
  multiple = false,
  freeSolo = false,
  disablePortal = false,
  disabled = false,
  loading = false,
  loadingText = "Loading...",
  placeholder,
  ...rest
}: AutocompleteFieldProps<T>): any => {
  const { control } = useFormContext();

  const isOptionEqualToValueWrapper = useCallback(
    (option: any, value: any) => {
      if (value == null || value === "") return false;

      if (typeof getOptionValue === "function") {
        return getOptionValue(option) === value;
      }

      return isOptionEqualToValue
        ? isOptionEqualToValue(option, value)
        : (value.id && option.id === value.id) ||
            (value._id && option._id === value._id);
    },
    [isOptionEqualToValue, getOptionValue]
  );

  const getOptionLabelWrapper = useCallback(
    (option: T | string) => {
      if (freeSolo && typeof option === "string") {
        return option;
      }

      const orgOption =
        typeof option !== "object" && getOptionValue
          ? options.find((op) => getOptionValue(op) === option)
          : option;

      if (orgOption == null || orgOption === "") return "";

      return getOptionLabel
        ? getOptionLabel(orgOption)
        : (orgOption as any).label ?? "";
    },
    [getOptionLabel, getOptionValue, options, freeSolo]
  );

  const getValues = (data: any) => {
    if (!data) return null;

    if (typeof getOptionValue !== "function") {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) =>
        typeof item !== "object" ? item : getOptionValue(item)
      );
    }

    return typeof data !== "object" ? data : getOptionValue(data);
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { invalid, error },
      }) => (
        <Autocomplete
          loading={loading}
          loadingText={loadingText}
          disabled={disabled}
          multiple={multiple}
          freeSolo={freeSolo}
          size="small"
          options={options}
          getOptionLabel={getOptionLabelWrapper}
          renderOption={renderOption}
          isOptionEqualToValue={isOptionEqualToValueWrapper}
          disablePortal={disablePortal}
          sx={{
            "& .MuiInputBase-root": {
              height: "45px",
            },
            "& label": {
              marginTop: "2px",
            },
            "& label.Mui-focused": {
              marginTop: "0",
              color: "#6F7E8C",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderRadius: "10px" },
              fontFamily: "'Arial', sans-serif",
              backgroundColor: "#f5f5f500",
              "&.Mui-focused fieldset": {
                borderColor: "#6F7E8C",
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label ? `${label} ${required ? " *" : ""}` : ""}
              placeholder={placeholder}
              name={name}
              error={invalid}
              onChange={freeSolo ? onChange : () => {}}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {loading ? (
                      <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              }}
              helperText={
                error
                  ? typeof parseError === "function"
                    ? parseError(error)
                    : error.message
                  : rest.helperText
              }
            />
          )}
          onChange={(_, data: any) => {
            if (multiple && Array.isArray(data)) {
              onChange(
                data.map((item) =>
                  typeof item === "string"
                    ? item
                    : getOptionValue
                    ? getOptionValue(item)
                    : item
                )
              );
            } else {
              onChange(
                typeof data === "string"
                  ? data
                  : getOptionValue
                  ? getOptionValue(data) || null
                  : data
              );
            }
          }}
          onBlur={onBlur}
          value={getValues(value) || (multiple ? [] : null)}
          {...rest}
        />
      )}
    />
  );
};

export default BasicAutocomplete;
