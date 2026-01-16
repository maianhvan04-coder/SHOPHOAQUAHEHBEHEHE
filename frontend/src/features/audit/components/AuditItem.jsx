// src/features/audit/components/AuditItem.jsx
import ProductAuditItem from "./ProductAuditItem";
import SecurityAuditItem from "./security/SecurityAuditItem";

export default function AuditItem({ log }) {
  if (log.resource === "security") {
    return <SecurityAuditItem log={log} />;
  }

  return <ProductAuditItem log={log} />;
}
