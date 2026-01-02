// src/features/category/hooks/adminCategory.js
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "../category.store";
import { categoryApi } from "~/api/categoryApi";

export const useAdminCategory = () => {
  const dispatch = useDispatch();
  const { listCategories, isLoading } = useSelector((state) => state.category);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  // ===== LOAD DATA =====
  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch]);

  // ===== CRUD =====
  const createCategory = async (data) => {
    await categoryApi.create(data);
    dispatch(fetchAllCategories());
  };

  const updateCategory = async (id, data) => {
    await categoryApi.update(id, data);
    dispatch(fetchAllCategories());
  };

  const deleteCategory = async (id) => {
    await categoryApi.remove(id);
    dispatch(fetchAllCategories());
  };

  // ===== FILTER =====
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listCategories || [];

    return (listCategories || []).filter((c) => {
      const name = (c?.name || "").toLowerCase();
      const slug = (c?.slug || "").toLowerCase();
      return name.includes(q) || slug.includes(q);
    });
  }, [listCategories, search]);

  // ✅ totalItems cho Pagination
  const totalItems = filtered.length;

  // ===== PAGINATION =====
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const categories = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  // Reset page khi search/limit đổi
  useEffect(() => {
    setPage(1);
  }, [search, limit]);

  // Chặn page vượt totalPages (khi xóa item làm giảm trang)
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return {
    categories,
    loading: isLoading,
    search,
    setSearch,
    page,
    setPage,
    limit,      // ✅ NEW
    setLimit,   // ✅ NEW
    totalItems, // ✅ NEW
    totalPages,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
