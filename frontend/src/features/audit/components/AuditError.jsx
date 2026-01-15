import { Box, Card, CardBody, Text, Button } from '@chakra-ui/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function AuditError({ message }) {
  return (
    <Box minH="100vh" bg="gray.50" p={6}>
      <Button
        leftIcon={<ArrowLeftIcon width={18} />}
        variant="ghost"
        mb={6}
        onClick={() => window.history.back()}
      >
        Quay lại
      </Button>

      <Card bg="red.50" borderColor="red.200" borderWidth="2px">
        <CardBody>
          <Text
            color="red.700"
            fontWeight="semibold"
            fontSize="lg"
            textAlign="center"
          >
            {message || 'Không tìm thấy audit'}
          </Text>
        </CardBody>
      </Card>
    </Box>
  );
}
