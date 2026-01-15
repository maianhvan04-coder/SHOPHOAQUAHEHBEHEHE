import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
} from '@chakra-ui/react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function AuditResourceCard({ audit, onCopy }) {
  return (
    <Card shadow="sm">
      <CardHeader bg="orange.50">
        <Heading size="md">Tài nguyên</Heading>
      </CardHeader>

      <CardBody>
        <VStack align="flex-start" spacing={4}>
          <VStack align="flex-start" spacing={1} w="full">
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              PRODUCT ID
            </Text>
            <HStack w="full">
              <Text fontFamily="mono" noOfLines={1}>
                {audit.resourceId || '—'}
              </Text>
              {audit.resourceId && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onCopy(audit.resourceId)}
                >
                  <DocumentDuplicateIcon width={14} />
                </Button>
              )}
            </HStack>
          </VStack>

          <Button w="full" colorScheme="orange">
            Xem sản phẩm
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}
