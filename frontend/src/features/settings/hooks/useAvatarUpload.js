// src/features/settings/hooks/useAvatarUpload.js
import { useEffect, useRef, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { uploadUserAvatarApi } from "~/api/user.api";
import { authStorage } from "~/features/auth/authStorage";

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export function useAvatarUpload(me) {
    const toast = useToast();
    const fileInputRef = useRef(null);

    const serverUrl = me?.user?.image?.url || null;

    const [photoURL, setPhotoURL] = useState(serverUrl);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // ✅ sync khi auth_me thay đổi từ nơi khác
    useEffect(() => {
        setPhotoURL(serverUrl);
    }, [serverUrl]);

    const onUploadClick = () => fileInputRef.current?.click();

    const onFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type?.startsWith("image/")) {
            toast({ title: "File không hợp lệ", status: "error", duration: 2500 });
            return;
        }

        try {
            setUploadingAvatar(true);

            const res = await uploadUserAvatarApi(file);
            const data = unwrap(res) || {};

            // backend có thể trả: { image } hoặc { user } hoặc trả thẳng user
            const nextUser = data?.user || (data?.id ? data : null);
            const nextImage = data?.image || nextUser?.image || null;

            if (!nextImage?.url) {
                toast({
                    title: "Upload OK nhưng thiếu url",
                    description: "API không trả image.url nên không update được avatar.",
                    status: "warning",
                    duration: 3000,
                });
                return;
            }

            // ✅ update UI ngay
            setPhotoURL(nextImage.url);

            // ✅ update localStorage auth_me
            authStorage.patchMeUser({
                ...(nextUser || {}),
                image: nextImage,
            });

            toast({
                title: "Cập nhật ảnh thành công",
                status: "success",
                duration: 2500,
            });
        } catch (err) {
            toast({
                title: "Upload thất bại",
                description:
                    err?.response?.data?.error?.message ||
                    err?.message ||
                    "Không thể upload ảnh.",
                status: "error",
                duration: 3000,
            });
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return {
        photoURL,
        uploadingAvatar,
        fileInputRef,
        onUploadClick,
        onFileChange,
    };
}
