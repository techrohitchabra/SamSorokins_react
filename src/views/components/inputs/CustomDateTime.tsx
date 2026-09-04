import styled from "@emotion/styled";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { InputAdornment, TextField } from "@mui/material";
import {
  LocalizationProvider,
  MobileDateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Controller, useFormContext, type FieldError } from "react-hook-form";

/**
 * A reusable date-time picker component that integrates with React Hook Form.
 * @component CustomDateTimePicker
 * @author Sanjay
 *
 */
export type DateTimePickerProps = {
  name: string;
  required?: boolean;
  parseError?: (error: FieldError) => string;
  parseDate?: (date: dayjs.Dayjs | null) => string;
  helperText?: string;
  label?: string;
  isMinutesStep?: boolean;
  inputFormat?: string;
  mask?: string;
  minDate?: any;
  disabled?: boolean;
};

const CustomDateTimePicker = styled(MobileDateTimePicker)({
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderRadius: "12px" },
    fontSize: "1rem",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f5f5f500",
    height: "3.2em",
  },
  "& .MuiInputBase-input": {
    fontSize: "1rem",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
  },
  "& .Mui-focused fieldset": {
    borderColor: "#6F7E8C !important",
  },
  "& .css-1jy569b-MuiFormLabel-root-MuiInputLabel-root.Mui-focused": {
    color: "#6F7E8C !important",
  },
  "& label.Mui-focused": {
    color: "#6F7E8C",
  },
  "& .css-mvmxd9-MuiTypography-root-MuiPickersToolbarText-root": {
    fontSize: "1rem !important",
  },
  width: "100%",
});

const CustomDateTime = ({
  name,
  label,
  required = false,
  parseError,
  helperText,
  isMinutesStep = false,
  inputFormat = "MM/DD/YYYY hh:mm A",
  mask = "__/__/____ __:__ _M",
  minDate = null,
  ...rest
}: DateTimePickerProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value },
        fieldState: { error, invalid },
      }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CustomDateTimePicker
            enableAccessibleFieldDOMStructure={false}
            value={value ? dayjs(value) : null}
            onChange={(date) => onChange(date)}
            label={label || "Select Date & Time"}
            minutesStep={isMinutesStep ? 5 : 1}
            minDateTime={dayjs(minDate)}
            slots={{
              textField: (props: any) => (
                <TextField
                  {...props}
                  label={`${label} ${required ? " *" : ""}`}
                  fullWidth
                  margin="normal"
                  error={invalid}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <DateRangeIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText={
                    error
                      ? typeof parseError === "function"
                        ? parseError(error as any)
                        : error.message
                      : helperText
                  }
                />
              ),
            }}
            {...rest}
          />

          {/* <Typography
            sx={{
              ml: 1.5,
              color: "#d32f2f",
              fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
              fontWeight: 400,
              fontSize: "0.75rem",
            }}
          >
            {error?.message || ""}
          </Typography> */}
        </LocalizationProvider>
      )}
    />
  );
};

export default CustomDateTime;
