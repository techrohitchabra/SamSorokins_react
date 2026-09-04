import { ThemeProvider } from "@mui/material/styles";
import ModalProvider from "mui-modal-provider";
import Routes from "./routes";
import theme from "./theme";

const App = () => {
  return (
    <ModalProvider>
      <ThemeProvider theme={theme}>
        <Routes />
      </ThemeProvider>
    </ModalProvider>
  );
};

export default App;
