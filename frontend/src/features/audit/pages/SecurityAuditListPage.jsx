import { Box, Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { useDebouncedValue } from "~/shared/hooks/useDebouncedValue";

import ProductAuditTimelineVirtual from "~/features/audit/components/ProductAuditTimelineVirtual";
import SecurityAuditToolbar from "~/features/audit/components/security/SecurityAuditToolbar";
import { useSecurityAuditList } from "~/features/audit/hooks/useSecurityAuditList";

export default function SecurityAuditListPage() {
  const [filters, setFilters] = useState({
    search: "",        // email / user
    action: "",        // login | login_failed
    riskLevel: "",     // low | medium | high | critical
    fromDate: "",
    toDate: "",
  });

  // debounce search (email / IP)
  const debouncedSearch = useDebouncedValue(filters.search, 3000);

  const auditFilters = {
    ...filters,
    search: debouncedSearch,
    resource: "security", // 🔥 ép resource
  };

  const { items, loadMore, loading } =
    useSecurityAuditList(auditFilters);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box p={6}>
      <Card>
        <CardHeader>
          <Heading size="md">Lịch sử bảo mật</Heading>
        </CardHeader>

        {/* ===== TOOLBAR ===== */}
        <SecurityAuditToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          actionOptions={["login", "login_failed"]}
          riskOptions={["low", "medium", "high", "critical"]}
        />

        {/* ===== TIMELINE ===== */}
        <CardBody>
          <ProductAuditTimelineVirtual
            items={items}
            loadMore={loadMore}
            loading={loading}
          />
        </CardBody>
      </Card>
    </Box>
  );
}
