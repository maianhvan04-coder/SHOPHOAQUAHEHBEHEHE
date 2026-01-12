import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Stack,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

import PageHeader from "../../components/layout//admin/PageHeader";
import RolePermissionsModal from "~/features/rbac/components/RolePermissionsModal";
import RolesTable from "~/features/rbac/components/RolesTable";
import { useRolesAdmin } from "~/features/rbac/hooks/useRolesAdmin";

import Modal from "~/components/common/Modal";
import RoleForm from "~/components/roles/RoleForm";

function Roles() {
  const toast = useToast();
  const bgBody = useColorModeValue("gray.50", "gray.900");
  const subText = useColorModeValue("gray.500", "gray.400");

  const permsDisc = useDisclosure();
  const formDisc = useDisclosure();
  const deleteDisc = useDisclosure();

  const vm = useRolesAdmin(toast);

  const handleAddRole = () => {
    vm.setSelectedRole(null);
    formDisc.onOpen();
  };

  const handleEditRole = (role) => {
    vm.setSelectedRole(role);
    formDisc.onOpen();
  };

  const handleDeleteRole = (role) => {
    vm.setSelectedRole(role);
    deleteDisc.onOpen();
  };

  const handleConfirmDelete = async () => {
    const ok = await vm.deleteRole(vm.selectedRole);
    if (ok) deleteDisc.onClose();
  };

  const handleOpenPermissions = async (role) => {
    const ok = await vm.openPermissions(role);
    if (ok) permsDisc.onOpen();
  };

  const handleSavePermissions = async (selectedKeys) => {
    const ok = await vm.savePermissions(selectedKeys);
    if (ok) permsDisc.onClose();
  };

  return (
    <Box bg={bgBody} minH="100vh" p={{ base: 4, md: 8 }}>
      <Container maxW="8xl" p={0}>
        <Stack spacing={6}>
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <Box>
              <Text
                fontSize="2xl"
                fontWeight="800"
                bgGradient="linear(to-r, blue.400, purple.500)"
                bgClip="text"
              >
                Role Management
              </Text>
              <Text color={subText} fontSize="sm" mt={1}>
                Define roles, assign permissions, and control access levels.
              </Text>
            </Box>

            <PageHeader
              buttonLabel="Add Role"
              buttonIcon={FaPlus}
              onButtonClick={handleAddRole}
            />
          </Flex>

          <RolesTable
            roles={vm.filteredRoles}
            rolePermMap={vm.rolePermMap}
            loading={vm.loading}
            loadingPerms={vm.loadingPerms}
            selectedRoleCode={vm.selectedRole?.code}
            filters={vm.filters}
            onChangeFilters={vm.setFilters}
            onAddRole={handleAddRole}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
            onToggleStatus={vm.toggleRoleStatus}
            onOpenPermissions={handleOpenPermissions}
            getRoleColorScheme={vm.getRoleColorScheme}
          />
        </Stack>
      </Container>

      {/* Permissions Modal (Chakra Modal component riêng của bạn) */}
      <RolePermissionsModal
        isOpen={permsDisc.isOpen}
        onClose={permsDisc.onClose}
        role={vm.selectedRole}
        allPermissions={vm.permissions}
        initialPermissions={vm.rolePermissionKeys} // ✅ ĐÚNG FORMAT
        onSave={handleSavePermissions}
        saving={vm.saving}
      />

      {/* Add/Edit Role Modal (Modal custom) */}
      <Modal
        isOpen={formDisc.isOpen}
        onClose={formDisc.onClose}
        title={vm.selectedRole ? "Edit Role" : "Add New Role"}
      >
        <RoleForm
          role={vm.selectedRole}
          onSubmit={async (roleData) => {
            const ok = await vm.saveRole(roleData);
            if (ok) formDisc.onClose();
          }}
          onCancel={formDisc.onClose}
        />
      </Modal>

      {/* Delete Confirm Modal (Modal custom) */}
      <Modal
        isOpen={deleteDisc.isOpen}
        onClose={deleteDisc.onClose}
        title="Delete Role"
      >
        <Box>
          <Text mb={4}>
            Bạn chắc chắn muốn xóa role <b>{vm.selectedRole?.code}</b> không?
          </Text>

          <HStack justify="flex-end" spacing={3}>
            <Button variant="outline" onClick={deleteDisc.onClose}>
              Hủy
            </Button>
            <Button
              colorScheme="red"
              onClick={handleConfirmDelete}
              isLoading={vm.saving}
              isDisabled={!vm.selectedRole}
            >
              Xóa
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
}

export default Roles;
