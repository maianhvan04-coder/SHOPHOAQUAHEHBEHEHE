import { useOutletContext } from "react-router-dom";
import { useAuth } from "~/app/providers/AuthProvides";
import UsersView from "~/features/users/components/UsersView";
import { useUsersPage } from "~/features/users/hooks/useUsersPage";

function Users() {
  const { screens = [] } = useOutletContext() || {};
  const { permissions = [] } = useAuth();
  const vm = useUsersPage();

  return (
    <UsersView
      tab={vm.tab}
      onTabChange={vm.changeTab}
      onRestoreUser={vm.handleRestoreUser}

      screens={screens}
      userPermissions={permissions}
      users={vm.users}
      filteredUsers={vm.filteredUsers}
      filters={vm.filters}
      allRoleCodes={vm.allRoleCodes}
      isLoading={vm.isLoading}

      selectedUser={vm.selectedUser}
      userToDelete={vm.userToDelete}
      isFormOpen={vm.isFormOpen}
      closeForm={vm.closeForm}
      isDeleteOpen={vm.isDeleteOpen}
      closeDelete={vm.closeDelete}

      onAddUser={vm.handleAddUser}
      onEditUser={vm.handleEditUser}
      onDeleteClick={vm.handleDeleteClick}
      onSubmitUser={vm.handleUserSubmit}
      onConfirmDelete={vm.handleDeleteConfirm}
      onFilterChange={vm.handleFilterChange}
      onRefresh={() => vm.loadUsers({ page: vm.pagination?.page ?? 1 })}

      pagination={vm.pagination}
      onPageChange={vm.handlePageChange}
      onLimitChange={vm.handleLimitChange}

      selectedIds={vm.selectedIds}
      toggleSelect={vm.toggleSelect}
      selectAll={vm.selectAll}
      clearSelection={vm.clearSelection}
      toggleUserStatus={vm.toggleUserStatus}
      bulkSetStatus={vm.bulkSetStatus}
      openBulkDelete={vm.openBulkDelete}
      confirmBulkDelete={vm.confirmBulkDelete}
      isBulkDeleteOpen={vm.isBulkDeleteOpen}
      closeBulkDelete={vm.closeBulkDelete}
      rowBusy={vm.rowBusy}

      formatDate={vm.formatDate}
      formatLastActive={vm.formatLastActive}
    />
  );
}

export default Users;
