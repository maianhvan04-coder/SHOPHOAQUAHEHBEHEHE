// src/app/providers/AuthWatcher.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onSessionExpired } from "~/features/auth/authSession";
import { useAuth } from "./AuthProvides";

// Nếu bạn dùng Chakra:
import { useToast } from "@chakra-ui/react";

export default function AuthWatcher() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const off = onSessionExpired((message) => {
      // đảm bảo state reset
      logout();

      // thông báo
      toast({
        title: "Hết phiên đăng nhập",
        description: message || "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });

      // điều hướng về login
      navigate("/login", { replace: true });
    });

    return off;
  }, [logout, navigate, toast]);

  return null;
}
