import { Box, InputAdornment, OutlinedInput } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

/**
 * A customizable search component that is used to apply search field in the project.
 * @component SearchField
 * @author Sanjay
 *
 */

const SearchField = ({
  onChange,
  size = "small",
  placeholder = "Search",
  height = 40,
  ...rest
}: any) => {
  return (
    <Box>
      <OutlinedInput
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "12px",
          fontWeight: 300,
          height: window.innerWidth < 1420 ? 32 : height,
          borderRadius: "8px",
        }}
        onChange={onChange}
        size={size}
        placeholder={placeholder}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
        {...rest}
      />
    </Box>
  );
};

export default SearchField;
