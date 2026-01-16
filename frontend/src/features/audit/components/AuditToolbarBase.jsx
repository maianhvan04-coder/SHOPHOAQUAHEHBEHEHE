import PropTypes from "prop-types";
import {
  Box,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Stack,
  FormControl,
  FormLabel,
  useColorModeValue,
} from "@chakra-ui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function AuditToolbarBase({
  filters,
  onFilterChange,
  fields = [],
  searchPlaceholder = "Tìm kiếm...",
}) {
  const borderColor = useColorModeValue("gray.200", "gray.800");
  const labelColor = useColorModeValue("gray.600", "gray.400");

  const clearAllFilters = () => {
    fields.forEach((f) => onFilterChange(f.key, ""));
    onFilterChange("search", "");
  };

  return (
    <Box p={4} borderBottom="1px solid" borderColor={borderColor}>
      <Stack spacing={4}>
        {/* SEARCH */}
        <InputGroup size="sm" maxW="420px">
          <InputLeftElement pointerEvents="none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </InputLeftElement>

          <Input
            placeholder={searchPlaceholder}
            value={filters.search || ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
            borderRadius="xl"
          />

          {!!filters.search && (
            <InputRightElement>
              <IconButton
                aria-label="Clear"
                size="xs"
                variant="ghost"
                icon={<XMarkIcon className="h-4 w-4" />}
                onClick={() => onFilterChange("search", "")}
              />
            </InputRightElement>
          )}
        </InputGroup>

        {/* FILTERS */}
        <HStack spacing={4} flexWrap="wrap" align="flex-end">
          {fields.map((field) => (
            <FormControl key={field.key} w={field.width || "200px"}>
              <FormLabel fontSize="xs" color={labelColor} mb={1}>
                {field.label}
              </FormLabel>

              {field.type === "select" && (
                <Select
                  size="sm"
                  borderRadius="xl"
                  value={filters[field.key] || ""}
                  onChange={(e) =>
                    onFilterChange(field.key, e.target.value)
                  }
                >
                  <option value="">Tất cả</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value ?? opt} value={opt.value ?? opt}>
                      {opt.label ?? opt}
                    </option>
                  ))}
                </Select>
              )}

              {field.type === "date" && (
                <Input
                  size="sm"
                  type="date"
                  borderRadius="xl"
                  value={filters[field.key] || ""}
                  onChange={(e) =>
                    onFilterChange(field.key, e.target.value)
                  }
                />
              )}
            </FormControl>
          ))}

          {/* CLEAR */}
          <IconButton
            mt="18px"
            size="sm"
            variant="ghost"
            aria-label="Clear all"
            icon={<XMarkIcon className="h-5 w-5" />}
            onClick={clearAllFilters}
          />
        </HStack>
      </Stack>
    </Box>
  );
}

AuditToolbarBase.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
  searchPlaceholder: PropTypes.string,
};
