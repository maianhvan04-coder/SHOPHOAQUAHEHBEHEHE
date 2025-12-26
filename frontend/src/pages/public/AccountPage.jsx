import { useAuth } from "~/app/providers/AuthProvides";

export default function AccountPage() {
  const { user, roles, permissions } = useAuth();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Thông tin tài khoản</h1>

      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <div><b>Họ tên:</b> {user?.fullName || user?.name}</div>
        <div><b>Email:</b> {user?.email}</div>

        {!!roles?.length && <div><b>Roles:</b> {roles.join(", ")}</div>}
        {!!permissions?.length && <div><b>Permissions:</b> {permissions.join(", ")}</div>}
      </div>
    </div>
  );
}
