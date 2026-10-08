"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileQuestion,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  Upload,
  Users,
  X,
} from "lucide-react";

const navItems = [
  ["Dashboard", LayoutDashboard, "/teacher/dashboard"],
  ["Quản lý khóa học", BookOpen, "/teacher/courses"],
  ["Quản lý bài học", FileText, "/teacher/lessons"],
  ["Ngân hàng câu hỏi", HelpCircle, "/teacher/question_bank"],
  ["Quản lý học viên", Users, "/teacher/students"],
  ["Thống kê", TrendingUp, "/teacher/analytics"],
  ["Đánh giá & Nhận xét", MessageSquare, "/teacher/reviews"],
  ["Thông báo", Bell, "/teacher/notifications"],
  ["Cài đặt", Settings, "/teacher/settings"],
] as const;

function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-[#102957] text-white transition-all duration-300 lg:flex ${collapsed ? "w-19" : "w-57.5"}`}
      >
        <div
          className={`flex h-17.5 shrink-0 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "gap-3 px-5"}`}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 shadow-md">
            <GraduationCap className="size-5" />
          </span>
          {!collapsed && (
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold leading-tight">Giảng viên</p>
              <p className="text-[10px] text-blue-200/80 leading-tight mt-0.5">Không gian quản lý</p>
            </div>
          )}
        </div>

        <nav
          className="flex flex-1 flex-col gap-1 px-3 py-4"
          aria-label="Điều hướng giảng viên"
        >
          {navItems.map(([label, Icon, path], index) => (
            <a
              key={label}
              href={path}
              title={collapsed ? label : undefined}
              aria-current={index === 0 ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition ${index === 0 ? "bg-blue-600 font-bold shadow-md shadow-blue-900/30" : "text-blue-100/75 hover:bg-white/10 hover:text-white"} ${collapsed ? "justify-center px-0" : ""}`}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
              {label === "Thông báo" && !collapsed && (
                <span className="ml-auto size-2 rounded-full bg-red-400" />
              )}
            </a>
          ))}
        </nav>
      </aside>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="h-full w-65 bg-[#102957] p-4 text-white"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500">
                  <GraduationCap className="size-4" />
                </span>
                <div>
                  <span className="block text-sm font-bold">Giảng viên</span>
                  <span className="block text-[10px] text-blue-200">Không gian quản lý</span>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu"
              >
                <X className="size-5" />
              </button>
            </div>
            {navItems.map(([label, Icon], index) => (
              <a
                key={label}
                href="#"
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-xs ${index === 0 ? "bg-blue-600 font-bold" : "text-blue-100/80"}`}
              >
                <Icon className="size-4" />
                {label}
              </a>
            ))}
          </aside>
        </div>
      )}
      <button
        className="fixed bottom-5 left-4 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Mở menu"
      >
        <Menu className="size-5" />
      </button>
    </>
  );
}

function Header({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <header
      className={`fixed right-0 top-0 z-30 h-17.5 border-b border-slate-200 bg-white/95 backdrop-blur ${collapsed ? "lg:left-19" : "lg:left-57.5"} left-0`}
    >
      <div className="flex h-full items-center gap-4 px-4 sm:px-7">
        <button
          onClick={onToggle}
          className="hidden rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 lg:block"
          aria-label="Thu gọn thanh bên"
        >
          <PanelLeft className="size-5" />
        </button>
        <div className="flex max-w-110 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <Search className="size-4 text-slate-400" />
          <input
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            placeholder="Tìm khóa học, học viên, nội dung..."
          />
          <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-400 shadow-sm sm:block">
            ⌘ K
          </kbd>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            className="relative rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
            aria-label="Thông báo"
          >
            <Bell className="size-5" />
            <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              3
            </span>
          </button>
          <div className="hidden h-8 w-px bg-slate-200 sm:block" />
          <button className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-50">
            <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-amber-200 to-orange-500 text-xs font-bold text-white">
              NV
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-bold text-slate-800">
                Nguyễn Văn Nam
              </span>
              <span className="block text-[10px] text-slate-400">
                Giảng viên
              </span>
            </span>
            <ChevronDown className="hidden size-4 text-slate-400 sm:block" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  change,
  tone,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string;
  change: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)]">
      <span
        className={`flex size-11 items-center justify-center rounded-full ${tone}`}
      >
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-xs text-slate-500">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="text-2xl font-bold text-[#17305f]">{value}</p>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">
          ↑ {change}
        </span>
      </div>
    </div>
  );
}

