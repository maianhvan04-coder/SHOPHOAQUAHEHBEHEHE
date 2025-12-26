import { FaSearch, FaChevronDown } from "react-icons/fa";
import { FiBell } from "react-icons/fi";
import "./adminFilterBar.css";

const AdminFilterBar = () => {
  return (
    <div className="filter-bar">
      {/* LEFT */}
      <div className="filter-left">
        <button className="icon-btn">☰</button>
      </div>

      {/* RIGHT */}
      <div className="filter-right">
        <div className="search-btn">
          <FaSearch />
        </div>

        <div className="user-box">
          <img
            src="https://i.pravatar.cc/40"
            alt="avatar"
            className="avatar"
          />
          <div className="user-info">
            <span className="name">Mai Anh Văn</span>
            <span className="role">Admin</span>
          </div>
        </div>

        <div className="notify">
          <FiBell />
          <span className="dot">2</span>
        </div>
      </div>
    </div>
  );
};

export default AdminFilterBar;
