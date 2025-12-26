import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App.jsx";
import "./index.css";

import ScrollToTop from "./features/product/hooks/ScrollToTop.jsx";
import { store } from "./app/store/store.js";

import { UserAuthWrapper } from "./app/context/user.auth.context.jsx";

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./theme";

import AuthProvider from "./app/providers/AuthProvides.jsx";
import ToastProvider from "./shared/ui/Toast/ToastProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <UserAuthWrapper>
          <ChakraProvider theme={theme}>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />

            <BrowserRouter>
              <ScrollToTop />
              <ToastProvider>
                <App />
              </ToastProvider>
            </BrowserRouter>

          </ChakraProvider>
        </UserAuthWrapper>
      </AuthProvider>
    </Provider>
  </StrictMode>
);

