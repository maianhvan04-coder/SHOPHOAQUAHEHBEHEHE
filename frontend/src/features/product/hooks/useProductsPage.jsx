// src/features/products/hooks/useProductsPage.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { productApi } from "~/api/productApi";
import { categoryApi } from "~/api/categoryApi";

export function useProductsPage() {
  const [tab, setTab] = useState("active"); // active | deleted

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "", // active|inactive
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [rowBusy, setRowBusy] = useState({}); // { [id]: true }

  // modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // bulk
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const toggleSelect = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const selectAll = (idsOnPage = []) => {
    setSelectedIds((prev) => {
      const all = idsOnPage.every((id) => prev.includes(id));
      return all ? prev.filter((id) => !idsOnPage.includes(id)) : Array.from(new Set([...prev, ...idsOnPage]));
    });
  };

  const clearSelection = () => setSelectedIds([]);

  const closeForm = () => setIsFormOpen(false);
  const closeDelete = () => setIsDeleteOpen(false);

  const openBulkDelete = () => setIsBulkDeleteOpen(true);
  const closeBulkDelete = () => setIsBulkDeleteOpen(false);

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setSelectedIds([]);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const loadCategories = useCallback(async () => {
    try {
     const { items: categoryItems } = await categoryApi.list({ page: 1, limit: 999 });
setCategories(categoryItems); // <-- array chắc chắn

    } catch {
      setCategories([]);
    }
  }, []);

  const loadProducts = useCallback(
    async ({ page = pagination.page, limit = pagination.limit } = {}) => {
      setIsLoading(true);
      try {
        const res = await productApi.list({
          page,
          limit,
          tab,
          search: filters.search,
          category: filters.category,
          status: filters.status,
        });

        // Bạn có thể normalize theo format backend của bạn:
        // Ví dụ:
        // res.data.items / res.data.products / res.data
        const payload = res?.data || res;

        const list =
          payload?.items ||
          payload?.products ||
          payload?.data?.items ||
          payload?.data?.products ||
          payload?.products ||
          [];

        const pg =
          payload?.pagination ||
          payload?.meta ||
          payload?.data?.pagination ||
          payload?.data?.meta ||
          null;

        setProducts(list);

        if (pg) {
          setPagination({
            page: pg.page ?? page,
            limit: pg.limit ?? limit,
            total: pg.total ?? list.length,
            totalPages: pg.totalPages ?? 1,
          });
        } else {
          setPagination((p) => ({
            ...p,
            page,
            limit,
            total: list.length,
            totalPages: 1,
          }));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [filters.category, filters.search, filters.status, pagination.limit, pagination.page, tab]
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts({ page: 1 });
  }, [tab, filters.search, filters.category, filters.status]); // eslint-disable-line

  const handlePageChange = (nextPage) => {
    setPagination((p) => ({ ...p, page: nextPage }));
    loadProducts({ page: nextPage });
  };

  const handleLimitChange = (nextLimit) => {
    setPagination((p) => ({ ...p, limit: nextLimit, page: 1 }));
    loadProducts({ page: 1, limit: nextLimit });
  };

  // local “filteredProducts” fallback (nếu backend không filter)
  const filteredProducts = useMemo(() => {
    let list = Array.isArray(products) ? products : [];

    const s = (filters.search || "").trim().toLowerCase();
    if (s) {
      list = list.filter((p) => {
        const name = (p?.name || "").toLowerCase();
        const slug = (p?.slug || "").toLowerCase();
        return name.includes(s) || slug.includes(s);
      });
    }

    if (filters.category) {
      list = list.filter((p) => String(p?.category?._id || p?.category) === String(filters.category));
    }

    if (filters.status === "active") list = list.filter((p) => !!p?.isActive);
    if (filters.status === "inactive") list = list.filter((p) => !p?.isActive);

    return list;
  }, [filters.category, filters.search, filters.status, products]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (p) => {
    setSelectedProduct(p);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (p) => {
    setProductToDelete(p);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete?._id) return;
    setRowBusy((m) => ({ ...m, [productToDelete._id]: true }));
    try {
      await productApi.remove(productToDelete._id);
      closeDelete();
      setProductToDelete(null);
      await loadProducts({ page: pagination.page });
    } finally {
      setRowBusy((m) => ({ ...m, [productToDelete._id]: false }));
    }
  };

  const handleRestoreProduct = async (p) => {
    if (!p?._id) return;
    setRowBusy((m) => ({ ...m, [p._id]: true }));
    try {
      await productApi.restore(p._id);
      await loadProducts({ page: pagination.page });
    } finally {
      setRowBusy((m) => ({ ...m, [p._id]: false }));
    }
  };

  const toggleProductStatus = async (p) => {
    if (!p?._id) return;
    setRowBusy((m) => ({ ...m, [p._id]: true }));
    try {
      await productApi.setStatus(p._id, !p.isActive);
      await loadProducts({ page: pagination.page });
    } finally {
      setRowBusy((m) => ({ ...m, [p._id]: false }));
    }
  };

  const bulkDelete = async () => {
    if (!selectedIds.length) return;
    setIsLoading(true);
    try {
      await productApi.bulkDelete(selectedIds);
      setSelectedIds([]);
      closeBulkDelete();
      await loadProducts({ page: pagination.page });
    } finally {
      setIsLoading(false);
    }
  };

  const bulkSetStatus = async (isActive) => {
    if (!selectedIds.length) return;
    setIsLoading(true);
    try {
      await productApi.bulkStatus(selectedIds, isActive);
      setSelectedIds([]);
      await loadProducts({ page: pagination.page });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSubmit = async (payload) => {
    setIsLoading(true);
    try {
      if (selectedProduct?._id) {
        await productApi.update(selectedProduct._id, payload);
      } else {
        await productApi.create(payload);
      }
      closeForm();
      setSelectedProduct(null);
      await loadProducts({ page: pagination.page });
    } finally {
      setIsLoading(false);
    }
  };

  const activeCount = useMemo(() => products.filter((p) => !p?.isDeleted).length, [products]);
  const deletedCount = useMemo(() => products.filter((p) => !!p?.isDeleted).length, [products]);

  return {
    tab,
    changeTab,

    filters,
    handleFilterChange,

    pagination,
    handlePageChange,
    handleLimitChange,

    products,
    filteredProducts,
    categories,

    isLoading,
    rowBusy,

    selectedIds,
    toggleSelect,
    selectAll,
    clearSelection,

    isBulkDeleteOpen,
    openBulkDelete,
    closeBulkDelete,
    confirmBulkDelete: bulkDelete,
    bulkSetStatus,

    selectedProduct,
    productToDelete,
    isFormOpen,
    closeForm,
    isDeleteOpen,
    closeDelete,

    handleAddProduct,
    handleEditProduct,
    handleDeleteClick,
    handleProductSubmit,
    handleDeleteConfirm,
    handleRestoreProduct,
    toggleProductStatus,

    loadProducts,

    activeCount,
    deletedCount,
  };
}
