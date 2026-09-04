import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

//MUI
import { Button, Divider, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

//YUP
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { useDispatch } from "react-redux";
import useAuth from "../../../hooks/useAuth";
import { Country, State } from "country-state-city";
import useUser from "../../../hooks/useUser";
import { setUserData } from "../../../redux/user/userSlice";
import { useSnackbarHelper } from "../../components/snackbar";
import FormContainer from "../../components/inputs/FormContainer";
import MuiTextField from "../../components/inputs/MuiTextField";
import BasicAutocomplete from "../../components/inputs/BasicAutocomplete";
import PhoneNumberHelper from "../../components/inputs/PhoneNumber";
import TableSkeleton from "../../components/skeleton/TableSkeleton";

/**
 * Personal info to showing the personal information of the user
 * @component PersonalInfo
 *
 */

const PersonalInfo = () => {
  const { userId } = useAuth();

  const dispatch = useDispatch();
  const showSnackbar = useSnackbarHelper();
  const { user, isLoadingUser, updateUser, isUpdatingUser } = useUser(userId);

  const initialValues = useMemo(
    () => ({
      address: user?.address || "",
      city: user?.city || "",
      country: user?.country || "",
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      state: user?.state || "",
      // isActive: user?.isActive || false,
      pinCode: user?.pinCode || "",
      role: user?.role || "",
      gender: user?.gender || "",
      isActive: user?.isActive === 1 || user?.isActive === true,
    }),
    //eslint-disable-next-line
    [user, isLoadingUser]
  );

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validationSchema: any = useMemo(
    () =>
      Yup.object().shape({
        address: Yup.string(),
        city: Yup.string(),
        country: Yup.string().required("Required"),
        email: Yup.string()
          .email()
          .required("Required")
          .transform((originalValue) => originalValue.toLowerCase())
          .matches(emailRegex, "Must be a valid email"),
        role: Yup.string().required("Required"),
        gender: Yup.string().required("Required"),
        firstName: Yup.string()
          .required("Required")
          .matches(
            /^(?:[a-zA-Z]+(?:\s[a-zA-Z]+)*)?$/,
            "First name should not contain symbols/numbers or spaces"
          ),
        // isActive: Yup.boolean(),
        lastName: Yup.string()
          .matches(
            /^(?:[a-zA-Z]+(?:\s[a-zA-Z]+)*)?$/,
            "Last name should not contain symbols/numbers or spaces"
          )
          .required("Required"),
        phoneNumber: Yup.string().required("Required"),

        state: Yup.string(),
        pinCode: Yup.string(),
      }),
    //eslint-disable-next-line
    []
  );

  const formContext = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    if (initialValues) {
      formContext.reset(initialValues);
    }
    //eslint-disable-next-line
  }, [initialValues, user]);

  const { watch } = formContext;
  const selectedCountry = watch("country");

  //get the countries
  const countryList = Country.getAllCountries().map((item: any) => ({
    label: item.name,
    value: item.name,
    isoCode: item.isoCode,
  }));

  //get state list according to country
  const statesList = useMemo(() => {
    const countryISOCode = countryList?.find(
      (country: any) => country.value === selectedCountry
    )?.isoCode;

    if (countryISOCode) {
      return State.getStatesOfCountry(countryISOCode).map((item: any) => ({
        label: `${item.isoCode} (${item.name})`,
        value: item.isoCode,
        isoCode: item.isoCode,
      }));
    }

    return [];
    //eslint-disable-next-line
  }, [selectedCountry, countryList]);

  // Function which runs on the submission of the form
  const onFormSubmit = async (values: any) => {
    try {
      const data: any = await updateUser(values);

      const message = data?.message || "Success";

      dispatch(
        setUserData({
          fullName: data?.user?.fullName || data?.user?.firstName,
          firstName: data?.user?.firstName,
          lastName: data?.user?.lastName,
          role: data?.user?.role,
          userId: data?.user?.id,
        })
      );
      showSnackbar(message, "success");
    } catch (error: any) {
      const message = error?.response?.data?.message || "An error occurred";

      showSnackbar(message, "error");
    }
  };

  if (isLoadingUser || isUpdatingUser) {
    return <TableSkeleton />;
  }

  return (
    <>
      <Grid container direction="column">
        {/* Header */}
        <Grid>
          <Typography variant="h4">Personal Information</Typography>

          <Divider sx={{ mb: 1, mt: 1 }} />
        </Grid>
        {/* Scrollable form */}
        {/* <Grid
        sx={{
          flex: 1,
          overflowY: "auto",
        }}
      > */}
        <FormContainer
          // validation={validationSchema}
          formContext={formContext}
          // defaultValues={initialValues}
          // onSuccess={onFormSubmit}
          onSuccess={formContext.handleSubmit(onFormSubmit)}
        >
          <Grid
            container
            spacing={2}
            p={2}
            sx={{
              height: "calc(100vh - 340px)",
              overflow: "auto",
            }}
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <MuiTextField
                name="firstName"
                type="text"
                label="First Name"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <MuiTextField
                name="lastName"
                type="text"
                required
                label={"Last Name"}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MuiTextField name="email" type="text" label={"Email"} required />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <PhoneNumberHelper
                // fullWidth
                label="Phone Number"
                name="phoneNumber"
                required
              />
            </Grid>
            <Grid size={{ md: 12 }}>
              <MuiTextField fullWidth label="Address" name="address" />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <BasicAutocomplete
                name="gender"
                label="Gender"
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                  { label: "Other", value: "other" },
                ]}
                getOptionValue={(option: any) => option?.value}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <BasicAutocomplete
                name="country"
                label="Country"
                required
                options={countryList}
                getOptionValue={(option: any) => option?.value}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <BasicAutocomplete
                name="state"
                label="Province/State"
                options={statesList}
                getOptionValue={(option: any) => option?.value}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <MuiTextField fullWidth label="City" name="city" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <MuiTextField
                fullWidth
                label="Postal Code/zip Code"
                name="pinCode"
              />
            </Grid>
          </Grid>

          {/* Spinner overlay */}

          {/* <CircularOverlayLoader show={isUpdatingUser} /> */}
          <Grid
            sx={{
              borderTop: "1px solid #eee",
              p: 2,
              display: "flex",
              justifyContent: "flex-end",
              backgroundColor: "#fff",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              sx={{ textTransform: "none" }}
            >
              Update
            </Button>
          </Grid>
        </FormContainer>
      </Grid>
      {/* <Box display="flex" justifyContent="flex-end">
          <Grid>
   
            <Button
              type="submit"
              variant="contained"
              fullWidth
              // size="large"
              sx={{ backgroundColor: "primary", textTransform: "none" }}
            >
              Update
            </Button>
      
          </Grid>
        </Box> */}
      {/* Fixed footer */}
      {/* // </Grid> */}
    </>
  );
};

export default PersonalInfo;
