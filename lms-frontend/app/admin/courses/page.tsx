"use client";

import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  PauseCircle,
  Filter,
  MoreVertical,
  Eye,
  Pause,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type Course = {
  id: number;
  title: string;
  teacherName: string;
  categoryName: string | null;
  price: number;
  isPublished: boolean;
  studentCount: number;
  createdAt: string;
  thumbnailUrl?: string | null;
  status?: "PUBLISHED" | "PENDING" | "PAUSED";
};

function getCourseImageUrl(pathUrl?: string | null): string | null {
  if (!pathUrl?.trim()) return null;
  if (/^https?:\/\//i.test(pathUrl)) return pathUrl;
  return new URL(pathUrl.startsWith("/") ? pathUrl : `/${pathUrl}`, API_BASE_URL).toString();
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Active Menu Dropdown ID
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter States
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<Course[]>("/api/admin/courses");
      setCourses(data || []);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không tải được danh sách khóa học."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Click ngoài menu để đóng Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Danh mục duy nhất
  const categoryOptions = useMemo(() => {
    const cats = Array.from(
      new Set(courses.map((c) => c.categoryName).filter(Boolean))
    ) as string[];
    return cats;
  }, [courses]);

  // Thống kê Metrics
  const stats = useMemo(() => {
    const total = courses.length;
    const published = courses.filter((c) => c.isPublished || c.status === "PUBLISHED").length;
    const pending = courses.filter((c) => !c.isPublished && c.status !== "PAUSED").length;
    const paused = courses.filter((c) => c.status === "PAUSED").length;

    return { total, published, pending, paused };
  }, [courses]);

  // Logic Lọc Dữ Liệu
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.teacherName.toLowerCase().includes(query.toLowerCase());

      const matchesCategory =
        categoryFilter === "ALL" || c.categoryName === categoryFilter;

      const isPub = c.isPublished || c.status === "PUBLISHED";
      const isPaused = c.status === "PAUSED";
      const isPending = !isPub && !isPaused;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" && isPub) ||
        (statusFilter === "PENDING" && isPending) ||
        (statusFilter === "PAUSED" && isPaused);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [courses, query, categoryFilter, statusFilter]);

  // Logic Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Hàm đổi trạng thái khóa học (Phát hành / Tạm dừng / Chờ phát hành)
  async function updateCourseStatus(courseId: number, newStatus: "PUBLISHED" | "PAUSED" | "PENDING") {
    setBusyId(courseId);
    setActiveMenuId(null);
    try {
      await apiRequest(`/api/admin/courses/${courseId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không cập nhật được trạng thái khóa học."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteCourse(courseId: number, title: string) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}" không?`)) return;
    setBusyId(courseId);
    setActiveMenuId(null);
    setError("");
    try {
      await apiRequest(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không xóa được khóa học.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* --- 1. HEADER CHÍNH --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
              Quản lý khóa học
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Kiểm duyệt và quản lý trạng thái phát hành khóa học trên toàn hệ thống.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {error}
          </p>
        )}

        {/* --- 2. THẺ THỐNG KÊ (METRIC CARDS) --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Tổng khóa học</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.total}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Đang phát hành</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.published}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shrink-0">
              <Clock className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Chờ phát hành</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.pending}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shrink-0">
              <PauseCircle className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Tạm dừng</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.paused}</h3>
            </div>
          </div>
        </div>

        {/* --- 3. BẢNG DANH SÁCH & THANH LỌC --- */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm khóa học theo tên, giảng viên..."
                className="w-full rounded-2xl border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">Tất cả danh mục</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đang phát hành</option>
              <option value="PENDING">Chờ phát hành</option>
              <option value="PAUSED">Tạm dừng</option>
            </select>

            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              <Filter className="size-3.5" /> Lọc
            </button>
          </div>

          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full min-w-[850px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3 w-12 text-center">#</th>
                  <th className="pb-3 pl-2">Khóa học</th>
                  <th className="pb-3">Giảng viên</th>
                  <th className="pb-3">Danh mục</th>
                  <th className="pb-3 text-center">Học viên</th>
                  <th className="pb-3">Giá</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3 text-right pr-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Loader2 className="size-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>Đang tải danh sách khóa học...</span>
                    </td>
                  </tr>
                ) : paginatedCourses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                      Không tìm thấy khóa học phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedCourses.map((course, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1;
                    const thumbnail = getCourseImageUrl(course.thumbnailUrl);
                    const isBusy = busyId === course.id;

                    const isPub = course.isPublished || course.status === "PUBLISHED";
                    const isPaused = course.status === "PAUSED";

                    return (
                      <tr key={course.id} className="group hover:bg-slate-50/60 transition">
                        <td className="py-3.5 pl-3 text-center font-bold text-slate-400">
                          {stt}
                        </td>

                        <td className="py-3.5 pl-2 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            {thumbnail ? (
                              <img
                                src={thumbnail}
                                alt={course.title}
                                className="size-9 rounded-xl object-cover ring-1 ring-slate-200/80 shadow-2xs shrink-0"
                              />
                            ) : (
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <BookOpen className="size-4" />
                              </span>
                            )}
                            <span className="truncate max-w-[200px]">{course.title}</span>
                          </div>
                        </td>

                        <td className="text-slate-600 font-medium">
                          {course.teacherName}
                        </td>

                        <td>
                          <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                            {course.categoryName || "Chưa phân loại"}
                          </span>
                        </td>

                        <td className="text-center font-bold text-slate-700">
                          {course.studentCount}
                        </td>

                        <td className="font-bold text-slate-800">
                          {course.price === 0
                            ? "Miễn phí"
                            : `${new Intl.NumberFormat("vi-VN").format(course.price)}đ`}
                        </td>

                        <td>
                          {isPub ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                              <span className="size-1.5 rounded-full bg-emerald-500"></span>
                              Đang phát hành
                            </span>
                          ) : isPaused ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-600">
                              <span className="size-1.5 rounded-full bg-rose-500"></span>
                              Tạm dừng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600">
                              <span className="size-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Chờ phát hành
                            </span>
                          )}
                        </td>

                        {/* MENU THAO TÁC NÚT 3 CHẤM (3 LỰA CHỌN) */}
                        <td className="py-3.5 text-right pr-3 relative">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              setActiveMenuId(activeMenuId === course.id ? null : course.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-40"
                          >
                            {isBusy ? (
                              <Loader2 className="size-4 animate-spin text-blue-600" />
                            ) : (
                              <MoreVertical className="size-4" />
                            )}
                          </button>

                          {activeMenuId === course.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-3 top-10 z-50 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/50 animate-in fade-in duration-150 text-left"
                            >
                              {/* 1. LỰA CHỌN PHÁT HÀNH */}
                              <button
                                type="button"
                                onClick={() => void updateCourseStatus(course.id, "PUBLISHED")}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                              >
                                <Eye className="size-3.5" />
                                Phát hành
                              </button>

                              {/* 2. LỰA CHỌN TẠM DỪNG */}
                              <button
                                type="button"
                                onClick={() => void updateCourseStatus(course.id, "PAUSED")}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Pause className="size-3.5" />
                                Tạm dừng
                              </button>

                              <div className="my-1 border-t border-slate-100"></div>

                              <button
                                type="button"
                                onClick={() => void deleteCourse(course.id, course.title)}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                                Xóa khóa học
                              </button>
                            </div>
                          )}
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
              Hiển thị {paginatedCourses.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, filteredCourses.length)} trong{" "}
              {filteredCourses.length} khóa học
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
    </main>
  );
}