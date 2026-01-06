// src/features/auth/useAuthMe.js
import { useEffect, useState } from "react";
import { authStorage } from "./authStorage";

export function useAuthMe() {
    const [me, setMe] = useState(() => authStorage.getMe());

    useEffect(() => {
        const onChanged = () => setMe(authStorage.getMe());
        window.addEventListener("auth:me_changed", onChanged);

        //  nếu mở nhiều tab
        const onStorage = (e) => {
            if (e.key === "auth_me") setMe(authStorage.getMe());
        };
        window.addEventListener("storage", onStorage);

        return () => {
            window.removeEventListener("auth:me_changed", onChanged);
            window.removeEventListener("storage", onStorage);
        };
    }, []);

    return me;
}
