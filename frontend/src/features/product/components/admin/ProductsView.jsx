import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Pagination from "~/components/common/Pagination";
import PageHeader from "~/components/layout/admin/PageHeader";
import ProductsTabs from "./ProductsTabs";

import DeleteModals from "./components/DeleteModals";
import ProductHistoryModal from "./components/history/ProductHistoryModal";
import ProductsToolbar from "./components/ProductsToolbar";

import {
  Box,
  Button,
  Card,
  HStack,
  IconButton,
  SimpleGrid,
  Stack,

  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";

import {
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import { computePermission } from "./products.helpers";
import ProductsTableDesktop from "./components/ProductsTableDesktop";
import MobileProductCard from "./components/MobileProductCard";

export default function ProductsView(props) {
    const navigate = useNavigate();
  const {
    tab = "active",
    onTabChange,
    onRestoreProduct,

    filteredProducts = [],
    pagination = null,
    filters,
    categories = [],
    isLoading = false,

    screens = [],
    userPermissions = [],

    selectedIds = [],
    toggleSelect,
    selectAll,
    clearSelection,

    onPageChange,
    onLimitChange,

    selectedProduct,
    productToDelete,
    isFormOpen,
    closeForm,
    isDeleteOpen,
    closeDelete,
    
 
    onDeleteClick,
    onSubmitProduct,
    onConfirmDelete,
    onFilterChange,
    onRefresh,

    rowBusy = {},
    onToggleStatus,

    isBulkDeleteOpen = false,
    openBulkDelete,
    closeBulkDelete,
    confirmBulkDelete,
    bulkSetStatus,

    activeCount = 0,
    deletedCount = 0,
  } = props;

  const isDeletedTab = tab === "deleted";
 const handleAddProduct = () => {
    navigate("/admin/product/create");
  };
  /* ================= HISTORY ================= */
  const [historyProduct, setHistoryProduct] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const onEditProduct =(product)=>{
     navigate(`/admin/product/${product._id}/edit`);
  }
  const openHistory = (product) => {
    setHistoryProduct(product);
    setIsHistoryOpen(true);
  };

  const closeHistory = () => {
    setHistoryProduct(null);
    setIsHistoryOpen(false);
  };

  /* ================= THEME ================= */
  const bgMain = useColorModeValue("gray.50", "gray.950");
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.800");
  const displayMode = useBreakpointValue({ base: "mobile", lg: "desktop" });

  /* ================= PERMISSION ================= */
  const canCreate = computePermission({
    screens,
    userPermissions,
    resourceKey: "product",
    actionKey: "create",
  });

  const canUpdate = computePermission({
    screens,
    userPermissions,
    resourceKey: "product",
    actionKey: "update",
  });

  const canDelete = computePermission({
    screens,
    userPermissions,
    resourceKey: "product",
    actionKey: "delete",
  });

  const canViewHistory = computePermission({
    screens,
    userPermissions,
    resourceKey: "product",
    actionKey: "audit",
  });

  /* ================= CATEGORY ================= */
  const categoryList = useMemo(() => {
    if (Array.isArray(categories)) return categories;
    return categories?.data?.items || [];
  }, [categories]);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    categoryList.forEach((c) => map.set(String(c._id), c?.name || "-"));
    return map;
  }, [categoryList]);

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <Box bg={bgMain} minH="100vh" py={6} px={6}>
      <Box maxW="1600px" mx="auto">

        {/* ================= HEADER ================= */}
        <Stack direction="row" justify="space-between" mb={5}>
          <Box>
            <PageHeader title="Sản phẩm" />
            <ProductsTabs
              tab={tab}
              onChangeTab={onTabChange}
              activeCount={activeCount}
              deletedCount={deletedCount}
            />
          </Box>

          <HStack spacing={2}>
            <IconButton
              aria-label="Refresh"
              icon={<ArrowPathIcon className="h-5 w-5" />}
              onClick={onRefresh}
            />

            {!isDeletedTab && canCreate && (
              <Button
                leftIcon={<PlusIcon className="h-5 w-5" />}
                colorScheme="blue"
                categories
                onClick={handleAddProduct}
              >
                Thêm mới
              </Button>
            )}
          </HStack>
        </Stack>

        {/* ================= CONTENT ================= */}
        <Card bg={cardBg} border="1px solid" borderColor={borderColor}>

          {/* 🔥 TOOLBAR */}
          <ProductsToolbar
            filters={filters}
            onFilterChange={onFilterChange}
            categoryList={categoryList}
            categoryNameById={categoryNameById}
            selectedIds={selectedIds}
            clearSelection={clearSelection}
            isDeletedTab={isDeletedTab}
            isLoading={isLoading}
            canUpdate={canUpdate}
            canDelete={canDelete}
            bulkSetStatus={bulkSetStatus}
            openBulkDelete={openBulkDelete}
          />

          {/* TABLE / MOBILE */}
          {displayMode === "desktop" ? (
            <ProductsTableDesktop
              filteredProducts={filteredProducts}
              selectedIds={selectedIds}
              toggleSelect={toggleSelect}
              selectAll={selectAll}
              isDeletedTab={isDeletedTab}
              rowBusy={rowBusy}
              canUpdate={canUpdate}
              canDelete={canDelete}
              canViewHistory={canViewHistory}
              onEditProduct={onEditProduct}
              onDeleteClick={onDeleteClick}
              onRestoreProduct={onRestoreProduct}
              onToggleStatus={onToggleStatus}
              onViewHistory={openHistory}
            />
          ) : (
            <SimpleGrid columns={1} spacing={4} p={4}>
              {filteredProducts.map((p) => (
                <MobileProductCard
                  key={p._id}
                  p={p}
                  onEdit={onEditProduct}
                  onDelete={onDeleteClick}
                  onRestore={onRestoreProduct}
                  onToggleStatus={onToggleStatus}
                  canUpdate={canUpdate}
                  canViewHistory={canViewHistory}
                  onViewHistory={openHistory}
                />
              ))}
            </SimpleGrid>
          )}

          {!!pagination && (
            <Pagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
            />
          )}
        </Card>
      </Box>

      {/* ================= MODALS ================= */}
      <ProductHistoryModal
        isOpen={isHistoryOpen}
        onClose={closeHistory}
        product={historyProduct}
      />


      <DeleteModals
        isDeleteOpen={isDeleteOpen}
        closeDelete={closeDelete}
        productToDelete={productToDelete}
        onConfirmDelete={onConfirmDelete}
      />
    </Box>
  );
}

ProductsView.propTypes = {
  tab: PropTypes.string,
};
