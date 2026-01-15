import PropTypes from "prop-types";
import { Button, HStack, Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";

export default function AppliedFilters({ filters, categoryNameById, onFilterChange, onClearAll }) {
  const items = [];

  const search = (filters?.search ?? "").trim();
  const category = filters?.category ?? "";
  const status = filters?.status ?? "";
  const featured = filters?.featured ?? "";

  if (search) items.push({ key: "search", label: `Từ khoá: ${search}` });
  if (category) items.push({ key: "category", label: `Danh mục: ${categoryNameById.get(String(category)) || "—"}` });
  if (status) items.push({ key: "status", label: `Trạng thái: ${status === "active" ? "Active" : "Inactive"}` });
  if (featured) items.push({ key: "featured", label: `Độ nổi bật: ${featured === "true" ? "Nổi bật" : "Thường"}` });

  if (items.length === 0) return null;

  return (
    <HStack spacing={2} flexWrap="wrap" mt={2} align="center">
      {items.map((it) => (
        <Tag key={it.key} size="sm" borderRadius="full" variant="subtle" colorScheme="blue">
          <TagLabel maxW="380px" noOfLines={1}>
            {it.label}
          </TagLabel>
          <TagCloseButton
            onClick={() => {
              const k = it.key;
              if (k === "search") onFilterChange?.("search", "");
              if (k === "category") onFilterChange?.("category", "");
              if (k === "status") onFilterChange?.("status", "");
              if (k === "featured") onFilterChange?.("featured", "");
            }}
          />
        </Tag>
      ))}

      <Button size="xs" variant="ghost" colorScheme="blue" onClick={onClearAll}>
        Xoá tất cả
      </Button>
    </HStack>
  );
}

AppliedFilters.propTypes = {
  filters: PropTypes.object,
  categoryNameById: PropTypes.instanceOf(Map),
  onFilterChange: PropTypes.func,
  onClearAll: PropTypes.func,
};
