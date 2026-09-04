import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import React, { useState, type MouseEvent } from "react";
import TextField, { type TextFieldProps } from "./MuiTextField";

export type PasswordProps = TextFieldProps;

/**
 * Custom Password field component wrapped with Controller from react-hook-form
 * @component Password
 * @author Sanjay
 *
 */

const Password = React.memo((props: PasswordProps): any => {
  const [password, setPassword] = useState<boolean>(true);
  return (
    <TextField
      {...props}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onMouseDown={(e: MouseEvent<HTMLButtonElement>) =>
                e.preventDefault()
              }
              onClick={() => setPassword(!password)}
              tabIndex={-1}
            >
              {password ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
            </IconButton>
          </InputAdornment>
        ),
      }}
      type={password ? "password" : "text"}
    />
  );
});

export default Password;
