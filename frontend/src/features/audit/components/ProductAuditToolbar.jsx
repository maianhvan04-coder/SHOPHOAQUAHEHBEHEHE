import PropTypes from "prop-types";
import AuditToolbarBase from "./AuditToolbarBase";

export default function ProductAuditToolbar({
  filters,
  onFilterChange,
  roleOptions = [],
}) {
  return (
    <AuditToolbarBase
      filters={filters}
      onFilterChange={onFilterChange}
      searchPlaceholder="Tìm theo tên hoặc email..."
      fields={[
        {
          key: "role",
          label: "Role",
          type: "select",
          options: roleOptions,
          width: "200px",
        },
        {
          key: "fromDate",
          label: "Từ ngày",
          type: "date",
          width: "180px",
        },
        {
          key: "toDate",
          label: "Đến ngày",
          type: "date",
          width: "180px",
        },
      ]}
    />
  );
}

ProductAuditToolbar.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  roleOptions: PropTypes.array,
};
