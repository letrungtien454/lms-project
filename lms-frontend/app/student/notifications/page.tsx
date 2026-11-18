"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import {
  Bell,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Import 3 Component dùng chung từ thư mục components
import { StudentHeader } from "@/components/student-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { useStudentSidebarState } from "@/components/student-sidebar-state";
import { StudentFooter } from "@/components/student-footer";
import {
  type CatalogCourse,
  STUDENT_API_URL,
  studentApi,
  type StudentNotification,
  type StudentNotificationPage,
  type StudentUser,
  timeAgo,
} from "@/lib/student-api";

export default function StudentNotificationsPage() {
  const router = useRouter();
  const { collapsed, setCollapsed } = useStudentSidebarState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [dbCourses, setDbCourses] = useState<CatalogCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [allCount, setAllCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // State quản lý danh sách & bộ lọc
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
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

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(`/auth?returnUrl=${encodeURIComponent("/student/notifications")}`);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoggedIn(true);
    setIsLoading(true);
    setLoadError("");
    const query = new URLSearchParams({
      page: String(currentPage - 1),
      size: String(pageSize),
      unreadOnly: String(activeTab === "unread"),
    });
    Promise.all([
      studentApi<StudentNotificationPage>(`/api/notifications/page?${query}`),
      studentApi<number>("/api/notifications/unread-count"),
      studentApi<StudentUser>("/api/users/me"),
      studentApi<CatalogCourse[]>("/api/courses"),
    ])
      .then(([result, unread, profile, catalog]) => {
        if (cancelled) return;
        if (result.totalPages > 0 && currentPage > result.totalPages) {
          setCurrentPage(result.totalPages);
          return;
        }
        setNotifications(result.content);
        setAllCount(result.totalElements);
        setPageCount(Math.max(1, result.totalPages));
        setUnreadCount(unread);
        setUser(profile);
        setDbCourses(catalog);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Không thể tải thông báo.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router, activeTab, currentPage, refreshKey]);

  // Lấy dữ liệu khóa học dùng cho Header
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

  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/auth");
  };

  const handleMarkAllRead = async () => {
    setActionError("");
    try {
      await studentApi<number>("/api/notifications/read-all", { method: "PATCH" });
      setUnreadCount(0);
      if (activeTab === "unread") setCurrentPage(1);
      setRefreshKey((key) => key + 1);
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể đánh dấu đã đọc.");
    }
  };

  const handleMarkRead = async (id: number) => {
    setActionError("");
    try {
      const updated = await studentApi<StudentNotification>(
        `/api/notifications/${id}/read`,
        { method: "PATCH" },
      );
      if (activeTab === "all") {
        setNotifications((current) => current.map((notification) =>
          notification.id === id ? updated : notification,
        ));
        setUnreadCount((count) => Math.max(0, count - 1));
      } else {
        setUnreadCount((count) => Math.max(0, count - 1));
        setRefreshKey((key) => key + 1);
      }
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Không thể cập nhật thông báo.");
    }
  };

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
          <StudentSidebar collapsed={collapsed} activeTab="Thông báo" />
        )}

        {/* 3. MAIN CONTENT VÀ FOOTER TRONG CÙNG KHUNG CO GIÃN CHUẨN */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isLoggedIn ? (collapsed ? "md:ml-19" : "md:ml-64") : "ml-0"
          }`}
        >
          <div className="mx-auto max-w-7xl p-5 lg:p-8 space-y-6">
            {/* HERO BANNER THÔNG BÁO XANH DƯƠNG MƯỢT MÀ */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#1b5bd8] via-[#2563eb] to-[#3b82f6] p-6 text-white shadow-lg shadow-blue-200/50 sm:p-8">
              <div className="relative z-10 flex items-center gap-5">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-inner">
                  <Bell className="size-8 fill-current" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">Thông báo</h1>
                  <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                    Cập nhật những thông tin mới nhất từ EduFlow dành cho bạn
                  </p>
                </div>
              </div>

              {/* Decor chuông 3D và tài liệu phía bên phải Banner */}
              <div className="absolute -right-4 -top-6 hidden pointer-events-none opacity-40 lg:block">
                <div className="size-48 rounded-full bg-white/10 blur-2xl" />
              </div>
            </div>

            {/* BỐ CỤC 2 CỘT CHÍNH */}
            <div>
              {/* CỘT TRÁI: DANH SÁCH THÔNG BÁO */}
              <div className="space-y-4">
                {/* Thanh Lọc Tab & Nút Đánh dấu đã đọc tất cả */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
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
                      Tất cả ({allCount})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("unread");
                        setCurrentPage(1);
                      }}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                        activeTab === "unread"
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
                      }`}
                    >
                      Chưa đọc ({unreadCount})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleMarkAllRead()}
                    disabled={unreadCount === 0}
                    className="flex items-center gap-1.5 self-start text-xs font-bold text-blue-600 hover:text-blue-700 sm:self-center cursor-pointer"
                  >
                    <Check className="size-4" /> Đánh dấu đã đọc tất cả
                  </button>
                </div>

                {/* DANH SÁCH THẺ THÔNG BÁO */}
                {actionError && (
                  <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{actionError}</p>
                )}
                <div className="space-y-3 min-h-90">
                  {isLoading ? (
                    <p role="status" className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">
                      Đang tải thông báo...
                    </p>
                  ) : loadError ? (
                    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      {loadError}
                    </p>
                  ) : notifications.length > 0 ? (
                    notifications.map((item) => {
                      return (
                        <div
                          key={item.id}
                          className={`group relative flex items-start justify-between gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                            !item.isRead
                              ? "border-blue-100 bg-blue-50/40 shadow-xs"
                              : "border-slate-100 bg-white hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Icon Loại Thông Báo */}
                            <div
                              className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
                                item.isRead ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-600"
                              } shadow-xs`}
                            >
                              <Bell className="size-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Tiêu đề & Chấm Xanh Chưa Đọc */}
                              <div className="flex items-center gap-2">
                                {!item.isRead && (
                                  <span className="size-2 rounded-full bg-blue-600 shrink-0" />
                                )}
                                <h3 className="text-sm font-bold text-slate-800 leading-snug">
                                  {item.title}
                                </h3>
                              </div>

                              {/* Nội dung chi tiết */}
                              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                {item.message}
                              </p>
                              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                                Người gửi: {item.senderName}
                              </p>
                            </div>
                          </div>

                          {/* Thời gian, Badge & Menu Ba Chấm */}
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[11px] font-medium text-slate-400">
                              {timeAgo(item.createdAt)}
                            </span>
                            {!item.isRead && (
                              <button
                                type="button"
                                onClick={() => void handleMarkRead(item.id)}
                                className="rounded-lg px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-100"
                              >
                                Đánh dấu đã đọc
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                      <Bell className="size-10 text-slate-300" />
                      <p className="mt-3 text-xs font-bold text-slate-600">
                        Không có thông báo nào trong mục này
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <span className="text-[11px] text-slate-500">
                    {allCount} thông báo · 8 thông báo mỗi trang
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="px-2 text-xs font-semibold text-slate-600">
                      {currentPage} / {pageCount}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= pageCount}
                      onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 4. FOOTER DÙNG CHUNG (CO GIÃN CHUẨN) */}
          <StudentFooter variant="learning" />
        </main>
      </div>
    </div>
  );
}