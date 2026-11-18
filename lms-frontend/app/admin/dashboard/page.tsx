"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSessionUserName } from "@/lib/auth-session";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  GraduationCap,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { API_BASE_URL, apiRequest } from "@/lib/api";

type Dashboard = {
  totalUsers: number;
  totalCourses: number;
  totalTeachers: number;
  totalRevenue: number;
};

type AdminUser = {
  id: number;
  fullName: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string | null;
  avatar?: string | null;
};

type Course = {
  id: number;
  title: string;
  teacherName: string;
  categoryName: string | null;
  price: number;
  studentCount: number;
  isPublished: boolean;
  thumbnailUrl?: string | null;
  thumbnail?: string | null;
};

type TeacherRequest = {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  avatarUrl?: string | null;
};

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const roleLabels = { STUDENT: "Học viên", TEACHER: "Giảng viên", ADMIN: "Admin" };

/**
 * Hàm lấy chữ cái đầu của TÊN CHÍNH theo chuẩn Tiếng Việt
 * Ví dụ: "Nguyễn Văn Nam" -> Lấy chữ "N" (Nam)
 * "Trần Thị Bình" -> Lấy chữ "B" (Bình)
 */
function getVietnameseInitial(fullName: string): string {
  if (!fullName || !fullName.trim()) return "U";
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[parts.length - 1];
  return firstName.charAt(0).toUpperCase();
}

