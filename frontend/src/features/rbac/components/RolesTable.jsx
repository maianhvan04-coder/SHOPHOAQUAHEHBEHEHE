import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Spacer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Tooltip,
  Wrap,
  WrapItem,
  useColorModeValue,
} from "@chakra-ui/react";

import {
  KeyIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

export default function RolesTable({
  roles = [],
  rolePermMap = {}, // { [roleCode]: [{ key, scope, field }] }
  loading,
  loadingPerms,
  selectedRoleCode,

  filters,
  onChangeFilters,

  onAddRole,
  onEditRole,
  onDeleteRole,
  onOpenPermissions,
  onToggleStatus,
  getRoleColorScheme,
}) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subText = useColorModeValue("gray.500", "gray.400");
  const tableHeaderColor = useColorModeValue("gray.600", "gray.400");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const rowHoverBg = useColorModeValue("blue.50", "whiteAlpha.100");

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="3xl"
      shadow="sm"
      overflow="hidden"
    >
      {/* ================= HEADER ================= */}
      <CardHeader pb={0} pt={6} px={6}>
        <Flex gap={4} direction={{ base: "column", md: "row" }} align="center" mb={4}>
          <InputGroup size="md" maxW={{ base: "full", md: "360px" }}>
            <InputLeftElement pointerEvents="none" color="gray.400">
              <Icon as={MagnifyingGlassIcon} boxSize={5} />
            </InputLeftElement>
            <Input
              placeholder="Search by role name or code..."
              value={filters.search}
              onChange={(e) =>
                onChangeFilters({ ...filters, search: e.target.value })
              }
              variant="filled"
              bg={useColorModeValue("gray.100", "gray.700")}
              _focus={{ bg: "transparent", borderColor: "blue.400" }}
              borderRadius="xl"
            />
          </InputGroup>

          <Select
            size="md"
            maxW={{ base: "full", md: "200px" }}
            value={filters.active}
            onChange={(e) =>
              onChangeFilters({ ...filters, active: e.target.value })
            }
            variant="filled"
            bg={useColorModeValue("gray.100", "gray.700")}
            borderRadius="xl"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>

          <Spacer />
          <Button onClick={onAddRole}>Add Role</Button>
        </Flex>

        <Badge px={3} py={1} borderRadius="full" colorScheme="gray" variant="subtle">
          Total: {roles.length}
        </Badge>
      </CardHeader>

      {/* ================= TABLE ================= */}
      <CardBody px={0} py={2}>
        <Box overflowX="auto">
          <Table variant="simple" size="md">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th color={tableHeaderColor} py={4} pl={6}>
                  Role Identity
                </Th>
                <Th color={tableHeaderColor} py={4}>
                  Permissions
                </Th>
                <Th color={tableHeaderColor} py={4}>
                  Status
                </Th>
                <Th color={tableHeaderColor} py={4} isNumeric>
                  Users
                </Th>
                <Th color={tableHeaderColor} py={4} textAlign="right" pr={6}>
                  Actions
                </Th>
              </Tr>
            </Thead>

            <Tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Tr key={i}>
                    <Td pl={6}><Skeleton h="24px" w="220px" /></Td>
                    <Td><Skeleton h="20px" w="160px" /></Td>
                    <Td><Skeleton h="20px" w="80px" rounded="full" /></Td>
                    <Td><Skeleton h="20px" w="40px" ml="auto" /></Td>
                    <Td pr={6}><Skeleton h="30px" w="120px" ml="auto" /></Td>
                  </Tr>
                ))
              ) : roles.length === 0 ? (
                <Tr>
                  <Td colSpan={5} py={16}>
                    <Center flexDirection="column">
                      <Icon as={InboxIcon} boxSize={12} color="gray.300" mb={3} />
                      <Text color={subText} fontWeight="medium">
                        No roles match your search.
                      </Text>
                    </Center>
                  </Td>
                </Tr>
              ) : (
                roles.map((role) => {
                  const perms = rolePermMap?.[role.code] || [];
                  const preview = perms.slice(0, 2);
                  const more = perms.length - preview.length;
                  const roleColor = getRoleColorScheme(role.code);

                  return (
                    <Tr
                      key={role._id || role.code}
                      _hover={{ bg: rowHoverBg }}
                      transition="background 0.2s"
                    >
                      {/* ===== ROLE INFO ===== */}
                      <Td pl={6} py={4}>
                        <HStack spacing={4}>
                          <Flex
                            w="48px"
                            h="48px"
                            align="center"
                            justify="center"
                            rounded="2xl"
                            bg={`${roleColor}.100`}
                            color={`${roleColor}.600`}
                            _dark={{
                              bg: `${roleColor}.900`,
                              color: `${roleColor}.200`,
                            }}
                          >
                            <Icon as={ShieldCheckIcon} boxSize={6} />
                          </Flex>

                          <Box>
                            <HStack mb={1}>
                              <Text fontWeight="bold">
                                {role.name || role.code}
                              </Text>
                              <Badge
                                variant="outline"
                                colorScheme={roleColor}
                                fontSize="xx-small"
                                rounded="md"
                              >
                                {role.code}
                              </Badge>
                            </HStack>
                            <Text
                              fontSize="xs"
                              color={subText}
                              noOfLines={1}
                              maxW="200px"
                            >
                              {role.description || "No description provided"}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>

                      {/* ===== PERMISSIONS ===== */}
                      <Td py={4}>
                        {perms.length === 0 ? (
                          <Text
                            fontSize="xs"
                            color="gray.400"
                            fontStyle="italic"
                          >
                            No permissions assigned
                          </Text>
                        ) : (
                          <Wrap spacing={2}>
                            {preview.map((p) => (
                              <WrapItem key={p.key}>
                                <Badge
                                  variant="subtle"
                                  colorScheme="gray"
                                  rounded="md"
                                  px={2}
                                  py={1}
                                  fontSize="xs"
                                >
                                  {p.key}
                                  {p.scope !== "all" && ` (${p.scope})`}
                                </Badge>
                              </WrapItem>
                            ))}

                            {more > 0 && (
                              <WrapItem>
                                <Badge
                                  rounded="md"
                                  px={2}
                                  py={1}
                                  fontSize="xs"
                                  bg="gray.200"
                                  color="gray.600"
                                >
                                  +{more}
                                </Badge>
                              </WrapItem>
                            )}
                          </Wrap>
                        )}
                      </Td>

                      {/* ===== STATUS ===== */}
                      <Td py={4}>
                        <Badge
                          variant="subtle"
                          colorScheme={role.isActive ? "green" : "red"}
                          rounded="full"
                          px={3}
                          cursor="pointer"
                          onClick={() => onToggleStatus(role)}
                        >
                          {role.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Td>

                      {/* ===== USERS COUNT ===== */}
                      <Td isNumeric py={4}>
                        <HStack justify="flex-end" spacing={2}>
                          <Text fontWeight="600" fontSize="sm">
                            {role.usersCount ?? 0}
                          </Text>
                          <Icon
                            as={UserGroupIcon}
                            boxSize={4}
                            color="gray.400"
                          />
                        </HStack>
                      </Td>

                      {/* ===== ACTIONS ===== */}
                      <Td textAlign="right" pr={6} py={4}>
                        <HStack justify="flex-end" spacing={1}>
                          <Tooltip label="Manage Permissions" hasArrow>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="purple"
                              icon={<KeyIcon className="h-4 w-4" />}
                              aria-label="Permissions"
                              onClick={() => onOpenPermissions(role)}
                              isLoading={
                                loadingPerms &&
                                selectedRoleCode === role.code
                              }
                              rounded="full"
                            />
                          </Tooltip>

                          <Tooltip label="Edit Details" hasArrow>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              icon={<PencilSquareIcon className="h-4 w-4" />}
                              aria-label="Edit"
                              onClick={() => onEditRole(role)}
                              rounded="full"
                            />
                          </Tooltip>

                          <Tooltip label="Delete Role" hasArrow>
                            <IconButton
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              icon={<TrashIcon className="h-4 w-4" />}
                              aria-label="Delete"
                              onClick={() => onDeleteRole(role)}
                              rounded="full"
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
      </CardBody>
    </Card>
  );
}
