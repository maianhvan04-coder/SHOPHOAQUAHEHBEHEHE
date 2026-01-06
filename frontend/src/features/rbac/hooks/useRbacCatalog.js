// src/features/rbac/hooks/useRbacCatalog.js
import { useCallback, useEffect, useState } from "react";
import { rbacApi } from "~/api/rbacApi";

const unwrap = (res) => res?.data?.data ?? res?.data;

export function useRbacCatalog(enabled = true) {
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false); // ✅ đã load xong ít nhất 1 lần
    const [error, setError] = useState("");
    const [groups, setGroups] = useState([]);
    const [screens, setScreens] = useState([]);
    const [permissionMeta, setPermissionMeta] = useState([]);

    const fetchCatalog = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await rbacApi.catalog();
            const data = unwrap(res) || {};

            setGroups(data.groups || []);
            setScreens(data.screens || []);
            setPermissionMeta(data.permissionMeta || []);
        } catch (e) {
            setError(e?.response?.data?.error?.message || "Cannot load RBAC catalog");
            setGroups([]);
            setScreens([]);
            setPermissionMeta([]);
        } finally {
            setLoading(false);
            setReady(true); // ✅ đánh dấu đã xong
        }
    }, []);

    useEffect(() => {
        if (!enabled) {
            // nếu chưa login -> reset state
            setReady(false);
            setLoading(false);
            setError("");
            setGroups([]);
            setScreens([]);
            setPermissionMeta([]);
            return;
        }
        setReady(false);   // ✅ mỗi lần bật lại, coi như chưa sẵn sàng
        fetchCatalog();
    }, [enabled, fetchCatalog]);

    return { loading, ready, error, groups, screens, permissionMeta, fetchCatalog };
}
