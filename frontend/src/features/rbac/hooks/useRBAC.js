// src/features/rbac/hooks/useRbacManager.js
import { useCallback, useMemo, useState } from "react";
import { rbacApi } from "~/api/rbacApi";
import { userApi } from "~/api/userApi";

const normalizeRoles = (raw) => {
    const arr = Array.isArray(raw) ? raw : (raw?.items || []);
    return arr
        .filter((r) => r?.isActive !== false)
        .sort((a, b) => (b?.priority ?? 0) - (a?.priority ?? 0));
};

const normalizePermissions = (raw) => {
    const arr = Array.isArray(raw) ? raw : (raw?.items || []);
    return arr
        .filter((p) => p?.isActive !== false)
        .sort((a, b) => (a.group || "").localeCompare(b.group || "") || (a.key || "").localeCompare(b.key || ""));
};

const normalizeUsers = (raw) => {
    const arr = Array.isArray(raw) ? raw : (raw?.items || []);
    return arr;
};

const apiErrorMessage = (e, fallback = "Có lỗi xảy ra") =>
    e?.response?.data?.error?.message || e?.message || fallback;

export function useRbacManager() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchMeta = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [r, p] = await Promise.all([rbacApi.listRoles(), rbacApi.listPermissions()]);
            setRoles(normalizeRoles(r));
            setPermissions(normalizePermissions(p));
        } catch (e) {
            setError(apiErrorMessage(e, "Không tải được roles/permissions"));
        } finally {
            setLoading(false);
        }
    }, []);

    const searchUsers = useCallback(async ({ search = "", page = 1, limit = 20 } = {}) => {
        setLoading(true);
        setError("");
        try {
            const data = await userApi.list({ page, limit, search });
            setUsers(normalizeUsers(data));
        } catch (e) {
            setError(apiErrorMessage(e, "Không tải được users"));
        } finally {
            setLoading(false);
        }
    }, []);

    const syncAdmin = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            await rbacApi.syncAdminAllPermissions();
            await fetchMeta();
        } catch (e) {
            setError(apiErrorMessage(e, "Sync admin thất bại"));
            throw e;
        } finally {
            setLoading(false);
        }
    }, [fetchMeta]);

    const setRolePermissions = useCallback(async (payload) => {
        setLoading(true);
        setError("");
        try {
            await rbacApi.setRolePermissions(payload);
        } catch (e) {
            setError(apiErrorMessage(e, "Lưu role permissions thất bại"));
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const setUserRoles = useCallback(async (payload) => {
        setLoading(true);
        setError("");
        try {
            await rbacApi.setUserRoles(payload);
        } catch (e) {
            setError(apiErrorMessage(e, "Gán roles cho user thất bại"));
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const setUserOverride = useCallback(async (payload) => {
        setLoading(true);
        setError("");
        try {
            await rbacApi.setUserOverride(payload);
        } catch (e) {
            setError(apiErrorMessage(e, "Lưu override thất bại"));
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const removeUserOverride = useCallback(async (payload) => {
        setLoading(true);
        setError("");
        try {
            await rbacApi.removeUserOverride(payload);
        } catch (e) {
            setError(apiErrorMessage(e, "Xoá override thất bại"));
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const permissionsByGroup = useMemo(() => {
        const groups = {};
        permissions.forEach((perm) => {
            const g = perm.group || "OTHER";
            if (!groups[g]) groups[g] = [];
            groups[g].push(perm);
        });
        return groups;
    }, [permissions]);

    return {
        roles,
        permissions,
        permissionsByGroup,
        users,
        loading,
        error,

        fetchMeta,
        searchUsers,

        syncAdmin,
        setRolePermissions,
        setUserRoles,
        setUserOverride,
        removeUserOverride,
    };
}
