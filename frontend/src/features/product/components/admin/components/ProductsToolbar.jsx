import PropTypes from "prop-types";
import { useState, useCallback } from "react";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AppliedFilters from "./AppliedFilters";

export default function ProductsToolbar({
  filters,
  onFilterChange,
  categoryList,
  categoryNameById,

  selectedIds,
  clearSelection,

  isDeletedTab,
  isLoading,

  canUpdate,
  canDelete,

  bulkSetStatus,
  openBulkDelete,
}) {
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.800");

  const [bulkAction, setBulkAction] = useState("");

  const clearAllFilters = () => {
    onFilterChange?.("search", "");
    onFilterChange?.("category", "");
    onFilterChange?.("status", "");
    onFilterChange?.("featured", "");
  };

  const handleApplyBulkAction = useCallback(() => {
    if (!bulkAction) return;

    if (bulkAction === "active") {
      if (canUpdate) bulkSetStatus?.(true);
    }
    if (bulkAction === "inactive") {
      if (canUpdate) bulkSetStatus?.(false);
    }
    if (bulkAction === "delete") {
      if (canDelete) openBulkDelete?.();
    }

    setBulkAction("");
  }, [bulkAction, canUpdate, canDelete, bulkSetStatus, openBulkDelete]);

  return (
    <Box p={{ base: 3.5, md: 4 }} borderBottom="1px solid" borderColor={borderColor}>
      <Stack direction={{ base: "column", lg: "row" }} spacing={3.5} justify="space-between" align="stretch">
        {/* LEFT */}
        <Stack spacing={3} flex={1} minW={0}>
          <Stack direction={{ base: "column", md: "row" }} spacing={3} align="stretch">
            <InputGroup size="sm" maxW={{ base: "full", md: "420px" }}>
              <InputLeftElement pointerEvents="none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </InputLeftElement>

              <Input
                placeholder="Tìm kiếm sản phẩm..."
                borderRadius="xl"
                value={filters?.search ?? ""}
                onChange={(e) => onFilterChange?.("search", e.target.value)}
                bg={useColorModeValue("white", "gray.900")}
                borderColor={borderColor}
              />

              {!!(filters?.search ?? "").trim() && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear search"
                    icon={<XMarkIcon className="h-4 w-4" />}
                    size="xs"
                    variant="ghost"
                    borderRadius="lg"
                    onClick={() => onFilterChange?.("search", "")}
                  />
                </InputRightElement>
              )}
            </InputGroup>

            <HStack spacing={2} overflowX="auto" pb={{ base: 1, md: 0 }} minW={0}>
              <Select
                size="sm"
                borderRadius="xl"
                w="190px"
                minW="170px"
                value={filters?.category ?? ""}
                onChange={(e) => onFilterChange?.("category", e.target.value)}
                bg={useColorModeValue("white", "gray.900")}
                borderColor={borderColor}
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
                borderRadius="xl"
                w="160px"
                minW="150px"
                value={filters?.status ?? ""}
                onChange={(e) => onFilterChange?.("status", e.target.value)}
                bg={useColorModeValue("white", "gray.900")}
                borderColor={borderColor}
                color="gray.600"
              >
                <option value="">Trạng thái</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>

              <Select
                size="sm"
                borderRadius="xl"
                w="170px"
                minW="160px"
                value={filters?.featured ?? ""}
                onChange={(e) => onFilterChange?.("featured", e.target.value)}
                bg={useColorModeValue("white", "gray.900")}
                borderColor={borderColor}
                color="gray.600"
              >
                <option value="">Độ nổi bật</option>
                <option value="true">Nổi bật</option>
                <option value="false">Thường</option>
              </Select>
            </HStack>
          </Stack>

          <AppliedFilters
            filters={filters}
            categoryNameById={categoryNameById}
            onFilterChange={onFilterChange}
            onClearAll={clearAllFilters}
          />
        </Stack>

        {/* RIGHT: Bulk bar */}
        {selectedIds.length > 0 && !isDeletedTab && (
          <Box
            border="1px solid"
            borderColor={useColorModeValue("blue.200", "whiteAlpha.200")}
            bg={useColorModeValue("blue.50", "whiteAlpha.100")}
            borderRadius="2xl"
            px={3}
            py={3}
            minW={{ lg: "420px" }}
          >
            <Stack direction={{ base: "column", sm: "row" }} spacing={2} align="center" justify="space-between">
              <Text fontSize="sm" fontWeight="800" color={useColorModeValue("blue.700", "blue.200")}>
                Đã chọn {selectedIds.length}
              </Text>

              <HStack spacing={2} w={{ base: "full", sm: "auto" }}>
                <Select
                  size="sm"
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  placeholder="Hành động..."
                  borderRadius="xl"
                  bg={cardBg}
                  borderColor={borderColor}
                  w={{ base: "full", sm: "220px" }}
                  isDisabled={isLoading}
                >
                  <option value="active" disabled={!canUpdate}>
                    Bật (Active)
                  </option>
                  <option value="inactive" disabled={!canUpdate}>
                    Tắt (Inactive)
                  </option>
                  <option value="delete" disabled={!canDelete}>
                    Xoá đã chọn
                  </option>
                </Select>

                <Button
                  size="sm"
                  colorScheme="blue"
                  borderRadius="xl"
                  onClick={handleApplyBulkAction}
                  isDisabled={!bulkAction || isLoading}
                  whiteSpace="nowrap"
                >
                  Thực hiện
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="blue"
                  borderRadius="xl"
                  onClick={() => {
                    clearSelection?.();
                    setBulkAction("");
                  }}
                  whiteSpace="nowrap"
                >
                  Bỏ chọn
                </Button>
              </HStack>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

ProductsToolbar.propTypes = {
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  categoryList: PropTypes.array,
  categoryNameById: PropTypes.instanceOf(Map),

  selectedIds: PropTypes.array,
  clearSelection: PropTypes.func,

  isDeletedTab: PropTypes.bool,
  isLoading: PropTypes.bool,

  canUpdate: PropTypes.bool,
  canDelete: PropTypes.bool,

  bulkSetStatus: PropTypes.func,
  openBulkDelete: PropTypes.func,
};
