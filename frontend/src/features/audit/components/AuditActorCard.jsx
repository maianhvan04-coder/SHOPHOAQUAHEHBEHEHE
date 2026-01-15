import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Box,
  Button,
} from '@chakra-ui/react';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function AuditActorCard({ actor, roles, onCopy }) {
  return (
    <Card shadow="sm">
      <CardHeader bg="purple.50">
        <Heading size="md">Người thao tác</Heading>
      </CardHeader>

      <CardBody>
        <VStack align="flex-start" spacing={4}>
          <Box>
            <Text fontSize="xs" fontWeight="bold">Tên</Text>
            <Text fontSize="lg">{actor?.fullName || '—'}</Text>
          </Box>

          <Box>
            <Text fontSize="xs" fontWeight="bold">Email</Text>
            <HStack>
              <Text>{actor?.email || '—'}</Text>
              {actor?.email && (
                <Button size="xs" variant="ghost" onClick={() => onCopy(actor.email)}>
                  <DocumentDuplicateIcon width={14} />
                </Button>
              )}
            </HStack>
          </Box>

          <HStack flexWrap="wrap">
            {roles?.length
              ? roles.map((r) => (
                  <Badge key={r} colorScheme="purple" fontSize="xs">
                    {r}
                  </Badge>
                ))
              : <Text fontSize="sm">Không có vai trò</Text>}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
