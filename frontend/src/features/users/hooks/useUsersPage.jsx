// useUsersPage.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDisclosure, useToast } from "@chakra-ui/react";
import { format, formatDistanceToNow } from "date-fns";
import { userService } from "~/features/users/userService";
import { createUserAdmin } from "~/api/user.api";

export function useUsersPage() {
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // ✅ NEW: selection + row loading
  const [selectedIds, setSelectedIds] = useState([]);
  const [rowBusy, setRowBusy] = useState({}); // { [id]: true }

  const form = useDisclosure();
  const del = useDisclosure();
  const bulkDel = useDisclosure(); // ✅ modal xác nhận xóa nhiều

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
  });

  const loadUsers = useCallback(async (params = {}) => {
    setIsLoading(true);
    try {
      const { items, pagination } = await userService.getAll(params);
      setUsers(Array.isArray(items) ? items : []);
      setPagination(pagination || null);
      setSelectedIds([]); // ✅ reload list thì clear selection cho đỡ rối
    } catch (error) {
      toast({
        title: "Error loading users",
        description: error?.message || "Không tải được users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ====== Selection helpers ======
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  const selectAll = useCallback((idsOnPage) => {
    setSelectedIds((prev) => {
      const allSelected = idsOnPage.every((id) => prev.includes(id));
      if (allSelected) {
        // bỏ chọn tất cả trên page
        return prev.filter((id) => !idsOnPage.includes(id));
      }
      // chọn tất cả trên page (merge)
      const set = new Set(prev);
      idsOnPage.forEach((id) => set.add(id));
      return Array.from(set);
    });
  }, []);

  // ====== Toggle 1 user status ======
  const toggleUserStatus = useCallback(async (u) => {
    if (!u?._id) return;

    const nextActive = !u.isActive;

    setRowBusy((p) => ({ ...p, [u._id]: true }));
    try {
      // dùng bulkSetStatus cho đồng nhất API
      await userService.bulkSetStatus([u._id], nextActive);

      // ✅ update local (đỡ phải reload)
      setUsers((prev) =>
        prev.map((x) => (x._id === u._id ? { ...x, isActive: nextActive } : x))
      );

      toast({
        title: "Updated status",
        description: `${u.fullName || u.email} → ${nextActive ? "Active" : "Inactive"}`,
        status: "success",
        duration: 2000,
      });
    } catch (e) {
      toast({
        title: "Update status failed",
        description: e?.response?.data?.error?.message || e?.message || "Failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      setRowBusy((p) => {
        const n = { ...p };
        delete n[u._id];
        return n;
      });
    }
  }, [toast]);

  // ====== Bulk actions ======
  const bulkSetStatus = useCallback(async (isActive) => {
    if (!selectedIds.length) return;

    try {
      await userService.bulkSetStatus(selectedIds, isActive);

      // update local
      setUsers((prev) =>
        prev.map((x) => (selectedIds.includes(x._id) ? { ...x, isActive } : x))
      );

      toast({
        title: "Bulk update status success",
        description: `Đã cập nhật ${selectedIds.length} user`,
        status: "success",
        duration: 2500,
      });

      clearSelection();
    } catch (e) {
      toast({
        title: "Bulk update failed",
        description: e?.response?.data?.error?.message || e?.message || "Failed",
        status: "error",
        duration: 3000,
      });
    }
  }, [selectedIds, toast, clearSelection]);

  const openBulkDelete = useCallback(() => {
    if (!selectedIds.length) return;
    bulkDel.onOpen();
  }, [selectedIds, bulkDel]);

  const confirmBulkDelete = useCallback(async () => {
    if (!selectedIds.length) return;
    try {
      await userService.bulkSoftDelete(selectedIds);

      setUsers((prev) => prev.filter((x) => !selectedIds.includes(x._id)));

      toast({
        title: "Bulk delete success",
        description: `Đã xoá ${selectedIds.length} user`,
        status: "success",
        duration: 2500,
      });

      clearSelection();
      bulkDel.onClose();
    } catch (e) {
      toast({
        title: "Bulk delete failed",
        description: e?.response?.data?.error?.message || e?.message || "Failed",
        status: "error",
        duration: 3000,
      });
    }
  }, [selectedIds, toast, clearSelection, bulkDel]);

  // ====== existing create/update/delete ======
  const handleAddUser = useCallback(() => {
    setSelectedUser(null);
    form.onOpen();
  }, [form]);

  const handleEditUser = useCallback((user) => {
    setSelectedUser(user);
    form.onOpen();
  }, [form]);

  const handleDeleteClick = useCallback((user) => {
    setUserToDelete(user);
    del.onOpen();
  }, [del]);

  const handleUserSubmit = useCallback(async (formData) => {
    try {
      if (selectedUser?._id) {
        await userService.update(selectedUser._id, formData);
        toast({ title: "User updated", status: "success", duration: 2500 });
      } else {
        await createUserAdmin(formData);
        toast({ title: "User created", status: "success", duration: 2500 });
      }

      await loadUsers();
      form.onClose();
    } catch (error) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Save user failed";

      toast({
        title: "Error saving user",
        description: msg,
        status: "error",
        duration: 3500,
      });
    }
  }, [selectedUser, toast, loadUsers, form]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete?._id) return;
    try {
      await userService.remove(userToDelete._id);

      toast({
        title: "User deleted successfully",
        status: "success",
        duration: 2500,
      });

      await loadUsers();
      del.onClose();
    } catch (error) {
      toast({
        title: "Error deleting user",
        description: error?.message || "Xoá user thất bại",
        status: "error",
        duration: 3000,
      });
    }
  }, [userToDelete, toast, loadUsers, del]);

  const formatDate = useCallback((date) => {
    try { return format(new Date(date), "MMM dd, yyyy"); } catch { return "N/A"; }
  }, []);

  const formatLastActive = useCallback((date) => {
    try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return "N/A"; }
  }, []);

  const allRoleCodes = useMemo(() => {
    const set = new Set();
    (users || []).forEach((u) => (u.roles || []).forEach((r) => r?.code && set.add(r.code)));
    return Array.from(set).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    const s = (filters.search || "").trim().toLowerCase();
    return (users || []).filter((u) => {
      const name = (u.fullName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const id = (u._id || "").toLowerCase();
      const roleCodes = (u.roles || []).map((r) => r.code).filter(Boolean);
      const statusText = u.isActive ? "active" : "inactive";

      const matchesSearch = !s || name.includes(s) || email.includes(s) || id.includes(s);
      const matchesRole = !filters.role || roleCodes.includes(filters.role);
      const matchesStatus = !filters.status || statusText === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  return {
    users,
    pagination,
    filters,
    allRoleCodes,
    filteredUsers,

    isLoading,
    selectedUser,
    userToDelete,

    // ✅ selection
    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,

    // ✅ status + bulk
    rowBusy,
    toggleUserStatus,
    bulkSetStatus,
    openBulkDelete,
    confirmBulkDelete,
    isBulkDeleteOpen: bulkDel.isOpen,
    closeBulkDelete: bulkDel.onClose,

    // modals
    isFormOpen: form.isOpen,
    closeForm: form.onClose,
    isDeleteOpen: del.isOpen,
    closeDelete: del.onClose,

    // handlers
    loadUsers,
    handleAddUser,
    handleEditUser,
    handleDeleteClick,
    handleUserSubmit,
    handleDeleteConfirm,
    handleFilterChange,

    formatDate,
    formatLastActive,
  };
}
