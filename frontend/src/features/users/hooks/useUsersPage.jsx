/* eslint-disable no-unused-vars */
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

  const form = useDisclosure();
  const del = useDisclosure();

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

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

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
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  }, []);

  const formatLastActive = useCallback((date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "N/A";
    }
  }, []);

  const allRoleCodes = useMemo(() => {
    const set = new Set();
    (users || []).forEach((u) =>
      (u.roles || []).forEach((r) => r?.code && set.add(r.code))
    );
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
    // data
    users,
    pagination,
    filters,
    allRoleCodes,
    filteredUsers,

    // ui state
    isLoading,
    selectedUser,
    userToDelete,

    // modals
    isFormOpen: form.isOpen,
    openForm: form.onOpen,
    closeForm: form.onClose,

    isDeleteOpen: del.isOpen,
    openDelete: del.onOpen,
    closeDelete: del.onClose,

    // handlers
    loadUsers,
    handleAddUser,
    handleEditUser,
    handleDeleteClick,
    handleUserSubmit,
    handleDeleteConfirm,
    handleFilterChange,

    // helpers for UI
    formatDate,
    formatLastActive,
  };
}
