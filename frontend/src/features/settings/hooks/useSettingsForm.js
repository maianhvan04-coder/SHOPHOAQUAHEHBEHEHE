// src/features/settings/hooks/useSettingsForm.js
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { authStorage } from "~/features/auth/authStorage";
import { updateProfileApi, changePasswordApi } from "~/api/user.api";
import { validateProfile, validateChangePassword } from "~/shared/utils/validators";

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export function useSettingsForm(me) {
    const toast = useToast();
    const u = me?.user || {};

    const [showPassword, setShowPassword] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: u?.fullName || u?.name || "",
        email: u?.email || "",
        phone: u?.phone || "",
        location: u?.location || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        language: "en",
        notifications: { email: true, push: true, updates: false },
    });

    // ✅ sync khi me thay đổi
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            name: u?.fullName || u?.name || "",
            email: u?.email || "",
            phone: u?.phone || "",
            location: u?.location || "",
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [u?.id, u?.updatedAt]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
    };

    const onToggleNotification = (key) => {
        setFormData((p) => ({
            ...p,
            notifications: { ...p.notifications, [key]: !p.notifications[key] },
        }));
    };

    const onSubmitProfile = async (e) => {
        e.preventDefault();

        // ✅ validate ngay lúc submit (đảm bảo dùng data mới nhất)
        const { isValid, errors, values } = validateProfile({
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            location: formData.location,
        });

        if (!isValid) {
            toast({
                title: Object.values(errors)[0] || "Dữ liệu không hợp lệ",
                status: "error",
                duration: 2500,
            });
            return;
        }

        try {
            setSavingProfile(true);

            // ✅ build payload từ values đã normalize/trim
            const payload = {
                fullName: values.fullName,
                email: values.email,
                phone: values.phone || undefined,
                location: values.location || undefined,
            };

            const res = await updateProfileApi(payload);
            const data = unwrap(res) || {};

            // backend có thể trả user mới hoặc chỉ fields
            const nextUser = data?.user || (data?.id ? data : null);

            authStorage.patchMeUser(nextUser || payload);

            toast({
                title: "Cập nhật thông tin thành công",
                status: "success",
                duration: 2500,
            });
        } catch (err) {
            toast({
                title: "Cập nhật thất bại",
                description:
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    "Không thể cập nhật profile.",
                status: "error",
                duration: 3000,
            });
        } finally {
            setSavingProfile(false);
        }
    };

    const onSubmitPassword = async (e) => {
        e.preventDefault();

        // ✅ validate password dùng chung util (đỡ tự if confirm)
        const { isValid, errors, values } = validateChangePassword({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
        });

        if (!isValid) {
            toast({
                title: Object.values(errors)[0] || "Dữ liệu không hợp lệ",
                status: "error",
                duration: 2500,
            });
            return;
        }

        try {
            setSavingPassword(true);

            await changePasswordApi({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });

            setFormData((p) => ({
                ...p,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));

            toast({
                title: "Đổi mật khẩu thành công",
                status: "success",
                duration: 2500,
            });
        } catch (err) {
            toast({
                title: "Đổi mật khẩu thất bại",
                description:
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    "Không thể đổi mật khẩu.",
                status: "error",
                duration: 3000,
            });
        } finally {
            setSavingPassword(false);
        }
    };

    return {
        formData,
        setFormData,
        showPassword,
        setShowPassword,
        savingProfile,
        savingPassword,
        onChange,
        onToggleNotification,
        onSubmitProfile,
        onSubmitPassword,
    };
}
