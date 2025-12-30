/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Badge,
  HStack,
  VStack,
  useDisclosure,
  Flex,
  Text,
  Card,
  useToast,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Select,
  Divider,
  useBreakpointValue,
  Spinner,
  Tooltip,
  Tag,
  TagLabel,
} from "@chakra-ui/react";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { userService } from "~/features/users/userService";
import Modal from "~/components/common/Modal";
import UserForm from "~/components/users/UserForm";
import { format, formatDistanceToNow } from "date-fns";
import PageHeader from "~/components/layout/PageHeader";

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
