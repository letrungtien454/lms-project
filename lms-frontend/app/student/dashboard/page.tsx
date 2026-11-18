"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Play,
} from "lucide-react";
import { StudentHeader } from "@/components/student-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { useStudentSidebarState } from "@/components/student-sidebar-state";
import { StudentFooter } from "@/components/student-footer";
import {
  type CatalogCourse,
  type EnrolledCourse,
  type StudentNotification,
  type StudentUser,
  studentApi,
  timeAgo,
} from "@/lib/student-api";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { collapsed, setCollapsed } = useStudentSidebarState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [dbCourses, setDbCourses] = useState<CatalogCourse[]>([]);
  const [myCourses, setMyCourses] = useState<EnrolledCourse[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(`/auth?returnUrl=${encodeURIComponent("/student/dashboard")}`);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoggedIn(true);
    Promise.all([
      studentApi<EnrolledCourse[]>("/api/students/me/courses"),
      studentApi<StudentUser>("/api/users/me"),
      studentApi<CatalogCourse[]>("/api/courses"),
      studentApi<StudentNotification[]>("/api/notifications"),
      studentApi<number>("/api/notifications/unread-count"),
    ])
      .then(([courses, profile, catalog, recentNotifications, unread]) => {
        if (cancelled) return;
        setMyCourses(courses);
        setUser(profile);
        setDbCourses(catalog);
        setNotifications(recentNotifications.slice(0, 3));
        setUnreadCount(unread);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Không thể tải dữ liệu trang tổng quan.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const stats = useMemo(() => {
    const completedLessons = myCourses.reduce((sum, course) => sum + course.completedLessons, 0);
    const totalLessons = myCourses.reduce((sum, course) => sum + course.totalLessons, 0);
    const completedCourses = myCourses.filter(
      (course) => course.totalLessons > 0 && course.progressPercent === 100,
    ).length;
    const inProgressCourses = myCourses.filter(
      (course) => course.progressPercent > 0 && course.progressPercent < 100,
    ).length;
    const notStartedCourses = myCourses.filter((course) => course.progressPercent === 0).length;
    return {
      completedLessons,
      completedCourses,
      inProgressCourses,
      notStartedCourses,
      progress: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    };
  }, [myCourses]);

  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/auth");
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f8fbff] text-slate-900">
      <StudentHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
        courses={dbCourses}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        {isLoggedIn && <StudentSidebar collapsed={collapsed} activeTab="Trang cá nhân" />}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isLoggedIn ? (collapsed ? "md:ml-19" : "md:ml-64") : "ml-0"
          }`}
        >
          <div className="mx-auto max-w-7xl space-y-6 p-5 lg:p-8">
            <div className="rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-200 sm:p-8">
              <h1 className="text-2xl font-bold sm:text-3xl">
                Chào mừng{user?.fullName ? `, ${user.fullName}` : " bạn"} quay trở lại!
              </h1>
              <p className="mt-2 text-sm text-blue-100">
                Theo dõi tiến độ học tập và tiếp tục khóa học của bạn.
              </p>
              <button
                onClick={() => router.push("/courses")}
                className="mt-5 flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-700 shadow-md transition hover:bg-blue-50"
              >
                Khám phá khóa học <ArrowRight className="size-4" />
              </button>
            </div>

            {loadError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {loadError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Khóa học đã đăng ký", value: myCourses.length, icon: BookOpen, color: "bg-blue-50 text-blue-600" },
                { label: "Bài học hoàn thành", value: stats.completedLessons, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
                { label: "Tiến độ tổng thể", value: `${stats.progress}%`, icon: Clock, color: "bg-amber-50 text-amber-500" },
                { label: "Thông báo chưa đọc", value: unreadCount, icon: GraduationCap, color: "bg-violet-50 text-violet-600" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-800">
                      {isLoading ? "—" : value}
                    </p>
                  </div>
                  <div className={`flex size-11 items-center justify-center rounded-2xl ${color}`}>
                    <Icon className="size-5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.8fr_1.1fr]">
              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
                      <GraduationCap className="size-5 text-blue-600" />
                      Khóa học của tôi
                    </h2>
                    <button onClick={() => router.push("/student/mycourses")} className="text-xs font-bold text-blue-600 hover:underline">
                      Xem tất cả →
                    </button>
                  </div>
                  {isLoading ? (
                    <p role="status" className="py-8 text-center text-sm text-slate-500">Đang tải khóa học...</p>
                  ) : myCourses.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm font-semibold text-slate-600">Bạn chưa đăng ký khóa học nào.</p>
                      <button onClick={() => router.push("/courses")} className="mt-3 text-xs font-bold text-blue-600 hover:underline">
                        Tìm khóa học phù hợp
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {myCourses.slice(0, 4).map((course) => {
                        const completed = course.totalLessons > 0 && course.progressPercent === 100;
                        return (
                          <div key={course.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <BookOpen className="size-5" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-bold text-slate-800">{course.title}</h3>
                                <p className="mt-1 text-[11px] text-slate-500">{course.instructorName} · {course.categoryName}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="h-1.5 w-32 rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${course.progressPercent}%` }} />
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-500">{course.progressPercent}%</span>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => router.push(`/learning/${course.id}`)} className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs ${completed ? "bg-slate-700" : "bg-blue-600"}`}>
                              {completed ? "Xem lại" : <><Play className="size-3 fill-current" /> Tiếp tục học</>}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-800">Thông báo gần đây</h2>
                    <button onClick={() => router.push("/student/notifications")} className="text-xs font-bold text-blue-600 hover:underline">
                      Xem tất cả →
                    </button>
                  </div>
                  {isLoading ? (
                    <p role="status" className="py-6 text-center text-sm text-slate-500">Đang tải thông báo...</p>
                  ) : notifications.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">Chưa có thông báo.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start justify-between gap-3 rounded-xl bg-slate-50/80 p-3.5">
                          <div className="flex min-w-0 items-start gap-3">
                            <span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.isRead ? "bg-slate-300" : "bg-blue-500"}`} />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-slate-700">{notification.title}</p>
                              <p className="mt-1 line-clamp-2 text-xs text-slate-600">{notification.message}</p>
                            </div>
                          </div>
                          <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(notification.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
                  <h2 className="text-base font-bold text-slate-800">Tiến độ học tập</h2>
                  <div className="my-6 flex flex-col items-center justify-center">
                    <div
                      className="relative flex size-40 items-center justify-center rounded-full"
                      style={{ background: `conic-gradient(#2563eb ${stats.progress}%, #eff6ff 0)` }}
                    >
                      <div className="flex size-32 flex-col items-center justify-center rounded-full bg-white text-center">
                        <span className="text-3xl font-extrabold text-blue-600">{isLoading ? "—" : `${stats.progress}%`}</span>
                        <p className="text-[10px] font-semibold text-slate-400">Tổng tiến độ</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-xs font-medium text-slate-600">
                    <p className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-emerald-500" /> Hoàn thành {stats.completedCourses} khóa học</p>
                    <p className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-blue-600" /> Đang học {stats.inProgressCourses} khóa học</p>
                    <p className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-slate-300" /> Chưa bắt đầu {stats.notStartedCourses} khóa học</p>
                  </div>
                  <p className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-3.5 text-xs text-blue-800">
                    Tiến độ được tính từ số bài học đã hoàn thành trên tổng số bài trong các khóa học đã đăng ký.
                  </p>
                </section>
              </div>
            </div>
          </div>
          <StudentFooter variant="learning" />
        </main>
      </div>
    </div>
  );
}
