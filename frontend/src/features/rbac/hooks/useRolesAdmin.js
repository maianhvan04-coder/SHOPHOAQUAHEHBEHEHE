import { useCallback, useEffect, useMemo, useState } from "react";
import { rbacService } from "~/features/rbac/services/rbacService";

export function useRolesAdmin(toast) {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const [rolePermMap, setRolePermMap] = useState({}); // { ROLE_CODE: [permissionKey...] }
    const [rolePermissionKeys, setRolePermissionKeys] = useState([]);

    const [selectedRole, setSelectedRole] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingPerms, setLoadingPerms] = useState(false);

    const [filters, setFilters] = useState({ search: "", active: "" });

    const filteredRoles = useMemo(() => {
        const s = (filters.search || "").trim().toLowerCase();
        return (roles || []).filter((r) => {
            const matchSearch =
                !s ||
                (r.code || "").toLowerCase().includes(s) ||
                (r.name || "").toLowerCase().includes(s) ||
                (r.type || "").toLowerCase().includes(s);

            const matchActive =
                filters.active === ""
                    ? true
                    : filters.active === "active"
                        ? r.isActive === true
                        : r.isActive === false;

            return matchSearch && matchActive;
        });
    }, [roles, filters]);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [r, p] = await Promise.all([
                rbacService.getRoles(),
                rbacService.getPermissions(),
            ]);

            const roleList = Array.isArray(r) ? r : [];
            setPermissions(Array.isArray(p) ? p : []);

            const entries = await Promise.all(
                roleList.map(async (role) => {
                    try {
                        const res = await rbacService.getRolePermissions(role.code);
                        const data = res?.data ?? res;
                        return [
                            role.code,
                            {
                                permissionKeys: data?.permissionKeys || [],
                                usersCount: data?.usersCount || 0,
                            },
                        ];
                    } catch {
                        return [role.code, { permissionKeys: [], usersCount: 0 }];
                    }
                })
            );

            const metaMap = Object.fromEntries(entries);

            setRolePermMap(
                Object.fromEntries(
                    Object.entries(metaMap).map(([code, v]) => [code, v.permissionKeys])
                )
            );

            setRoles(
                roleList.map((role) => ({
                    ...role,
                    usersCount: metaMap?.[role.code]?.usersCount ?? 0,
                }))
            );
        } catch (e) {
            toast?.({
                title: "Load RBAC failed",
                description: e?.message || "Không tải được roles/permissions",
                status: "error",
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const openPermissions = useCallback(
        async (role) => {
            setSelectedRole(role);
            setLoadingPerms(true);
            try {
                const res = await rbacService.getRolePermissions(role.code);
                const data = res?.data ?? res;
                setRolePermissionKeys(data?.permissionKeys || []);
                return true;
            } catch (e) {
                toast?.({
                    title: "Load role permissions failed",
                    description: e?.message || "Không tải được permissions của role",
                    status: "error",
                    duration: 3000,
                });
                return false;
            } finally {
                setLoadingPerms(false);
            }
        },
        [toast]
    );

    const savePermissions = useCallback(
        async (selectedKeys) => {
            if (!selectedRole?.code) return false;

            setSaving(true);
            try {
                await rbacService.setRolePermissions({
                    roleCode: selectedRole.code,
                    permissionKeys: selectedKeys,
                });

                setRolePermMap((prev) => ({
                    ...prev,
                    [selectedRole.code]: selectedKeys,
                }));

                toast?.({
                    title: "Saved",
                    description: `Đã gán ${selectedKeys.length} permissions cho role ${selectedRole.code}`,
                    status: "success",
                    duration: 2000,
                });

                return true;
            } catch (e) {
                const msg =
                    e?.response?.data?.error?.message ||
                    e?.message ||
                    "Lưu permissions thất bại";
                toast?.({
                    title: "Save failed",
                    description: msg,
                    status: "error",
                    duration: 3000,
                });
                return false;
            } finally {
                setSaving(false);
            }
        },
        [selectedRole, toast]
    );


    const saveRole = useCallback(
        async (roleData) => {
            setSaving(true);
            try {
                // EDIT
                if (selectedRole?._id || selectedRole?.id) {
                    const roleId = selectedRole?._id || selectedRole?.id;
                    await rbacService.updateRole(roleId, roleData);

                    toast?.({
                        title: "Role updated",
                        description: `Đã cập nhật role ${selectedRole?.code || ""}`,
                        status: "success",
                        duration: 2000,
                    });
                }
                // CREATE
                else {
                    await rbacService.createRole(roleData);

                    toast?.({
                        title: "Role created",
                        description: "Đã tạo role mới",
                        status: "success",
                        duration: 2000,
                    });
                }

                await loadAll();
                return true;
            } catch (e) {
                const msg =
                    e?.response?.data?.error?.message ||
                    e?.message ||
                    "Lưu role thất bại";

                toast?.({
                    title: "Save role failed",
                    description: msg,
                    status: "error",
                    duration: 3000,
                });
                return false;
            } finally {
                setSaving(false);
            }
        },
        [selectedRole, loadAll, toast]
    );

    const getRoleColorScheme = useCallback((code) => {
        if (code === "ADMIN") return "purple";
        if (code === "MANAGER") return "orange";
        if (code === "USER") return "cyan";
        return "blue";
    }, []);

    const deleteRole = useCallback(
        async (roleOrId) => {
            const id = typeof roleOrId === "string" ? roleOrId : roleOrId?._id || roleOrId?.id;

            if (!id) {
                toast?.({ title: "Thiếu role id", status: "error", duration: 2000 });
                return false;
            }

            setSaving(true);
            try {
                await rbacService.deleteRole(id);

                toast?.({
                    title: "Đã xóa role",
                    description: "Xóa thành công",
                    status: "success",
                    duration: 2000,
                });

                // reload list
                await loadAll();

                // nếu đang selected role là role vừa xóa
                setSelectedRole((prev) => {
                    const prevId = prev?._id || prev?.id;
                    return prevId === id ? null : prev;
                });

                return true;
            } catch (e) {
                const msg = e?.response?.data?.error?.message || e?.message || "Xóa role thất bại";
                toast?.({ title: "Delete failed", description: msg, status: "error", duration: 3000 });
                return false;
            } finally {
                setSaving(false);
            }
        },
        [toast, loadAll]
    );


    const toggleRoleStatus = useCallback(async (role) => {
        if (!role?._id && !role?.id) return false;
        const id = role.id || role._id;

        try {
            const updated = await rbacService.toggleRoleStatus(id);

            setRoles(prev =>
                prev.map(r => (r._id === id || r.id === id ? { ...r, ...updated } : r))
            );

            toast?.({
                title: "Updated",
                description: `Role ${updated.code} -> ${updated.isActive ? "Active" : "Inactive"}`,
                status: "success",
                duration: 1500,
            });

            return true;
        } catch (e) {
            toast?.({
                title: "Toggle failed",
                description: e?.response?.data?.error?.message || e?.message || "Không đổi được trạng thái",
                status: "error",
                duration: 2500,
            });
            return false;
        }
    }, [toast]);

    return {
        roles,
        permissions,
        rolePermMap,
        rolePermissionKeys,
        selectedRole,

        loading,
        saving,
        loadingPerms,

        filters,
        setFilters,
        filteredRoles,

        setSelectedRole,
        loadAll,
        openPermissions,
        savePermissions,
        saveRole,
        deleteRole,
        toggleRoleStatus,

        getRoleColorScheme,
    };
}
