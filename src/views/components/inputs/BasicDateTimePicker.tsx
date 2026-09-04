import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { MobileDateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Typography } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import styled from "@emotion/styled";

interface BasicDateTimePickerProps extends UseControllerProps<FieldValues> {
  label: string;
  required?: boolean;
  parseError?: string;
  helperText?: string;
  onChange?: (date: Date | null) => void;
  minDate?: Dayjs;
  disabled?: boolean;
  backgroundColor?: string;
}

const CustomDateTimePicker = styled(MobileDateTimePicker)<{ error?: boolean }>(
  ({ error }) => ({
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderRadius: "12px", transition: "all 0.2s" },
      fontSize: "1rem",
      fontFamily: "'Arial', sans-serif",
      backgroundColor: "#ffffff",
      height: "45px",
      "&:hover fieldset": {
        borderColor: "#94a3b8",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#2563eb !important",
        borderWidth: "2px",
      },
      ...(error && {
        "& fieldset": {
          borderColor: "#d32f2f !important",
          borderRadius: "12px",
        },
      }),
    },
    "& .MuiInputBase-input": {
      fontSize: "0.95rem",
      fontWeight: 500,
      color: "#0f172a",
    },
    "& label.Mui-focused": {
      color: "#2563eb",
      fontWeight: 600,
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.875rem",
      marginTop: "-2px",
      color: error ? "#d32f2f" : "#64748b",
    },
  })
);

/**
 * BasicDateTimePicker component that opens in a centered modal dialog on laptop & desktop.
 * @component BasicDateTimePicker
 */
const BasicDateTimePicker = ({
  name,
  label,
  required = false,
  parseError,
  helperText,
  onChange: handleChange,
  minDate = dayjs("2018-01-01"),
  disabled = false,
  backgroundColor = "none",
  ...rest
}: BasicDateTimePickerProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        render={({
          field: { onChange, value },
          fieldState: { error, invalid },
        }) => (
          <>
            <CustomDateTimePicker
              enableAccessibleFieldDOMStructure={false}
              name={name}
              value={value ? dayjs(value) : null}
              onChange={(date: any) => {
                onChange(date ? date.toDate() : null);
                if (handleChange) {
                  handleChange(date ? date.toDate() : null);
                }
              }}
              error={invalid}
              minDate={minDate}
              label={label ? `${label} ${required ? " *" : ""}` : ""}
              sx={{ width: "100%" }}
              disabled={disabled}
              format="DD-MM-YYYY HH:mm:ss"
              slotProps={{
                mobilePaper: {
                  sx: {
                    borderRadius: "20px",
                    p: 1.5,
                    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.3)",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    "& .MuiPickersDay-root.Mui-selected": {
                      backgroundColor: "#2563eb !important",
                      fontWeight: 700,
                    },
                    "& .MuiPickersDay-root:hover": {
                      backgroundColor: "#eff6ff",
                    },
                    "& .MuiMultiSectionDigitalClockSection-item.Mui-selected": {
                      backgroundColor: "#2563eb !important",
                      color: "#ffffff !important",
                      fontWeight: 700,
                    },
                  },
                },
                actionBar: {
                  actions: ["cancel", "accept"],
                },
              }}
              {...rest}
            />
            <Typography
              sx={{
                ml: 1.5,
                color: "#d32f2f",
                fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
                fontWeight: 400,
                fontSize: "0.75rem",
                mt: 0.25,
              }}
            >
              {error?.message || helperText || ""}
            </Typography>
          </>
        )}
      />
    </LocalizationProvider>
  );
};

export default BasicDateTimePicker;
