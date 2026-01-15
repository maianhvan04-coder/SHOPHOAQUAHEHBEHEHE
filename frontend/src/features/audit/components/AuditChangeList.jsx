import { Box, Button, Grid, Text, Badge } from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { formatValue } from '~/features/audit/utils/auditUtils';
import { IGNORE_FIELDS } from '~/features/audit/utils/auditUtils';

export default function AuditChangeList({ action, before, after }) {
  const [expanded, setExpanded] = useState({});

  const safeBefore = before || {};
  const safeAfter = after || {};
  console.log('action:', action);


  const fields = useMemo(() => {
    if (action === 'update') {
      return Object.keys({ ...safeBefore, ...safeAfter }).filter(
        key =>
          !IGNORE_FIELDS.includes(key) &&
          JSON.stringify(safeBefore[key]) !== JSON.stringify(safeAfter[key])
      );
    }

    // CREATE → toàn bộ AFTER
    if (action === 'create') {
      console.log(safeAfter)
      return Object.keys(safeAfter).filter(
        (key) => !IGNORE_FIELDS.includes(key)
      );
    }

    if (action === 'delete') {
      return Object.keys(safeBefore).filter(
        key => !IGNORE_FIELDS.includes(key)
      );
    }

    return [];
  }, [action, safeBefore, safeAfter]);

  console.log(fields)
  if (fields.length === 0) {
    return (
      <Box mt={4} color="gray.500" fontSize="sm">
        Không có thay đổi chi tiết
      </Box>
    );
  }



  return (
    <>
      {fields.map((field) => {
        const isOpen = expanded[field];

        return (
          <Box key={field} borderBottom="1px solid" borderColor="gray.200">
            <Button
              w="full"
              variant="ghost"
              justifyContent="space-between"
              onClick={() =>
                setExpanded((p) => ({ ...p, [field]: !p[field] }))
              }
            >
              <Badge>{field}</Badge>
              <Text>{isOpen ? '▼' : '▶'}</Text>
            </Button>

            {isOpen && (
              <Grid templateColumns="1fr 1fr" gap={4} p={4}>
                {action !== 'create' && (
                  <Box bg="red.50" p={3} borderRadius="md">
                    <Text fontSize="xs">Trước</Text>
                    <Text fontFamily="mono">
                      {formatValue(safeBefore[field])}
                    </Text>
                  </Box>
                )}

                {action !== 'delete' && (
                  <Box bg="green.50" p={3} borderRadius="md">
                    <Text fontSize="xs">Sau</Text>
                    <Text fontFamily="mono">
                      {formatValue(safeAfter[field])}
                    </Text>
                  </Box>
                )}
              </Grid>
            )}
          </Box>
        );
      })}
    </>
  );
}
