import PropTypes from "prop-types";
import {
  Avatar,
  Badge,
  Box,
  Checkbox,
  HStack,
  IconButton,
  Image,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  Text,
  Tag,
  useColorModeValue,
} from "@chakra-ui/react";

import { PencilSquareIcon, TrashIcon, ArrowUturnLeftIcon ,ClockIcon} from "@heroicons/react/24/outline";
import { getThumb, stop } from "../products.helpers";
import FeaturedBadge from "./FeaturedBadge";

export default function ProductsTableDesktop({
  filteredProducts,
  selectedIds,
  toggleSelect,
  selectAll,

  isDeletedTab,
  rowBusy,

  canUpdate,
  canDelete,
  canRestore,
   canViewHistory,        // ✅ NEW
  onViewHistory,  

  onEditProduct,
  onDeleteClick,
  onRestoreProduct,
  onToggleStatus,
}) {
  const borderColor = useColorModeValue("gray.200", "gray.800");
  const thColor = useColorModeValue("gray.600", "gray.400");
  const rowHoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const stickyHeaderBg = useColorModeValue("rgba(255, 255, 255, 0.92)", "rgba(17, 24, 39, 0.92)");
  const cardBg = useColorModeValue("white", "gray.900");
  const selectedRowBg = useColorModeValue("blue.50", "whiteAlpha.100");

  const idsOnPage = (filteredProducts || []).map((p) => p?._id).filter(Boolean);
  const allChecked = idsOnPage.length > 0 && idsOnPage.every((id) => selectedIds.includes(id));
  const someChecked = idsOnPage.some((id) => selectedIds.includes(id)) && !allChecked;

  return (
    <Box overflowX="auto">
      <Table variant="simple" size="sm" tableLayout="fixed" w="full">
        <colgroup>
          <col style={{ width: "44px" }} />
          <col style={{ width: "320px" }} />
          <col style={{ width: "240px" }} />
          <col style={{ width: "190px" }} />
          <col style={{ width: "120px" }} />
          <col style={{ width: "130px" }} />
          <col style={{ width: "140px" }} />
          <col style={{ width: "110px" }} />
        </colgroup>

        <Thead
          position="sticky"
          top={0}
          bg={stickyHeaderBg}
          zIndex={10}
          sx={{ backdropFilter: "blur(12px)" }}
          boxShadow="0 1px 2px rgba(0,0,0,0.04)"
        >
          <Tr>
            <Th textAlign="center" whiteSpace="nowrap">
              <Checkbox
                isChecked={allChecked}
                isIndeterminate={someChecked}
                onChange={() => selectAll?.(idsOnPage)}
                colorScheme="blue"
              />
            </Th>

            <Th color={thColor} fontSize="xs" letterSpacing="wider" whiteSpace="nowrap">
              SẢN PHẨM
            </Th>
            <Th color={thColor} fontSize="xs" letterSpacing="wider" whiteSpace="nowrap">
              NGƯỜI TẠO
            </Th>
            <Th color={thColor} fontSize="xs" letterSpacing="wider" whiteSpace="nowrap">
              DANH MỤC
            </Th>
            <Th color={thColor} fontSize="xs" letterSpacing="wider" isNumeric whiteSpace="nowrap">
              GIÁ BÁN
            </Th>
            <Th color={thColor} fontSize="xs" letterSpacing="wider" whiteSpace="nowrap">
              KHO
            </Th>
            <Th color={thColor} fontSize="xs" letterSpacing="wider" whiteSpace="nowrap">
              TRẠNG THÁI
            </Th>

            <Th
              color={thColor}
              fontSize="xs"
              letterSpacing="wider"
              textAlign="right"
              whiteSpace="nowrap"
              position="sticky"
              right={0}
              bg={stickyHeaderBg}
              zIndex={11}
            >
              THAO TÁC
            </Th>
          </Tr>
        </Thead>

        <Tbody>
          {filteredProducts.map((p) => {
            const thumb = getThumb(p);
            const disabled = !!rowBusy?.[p._id];
            const isSelected = selectedIds.includes(p._id);

            return (
              <Tr
                key={p._id}
                bg={isSelected ? selectedRowBg : "transparent"}
                _hover={{ bg: rowHoverBg }}
                transition="background .15s ease"
                cursor={disabled ? "not-allowed" : "pointer"}
                onClick={() => !disabled && toggleSelect?.(p._id)}
                opacity={disabled ? 0.65 : 1}
              >
                <Td textAlign="center" onClick={stop}>
                  <Checkbox
                    isChecked={isSelected}
                    onClick={stop}
                    onChange={() => !disabled && toggleSelect?.(p._id)}
                    colorScheme="blue"
                    isDisabled={disabled}
                  />
                </Td>

                <Td py={3} onClick={stop}>
                  <HStack spacing={3} minW={0}>
                    <Box
                      w="52px"
                      h="52px"
                      borderRadius="xl"
                      overflow="hidden"
                      flexShrink={0}
                      border="1px solid"
                      borderColor={borderColor}
                      bg={useColorModeValue("white", "gray.800")}
                    >
                      {thumb ? (
                        <Image src={thumb} w="full" h="full" objectFit="cover" />
                      ) : (
                        <Box w="full" h="full" bg={useColorModeValue("gray.50", "whiteAlpha.50")} />
                      )}
                    </Box>

                    <Box minW={0}>
                      <HStack spacing={2} align="center">
                        <Text fontWeight="900" fontSize="sm" isTruncated>
                          {p.name}
                        </Text>
                        <FeaturedBadge p={p} />
                      </HStack>
                      <Text fontSize="xs" color="gray.500" isTruncated>
                        {p.slug}
                      </Text>
                    </Box>
                  </HStack>
                </Td>

                <Td onClick={stop}>
                  <HStack spacing={3} minW={0}>
                    <Avatar size="sm" name={p?.createdBy?.fullName} src={p?.createdBy?.image?.url} />
                    <Box minW={0}>
                      <Text fontSize="sm" fontWeight="800" isTruncated>
                        {p?.createdBy?.fullName || "---"}
                      </Text>
                      <Text fontSize="xs" color="gray.500" isTruncated>
                        {p?.createdBy?.email || ""}
                      </Text>
                    </Box>
                  </HStack>
                </Td>

                <Td onClick={stop}>
                  <Tag size="sm" variant="subtle" colorScheme="gray" borderRadius="full" maxW="100%" overflow="hidden">
                    <Text isTruncated maxW="100%">
                      {p?.category?.name || "---"}
                    </Text>
                  </Tag>
                </Td>

                <Td isNumeric onClick={stop}>
                  <Text fontWeight="900" fontSize="sm">
                    {Number(p.price || 0).toLocaleString("vi-VN")}
                    <Text as="span" fontSize="xs" color="gray.500" ml={1}>
                      đ
                    </Text>
                  </Text>
                </Td>

                <Td onClick={stop}>
                  <Text fontSize="sm" fontWeight="800">
                    <Text as="span" color={(p.stock ?? 0) > 0 ? "green.500" : "red.400"}>
                      {p.stock ?? 0}
                    </Text>
                    <Text as="span" color="gray.400">
                      {" "}
                      ·{" "}
                    </Text>
                    <Text as="span" color="gray.600">
                      {p.sold ?? 0}
                    </Text>
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Tồn · Bán
                  </Text>
                </Td>

                <Td onClick={stop}>
                  <Tooltip label={canUpdate && !isDeletedTab ? "Bấm để đổi trạng thái" : "Không có quyền"} hasArrow>
                    <Badge
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      colorScheme={p.isActive ? "green" : "red"}
                      variant="subtle"
                      cursor={canUpdate && !isDeletedTab && !disabled ? "pointer" : "not-allowed"}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canUpdate || isDeletedTab || disabled) return;
                        onToggleStatus?.(p);
                      }}
                    >
                      {p.isActive ? "Hoạt động" : "Tạm tắt"}
                    </Badge>
                  </Tooltip>
                </Td>

                <Td
                  textAlign="right"
                  onClick={stop}
                  position="sticky"
                  right={0}
                  bg={isSelected ? selectedRowBg : cardBg}
                  zIndex={9}
                  boxShadow="inset 1px 0 0 rgba(0,0,0,0.06)"
                >
                  <HStack justify="flex-end" spacing={1}>
                    {!isDeletedTab ? (
                      <>
                        {canUpdate && (
                          <Tooltip label="Sửa" hasArrow>
                            <IconButton
                              icon={<PencilSquareIcon className="h-4 w-4" />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              borderRadius="xl"
                              aria-label="Edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditProduct?.(p);
                              }}
                              isDisabled={disabled}
                            />
                          </Tooltip>
                        )}
                         {!isDeletedTab && canViewHistory && (
    <Tooltip label="Lịch sử thay đổi" hasArrow>
      <IconButton
        icon={<ClockIcon className="h-4 w-4" />}
        size="sm"
        variant="ghost"
        colorScheme="purple"
        borderRadius="xl"
        aria-label="History"
        onClick={(e) => {
          e.stopPropagation();
          onViewHistory?.(p);
        }}
        isDisabled={disabled}
      />
    </Tooltip>
  )}

                        {canDelete && (
                          <Tooltip label="Xoá" hasArrow>
                            <IconButton
                              icon={<TrashIcon className="h-4 w-4" />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              borderRadius="xl"
                              aria-label="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteClick?.(p);
                              }}
                              isDisabled={disabled}
                            />
                          </Tooltip>
                        )}
                        
                      </>
                    ) : (
                      canRestore && (
                        <Tooltip label="Khôi phục" hasArrow>
                          <IconButton
                            icon={<ArrowUturnLeftIcon className="h-4 w-4" />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            borderRadius="xl"
                            aria-label="Restore"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreProduct?.(p);
                            }}
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
  );
}

ProductsTableDesktop.propTypes = {
  filteredProducts: PropTypes.array,
  selectedIds: PropTypes.array,
  toggleSelect: PropTypes.func,
  selectAll: PropTypes.func,

  isDeletedTab: PropTypes.bool,
  rowBusy: PropTypes.object,

  canUpdate: PropTypes.bool,
  canDelete: PropTypes.bool,
  canRestore: PropTypes.bool,

  onEditProduct: PropTypes.func,
  onDeleteClick: PropTypes.func,
  onRestoreProduct: PropTypes.func,
  onToggleStatus: PropTypes.func,
};
