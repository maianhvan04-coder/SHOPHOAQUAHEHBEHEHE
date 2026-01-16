import PropTypes from "prop-types";
import AuditToolbarBase from "../../components/AuditToolbarBase";

export default function SecurityAuditToolbar({
  filters,
  onFilterChange,
  actionOptions = [],
  riskOptions = [],
}) {
  return (
    <AuditToolbarBase
      filters={filters}
      onFilterChange={onFilterChange}
      searchPlaceholder="Tìm theo email hoặc IP..."
      fields={[
        {
          key: "action",
          label: "Hành động",
          type: "select",
          options: actionOptions,
          width: "200px",
        },
        {
          key: "riskLevel",
          label: "Risk level",
          type: "select",
          options: riskOptions.map((r) => ({
            value: r,
            label: r.toUpperCase(),
          })),
          width: "180px",
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

SecurityAuditToolbar.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  actionOptions: PropTypes.array,
  riskOptions: PropTypes.array,
};
