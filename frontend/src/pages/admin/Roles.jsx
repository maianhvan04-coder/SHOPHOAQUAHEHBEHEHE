import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
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
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import {
  KeyIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { rbacService } from "~/features/rbac/services/rbacService";
import RolePermissionsModal from "~/features/rbac/components/RolePermissionsModal";

function Roles() {
  const toast = useToast();

  // ✅ HOOKS ở top-level (KHÔNG gọi trong map/callback)
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const iconBg = useColorModeValue("gray.100", "gray.700");
  const chipBg = useColorModeValue("gray.100", "gray.700");

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [rolePermMap, setRolePermMap] = useState({}); // { ADMIN: ["USER_READ", ...], ... }
  const [rolePermissionKeys, setRolePermissionKeys] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [filters, setFilters] = useState({
    search: "",
    active: "",
  });

  const filteredRoles = useMemo(() => {
    const s = (filters.search || "").trim().toLowerCase();
    return (roles || []).filter((r) => {
      const matchSearch =
        !s ||
        (r.code || "").toLowerCase().includes(s) ||
        (r.name || "").toLowerCase().includes(s) ||
        (r.type || "").toLowerCase().includes(s);

      const matchActive =
        filters.active === ""
          ? true
          : filters.active === "active"
          ? r.isActive === true
          : r.isActive === false;

      return matchSearch && matchActive;
    });
  }, [roles, filters]);

  const handleEditRole = (role) => {
    // TODO: bạn mở modal edit role / navigate sang trang edit
    console.log("edit role", role);
    toast({
      title: "Edit role",
      description: `Role: ${role?.code}`,
      status: "info",
      duration: 1500,
    });
  };

  const handleDeleteRole = (role) => {
    // TODO: confirm rồi gọi API delete role
    console.log("delete role", role);
    toast({
      title: "Delete role",
      description: `Role: ${role?.code}`,
      status: "warning",
      duration: 1500,
    });
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([
        rbacService.getRoles(),
        rbacService.getPermissions(),
      ]);

      const roleList = Array.isArray(r) ? r : [];
      setRoles(roleList);
      setPermissions(Array.isArray(p) ? p : []);

      // ✅ lấy permissions theo từng role để show chip
      const entries = await Promise.all(
        roleList.map(async (role) => {
          try {
            const res = await rbacService.getRolePermissions(role.code);
            const data = res?.data ?? res; // ✅ ưu tiên res.data
            return [role.code, data?.permissionKeys || []];
          } catch (e) {
            return [role.code, []];
          }
        })
      );

      setRolePermMap(Object.fromEntries(entries));
    } catch (e) {
      toast({
        title: "Load RBAC failed",
        description: e?.message || "Không tải được roles/permissions",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const openPermissions = async (role) => {
    setSelectedRole(role);
    setLoadingPerms(true);
    try {
      const res = await rbacService.getRolePermissions(role.code);
      console.log(res)
      const data = res?.data ?? res;
      setRolePermissionKeys(data?.permissionKeys || []);
      onOpen();
    } catch (e) {
      toast({
        title: "Load role permissions failed",
        description: e?.message || "Không tải được permissions của role",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoadingPerms(false);
    }
  };

  const handleSavePermissions = async (selectedKeys) => {
    if (!selectedRole?.code) return;

    setSaving(true);
    try {
      await rbacService.setRolePermissions({
        roleCode: selectedRole.code,
        permissionKeys: selectedKeys,
      });

      // ✅ update UI ngay (khỏi đợi reload)
      setRolePermMap((prev) => ({
        ...prev,
        [selectedRole.code]: selectedKeys,
      }));

      toast({
        title: "Saved",
        description: `Đã gán ${selectedKeys.length} permissions cho role ${selectedRole.code}`,
        status: "success",
        duration: 2000,
      });

      onClose();
    } catch (e) {
      const msg =
        e?.response?.data?.error?.message || e?.message || "Lưu permissions thất bại";
      toast({
        title: "Save failed",
        description: msg,
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const syncAdmin = async () => {
    setSaving(true);
    try {
      await rbacService.syncAdminAllPermissions();
      toast({ title: "Synced admin permissions", status: "success", duration: 2000 });
      await loadAll();
    } catch (e) {
      toast({
        title: "Sync failed",
        description: e?.message || "Sync admin thất bại",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={8}>
      <Card
        variant="outline"
        bg={bgColor}
        border="1px solid"
        borderColor="#304945"
        overflow="hidden"
      >
        <Box px={6} py={4}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="xl" fontWeight="bold">
                RBAC Roles
              </Text>
              <Text fontSize="sm" color={textColor}>
                Quản lý roles và gán permissions
              </Text>
            </Box>

            <HStack>
              <Button
                leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                variant="outline"
                onClick={loadAll}
                isLoading={loading}
              >
                Refresh
              </Button>

               <Button colorScheme="blue" onClick={syncAdmin} isLoading={saving}>
                Sync Admin
              </Button>
            </HStack>
          </Flex>

          {/* Filters */}
          <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={4}>
            <InputGroup maxW={{ base: "full", md: "320px" }}>
              <InputLeftElement pointerEvents="none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </InputLeftElement>
              <Input
                placeholder="Search by code/name/type..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    search: e.target.value,
                  }))
                }
              />
            </InputGroup>

            <Select
              maxW={{ base: "full", md: "200px" }}
              value={filters.active}
              onChange={(e) =>
                setFilters((p) => ({
                  ...p,
                  active: e.target.value,
                }))
              }
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Stack>

          <Text color={textColor} fontSize="sm" mb={3}>
            Showing {filteredRoles.length} of {roles.length} roles
          </Text>

          <Box overflowX="auto">
            <Table>
              <Thead bg={headerBg}>
                <Tr>
                  <Th borderColor={borderColor}>ROLE</Th>
                  <Th borderColor={borderColor}>DESCRIPTION</Th>
                  <Th borderColor={borderColor}>PERMISSIONS</Th>
                  <Th borderColor={borderColor}>STATUS</Th>
                  <Th borderColor={borderColor}>USERS</Th>
                  <Th borderColor={borderColor}>ACTIONS</Th>
                </Tr>
              </Thead>

              <Tbody>
                {loading ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8} borderColor={borderColor}>
                      <Spinner size="sm" mr={2} />
                      <Text display="inline-block">Loading...</Text>
                    </Td>
                  </Tr>
                ) : filteredRoles.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={8} borderColor={borderColor}>
                      No roles found
                    </Td>
                  </Tr>
                ) : (
                  filteredRoles.map((role) => {
                    const keys = rolePermMap?.[role.code] || [];
                    const preview = keys.slice(0, 2);
                    const more = keys.length - preview.length;

                    return (
                      <Tr key={role._id}>
                        <Td borderColor={borderColor}>
                          <HStack spacing={3}>
                            <Box
                              w="36px"
                              h="36px"
                              rounded="lg"
                              bg={iconBg}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path
                                  d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                />
                                <path
                                  d="M9.5 12l1.8 1.8L15.5 9.6"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </Box>

                            <Badge
                              rounded="full"
                              px={3}
                              py={1}
                              colorScheme={
                                role.code === "ADMIN"
                                  ? "purple"
                                  : role.code === "MANAGER"
                                  ? "blue"
                                  : "green"
                              }
                            >
                              {role.code}
                            </Badge>
                          </HStack>
                        </Td>

                        <Td borderColor={borderColor}>
                          <Text fontWeight="medium" fontSize="sm">
                            {role.description || role.name || "-"}
                          </Text>
                        </Td>

                        <Td borderColor={borderColor}>
                          <HStack spacing={2} flexWrap="wrap">
                            {preview.map((k) => (
                              <Badge
                                key={k}
                                rounded="md"
                                px={2}
                                py={1}
                                fontSize="xs"
                                bg={chipBg}
                              >
                                {k}
                              </Badge>
                            ))}

                            {more > 0 && (
                              <Badge rounded="md" px={2} py={1} fontSize="xs" bg={chipBg}>
                                +{more} more
                              </Badge>
                            )}

                            {keys.length === 0 && (
                              <Text fontSize="xs" opacity={0.7}>
                                No permissions
                              </Text>
                            )}
                          </HStack>
                        </Td>

                        <Td borderColor={borderColor}>
                          <Badge
                            colorScheme={role.isActive ? "green" : "red"}
                            rounded="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                          >
                            {role.isActive ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </Td>

                        <Td borderColor={borderColor}>
                         <Text fontWeight="bold">{role.usersCount ?? 0}</Text>
                          <Text fontSize="xs" opacity={0.7}>users</Text>

                        </Td>

                        <Td borderColor={borderColor}>
                          <HStack spacing={1}>
                            <Tooltip label="Gán permissions" hasArrow>
                              <IconButton
                                icon={<KeyIcon className="h-4 w-4" />}
                                variant="ghost"
                                colorScheme="vrv"
                                size="sm"
                                onClick={() => openPermissions(role)}
                                aria-label="Role permissions"
                                isLoading={loadingPerms && selectedRole?.code === role.code}
                              />
                            </Tooltip>

                            <Tooltip label="Edit role" hasArrow>
                              <IconButton
                                icon={<PencilSquareIcon className="h-4 w-4" />}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRole(role)}
                                aria-label="Edit role"
                              />
                            </Tooltip>

                            <Tooltip label="Delete role" hasArrow>
                              <IconButton
                                icon={<TrashIcon className="h-4 w-4" />}
                                variant="ghost"
                                colorScheme="red"
                                size="sm"
                                onClick={() => handleDeleteRole(role)}
                                aria-label="Delete role"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Card>

      <RolePermissionsModal
        isOpen={isOpen}
        onClose={onClose}
        role={selectedRole}
        allPermissions={permissions}
        initialSelectedKeys={rolePermissionKeys}
        onSave={handleSavePermissions}
        saving={saving}
      />
    </Box>
  );
}

export default Roles;
