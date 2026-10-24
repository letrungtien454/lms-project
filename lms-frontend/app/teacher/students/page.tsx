"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Download,
  UserPlus,
  Users,
  UserCheck,
  BookOpen,
  Award,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type Enrollment = {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amountPaid: number;
  enrolledAt: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
};

export default function TeacherStudentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setLoading(true);
    apiRequest<Enrollment[]>("/api/teacher/students")
      .then((data) => {
        setEnrollments(data || []);
        setError("");
      })
      .catch((cause: unknown) => {
        setError(
          cause instanceof Error ? cause.message : "Không tải được danh sách học viên."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Lấy danh sách khóa học duy nhất để fill vào bộ lọc
  const courseOptions = useMemo(() => {
    const courses = Array.from(new Set(enrollments.map((item) => item.courseTitle)));
    return courses;
  }, [enrollments]);

  // Thống kê Metrics
  const stats = useMemo(() => {
    const total = enrollments.length;
    const completed = enrollments.filter((item) => item.progressPercent === 100).length;
    const learning = total - completed;
    const newStudents = enrollments.filter((item) => {
      const date = new Date(item.enrolledAt);
      const now = new Date();
      return now.getTime() - date.getTime() <= 30 * 24 * 60 * 60 * 1000; // 30 ngày qua
    }).length;

    return { total, completed, learning, newStudents };
  }, [enrollments]);

  // Logic lọc dữ liệu
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((item) => {
      const matchesSearch =
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourse =
        selectedCourse === "ALL" || item.courseTitle === selectedCourse;

      const isCompleted = item.progressPercent === 100;
      const matchesStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "LEARNING" && !isCompleted) ||
        (selectedStatus === "COMPLETED" && isCompleted);

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [enrollments, searchQuery, selectedCourse, selectedStatus]);

  // Logic Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / pageSize));
  const paginatedEnrollments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEnrollments.slice(start, start + pageSize);
  }, [filteredEnrollments, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-7xl space-y-5">
        
        {/* --- 1. HEADER CHÍNH --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
              Quản lý học viên
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Theo dõi và quản lý học viên đăng ký các khóa học của bạn
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-blue-200/80 bg-white px-3.5 py-2 text-xs font-bold text-blue-600 shadow-2xs hover:bg-blue-50 transition cursor-pointer"
            >
              <Download className="size-4" /> Xuất Excel
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
            >
              <UserPlus className="size-4" /> Thêm học viên
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {error}
          </p>
        )}

        {/* --- 2. THANH SEARCH & BỘ LỌC --- */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm học viên (tên, email...)"
              className="w-full rounded-2xl border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500"
            />
          </div>

          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-blue-500"
          >
            <option value="ALL">Tất cả khóa học</option>
            {courseOptions.map((courseTitle) => (
              <option key={courseTitle} value={courseTitle}>
                {courseTitle}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="LEARNING">Đang học</option>
            <option value="COMPLETED">Đã hoàn thành</option>
          </select>
        </div>

        {/* --- 3. METRIC CARDS STATS --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Tổng học viên</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.total}</h3>
              <p className="mt-1 text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                ↑ 12% <span className="font-normal text-slate-400">so với tháng trước</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shrink-0">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Học viên mới</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.newStudents}</h3>
              <p className="mt-1 text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                ↑ 18% <span className="font-normal text-slate-400">so với tháng trước</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shrink-0">
              <UserCheck className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Đang học</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.learning}</h3>
              <p className="mt-1 text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                ↑ 8% <span className="font-normal text-slate-400">so với tháng trước</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <Award className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Hoàn thành</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.completed}</h3>
              <p className="mt-1 text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                ↑ 15% <span className="font-normal text-slate-400">so với tháng trước</span>
              </p>
            </div>
          </div>
        </div>

        {/* --- 4. BẢNG DANH SÁCH HỌC VIÊN --- */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3 w-12 text-center">STT</th>
                  <th className="pb-3">Họ tên</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Khóa học</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3">Ngày đăng ký</th>
                  <th className="pb-3 text-right pr-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="size-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>Đang tải danh sách học viên...</span>
                    </td>
                  </tr>
                ) : paginatedEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                      Không tìm thấy học viên nào.
                    </td>
                  </tr>
                ) : (
                  paginatedEnrollments.map((item, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1;
                    const isCompleted = item.progressPercent === 100;
                    const firstChar = item.studentName.trim().charAt(0).toUpperCase();

                    return (
                      <tr key={item.id} className="group hover:bg-slate-50/60 transition">
                        <td className="py-3.5 pl-3 text-center font-bold text-slate-400">
                          {stt}
                        </td>

                        <td className="py-3.5 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-full bg-blue-100/70 text-xs font-bold text-blue-700 shrink-0">
                              {firstChar}
                            </span>
                            <span>{item.studentName}</span>
                          </div>
                        </td>

                        <td className="text-slate-500 font-medium">
                          {item.studentEmail}
                        </td>

                        <td className="font-medium text-slate-700">
                          {item.courseTitle}
                        </td>

                        <td>
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600">
                              <span className="size-1.5 rounded-full bg-amber-500"></span>
                              Đã hoàn thành
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                              <span className="size-1.5 rounded-full bg-emerald-500"></span>
                              Đang học
                            </span>
                          )}
                        </td>

                        <td className="text-slate-400 font-medium">
                          {new Date(item.enrolledAt).toLocaleDateString("vi-VN")}
                        </td>

                        <td className="py-3.5 text-right pr-3">
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* --- 5. PAGINATION PHÂN TRANG --- */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold text-slate-400">
              Hiển thị {paginatedEnrollments.length} trên tổng số {filteredEnrollments.length} học viên
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