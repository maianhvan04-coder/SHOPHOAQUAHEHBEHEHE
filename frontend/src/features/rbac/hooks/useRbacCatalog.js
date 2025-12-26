// src/features/rbac/hooks/useRbacCatalog.js
import { useCallback, useEffect, useState } from "react";
import { rbacApi } from "~/api/rbacApi";

const unwrap = (res) => res?.data?.data ?? res?.data;

export function useRbacCatalog(enabled = true) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [groups, setGroups] = useState([]);
    const [screens, setScreens] = useState([]);
    const [permissionMeta, setPermissionMeta] = useState([]);

    const fetchCatalog = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await rbacApi.catalog(); // GET /admin/rbac/catalog
            const data = unwrap(res) || {};
            setGroups(data.groups || []);
            setScreens(data.screens || []);
            setPermissionMeta(data.permissionMeta || []);
        } catch (e) {
            setError(e?.response?.data?.error?.message || "Cannot load RBAC catalog");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (enabled) fetchCatalog();
    }, [enabled, fetchCatalog]);

    return { loading, error, groups, screens, permissionMeta, fetchCatalog };
}
