import { Card, CardBody, Box, Heading, HStack, Text, Badge, Flex } from '@chakra-ui/react';
import { formatDate } from '~/features/audit//utils/auditUtils';

export default function AuditHeader({ audit }) {
  const colorMap = {
    create: 'green',
    update: 'blue',
    delete: 'red',
  };

  const colorScheme = colorMap[audit.action] || 'blue';

  return (
    <Card mb={6} shadow="sm">
      <Box h="1" bg={`${colorScheme}.500`} />
      <CardBody p={8}>
        <Flex justify="space-between" align="flex-start" flexWrap="wrap">
          <Box>
            <Heading size="md">Chi tiết Audit Sản phẩm</Heading>
            <HStack spacing={4} fontSize="sm" color="gray.600">
              <Text>
                Audit ID:{' '}
                <Box as="span" fontFamily="mono" fontSize="xs">
                  {audit._id?.slice(0, 12)}...
                </Box>
              </Text>
              <Text>•</Text>
              <Text>{formatDate(audit.createdAt)}</Text>
            </HStack>
          </Box>

          <Badge colorScheme={colorScheme} px={4} py={2} fontWeight="bold">
            {audit.action.toUpperCase()}
          </Badge>
        </Flex>
      </CardBody>
    </Card>
  );
}
