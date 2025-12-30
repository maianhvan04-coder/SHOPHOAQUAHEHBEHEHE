import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllCategories } from "../category.store";
import { categoryApi } from "~/api/categoryApi";

const PAGE_SIZE = 5;

export const useAdminCategory = () => {
  const dispatch = useDispatch();
  const { listCategories, isLoading } = useSelector(
    (state) => state.category
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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
    if (!search) return listCategories;
    return listCategories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [listCategories, search]);

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  return {
    categories: paginated,
    loading: isLoading,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
