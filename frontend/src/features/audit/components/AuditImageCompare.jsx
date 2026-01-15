import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Grid,
  Box,
  Text,
} from '@chakra-ui/react';
import { renderImages } from './renderImage';

export default function AuditImageCompare({
  action,
  before = [],
  after = [],
}) {
  // Không có ảnh gì thì không render
  if (
    (action === 'update' && !before.length && !after.length) ||
    (action === 'create' && !after.length) ||
    (action === 'delete' && !before.length)
  ) {
    return null;
  }

  return (
    <Card mb={6}>
      <CardHeader bg="pink.50">
        <Heading size="md">Hình ảnh sản phẩm</Heading>
      </CardHeader>

      <CardBody>
        {/* UPDATE → so sánh */}
        {action === 'update' && (
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            <Box>
              <Text fontWeight="bold" color="red.600">
                🔴 Trước
              </Text>
              {renderImages(before)}
            </Box>

            <Box>
              <Text fontWeight="bold" color="green.600">
                🟢 Sau
              </Text>
              {renderImages(after)}
            </Box>
          </Grid>
        )}

        {/* CREATE → chỉ sau */}
        {action === 'create' && (
          <Box>
            <Text fontWeight="bold" color="green.600">
              🟢 Hình ảnh khi tạo
            </Text>
            {renderImages(after)}
          </Box>
        )}

        {/* DELETE → chỉ trước */}
        {action === 'delete' && (
          <Box>
            <Text fontWeight="bold" color="red.600">
              🔴 Hình ảnh trước khi xóa
            </Text>
            {renderImages(before)}
          </Box>
        )}
      </CardBody>
    </Card>
  );
}
