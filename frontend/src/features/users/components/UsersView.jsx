/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import { useMemo } from "react";
import Pagination from "~/components/common/Pagination";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
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
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

import { canAccessAction } from "~/shared/utils/ability";
import Modal from "~/components/common/Modal";
import UserForm from "~/features/users/page/UserForm";
import PageHeader from "~/components/layout/admin/PageHeader";
import UsersTabs from "~/features/users/components/UsersTabs";

function computePermission({ screens, userPermissions, resourceKey, actionKey }) {
  const screen = (screens || []).find((s) => s?.key === resourceKey) || null;
  if (!screen) return false;
  return canAccessAction(userPermissions, screen, actionKey);
}

function UsersView({
  tab = "active",
  onTabChange,
  onRestoreUser,

  users = [],
  filteredUsers = [],
  pagination = null,
  filters,
  allRoleCodes = [],
  isLoading = false,

  screens = [],
  userPermissions = [],

  selectedIds = [],
  toggleSelect,
  selectAll,
  clearSelection,
  toggleUserStatus,
  bulkSetStatus,
  openBulkDelete,
  confirmBulkDelete,
  isBulkDeleteOpen,
  closeBulkDelete,
  rowBusy = {},

  onPageChange,
  onLimitChange,

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
}) {
  const isDeletedTab = tab === "deleted";

  // ✅ ALL theme tokens at top-level (no hooks inside JSX)
  const pageBg = useColorModeValue("#F6F8F8", "#0B1211");
  const cardBg = useColorModeValue("white", "rgba(17, 24, 39, 0.75)");
  const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const softText = useColorModeValue("gray.600", "gray.300");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  const headerBg = useColorModeValue(
    "rgba(255,255,255,0.78)",
    "rgba(17, 24, 39, 0.60)"
  );
  const tableHeadBg = useColorModeValue("blackAlpha.50", "whiteAlpha.100");
  const rowHoverBg = useColorModeValue("blackAlpha.50", "whiteAlpha.50");

  const shadow = useColorModeValue(
    "0 12px 30px rgba(15, 23, 42, 0.10)",
    "0 16px 40px rgba(0,0,0,0.35)"
  );

  const glowGradient = useColorModeValue(
    "radial-gradient(900px 420px at 18% 6%, rgba(48, 73, 69, 0.12), transparent 60%), radial-gradient(800px 380px at 92% 0%, rgba(64, 93, 88, 0.10), transparent 55%)",
    "radial-gradient(900px 420px at 18% 6%, rgba(48, 73, 69, 0.22), transparent 60%), radial-gradient(800px 380px at 92% 0%, rgba(64, 93, 88, 0.18), transparent 55%)"
  );

  const controlBg = useColorModeValue("white", "whiteAlpha.100");
  const ghostHoverBg = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const dangerNameColor = useColorModeValue("gray.700", "gray.100");

  const displayMode = useBreakpointValue({ base: "mobile", md: "desktop" });

  // permissions
  const canCreate = computePermission({
    screens,
    userPermissions,
    resourceKey: "user",
    actionKey: "create",
  });
  const canUpdate = computePermission({
    screens,
    userPermissions,
    resourceKey: "user",
    actionKey: "update",
  });
  const canDelete = computePermission({
    screens,
    userPermissions,
    resourceKey: "user",
    actionKey: "delete",
  });
  const canRestore = computePermission({
    screens,
    userPermissions,
    resourceKey: "user",
    actionKey: "restore",
  });

  const canChangeStatus = computePermission({
    screens,
    userPermissions,
    resourceKey: "user",
    actionKey: "changeStatus",
  });
  const canBulkStatus = computePermission({
    screens,
    userPermissions,
    resourceKey: "user",
    actionKey: "bulkStatus",
  });
  const canBulkDelete = computePermission({
    screens,
    userPermissions,
    resourceKey: "user",
    actionKey: "bulkDelete",
  });

  const idsOnPage = useMemo(
    () => (filteredUsers || []).map((u) => u?._id).filter(Boolean),
    [filteredUsers]
  );
  const allChecked =
    idsOnPage.length > 0 && idsOnPage.every((id) => selectedIds.includes(id));
  const someChecked =
    idsOnPage.some((id) => selectedIds.includes(id)) && !allChecked;

  const renderRoleBadges = (u) => {
    const roleCodes = (u.roles || []).map((r) => r.code).filter(Boolean);
    if (!roleCodes.length) return <Text fontSize="xs" color={mutedText}>No roles</Text>;

    return (
      <HStack spacing={1} flexWrap="wrap">
        {roleCodes.map((code) => (
          <Tag
            key={code}
            size="sm"
            borderRadius="full"
            variant="subtle"
            colorScheme="teal"
            px={2.5}
            py={1}
          >
            <Text fontSize="11px" fontWeight="bold" letterSpacing="0.02em">
              {code.toUpperCase()}
            </Text>
          </Tag>
        ))}
      </HStack>
    );
  };

  const StatusBadge = ({ u }) => {
    const disabled = isDeletedTab || !canChangeStatus || !!rowBusy?.[u._id];
    const label = isDeletedTab
      ? "User đã bị xoá (soft-delete)"
      : !canChangeStatus
      ? "Bạn không có quyền đổi status"
      : "Click để đổi trạng thái";

    return (
      <Tooltip label={label} hasArrow>
        <Box display="inline-block">
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            variant="subtle"
            colorScheme={u.isActive ? "green" : "red"}
            cursor={disabled ? "not-allowed" : "pointer"}
            opacity={disabled ? 0.6 : 1}
            transition="all .15s ease"
            _hover={!disabled ? { transform: "translateY(-1px)" } : undefined}
            onClick={() => {
              if (disabled) return;
              toggleUserStatus?.(u);
            }}
          >
            {rowBusy?.[u._id] ? "Updating..." : u.isActive ? "Active" : "Inactive"}
          </Badge>
        </Box>
      </Tooltip>
    );
  };
  StatusBadge.propTypes = { u: PropTypes.object.isRequired };

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const total = pagination?.total ?? filteredUsers.length ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <Box minH="100vh" bg={pageBg} position="relative">
      {/* subtle brand glow */}
      <Box pointerEvents="none" position="absolute" inset={0} bgGradient={glowGradient} />

      <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto" position="relative">
        {/* Header card */}
        <Card
          bg={headerBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="2xl"
          boxShadow={shadow}
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 5 }}
          mb={6}
          backdropFilter="blur(10px)"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            gap={4}
            align={{ md: "center" }}
          >
            <Box flex="1">
              <PageHeader
                title="User Management"
                description={isDeletedTab ? "Restore soft-deleted users." : "Create, edit and manage users."}
                buttonLabel={!isDeletedTab && canCreate ? "New User" : undefined}
                buttonIcon={!isDeletedTab && canCreate ? PlusIcon : undefined}
                onButtonClick={!isDeletedTab && canCreate ? onAddUser : undefined}
              />

              <Box mt={3}>
                <UsersTabs tab={tab} onChangeTab={onTabChange} />
              </Box>
            </Box>

            <HStack justify={{ base: "flex-start", md: "flex-end" }} w={{ base: "full", md: "auto" }}>
              <Button
                size="sm"
                variant="outline"
                borderRadius="full"
                leftIcon={<ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
                onClick={onRefresh}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>
        </Card>

        {/* Bulk Bar */}
        {!isDeletedTab && selectedIds.length > 0 && (canBulkStatus || canBulkDelete) && (
          <Card
            mb={4}
            p={3}
            borderRadius="2xl"
            border="1px solid"
            borderColor={cardBorder}
            bg={cardBg}
            boxShadow={shadow}
          >
            <Flex
              gap={3}
              align={{ base: "stretch", md: "center" }}
              justify="space-between"
              direction={{ base: "column", md: "row" }}
            >
              <HStack spacing={3}>
                <Badge borderRadius="full" px={3} py={1} bg="#304945" color="white">
                  Selected {selectedIds.length}
                </Badge>
                <Text fontSize="sm" color={softText}>
                  users selected
                </Text>
              </HStack>

              <HStack spacing={2} flexWrap="wrap" justify={{ base: "flex-start", md: "flex-end" }}>
                <Button size="sm" variant="ghost" onClick={clearSelection} borderRadius="full">
                  Clear
                </Button>

                {canBulkStatus && (
                  <>
                    <Button size="sm" borderRadius="full" onClick={() => bulkSetStatus?.(true)}>
                      Set Active
                    </Button>
                    <Button size="sm" borderRadius="full" onClick={() => bulkSetStatus?.(false)}>
                      Set Inactive
                    </Button>
                  </>
                )}

                {canBulkDelete && (
                  <Button size="sm" colorScheme="red" onClick={openBulkDelete} borderRadius="full">
                    Delete selected
                  </Button>
                )}
              </HStack>
            </Flex>
          </Card>
        )}

        {/* Table card */}
        <Card
          borderRadius="2xl"
          boxShadow={shadow}
          border="1px solid"
          borderColor={cardBorder}
          overflow="hidden"
          bg={cardBg}
          backdropFilter="blur(10px)"
        >
          {/* Toolbar */}
          <Box p={5} borderBottom="1px solid" borderColor={cardBorder}>
            <Stack direction={{ base: "column", lg: "row" }} justify="space-between" spacing={4}>
              <HStack spacing={3} flex={1} flexWrap="wrap">
                <InputGroup size="sm" maxW="360px">
                  <InputLeftElement>
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search name, email..."
                    borderRadius="full"
                    bg={controlBg}
                    border="1px solid"
                    borderColor={cardBorder}
                    value={filters?.search ?? ""}
                    onChange={(e) => onFilterChange?.("search", e.target.value)}
                    _focus={{
                      boxShadow: "0 0 0 3px rgba(48, 73, 69, 0.18)",
                      borderColor: "rgba(48, 73, 69, 0.45)",
                    }}
                  />
                </InputGroup>

                <Select
                  size="sm"
                  borderRadius="full"
                  maxW="200px"
                  bg={controlBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  value={filters?.role ?? ""}
                  onChange={(e) => onFilterChange?.("role", e.target.value)}
                >
                  <option value="">All Roles</option>
                  {allRoleCodes.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </Select>

                <Select
                  size="sm"
                  borderRadius="full"
                  maxW="200px"
                  bg={controlBg}
                  border="1px solid"
                  borderColor={cardBorder}
                  value={filters?.status ?? ""}
                  onChange={(e) => onFilterChange?.("status", e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </HStack>

              <HStack spacing={2} justify={{ base: "flex-start", lg: "flex-end" }}>
                <Badge borderRadius="full" px={3} py={1} variant="subtle" colorScheme="gray">
                  {filteredUsers.length} found
                </Badge>
              </HStack>
            </Stack>
          </Box>

          {/* Content */}
          <Box>
            {displayMode === "desktop" ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg={tableHeadBg}>
                    <Tr>
                      <Th w="42px" py={4}>
                        <Checkbox
                          isChecked={allChecked}
                          isIndeterminate={someChecked}
                          onChange={() => selectAll?.(idsOnPage)}
                        />
                      </Th>
                      <Th py={4} color={mutedText} fontWeight="bold" letterSpacing="0.06em">
                        USER
                      </Th>
                      <Th py={4} color={mutedText} fontWeight="bold" letterSpacing="0.06em">
                        ROLES
                      </Th>
                      <Th py={4} color={mutedText} fontWeight="bold" letterSpacing="0.06em">
                        STATUS
                      </Th>
                      <Th py={4} color={mutedText} fontWeight="bold" letterSpacing="0.06em">
                        CREATED
                      </Th>
                      <Th py={4} textAlign="right" color={mutedText} fontWeight="bold" letterSpacing="0.06em">
                        ACTIONS
                      </Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <Tr key={i}>
                          <Td>
                            <SkeletonCircle size="4" />
                          </Td>
                          <Td py={5}>
                            <HStack spacing={3}>
                              <SkeletonCircle size="8" />
                              <Box w="260px">
                                <Skeleton height="14px" mb="8px" />
                                <Skeleton height="10px" />
                              </Box>
                            </HStack>
                          </Td>
                          <Td py={5}>
                            <SkeletonText noOfLines={2} spacing="2" />
                          </Td>
                          <Td py={5}>
                            <Skeleton height="18px" w="90px" borderRadius="full" />
                          </Td>
                          <Td py={5}>
                            <Skeleton height="12px" w="120px" />
                          </Td>
                          <Td py={5} textAlign="right">
                            <HStack justify="flex-end">
                              <Skeleton height="28px" w="28px" borderRadius="lg" />
                              <Skeleton height="28px" w="28px" borderRadius="lg" />
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <Tr>
                        <Td colSpan={6} py={16} textAlign="center" color={mutedText}>
                          No results found.
                        </Td>
                      </Tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <Tr key={u._id} _hover={{ bg: rowHoverBg }} transition="background 0.15s ease">
                          <Td>
                            <Checkbox
                              isChecked={selectedIds.includes(u._id)}
                              onChange={() => toggleSelect?.(u._id)}
                            />
                          </Td>

                          <Td py={4}>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={u.fullName} src={u.avatar} borderRadius="xl" />
                              <Box minW={0}>
                                <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                                  {u.fullName || "Unknown"}
                                </Text>
                                <Text fontSize="xs" color={softText} noOfLines={1}>
                                  {u.email || "-"}
                                </Text>
                              </Box>
                            </HStack>
                          </Td>

                          <Td py={4}>{renderRoleBadges(u)}</Td>

                          <Td py={4}>
                            <StatusBadge u={u} />
                          </Td>

                          <Td py={4}>
                            <HStack fontSize="xs" color={softText}>
                              <Icon as={CalendarIcon} boxSize={3} />
                              <Text>{formatDate?.(u.createdAt)}</Text>
                            </HStack>
                          </Td>

                          <Td py={4} textAlign="right">
                            <HStack justify="flex-end" spacing={1}>
                              {!isDeletedTab ? (
                                <>
                                  {canUpdate && (
                                    <IconButton
                                      size="sm"
                                      variant="ghost"
                                      borderRadius="lg"
                                      aria-label="Edit"
                                      icon={<PencilSquareIcon className="h-4 w-4" />}
                                      onClick={() => onEditUser?.(u)}
                                      transition="all .15s ease"
                                      _hover={{ transform: "translateY(-1px)", bg: ghostHoverBg }}
                                    />
                                  )}
                                  {canDelete && (
                                    <IconButton
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      borderRadius="lg"
                                      aria-label="Delete"
                                      icon={<TrashIcon className="h-4 w-4" />}
                                      onClick={() => onDeleteClick?.(u)}
                                      transition="all .15s ease"
                                      _hover={{ transform: "translateY(-1px)" }}
                                    />
                                  )}
                                </>
                              ) : (
                                canRestore && (
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="green"
                                    borderRadius="lg"
                                    aria-label="Restore"
                                    isLoading={!!rowBusy?.[u._id]}
                                    icon={<ArrowUturnLeftIcon className="h-4 w-4" />}
                                    onClick={() => onRestoreUser?.(u)}
                                    transition="all .15s ease"
                                    _hover={{ transform: "translateY(-1px)", bg: ghostHoverBg }}
                                  />
                                )
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box p={4}>
                <Text color={softText}>Mobile view giữ nguyên, chỉ đổi action theo tab.</Text>
              </Box>
            )}
          </Box>

          {!!pagination && (
            <Box p={4} borderTop="1px solid" borderColor={cardBorder}>
              <Pagination
                page={page}
                limit={limit}
                total={total}
                totalPages={totalPages}
                onPageChange={onPageChange}
                onLimitChange={onLimitChange}
                isDisabled={isLoading}
              />
            </Box>
          )}
        </Card>

        {/* Create / Update modal */}
        <Modal
          isOpen={isFormOpen}
          onClose={closeForm}
          title={selectedUser ? "Update Profile" : "Create Account"}
        >
          <UserForm user={selectedUser} onSubmit={onSubmitUser} onCancel={closeForm} />
        </Modal>

        {/* Delete single modal */}
        <Modal isOpen={isDeleteOpen} onClose={closeDelete} title="Delete Confirmation">
          <Box p={1}>
            <Text mb={6} color={softText}>
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="bold" color={dangerNameColor}>
                {userToDelete?.fullName || userToDelete?.email || "this user"}
              </Text>
              ? This user will lose all access immediately.
            </Text>
            <HStack spacing={3} justify="flex-end">
              <Button variant="ghost" onClick={closeDelete} borderRadius="xl">
                Cancel
              </Button>
              <Button colorScheme="red" borderRadius="xl" onClick={onConfirmDelete}>
                Confirm Delete
              </Button>
            </HStack>
          </Box>
        </Modal>

        {/* Bulk delete modal */}
        <Modal isOpen={!!isBulkDeleteOpen} onClose={closeBulkDelete} title="Xác nhận xoá nhiều">
          <Box p={1}>
            <Text mb={6} color={softText}>
              Bạn có chắc muốn xoá{" "}
              <Text as="span" fontWeight="bold" color={dangerNameColor}>
                {selectedIds.length}
              </Text>{" "}
              user đã chọn không?
            </Text>
            <HStack spacing={3} justify="flex-end">
              <Button variant="ghost" onClick={closeBulkDelete} borderRadius="xl">
                Cancel
              </Button>
              <Button colorScheme="red" borderRadius="xl" onClick={confirmBulkDelete}>
                Confirm Delete
              </Button>
            </HStack>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}

UsersView.propTypes = {
  tab: PropTypes.oneOf(["active", "deleted"]),
  onTabChange: PropTypes.func,
  onRestoreUser: PropTypes.func,

  users: PropTypes.array,
  filteredUsers: PropTypes.array,
  pagination: PropTypes.shape({
    page: PropTypes.number,
    limit: PropTypes.number,
    total: PropTypes.number,
    totalPages: PropTypes.number,
  }),
  filters: PropTypes.object,
  allRoleCodes: PropTypes.array,
  isLoading: PropTypes.bool,

  screens: PropTypes.array,
  userPermissions: PropTypes.array,

  selectedIds: PropTypes.array,
  toggleSelect: PropTypes.func,
  selectAll: PropTypes.func,
  clearSelection: PropTypes.func,
  toggleUserStatus: PropTypes.func,
  bulkSetStatus: PropTypes.func,
  openBulkDelete: PropTypes.func,
  confirmBulkDelete: PropTypes.func,
  isBulkDeleteOpen: PropTypes.bool,
  closeBulkDelete: PropTypes.func,
  rowBusy: PropTypes.object,

  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,

  selectedUser: PropTypes.object,
  userToDelete: PropTypes.object,
  isFormOpen: PropTypes.bool,
  closeForm: PropTypes.func,
  isDeleteOpen: PropTypes.bool,
  closeDelete: PropTypes.func,
  onAddUser: PropTypes.func,
  onEditUser: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onSubmitUser: PropTypes.func,
  onConfirmDelete: PropTypes.func,
  onFilterChange: PropTypes.func,
  onRefresh: PropTypes.func,

  formatDate: PropTypes.func,
  formatLastActive: PropTypes.func,
};

export default UsersView;
