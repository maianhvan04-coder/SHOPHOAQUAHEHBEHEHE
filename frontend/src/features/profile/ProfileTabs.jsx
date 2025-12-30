const ProfileTabs = ({ active, onChange }) => {
  return (
    <div className="flex gap-8 border-b border-gray-100 mb-8">
      <button
        onClick={() => onChange("profile")}
        className={`pb-4 text-sm font-semibold transition-all relative ${
          active === "profile"
            ? "text-emerald-600"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        Thông tin tài khoản
        {active === "profile" && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
        )}
      </button>

      <button
        onClick={() => onChange("password")}
        className={`pb-4 text-sm font-semibold transition-all relative ${
          active === "password"
            ? "text-emerald-600"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        Đổi mật khẩu
        {active === "password" && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
        )}
      </button>
    </div>
  );
};

export default ProfileTabs;