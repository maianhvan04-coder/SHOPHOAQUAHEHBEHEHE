import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App.jsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

import ScrollToTop from "./features/product/hooks/ScrollToTop.jsx";
import { store } from "./app/store/store.js";

import { UserAuthWrapper } from "./app/context/user.auth.context.jsx";

import AuthProvider from "./app/providers/AuthProvides.jsx";
import ToastProvider from "./shared/ui/Toast/ToastProvider";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
      <AuthProvider>
        <UserAuthWrapper>        
            <BrowserRouter>
              <ScrollToTop />
              <ToastProvider>
                <App />
              </ToastProvider>
            </BrowserRouter>  
        </UserAuthWrapper>
      </AuthProvider>
    </Provider>
    </GoogleOAuthProvider>
  // </StrictMode>
);

