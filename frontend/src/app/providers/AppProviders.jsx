// src/app/providers/AppProviders.jsx
import { AuthProvider } from "./AuthProvides";
import ToastProvider  from "~/shared/ui/Toast/ToastProvider.jsx";

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
