import { Flex, VStack, Spinner, Text } from '@chakra-ui/react';

export default function AuditLoading() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text color="gray.600" fontSize="lg" fontWeight="medium">
          Đang tải dữ liệu...
        </Text>
      </VStack>
    </Flex>
  );
}
