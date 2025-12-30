import { useMemo, useState } from "react";
import { useAdminCategory } from "../../hooks/adminCategory";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
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
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";

// ✅ thêm ở đây
const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự lạ
    .replace(/\s+/g, "-") // space -> -
    .replace(/-+/g, "-"); // gộp --

export default function AdminCategoryPage() {
  const {
    categories,
    loading,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategory();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const title = useMemo(
    () => (editing ? "Sửa danh mục" : "Thêm danh mục"),
    [editing]
  );

  const closeModal = () => {
    setEditing(null);
    setName("");
    onClose();
  };

  const openCreate = () => {
    setEditing(null);
    setName("");
    onOpen();
  };

  const openEdit = (c) => {
    setEditing(c);
    setName(c?.name || "");
    onOpen();
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast({
        title: "Tên danh mục không được để trống",
        status: "warning",
        duration: 1800,
        isClosable: true,
        position: "top",
      });
      return;
    }

    // ✅ payload có slug
    const payload = { name: trimmed, slug: slugify(trimmed) };

    try {
      if (editing) {
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
      {/* ===== HEADER + ACTION ===== */}
      <Flex
        direction={{ base: "column", md: "row" }}
        gap={4}
        align={{ md: "center" }}
        justify="space-between"
        mb={6}
      >
        <Box>
          <Heading size="lg" color="gray.800">
            Quản lý danh mục
          </Heading>
          <Text mt={1} fontSize="sm" color="gray.500">
            Quản lý các danh mục sản phẩm trong hệ thống
          </Text>
        </Box>

        <HStack spacing={3}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm danh mục..."
            w={{ base: "full", md: "320px" }}
            bg="white"
            borderRadius="xl"
            focusBorderColor="green.500"
          />
          <Button
            onClick={openCreate}
            leftIcon={<AddIcon />}
            colorScheme="green"
            borderRadius="xl"
          >
            Thêm danh mục
          </Button>
        </HStack>
      </Flex>

      {/* ===== TABLE ===== */}
      <Box bg="white" borderRadius="2xl" boxShadow="sm" borderWidth="1px">
        {loading ? (
          <Flex p={6} align="center" gap={3} color="gray.500">
            <Spinner size="sm" />
            <Text fontSize="sm">Đang tải dữ liệu...</Text>
          </Flex>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th w="80px">#</Th>
                  <Th>Tên danh mục</Th>
                  <Th textAlign="right">Hành động</Th>
                </Tr>
              </Thead>

              <Tbody>
                {categories.length === 0 ? (
                  <Tr>
                    <Td colSpan={3}>
                      <Box py={10} textAlign="center" color="gray.500">
                        Không có danh mục
                      </Box>
                    </Td>
                  </Tr>
                ) : (
                  categories.map((c, index) => (
                    <Tr key={c._id} _hover={{ bg: "gray.50" }}>
                      <Td color="gray.500" fontSize="sm">
                        {(page - 1) * 5 + index + 1}
                      </Td>

                      <Td fontWeight="semibold" color="gray.800">
                        {c.name}
                      </Td>

                      <Td textAlign="right">
                        <HStack justify="flex-end" spacing={2}>
                          <IconButton
                            aria-label="Sửa"
icon={<EditIcon />}
                            size="sm"
                            variant="outline"
                            colorScheme="yellow"
                            onClick={() => openEdit(c)}
                          />
                          <IconButton
                            aria-label="Xoá"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            onClick={() => handleDelete(c._id)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <Flex justify="flex-end" gap={1} p={4} borderTopWidth="1px">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = page === p;

              return (
                <Button
                  key={p}
                  size="sm"
                  minW="36px"
                  borderRadius="lg"
                  onClick={() => setPage(p)}
                  colorScheme={active ? "green" : "gray"}
                  variant={active ? "solid" : "outline"}
                >
                  {p}
                </Button>
              );
            })}
          </Flex>
        )}
      </Box>

      {/* ===== MODAL ===== */}
      <Modal isOpen={isOpen} onClose={closeModal} isCentered>
        <ModalOverlay bg="blackAlpha.400" />
        <ModalContent borderRadius="2xl">
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={3}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên danh mục"
                borderRadius="xl"
                focusBorderColor="green.500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={2}>
              <Button variant="ghost" onClick={closeModal}>
                Huỷ
              </Button>
              <Button colorScheme="green" onClick={handleSave}>
                Lưu
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
