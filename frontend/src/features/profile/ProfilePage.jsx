import { useState, useEffect, useMemo } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { updateProfileApi, changePasswordApi, uploadUserAvatarApi } from "~/api/user.api";
import ProfileTabs from "./ProfileTabs";
import { useAuth } from "~/app/providers/AuthProvides";

const ProfilePage = () => {
  const { user } = useAuth();

  const [tab, setTab] = useState("profile");

  const [form, setForm] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
  });

  // ===== avatar state =====
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatar, setAvatar] = useState(user?.image || { url: "", publicId: "" });

  const avatarPreview = useMemo(() => {
    if (!avatarFile) return "";
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  const [pwd, setPwd] = useState({ old: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ old: false, new: false, confirm: false });

  useEffect(() => {
    if (user) {
      setForm({ name: user.fullName || "", email: user.email || "" });
      setAvatar(user.image || { url: "", publicId: "" });
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handlePickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      alert("Ảnh tối đa 3MB thôi nha");
      return;
    }

    setAvatarFile(f);
  };

  // ✅ Upload avatar: backend trả { message, data: { image } }
  const handleUploadAvatar = async () => {
    if (!avatarFile) return alert("Chọn ảnh trước đã");

    try {
      setAvatarUploading(true);

      const res = await uploadUserAvatarApi(avatarFile);
      // res = { message, data: { image } }
      const uploadedImage = res?.data?.image;

      if (!uploadedImage?.url) throw new Error("Upload thất bại");

      setAvatar(uploadedImage);
      setAvatarFile(null);

      // ✅ lưu tạm localStorage để reload vẫn có
      localStorage.setItem("user_image", JSON.stringify(uploadedImage));

      alert("Upload ảnh thành công ✨");
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || "Upload thất bại");
    } finally {
      setAvatarUploading(false);
    }
  };

  // ✅ Update profile: backend trả { data: updatedUser, message }
  const handleUpdateProfile = async () => {
    try {
      const payload = {
        fullName: form.name,
        image: avatar, // { url, publicId }
      };

      const res = await updateProfileApi(payload);
      // res = { data: updatedUser, message }
      const updatedUser = res?.data;

      if (!updatedUser || !updatedUser._id) throw new Error("Lỗi dữ liệu");

      localStorage.setItem("user_id", updatedUser._id);
      localStorage.setItem("user_email", updatedUser.email || "");
      localStorage.setItem("user_fullName", updatedUser.fullName || "");
      localStorage.setItem("user_role", updatedUser.role || "user");
      if (updatedUser.image) localStorage.setItem("user_image", JSON.stringify(updatedUser.image));

      alert("Cập nhật thành công! ✨");
    } catch (err) {
      alert(`Cập nhật thất bại: ${err?.response?.data?.message || err?.message || "Error"}`);
    }
  };

  const handleChangePassword = async () => {
    if (pwd.new !== pwd.confirm) return alert("Mật khẩu không khớp");

    try {
      await changePasswordApi({ oldPassword: pwd.old, newPassword: pwd.new });

      alert("Đổi mật khẩu thành công, vui lòng đăng nhập lại");
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      alert(err?.response?.data?.message || "Thất bại");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">
        Cài đặt tài khoản
      </h1>

      <ProfileTabs active={tab} onChange={setTab} />

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
        {tab === "profile" && (
          <div className="space-y-6">
            {/* AVATAR */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                <img
                  src={avatarPreview || avatar?.url || "/avatar_placeholder.png"}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">Ảnh đại diện</div>
                <div className="text-xs text-gray-500 mt-1">PNG/JPG • tối đa 3MB</div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 cursor-pointer text-sm font-semibold">
                    Chọn ảnh
                    <input type="file" accept="image/*" onChange={handlePickAvatar} className="hidden" />
                  </label>

                  <button
                    onClick={handleUploadAvatar}
                    disabled={!avatarFile || avatarUploading}
                    className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {avatarUploading ? "Đang upload..." : "Upload"}
                  </button>

                  {avatarFile && (
                    <button
                      onClick={() => setAvatarFile(null)}
                      className="px-4 py-2 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-semibold"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* NAME */}
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wider font-bold text-gray-400 ml-1">
                Họ tên
              </label>
              <input
                name="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                placeholder="Nhập họ tên..."
              />
            </div>

            {/* EMAIL */}
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wider font-bold text-gray-400 ml-1">
                Email (Cố định)
              </label>
              <input
                value={form.email}
                disabled
                className="w-full bg-gray-100 text-gray-400 border-none rounded-2xl px-5 py-3.5 cursor-not-allowed outline-none"
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              className="w-full md:w-auto px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 mt-2"
            >
              Lưu thay đổi
            </button>
          </div>
        )}

        {tab === "password" && (
          <div className="space-y-5">
            {[
              { id: "old", label: "Mật khẩu hiện tại" },
              { id: "new", label: "Mật khẩu mới" },
              { id: "confirm", label: "Xác nhận mật khẩu" },
            ].map((f) => (
              <div key={f.id} className="grid gap-2">
                <label className="text-xs uppercase tracking-wider font-bold text-gray-400 ml-1">
                  {f.label}
                </label>

                <div className="relative">
                  <input
                    type={showPwd[f.id] ? "text" : "password"}
                    value={pwd[f.id]}
                    onChange={(e) => setPwd({ ...pwd, [f.id]: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3.5 pr-12 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => ({ ...s, [f.id]: !s[f.id] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl hover:bg-gray-200/60 text-gray-700 flex items-center justify-center"
                    aria-label={showPwd[f.id] ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPwd[f.id] ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleChangePassword}
              disabled={!pwd.old || pwd.new !== pwd.confirm}
              className="w-full md:w-auto px-10 py-3.5 bg-gray-900 text-white rounded-2xl font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed mt-4"
            >
              Đổi mật khẩu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
