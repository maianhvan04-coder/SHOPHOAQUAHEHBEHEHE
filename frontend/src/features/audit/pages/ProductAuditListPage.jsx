import { Box, Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { useDebouncedValue } from "~/shared/hooks/useDebouncedValue";

import ProductAuditTimelineVirtual from "../components/ProductAuditTimelineVirtual";
import ProductAuditToolbar from "../components/ProductAuditToolbar";
import { useProductAuditList } from "../hooks/useProductAuditList";

export default function ProductAuditListPage() {
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    fromDate: "",
    toDate: "",
  });

 const debouncedSearch = useDebouncedValue(filters.search, 3000);

const auditFilters = {
  ...filters,
  search: debouncedSearch,
};

const { items, loadMore, loading } = useProductAuditList(auditFilters);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box p={6}>
      <Card>
        <CardHeader>
          <Heading size="md">Lịch sử thay đổi sản phẩm</Heading>
        </CardHeader>

        <ProductAuditToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          roleOptions={["ADMIN", "PRODUCTMANAGEMENT"]}
        />

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
