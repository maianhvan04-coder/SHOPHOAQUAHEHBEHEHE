/* eslint-disable react/prop-types */
import PropTypes from "prop-types";
import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  HStack,
  Input,
  Select,
  Stack,
  Text,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

/** helpers */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildPageItems(page, totalPages) {
  if (!totalPages || totalPages <= 1) return [1];
  const p = clamp(page, 1, totalPages);

  const show = new Set([1, totalPages, p, p - 1, p + 1, p - 2, p + 2]);
  const arr = [];
  for (let i = 1; i <= totalPages; i++) if (show.has(i)) arr.push(i);

  const out = [];
  for (let i = 0; i < arr.length; i++) {
    out.push(arr[i]);
    if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push("...");
  }
  return out;
}

/** Component */
export default function Pagination({
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 1,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onLimitChange,
  isDisabled = false,
}) {
  const [jump, setJump] = useState(String(page));
  const items = useMemo(() => buildPageItems(page, totalPages), [page, totalPages]);

  // sync jump input when page changes from outside
  useEffect(() => {
    setJump(String(page));
  }, [page]);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const cardBorder = useColorModeValue("gray.100", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const muted = useColorModeValue("gray.600", "gray.300");
  const dots = useColorModeValue("gray.500", "gray.400");

  const goTo = (p) => {
    const next = clamp(Number(p || 1), 1, totalPages);
    setJump(String(next));
    onPageChange?.(next);
  };

  return (
    <Card mt={4} p={3} borderRadius="xl" border="1px solid" borderColor={cardBorder} bg={cardBg}>
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={3}
        justify="space-between"
        align={{ base: "stretch", md: "center" }}
      >
        <HStack spacing={3} flexWrap="wrap">
          <Text fontSize="sm" color={muted}>
            Showing <b>{from}</b>–<b>{to}</b> of <b>{total}</b>
          </Text>

          <HStack spacing={2}>
            <Text fontSize="sm" color={muted}>
              Rows
            </Text>
            <Select
              size="sm"
              w="90px"
              value={limit}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
              borderRadius="full"
              isDisabled={isDisabled}
            >
              {pageSizeOptions.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </Select>
          </HStack>
        </HStack>

        <HStack spacing={2} justify={{ base: "space-between", md: "flex-end" }} flexWrap="wrap">
          <HStack spacing={1}>
            <IconButton
              size="sm"
              variant="outline"
              borderRadius="full"
              aria-label="Previous"
              icon={<ChevronLeftIcon className="h-4 w-4" />}
              isDisabled={isDisabled || page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            />

            {items.map((it, idx) =>
              it === "..." ? (
                <Box key={`e-${idx}`} px={2} color={dots}>
                  …
                </Box>
              ) : (
                <Button
                  key={it}
                  size="sm"
                  variant={it === page ? "solid" : "ghost"}
                  colorScheme={it === page ? "vrv" : undefined}
                  borderRadius="full"
                  isDisabled={isDisabled}
                  onClick={() => onPageChange?.(it)}
                >
                  {it}
                </Button>
              )
            )}

            <IconButton
              size="sm"
              variant="outline"
              borderRadius="full"
              aria-label="Next"
              icon={<ChevronRightIcon className="h-4 w-4" />}
              isDisabled={isDisabled || page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            />
          </HStack>

          <HStack spacing={2}>
            <Text fontSize="sm" color={muted}>
              Jump
            </Text>
            <Input
              size="sm"
              w="88px"
              borderRadius="full"
              value={jump}
              isDisabled={isDisabled}
              onChange={(e) => setJump(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goTo(jump)}
            />
            <Button size="sm" borderRadius="full" isDisabled={isDisabled} onClick={() => goTo(jump)}>
              Go
            </Button>
          </HStack>
        </HStack>
      </Stack>
    </Card>
  );
}

Pagination.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
  total: PropTypes.number,
  totalPages: PropTypes.number,
  pageSizeOptions: PropTypes.array,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  isDisabled: PropTypes.bool,
};
