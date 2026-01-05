import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { categoryApi } from "~/api/categoryApi";

const DEFAULT_LIMIT = 5;

export const useAdminCategory = ({ tab = "active", filters = {} } = {}) => {
  // ===== FILTERS =====
  const search = String(filters?.search ?? "");
  const type = String(filters?.type ?? "");
  const status = String(filters?.status ?? "");

  // ===== PAGINATION =====
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // ===== DATA =====
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);

  // ===== COUNTS =====
  const [counts, setCounts] = useState({ active: 0, deleted: 0 });
  const [countLoading, setCountLoading] = useState(false);

  // race control
  const reqIdRef = useRef(0);
  const countReqIdRef = useRef(0);

  // ===== build params list =====
  const listParams = useMemo(() => {
    const q = { tab, page, limit };

    const s = search.trim();
    if (s) q.search = s;
    if (type) q.type = type;

    if (status === "active") q.isActive = true;
    if (status === "inactive") q.isActive = false;

    return q;
  }, [tab, page, limit, search, type, status]);

  // ===== build params counts =====
  const countBaseParams = useMemo(() => {
    const q = { page: 1, limit: 1 };

    const s = search.trim();
    if (s) q.search = s;
    if (type) q.type = type;

    if (status === "active") q.isActive = true;
    if (status === "inactive") q.isActive = false;

    return q;
  }, [search, type, status]);

  // ===== fetch list =====
  const refetch = useCallback(async () => {
    const myReq = ++reqIdRef.current;
    setLoading(true);

    try {
      const res = await categoryApi.list(listParams);
      if (myReq !== reqIdRef.current) return;

      setCategories(res?.items || []);
      setPagination(
        res?.pagination || { page, limit, total: 0, totalPages: 1 }
      );
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  }, [listParams, page, limit]);

  // ===== fetch counts =====
  const refetchCounts = useCallback(async () => {
    const myReq = ++countReqIdRef.current;
    setCountLoading(true);

    try {
      const [a, d] = await Promise.all([
        categoryApi.list({ ...countBaseParams, tab: "active" }),
        categoryApi.list({ ...countBaseParams, tab: "deleted" }),
      ]);

      if (myReq !== countReqIdRef.current) return;

      setCounts({
        active: Number(a?.pagination?.total || 0),
        deleted: Number(d?.pagination?.total || 0),
      });
    } finally {
      if (myReq === countReqIdRef.current) setCountLoading(false);
    }
  }, [countBaseParams]);

  // ✅ helper reload 1 lần
  const reloadAll = useCallback(async () => {
    await Promise.all([refetch(), refetchCounts()]);
  }, [refetch, refetchCounts]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    refetchCounts();
  }, [refetchCounts]);

  useEffect(() => {
    setPage(1);
  }, [tab, search, type, status, limit]);

  // ===== CRUD (không auto reload cho bulk) =====
  const createCategory = useCallback(async (data) => {
    await categoryApi.create(data);
    await reloadAll();
  }, [reloadAll]);

  const updateCategory = useCallback(async (id, data) => {
    await categoryApi.update(id, data);
    await reloadAll();
  }, [reloadAll]);

  const deleteCategory = useCallback(async (id) => {
    await categoryApi.remove(id);
  }, []);

  const restoreCategory = useCallback(async (id) => {
    await categoryApi.restore(id);
  }, []);

  const hardDeleteCategory = useCallback(async (id) => {
    await categoryApi.hardDelete(id);
  }, []);

  const totalItems = Number(pagination?.total || 0);
  const totalPages = Math.max(1, Number(pagination?.totalPages || 1));

  return {
    categories,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    totalItems,
    totalPages,

    counts,
    countLoading,

    refetch,
    refetchCounts,
    reloadAll,

    createCategory,
    updateCategory,

    deleteCategory,
    restoreCategory,
    hardDeleteCategory,
  };
};
