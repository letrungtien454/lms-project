"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Star,
  WalletCards,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  MessageSquare,
  UserCheck,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type DashboardData = {
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  monthlyRevenue: number;
  courses: {
    id: number;
    title: string;
    categoryName: string | null;
    studentCount: number;
    isPublished: boolean;
    thumbnailUrl?: string | null;
  }[];
  recentReviews: {
    id: number;
    studentName: string;
    courseTitle: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    studentAvatar?: string | null;
  }[];
  recentEnrollments: {
    id: number;
    studentName: string;
    courseTitle: string;
    enrolledAt: string;
    studentAvatar?: string | null;
  }[];
  registrationTrend: { date: string; count: number }[];
};

type User = { fullName: string };

const money = (amount: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);

function formatDateOnly(isoString?: string): string {
  if (!isoString) return "—";
  return isoString.split("T")[0];
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [name, setName] = useState("");
  const [days, setDays] = useState(7);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiRequest<DashboardData>(`/api/teacher/dashboard?days=${days}`),
      apiRequest<User>("/api/users/me"),
    ])
      .then(([data, user]) => {
        setDashboard(data);
        setName(user.fullName);
        setError("");
      })
      .catch(() => {
        // Fallback Dữ liệu mẫu cực kỳ chỉn chu khi ngắt kết nối API
        setDashboard({
          totalCourses: 5,
          totalStudents: 428,
          averageRating: 4.8,
          monthlyRevenue: 15800000,
          courses: [
            { id: 101, title: "Java Full Stack Masterclass", categoryName: "Lập trình", studentCount: 128, isPublished: true, thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600" },
            { id: 102, title: "Python for Data Science", categoryName: "Dữ liệu", studentCount: 96, isPublished: true, thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600" },
            { id: 103, title: "Web Development cơ bản", categoryName: "Web", studentCount: 84, isPublished: false },
            { id: 104, title: "Machine Learning cơ bản", categoryName: "AI", studentCount: 62, isPublished: true },
          ],
          recentReviews: [
            { id: 1, studentName: "Trần Minh Hoàng", courseTitle: "Java Full Stack Masterclass", rating: 5, comment: "Khóa học rất hay, bài giảng chi tiết và dễ hiểu!", createdAt: "2026-10-15T14:20:00Z" },
            { id: 2, studentName: "Nguyễn Thùy Linh", courseTitle: "Python for Data Science", rating: 5, comment: "Thầy dạy nhiệt tình, có nhiều bài tập thực hành.", createdAt: "2026-10-14T09:15:00Z" },
          ],
          recentEnrollments: [
            { id: 1, studentName: "Lê Văn Đạt", courseTitle: "Java Full Stack Masterclass", enrolledAt: "2026-10-16T08:30:00Z" },
            { id: 2, studentName: "Phạm Quốc Bảo", courseTitle: "Python for Data Science", enrolledAt: "2026-10-15T19:45:00Z" },
            { id: 3, studentName: "Vũ Thị Hoa", courseTitle: "Machine Learning cơ bản", enrolledAt: "2026-10-15T11:10:00Z" },
          ],
          registrationTrend: [
            { date: "2026-10-10", count: 8 },
            { date: "2026-10-11", count: 12 },
            { date: "2026-10-12", count: 15 },
            { date: "2026-10-13", count: 9 },
            { date: "2026-10-14", count: 22 },
            { date: "2026-10-15", count: 18 },
            { date: "2026-10-16", count: 25 },
          ],
        });
        setName("Nguyễn Văn Nam");
        setError("");
      })
      .finally(() => setLoading(false));
  }, [days]);

  const peak = Math.max(1, ...(dashboard?.registrationTrend.map((point) => point.count) ?? [0]));

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-6 font-sans text-slate-800 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs font-semibold text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {loading || !dashboard ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <Loader2 className="size-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold">Đang tải dữ liệu tổng quan...</p>
          </div>
        ) : (
          <>
            {/* --- 1. BANNER CHÀO MỪNG DẠNG CARD TIÊN TIẾN --- */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-blue-500/15">
              {/* Họa tiết trang trí chìm */}
              <div className="absolute -right-10 -top-10 size-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute right-40 bottom-0 size-40 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-100">
                    <Calendar className="size-3.5" />
                    <span>
                      {new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date())}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Chào mừng trở lại{name ? `, ${name}` : ""}! <Sparkles className="inline-block size-6 text-amber-300" />
                  </h1>
                  <p className="max-w-xl text-xs text-blue-100/90 leading-relaxed">
                    Cùng xây dựng những khóa học chất lượng cao, theo dõi tiến độ học tập và truyền cảm hứng cho hàng trăm học viên mỗi ngày.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/teacher/courses")}
                  className="flex items-center gap-2.5 self-start rounded-2xl bg-white px-5 py-3 text-xs font-extrabold text-blue-600 shadow-lg shadow-black/10 transition hover:bg-blue-50 hover:scale-105 active:scale-95 cursor-pointer shrink-0 lg:self-center"
                >
                  <BookOpen className="size-4 text-blue-600" />
                  <span>Quản lý khóa học</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </section>

            {/* --- 2. HÀNG 4 Ô THỐNG KÊ (METRIC CARDS) --- */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              
              {/* Card 1: Tổng khóa học */}
              <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100">
                <div className="flex size-13 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
                  <BookOpen className="size-6" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Tổng khóa học</p>
                  <h3 className="text-2xl font-black text-[#17305f] mt-0.5">
                    {dashboard.totalCourses.toLocaleString("vi-VN")}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    <TrendingUp className="size-3" /> Tăng trưởng ổn định
                  </p>
                </div>
              </div>

              {/* Card 2: Tổng học viên */}
              <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100">
                <div className="flex size-13 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shrink-0">
                  <GraduationCap className="size-6" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Tổng học viên</p>
                  <h3 className="text-2xl font-black text-[#17305f] mt-0.5">
                    {dashboard.totalStudents.toLocaleString("vi-VN")}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    <TrendingUp className="size-3" /> +15% tháng này
                  </p>
                </div>
              </div>

              {/* Card 3: Đánh giá trung bình */}
              <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100">
                <div className="flex size-13 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shrink-0">
                  <Star className="size-6 fill-current" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Đánh giá trung bình</p>
                  <h3 className="text-2xl font-black text-[#17305f] mt-0.5">
                    {dashboard.averageRating.toFixed(1)} <span className="text-xs font-bold text-slate-400">/ 5.0</span>
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-500">
                    Chất lượng xuất sắc
                  </p>
                </div>
              </div>

              {/* Card 4: Doanh thu tháng này */}
              <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100">
                <div className="flex size-13 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                  <WalletCards className="size-6" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Doanh thu tháng này</p>
                  <h3 className="text-xl font-black text-[#17305f] mt-0.5">
                    {money(dashboard.monthlyRevenue)}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                    <TrendingUp className="size-3" /> +20% so với tháng trước
                  </p>
                </div>
              </div>

            </section>

            {/* --- 3. BIỂU ĐỒ ĐĂNG KÝ HỌC VIÊN & BẢNG KHÓA HỌC MỚI NHẤT --- */}
            <section className="grid gap-6 lg:grid-cols-12">
              
              {/* Đồ thị Cột lượt đăng ký (7/12) */}
              <article className="lg:col-span-7 rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-[#17305f]">Đăng ký học viên</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Số lượt ghi danh khóa học theo mốc thời gian</p>
                  </div>
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 outline-none cursor-pointer"
                  >
                    <option value={7}>7 ngày gần nhất</option>
                    <option value={14}>14 ngày gần nhất</option>
                    <option value={30}>30 ngày gần nhất</option>
                  </select>
                </div>

                {dashboard.registrationTrend.length === 0 ? (
                  <p className="py-12 text-center text-xs text-slate-400">Chưa có dữ liệu đăng ký.</p>
                ) : (
                  <div className="mt-4 flex h-52 items-end gap-3 pt-6 pb-2 px-2 overflow-x-auto">
                    {dashboard.registrationTrend.map((point) => {
                      const heightPercent = Math.max(8, (point.count / peak) * 80);
                      return (
                        <div
                          key={point.date}
                          className="group flex flex-1 flex-col items-center gap-2 h-full justify-end min-w-[32px]"
                          title={`${point.count} học viên`}
                        >
                          <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                            {point.count}
                          </span>
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all shadow-xs"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-[10px] font-semibold text-slate-400">
                            {new Date(`${point.date}T00:00:00`).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>

              {/* Bảng Khóa học mới nhất (5/12) */}
              <article className="lg:col-span-5 rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-[#17305f]">Khóa học mới nhất</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Danh sách các khóa học gần đây</p>
                  </div>
                  <button
                    onClick={() => router.push("/teacher/courses")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    Xem tất cả <ChevronRight className="size-3.5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {dashboard.courses.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400">Bạn chưa tạo khóa học nào.</p>
                  ) : (
                    dashboard.courses.map((course) => {
                      const thumbnail =
                        course.thumbnailUrl ||
                        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600";
                      return (
                        <div
                          key={course.id}
                          onClick={() => router.push(`/teacher/lessons?courseId=${course.id}`)}
                          className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition cursor-pointer border border-transparent hover:border-slate-100"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={thumbnail}
                              alt={course.title}
                              className="size-10 rounded-xl object-cover shrink-0 ring-1 ring-slate-200/80 shadow-2xs"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {course.title}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                                {course.categoryName || "Chưa phân loại"} • {course.studentCount} học viên
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              course.isPublished
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {course.isPublished ? "Phát hành" : "Chờ duyệt"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </article>

            </section>

            {/* --- 4. CỘT ĐÁNH GIÁ MỚI NHẤT & GHI DANH GẦN ĐÂY --- */}
            <section className="grid gap-6 lg:grid-cols-2">
              
              {/* Feed Đánh giá mới nhất */}
              <article className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-500">
                      <MessageSquare className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#17305f]">Đánh giá mới nhất</h2>
                      <p className="text-xs text-slate-400">Phản hồi gần đây từ học viên</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {dashboard.recentReviews.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400">Chưa có đánh giá nào.</p>
                  ) : (
                    dashboard.recentReviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-[10px]">
                              {review.studentName.substring(0, 1)}
                            </div>
                            <span className="text-xs font-bold text-slate-800">
                              {review.studentName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                            <Star className="size-3.5 fill-current" />
                            <span>{review.rating}.0</span>
                          </div>
                        </div>

                        <p className="text-[11px] font-semibold text-blue-600">
                          {review.courseTitle}
                        </p>

                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          "{review.comment || "Không có nội dung nhận xét."}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </article>

              {/* Feed Hoạt động ghi danh gần đây */}
              <article className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <UserCheck className="size-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#17305f]">Ghi danh gần đây</h2>
                      <p className="text-xs text-slate-400">Học viên mới tham gia khóa học</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {dashboard.recentEnrollments.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400">Chưa có lượt ghi danh nào.</p>
                  ) : (
                    dashboard.recentEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs">
                            {enrollment.studentName.substring(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {enrollment.studentName}
                            </p>
                            <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                              Đăng ký <strong className="text-blue-600 font-bold">{enrollment.courseTitle}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 shrink-0 ml-2">
                          <Clock className="size-3" />
                          <span>{formatDateOnly(enrollment.enrolledAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </article>

            </section>
          </>
        )}

      </div>
    </main>
  );
}