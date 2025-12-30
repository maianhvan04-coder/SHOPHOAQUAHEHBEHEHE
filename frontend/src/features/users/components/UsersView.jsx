/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
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
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import { canAccessAction } from "~/shared/utils/ability";
import Modal from "~/components/common/Modal";
import UserForm from "~/features/users/page/UserForm";
import PageHeader from "~/components/layout/admin/PageHeader";

/** ===== helpers ===== */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildPageItems(page, totalPages) {
  // returns array of numbers and "..."
  if (!totalPages || totalPages <= 1) return [1];
  const p = clamp(page, 1, totalPages);

  const show = new Set([1, totalPages, p, p - 1, p + 1, p - 2, p + 2]);
  const arr = [];
  for (let i = 1; i <= totalPages; i++) {
    if (show.has(i)) arr.push(i);
  }

  // insert ellipsis
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i]);
    if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push("...");
  }
  return out;
}

function permFallback(perms = [], key) {
  return Array.isArray(perms) && perms.includes(key);
}

function computePermission({ screens, userPermissions, resourceKey, actionKey }) {
  // Try screen.actions first
  const screen = (screens || []).find((s) => s?.key === resourceKey) || null;
  if (screen) return canAccessAction(userPermissions, screen, actionKey);

  // Fallback if screens missing (still works)
  const map = {
    create: `${resourceKey}:create`,
    update: `${resourceKey}:update`,
    delete: `${resourceKey}:delete`,
    changeStatus: `${resourceKey}:status`,
    bulkStatus: `${resourceKey}:bulk_status`,
    bulkDelete: `${resourceKey}:bulk_delete`,
  };
  const perm = map[actionKey];
  if (!perm) return false;
  return permFallback(userPermissions, perm);
}

/** ===== Reusable Pagination (Chakra) ===== */
function Pagination({
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onLimitChange,
}) {
  const [jump, setJump] = useState(String(page));
  const items = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <Card
      mt={4}
      p={3}
      borderRadius="xl"
      border="1px solid"
      borderColor={useColorModeValue("gray.100", "gray.700")}
      bg={useColorModeValue("white", "gray.800")}
    >
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={3}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
      >
        <HStack spacing={3} flexWrap="wrap">
          <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
            Showing <b>{from}</b>–<b>{to}</b> of <b>{total}</b>
          </Text>

          <HStack spacing={2}>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
              Rows
            </Text>
            <Select
              size="sm"
              w="90px"
              value={limit}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
              borderRadius="full"
            >
              {pageSizeOptions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
          </HStack>
        </HStack>

        <HStack spacing={2} justify={{ base: "space-between", md: "flex-end" }} flexWrap="wrap">
          <HStack spacing={1}>
            <IconButton
              size="sm"
              variant="outline"
              borderRadius="full"
              aria-label="Previous"
              icon={<ChevronLeftIcon className="h-4 w-4" />}
              isDisabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            />

            {items.map((it, idx) =>
              it === "..." ? (
                <Box key={`e-${idx}`} px={2} color={useColorModeValue("gray.500", "gray.400")}>
                  …
                </Box>
              ) : (
                <Button
                  key={it}
                  size="sm"
                  variant={it === page ? "solid" : "ghost"}
                  colorScheme={it === page ? "vrv" : undefined}
                  borderRadius="full"
                  onClick={() => onPageChange?.(it)}
                >
                  {it}
                </Button>
              )
            )}

            <IconButton
              size="sm"
              variant="outline"
              borderRadius="full"
              aria-label="Next"
              icon={<ChevronRightIcon className="h-4 w-4" />}
              isDisabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            />
          </HStack>

          <HStack spacing={2}>
            <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
              Jump
            </Text>
            <Input
              size="sm"
              w="88px"
              borderRadius="full"
              value={jump}
              onChange={(e) => setJump(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const next = clamp(Number(jump || 1), 1, totalPages);
                  setJump(String(next));
                  onPageChange?.(next);
                }
              }}
            />
            <Button
              size="sm"
              borderRadius="full"
              onClick={() => {
                const next = clamp(Number(jump || 1), 1, totalPages);
                setJump(String(next));
                onPageChange?.(next);
              }}
            >
              Go
            </Button>
          </HStack>
        </HStack>
      </Stack>
    </Card>
  );
}

Pagination.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
  total: PropTypes.number,
  totalPages: PropTypes.number,
  pageSizeOptions: PropTypes.array,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
};

