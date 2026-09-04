import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Stack, TextField } from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import MotionButton from "../../../buttons/MotionButton";
import { useSnackbarHelper } from "../../../components/snackbar";
import useUser from "../../../../hooks/useUser";
// import MotionButton from "../buttons/MotionButton";
// import useUser from "../../../hooks/useUser";
// import { useSnackbarHelper } from "../snackbar";

// ========================|| FIREBASE - TWO FACTOR AUTHENTICATION ||======================== //

/**
 *  The two Factor Authentication Form UI
 * @hook JWTTwoFactorAuthentication
 * @author Sanjay
 *
 */

const JWTTwoFactorAuthentication = () => {
  const { verifyOtp, isOtpVerifying } = useUser();
  const showSnackbar = useSnackbarHelper();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  const validationSchema = Yup.object().shape({
    otp: Yup.array()
      .of(
        Yup.string()
          .length(1, "Must be exactly 1 character")
          .required("Required")
      )
      .length(4, "Must be exactly 4 characters"),
  });

  const { handleSubmit, control, setValue, getValues } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      otp: ["", "", "", ""],
    },
  });

  const handleChange = (value: string, index: number) => {
    const currentOtp: any = getValues("otp");
    currentOtp[index] = value;
    setValue("otp", currentOtp);

    if (value && index < currentOtp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    } else if (value === "" && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const onFormSubmit = async (values: any) => {
    const { otp } = values;
    const otpString = otp.join("");

    try {
      const data = await verifyOtp({ otp: otpString, email });
      const message = data?.message || "Success";
      localStorage.removeItem("otpCount");
      showSnackbar(message, "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || "An error occurred";

      showSnackbar(message, "error");
      if (message === "OTP expired. Please request a new OTP.") {
        navigate("/login", { replace: true });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Stack
        sx={{ mb: 3 }}
        spacing={4}
        direction={"row"}
        justifyContent={"center"}
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <Controller
            key={index}
            name={`otp.${index}`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderRadius: "12px" },
                    fontSize: "1rem", // Set common font size for both fields
                    fontFamily: "'Arial', sans-serif", // Set common font family for both fields
                    backgroundColor: "f5f5f500", // Set different background colors if needed
                    height: "3.2em", // Adjust height to match the email field
                    width: "3.2em",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.875rem", // Match font size of the label if needed
                  },
                  "& .MuiInputBase-input": {
                    textAlign: "center", // Center the text
                  },
                }}
                id={`otp-${index}`}
                type="text"
                inputProps={{ maxLength: 1 }}
                value={field.value}
                onChange={(e) => handleChange(e.target.value, index)}
                required
              />
            )}
          />
        ))}
      </Stack>
      <Box sx={{ mt: 6 }}>
        <MotionButton>
          <Button
            disableElevation
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            disabled={isOtpVerifying}
            sx={{ backgroundColor: "primary.900" }}
          >
            {isOtpVerifying ? "loading..." : "Verify & Proceed"}
          </Button>
        </MotionButton>
      </Box>
    </form>
  );
};

export default JWTTwoFactorAuthentication;
