import UsersView from "~/features/users/components/UsersView";
import { useUsersPage } from "~/features/users/hooks/useUsersPage";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "~/app/providers/AuthProvides";

function Users() {
  const { screens = [], groups = [] } = useOutletContext() || {};
  const { permissions = [] } = useAuth(); 

  const vm = useUsersPage();

  

  return (
    <UsersView
      screens={screens}
      groups={groups}
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
      onRefresh={() => vm.loadUsers()}
      formatDate={vm.formatDate}
      formatLastActive={vm.formatLastActive}
    />
  );
}

export default Users;