function Chart() {
  return (
    <div className="mt-4 h-48">
      <div className="flex h-full">
        <div className="flex flex-col justify-between pb-7 pr-2 text-[10px] text-slate-400">
          <span>50</span>
          <span>35</span>
          <span>20</span>
          <span>5</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-[calc(100%-22px)] rounded-lg bg-[linear-gradient(to_bottom,transparent_24%,#e8f0f9_25%,transparent_26%,transparent_49%,#e8f0f9_50%,transparent_51%,transparent_74%,#e8f0f9_75%,transparent_76%)]">
            <svg
              className="absolute inset-0 size-full overflow-visible"
              viewBox="0 0 600 180"
              preserveAspectRatio="none"
              aria-label="Biểu đồ đăng ký và hoàn thành khóa học"
            >
              <path
                d="M0 140 C70 110 100 125 145 90 S220 105 270 80 S350 115 390 84 S460 90 500 55 S560 75 600 28"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
              />
              <path
                d="M0 155 C70 140 100 145 145 125 S220 145 270 118 S350 140 390 120 S460 135 500 108 S560 120 600 90"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="flex justify-between pt-2 text-[10px] text-slate-400">
            <span>20/4</span>
            <span>21/4</span>
            <span>22/4</span>
            <span>23/4</span>
            <span>24/4</span>
            <span>25/4</span>
            <span>26/4</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardHeader({
  title,
  action = "Xem tất cả",
}: {
  title: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-bold text-[#17305f]">{title}</h2>
      <a
        href="#"
        className="flex items-center gap-1 text-[10px] font-semibold text-blue-600"
      >
        {action} <ChevronRight className="size-3" />
      </a>
    </div>
  );
}

export default function TeacherDashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>({
    totalCourses: 0,
    totalStudents: 0,
    averageRating: 0,
    monthlyRevenue: "0₫",
    courses: [],
    recentReviews: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/teacher/dashboard", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Lỗi kết nối API Backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f9fd] text-slate-800 font-sans text-xs antialiased">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`min-h-screen pt-17.5 transition-all duration-300 ${collapsed ? "lg:pl-19" : "lg:pl-57.5"}`}
      >
        <div className="mx-auto max-w-375 space-y-5 p-4 sm:p-6 lg:p-7">
          <section className="grid gap-5 xl:grid-cols-[1fr_430px] xl:items-center">
            <div>
              <p className="text-xs text-slate-500">Thứ Ba, 29 tháng 4, 2025</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-[#17305f] sm:text-2xl">
                Chào mừng trở lại, Nguyễn Văn Nam!
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                Cùng xây dựng những khóa học chất lượng và giúp học viên phát
                triển mỗi ngày.
              </p>
            </div>
            <a
              href="#"
              className="relative flex min-h-35 items-center overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-500 px-6 text-white shadow-lg shadow-blue-200"
            >
              <div className="relative z-10">
                <p className="text-base font-bold">Tạo khóa học mới</p>
                <p className="mt-1 max-w-55 text-xs leading-5 text-blue-100">
                  Chia sẻ kiến thức của bạn với cộng đồng học tập.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-blue-600">
                  Bắt đầu ngay <ChevronRight className="size-3" />
                </span>
              </div>
              <Sparkles className="absolute -right-2 -top-5 size-36 text-white/15" />
              <BookOpen className="absolute bottom-5 right-8 size-20 rotate-12 text-white/25" />
            </a>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={BookOpen}
              label="Tổng khóa học"
              value={dashboardData.totalCourses || "5"}
              change="1 khóa học"
              tone="bg-blue-50 text-blue-600"
            />
            <Metric
              icon={Users}
              label="Tổng học viên"
              value={dashboardData.totalStudents || "428"}
              change="12%"
              tone="bg-violet-50 text-violet-600"
            />
            <Metric
              icon={Star}
              label="Đánh giá trung bình"
              value={dashboardData.averageRating ? `${dashboardData.averageRating}/5` : "4.7/5"}
              change="0.2"
              tone="bg-amber-50 text-amber-500"
            />
            <Metric
              icon={CircleDollarSign}
              label="Doanh thu (tháng này)"
              value={dashboardData.monthlyRevenue || "12.5M₫"}
              change="24%"
              tone="bg-orange-50 text-orange-500"
            />
          </section>

          <section className="grid gap-5 lg:grid-cols-[1fr_2fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)]">
              <div className="flex items-start justify-between">
                <div>
                  <CardHeader title="Thống kê học viên" />
                  <div className="mt-3 flex gap-5 text-[11px] text-slate-500">
                    <span>
                      <i className="mr-1 inline-block size-2 rounded-full bg-blue-600" />
                      Đăng ký mới
                    </span>
                    <span>
                      <i className="mr-1 inline-block size-2 rounded-full bg-emerald-500" />
                      Hoàn thành khóa học
                    </span>
                  </div>
                </div>
                <button className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-500">
                  7 ngày qua <ChevronDown className="ml-1 inline size-3" />
                </button>
              </div>
              <Chart />
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)]">
              <CardHeader title="Khóa học của tôi" />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-160 text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="pb-3 font-medium">Tên khóa học</th>
                      <th className="pb-3 font-medium">Danh mục</th>
                      <th className="pb-3 font-medium">Học viên</th>
                      <th className="pb-3 font-medium">Đánh giá</th>
                      <th className="pb-3 font-medium">Doanh thu</th>
                      <th className="pb-3 font-medium">Trạng thái</th>
                      <th className="pb-3 text-right font-medium">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData.courses.length > 0 ? dashboardData.courses : [
                      { title: "Java Full Stack", category: "Lập trình", students: "128", rating: "4.8 (42)", revenue: "4.8M₫", tone: "from-orange-500 to-red-900", mark: "☕", isPublished: true },
                      { title: "Python for Data Science", category: "Dữ liệu", students: "96", rating: "4.6 (31)", revenue: "3.2M₫", tone: "from-sky-500 to-blue-950", mark: "Py", isPublished: true },
                      { title: "Web Development", category: "Web", students: "84", rating: "4.5 (28)", revenue: "2.6M₫", tone: "from-cyan-500 to-indigo-950", mark: "</>", isPublished: true },
                      { title: "Machine Learning cơ bản", category: "AI", students: "62", rating: "4.3 (17)", revenue: "1.8M₫", tone: "from-violet-500 to-indigo-950", mark: "✣", isPublished: false }
                    ]).map((course: any) => (
                      <tr
                        key={course.id || course.title}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2 font-bold text-slate-700">
                            <span
                              className={`flex size-8 shrink-0 items-center justify-center rounded-md bg-linear-to-br ${course.tone || "from-blue-500 to-indigo-800"} text-[9px] font-black text-white`}
                            >
                              {course.mark || "📖"}
                            </span>
                            {course.title}
                          </div>
                        </td>
                        <td className="py-3 text-slate-500">
                          {course.categoryName || course.category}
                        </td>
                        <td className="py-3 text-slate-500">
                          {course.studentCount || course.students}
                        </td>
                        <td className="py-3 text-amber-500">
                          ★{" "}
                          <span className="text-slate-500">
                            {course.rating}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600">
                          {course.revenue}
                        </td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-semibold ${course.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}
                          >
                            {course.isPublished ? "Đang phát hành" : "Bản nháp"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            className="rounded-full border border-slate-200 px-2 py-1 text-slate-400 hover:bg-slate-100"
                            aria-label={`Tùy chọn ${course.title}`}
                          >
                            •••
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)]">
              <CardHeader title="Lịch sử hoạt động" />
              <div className="mt-4 flex flex-col gap-2">
                {[
                  ["Hạn chấm bài: Java OOP", "Hôm nay · 23:59", ClipboardCheck, "bg-blue-50 text-blue-600"],
                  ["Buổi học trực tuyến", "Ngày mai · 14:00 – 16:00", CalendarDays, "bg-violet-50 text-violet-600"],
                  ["Upload tài liệu khóa học", "30/04/2025", Upload, "bg-emerald-50 text-emerald-600"],
                  ["Duyệt khóa học mới", "02/05/2025", CheckCircle2, "bg-orange-50 text-orange-500"],
                ].map(([title, date, Icon, tone]: any) => (
                  <a
                    href="#"
                    key={title}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold text-slate-700">
                        {title}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-400">
                        {date}
                      </span>
                    </span>
                    <ChevronRight className="size-3 text-slate-300" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)]">
              <CardHeader title="Học viên đánh giá" />
              <div className="mt-4 divide-y divide-slate-100">
                {[
                  ["Nguyễn Thị Lan", "5.0", "Khóa học rất chi tiết, giảng viên nhiệt tình.", "2 ngày trước", "bg-rose-100 text-rose-600 font-bold"],
                  ["Trần Minh Hoàng", "4.8", "Nội dung dễ hiểu, bài tập thực hành hữu ích.", "3 ngày trước", "bg-blue-100 text-blue-600 font-bold"],
                  ["Lê Thị Mai", "4.7", "Video chất lượng tốt, tuy nhiên nên có thêm bài tập.", "5 ngày trước", "bg-amber-100 text-amber-700 font-bold"],
                ].map(([name, rating, text, date, avatarTone]) => (
                  <article
                    key={name}
                    className="flex gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] ${avatarTone}`}
                    >
                      {name
                        .split(" ")
                        .map((part: string) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-bold text-[#17305f]">
                          {name}
                        </p>
                        <span className="text-[10px] font-semibold text-amber-500">
                          ★ {rating}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] leading-4 text-slate-500">
                        {text}
                      </p>
                      <p className="mt-0.5 text-[9px] text-slate-400">{date}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}