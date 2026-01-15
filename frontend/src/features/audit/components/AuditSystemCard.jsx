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
import { renderUserAgent } from '../components/renderImage';

export default function AuditSystemCard({ audit, onCopy }) {
  return (
    <Card shadow="sm">
      <CardHeader bg="cyan.50">
        <Heading size="md">Thông tin hệ thống</Heading>
      </CardHeader>

      <CardBody>
        <VStack align="flex-start" spacing={4}>
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              IP ADDRESS
            </Text>
            <HStack>
              <Text fontFamily="mono">{audit.ip || '—'}</Text>
              {audit.ip && (
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => onCopy(audit.ip)}
                >
                  <DocumentDuplicateIcon width={14} />
                </Button>
              )}
            </HStack>
          </VStack>

          <VStack align="flex-start" spacing={1} w="full">
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              USER AGENT
            </Text>
            {renderUserAgent(audit)}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
