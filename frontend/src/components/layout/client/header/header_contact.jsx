
const HeaderContactItem = ({ icon, label, value, value2 }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">
        <img src={icon} alt={label || "contact icon"} />
      </div>

      <div className="text-sm">
        {label && <p className="text-xs text-gray-500">{label}</p>}
        <p className="font-bold whitespace-nowrap">{value}</p>
        {value2 && <p className="font-bold whitespace-nowrap">{value2}</p>}

      </div>
    </div>
  );
};

export default HeaderContactItem

