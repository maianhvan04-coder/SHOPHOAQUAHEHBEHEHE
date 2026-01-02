/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import { useMemo } from "react";
import Pagination from "~/components/common/Pagination";
import Modal from "~/components/common/Modal";
import PageHeader from "~/components/layout/admin/PageHeader";
import ProductsTabs from "./ProductsTabs";
import ProductForm from "./ProductForm";

import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Skeleton,
  SkeletonCircle,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Tooltip,
  Image,
  useBreakpointValue,
  useColorModeValue,
  SimpleGrid,
  VStack,
  Divider,
  Tag,
} from "@chakra-ui/react";

import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  StarIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

import { canAccessAction } from "~/shared/utils/ability";

// Helper function
function computePermission({ screens, userPermissions, resourceKey, actionKey }) {
  const screen = (screens || []).find((s) => s?.key === resourceKey) || null;
  if (!screen) return false;
  return canAccessAction(userPermissions, screen, actionKey);
}

// --- SUB-COMPONENTS ---

// 1. Mobile Card Item (Hiển thị dạng lưới trên điện thoại)
const MobileProductCard = ({
  p,
  selected,
  onToggle,
  onEdit,
  onDelete,
  onRestore,
  isDeletedTab,
  disabled,
  categoryName,
  thumb,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={selected ? "blue.400" : borderColor}
      borderRadius="xl"
      overflow="hidden"
      shadow="sm"
      transition="all 0.2s"
      _active={{ transform: "scale(0.98)" }}
    >
      <HStack p={3} spacing={3} align="start">
        <Checkbox isChecked={selected} onChange={onToggle} mt={1} size="lg" colorScheme="blue" />
        <Box
          w="80px"
          h="80px"
          borderRadius="lg"
          overflow="hidden"
          bg="gray.100"
          flexShrink={0}
          border="1px solid"
          borderColor="gray.100"
        >
          {thumb ? (
            <Image src={thumb} w="full" h="full" objectFit="cover" />
          ) : (
            <Box w="full" h="full" display="grid" placeItems="center" fontSize="xs" color="gray.400">
              No Img
            </Box>
          )}
        </Box>
        <VStack align="start" spacing={1} flex={1} minW={0}>
          <HStack width="full" justify="space-between">
            <Text fontWeight="bold" noOfLines={1} fontSize="sm">
              {p.name}
            </Text>
            {p.isFeatured && <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {categoryName}
          </Text>
          <Text fontWeight="bold" color="blue.600" fontSize="sm">
            {Number(p.price || 0).toLocaleString("vi-VN")} đ
          </Text>
          <HStack spacing={2} mt={1}>
            <Badge fontSize="10px" colorScheme={p.isActive ? "green" : "red"}>
              {p.isActive ? "Active" : "Inactive"}
            </Badge>
            <Badge fontSize="10px" variant="outline">
              Kho: {p.stock}
            </Badge>
          </HStack>
        </VStack>
      </HStack>

      <Divider />

      <HStack p={2} justify="space-between" bg={useColorModeValue("gray.50", "whiteAlpha.50")}>
        <Text fontSize="xs" color="gray.500" px={2}>
          Đã bán: {p.sold || 0}
        </Text>
        <HStack spacing={0}>
          {!isDeletedTab ? (
            <>
              <IconButton
                icon={<PencilSquareIcon className="h-4 w-4" />}
                variant="ghost"
                size="sm"
                aria-label="Edit"
                onClick={() => onEdit?.(p)}
                isDisabled={disabled}
              />
              <IconButton
                icon={<TrashIcon className="h-4 w-4" />}
                variant="ghost"
                colorScheme="red"
                size="sm"
                aria-label="Delete"
                onClick={() => onDelete?.(p)}
                isDisabled={disabled}
              />
            </>
          ) : (
            <Button
              leftIcon={<ArrowUturnLeftIcon className="h-4 w-4" />}
              size="xs"
              colorScheme="green"
              variant="solid"
              onClick={() => onRestore?.(p)}
              isDisabled={disabled}
            >
              Khôi phục
            </Button>
          )}
        </HStack>
      </HStack>
    </Card>
  );
};

// --- MAIN COMPONENT ---

export default function ProductsView({
  tab = "active",
  onTabChange,
  onRestoreProduct,

  products = [],
  filteredProducts = [],
  pagination = null,
  filters,
  categories = [],
  isLoading = false,

  screens = [],
  userPermissions = [],

  selectedIds = [],
  toggleSelect,
  selectAll,
  clearSelection,

  onPageChange,
  onLimitChange,

  selectedProduct,
  productToDelete,
  isFormOpen,
  closeForm,
  isDeleteOpen,
  closeDelete,
  onAddProduct,
  onEditProduct,
  onDeleteClick,
  onSubmitProduct,
  onConfirmDelete,
  onFilterChange,
  onRefresh,

  rowBusy = {},

  activeCount = 0,
  deletedCount = 0,
}) {
  const isDeletedTab = tab === "deleted";

  // Colors & Theme Styles
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const thColor = useColorModeValue("gray.500", "gray.400");
  const rowHoverBg = useColorModeValue("gray.50", "whiteAlpha.100");
  const stickyHeaderBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");

  const displayMode = useBreakpointValue({ base: "mobile", lg: "desktop" });

  // Permissions
  const canCreate = computePermission({ screens, userPermissions, resourceKey: "product", actionKey: "create" });
  const canUpdate = computePermission({ screens, userPermissions, resourceKey: "product", actionKey: "update" });
  const canDelete = computePermission({ screens, userPermissions, resourceKey: "product", actionKey: "delete" });
  const canRestore = computePermission({ screens, userPermissions, resourceKey: "product", actionKey: "restore" });

  // Helpers
  const categoryList = useMemo(() => {
    if (Array.isArray(categories)) return categories;
    return categories?.data?.items || categories?.items || categories?.DT?.categories || [];
  }, [categories]);

  const categoryNameById = useMemo(() => {
    const map = new Map();
    categoryList.forEach((c) => map.set(String(c._id), c?.name || "-"));
    return map;
  }, [categoryList]);

  const idsOnPage = useMemo(() => (filteredProducts || []).map((p) => p?._id).filter(Boolean), [filteredProducts]);
  const allChecked = idsOnPage.length > 0 && idsOnPage.every((id) => selectedIds.includes(id));
  const someChecked = idsOnPage.some((id) => selectedIds.includes(id)) && !allChecked;

  // Pagination data
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const total = pagination?.total ?? filteredProducts.length ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const FeaturedBadge = ({ p }) => {
    if (!p?.isFeatured) return null;
    return (
      <Tooltip label={`Thứ hạng nổi bật: ${p?.featuredRank ?? 0}`}>
        <Tag size="sm" colorScheme="yellow" borderRadius="full" px={2}>
          <StarIcon className="h-3 w-3 fill-current mr-1" />
          VIP
        </Tag>
      </Tooltip>
    );
  };

  return (
    <Box bg={bgMain} minH="100vh" p={{ base: 2, md: 6 }}>
      <Box maxW="1600px" mx="auto">
        {/* --- HEADER SECTION --- */}
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "start", md: "center" }}
          mb={6}
          spacing={4}
        >
          <Box>
            <PageHeader
              title="Sản phẩm"
              description={isDeletedTab ? "Quản lý dữ liệu thùng rác." : "Quản lý kho hàng và danh sách sản phẩm."}
              // Custom header styling overrides if needed, otherwise use default
            />
            <Box mt={4}>
              <ProductsTabs tab={tab} onChangeTab={onTabChange} activeCount={activeCount} deletedCount={deletedCount} />
            </Box>
          </Box>

          <HStack spacing={3}>
            <Button
              variant="outline"
              bg={cardBg}
              leftIcon={<ArrowPathIcon className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
              onClick={onRefresh}
              size="sm"
            >
              Làm mới
            </Button>
            {!isDeletedTab && canCreate && (
              <Button leftIcon={<PlusIcon className="h-5 w-5" />} colorScheme="blue" onClick={onAddProduct} shadow="md">
                Thêm mới
              </Button>
            )}
          </HStack>
        </Stack>

        {/* --- FILTER & TABLE CARD --- */}
        <Card
            bg={cardBg}
            shadow="sm"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="xl"
            overflow="hidden"
        >
          {/* Toolbar */}
          <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
            <Stack direction={{ base: "column", lg: "row" }} spacing={4} justify="space-between">
              {/* Left: Filters */}
              <Stack direction={{ base: "column", md: "row" }} spacing={3} flex={1}>
                <InputGroup size="sm" maxW={{ base: "full", md: "320px" }}>
                  <InputLeftElement pointerEvents="none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    borderRadius="md"
                    value={filters?.search ?? ""}
                    onChange={(e) => onFilterChange?.("search", e.target.value)}
                  />
                </InputGroup>

                <HStack spacing={2} overflowX="auto" pb={{ base: 2, md: 0 }}>
                    <Select
                        size="sm"
                        borderRadius="md"
                        w="160px"
                        minW="140px"
                        value={filters?.category ?? ""}
                        onChange={(e) => onFilterChange?.("category", e.target.value)}
                        icon={<FunnelIcon />}
                        color="gray.600"
                    >
                        <option value="">Danh mục</option>
                        {categoryList.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                        ))}
                    </Select>

                    <Select
                        size="sm"
                        borderRadius="md"
                        w="140px"
                        minW="120px"
                        value={filters?.status ?? ""}
                        onChange={(e) => onFilterChange?.("status", e.target.value)}
                        color="gray.600"
                    >
                        <option value="">Trạng thái</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </Select>
                     <Select
                        size="sm"
                        borderRadius="md"
                        w="140px"
                        minW="120px"
                        value={filters?.featured ?? ""}
                        onChange={(e) => onFilterChange?.("featured", e.target.value)}
                        color="gray.600"
                    >
                        <option value="">Độ nổi bật</option>
                        <option value="true">Nổi bật</option>
                        <option value="false">Thường</option>
                    </Select>
                </HStack>
              </Stack>

              {/* Right: Selection Actions */}
              {selectedIds.length > 0 && (
                <HStack
                  bg="blue.50"
                  px={4}
                  py={1}
                  borderRadius="full"
                  justify={{ base: "space-between", lg: "flex-end" }}
                >
                  <Text fontSize="sm" color="blue.700" fontWeight="medium">
                    Đã chọn {selectedIds.length}
                  </Text>
                  <Button size="xs" variant="ghost" colorScheme="blue" onClick={clearSelection}>
                    Bỏ chọn
                  </Button>
                </HStack>
              )}
            </Stack>
          </Box>

          {/* Content Area */}
          <Box position="relative">
            {isLoading && filteredProducts.length === 0 ? (
                // Initial Loading State
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
            ) : filteredProducts.length === 0 ? (
                // Empty State
                <Box py={16} textAlign="center">
                    <Box mx="auto" bg="gray.100" borderRadius="full" p={4} w="fit-content" mb={4}>
                        <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                    </Box>
                    <Text color="gray.500" fontWeight="medium">Không tìm thấy sản phẩm nào.</Text>
                    <Text fontSize="sm" color="gray.400">Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm.</Text>
                </Box>
            ) : displayMode === "desktop" ? (
              // DESKTOP TABLE VIEW
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
                          onChange={() => selectAll?.(idsOnPage)}
                          colorScheme="blue"
                        />
                      </Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">Sản phẩm</Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">Danh mục</Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" isNumeric>Giá bán</Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">Kho hàng</Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">Trạng thái</Th>
                      <Th color={thColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider" textAlign="right">Thao tác</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredProducts.map((p) => {
                      const thumb = p?.image?.url || p?.images?.[0]?.url || "";
                      const disabled = !!rowBusy?.[p._id];

                      return (
                        <Tr
                          key={p._id}
                          bg={selectedIds.includes(p._id) ? "blue.50" : "transparent"}
                          _hover={{ bg: rowHoverBg }}
                          transition="background 0.2s"
                        >
                          <Td textAlign="center">
                            <Checkbox
                              isChecked={selectedIds.includes(p._id)}
                              onChange={() => toggleSelect?.(p._id)}
                              colorScheme="blue"
                            />
                          </Td>

                          <Td py={3}>
                            <HStack spacing={4}>
                              <Box
                                w="56px"
                                h="56px"
                                borderRadius="lg"
                                border="1px solid"
                                borderColor={borderColor}
                                overflow="hidden"
                                bg="white"
                                flexShrink={0}
                              >
                                {thumb ? (
                                  <Image src={thumb} w="full" h="full" objectFit="cover" />
                                ) : (
                                  <Box w="full" h="full" display="grid" placeItems="center" bg="gray.50">
                                    <Text fontSize="xs" color="gray.400">No img</Text>
                                  </Box>
                                )}
                              </Box>
                              <Box minW="180px" maxW="300px">
                                <HStack mb={1}>
                                    <Text fontWeight="600" fontSize="sm" color="gray.700" noOfLines={1} title={p.name}>
                                    {p.name}
                                    </Text>
                                    <FeaturedBadge p={p} />
                                </HStack>
                                <Text fontSize="xs" color="gray.500" fontFamily="mono">
                                  {p.slug}
                                </Text>
                              </Box>
                            </HStack>
                          </Td>

                          <Td>
                             <Tag size="sm" variant="subtle" colorScheme="gray">
                                {p?.category?.name || categoryNameById.get(String(p?.categoryId)) || "---"}
                             </Tag>
                          </Td>

                          <Td isNumeric>
                            <Text fontWeight="bold" fontSize="sm" color="gray.800">
                              {Number(p.price || 0).toLocaleString("vi-VN")}
                              <Text as="span" fontSize="xs" color="gray.500" ml={1}>đ</Text>
                            </Text>
                          </Td>

                          <Td>
                            <VStack align="start" spacing={1}>
                                <Text fontSize="xs" fontWeight="medium">
                                    Tồn: <Text as="span" color={p.stock > 0 ? "green.600" : "red.500"}>{p.stock ?? 0}</Text>
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                    Đã bán: {p.sold ?? 0}
                                </Text>
                            </VStack>
                          </Td>

                          <Td>
                            <Badge
                              px={2.5}
                              py={0.5}
                              borderRadius="full"
                              fontSize="xs"
                              textTransform="capitalize"
                              colorScheme={p.isActive ? "green" : "red"}
                              variant="subtle"
                            >
                              {p.isActive ? "Hoạt động" : "Tạm tắt"}
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
                                        onClick={() => onEditProduct?.(p)}
                                        isDisabled={disabled}
                                      />
                                    </Tooltip>
                                  )}
                                  {canDelete && (
                                    <Tooltip label="Xoá" hasArrow placement="top">
                                      <IconButton
                                        icon={<TrashIcon className="h-4 w-4" />}
                                        size="sm"
                                        variant="ghost"
                                        colorScheme="red"
                                        borderRadius="md"
                                        aria-label="Delete"
                                        onClick={() => onDeleteClick?.(p)}
                                        isDisabled={disabled}
                                      />
                                    </Tooltip>
                                  )}
                                </>
                              ) : (
                                canRestore && (
                                  <Tooltip label="Khôi phục" hasArrow placement="top">
                                    <IconButton
                                      icon={<ArrowUturnLeftIcon className="h-4 w-4" />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="green"
                                      borderRadius="md"
                                      aria-label="Restore"
                                      onClick={() => onRestoreProduct?.(p)}
                                      isDisabled={disabled}
                                    />
                                  </Tooltip>
                                )
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              // MOBILE GRID VIEW
              <Box p={4} bg="gray.50">
                 <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                    {filteredProducts.map(p => {
                        const thumb = p?.image?.url || p?.images?.[0]?.url || "";
                        const categoryName = p?.category?.name || categoryNameById.get(String(p?.categoryId)) || "---";
                        const disabled = !!rowBusy?.[p._id];
                        
                        return (
                            <MobileProductCard 
                                key={p._id}
                                p={p}
                                thumb={thumb}
                                categoryName={categoryName}
                                selected={selectedIds.includes(p._id)}
                                onToggle={() => toggleSelect?.(p._id)}
                                onEdit={onEditProduct}
                                onDelete={onDeleteClick}
                                onRestore={onRestoreProduct}
                                isDeletedTab={isDeletedTab}
                                disabled={disabled}
                            />
                        )
                    })}
                 </SimpleGrid>
              </Box>
            )}
          </Box>

          {/* Footer / Pagination */}
          {!!pagination && (
            <Box px={6} py={4} borderTop="1px solid" borderColor={borderColor}>
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
      </Box>

      {/* --- MODALS --- */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={closeForm} 
        title={selectedProduct ? "Cập nhật sản phẩm" : "Thêm mới sản phẩm"}
        size="2xl" // Làm modal to hơn chút cho dễ nhập
      >
        <ProductForm 
            product={selectedProduct} 
            categories={categoryList} 
            onSubmit={onSubmitProduct} 
            onCancel={closeForm} 
        />
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={closeDelete} title="Xác nhận xoá" isCentered>
        <Box p={2}>
          <VStack spacing={4} align="center" mb={6}>
            <Box p={3} bg="red.50" borderRadius="full">
                <TrashIcon className="h-8 w-8 text-red-500" />
            </Box>
            <Box textAlign="center">
                <Text fontWeight="bold" fontSize="lg">Xoá sản phẩm?</Text>
                <Text color="gray.500" fontSize="sm" mt={2}>
                    Bạn sắp xoá <Text as="span" fontWeight="bold" color="gray.800">"{productToDelete?.name}"</Text>. 
                    <br />Hành động này sẽ chuyển sản phẩm vào thùng rác.
                </Text>
            </Box>
          </VStack>
          
          <HStack spacing={3} justify="center" w="full">
            <Button variant="ghost" onClick={closeDelete} w="full">
              Huỷ bỏ
            </Button>
            <Button colorScheme="red" onClick={onConfirmDelete} w="full">
              Đồng ý xoá
            </Button>
          </HStack>
        </Box>
      </Modal>
    </Box>
  );
}

ProductsView.propTypes = {
  tab: PropTypes.oneOf(["active", "deleted"]),
  onTabChange: PropTypes.func,
  onRestoreProduct: PropTypes.func,

  products: PropTypes.array,
  filteredProducts: PropTypes.array,
  pagination: PropTypes.object,
  filters: PropTypes.object,
  categories: PropTypes.any,
  isLoading: PropTypes.bool,

  screens: PropTypes.array,
  userPermissions: PropTypes.array,

  selectedIds: PropTypes.array,
  toggleSelect: PropTypes.func,
  selectAll: PropTypes.func,
  clearSelection: PropTypes.func,

  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,

  selectedProduct: PropTypes.object,
  productToDelete: PropTypes.object,
  isFormOpen: PropTypes.bool,
  closeForm: PropTypes.func,
  isDeleteOpen: PropTypes.bool,
  closeDelete: PropTypes.func,
  onAddProduct: PropTypes.func,
  onEditProduct: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onSubmitProduct: PropTypes.func,
  onConfirmDelete: PropTypes.func,
  onFilterChange: PropTypes.func,
  onRefresh: PropTypes.func,

  rowBusy: PropTypes.object,

  activeCount: PropTypes.number,
  deletedCount: PropTypes.number,
};