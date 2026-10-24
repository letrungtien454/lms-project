"use client";

import { useState, useEffect, useCallback, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Search,
  Users,
  TrendingUp,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Layers,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  X,
  Loader2,
  CheckSquare,
  ListChecks,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type Course = {
  id: number;
  title: string;
  subtitle?: string;
  categoryName?: string | null;
  categoryId?: number | null;
  studentCount: number;
  price: number;
  status?: "PENDING" | "PUBLISHED" | "REJECTED" | string;
  isPublished?: boolean;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  createdAt: string;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
  description?: string;
  outcomes?: string;
  requirements?: string;
};

type Category = {
  id: number;
  name: string;
};

function formatDateOnly(isoString?: string): string {
  if (!isoString) return "—";
  return isoString.split("T")[0];
}

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // --- 1. STATES DÀNH CHO PHÂN TRANG (PAGINATION) ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // --- 2. STATES DÀNH CHO FORM TẠO / SỬA KHÓA HỌC ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [courseForm, setCourseForm] = useState({
    title: "",
    categoryId: "",
    price: "0",
    level: "ALL_LEVELS" as NonNullable<Course["level"]>,
    description: "",
    thumbnailUrl: "",
    outcomes: "",
    requirements: "",
  });

  // Menu Dropdown Thao tác
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tải dữ liệu thật từ Backend
  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const [courseData, categoryData] = await Promise.all([
        apiRequest<Course[]>("/api/teacher/courses"),
        apiRequest<Category[]>("/api/categories"),
      ]);
      setCourses(courseData);
      setCategories(categoryData);
      setError("");
    } catch (cause) {
      setCourses([]);
      setCategories([]);
      setError(cause instanceof Error ? cause.message : "Không thể tải khóa học và danh mục.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mở Modal Tạo Mới Khóa Học
  const openCreateModal = () => {
    setCourseForm({
      title: "",
      categoryId: "",
      price: "0",
      level: "ALL_LEVELS",
      description: "",
      thumbnailUrl: "",
      outcomes: "",
      requirements: "",
    });
    setShowCreateModal(true);
  };

  // Mở Modal Chỉnh Sửa Khóa Học
  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || "",
      categoryId: course.categoryId ? String(course.categoryId) : "",
      price: String(course.price || 0),
      level: course.level || "ALL_LEVELS",
      description: course.description || "",
      thumbnailUrl: course.thumbnailUrl || course.thumbnail || "",
      outcomes: course.outcomes || "",
      requirements: course.requirements || "",
    });
  };

  // Xử lý nộp Form (Tạo mới hoặc Cập nhật)
  const handleSubmitCourse = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim() || null,
        price: Number(courseForm.price),
        level: courseForm.level,
        categoryId: courseForm.categoryId ? Number(courseForm.categoryId) : null,
        thumbnailUrl: courseForm.thumbnailUrl.trim() || null,
        outcomes: courseForm.outcomes.trim() || null,
        requirements: courseForm.requirements.trim() || null,
      };

      if (editingCourse) {
        // Cập nhật Khóa học (PUT)
        await apiRequest(`/api/teacher/courses/${editingCourse.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setEditingCourse(null);
      } else {
        // Tạo mới Khóa học (POST)
        await apiRequest("/api/teacher/courses", {
          method: "POST",
          body: JSON.stringify({ ...payload, isPublished: false }),
        });
        setShowCreateModal(false);
      }

      await loadCourses();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Thao tác khóa học thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý Xóa Khóa Học chuẩn hóa
  const handleDeleteCourse = async (courseId: number, courseTitle: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${courseTitle}" không?`)) return;

    setDeletingId(courseId);
    setError("");
    setActiveMenuId(null);

    try {
      await apiRequest(`/api/teacher/courses/${courseId}`, { method: "DELETE" });
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể xóa khóa học này (có thể do khóa học đã có học viên đăng ký)."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // --- LOGIC LỌC VÀ PHÂN TRANG DỮ LIỆU ---
  const publishedCount = courses.filter((course) => course.isPublished).length;
  const pendingCount = courses.length - publishedCount;
  const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isPub = course.status === "PUBLISHED" || course.isPublished;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PUBLISHED" && isPub) ||
      (statusFilter === "PENDING" && !isPub);
    const matchesCategory =
      categoryFilter === "ALL" || course.categoryName === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-6 font-sans text-slate-800 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
            {error}
          </p>
        )}

        {/* --- 1. HEADER CHÍNH --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
              Quản lý khóa học
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Tạo, chỉnh sửa và quản lý các khóa học của bạn
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="size-4" /> Tạo khóa học mới
          </button>
        </div>

        {/* --- 2. METRIC CARDS --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Tổng khóa học</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{courses.length}</h3>
              <p className="mt-1 text-[10px] font-bold text-slate-400">Theo dữ liệu hiện có</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Đang phát hành</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{publishedCount}</h3>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                Đã công khai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Clock className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Chờ phát hành</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{pendingCount}</h3>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-500">
                Chờ duyệt
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Tổng học viên</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{totalStudents}</h3>
              <p className="mt-1 text-[10px] font-bold text-slate-400">Đã ghi danh</p>
            </div>
          </div>
        </div>

        {/* --- 3. BẢNG DANH SÁCH & FILTERS --- */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm khóa học..."
                className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PUBLISHED">Đang phát hành</option>
                <option value="PENDING">Chờ phát hành</option>
              </select>

              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                <button className="p-1.5 rounded-lg bg-white shadow-2xs text-blue-600">
                  <List className="size-4" />
                </button>
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600">
                  <LayoutGrid className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table hiển thị */}
          <div className="overflow-x-auto min-h-75">
            <table className="w-full min-w-187.5 text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3 w-12 text-center">STT</th>
                  <th className="pb-3 pl-2">Khóa học</th>
                  <th className="pb-3">Danh mục</th>
                  <th className="pb-3">Học viên</th>
                  <th className="pb-3">Giá</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3">Ngày tạo</th>
                  <th className="pb-3 text-right pr-2">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedCourses.map((course, index) => {
                  const isPublished = course.status === "PUBLISHED" || course.isPublished;
                  const thumbnail =
                    course.thumbnailUrl ||
                    course.thumbnail ||
                    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600";
                  const stt = (currentPage - 1) * pageSize + index + 1;
                  const isDeleting = deletingId === course.id;

                  return (
                    <tr key={course.id} className="group hover:bg-slate-50/60 transition">
                      <td className="py-3.5 pl-3 text-center font-bold text-slate-400">{stt}</td>

                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={thumbnail}
                            alt={course.title}
                            className="size-10 rounded-xl object-cover ring-1 ring-slate-200/80 shadow-xs shrink-0"
                          />
                          <div>
                            <p
                              onClick={() => router.push(`/teacher/lessons?courseId=${course.id}`)}
                              className="font-bold text-slate-800 group-hover:text-blue-600 transition cursor-pointer"
                            >
                              {course.title}
                            </p>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                              {course.subtitle || course.categoryName}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="inline-block rounded-full bg-blue-50/80 px-3 py-1 text-[10px] font-bold text-blue-600">
                          {course.categoryName || "Chưa phân loại"}
                        </span>
                      </td>

                      <td className="font-semibold text-slate-600">{course.studentCount}</td>

                      <td className="font-bold text-slate-800">
                        {course.price === 0
                          ? "Miễn phí"
                          : `${new Intl.NumberFormat("vi-VN").format(course.price)}đ`}
                      </td>

                      <td>
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                            Đang phát hành
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600">
                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Chờ phát hành
                          </span>
                        )}
                      </td>

                      <td className="text-slate-400 font-medium text-[11px]">
                        {formatDateOnly(course.createdAt)}
                      </td>

                      <td className="py-3.5 text-right pr-2 relative">
                        <button
                          disabled={isDeleting}
                          onClick={() => setActiveMenuId(activeMenuId === course.id ? null : course.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-4 animate-spin text-red-500" />
                          ) : (
                            <MoreHorizontal className="size-4" />
                          )}
                        </button>

                        {activeMenuId === course.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-2 top-10 z-50 w-44 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/50 animate-in fade-in duration-150 text-left"
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                router.push(`/teacher/lessons?courseId=${course.id}`);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                            >
                              <Layers className="size-3.5 text-blue-600" />
                              Quản lý bài học
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                openEditModal(course);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                              <Edit className="size-3.5 text-slate-500" />
                              Chỉnh sửa khóa học
                            </button>

                            <div className="my-1 border-t border-slate-100"></div>

                            <button
                              onClick={() => void handleDeleteCourse(course.id, course.title)}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 className="size-3.5 text-red-500" />
                              Xóa khóa học
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold text-slate-400">
              Hiển thị {paginatedCourses.length} trên tổng số {filteredCourses.length} khóa học
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
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

      {/* ================= MODAL FORM TẠO / SỬA KHÓA HỌC DÙNG CHUNG ================= */}
      {(showCreateModal || editingCourse !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSubmitCourse}
            className="w-full max-w-xl my-8 space-y-4 rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-[#17305f]">
                {editingCourse ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCourse(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="Ví dụ: Java Full Stack Masterclass"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Danh mục</label>
                  <select
                    value={courseForm.categoryId}
                    onChange={(e) => setCourseForm({ ...courseForm, categoryId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá bán (VND)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Trình độ</label>
                  <select
                    value={courseForm.level}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, level: e.target.value as NonNullable<Course["level"]> })
                    }
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ALL_LEVELS">Mọi trình độ</option>
                    <option value="BEGINNER">Cơ bản</option>
                    <option value="INTERMEDIATE">Trung cấp</option>
                    <option value="ADVANCED">Nâng cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ảnh bìa Thumbnail (URL)</label>
                <input
                  type="url"
                  value={courseForm.thumbnailUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả tóm tắt khóa học</label>
                <textarea
                  rows={2}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Giới thiệu nội dung trọng tâm của khóa học..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              {/* TRƯỜNG 1: OUTCOMES (BẠN SẼ HỌC ĐƯỢC GÌ) */}
              <div>
                <label className="block font-bold text-[#17305f] mb-1 flex items-center gap-1.5">
                  <ListChecks className="size-4 text-blue-600" />
                  Bạn sẽ học được gì? (Mỗi ý xuống 1 dòng)
                </label>
                <textarea
                  rows={3}
                  value={courseForm.outcomes}
                  onChange={(e) => setCourseForm({ ...courseForm, outcomes: e.target.value })}
                  placeholder="Ví dụ:&#10;Nắm vững tư duy lập trình Java nâng cao&#10;Tự xây dựng Restful API với Spring Boot"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500 bg-blue-50/20"
                />
              </div>

              {/* TRƯỜNG 2: REQUIREMENTS (YÊU CẦU ĐẦU VÀO) */}
              <div>
                <label className="block font-bold text-[#17305f] mb-1 flex items-center gap-1.5">
                  <CheckSquare className="size-4 text-amber-600" />
                  Yêu cầu đầu vào (Mỗi ý xuống 1 dòng)
                </label>
                <textarea
                  rows={3}
                  value={courseForm.requirements}
                  onChange={(e) => setCourseForm({ ...courseForm, requirements: e.target.value })}
                  placeholder="Ví dụ:&#10;Đã hoàn thành khóa học Java cơ bản&#10;Máy tính kết nối internet"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500 bg-amber-50/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 sticky bottom-0 bg-white z-10">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCourse(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer disabled:opacity-60"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting
                  ? "Đang lưu..."
                  : editingCourse
                  ? "Lưu thay đổi"
                  : "Tạo khóa học"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}