/** ===== UsersView ===== */
function UsersView({
  // data
  users = [],
  filteredUsers = [],
  pagination = null, // { page, limit, total, totalPages }
  filters,
  allRoleCodes = [],
  isLoading = false,

  // authz
  screens = [],
  userPermissions = [],

  // selection + bulk
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

  // paging callbacks (call API)
  onPageChange,
  onLimitChange,

  // modal + actions
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

  // helpers
  formatDate,
  formatLastActive,
}) {
  const bgColor = useColorModeValue("white", "gray.800");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.100", "gray.700");
  const tableHeaderBg = useColorModeValue("gray.50/50", "gray.700/50");
  const cardShadow = useColorModeValue("sm", "dark-lg");

  const displayMode = useBreakpointValue({ base: "mobile", md: "desktop" });

  // permissions (screen.actions or fallback)
  const canCreate = computePermission({ screens, userPermissions, resourceKey: "user", actionKey: "create" });
  const canUpdate = computePermission({ screens, userPermissions, resourceKey: "user", actionKey: "update" });
  const canDelete = computePermission({ screens, userPermissions, resourceKey: "user", actionKey: "delete" });
  const canChangeStatus = computePermission({ screens, userPermissions, resourceKey: "user", actionKey: "changeStatus" });
  const canBulkStatus = computePermission({ screens, userPermissions, resourceKey: "user", actionKey: "bulkStatus" });
  const canBulkDelete = computePermission({ screens, userPermissions, resourceKey: "user", actionKey: "bulkDelete" });

  const idsOnPage = useMemo(() => (filteredUsers || []).map((u) => u?._id).filter(Boolean), [filteredUsers]);
  const allChecked = idsOnPage.length > 0 && idsOnPage.every((id) => selectedIds.includes(id));
  const someChecked = idsOnPage.some((id) => selectedIds.includes(id)) && !allChecked;

  const renderRoleBadges = (u) => {
    const roleCodes = (u.roles || []).map((r) => r.code).filter(Boolean);
    if (!roleCodes.length) return <Text fontSize="xs" color="gray.400">No roles</Text>;

    return (
      <HStack spacing={1} flexWrap="wrap">
        {roleCodes.map((code) => (
          <Tag
            key={code}
            size="sm"
            variant="subtle"
            colorScheme="blue"
            borderRadius="full"
          >
            <Text fontSize="11px" fontWeight="bold">
              {code.toUpperCase()}
            </Text>
          </Tag>
        ))}
      </HStack>
    );
  };

  const StatusBadge = ({ u }) => {
    const disabled = !canChangeStatus || !!rowBusy?.[u._id];
    const label = !canChangeStatus
      ? "Bạn không có quyền đổi status"
      : "Click để đổi trạng thái";

    return (
      <Tooltip label={label}>
        <Box display="inline-block">
          <Badge
            size="sm"
            px={3}
            borderRadius="full"
            variant="subtle"
            colorScheme={u.isActive ? "green" : "red"}
            cursor={disabled ? "not-allowed" : "pointer"}
            opacity={disabled ? 0.6 : 1}
            onClick={() => {
              if (disabled) return;
              toggleUserStatus?.(u);
            }}
          >
            {rowBusy?.[u._id] ? "Updating..." : (u.isActive ? "Active" : "Inactive")}
          </Badge>
        </Box>
      </Tooltip>
    );
  };

  StatusBadge.propTypes = { u: PropTypes.object.isRequired };

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
            <Checkbox
              isChecked={selectedIds.includes(u._id)}
              onChange={() => toggleSelect?.(u._id)}
            />
            <Avatar size="sm" name={u.fullName} src={u.avatar} />
            <Box>
              <Text fontWeight="bold" fontSize="sm">
                {u.fullName || "Unknown"}
              </Text>
              <Text fontSize="xs" color={secondaryTextColor}>
                {u.email || "-"}
              </Text>
            </Box>
          </HStack>

          <StatusBadge u={u} />
        </Flex>

        <HStack wrap="wrap">{renderRoleBadges(u)}</HStack>

        <Divider borderColor={borderColor} />

        <Flex justify="space-between" align="center">
          <Text fontSize="xs" color={secondaryTextColor}>
            Joined {formatDate?.(u.createdAt)}
          </Text>

          <HStack spacing={1}>
            {canUpdate && (
              <IconButton
                size="sm"
                variant="ghost"
                icon={<PencilSquareIcon className="h-4 w-4" />}
                onClick={() => onEditUser?.(u)}
                aria-label="Edit"
              />
            )}
            {canDelete && (
              <IconButton
                size="sm"
                variant="ghost"
                colorScheme="red"
                icon={<TrashIcon className="h-4 w-4" />}
                onClick={() => onDeleteClick?.(u)}
                aria-label="Delete"
              />
            )}
          </HStack>
        </Flex>
      </VStack>
    </Card>
  );

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const total = pagination?.total ?? filteredUsers.length ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
      {/* Header */}
      <Box mb={6}>
        <PageHeader
          title="User Management"
          description="Create, edit and manage permissions for all system users."
          buttonLabel={canCreate ? "New User" : undefined}
          buttonIcon={canCreate ? PlusIcon : undefined}
          onButtonClick={canCreate ? onAddUser : undefined}
        />
      </Box>

      {/* Bulk Bar */}
      {selectedIds.length > 0 && (canBulkStatus || canBulkDelete) && (
        <Card
          mb={4}
          p={3}
          borderRadius="xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow={cardShadow}
        >
          <HStack justify="space-between" flexWrap="wrap" spacing={3}>
            <Text fontSize="sm" fontWeight="semibold">
              Đã chọn {selectedIds.length} user
            </Text>

            <HStack spacing={2} flexWrap="wrap">
              <Button size="sm" variant="ghost" onClick={clearSelection}>
                Bỏ chọn
              </Button>

              {canBulkStatus && (
                <>
                  <Button size="sm" onClick={() => bulkSetStatus?.(true)}>
                    Set Active
                  </Button>
                  <Button size="sm" onClick={() => bulkSetStatus?.(false)}>
                    Set Inactive
                  </Button>
                </>
              )}

              {canBulkDelete && (
                <Button size="sm" colorScheme="red" onClick={openBulkDelete}>
                  Xóa đã chọn
                </Button>
              )}
            </HStack>
          </HStack>
        </Card>
      )}

      <Card
        borderRadius="2xl"
        boxShadow={cardShadow}
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
      >
        {/* Toolbar */}
        <Box p={5} borderBottom="1px solid" borderColor={borderColor}>
          <Stack
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            spacing={4}
          >
            <HStack spacing={3} flex={1} flexWrap="wrap">
              <InputGroup size="sm" maxW="320px">
                <InputLeftElement>
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </InputLeftElement>
                <Input
                  placeholder="Search name, email..."
                  borderRadius="full"
                  bg={useColorModeValue("gray.50", "gray.900")}
                  border="none"
                  value={filters?.search ?? ""}
                  onChange={(e) => onFilterChange?.("search", e.target.value)}
                />
              </InputGroup>

              <Select
                size="sm"
                borderRadius="full"
                maxW="170px"
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
                maxW="170px"
                value={filters?.status ?? ""}
                onChange={(e) => onFilterChange?.("status", e.target.value)}
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

        {/* Content */}
        <Box>
          {displayMode === "desktop" ? (
            <Table variant="simple" size="sm">
              <Thead bg={tableHeaderBg}>
                <Tr>
                  <Th w="42px">
                    <Checkbox
                      isChecked={allChecked}
                      isIndeterminate={someChecked}
                      onChange={() => selectAll?.(idsOnPage)}
                    />
                  </Th>
                  <Th py={4} color="gray.500" fontWeight="bold">User</Th>
                  <Th py={4} color="gray.500" fontWeight="bold">Role Membership</Th>
                  <Th py={4} color="gray.500" fontWeight="bold">Account Status</Th>
                  <Th py={4} color="gray.500" fontWeight="bold">Created</Th>
                  <Th py={4} textAlign="right" color="gray.500" fontWeight="bold">Actions</Th>
                </Tr>
              </Thead>

              <Tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Tr key={i}>
                      <Td><SkeletonCircle size="4" /></Td>
                      <Td py={4}>
                        <HStack spacing={3}>
                          <SkeletonCircle size="8" />
                          <Box w="260px">
                            <Skeleton height="14px" mb="8px" />
                            <Skeleton height="10px" />
                          </Box>
                        </HStack>
                      </Td>
                      <Td py={4}>
                        <SkeletonText noOfLines={2} spacing="2" />
                      </Td>
                      <Td py={4}>
                        <Skeleton height="18px" w="90px" borderRadius="full" />
                      </Td>
                      <Td py={4}>
                        <Skeleton height="12px" w="120px" />
                      </Td>
                      <Td py={4} textAlign="right">
                        <HStack justify="flex-end">
                          <Skeleton height="28px" w="28px" borderRadius="lg" />
                          <Skeleton height="28px" w="28px" borderRadius="lg" />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} py={16} textAlign="center" color="gray.400">
                      No results found.
                    </Td>
                  </Tr>
                ) : (
                  filteredUsers.map((u) => (
                    <Tr key={u._id} _hover={{ bg: tableHeaderBg }} transition="0.2s">
                      <Td>
                        <Checkbox
                          isChecked={selectedIds.includes(u._id)}
                          onChange={() => toggleSelect?.(u._id)}
                        />
                      </Td>

                      <Td py={4}>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={u.fullName} src={u.avatar} borderRadius="lg" />
                          <Box>
                            <Text fontWeight="bold" fontSize="sm">
                              {u.fullName || "Unknown"}
                            </Text>
                            <Text fontSize="xs" color={secondaryTextColor}>
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
                        <HStack fontSize="xs" color={secondaryTextColor}>
                          <Icon as={CalendarIcon} boxSize={3} />
                          <Text>{formatDate?.(u.createdAt)}</Text>
                        </HStack>
                      </Td>

                      <Td py={4} textAlign="right">
                        <HStack justify="flex-end" spacing={1}>
                          {canUpdate && (
                            <IconButton
                              size="sm"
                              variant="ghost"
                              borderRadius="lg"
                              icon={<PencilSquareIcon className="h-4 w-4" />}
                              onClick={() => onEditUser?.(u)}
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
                              onClick={() => onDeleteClick?.(u)}
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
            <Box p={4}>
              {isLoading ? (
                <Stack spacing={4}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} p={4} borderRadius="xl" border="1px solid" borderColor={borderColor}>
                      <HStack spacing={3}>
                        <SkeletonCircle size="8" />
                        <Box flex="1">
                          <Skeleton height="14px" mb="8px" />
                          <Skeleton height="10px" w="60%" />
                        </Box>
                      </HStack>
                      <SkeletonText mt="4" noOfLines={2} spacing="2" />
                    </Card>
                  ))}
                </Stack>
              ) : (
                filteredUsers.map(renderMobileCard)
              )}
            </Box>
          )}
        </Box>

        {/* Pagination */}
        {!!pagination && (
          <Box p={4} borderTop="1px solid" borderColor={borderColor}>
            <Pagination
              page={page}
              limit={limit}
              total={total}
              totalPages={totalPages}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
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
          <Text mb={6} color={secondaryTextColor}>
            Are you sure you want to delete{" "}
            <Text as="span" fontWeight="bold" color={useColorModeValue("gray.700", "gray.100")}>
              {userToDelete?.fullName || userToDelete?.email || "this user"}
            </Text>
            ? This user will lose all access immediately.
          </Text>
          <HStack spacing={3} justify="flex-end">
            <Button variant="ghost" onClick={closeDelete}>Cancel</Button>
            <Button colorScheme="red" borderRadius="xl" onClick={onConfirmDelete}>
              Confirm Delete
            </Button>
          </HStack>
        </Box>
      </Modal>

      {/* Bulk delete modal */}
      <Modal isOpen={!!isBulkDeleteOpen} onClose={closeBulkDelete} title="Xác nhận xoá nhiều">
        <Box p={1}>
          <Text mb={6} color={secondaryTextColor}>
            Bạn có chắc muốn xoá{" "}
            <Text as="span" fontWeight="bold" color={useColorModeValue("gray.700", "gray.100")}>
              {selectedIds.length}
            </Text>{" "}
            user đã chọn không?
          </Text>
          <HStack spacing={3} justify="flex-end">
            <Button variant="ghost" onClick={closeBulkDelete}>Cancel</Button>
            <Button colorScheme="red" borderRadius="xl" onClick={confirmBulkDelete}>
              Confirm Delete
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
}

UsersView.propTypes = {
  // data
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

  // authz
  screens: PropTypes.array,
  userPermissions: PropTypes.array,

  // selection + bulk
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

  // paging callbacks
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,

  // modal + actions
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

  // helpers
  formatDate: PropTypes.func,
  formatLastActive: PropTypes.func,
};

export default UsersView;
