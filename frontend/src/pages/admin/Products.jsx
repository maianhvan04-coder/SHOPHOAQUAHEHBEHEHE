import { useOutletContext } from "react-router-dom";
import { useAuth } from "~/app/providers/AuthProvides";
import ProductsView from "~/features/product/components/admin/ProductsView";
import { useProductsPage } from "~/features/product/hooks/useProductsPage";

function Products() {
  const { screens = [] } = useOutletContext() || {};
  const { permissions = [] } = useAuth();
  const vm = useProductsPage();

  return (
    <ProductsView
      tab={vm.tab}
      onTabChange={vm.changeTab}
      onRestoreProduct={vm.handleRestoreProduct}

      screens={screens}
      userPermissions={permissions}

      products={vm.products}
      filteredProducts={vm.filteredProducts}
      filters={vm.filters}
      categories={vm.categories}
      isLoading={vm.isLoading}

      selectedProduct={vm.selectedProduct}
      productToDelete={vm.productToDelete}
      isFormOpen={vm.isFormOpen}
      closeForm={vm.closeForm}
      isDeleteOpen={vm.isDeleteOpen}
      closeDelete={vm.closeDelete}

      onAddProduct={vm.handleAddProduct}
      onEditProduct={vm.handleEditProduct}
      onDeleteClick={vm.handleDeleteClick}
      onSubmitProduct={vm.handleProductSubmit}
      onConfirmDelete={vm.handleDeleteConfirm}
      onFilterChange={vm.handleFilterChange}
      onRefresh={() => vm.loadProducts({ page: vm.pagination?.page ?? 1 })}

      pagination={vm.pagination}
      onPageChange={vm.handlePageChange}
      onLimitChange={vm.handleLimitChange}

      selectedIds={vm.selectedIds}
      toggleSelect={vm.toggleSelect}
      selectAll={vm.selectAll}
      clearSelection={vm.clearSelection}

      rowBusy={vm.rowBusy}

      activeCount={vm.activeCount}
      deletedCount={vm.deletedCount}


      onToggleStatus={vm.toggleProductStatus}

      // bulk
      isBulkDeleteOpen={vm.isBulkDeleteOpen}
      openBulkDelete={vm.openBulkDelete}
      closeBulkDelete={vm.closeBulkDelete}
      confirmBulkDelete={vm.confirmBulkDelete}
      bulkSetStatus={vm.bulkSetStatus}
    />
  );
}

export default Products;
