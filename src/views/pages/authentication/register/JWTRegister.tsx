// import { Country, State } from "country-state-city";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// material-ui
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

// yup

// components
// import SubmitButton from "../buttons/SubmitButton";
// import {
//   strengthColor,
//   strengthIndicator,
// } from "../../../utils/password-strength";
import MotionButton from "../../../buttons/MotionButton";
import BasicAutocomplete from "../../../components/inputs/BasicAutocomplete";
import FormContainer from "../../../components/inputs/FormContainer";
import MuiTextField from "../../../components/inputs/MuiTextField";
import Password from "../../../components/inputs/Password";
import PhoneNumberHelper from "../../../components/inputs/PhoneNumber";
import Select from "../../../components/inputs/Select";
import { useSnackbarHelper } from "../../../components/snackbar";
// import useAuth from "../../../hooks/useAuth";
// import useUser from "../../../hooks/useUser";
// import MotionButton from "../buttons/MotionButton";
// import BasicAutocomplete from "../input/BasicAutocomplete";
// import FormContainer from "../input/FormContainer";
// import MuiTextField from "../input/MuiTextField";
// import Password from "../input/Password";
// import PhoneNumber from "../input/PhoneNumber";
// import Select from "../input/Select";
// import { useSnackbarHelper } from "../snackbar";

/**
 * To create a new account using a registration form
 * @component JwtRegister
 * @author Sanjay
 *
 */

// ===============================|| JWT REGISTER ||=============================== //

const JWTRegister = () => {
  // const navigate = useNavigate();
  const [level, setLevel] = useState<any>();
  // const { registerUser, isRegisteringUser } = useUser();
  // const { request } = useAuth();
  const showSnackbar = useSnackbarHelper();
  // type FormValues = Yup.InferType<typeof validationSchema>;

  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    state: "",
    country: "",
    phoneNumber: "",
    preferredLanguage: "",
    gender: "",
    city: "",
    pinCode: "",
  };

  const formContext = useForm({
    defaultValues: initialValues,
    // resolver: yupResolver(validationSchema),
  });

  const { watch } = formContext;
  // const countryList = Country.getAllCountries().map((item: any) => ({
  //   label: item.name,
  //   value: item.name,
  //   isoCode: item.isoCode,
  // }));

  const password = watch("password");

  // useEffect(() => {
  //   const temp = strengthIndicator(password);
  //   setLevel(strengthColor(temp));
  // }, [password]);

  useEffect(() => {
    setLevel({});
  }, []);
  // const selectedCountry = watch("country");

  // const statesList = useMemo(() => {
  //   const countryISOCode = countryList?.find(
  //     (country: any) => country.value === selectedCountry
  //   )?.isoCode;

  //   if (countryISOCode) {
  //     return State.getStatesOfCountry(countryISOCode).map((item: any) => ({
  //       label: `${item.isoCode} (${item.name})`,
  //       value: item.isoCode,
  //       isoCode: item.isoCode,
  //     }));
  //   }

  //   return [];
  //   //eslint-disable-next-line
  // }, [selectedCountry, countryList]);

  const onFormSubmit = async (values: any) => {
    console.log(values);
    try {
      // const data = await registerUser(values);
      // const message = data?.message || "Success";
      // showSnackbar(message, "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || "An error occurred";
      showSnackbar(message, "error");
    }
  };
  return (
    <>
      {/* {isRegisteringUser && ( */}
      {false && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "black",
            zIndex: 9999,
            opacity: 0.5,
            // backdropFilter: "blur(1.5px)",
          }}
          // sx={{position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999, background: "black", opacity: 0.8,}}
        >
          <CircularProgress />
        </Box>
      )}

      <FormContainer
        // validation={validationSchema}
        formContext={formContext}
        // defaultValues={initialValues}
        onSuccess={onFormSubmit}
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <MuiTextField
              name="firstName"
              type="text"
              label={"First Name"}
              required
            />
            {/* <BasicDatePicker name="date" label="label"></BasicDatePicker> */}
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MuiTextField name="lastName" type="text" label={"Last Name"} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <PhoneNumberHelper
              // fullWidth
              label={"Phone Number"}
              name="phoneNumber"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Select
              label={"Preferred Lang"}
              name="preferredLanguage"
              options={[
                { value: "en-US", label: "English (US)" },
                { value: "en-CA", label: "English (CA)" },
                { value: "fr", label: "Français (French)" },
                { value: "ja", label: "日本語 (Japanese)" },
              ]}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Select
              label={"Gender"}
              name="gender"
              options={[
                {
                  label: "Male",
                  value: "male",
                },
                {
                  label: "Female",
                  value: "female",
                },
                {
                  label: "Other",
                  value: "other",
                },
              ]}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MuiTextField fullWidth label={"Address"} name="address" />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <BasicAutocomplete
              name="country"
              label={"Country"}
              options={[]}
              required
              getOptionValue={(option: any) => option?.value}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <BasicAutocomplete
              name="state"
              // additionalValue={false}
              label={"Province/State"}
              // freeSolo={true}
              options={[]}
              required
              getOptionValue={(option: any) => option?.value}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MuiTextField fullWidth label={"City"} name="city" required />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MuiTextField
              fullWidth
              label={"Postal Code/Zip Code"}
              name="pinCode"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <MuiTextField name="email" type="text" label={"Email"} required />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Password
              name="password"
              label={"Password"}
              required
              placeholder="******"
            />
          </Grid>

          {!!password && (
            <Grid container spacing={1} alignItems="center">
              <Grid>
                <Box
                  sx={{
                    bgcolor: level?.color,
                    width: 85,
                    height: 8,
                    borderRadius: "7px",
                  }}
                />
              </Grid>

              <Grid>
                <Typography variant="subtitle1" fontSize="0.75rem">
                  {level?.label}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 2 }}>
          <MotionButton>
            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
              // disabled={isRegisteringUser}
              sx={{ backgroundColor: "primary.900" }}
            >
              {"SignUp"}
            </Button>
          </MotionButton>
        </Box>
      </FormContainer>
    </>
  );
};

export default JWTRegister;
