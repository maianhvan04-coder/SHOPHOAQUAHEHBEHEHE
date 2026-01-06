import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { authStorage } from "../../../auth/authStorage";

function safeFormatDate(dateString, fmt) {
    try {
        if (!dateString) return "Not available";
        return format(new Date(dateString), fmt);
    } catch {
        return "Invalid date";
    }
}

export function useProfileData() {
    const [me, setMe] = useState(() => authStorage.getMe());

    useEffect(() => {
        const onMeChanged = () => setMe(authStorage.getMe());
        window.addEventListener(authStorage.ME_EVENT, onMeChanged);

        // sync lần đầu (phòng trường hợp có change trước khi mount)
        onMeChanged();

        return () => window.removeEventListener(authStorage.ME_EVENT, onMeChanged);
    }, []);

    return useMemo(() => {
        const u = me?.user || {};

        const name = u.fullName || u.name || "N/A";
        const email = u.email || "N/A";
        const phone = u.phone || "Not provided";


        const role = (Array.isArray(me?.roles) && me.roles[0]) || u.role || "N/A";
        const avatarUrl = u?.image?.url;
        const avatarPublicId = u?.image?.publicId;
        return {
            me,
            user: u,
            roles: me?.roles || [],
            permissions: me?.permissions || [],

            name,
            email,
            phone,

            role,
            avatarUrl: u?.image?.url || "",
            avatarPublicId: u?.image?.publicId || "",


            joinDateText: safeFormatDate(u.createdAt || u.joinDate, "MMM dd, yyyy"),
            lastActiveText: safeFormatDate(u.updatedAt || u.lastActive, "MMM dd, yyyy hh:mm a"),
        };
    }, [me]);
}
