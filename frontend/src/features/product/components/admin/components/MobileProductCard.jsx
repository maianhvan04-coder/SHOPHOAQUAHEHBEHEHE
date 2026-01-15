import PropTypes from "prop-types";
import {
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  HStack,
  IconButton,
  Image,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";

import { PencilSquareIcon, TrashIcon, ArrowUturnLeftIcon, StarIcon } from "@heroicons/react/24/outline";
import { formatVND, stop } from "../products.helpers";

export default function MobileProductCard({
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
  onToggleStatus,
  canUpdate,
}) {
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtleBg = useColorModeValue("gray.50", "whiteAlpha.50");

  return (
    <Card
      bg={cardBg}
      border="1px solid"
      borderColor={selected ? "blue.400" : borderColor}
      borderRadius="2xl"
      overflow="hidden"
      shadow={selected ? "md" : "sm"}
      transition="all .15s ease"
      _hover={!disabled ? { transform: "translateY(-2px)", shadow: "md" } : undefined}
      _active={!disabled ? { transform: "scale(0.99)" } : undefined}
      opacity={disabled ? 0.65 : 1}
      cursor={disabled ? "not-allowed" : "pointer"}
      onClick={() => !disabled && onToggle?.()}
    >
      <HStack p={3.5} spacing={3} align="start">
        <Checkbox
          isChecked={selected}
          mt={1}
          size="lg"
          colorScheme="blue"
          onClick={stop}
          onChange={() => !disabled && onToggle?.()}
          isDisabled={disabled}
        />

        <Box
          w="84px"
          h="84px"
          borderRadius="xl"
          overflow="hidden"
          bg={subtleBg}
          flexShrink={0}
          border="1px solid"
          borderColor={useColorModeValue("gray.100", "whiteAlpha.200")}
          onClick={stop}
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
          <HStack w="full" justify="space-between" align="start" spacing={2}>
            <Text fontWeight="800" noOfLines={2} fontSize="sm" lineHeight="1.2">
              {p.name}
            </Text>
            {p.isFeatured && (
              <Box mt={0.5} onClick={stop}>
                <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </Box>
            )}
          </HStack>

          <Text fontSize="xs" color="gray.500" noOfLines={1}>
            {categoryName}
          </Text>

          <Text fontWeight="900" color={useColorModeValue("blue.600", "blue.300")} fontSize="sm">
            {formatVND(p.price)}
          </Text>

          <HStack spacing={2} pt={1}>
            <Tooltip label={canUpdate && !isDeletedTab ? "Bấm để đổi trạng thái" : "Không có quyền"} hasArrow>
              <Badge
                fontSize="10px"
                px={2}
                py={0.5}
                borderRadius="full"
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

            <Badge fontSize="10px" variant="outline" borderRadius="full" px={2} onClick={stop}>
              Tồn: {p.stock ?? 0} · Bán: {p.sold ?? 0}
            </Badge>
          </HStack>
        </VStack>
      </HStack>

      <Divider />

      <HStack px={3} py={2.5} justify="space-between" bg={subtleBg}>
        <Text fontSize="xs" color="gray.500">
          Slug: <b>{p.slug || "—"}</b>
        </Text>

        {!isDeletedTab ? (
          <HStack spacing={1}>
            <IconButton
              icon={<PencilSquareIcon className="h-4 w-4" />}
              variant="ghost"
              size="sm"
              aria-label="Edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(p);
              }}
              isDisabled={disabled}
              borderRadius="lg"
            />
            <IconButton
              icon={<TrashIcon className="h-4 w-4" />}
              variant="ghost"
              colorScheme="red"
              size="sm"
              aria-label="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(p);
              }}
              isDisabled={disabled}
              borderRadius="lg"
            />
          </HStack>
        ) : (
          <Button
            leftIcon={<ArrowUturnLeftIcon className="h-4 w-4" />}
            size="xs"
            colorScheme="green"
            variant="solid"
            onClick={(e) => {
              e.stopPropagation();
              onRestore?.(p);
            }}
            isDisabled={disabled}
            borderRadius="lg"
          >
            Khôi phục
          </Button>
        )}
      </HStack>
    </Card>
  );
}

MobileProductCard.propTypes = {
  p: PropTypes.object,
  selected: PropTypes.bool,
  onToggle: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onRestore: PropTypes.func,
  isDeletedTab: PropTypes.bool,
  disabled: PropTypes.bool,
  categoryName: PropTypes.string,
  thumb: PropTypes.string,
  onToggleStatus: PropTypes.func,
  canUpdate: PropTypes.bool,
};
