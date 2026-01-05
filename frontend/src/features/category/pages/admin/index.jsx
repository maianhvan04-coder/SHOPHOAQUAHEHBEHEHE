/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useToast } from "@chakra-ui/react";

import PageHeader from "~/components/layout/admin/PageHeader";
import Pagination from "~/components/common/Pagination";
import Modal from "~/components/common/Modal";

import { useAuth } from "~/app/providers/AuthProvides";
import { canAccessAction } from "~/shared/utils/ability";

import { useAdminCategory } from "~/features/category/hooks/AdminCategory";
import CategoryTabs from "~/features/category/pages/admin/CategoryTabs";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  Tooltip,
  VStack,
  Switch,
  useColorModeValue,
} from "@chakra-ui/react";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// slugify (client only - backend bạn đang tự makeSlug)
const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// permission helper
function computePermission({ screens, userPermissions, resourceKey, actionKey }) {
  const screen = (screens || []).find((s) => s?.key === resourceKey) || null;
  if (!screen) return false;
  return canAccessAction(userPermissions, screen, actionKey);
}

export default function AdminCategoryPage({ screens: screensProp, userPermissions: permsProp }) {
  const outlet = useOutletContext?.() || {};
  const auth = useAuth?.() || {};
  const toast = useToast();

  const screens = screensProp ?? outlet?.screens ?? [];
  const userPermissions = permsProp ?? auth?.permissions ?? [];

  // ===== TAB =====
  const [tab, setTab] = useState("active"); // "active" | "deleted"
  const isDeletedTab = tab === "deleted";

  // ===== THEME =====
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const thColor = useColorModeValue("gray.500", "gray.400");
  const rowHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const stickyHeaderBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");

  // ===== PERMISSIONS =====
  const canCreate = useMemo(
    () => computePermission({ screens, userPermissions, resourceKey: "category", actionKey: "create" }),
    [screens, userPermissions]
  );
  const canUpdate = useMemo(
    () => computePermission({ screens, userPermissions, resourceKey: "category", actionKey: "update" }),
    [screens, userPermissions]
  );
  const canDelete = useMemo(
    () => computePermission({ screens, userPermissions, resourceKey: "category", actionKey: "delete" }),
    [screens, userPermissions]
  );
  const canRestore = useMemo(
    () => computePermission({ screens, userPermissions, resourceKey: "category", actionKey: "restore" }),
    [screens, userPermissions]
  );

  // ===== FILTERS =====
  const [filters, setFilters] = useState({
    search: "",
    type: "",   // "" | "single" | "mix"
    status: "", // "" | "active" | "inactive"
  });

  // ===== DATA HOOK =====
  const {
    categories,
    loading,

    page,
    setPage,
    limit,
    setLimit,
    totalItems,
    totalPages,

    counts, // {active, deleted}
    createCategory,
    updateCategory,

    deleteCategory,      // soft
    restoreCategory,
    hardDeleteCategory,  // hard

    refetch,
    reloadAll,           // ✅ cần có để bulk không spam API
  } = useAdminCategory({ tab, filters });

  const activeCount = counts?.active ?? 0;
  const deletedCount = counts?.deleted ?? 0;

  // ===== FILTER CHANGE =====
  const onFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, [setPage]);

  // ===== SELECTION =====
  const [selectedIds, setSelectedIds] = useState([]);

  const idsOnPage = useMemo(
    () => (categories || []).map((c) => c?._id).filter(Boolean).map(String),
    [categories]
  );

  const toggleSelect = (id) => {
    const sid = String(id);
    setSelectedIds((prev) => (prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]));
  };

  const clearSelection = () => setSelectedIds([]);

  const selectAll = (ids) => {
    const uniq = Array.from(new Set((ids || []).map(String)));
    setSelectedIds(uniq);
  };

  const allChecked = idsOnPage.length > 0 && idsOnPage.every((id) => selectedIds.includes(id));
  const someChecked = idsOnPage.some((id) => selectedIds.includes(id)) && !allChecked;

  useEffect(() => {
    clearSelection();
  }, [tab, filters.search, filters.type, filters.status, page, limit]);

  // ===== MODAL FORM =====
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("single");
  const [isActive, setIsActive] = useState(true);

  const openCreate = () => {
    if (!canCreate) return;
    setEditing(null);
    setName("");
    setDescription("");
    setType("single");
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEdit = (c) => {
    if (!canUpdate) return;
    setEditing(c);
    setName(c?.name || "");
    setDescription(c?.description || "");
    setType(c?.type || "single");
    setIsActive(Boolean(c?.isActive));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const onSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({ title: "Tên danh mục không được để trống", status: "warning", duration: 1600, isClosable: true, position: "top" });
      return;
    }

    const payload = {
      name: trimmed,
      slug: slugify(trimmed), // backend vẫn sẽ tự makeSlug nếu bạn muốn
      description: description?.trim() || "",
      type,
      isActive: Boolean(isActive),
    };

    try {
      if (editing?._id) {
        await updateCategory(editing._id, payload);
        toast({ title: "Cập nhật thành công", status: "success", duration: 1400, isClosable: true, position: "top" });
      } else {
        await createCategory(payload);
        toast({ title: "Tạo thành công", status: "success", duration: 1400, isClosable: true, position: "top" });
      }
      closeForm();
    } catch (err) {
      toast({ title: "Có lỗi xảy ra", description: err?.message || "Vui lòng thử lại", status: "error", duration: 2200, isClosable: true, position: "top" });
    }
  };

  // ===== SINGLE ACTIONS =====
  const onSoftDelete = async (c) => {
    if (!canDelete) return;
    const ok = window.confirm(`Xoá "${c?.name}"? (đưa vào thùng rác)`);
    if (!ok) return;

    try {
      await deleteCategory(c._id);
      toast({ title: "Đã chuyển vào thùng rác", status: "success", duration: 1400, isClosable: true, position: "top" });
      setTab("deleted");
      setPage(1);
      await reloadAll?.(); // ✅ đảm bảo list + count đúng
    } catch (err) {
      toast({ title: "Xoá thất bại", description: err?.message || "Vui lòng thử lại", status: "error", duration: 2200, isClosable: true, position: "top" });
    }
  };

  const onRestore = async (c) => {
    if (!canRestore) return;

    try {
      await restoreCategory(c._id);
      toast({ title: "Đã khôi phục", status: "success", duration: 1400, isClosable: true, position: "top" });
      setTab("active");
      setPage(1);
      await reloadAll?.();
    } catch (err) {
      toast({ title: "Khôi phục thất bại", description: err?.message || "Vui lòng thử lại", status: "error", duration: 2200, isClosable: true, position: "top" });
    }
  };

  const onHardDelete = async (c) => {
    if (!canDelete) return;
    if (!isDeletedTab) {
      toast({ title: "Chỉ xoá vĩnh viễn trong tab Thùng rác", status: "warning", duration: 1600, isClosable: true, position: "top" });
      return;
    }

    const ok = window.confirm(`XÓA VĨNH VIỄN "${c?.name}"? Không thể hoàn tác.`);
    if (!ok) return;

    try {
      await hardDeleteCategory(c._id);
      toast({ title: "Đã xoá vĩnh viễn", status: "success", duration: 1400, isClosable: true, position: "top" });
      await reloadAll?.();
    } catch (err) {
      toast({ title: "Xoá vĩnh viễn thất bại", description: err?.message || "Vui lòng thử lại", status: "error", duration: 2200, isClosable: true, position: "top" });
    }
  };

  // ===== BULK ACTIONS (✅ không spam API) =====
  const bulkSoftDelete = async () => {
    if (!canDelete || selectedIds.length === 0) return;
    const ok = window.confirm(`Xoá ${selectedIds.length} danh mục? (đưa vào thùng rác)`);
    if (!ok) return;

    try {
      await Promise.all(selectedIds.map((id) => deleteCategory(id)));
      clearSelection();
      setTab("deleted");
      setPage(1);
      await reloadAll?.();
      toast({ title: "Đã chuyển vào thùng rác", status: "success", duration: 1400, isClosable: true, position: "top" });
    } catch (err) {
      toast({ title: "Xoá thất bại", description: err?.message || "Vui lòng thử lại", status: "error", duration: 2200, isClosable: true, position: "top" });
    }
  };

  const bulkRestore = async () => {
    if (!canRestore || selectedIds.length === 0) return;
    const ok = window.confirm(`Khôi phục ${selectedIds.length} danh mục?`);
    if (!ok) return;

    try {
      await Promise.all(selectedIds.map((id) => restoreCategory(id)));
      clearSelection();
      setTab("active");
      setPage(1);
      await reloadAll?.();
      toast({ title: "Đã khôi phục", status: "success", duration: 1400, isClosable: true, position: "top" });
    } catch (err) {
      toast({ title: "Khôi phục thất bại", description: err?.message || "Vui lòng thử lại", status: "error", duration: 2200, isClosable: true, position: "top" });
    }
  };

  const bulkHardDelete = async () => {
    if (!canDelete || selectedIds.length === 0) return;
    if (!isDeletedTab) {
      toast({ title: "Chỉ xoá vĩnh viễn trong tab Thùng rác", status: "warning", duration: 1600, isClosable: true, position: "top" });
      return;
    }

    const ok = window.confirm(`XÓA VĨNH VIỄN ${selectedIds.length} danh mục? Không thể hoàn tác.`);
    if (!ok) return;

    try {
      await Promise.all(selectedIds.map((id) => hardDeleteCategory(id)));
      clearSelection();
      await reloadAll?.();
      toast({ title: "Đã xoá vĩnh viễn", status: "success", duration: 1400, isClosable: true, position: "top" });
    } catch (err) {
      toast({ title: "Xoá vĩnh viễn thất bại", description: err?.message || "Vui lòng thử lại", status: "error", duration: 2200, isClosable: true, position: "top" });
    }
  };

  return (
    <Box bg={bgMain} minH="100vh" p={{ base: 2, md: 6 }}>
      <Box maxW="1600px" mx="auto">
        {/* HEADER */}
        <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} mb={6} spacing={4}>
          <Box>
            <PageHeader title="Danh mục" description={isDeletedTab ? "Quản lý dữ liệu thùng rác." : "Quản lý danh mục sản phẩm."} />
            <Box mt={4}>
              <CategoryTabs
                tab={tab}
                onChangeTab={(t) => {
                  setTab(t);
                  setPage(1);
                }}
                activeCount={activeCount}
                deletedCount={deletedCount}
              />
            </Box>
          </Box>

          <HStack spacing={3}>
            <Button
              variant="outline"
              bg={cardBg}
              leftIcon={<ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
              onClick={() => reloadAll?.() ?? refetch?.()}
              size="sm"
            >
              Làm mới
            </Button>

            {!isDeletedTab && canCreate && (
              <Button leftIcon={<PlusIcon className="h-5 w-5" />} colorScheme="green" onClick={openCreate} shadow="md">
                Thêm mới
              </Button>
            )}
          </HStack>
        </Stack>

        {/* FILTER & TABLE */}
        <Card bg={cardBg} shadow="sm" border="1px solid" borderColor={borderColor} borderRadius="xl" overflow="hidden">
          {/* Toolbar */}
          <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
            <Stack direction={{ base: "column", lg: "row" }} spacing={4} justify="space-between" align={{ lg: "center" }}>
              {/* Left: Filters */}
              <Stack direction={{ base: "column", md: "row" }} spacing={3} flex={1}>
                <InputGroup size="sm" maxW={{ base: "full", md: "320px" }}>
                  <InputLeftElement pointerEvents="none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Tìm danh mục..."
                    borderRadius="md"
                    value={filters.search ?? ""}
                    onChange={(e) => onFilterChange("search", e.target.value)}
                  />
                </InputGroup>

                <HStack spacing={2} overflowX="auto" pb={{ base: 2, md: 0 }}>
                  <Select
                    size="sm"
                    borderRadius="md"
                    w="160px"
                    minW="140px"
                    value={filters.type ?? ""}
                    onChange={(e) => onFilterChange("type", e.target.value)}
                    icon={<FunnelIcon />}
                    color="gray.600"
                  >
                    <option value="">Loại</option>
                    <option value="single">Single</option>
                    <option value="mix">Mix</option>
                  </Select>

                  <Select
                    size="sm"
                    borderRadius="md"
                    w="140px"
                    minW="120px"
                    value={filters.status ?? ""}
                    onChange={(e) => onFilterChange("status", e.target.value)}
                    color="gray.600"
                  >
                    <option value="">Trạng thái</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </HStack>
              </Stack>

              {/* Right: Selection + Bulk actions */}
              {selectedIds.length > 0 && (
                <HStack bg="blue.50" px={4} py={1} borderRadius="full" spacing={2} justify={{ base: "space-between", lg: "flex-end" }}>
                  <Text fontSize="sm" color="blue.700" fontWeight="medium">
                    Đã chọn {selectedIds.length}
                  </Text>

                  <Button size="xs" variant="ghost" colorScheme="blue" onClick={clearSelection}>
                    Bỏ chọn
                  </Button>

                  {!isDeletedTab ? (
                    <Button size="xs" colorScheme="red" onClick={bulkSoftDelete} isDisabled={!canDelete}>
                      Xoá (soft)
                    </Button>
                  ) : (
                    <>
                      <Button size="xs" colorScheme="green" onClick={bulkRestore} isDisabled={!canRestore}>
                        Khôi phục
                      </Button>
                      <Button size="xs" colorScheme="red" onClick={bulkHardDelete} isDisabled={!canDelete}>
                        Xoá vĩnh viễn
                      </Button>
                    </>
                  )}
                </HStack>
              )}
            </Stack>
          </Box>

          {/* Content */}
          <Box position="relative">
            {loading ? (
              <Box p={6}>
                <Stack spacing={4}>
                  {[1, 2, 3].map((i) => (
                    <HStack key={i} spacing={4}>
                      <Skeleton boxSize="12" borderRadius="md" />
                      <VStack align="start" flex={1}>
                        <Skeleton height="4" width="40%" />
                        <Skeleton height="3" width="20%" />
                      </VStack>
                    </HStack>
                  ))}
                </Stack>
              </Box>
            ) : categories.length === 0 ? (
              <Box py={16} textAlign="center">
                <Box mx="auto" bg="gray.100" borderRadius="full" p={4} w="fit-content" mb={4}>
                  <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                </Box>
                <Text color="gray.500" fontWeight="medium">Không tìm thấy danh mục nào.</Text>
                <Text fontSize="sm" color="gray.400">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.</Text>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="md">
                  <Thead
                    position="sticky"
                    top={0}
                    bg={stickyHeaderBg}
                    zIndex={10}
                    sx={{ backdropFilter: "blur(12px)" }}
                    boxShadow="0 1px 2px rgba(0,0,0,0.05)"
                  >
                    <Tr>
                      <Th w="50px" textAlign="center">
                        <Checkbox
                          isChecked={allChecked}
                          isIndeterminate={someChecked}
                          onChange={() => (allChecked ? clearSelection() : selectAll(idsOnPage))}
                          colorScheme="blue"
                        />
                      </Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">Tên</Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">Loại</Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">Trạng thái</Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="right">Thao tác</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {categories.map((c) => {
                      const id = String(c?._id);
                      const selected = selectedIds.includes(id);

                      return (
                        <Tr key={id} bg={selected ? "blue.50" : "transparent"} _hover={{ bg: rowHoverBg }} transition="background 0.2s">
                          <Td textAlign="center">
                            <Checkbox isChecked={selected} onChange={() => toggleSelect(id)} colorScheme="blue" />
                          </Td>

                          <Td py={3}>
                            <Box minW="220px" maxW="520px">
                              <Text fontWeight="600" fontSize="sm" color="gray.700" noOfLines={1} title={c?.name}>
                                {c?.name}
                              </Text>
                              <Text fontSize="xs" color="gray.500" fontFamily="mono" noOfLines={1}>
                                {c?.slug || "-"}
                              </Text>
                              {c?.description ? (
                                <Text fontSize="xs" color="gray.500" noOfLines={2} mt={1}>
                                  {c.description}
                                </Text>
                              ) : null}
                            </Box>
                          </Td>

                          <Td>
                            <Badge variant="subtle" borderRadius="full">
                              {c?.type === "mix" ? "MIX" : "SINGLE"}
                            </Badge>
                          </Td>

                          <Td>
                            <Badge px={2.5} py={0.5} borderRadius="full" fontSize="xs" colorScheme={c?.isActive ? "green" : "gray"} variant="subtle">
                              {c?.isActive ? "ACTIVE" : "INACTIVE"}
                            </Badge>
                          </Td>

                          <Td textAlign="right">
                            <HStack justify="flex-end" spacing={1}>
                              {!isDeletedTab ? (
                                <>
                                  {canUpdate && (
                                    <Tooltip label="Sửa" hasArrow placement="top">
                                      <IconButton
                                        icon={<PencilSquareIcon className="h-4 w-4" />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="blue"
                                        borderRadius="md"
                                        aria-label="Edit"
                                        onClick={() => openEdit(c)}
                                      />
                                    </Tooltip>
                                  )}

                                  {canDelete && (
                                    <Tooltip label="Xoá (đưa vào thùng rác)" hasArrow placement="top">
                                      <IconButton
                                        icon={<TrashIcon className="h-4 w-4" />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        borderRadius="md"
                                        aria-label="Delete"
                                        onClick={() => onSoftDelete(c)}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              ) : (
                                <>
                                  {canRestore && (
                                    <Tooltip label="Khôi phục" hasArrow placement="top">
                                      <IconButton
                                        icon={<ArrowUturnLeftIcon className="h-4 w-4" />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="green"
                                        borderRadius="md"
                                        aria-label="Restore"
                                        onClick={() => onRestore(c)}
                                      />
                                    </Tooltip>
                                  )}

                                  {canDelete && (
                                    <Tooltip label="Xoá vĩnh viễn" hasArrow placement="top">
                                      <IconButton
                                        icon={<TrashIcon className="h-4 w-4" />}
                                        size="sm"
                                        variant="solid"
                                        colorScheme="red"
                                        borderRadius="md"
                                        aria-label="Hard delete"
                                        onClick={() => onHardDelete(c)}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>

          {/* Footer / Pagination */}
          <Box px={6} py={4} borderTop="1px solid" borderColor={borderColor}>
            <Pagination
              page={page}
              limit={limit}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={setPage}
              onLimitChange={(n) => {
                setLimit(n);
                setPage(1);
              }}
              limitOptions={[5, 10, 20, 50]}
              siblingCount={1}
              showJump
              isDisabled={loading}
            />
          </Box>
        </Card>
      </Box>

      {/* MODAL FORM */}
      <Modal isOpen={isFormOpen} onClose={closeForm} title={editing ? "Cập nhật danh mục" : "Thêm mới danh mục"} size="xl" isCentered>
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Tên danh mục</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} borderRadius="xl" />
          </FormControl>

          <FormControl>
            <FormLabel>Loại</FormLabel>
            <Select value={type} onChange={(e) => setType(e.target.value)} borderRadius="xl">
              <option value="single">Single</option>
              <option value="mix">Mix</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Mô tả</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} borderRadius="xl" rows={3} />
          </FormControl>

          <FormControl>
            <HStack justify="space-between">
              <FormLabel mb={0}>Kích hoạt</FormLabel>
              <Switch isChecked={isActive} onChange={(e) => setIsActive(e.target.checked)} colorScheme="green" />
            </HStack>
          </FormControl>

          <HStack justify="flex-end">
            <Button variant="ghost" onClick={closeForm}>Huỷ</Button>
            <Button colorScheme="green" onClick={onSubmit}>Lưu</Button>
          </HStack>
        </Stack>
      </Modal>
    </Box>
  );
}

AdminCategoryPage.propTypes = {
  screens: PropTypes.array,
  userPermissions: PropTypes.array,
};
