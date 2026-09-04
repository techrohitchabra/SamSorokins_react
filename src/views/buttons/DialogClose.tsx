import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

interface Props {
  onClose?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

/**
 * A button component for closing dialogs, featuring a close icon.
 * @component DialogClose
 * @author Sanjay
 *
 */
export default function DialogClose({ onClose }: Props) {
  return (
    <IconButton
      aria-label="close"
      onClick={(e) => onClose?.(e)}
      sx={{
        position: "absolute",
        right: 8,
        top: 8,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <Close />
    </IconButton>
  );
}