function AdminUserAvatar({ src, name }: { src?: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = src
    ? /^https?:\/\//i.test(src)
      ? src
      : new URL(src.startsWith("/") ? src : `/${src}`, API_BASE_URL).toString()
    : null;

  if (!imageUrl || failed) {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-[9px] font-extrabold text-white shadow-2xs">
        {getVietnameseInitial(name)}
      </span>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      onError={() => setFailed(true)}
      className="size-7 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
    />
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teacherRequests, setTeacherRequests] = useState<TeacherRequest[]>([]);
  const [adminName, setAdminName] = useState("Quản trị viên");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAdminName(getSessionUserName() || "Quản trị viên");
    Promise.all([
      apiRequest<Dashboard>("/api/admin/dashboard"),
      apiRequest<AdminUser[]>("/api/admin/users"),
      apiRequest<Course[]>("/api/admin/courses"),
      apiRequest<TeacherRequest[]>("/api/admin/teacher-requests?status=PENDING"),
    ])
      .then(([dashboard, userData, courseData, requestData]) => {
        setData(dashboard);
        setUsers(userData || []);
        setCourses(courseData || []);
        setTeacherRequests(requestData || []);
      })
      .catch((cause: unknown) => {
        setError(cause instanceof Error ? cause.message : "Không tải được báo cáo.");
      })
      .finally(() => setLoading(false));
  }, []);

  const roleCounts = useMemo(() => ({
    STUDENT: users.filter((user) => user.role === "STUDENT").length,
    TEACHER: users.filter((user) => user.role === "TEACHER").length,
    ADMIN: users.filter((user) => user.role === "ADMIN").length,
  }), [users]);

  const roleTotal = roleCounts.STUDENT + roleCounts.TEACHER + roleCounts.ADMIN;
  const rolePercent = (count: number) => (roleTotal ? (count / roleTotal) * 100 : 0);
  const studentPercent = rolePercent(roleCounts.STUDENT);
  const teacherPercent = rolePercent(roleCounts.TEACHER);
  const adminPercent = rolePercent(roleCounts.ADMIN);

  const roleChart = `conic-gradient(#2563eb 0% ${studentPercent}%, #10b981 ${studentPercent}% ${studentPercent + teacherPercent}%, #f59e0b ${studentPercent + teacherPercent}% ${studentPercent + teacherPercent + adminPercent}%, #8b5cf6 ${studentPercent + teacherPercent + adminPercent}% 100%)`;

  return (
    <main className="min-h-[calc(100vh-70px)] min-w-0 p-4 text-slate-800 sm:p-6 lg:p-7 antialiased font-sans bg-[#f4f7fc]">
      <div className="mx-auto max-w-[1600px] space-y-6">
        
        {/* --- 1. BANNER CHÀO MỪNG --- */}
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-12">
          <div className="space-y-1 md:col-span-7">
            <div className="flex items-center gap-2">
              <span className="text-xl">👋</span>
              <h1 className="text-xl font-bold text-[#17305f]">Xin chào, {adminName}!</h1>
            </div>
            <p className="text-xs text-slate-500">
              Chào mừng bạn trở lại với bảng điều khiển quản trị hệ thống EduFlow.
            </p>
          </div>

          <Link
            href="/admin/users?role=TEACHER"
            className="group relative flex min-h-28 items-center overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-500 px-6 text-white shadow-lg shadow-blue-200 md:col-span-5"
          >
            <div className="relative z-10">
              <p className="text-base font-bold">Yêu cầu giảng viên</p>
              <p className="mt-1 max-w-64 text-xs leading-5 text-blue-100">
                Xem xét hồ sơ và duyệt quyền giảng dạy trên nền tảng.
              </p>
              <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-2xs">
                Xem yêu cầu <ChevronRight size={14} />
              </span>
            </div>
            <GraduationCap className="absolute -right-1 -top-5 size-36 text-white/15" />
            <UserPlus className="absolute bottom-5 right-8 size-9 text-white/35" />
          </Link>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-800">
            {error}
          </p>
        )}

        {loading || !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-2xl border border-slate-200/80 bg-white" />
            ))}
          </div>
        ) : (
          <>
            {/* --- 2. THẺ THỐNG KÊ METRICS --- */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Tổng người dùng",
                  value: data.totalUsers.toLocaleString("vi-VN"),
                  detail: `Học viên: ${roleCounts.STUDENT} | Giảng viên: ${roleCounts.TEACHER} | Admin: ${roleCounts.ADMIN}`,
                  icon: Users,
                  tone: "bg-blue-50 text-blue-600",
                },
                {
                  title: "Tổng khóa học",
                  value: data.totalCourses.toLocaleString("vi-VN"),
                  detail: `Đang phát hành: ${courses.filter((course) => course.isPublished).length} | Khác: ${courses.filter((course) => !course.isPublished).length}`,
                  icon: BookOpen,
                  tone: "bg-purple-50 text-purple-600",
                },
                {
                  title: "Tổng doanh thu",
                  value: currency(data.totalRevenue),
                  detail: "Tổng thanh toán giao dịch ghi nhận",
                  icon: Coins,
                  tone: "bg-amber-50 text-amber-600",
                },
                {
                  title: "Giảng viên",
                  value: data.totalTeachers.toLocaleString("vi-VN"),
                  detail: `${teacherRequests.length} yêu cầu đang chờ duyệt`,
                  icon: TrendingUp,
                  tone: "bg-emerald-50 text-emerald-600",
                },
              ].map(({ title, value, detail, icon: Icon, tone }) => (
                <article
                  key={title}
                  className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-400">{title}</span>
                    <span className={`rounded-xl p-2 ${tone}`}>
                      <Icon size={17} />
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#17305f]">{value}</p>
                  <p className="truncate text-[9px] text-slate-400">{detail}</p>
                </article>
              ))}
            </section>

            {/* --- 3. PHÂN BỐ VAI TRÒ & YÊU CẦU XỬ LÝ --- */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <article className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] md:col-span-7">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-[#17305f]">Phân bố vai trò người dùng</h2>
                  <Link href="/admin/users" className="text-[10px] font-bold text-blue-600 hover:underline">
                    Quản lý người dùng →
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-8 py-2 sm:justify-between">
                  <div
                    className="relative flex size-36 shrink-0 items-center justify-center rounded-full"
                    style={{ background: roleChart }}
                  >
                    <div className="flex size-24 flex-col items-center justify-center rounded-full bg-white text-center">
                      <strong className="text-lg text-[#17305f]">
                        {roleTotal.toLocaleString("vi-VN")}
                      </strong>
                      <span className="text-[9px] text-slate-400">Tổng người dùng</span>
                    </div>
                  </div>
                  <div className="min-w-48 flex-1 space-y-3 text-[11px]">
                    {[
                      ["Học viên", roleCounts.STUDENT, "bg-blue-600"],
                      ["Giảng viên", roleCounts.TEACHER, "bg-emerald-500"],
                      ["Admin", roleCounts.ADMIN, "bg-amber-500"],
                    ].map(([label, count, tone]) => (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-slate-500">
                          <i className={`size-2 rounded-full ${tone}`} />
                          {label}
                        </span>
                        <span className="font-bold text-slate-700">
                          {Number(count).toLocaleString("vi-VN")}{" "}
                          <span className="font-normal text-slate-400">
                            ({rolePercent(Number(count)).toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] md:col-span-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-[#17305f]">Yêu cầu cần xử lý</h2>
                  <Link href="/admin/users?role=TEACHER" className="text-[10px] font-bold text-blue-600 hover:underline">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  {teacherRequests.slice(0, 4).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                    >
                      <UserPlus size={16} className="mt-0.5 shrink-0 text-blue-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold text-slate-800">
                          {request.fullName} đăng ký làm giảng viên
                        </p>
                        <p className="mt-1 truncate text-[9px] text-slate-400">
                          {request.email} · {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <Clock3 size={14} className="shrink-0 text-amber-500" />
                    </div>
                  ))}
                  {teacherRequests.length === 0 && (
                    <div className="flex flex-col items-center py-7 text-center">
                      <CheckCircle2 size={24} className="text-emerald-500" />
                      <p className="mt-2 text-xs font-semibold text-slate-700">
                        Không có yêu cầu đang chờ
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Các yêu cầu mới sẽ xuất hiện tại đây.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            </section>

            {/* --- 4. BẢNG NGƯỜI DÙNG MỚI & BẢNG KHÓA HỌC MỚI (MAP CHÍNH XÁC THUMBNAIL) --- */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
              
              {/* Bảng Người dùng mới */}
              <article className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] md:col-span-7">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-[#17305f]">Người dùng mới tham gia</h2>
                  <Link href="/admin/users" className="text-[10px] font-bold text-blue-600 hover:underline">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-130 text-left text-[10px]">
                    <thead className="text-slate-400">
                      <tr className="border-b border-slate-100">
                        <th className="pb-2 font-medium">Người dùng</th>
                        <th className="pb-2 font-medium">Vai trò</th>
                        <th className="pb-2 font-medium">Trạng thái</th>
                        <th className="pb-2 text-right font-medium">Ngày tham gia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map((user) => {
                        const userAvatar = user.avatarUrl || user.avatar;

                        return (
                          <tr key={user.id} className="border-b border-slate-50 last:border-0">
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <AdminUserAvatar src={userAvatar} name={user.fullName} />
                                <span className="min-w-0">
                                  <span className="block max-w-40 truncate font-bold text-slate-700">
                                    {user.fullName}
                                  </span>
                                  <span className="block max-w-40 truncate text-[9px] text-slate-400">
                                    {user.email}
                                  </span>
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 text-slate-500">{roleLabels[user.role]}</td>
                            <td className="py-2.5">
                              <span
                                className={`rounded-full px-2 py-1 text-[9px] font-semibold ${
                                  user.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {user.isActive ? "Hoạt động" : "Đã khóa"}
                              </span>
                            </td>
                            <td className="py-2.5 text-right text-slate-400">
                              {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <p className="py-5 text-center text-[10px] text-slate-400">
                      Chưa có người dùng.
                    </p>
                  )}
                </div>
              </article>

              {/* Bảng Khóa học mới nhất (Map chuẩn thumbnailUrl hoặc thumbnail) */}
              <article className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] md:col-span-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-[#17305f]">Khóa học mới nhất</h2>
                  <Link href="/admin/courses" className="text-[10px] font-bold text-blue-600 hover:underline">
                    Xem tất cả →
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {courses.slice(0, 5).map((course, index) => {
                    const rawCourseImage = course.thumbnailUrl || course.thumbnail;
                    const courseImage = rawCourseImage
                      ? /^https?:\/\//i.test(rawCourseImage)
                        ? rawCourseImage
                        : new URL(
                            rawCourseImage.startsWith("/") ? rawCourseImage : `/${rawCourseImage}`,
                            process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
                          ).toString()
                      : null;
                    const gradientColors = [
                      "from-blue-500 to-indigo-600",
                      "from-purple-500 to-indigo-600",
                      "from-emerald-500 to-teal-600",
                      "from-amber-500 to-orange-600",
                      "from-rose-500 to-pink-600",
                    ];

                    return (
                      <div key={course.id} className="flex items-center gap-2.5 py-2.5">
                        {courseImage ? (
                          <img
                            src={courseImage}
                            alt={course.title}
                            className="size-8 rounded-lg object-cover ring-1 ring-slate-200/80 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${
                              gradientColors[index % gradientColors.length]
                            } text-white shadow-2xs`}
                          >
                            <BookOpen size={14} />
                          </span>
                        )}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10px] font-bold text-slate-700">
                            {course.title}
                          </span>
                          <span className="block truncate text-[9px] text-slate-400">
                            {course.teacherName} · {course.categoryName ?? "Chưa phân loại"}
                          </span>
                        </span>
                        
                        <span className="shrink-0 text-[9px] font-semibold text-slate-500">
                          {course.studentCount} HV
                        </span>
                      </div>
                    );
                  })}
                  {courses.length === 0 && (
                    <p className="py-5 text-center text-[10px] text-slate-400">
                      Chưa có khóa học.
                    </p>
                  )}
                </div>
              </article>

            </section>

            <p className="flex items-center gap-1.5 text-[9px] text-slate-400">
              <Bell size={12} /> Số liệu và danh sách trên bảng điều khiển được tải từ dữ liệu hiện có trong hệ thống.{" "}
              <Link className="inline-flex items-center text-blue-600 hover:underline" href="/admin/analytics">
                Xem báo cáo <ArrowUpRight size={11} />
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}