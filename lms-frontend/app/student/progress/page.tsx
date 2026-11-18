"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GitBranch,
  Loader2,
  LockKeyhole,
  LogOut,
  Play,
  RefreshCw,
  UserRoundPlus,
} from "lucide-react";
import { StudentHeader } from "@/components/student-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { StudentFooter } from "@/components/student-footer";
import { useStudentSidebarState } from "@/components/student-sidebar-state";
import { RoadmapIcon } from "@/components/roadmap-icon";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import { apiRequest } from "@/lib/api";
import {
  CatalogCourse,
  StudentUser,
  studentApi,
} from "@/lib/student-api";

type RoadmapStageProgress = {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  durationWeeks: number | null;
  courseId: number | null;
  courseTitle: string | null;
  courseEnrolled: boolean;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
};

type StudentRoadmap = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  durationWeeks: number | null;
  targetAudience: string | null;
  iconUrl: string | null;
  colorTheme: string;
  isPublished: boolean;
  enrolled: boolean;
  enrolledAt: string | null;
  progressPercent: number;
  stages: RoadmapStageProgress[];
};

function boundedPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export default function StudentRoadmapsPage() {
  const router = useRouter();
  const { collapsed, setCollapsed } = useStudentSidebarState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [roadmaps, setRoadmaps] = useState<StudentRoadmap[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyRoadmapId, setBusyRoadmapId] = useState<number | null>(null);

  const loadRoadmaps = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await studentApi<StudentRoadmap[]>("/api/student/roadmaps");
      setRoadmaps(data);
      setSelectedId((current) =>
        current !== null && data.some((roadmap) => roadmap.id === current)
          ? current
          : data[0]?.id ?? null,
      );
      setError("");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Không tải được lộ trình học tập.";
      setError(
        message.includes("(HTTP 403)")
          ? "Tài khoản hiện tại không có quyền xem dữ liệu học viên. Hãy đăng nhập bằng tài khoản học viên."
          : message,
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(`/auth?returnUrl=${encodeURIComponent("/student/progress")}`);
      setLoading(false);
      return;
    }

    let active = true;
    setIsLoggedIn(true);
    void loadRoadmaps();
    void apiRequest<StudentUser>("/api/users/me")
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch((cause: unknown) => console.error("Không tải được hồ sơ học viên:", cause));
    void apiRequest<CatalogCourse[]>("/api/courses")
      .then((items) => {
        if (active) setCourses(items);
      })
      .catch((cause: unknown) => console.error("Không tải được danh sách khóa học:", cause));

    return () => {
      active = false;
    };
  }, [loadRoadmaps, router]);

  const selectedRoadmap = useMemo(
    () => roadmaps.find((roadmap) => roadmap.id === selectedId) ?? null,
    [roadmaps, selectedId],
  );
  const enrolledCount = roadmaps.filter((roadmap) => roadmap.enrolled).length;
  const completedCount = roadmaps.filter(
    (roadmap) => roadmap.enrolled && roadmap.progressPercent >= 100,
  ).length;

  async function toggleEnrollment(roadmap: StudentRoadmap) {
    setBusyRoadmapId(roadmap.id);
    setError("");
    try {
      const method = roadmap.enrolled ? "DELETE" : "POST";
      await studentApi<void>(`/api/student/roadmaps/${roadmap.id}/enroll`, { method });
      await loadRoadmaps(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được lộ trình.");
    } finally {
      setBusyRoadmapId(null);
    }
  }

  function handleLogout() {
    clearAuthSession();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/auth");
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fbff] text-slate-900">
      <StudentHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
        courses={courses}
        onLogout={handleLogout}
        variant="learning"
      />
      <div className="flex flex-1">
        {isLoggedIn && (
          <StudentSidebar collapsed={collapsed} activeTab="Tiến độ & Lộ trình" />
        )}
        <main className={`min-w-0 flex-1 transition-all duration-300 ${isLoggedIn ? (collapsed ? "md:ml-19" : "md:ml-64") : ""}`}>
          <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-600">Học tập của tôi</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#17305f]">Tiến độ &amp; lộ trình</h1>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Theo dõi các chặng học và tiếp tục khóa học trong những lộ trình bạn đang theo đuổi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void loadRoadmaps()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-xs hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                Làm mới
              </button>
            </header>

            {error && (
              <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <span>{error}</span>
                <button type="button" onClick={() => setError("")} aria-label="Đóng thông báo" className="font-bold">Đóng</button>
              </div>
            )}

            <section className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Lộ trình đang theo", value: enrolledCount, icon: GitBranch, tone: "bg-blue-50 text-blue-600" },
                { label: "Đã hoàn thành", value: completedCount, icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-600" },
                { label: "Lộ trình có thể tham gia", value: roadmaps.length - enrolledCount, icon: BookOpen, tone: "bg-violet-50 text-violet-600" },
              ].map(({ label, value, icon: Icon, tone }) => (
                <article key={label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.04)]">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{value.toLocaleString("vi-VN")}</p>
                  </div>
                  <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
                </article>
              ))}
            </section>

            {loading ? (
              <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-100 bg-white">
                <Loader2 className="size-7 animate-spin text-blue-600" />
              </div>
            ) : error && roadmaps.length === 0 ? (
              <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
                <LockKeyhole className="mx-auto size-9 text-amber-600" />
                <h2 className="mt-3 text-sm font-bold text-slate-800">Không thể tải lộ trình</h2>
                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-600">{error}</p>
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <GitBranch className="mx-auto size-10 text-slate-300" />
                <h2 className="mt-3 text-sm font-bold text-slate-800">Chưa có lộ trình công khai</h2>
                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                  Các lộ trình do quản trị viên xuất bản sẽ xuất hiện tại đây.
                </p>
                <button type="button" onClick={() => router.push("/courses")} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">
                  Khám phá khóa học
                </button>
              </div>
            ) : (
              <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.7fr)]">
                <section className="space-y-3">
                  <h2 className="text-sm font-extrabold text-slate-900">Lộ trình hiện có</h2>
                  {roadmaps.map((roadmap) => {
                    const selected = roadmap.id === selectedId;
                    const progress = boundedPercent(roadmap.progressPercent);
                    return (
                      <button
                        key={roadmap.id}
                        type="button"
                        onClick={() => setSelectedId(roadmap.id)}
                        className={`w-full rounded-2xl border bg-white p-4 text-left transition ${
                          selected ? "border-blue-300 ring-2 ring-blue-500/10 shadow-sm" : "border-slate-100 hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br ${roadmap.colorTheme || "from-blue-600 to-indigo-700"} text-white`}>
                            <RoadmapIcon value={roadmap.iconUrl} className="size-5" imageClassName="size-full object-cover" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-bold text-slate-900">{roadmap.title}</span>
                            <span className="mt-1 block text-[10px] text-slate-500">
                              {[roadmap.category, roadmap.durationWeeks ? `${roadmap.durationWeeks} tuần` : null, `${roadmap.stages.length} chặng`].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          {roadmap.enrolled && <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">Đang theo</span>}
                        </div>
                        <span className="mt-4 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <span className="block h-full rounded-full bg-blue-600 transition-all" style={{ width: `${roadmap.enrolled ? progress : 0}%` }} />
                        </span>
                        <span className="mt-1.5 flex justify-between text-[10px] text-slate-500">
                          <span>{roadmap.enrolled ? "Tiến độ" : "Chưa tham gia"}</span>
                          <span className="font-bold text-slate-700">{roadmap.enrolled ? `${progress}%` : "—"}</span>
                        </span>
                      </button>
                    );
                  })}
                </section>

                {selectedRoadmap && (
                  <section className="min-w-0 space-y-4">
                    <div className={`relative overflow-hidden rounded-3xl bg-linear-to-r ${selectedRoadmap.colorTheme || "from-blue-600 to-indigo-700"} p-5 text-white shadow-lg sm:p-7`}>
                      <GitBranch className="absolute -bottom-6 -right-4 size-40 opacity-10" />
                      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold">
                            <GitBranch className="size-3" /> LỘ TRÌNH HỌC
                          </span>
                          <h2 className="mt-3 text-lg font-extrabold sm:text-xl">{selectedRoadmap.title}</h2>
                          {selectedRoadmap.description && <p className="mt-2 max-w-2xl text-xs leading-5 text-white/80">{selectedRoadmap.description}</p>}
                          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold">
                            {selectedRoadmap.category && <span className="rounded-full bg-white/15 px-2.5 py-1">{selectedRoadmap.category}</span>}
                            {selectedRoadmap.durationWeeks && <span className="rounded-full bg-white/15 px-2.5 py-1">{selectedRoadmap.durationWeeks} tuần dự kiến</span>}
                            {selectedRoadmap.targetAudience && <span className="rounded-full bg-white/15 px-2.5 py-1">Phù hợp: {selectedRoadmap.targetAudience}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={busyRoadmapId === selectedRoadmap.id}
                          onClick={() => void toggleEnrollment(selectedRoadmap)}
                          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm disabled:opacity-60 ${
                            selectedRoadmap.enrolled ? "bg-white/15 text-white hover:bg-white/25" : "bg-white text-blue-700 hover:bg-blue-50"
                          }`}
                        >
                          {busyRoadmapId === selectedRoadmap.id ? <Loader2 className="size-3.5 animate-spin" /> : selectedRoadmap.enrolled ? <LogOut className="size-3.5" /> : <UserRoundPlus className="size-3.5" />}
                          {selectedRoadmap.enrolled ? "Bỏ theo lộ trình" : "Theo lộ trình"}
                        </button>
                      </div>
                      <div className="relative mt-5 flex items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
                          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${selectedRoadmap.enrolled ? boundedPercent(selectedRoadmap.progressPercent) : 0}%` }} />
                        </div>
                        <span className="text-xs font-bold">{selectedRoadmap.enrolled ? `${boundedPercent(selectedRoadmap.progressPercent)}%` : "Chưa bắt đầu"}</span>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs sm:p-7">
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Nội dung lộ trình</p>
                          <h3 className="mt-1 text-sm font-extrabold text-slate-900">Các chặng học</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">{selectedRoadmap.stages.length} chặng</span>
                      </div>

                      {selectedRoadmap.stages.length === 0 ? (
                        <p className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">Lộ trình này chưa có chặng học.</p>
                      ) : (
                        <ol className="relative mt-5 space-y-4 before:absolute before:bottom-5 before:left-4 before:top-5 before:w-px before:bg-slate-200">
                          {[...selectedRoadmap.stages].sort((a, b) => a.orderIndex - b.orderIndex).map((stage) => {
                            const progress = boundedPercent(stage.progressPercent);
                            const done = stage.totalLessons > 0 && stage.completedLessons >= stage.totalLessons;
                            const inProgress = stage.courseEnrolled && !done;
                            const course = courses.find((item) => item.id === stage.courseId);
                            const actionLabel = done ? "Đã hoàn thành" : inProgress ? "Học tiếp" : "Xem khóa học";
                            return (
                              <li key={stage.id} className="relative flex gap-3">
                                <span className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${
                                  done ? "bg-emerald-500 text-white" : inProgress ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                                }`}>
                                  {done ? <CheckCircle2 className="size-4" /> : inProgress ? <Play className="ml-0.5 size-3.5 fill-current" /> : stage.courseId ? <BookOpen className="size-3.5" /> : <LockKeyhole className="size-3.5" />}
                                </span>
                                <div className={`min-w-0 flex-1 rounded-2xl border p-4 ${
                                  inProgress ? "border-blue-200 bg-blue-50/40" : done ? "border-emerald-100 bg-white" : "border-slate-100 bg-slate-50/50"
                                }`}>
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-xs font-bold text-slate-900">{stage.orderIndex}. {stage.title}</h4>
                                        {done && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Hoàn thành</span>}
                                        {inProgress && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-700">Đang học</span>}
                                      </div>
                                      {stage.description && <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{stage.description}</p>}
                                      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                                        <BookOpen className="size-3.5 text-blue-500" />
                                        {stage.courseTitle || course?.title || (stage.courseId ? `Khóa học #${stage.courseId}` : "Chưa gắn khóa học")}
                                      </p>
                                      {stage.durationWeeks && (
                                        <p className="mt-1 text-[10px] font-semibold text-slate-500">Thời lượng dự kiến: {stage.durationWeeks} tuần</p>
                                      )}
                                    </div>
                                    {stage.courseId && (
                                      <button
                                        type="button"
                                        disabled={done}
                                        onClick={() => router.push(`${inProgress ? "/learning" : "/courses"}/${stage.courseId}`)}
                                        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[10px] font-bold ${
                                          done ? "cursor-default text-emerald-600" : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                      >
                                        {done ? <CheckCircle2 className="size-3.5" /> : inProgress ? <Play className="size-3" /> : <ArrowRight className="size-3.5" />}
                                        {actionLabel}
                                      </button>
                                    )}
                                  </div>
                                  {selectedRoadmap.enrolled && stage.totalLessons > 0 && (
                                    <div className="mt-3">
                                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                                        <span className="inline-flex items-center gap-1"><Clock3 className="size-3" />{stage.completedLessons}/{stage.totalLessons} bài học</span>
                                        <span className="font-bold">{progress}%</span>
                                      </div>
                                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                        <div className={`h-full rounded-full ${done ? "bg-emerald-500" : "bg-blue-600"}`} style={{ width: `${progress}%` }} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}
            <StudentFooter variant="learning" />
          </div>
        </main>
      </div>
    </div>
  );
}
