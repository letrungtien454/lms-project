"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  Coins,
  FileCheck,
  FolderKanban,
  GraduationCap,
  History,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

// 1. Navigation items Sidebar Admin
const adminNavItems = [
  ["Dashboard", LayoutDashboard, "/admin/dashboard"],
  ["Quản lý người dùng", Users, "/admin/users"],
  ["Quản lý giảng viên", GraduationCap, "/admin/teachers"],
  ["Quản lý khóa học", BookOpen, "/admin/courses"],
  ["Quản lý danh mục", FolderKanban, "/admin/categories"],
  ["Báo cáo & Thống kê", TrendingUp, "/admin/analytics"],
  ["Kiểm duyệt nội dung", FileCheck, "/admin/moderation"],
  ["Nhật ký hệ thống", History, "/admin/logs"],
  ["Thông báo", Bell, "/admin/notifications"],
  ["Cài đặt", Settings, "/admin/settings"],
] as const;

// 2. Dữ liệu danh sách Khóa học lượt đăng ký cao nhất
const topCourses = [
  {
    stt: 1,
    title: "Java Full Stack",
    category: "Lập trình",
    enrolls: "1,248",
    revenue: "12.8M₫",
    tone: "from-blue-600 to-indigo-900",
    icon: "☕",
  },
  {
    stt: 2,
    title: "Python for Data Science",
    category: "Dữ liệu",
    enrolls: "946",
    revenue: "9.6M₫",
    tone: "from-sky-500 to-blue-900",
    icon: "Py",
  },
  {
    stt: 3,
    title: "Web Development",
    category: "Web",
    enrolls: "842",
    revenue: "8.4M₫",
    tone: "from-indigo-500 to-purple-900",
    icon: "</>",
  },
  {
    stt: 4,
    title: "Machine Learning cơ bản",
    category: "AI",
    enrolls: "621",
    revenue: "6.2M₫",
    tone: "from-violet-500 to-purple-950",
    icon: "✣",
  },
  {
    stt: 5,
    title: "Git & GitHub",
    category: "Công cụ",
    enrolls: "412",
    revenue: "4.1M₫",
    tone: "from-slate-600 to-slate-900",
    icon: "◇",
  },
];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");

  return (
    <div className="flex min-h-screen bg-[#f6f9fd] text-slate-800 font-sans text-xs antialiased">
      {/* 1. SIDEBAR ADMIN TRÁI */}
      <aside className="fixed inset-y-0 left-0 z-40 w-57.5 bg-[#102957] text-white flex flex-col justify-between">
        <div>
          {/* Logo Header */}
          <div className="flex h-17.5 items-center gap-3 border-b border-white/10 px-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500 shadow-md">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">EduFlow</p>
              <p className="text-[10px] text-blue-200/80 leading-tight mt-0.5">
                Learn · Build · Grow
              </p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="p-3 space-y-1">
            {adminNavItems.map(([label, Icon, path]) => {
              const isActive = label === "Báo cáo & Thống kê";
              return (
                <a
                  key={label}
                  href={path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition ${
                    isActive
                      ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-900/30"
                      : "text-blue-100/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </a>
              );
            })}
          </nav>
        </div>

      </aside>

      {/* 2. KHU VỰC CHÍNH (MAIN CONTENT) */}
      <div className="pl-57.5 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-17.5 border-b border-slate-200 bg-white/95 backdrop-blur px-7 flex items-center justify-between">
          <div className="flex max-w-110 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, khóa học, giảng viên..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-blue-600">
              <Bell className="size-5" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-blue-700 font-bold text-white text-xs">
                QH
              </span>
              <div>
                <p className="font-bold text-slate-800 leading-tight">
                  Trần Quốc Huy
                </p>
                <p className="text-[10px] text-slate-400">Admin</p>
              </div>
              <ChevronDown className="size-4 text-slate-400 ml-1" />
            </div>
          </div>
        </header>

        {/* Nội dung trang Báo cáo & Thống kê */}
        <main className="p-6 space-y-5 max-w-375">
          {/* Header tiêu đề & Bộ lọc thời gian */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">
                Báo cáo & Thống kê
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng quan hoạt động của hệ thống theo thời gian thực.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Dropdown chọn dải ngày */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium shadow-2xs">
                <span>01/05/2025 - 31/05/2025</span>
                <ChevronDown className="size-3.5 text-slate-400" />
              </div>

              {/* Toggle 7 / 30 / 90 ngày */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                {[
                  { id: "7", label: "7 ngày" },
                  { id: "30", label: "30 ngày" },
                  { id: "90", label: "90 ngày" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setTimeRange(btn.id as any)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      timeRange === btn.id
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5 THẺ KPI THỐNG KÊ (HÀNG TRÊN) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <BookOpen className="size-4.5" />
              </span>
              <div>
                <p className="text-[10px] text-slate-400">Tổng người dùng</p>
                <h3 className="text-lg font-extrabold text-[#17305f]">1,248</h3>
                <p className="text-[9px] font-bold text-emerald-600">
                  ↑ 12% <span className="font-normal text-slate-400">so với tháng trước</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Users className="size-4.5" />
              </span>
              <div>
                <p className="text-[10px] text-slate-400">Tổng giảng viên</p>
                <h3 className="text-lg font-extrabold text-[#17305f]">86</h3>
                <p className="text-[9px] font-bold text-emerald-600">
                  ↑ 8% <span className="font-normal text-slate-400">so với tháng trước</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <GraduationCap className="size-4.5" />
              </span>
              <div>
                <p className="text-[10px] text-slate-400">Tổng khóa học</p>
                <h3 className="text-lg font-extrabold text-[#17305f]">32</h3>
                <p className="text-[9px] font-bold text-emerald-600">
                  ↑ 6% <span className="font-normal text-slate-400">so với tháng trước</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <UserCheck className="size-4.5" />
              </span>
              <div>
                <p className="text-[10px] text-slate-400">Tổng lượt đăng ký</p>
                <h3 className="text-lg font-extrabold text-[#17305f]">2,847</h3>
                <p className="text-[9px] font-bold text-emerald-600">
                  ↑ 18% <span className="font-normal text-slate-400">so với tháng trước</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Coins className="size-4.5" />
              </span>
              <div>
                <p className="text-[10px] text-slate-400">Doanh thu (tháng)</p>
                <h3 className="text-lg font-extrabold text-[#17305f]">68.5M₫</h3>
                <p className="text-[9px] font-bold text-emerald-600">
                  ↑ 24% <span className="font-normal text-slate-400">so với tháng trước</span>
                </p>
              </div>
            </div>
          </div>

          {/* HÀNG 2: BIỂU ĐỒ ĐƯỜNG THỐNG KÊ NGƯỜI DÙNG & BIỂU ĐỒ VÒNG TỶ LỆ NGƯỜI DÙNG */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Biểu đồ đường Thống kê người dùng (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
              <h2 className="font-bold text-[#17305f] text-xs">Thống kê người dùng</h2>

              <div className="flex items-center gap-5 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-blue-600 inline-block" /> Học viên
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-emerald-500 inline-block" /> Giảng viên
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-indigo-400 inline-block" /> Admin
                </span>
              </div>

              {/* Biểu đồ SVG đường uốn lượn */}
              <div className="h-52 w-full relative pt-2">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 150"
                  preserveAspectRatio="none"
                >
                  {/* Đường Grid Ngang */}
                  <line x1="0" y1="0" x2="500" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="37" x2="500" y2="37" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="112" x2="500" y2="112" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Line 1: Học viên (Xanh dương) */}
                  <path
                    d="M0,120 C60,110 120,95 180,75 C240,90 300,50 360,55 C420,40 480,20 500,10"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                  />
                  {[
                    [0, 120], [70, 110], [140, 95], [210, 75],
                    [280, 90], [350, 50], [420, 40], [500, 10],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#2563eb" />
                  ))}

                  {/* Line 2: Giảng viên (Xanh lá) */}
                  <path
                    d="M0,135 C60,130 120,120 180,105 C240,120 300,90 360,95 C420,80 480,60 500,50"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                  {[
                    [0, 135], [70, 130], [140, 120], [210, 105],
                    [280, 120], [350, 90], [420, 80], [500, 50],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#10b981" />
                  ))}

                  {/* Line 3: Admin (Tím nhạt) */}
                  <path
                    d="M0,145 C60,143 120,140 180,138 C240,140 300,135 360,137 C420,132 480,130 500,128"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2"
                  />
                </svg>

                {/* Trục X Ngày */}
                <div className="flex justify-between text-[9px] text-slate-400 mt-2">
                  <span>01/05</span>
                  <span>05/05</span>
                  <span>10/05</span>
                  <span>15/05</span>
                  <span>20/05</span>
                  <span>25/05</span>
                  <span>31/05</span>
                </div>
              </div>
            </div>

            {/* Biểu đồ Donut Tỷ lệ người dùng (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
              <h2 className="font-bold text-[#17305f] text-xs">Tỷ lệ người dùng</h2>

              <div className="flex items-center justify-between pt-1">
                {/* Vòng tròn Donut */}
                <div className="relative size-32 flex items-center justify-center shrink-0">
                  <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      strokeDasharray="82.7 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="4"
                    />
                    <path
                      strokeDasharray="6.9 100"
                      strokeDashoffset="-82.7"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                    />
                    <path
                      strokeDasharray="0.4 100"
                      strokeDashoffset="-89.6"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="4"
                    />
                    <path
                      strokeDasharray="9.0 100"
                      strokeDashoffset="-90.0"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="4"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="font-extrabold text-[#17305f] text-sm block">
                      1,248
                    </span>
                    <span className="text-[8px] text-slate-400 block">
                      Tăng người dùng
                    </span>
                  </div>
                </div>

                {/* Chú thích Tỉ lệ % */}
                <div className="space-y-2 text-[10px] pl-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <i className="size-2 rounded-full bg-blue-600 inline-block" /> Học viên
                    </span>
                    <span className="font-bold text-slate-800">
                      82.7% <span className="text-slate-400 font-normal">(1,032)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <i className="size-2 rounded-full bg-emerald-500 inline-block" /> Giảng viên
                    </span>
                    <span className="font-bold text-slate-800">
                      6.9% <span className="text-slate-400 font-normal">(86)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <i className="size-2 rounded-full bg-amber-500 inline-block" /> Admin
                    </span>
                    <span className="font-bold text-slate-800">
                      0.4% <span className="text-slate-400 font-normal">(5)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <i className="size-2 rounded-full bg-purple-500 inline-block" /> Khác
                    </span>
                    <span className="font-bold text-slate-800">
                      9.0% <span className="text-slate-400 font-normal">(112)</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG 3: DOANH THU THEO THÁNG & KHÓA HỌC ĐĂNG KÝ CAO NHẤT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Biểu đồ Cột Doanh thu theo tháng (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
              <h2 className="font-bold text-[#17305f] text-xs">Doanh thu theo tháng</h2>

              <div className="h-44 w-full flex items-end justify-between gap-3 pt-4 px-1">
                {[
                  { month: "T1", height: "65%" },
                  { month: "T2", height: "38%" },
                  { month: "T3", height: "50%" },
                  { month: "T4", height: "62%" },
                  { month: "T5", height: "42%" },
                  { month: "T6", height: "72%" },
                ].map((col) => (
                  <div
                    key={col.month}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <div
                      className="w-full max-w-8 bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-all duration-300 cursor-pointer"
                      style={{ height: col.height }}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">
                      {col.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bảng Khóa học lượt đăng ký cao nhất (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#17305f] text-xs">
                  Khóa học có lượt đăng ký cao nhất
                </h2>
                <button className="text-blue-600 font-bold text-[10px] hover:underline">
                  Xem tất cả →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400">
                    <tr>
                      <th className="py-2 px-2 font-medium w-8">#</th>
                      <th className="py-2 px-2 font-medium">Tên khóa học</th>
                      <th className="py-2 px-2 font-medium">Danh mục</th>
                      <th className="py-2 px-2 font-medium">Lượt đăng ký</th>
                      <th className="py-2 px-2 text-right font-medium">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topCourses.map((c) => (
                      <tr key={c.stt} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-2 font-bold text-slate-400">
                          {c.stt}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`size-6 rounded-md bg-linear-to-br ${c.tone} text-white font-bold text-[8px] flex items-center justify-center shrink-0`}
                            >
                              {c.icon}
                            </span>
                            <span className="font-bold text-slate-800 truncate max-w-35">
                              {c.title}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-500">{c.category}</td>
                        <td className="py-2.5 px-2 text-slate-700 font-bold">
                          {c.enrolls}
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-slate-800">
                          {c.revenue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}