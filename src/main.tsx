import React from "react";
import ReactDOM from "react-dom/client";
// import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import { persistor, store } from "./redux/store";
import { SnackbarProvider } from "notistack";
import { SnackbarHelper } from "./views/components/snackbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadProvider } from "./contexts/UploadContext";

const root = ReactDOM.createRoot(document.getElementById("root")!);
// ... existing generic config
const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <SnackbarProvider
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <SnackbarHelper>
                <UploadProvider>
                  <App />
                </UploadProvider>
              </SnackbarHelper>
            </SnackbarProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
