import React, { createContext, useContext, type ReactNode } from "react";
import { useSnackbar, type VariantType } from "notistack";
import { Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

type SnackbarHelperProps = {
  children: ReactNode;
};

const SnackbarContext = createContext<
  (message: string, variant?: VariantType) => void
>(() => {});

export const SnackbarHelper: React.FC<SnackbarHelperProps> = ({ children }) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showSnackbar = (message: string, variant: VariantType = "default") => {
    let value = <Typography variant="subtitle1">{message}</Typography>;
    enqueueSnackbar(value, {
      variant,
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
      autoHideDuration: 10000,
      action: (key) => (
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => closeSnackbar(key)}
        >
          <CloseIcon />
        </IconButton>
      ),
    });
  };

  return (
    <SnackbarContext.Provider value={showSnackbar}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbarHelper = () => {
  return useContext(SnackbarContext);
};
