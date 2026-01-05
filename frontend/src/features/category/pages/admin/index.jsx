import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useAdminCategory } from "../../hooks/adminCategory";
import Pagination from "~/components/common/Pagination";

import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  Select,
  useDisclosure,
  useToast,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";

import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { canAccessAction } from "~/shared/utils/ability";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "~/app/providers/AuthProvides";

// slugify
const slugify = (str) =>
  String(str || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Helper: check permission giống ProductsView
function computePermission({ screens, userPermissions, resourceKey, actionKey }) {
  const screen = (screens || []).find((s) => s?.key === resourceKey) || null;
  if (!screen) return false;
  return canAccessAction(userPermissions, screen, actionKey);
}

export default function AdminCategoryPage({ screens: screensProp, userPermissions: permsProp }) {
  // ✅ Hooks chỉ được gọi trong component
  const outlet = useOutletContext?.() || {};
  const auth = useAuth?.() || {};

  // ✅ ưu tiên props, fallback qua context/auth
  const screens = screensProp ?? outlet?.screens ?? [];
  const userPermissions = permsProp ?? auth?.permissions ?? auth?.permissions ?? [];

  const {
    categories,
    loading,
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    totalItems,
    totalPages,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategory();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const textMuted = useColorModeValue("gray.500", "gray.400");

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

  const showActionsCol = canUpdate || canDelete;

  const [editing, setEditing] = useState(null);

  // ===== FORM STATE =====
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("single"); // single | mix
  const [isActive, setIsActive] = useState(true);

  const title = useMemo(() => (editing ? "Sửa danh mục" : "Thêm danh mục"), [editing]);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setType("single");
    setIsActive(true);
  };

  const closeModal = () => {
    resetForm();
    onClose();
  };

  const openCreate = () => {
    if (!canCreate) {
      toast({
        title: "Bạn không có quyền tạo danh mục",
        status: "warning",
        duration: 1800,
        isClosable: true,
        position: "top",
      });
      return;
    }
    resetForm();
    onOpen();
  };

  const openEdit = (c) => {
    if (!canUpdate) {
      toast({
        title: "Bạn không có quyền sửa danh mục",
        status: "warning",
        duration: 1800,
        isClosable: true,
        position: "top",
      });
      return;
    }
    setEditing(c);
    setName(c?.name || "");
    setDescription(c?.description || "");
    setType(c?.type || "single");
    setIsActive(Boolean(c?.isActive));
    onOpen();
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast({
        title: "Tên danh mục không được để trống",
        status: "warning",
        duration: 1800,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (editing?._id && !canUpdate) {
      toast({
        title: "Bạn không có quyền cập nhật danh mục",
        status: "warning",
        duration: 1800,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (!editing?._id && !canCreate) {
      toast({
        title: "Bạn không có quyền tạo danh mục",
        status: "warning",
        duration: 1800,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const payload = {
      name: trimmedName,
      slug: slugify(trimmedName),
      description: description?.trim() || "",
      type,
      isActive: Boolean(isActive),
    };

    try {
      if (editing?._id) {
        await updateCategory(editing._id, payload);
        toast({
          title: "Cập nhật danh mục thành công",
          status: "success",
          duration: 1600,
          isClosable: true,
          position: "top",
        });
      } else {
        await createCategory(payload);
        toast({
          title: "Tạo danh mục thành công",
          status: "success",
          duration: 1600,
          isClosable: true,
          position: "top",
        });
      }
      closeModal();
    } catch (err) {
      toast({
        title: "Có lỗi xảy ra",
        description: err?.message || "Vui lòng thử lại",
        status: "error",
        duration: 2200,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      toast({
        title: "Bạn không có quyền xoá danh mục",
        status: "warning",
        duration: 1800,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const ok = window.confirm("Xoá danh mục này?");
    if (!ok) return;

    try {
      await deleteCategory(id);
      toast({
        title: "Đã xoá danh mục",
        status: "success",
        duration: 1600,
        isClosable: true,
        position: "top",
      });
    } catch (err) {
      toast({
        title: "Xoá thất bại",
        description: err?.message || "Vui lòng thử lại",
        status: "error",
        duration: 2200,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Container maxW="7xl" py={6}>
      {/* HEADER */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        align={{ md: "center" }}
        justify="space-between"
        mb={6}
      >
        <Box>
          <Heading size="lg">Quản lý danh mục</Heading>
          <Text mt={1} fontSize="sm" color={textMuted}>
            Quản lý các danh mục sản phẩm trong hệ thống
          </Text>
        </Box>

        <HStack spacing={3}>
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm danh mục..."
            w={{ base: "full", md: "320px" }}
            bg={cardBg}
            borderRadius="xl"
          />

          {canCreate && (
            <Button onClick={openCreate} leftIcon={<AddIcon />} colorScheme="green" borderRadius="xl">
              Thêm danh mục
            </Button>
          )}
        </HStack>
      </Flex>

      {/* TABLE CARD */}
      <Box bg={cardBg} borderRadius="2xl" boxShadow="sm" border="1px solid" borderColor={borderColor}>
        {loading ? (
          <Flex p={6} align="center" gap={3} color={textMuted}>
            <Spinner size="sm" />
            <Text fontSize="sm">Đang tải dữ liệu...</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg={headBg}>
                <Tr>
                  <Th w="80px">#</Th>
                  <Th>Tên</Th>
                  <Th>Loại</Th>
                  <Th>Trạng thái</Th>
                  {showActionsCol && <Th textAlign="right">Hành động</Th>}
                </Tr>
              </Thead>

              <Tbody>
                {categories?.length === 0 ? (
                  <Tr>
                    <Td colSpan={showActionsCol ? 5 : 4}>
                      <Box py={10} textAlign="center" color={textMuted}>
                        Không có danh mục
                      </Box>
                    </Td>
                  </Tr>
                ) : (
                  categories.map((c, index) => (
                    <Tr key={c._id} _hover={{ bg: headBg }}>
                      <Td color={textMuted} fontSize="sm">
                        {(page - 1) * limit + index + 1}
                      </Td>

                      <Td fontWeight="semibold">{c.name}</Td>

                      <Td fontSize="sm" color={textMuted}>
                        {c.type === "mix" ? "Mix" : "Single"}
                      </Td>

                      <Td>
                        {c.isActive ? (
                          <Badge colorScheme="green" borderRadius="md">
                            Active
                          </Badge>
                        ) : (
                          <Badge colorScheme="gray" borderRadius="md">
                            Inactive
                          </Badge>
                        )}
                      </Td>

                      {showActionsCol && (
                        <Td textAlign="right">
                          <HStack justify="flex-end" spacing={2}>
                            {canUpdate && (
                              <Tooltip label="Sửa" hasArrow placement="top">
                                <IconButton
                                  aria-label="Sửa"
                                  icon={<EditIcon />}
                                  size="sm"
                                  variant="outline"
                                  colorScheme="yellow"
                                  onClick={() => openEdit(c)}
                                />
                              </Tooltip>
                            )}

                            {canDelete && (
                              <Tooltip label="Xoá" hasArrow placement="top">
                                <IconButton
                                  aria-label="Xoá"
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  variant="outline"
                                  colorScheme="red"
                                  onClick={() => handleDelete(c._id)}
                                />
                              </Tooltip>
                            )}
                          </HStack>
                        </Td>
                      )}
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}

        {!loading && (
          <Box borderTopWidth="1px" borderColor={borderColor}>
            <Pagination
              page={page}
              limit={limit}
              totalItems={totalItems}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
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
        )}
      </Box>

      {/* MODAL */}
      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Tên danh mục</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Trái cây nhập khẩu"
                  borderRadius="xl"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
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
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn về danh mục..."
                  borderRadius="xl"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <HStack justify="space-between">
                  <FormLabel mb={0}>Kích hoạt</FormLabel>
                  <Switch
                    isChecked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    colorScheme="green"
                  />
                </HStack>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={closeModal}>
                Huỷ
              </Button>
              <Button
                colorScheme="green"
                onClick={handleSave}
                isDisabled={editing?._id ? !canUpdate : !canCreate}
              >
                Lưu
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

AdminCategoryPage.propTypes = {
  screens: PropTypes.array,
  userPermissions: PropTypes.array,
};
