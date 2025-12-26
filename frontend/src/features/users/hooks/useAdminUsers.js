import { useCallback, useEffect, useMemo, useState } from "react";
import { userService } from "../userService";

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);

  const [notice, setNotice] = useState(null);

  const loadUsers = useCallback(
    async (pageParam = page) => {
      setLoading(true);
      setError("");
      try {
        const { items, pagination } = await userService.getAll({
          page: pageParam,
          limit,
        });

        setUsers(items);
        setPagination(pagination);
        setSelectedIds([]); // đổi trang / reload thì clear selection
      } catch (e) {
        setError(e.message || "Không tải được danh sách user");
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  useEffect(() => {
    loadUsers(page);
  }, [page, loadUsers]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => {
      setNotice(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notice, setNotice]);


  // SEARCH (trên dữ liệu trang hiện tại)
  const filteredUsers = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((u) =>
      [u.fullName, u.email, u.role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(keyword))
    );
  }, [q, users]);

  // SELECT
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isAllSelected = useMemo(() => {
    const currentIds = filteredUsers.map((u) => u._id || u.id);
    if (currentIds.length === 0) return false;
    return currentIds.every((id) => selectedIds.includes(id));
  }, [filteredUsers, selectedIds]);

  const toggleSelectAll = useCallback(() => {
    const currentIds = filteredUsers.map((u) => u._id || u.id);
    setSelectedIds((prev) =>
      isAllSelected ? [] : Array.from(new Set([...prev, ...currentIds]))
    );
  }, [filteredUsers, isAllSelected]);

  const changeStatusMany = useCallback(
    async (isActive) => {
      if (selectedIds.length === 0) return;

      try {
        setNotice(null);

        const res = await userService.bulkSetStatus(selectedIds, isActive);

        const stats = res?.data ?? res;
        const modified = stats?.modifiedCount ?? 0;

        setNotice({
          type: "success",
          text:
            modified > 0
              ? `Cập nhật trạng thái thành công (${modified} user).`
              : "Cập nhật trạng thái thành công.",
        });

        // reload lại trang hiện tại để chắc đúng data
        await loadUsers(page);

        return stats;
      } catch (e) {
        setNotice({ type: "error", text: e.message || "Cập nhật thất bại" });
        throw e;
      }
    },
    [selectedIds, loadUsers, page]
  );

  const deleteMany = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      setNotice(null);

      const res = await userService.bulkSoftDelete(selectedIds);

      const stats = res?.data ?? res;
      const modified = stats?.modifiedCount ?? 0;
      const requested = stats?.requested ?? selectedIds.length;

      setNotice({
        type: "success",
        text:
          modified > 0
            ? `Đã xóa ${modified}/${requested} user.`
            : "Xóa user thành công.",
      });

      await loadUsers(page);
      setSelectedIds([]); // clear selection sau khi xóa
      return stats;
    } catch (e) {
      setNotice({ type: "error", text: e.message || "Xóa user thất bại" });
      throw e;
    }
  }, [selectedIds, loadUsers, page]);


  // PAGINATION
  const canPrev = pagination && pagination.page > 1;
  const canNext = pagination && pagination.page < pagination.totalPages;

  const goPrev = () => {
    if (canPrev) setPage((p) => p - 1);
  };
  const goNext = () => {
    if (canNext) setPage((p) => p + 1);
  };

  return {
    filteredUsers,
    pagination,
    page,
    limit,
    q,
    setQ,
    loading,
    error,

    selectedIds,
    toggleSelect,
    toggleSelectAll,
    isAllSelected,

    changeStatusMany,

    goPrev,
    goNext,
    canPrev,
    canNext,
    deleteMany,
    notice,
    setNotice,
  };
}
