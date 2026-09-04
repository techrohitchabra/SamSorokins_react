import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker as MuiTimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { Controller } from "react-hook-form";

/**
 * Custom TimePicker field component wrapped with Controller from react-hook-form
 * @component TimePicker
 * @author Sanjay
 *
 */

const CustomTimePicker = ({
  name,
  label,
  required,
  parseError,
  helperText,
  onChange: handleChange,
  ...rest
}: any) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        render={({ field: { onChange }, fieldState: { invalid } }) => (
          <DemoContainer components={["TimePicker"]}>
            <MuiTimePicker
              name={name}
              label={label ? label : ""}
              // value={value ? value : null}
              required={required}
              error={invalid}
              onChange={(date) => {
                // console.log({ value });
                onChange(date ? date.toDate() : null); // Convert dayjs back to Date object
              }}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                },
              }}
              {...rest}
            />
          </DemoContainer>
        )}
      />
    </LocalizationProvider>
  );
};

export default CustomTimePicker;
