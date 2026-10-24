"use client";

import { FormEvent, useCallback, useEffect, useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  courseCount?: number;
  isActive?: boolean;
};

type CategoryForm = { name: string; slug: string; description: string };
const emptyForm: CategoryForm = { name: "", slug: "", description: "" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Tải danh sách danh mục
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Category[]>("/api/admin/categories");
      setCategories(data || []);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không tải được danh mục."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Tự động sinh Slug khi gõ Tên danh mục
  const handleNameChange = (nameVal: string) => {
    const generatedSlug = nameVal
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((prev) => ({
      ...prev,
      name: nameVal,
      slug: editingId ? prev.slug : generatedSlug,
    }));
  };

  // Mở modal tạo mới
  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // Mở modal chỉnh sửa
  const openEditModal = (category: Category) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setShowModal(true);
  };

  // Lưu thông tin danh mục (POST / PUT)
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;

    setSaving(true);
    try {
      await apiRequest(
        `/api/admin/categories${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(form),
        }
      );
      setForm(emptyForm);
      setEditingId(null);
      setShowModal(false);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không lưu được danh mục."
      );
    } finally {
      setSaving(false);
    }
  }

  // Xóa danh mục (DELETE)
  async function remove(category: Category) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      return;
    }
    try {
      await apiRequest(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không xóa được danh mục."
      );
    }
  }

  // Lọc danh mục theo ô tìm kiếm
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const query = searchQuery.toLowerCase();
      return (
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
      );
    });
  }, [categories, searchQuery]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* --- 1. HEADER CHÍNH & NÚT THÊM --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
              Quản lý danh mục
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Quản lý các danh mục khóa học trên hệ thống.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
          >
            <Plus className="size-4" /> Thêm danh mục
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {error}
          </p>
        )}

        {/* --- 2. BẢNG DANH SÁCH & THANH LỌC --- */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          
          {/* Thanh Tìm Kiếm */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm danh mục theo tên, slug..."
              className="w-full rounded-2xl border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500"
            />
          </div>

          {/* Table hiển thị */}
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full min-w-[750px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3 w-12 text-center">#</th>
                  <th className="pb-3 pl-2">Tên danh mục</th>
                  <th className="pb-3">Slug</th>
                  <th className="pb-3 max-w-xs">Mô tả</th>
                  <th className="pb-3 text-center">Số khóa học</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3 text-right pr-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="size-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>Đang tải danh sách danh mục...</span>
                    </td>
                  </tr>
                ) : paginatedCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                      Không tìm thấy danh mục phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedCategories.map((category, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1;

                    return (
                      <tr key={category.id} className="group hover:bg-slate-50/60 transition">
                        <td className="py-3.5 pl-3 text-center font-bold text-slate-400">
                          {stt}
                        </td>

                        <td className="py-3.5 pl-2 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                              <FolderTree className="size-4" />
                            </span>
                            <span>{category.name}</span>
                          </div>
                        </td>

                        <td className="text-slate-500 font-mono text-[11px]">
                          {category.slug}
                        </td>

                        <td className="text-slate-500 font-medium max-w-xs truncate">
                          {category.description || "—"}
                        </td>

                        <td className="text-center font-bold text-slate-700">
                          {category.courseCount ?? 0}
                        </td>

                        <td>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                            Hoạt động
                          </span>
                        </td>

                        <td className="py-3.5 text-right pr-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(category)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              title="Chỉnh sửa danh mục"
                            >
                              <Edit3 className="size-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void remove(category)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Xóa danh mục"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold text-slate-400">
              Hiển thị {paginatedCategories.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, filteredCategories.length)} trong{" "}
              {filteredCategories.length} danh mục
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`flex size-7 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* --- 3. MODAL THÊM / SỬA DANH MỤC --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#17305f]">
                  {editingId ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Quản lý danh mục bài học trên hệ thống
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={save} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên danh mục <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  maxLength={100}
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Lập trình Web, Trí tuệ nhân tạo..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Slug (Đường dẫn thân thiện) <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  maxLength={100}
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="lap-trinh-web"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả danh mục</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Giới thiệu tóm tắt danh mục khóa học này..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer disabled:opacity-60"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  <span>{saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo danh mục"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}