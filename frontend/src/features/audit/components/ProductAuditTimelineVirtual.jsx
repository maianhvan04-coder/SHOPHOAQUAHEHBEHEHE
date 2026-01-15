import { Box, Text, VStack } from "@chakra-ui/react";
import { Virtuoso } from "react-virtuoso";
import { useMemo } from "react";

import ProductAuditItem from "./ProductAuditItem";
import { groupAuditByDate } from "../utils/groupAuditByDate";

export default function ProductAuditTimelineVirtual({
  items,
  loadMore,
}) {
  const groups = useMemo(() => groupAuditByDate(items), [items]);

  if (!groups.length) {
    return (
      <Box p={4}>
        <Text color="gray.500">Không có dữ liệu audit</Text>
      </Box>
    );
  }

  return (
    <Box height="600px">
      <Virtuoso
        data={groups}
        endReached={loadMore}
        overscan={300}

        itemContent={(index, group) => (
          <Box mb="20px">
            {/* 🔹 CARD NGÀY */}
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              overflow="hidden"
            >
              {/* Header ngày */}
              <Box
                px={4}
                py={2}
                bg="gray.50"
                borderBottom="1px solid"
                borderColor="gray.200"
              >
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  color="gray.600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {group.date}
                </Text>
              </Box>

              {/* Danh sách audit trong ngày */}
              <VStack align="stretch" spacing={0} p={4}>
                {group.logs.map((log) => (
                  <Box key={log._id} mb="16px">
                    <ProductAuditItem log={log} />
                  </Box>
                ))}
              </VStack>
            </Box>
          </Box>
        )}
      />
    </Box>
  );
}
