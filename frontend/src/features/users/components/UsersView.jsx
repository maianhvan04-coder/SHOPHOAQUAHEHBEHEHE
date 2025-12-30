/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import { useMemo } from "react";

import { canAccessAction } from "~/shared/utils/ability";

import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Tooltip,
  Tag,
  Avatar,
  VStack,
  useBreakpointValue,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import Modal from "~/components/common/Modal";
import UserForm from "~/features/users/page/UserForm";
import PageHeader from "~/components/layout/admin/PageHeader";

function UsersView({
  users,
  filteredUsers,
   screens = [],
  userPermissions = [],
  filters,
  allRoleCodes,
  isLoading,
  selectedUser,
  userToDelete,
  isFormOpen,
  closeForm,
  isDeleteOpen,
  closeDelete,
  onAddUser,
  onEditUser,
  onDeleteClick,
  onSubmitUser,
  onConfirmDelete,
  onFilterChange,
  onRefresh,
  formatDate,
  formatLastActive,
}) {
  // Color Palette tinh tế hơn
  const bgColor = useColorModeValue("white", "gray.800");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50/50", "gray.700/50");
  const cardShadow = useColorModeValue("sm", "dark-lg");

  const displayMode = useBreakpointValue({ base: "mobile", md: "desktop" });


  // screen

  const userScreen = useMemo(() => {
  return (screens || []).find((s) => s.key === "user") || null;
}, [screens]);




const canCreate = canAccessAction(userPermissions, userScreen, "create");
const canUpdate = canAccessAction(userPermissions, userScreen, "update");
const canDelete = canAccessAction(userPermissions, userScreen, "delete");
console.log("userScreen", userScreen);
console.log("perms", userPermissions);
console.log("can", { canCreate, canUpdate, canDelete });


  const renderRoleBadges = (u) => {
    const roleCodes = (u.roles || []).map((r) => r.code).filter(Boolean);
    if (!roleCodes.length) return <Text fontSize="xs" color="gray.400">No roles</Text>;

    return (
      <HStack spacing={1} flexWrap="wrap">
        {roleCodes.map((code) => (
          <Tag key={code} size="sm" variant="subtle" colorScheme="blue" borderRadius="full">
            <Text fontSize="11px" fontWeight="bold">{code.toUpperCase()}</Text>
          </Tag>
        ))}
      </HStack>
    );
  };

  const renderMobileCard = (u) => (
    <Card
      key={u._id}
      bg={bgColor}
      boxShadow={cardShadow}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      mb={4}
      p={4}
    >
      <VStack align="stretch" spacing={3}>
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Avatar size="sm" name={u.fullName} src={u.avatar} />
            <Box>
              <Text fontWeight="bold" fontSize="sm">{u.fullName || "Unknown"}</Text>
              <Text fontSize="xs" color={secondaryTextColor}>{u.email}</Text>
            </Box>
          </HStack>
          <Badge 
            variant="subtle" 
            colorScheme={u.isActive ? "green" : "red"} 
            borderRadius="full" 
            px={2}
          >
            {u.isActive ? "Active" : "Inactive"}
          </Badge>
        </Flex>
        
        <HStack wrap="wrap">{renderRoleBadges(u)}</HStack>

        <Divider borderColor={borderColor} />

        <Flex justify="space-between" align="center">
          <Text fontSize="xs" color={secondaryTextColor}>
            Joined {formatDate(u.createdAt)}
          </Text>
          <HStack spacing={1}>
  {canUpdate && (
    <IconButton
      size="sm"
      variant="ghost"
      icon={<PencilSquareIcon className="h-4 w-4" />}
      onClick={() => onEditUser(u)}
      aria-label="Edit"
    />
  )}

  {canDelete && (
    <IconButton
      size="sm"
      variant="ghost"
      colorScheme="red"
      icon={<TrashIcon className="h-4 w-4" />}
      onClick={() => onDeleteClick(u)}
      aria-label="Delete"
    />
  )}
</HStack>

        </Flex>
      </VStack>
    </Card>
  );

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
      {/* Header tinh giản */}
      <Box mb={8}>
        <PageHeader
  title="User Management"
  description="Create, edit and manage permissions for all system users."
  buttonLabel={canCreate ? "New User" : undefined}
  buttonIcon={canCreate ? PlusIcon : undefined}
  onButtonClick={canCreate ? onAddUser : undefined}
/>

      </Box>

      <Card borderRadius="2xl" boxShadow={cardShadow} border="1px solid" borderColor={borderColor} overflow="hidden">
        {/* Toolbar */}
        <Box p={5} borderBottom="1px solid" borderColor={borderColor}>
          <Stack direction={{ base: "column", lg: "row" }} justify="space-between" spacing={4}>
            <HStack spacing={3} flex={1}>
              <InputGroup size="sm" maxW="300px">
                <InputLeftElement>
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </InputLeftElement>
                <Input
                  placeholder="Search name, email..."
                  borderRadius="full"
                  bg={useColorModeValue("gray.50", "gray.900")}
                  border="none"
                  value={filters.search}
                  onChange={(e) => onFilterChange("search", e.target.value)}
                  _focus={{ bg: useColorModeValue("white", "gray.800"), ring: 2, ringColor: "blue.500" }}
                />
              </InputGroup>

              <Select
                size="sm"
                borderRadius="full"
                maxW="150px"
                value={filters.role}
                onChange={(e) => onFilterChange("role", e.target.value)}
              >
                <option value="">All Roles</option>
                {allRoleCodes.map(code => <option key={code} value={code}>{code}</option>)}
              </Select>

              <Select
                size="sm"
                borderRadius="full"
                maxW="150px"
                value={filters.status}
                onChange={(e) => onFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </HStack>

            <HStack spacing={2}>
              <IconButton
                size="sm"
                variant="outline"
                icon={<ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
                onClick={onRefresh}
                borderRadius="full"
                aria-label="Refresh"
              />
              <Text fontSize="xs" fontWeight="medium" color={secondaryTextColor} whiteSpace="nowrap">
                {filteredUsers.length} Users Found
              </Text>
            </HStack>
          </Stack>
        </Box>

        {/* Content Area */}
        <Box>
          {displayMode === "desktop" ? (
            <Table variant="simple" size="sm">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th py={4} color="gray.500" fontWeight="bold">User</Th>
                  <Th py={4} color="gray.500" fontWeight="bold">Role Membership</Th>
                  <Th py={4} color="gray.500" fontWeight="bold">Account Status</Th>
                  <Th py={4} color="gray.500" fontWeight="bold">Last Activity</Th>
                  <Th py={4} textAlign="right" color="gray.500" fontWeight="bold">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  <Tr><Td colSpan={5} py={20} textAlign="center"><Spinner thickness="2px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="md" /></Td></Tr>
                ) : filteredUsers.length === 0 ? (
                  <Tr><Td colSpan={5} py={20} textAlign="center" color="gray.400">No results found.</Td></Tr>
                ) : (
                  filteredUsers.map((u) => (
                    <Tr key={u._id} _hover={{ bg: tableHeaderBg }} transition="0.2s">
                      <Td py={4}>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={u.fullName} src={u.avatar} borderRadius="lg" />
                          <Box>
                            <Text fontWeight="bold" fontSize="sm">{u.fullName}</Text>
                            <Text fontSize="xs" color={secondaryTextColor}>{u.email}</Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td py={4}>{renderRoleBadges(u)}</Td>
                      <Td py={4}>
                        <Badge 
                           size="sm"
                           px={3}
                           borderRadius="full" 
                           variant="subtle" 
                           colorScheme={u.isActive ? "green" : "red"}
                        >
                          {u.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </Td>
                      <Td py={4}>
                        <VStack align="start" spacing={0}>
                          <HStack fontSize="xs" color={secondaryTextColor}>
                            <Icon as={CalendarIcon} boxSize={3} />
                            <Text>{formatDate(u.createdAt)}</Text>
                          </HStack>
                        </VStack>
                      </Td>
                      <Td py={4} textAlign="right">
  <HStack justify="flex-end" spacing={1}>
    {canUpdate && (
      <IconButton
        size="sm"
        variant="ghost"
        borderRadius="lg"
        icon={<PencilSquareIcon className="h-4 w-4" />}
        onClick={() => onEditUser(u)}
        aria-label="Edit"
      />
    )}

    {canDelete && (
      <IconButton
        size="sm"
        variant="ghost"
        colorScheme="red"
        borderRadius="lg"
        icon={<TrashIcon className="h-4 w-4" />}
        onClick={() => onDeleteClick(u)}
        aria-label="Delete"
      />
    )}
  </HStack>
</Td>

                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          ) : (
            <Box p={4}>{filteredUsers.map(renderMobileCard)}</Box>
          )}
        </Box>
      </Card>

      {/* Modals giữ nguyên logic nhưng có thể tinh chỉnh nút */}
      <Modal isOpen={isFormOpen} onClose={closeForm} title={selectedUser ? "Update Profile" : "Create Account"}>
        <UserForm user={selectedUser} onSubmit={onSubmitUser} onCancel={closeForm} />
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={closeDelete} title="Delete Confirmation">
        <Box p={1}>
          <Text mb={6} color={secondaryTextColor}>
            Are you sure you want to delete <Text as="span" fontWeight="bold" color="gray.700">{userToDelete?.fullName}</Text>? 
            This user will lose all access immediately.
          </Text>
          <HStack spacing={3} justify="flex-end">
            <Button variant="ghost" onClick={closeDelete}>Cancel</Button>
            <Button colorScheme="red" borderRadius="xl" onClick={onConfirmDelete}>Confirm Delete</Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
}
// ... PropTypes giữ nguyên

UsersView.propTypes = {
  users: PropTypes.array.isRequired,
  filteredUsers: PropTypes.array.isRequired,
  filters: PropTypes.object.isRequired,
  allRoleCodes: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,

  selectedUser: PropTypes.object,
  userToDelete: PropTypes.object,

  isFormOpen: PropTypes.bool.isRequired,
  closeForm: PropTypes.func.isRequired,
  isDeleteOpen: PropTypes.bool.isRequired,
  closeDelete: PropTypes.func.isRequired,

  onAddUser: PropTypes.func.isRequired,
  onEditUser: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onSubmitUser: PropTypes.func.isRequired,
  onConfirmDelete: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
screens: PropTypes.array,
userPermissions: PropTypes.array,

  formatDate: PropTypes.func.isRequired,
  formatLastActive: PropTypes.func.isRequired,
};

export default UsersView;
