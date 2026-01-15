import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
} from "@chakra-ui/react";
import ProductAuditTimelineVirtual from "../components/ProductAuditTimelineVirtual";
import { useProductAuditList } from "../hooks/useProductAuditList";

export default function ProductAuditListPage() {
  const { items, loadMore } = useProductAuditList();
 
  return (
    <Box p={6}>
      <Card>
        <CardHeader>
          <Heading size="md">Lịch sử thay đổi sản phẩm</Heading>
        </CardHeader>
        <CardBody>
          <ProductAuditTimelineVirtual
            items={items}
            loadMore={loadMore}
          />
        </CardBody>
      </Card>
    </Box>
  );
}
