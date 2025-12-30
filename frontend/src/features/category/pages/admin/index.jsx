import { useState } from "react";
import { useAdminCategory } from "../../hooks/adminCategory";

export default function AdminCategoryPage() {
  const {
    categories,
    loading,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setName(c.name);
    setOpen(true);
  };

  return (
    <div className="p-6 space-y-6">

      {/* ===== HEADER + ACTION ===== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Quản lý danh mục
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các danh mục sản phẩm trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* SEARCH (NO ICON) */}
          <div className="relative z-30 w-72 rounded-xl bg-white shadow ring-1 ring-gray-200">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm danh mục..."
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none
                         focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={openCreate}
            className="rounded-xl bg-green-600 px-5 py-2.5
                       text-sm font-semibold text-white shadow
                       hover:bg-green-700 transition"
          >
            + Thêm danh mục
          </button>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="rounded-2xl bg-white shadow ring-1 ring-gray-200">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-sm text-gray-600">
                <th className="px-6 py-3 text-left font-medium">#</th>
                <th className="px-6 py-3 text-left font-medium">
                  Tên danh mục
                </th>
                <th className="px-6 py-3 text-right font-medium">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    Không có danh mục
                  </td>
                </tr>
              )}

              {categories.map((c, index) => (
                <tr
                  key={c._id}
                  className="group hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(page - 1) * 5 + index + 1}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-800">
                    {c.name}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-lg border border-yellow-300
                                   bg-yellow-50 px-3 py-1.5 text-sm
                                   text-yellow-700 shadow-sm
                                   hover:bg-yellow-100"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm("Xoá danh mục này?")) {
                            deleteCategory(c._id);
                          }
                        }}
                        className="rounded-lg border border-red-300
                                   bg-red-50 px-3 py-1.5 text-sm
                                   text-red-600 shadow-sm
                                   hover:bg-red-100"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex justify-end gap-1 border-t p-4">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 min-w-[36px] rounded-lg px-2 text-sm font-medium
                    ${
                      page === p
                        ? "bg-green-600 text-white shadow"
                        : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== MODAL ===== */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {editing ? "Sửa danh mục" : "Thêm danh mục"}
            </h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên danh mục"
              className="mb-5 w-full rounded-xl border
                         px-4 py-2.5 text-sm outline-none
                         focus:ring-2 focus:ring-green-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Huỷ
              </button>
              <button
                onClick={async () => {
                  if (!name.trim()) return;

                  if (editing) {
                    await updateCategory(editing._id, { name });
                  } else {
                    await createCategory({ name });
                  }

                  setOpen(false);
                }}
                className="rounded-lg bg-green-600 px-4 py-2
                           text-sm font-semibold text-white hover:bg-green-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
