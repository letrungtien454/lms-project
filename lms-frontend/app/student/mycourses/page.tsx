"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Code2,
  Play,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { getStudentCategoryLabel } from "@/components/student-category-menu";
import { useStudentSidebarState } from "@/components/student-sidebar-state";

// Import 3 Component dùng chung
import { StudentHeader } from "@/components/student-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { StudentFooter } from "@/components/student-footer";
import {
  type CatalogCourse,
  type EnrolledCourse,
  formatStudentDate,
  STUDENT_API_URL,
  studentApi,
  type StudentUser,
} from "@/lib/student-api";

export default function MyCoursesPage() {
  const router = useRouter();
  const { collapsed, setCollapsed } = useStudentSidebarState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [dbCourses, setDbCourses] = useState<CatalogCourse[]>([]);
  const [myCourses, setMyCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Lọc state
  const [activeTab, setActiveTab] = useState<"all" | "learning" | "completed">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Kiểm tra đăng nhập
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setIsLoggedIn(true);
      fetch(`${STUDENT_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Không thể tải hồ sơ học viên (HTTP ${res.status}).`);
          return res.json();
        })
        .then((data) => {
          if (data) setUser(data);
        })
        .catch((error: unknown) => {
          setLoadError(error instanceof Error ? error.message : "Không thể tải hồ sơ học viên.");
        });
    }
  }, []);

  // Lấy dữ liệu API khóa học hệ thống (nếu có)
  useEffect(() => {
    fetch(`${STUDENT_API_URL}/api/courses`)
      .then((res) => {
        if (!res.ok) throw new Error(`Không thể tải danh sách khóa học (HTTP ${res.status}).`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setDbCourses(data);
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "Không thể tải danh sách khóa học.");
      });
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(`/auth?returnUrl=${encodeURIComponent("/student/mycourses")}`);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoggedIn(true);
    studentApi<EnrolledCourse[]>("/api/students/me/courses")
      .then((data) => {
        if (!cancelled) setMyCourses(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Không thể tải khóa học đã đăng ký.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/auth");
  };

  // Tính số lượng từng tab
  const counts = useMemo(() => {
    const learning = myCourses.filter((course) => course.progressPercent < 100).length;
    const completed = myCourses.filter(
      (course) => course.totalLessons > 0 && course.progressPercent === 100,
    ).length;
    return {
      all: myCourses.length,
      learning,
      completed,
    };
  }, [myCourses]);

  // Đọc danh sách khóa học lọc theo Tab & Search
  const filteredCourses = useMemo(() => {
    return myCourses.filter((course) => {
      // Lọc theo Tab
      const isCompleted = course.totalLessons > 0 && course.progressPercent === 100;
      if (activeTab === "learning" && isCompleted) return false;
      if (activeTab === "completed" && !isCompleted) return false;

      // Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchInstructor = course.instructorName.toLowerCase().includes(q);
        const matchCategory = course.categoryName.toLowerCase().includes(q);
        return matchTitle || matchInstructor || matchCategory;
      }

      return true;
    });
  }, [activeTab, myCourses, searchQuery]);
  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    if (currentPage > pageCount) setCurrentPage(pageCount);
  }, [currentPage, pageCount]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f8fbff] text-slate-900">
      {/* 1. HEADER DÙNG CHUNG */}
      <StudentHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
        courses={dbCourses}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 2. SIDEBAR DÙNG CHUNG */}
        {isLoggedIn && (
          <StudentSidebar
            collapsed={collapsed}
            activeTab="Khóa học của tôi"
          />
        )}

        {/* 3. MAIN CONTENT VÀ FOOTER TRONG CÙNG KHUNG NÊN CO GIÃN CHUẨN */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isLoggedIn ? (collapsed ? "md:ml-19" : "md:ml-64") : "ml-0"
          }`}
        >
          <div className="mx-auto max-w-7xl p-5 lg:p-8 space-y-6">
            {/* TIÊU ĐỀ TRANG */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
                Khóa học của tôi
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Danh sách các khóa học bạn đã đăng ký và đang học
              </p>
            </div>

            {/* THANH THAO TÁC: TAB LỌC & TÌM KIẾM KHÓA HỌC */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-4">
              {/* Cụm Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setCurrentPage(1);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    activeTab === "all"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  Tất cả ({counts.all})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("learning");
                    setCurrentPage(1);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    activeTab === "learning"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  Đang học ({counts.learning})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("completed");
                    setCurrentPage(1);
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    activeTab === "completed"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                  }`}
                >
                  Hoàn thành ({counts.completed})
                </button>
              </div>

              {/* Tìm kiếm khóa học */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Tìm khóa học..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>
            </div>

            {/* DANH SÁCH THẺ KHÓA HỌC */}
            <div className="space-y-4 min-h-87.5">
              {!isLoading && !loadError && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white px-4 py-3">
                  <p className="text-sm font-bold text-slate-700" aria-live="polite">
                    {filteredCourses.length} khóa học
                    {searchQuery.trim() || activeTab !== "all"
                      ? ` · ${counts.all} khóa học tổng cộng`
                      : ""}
                  </p>
                  {filteredCourses.length > pageSize && (
                    <span className="text-xs text-slate-400">
                      {pageSize} khóa học mỗi trang
                    </span>
                  )}
                </div>
              )}
              {loadError ? (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {loadError}
                </p>
              ) : isLoading ? (
                <p role="status" className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
                  Đang tải khóa học đã đăng ký...
                </p>
              ) : filteredCourses.length > 0 ? (
                paginatedCourses.map((course) => {
                  const isCompleted = course.totalLessons > 0 && course.progressPercent === 100;

                  return (
                    <div
                      key={course.id}
                      className="group flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition hover:shadow-md hover:border-blue-100 md:flex-row md:items-center md:justify-between"
                    >
                      {/* Trái: Ảnh Thumbnail & Tên khóa học */}
                      <div className="flex flex-1 items-center gap-4">
                        {/* Thumbnail có Icon nổi bật */}
                        <div
                          className="relative flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-blue-600 to-indigo-700 text-white shadow-xs"
                        >
                          {course.thumbnailUrl ? (
                            <img
                              src={course.thumbnailUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <Code2 className="size-10 opacity-90 transition-transform group-hover:scale-110" />
                          )}
                        </div>

                        {/* Thông tin khóa học */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-800 truncate">
                              {course.title}
                            </h3>
                          </div>

                          {/* Giảng viên & Danh mục */}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5 font-medium">
                              <span className="flex size-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                                {course.instructorName.trim().split(/\s+/).at(-1)?.charAt(0).toLocaleUpperCase("vi")}
                              </span>
                              <span>{course.instructorName}</span>
                            </div>
                            <span>•</span>
                            <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                              {getStudentCategoryLabel(course.categoryName)}
                            </span>
                          </div>

                          {/* Thanh Tiến độ */}
                          <div className="mt-3 max-w-sm">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                              <span>Tiến độ: {course.progressPercent}% ({course.completedLessons}/{course.totalLessons} bài)</span>
                            </div>
                            <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isCompleted ? "bg-blue-600" : "bg-blue-600"
                                }`}
                                style={{ width: `${course.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phải: Trạng thái, Nút hành động & Cập nhật */}
                      <div className="flex flex-col items-end justify-between gap-3 border-t border-slate-100 pt-3 md:border-t-0 md:pt-0 shrink-0">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                            isCompleted
                              ? "bg-purple-50 text-purple-600 border border-purple-100"
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          }`}
                        >
                          {isCompleted ? "✓ Hoàn thành" : "Đang học"}
                        </span>

                        <div className="flex flex-col items-end gap-1 w-full md:w-auto">
                          <button
                            onClick={() => router.push(`/learning/${course.id}`)}
                            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition active:scale-95 cursor-pointer md:w-auto ${
                              isCompleted
                                ? "border border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200"
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <RotateCcw className="size-3.5" /> Xem lại khóa học
                              </>
                            ) : (
                              <>
                                Tiếp tục học <ArrowRight className="size-3.5" />
                              </>
                            )}
                          </button>
                          <span className="text-[10px] font-medium text-slate-400">
                            Đăng ký: {formatStudentDate(course.enrolledAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                    <Sparkles className="size-7" />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    Không tìm thấy khóa học nào
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Thử thay đổi từ khóa tìm kiếm hoặc lọc theo tab khác nhé!
                  </p>
                </div>
              )}
            </div>
            {!loadError && !isLoading && (
              <nav
                aria-label="Phân trang khóa học"
                className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-4"
              >
                <span className="text-[11px] text-slate-500">
                  {filteredCourses.length} khóa học · {pageSize} khóa học mỗi trang
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Trang trước"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="px-2 text-xs font-semibold text-slate-600">
                    {currentPage} / {pageCount}
                  </span>
                  <button
                    type="button"
                    aria-label="Trang tiếp theo"
                    disabled={currentPage >= pageCount}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(pageCount, page + 1))
                    }
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </nav>
            )}
          </div>

          {/* 4. FOOTER NẰM TRONG MAIN GIÚP CO GIÃN CHUẨN */}
          <StudentFooter variant="learning" />
        </main>
      </div>
    </div>
  );
}