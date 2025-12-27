import { FaUserCircle, FaSignOutAlt, FaUser } from "react-icons/fa";

const UserPopup = ({ user, onProfile, onLogout }) => {
  if (!user || !user.email) return null;

  return (
    <div 
      className="w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Thông tin nhanh */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-50 mb-1">
        {user.image?.url ? (
          <img src={user.image.url} alt="avatar" className="w-10 h-10 rounded-full object-cover ring-2 ring-green-100" />
        ) : (
          <FaUserCircle className="w-10 h-10 text-gray-300" />
        )}
        <div className="flex flex-col truncate">
          <span className="font-bold text-gray-800 text-sm truncate">{user.fullName}</span>
          <span className="text-[11px] text-gray-400 truncate">{user.email}</span>
        </div>
      </div>

      {/* Nút bấm dạng danh sách dọc cho gọn */}
      <div className="space-y-1">
        <button
          onClick={onProfile}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all"
        >
          <FaUser className="opacity-70" />
          Tài khoản
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
        >
          <FaSignOutAlt className="opacity-70" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default UserPopup;