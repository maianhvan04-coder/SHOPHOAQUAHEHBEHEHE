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
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const { isOpen: isFormOpen, onOpen: openForm, onClose: closeForm } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: openDelete, onClose: closeDelete } = useDisclosure();

  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const userIconBg = useColorModeValue("vrv.100", "vrv.900");

  const [filters, setFilters] = useState({
    search: "",
    role: "",   // role code: ADMIN/MANAGER/...
    status: "", // active/inactive
  });

  const displayMode = useBreakpointValue({ base: "mobile", md: "desktop" });

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async (params = {}) => {
    setIsLoading(true);
    try {
      const { items, pagination } = await userService.getAll(params);
      setUsers(Array.isArray(items) ? items : []);
      setPagination(pagination || null);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error loading users",
        description: error?.message || "Không tải được users",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    openForm();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    openForm();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    openDelete();
  };

const handleUserSubmit = async (form) => {
  try {
    if (selectedUser?._id) {
      await userService.update(selectedUser._id, form);
      toast({ title: "User updated", status: "success", duration: 2500 });
    } else {
      await userService.create(form);
      toast({ title: "User created", status: "success", duration: 2500 });
    }

    await loadUsers();
    closeForm();
  } catch (error) {
    const msg =
      error?.response?.data?.error?.message ||
      error?.message ||
      "Save user failed";

    toast({
      title: "Error saving user",
      description: msg,
      status: "error",
      duration: 3500,
    });
  }
};


  const handleDeleteConfirm = async () => {
    if (!userToDelete?._id) return;
    try {
      await userService.remove(userToDelete._id); // ✅ đúng service bạn đang có

      toast({
        title: "User deleted successfully",
        status: "success",
        duration: 2500,
      });

      await loadUsers();
      closeDelete();
    } catch (error) {
      toast({
        title: "Error deleting user",
        description: error?.message || "Xoá user thất bại",
        status: "error",
        duration: 3000,
      });
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatLastActive = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "N/A";
    }
  };

  const allRoleCodes = useMemo(() => {
    const set = new Set();
    (users || []).forEach((u) => (u.roles || []).forEach((r) => r?.code && set.add(r.code)));
    return Array.from(set).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    const s = (filters.search || "").trim().toLowerCase();

    return (users || []).filter((u) => {
      const name = (u.fullName || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const id = (u._id || "").toLowerCase();

      const roleCodes = (u.roles || []).map((r) => r.code).filter(Boolean);
      const statusText = u.isActive ? "active" : "inactive";

      const matchesSearch =
        !s || name.includes(s) || email.includes(s) || id.includes(s);

      const matchesRole =
        !filters.role || roleCodes.includes(filters.role);

      const matchesStatus =
        !filters.status || statusText === filters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const renderRoleBadges = (u) => {
    const roleCodes = (u.roles || []).map((r) => r.code).filter(Boolean);
    if (!roleCodes.length) return <Text fontSize="sm" color={textColor}>-</Text>;

    return (
      <HStack spacing={2} wrap="wrap">
        {roleCodes.map((code) => (
          <Tag key={code} size="sm" variant="subtle" colorScheme="vrv">
            <TagLabel>{code}</TagLabel>
          </Tag>
        ))}
      </HStack>
    );
  };

  const renderMobileCard = (u) => (
    <Card
      key={u._id}
      bg={bgColor}
      border="1px solid"
      borderColor="#304945"
      mb={4}
      overflow="hidden"
    >
      <Box p={4}>
        <Stack spacing={4}>
          <HStack justify="space-between" align="start">
            <HStack spacing={3}>
              <Box bg={userIconBg} p={2} rounded="lg" color="vrv.500">
                <UserCircleIcon className="h-5 w-5" />
              </Box>
              <Box>
                <Text fontWeight="medium">{u.fullName || "-"}</Text>
                <Text fontSize="sm" color={textColor}>{u.email || "-"}</Text>
              </Box>
            </HStack>

            <Badge
              colorScheme={u.isActive ? "green" : "red"}
              rounded="full"
              px={2}
              py={1}
            >
              {u.isActive ? "Active" : "Inactive"}
            </Badge>
          </HStack>

          <Divider />

          <Box>
            <Text fontSize="sm" color={textColor} mb={2}>Roles</Text>
            {renderRoleBadges(u)}
          </Box>

          <Divider />

          <Stack spacing={2}>
            <HStack fontSize="sm" color={textColor}>
              <CalendarIcon className="h-4 w-4" />
              <Text>Created {formatDate(u.createdAt)}</Text>
            </HStack>
            <HStack fontSize="sm" color={textColor}>
              <ClockIcon className="h-4 w-4" />
              <Text>Updated {formatLastActive(u.updatedAt)}</Text>
            </HStack>
          </Stack>

          <Divider />

          <HStack justify="flex-end" spacing={2}>
            <IconButton
              icon={<PencilSquareIcon className="h-4 w-4" />}
              variant="ghost"
              colorScheme="vrv"
              size="sm"
              onClick={() => handleEditUser(u)}
              aria-label="Edit user"
            />
            <IconButton
              icon={<TrashIcon className="h-4 w-4" />}
              variant="ghost"
              colorScheme="red"
              size="sm"
              onClick={() => handleDeleteClick(u)}
              aria-label="Delete user"
            />
          </HStack>
        </Stack>
      </Box>
    </Card>
  );

  return (
    <Box p={8}>
      <Card variant="outline" bg={bgColor} border="1px solid" borderColor="#304945" overflow="hidden">
        <Box px={6} py={4}>
          <PageHeader
            title="Users"
            description="Manage system users and their roles"
            buttonLabel="Add User"
            buttonIcon={PlusIcon}
            onButtonClick={handleAddUser}
          />

          <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6}>
            <Tooltip label="Search by name, email, or ID" hasArrow>
              <InputGroup maxW={{ base: "full", md: "320px" }}>
                <InputLeftElement pointerEvents="none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </InputLeftElement>
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </InputGroup>
            </Tooltip>

            <Select
              placeholder="All Roles"
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              maxW={{ base: "full", md: "220px" }}
            >
              {allRoleCodes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>

            <Select
              placeholder="All Statuses"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              maxW={{ base: "full", md: "220px" }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>

            <Button variant="outline" onClick={() => loadUsers()} isLoading={isLoading}>
              Refresh
            </Button>
          </Stack>

          <Text color={textColor} fontSize="sm" mb={4}>
            Showing {filteredUsers.length} of {users.length} users
          </Text>
        </Box>

        <Box>
          {displayMode === "desktop" ? (
            <Box overflowX="auto">
              <Table>
                <Thead bg={headerBg}>
                  <Tr>
                    <Th borderColor={borderColor}>User ID</Th>
                    <Th borderColor={borderColor}>User Info</Th>
                    <Th borderColor={borderColor}>Roles</Th>
                    <Th borderColor={borderColor}>Status</Th>
                    <Th borderColor={borderColor}>Activity</Th>
                    <Th borderColor={borderColor}>Actions</Th>
                  </Tr>
                </Thead>

                <Tbody>
                  {isLoading ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={8} borderColor={borderColor}>
                        <Spinner size="sm" mr={2} />
                        <Text display="inline-block">Loading...</Text>
                      </Td>
                    </Tr>
                  ) : filteredUsers.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={8} borderColor={borderColor}>
                        No users found matching the filters
                      </Td>
                    </Tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <Tr key={u._id}>
                        <Td borderColor={borderColor}>
                          <Text fontFamily="mono" fontSize="sm" color={textColor}>
                            {u._id}
                          </Text>
                        </Td>

                        <Td borderColor={borderColor}>
                          <HStack spacing={3}>
                            <Box bg={userIconBg} p={2} rounded="lg" color="vrv.500">
                              <UserCircleIcon className="h-5 w-5" />
                            </Box>
                            <Box>
                              <Text fontWeight="medium">{u.fullName || "-"}</Text>
                              <Text fontSize="sm" color={textColor}>
                                {u.email || "-"}
                              </Text>
                            </Box>
                          </HStack>
                        </Td>

                        <Td borderColor={borderColor}>
                          {renderRoleBadges(u)}
                        </Td>

                        <Td borderColor={borderColor}>
                          <Badge
                            colorScheme={u.isActive ? "green" : "red"}
                            rounded="full"
                            px={2}
                            py={1}
                          >
                            {u.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </Td>

                        <Td borderColor={borderColor}>
                          <VStack align="start" spacing={1}>
                            <HStack fontSize="sm" color={textColor}>
                              <CalendarIcon className="h-4 w-4" />
                              <Text>Created {formatDate(u.createdAt)}</Text>
                            </HStack>
                            <HStack fontSize="sm" color={textColor}>
                              <ClockIcon className="h-4 w-4" />
                              <Text>Updated {formatLastActive(u.updatedAt)}</Text>
                            </HStack>
                          </VStack>
                        </Td>

                        <Td borderColor={borderColor}>
                          <HStack spacing={2}>
                            <Tooltip label="Edit user details" hasArrow>
                              <IconButton
                                icon={<PencilSquareIcon className="h-4 w-4" />}
                                variant="ghost"
                                colorScheme="vrv"
                                size="sm"
                                onClick={() => handleEditUser(u)}
                                aria-label="Edit user"
                              />
                            </Tooltip>

                            <Tooltip label="Delete user" hasArrow>
                              <IconButton
                                icon={<TrashIcon className="h-4 w-4" />}
                                variant="ghost"
                                colorScheme="red"
                                size="sm"
                                onClick={() => handleDeleteClick(u)}
                                aria-label="Delete user"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Box px={4} py={2}>
              {isLoading ? (
                <Flex justify="center" align="center" py={8}>
                  <Spinner size="sm" mr={2} />
                  <Text>Loading...</Text>
                </Flex>
              ) : filteredUsers.length === 0 ? (
                <Text textAlign="center" py={8} color={textColor}>
                  No users found matching the filters
                </Text>
              ) : (
                filteredUsers.map(renderMobileCard)
              )}
            </Box>
          )}
        </Box>
      </Card>

      {/* FORM MODAL (giữ lại, nhưng bạn cần implement create/update) */}
      <Modal isOpen={isFormOpen} onClose={closeForm} title={selectedUser ? "Edit User" : "Add New User"}>
        <UserForm user={selectedUser} onSubmit={handleUserSubmit} onCancel={closeForm} />
      </Modal>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={closeDelete} title="Delete User">
        <Box>
          <Text mb={4}>
            Are you sure you want to delete <b>{userToDelete?.fullName || "-"}</b>? This action cannot be undone.
          </Text>
          <HStack spacing={3} justify="flex-end">
            <Button variant="outline" onClick={closeDelete}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
}

export default Users;
