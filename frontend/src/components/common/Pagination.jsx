// src/components/common/Pagination.jsx
import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { HStack, Button, IconButton, Text, Select, Box, Input, InputGroup, InputRightAddon } from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildPageItems(page, totalPages, siblingCount = 1) {
  if (totalPages <= 1) return [1];
  const first = 1;
  const last = totalPages;

  const start = Math.max(first + 1, page - siblingCount);
  const end = Math.min(last - 1, page + siblingCount);

  const items = [first];
  if (start > first + 1) items.push("…");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < last - 1) items.push("…");
  items.push(last);

  return items;
}

export default function Pagination({
  page = 1,
  limit = 10,
  totalItems = 0,
  totalPages,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50, 100],
  isDisabled = false,
  siblingCount = 1,
  showJump = true,               // ✅ new
}) {
  const safeTotalPages =
    totalPages ?? Math.max(1, Math.ceil((totalItems || 0) / (limit || 10)));

  const current = clamp(page, 1, safeTotalPages);

  const from = totalItems === 0 ? 0 : (current - 1) * limit + 1;
  const to = totalItems === 0 ? 0 : Math.min(current * limit, totalItems);

  const items = useMemo(
    () => buildPageItems(current, safeTotalPages, siblingCount),
    [current, safeTotalPages, siblingCount]
  );

  const [jump, setJump] = useState(String(current));

  const go = (p) => onPageChange?.(clamp(p, 1, safeTotalPages));

  const doJump = () => {
    const n = Number(jump);
    if (!Number.isFinite(n)) return;
    go(n);
  };

  return (
    <HStack w="full" justify="space-between" spacing={3} py={4} px={{ base: 4, md: 6 }}>
      {/* Left */}
      <Box>
        <Text fontSize="sm" opacity={0.75}>
          Showing <b>{from}</b>–<b>{to}</b> of <b>{totalItems}</b>
        </Text>
      </Box>

      {/* Right */}
      <HStack spacing={3}>
        <HStack spacing={1}>
          <IconButton
            size="sm"
            variant="outline"
            borderRadius="lg"
            aria-label="First page"
            icon={<ChevronDoubleLeftIcon className="h-4 w-4" />}
            onClick={() => go(1)}
            isDisabled={isDisabled || current <= 1}
          />
          <IconButton
            size="sm"
            variant="outline"
            borderRadius="lg"
            aria-label="Previous page"
            icon={<ChevronLeftIcon className="h-4 w-4" />}
            onClick={() => go(current - 1)}
            isDisabled={isDisabled || current <= 1}
          />

          {items.map((it, idx) => {
            if (it === "…") return <Text key={`dots-${idx}`} px={2} opacity={0.6}>…</Text>;
            const active = it === current;
            return (
              <Button
                key={it}
                size="sm"
                variant={active ? "solid" : "ghost"}
                colorScheme={active ? "vrv" : "gray"}
                borderRadius="lg"
                onClick={() => go(it)}
                isDisabled={isDisabled}
                minW="36px"
              >
                {it}
              </Button>
            );
          })}

          <IconButton
            size="sm"
            variant="outline"
            borderRadius="lg"
            aria-label="Next page"
            icon={<ChevronRightIcon className="h-4 w-4" />}
            onClick={() => go(current + 1)}
            isDisabled={isDisabled || current >= safeTotalPages}
          />
          <IconButton
            size="sm"
            variant="outline"
            borderRadius="lg"
            aria-label="Last page"
            icon={<ChevronDoubleRightIcon className="h-4 w-4" />}
            onClick={() => go(safeTotalPages)}
            isDisabled={isDisabled || current >= safeTotalPages}
          />
        </HStack>

        {/* Jump to page */}
        {showJump && safeTotalPages > 1 && (
          <InputGroup size="sm" w="150px">
            <Input
              value={jump}
              onChange={(e) => setJump(e.target.value.replace(/[^\d]/g, ""))}
              onFocus={() => setJump(String(current))}
              onKeyDown={(e) => e.key === "Enter" && doJump()}
              placeholder={`1-${safeTotalPages}`}
              isDisabled={isDisabled}
            />
            <InputRightAddon p={0}>
              <Button size="sm" borderRadius="0" onClick={doJump} isDisabled={isDisabled}>
                Go
              </Button>
            </InputRightAddon>
          </InputGroup>
        )}

        <Select
          size="sm"
          borderRadius="lg"
          w="110px"
          value={limit}
          onChange={(e) => onLimitChange?.(Number(e.target.value))}
          isDisabled={isDisabled}
        >
          {limitOptions.map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </Select>
      </HStack>
    </HStack>
  );
}

Pagination.propTypes = {
  page: PropTypes.number,
  limit: PropTypes.number,
  totalItems: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  onLimitChange: PropTypes.func,
  limitOptions: PropTypes.arrayOf(PropTypes.number),
  isDisabled: PropTypes.bool,
  siblingCount: PropTypes.number,
  showJump: PropTypes.bool,
};
