"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronRight,
  CircleDollarSign,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

// 1. Navigation items Sidebar Giảng viên
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

// 2. Dữ liệu khóa học phổ biến
const popularCourses = [
  {
    id: 1,
    title: "Java Full Stack",
    students: "128 học viên",
    tone: "from-blue-600 to-indigo-900",
    icon: "☕",
  },
  {
    id: 2,
    title: "Python Data Science",
    students: "96 học viên",
    tone: "from-sky-500 to-blue-900",
    icon: "Py",
  },
  {
    id: 3,
    title: "Web Development",
    students: "84 học viên",
    tone: "from-rose-500 to-red-900",
    icon: "</>",
  },
  {
    id: 4,
    title: "Machine Learning cơ bản",
    students: "62 học viên",
    tone: "from-cyan-600 to-teal-900",
    icon: "✣",
  },
];

export default function TeacherAnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState("Tháng này");

  return (
    <div className="flex min-h-screen bg-[#f6f9fd] text-slate-800 font-sans text-xs antialiased">
      {/* SIDEBAR TRÁI */}
      <aside className="fixed inset-y-0 left-0 z-40 w-57.5 bg-[#102957] text-white flex flex-col justify-between">
        <div>
          {/* Header chung đồng nhất h-[70px] */}
          <div className="flex h-17.5 items-center gap-3 border-b border-white/10 px-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500 shadow-md">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">Giảng viên</p>
              <p className="text-[10px] text-blue-200/80 leading-tight mt-0.5">
                Không gian quản lý
              </p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map(([label, Icon, path]) => {
              const isActive = label === "Thống kê";
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

      {/* KHU VỰC CHÍNH */}
      <div className="pl-57.5 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-17.5 border-b border-slate-200 bg-white/95 backdrop-blur px-7 flex items-center justify-between">
          <div className="flex max-w-110 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm khóa học, học viên, nội dung..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-blue-600">
              <Bell className="size-5" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-orange-500 font-bold text-white text-xs">
                NV
              </span>
              <div>
                <p className="font-bold text-slate-800 leading-tight">
                  Nguyễn Văn Nam
                </p>
                <p className="text-[10px] text-slate-400">Giảng viên</p>
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung trang Thống kê */}
        <main className="p-6 space-y-6 max-w-350">
          {/* Header trang & Dropdown lọc thời gian */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">
                Thống kê tổng quan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dữ liệu được cập nhật theo thời gian thực
              </p>
            </div>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs outline-none shadow-2xs cursor-pointer min-w-30"
            >
              <option>Tháng này</option>
              <option>Hôm nay</option>
              <option>Tuần này</option>
              <option>Năm nay</option>
            </select>
          </div>

          {/* 4 Thẻ KPI Chỉ Số Thống Kê */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <BookOpen className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tổng khóa học</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">5</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 1 khóa học
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Users className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tổng học viên</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">428</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 12%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <CircleDollarSign className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Doanh thu</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">12.5M₫</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 24%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500 shrink-0">
                <Star className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Đánh giá TB</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">4.7/5</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 0.2
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG 1: THỐNG KÊ HỌC VIÊN & TỶ LỆ HOÀN THÀNH */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Biểu đồ đường Thống kê học viên (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
              <h2 className="font-bold text-[#17305f] text-xs">Thống kê học viên</h2>

              <div className="flex items-center gap-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-blue-600 inline-block" /> Đăng ký mới
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-emerald-500 inline-block" /> Hoàn thành khóa học
                </span>
              </div>

              {/* Biểu đồ SVG đường nối điểm */}
              <div className="h-52 w-full relative pt-4">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 500 160"
                  preserveAspectRatio="none"
                >
                  {/* Đường kẻ ngang Grid */}
                  <line x1="0" y1="0" x2="500" y2="0" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                  {/* Đường Đăng ký mới (Xanh dương) */}
                  <path
                    d="M0,120 L70,90 L140,60 L210,80 L280,100 L350,130 L420,90 L500,50"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2.5"
                  />
                  {[
                    [0, 120], [70, 90], [140, 60], [210, 80],
                    [280, 100], [350, 130], [420, 90], [500, 50],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#2563eb" />
                  ))}

                  {/* Đường Hoàn thành khóa học (Xanh lá) */}
                  <path
                    d="M0,140 L70,120 L140,90 L210,110 L280,120 L350,145 L420,110 L500,80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                  />
                  {[
                    [0, 140], [70, 120], [140, 90], [210, 110],
                    [280, 120], [350, 145], [420, 110], [500, 80],
                  ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3.5" fill="#10b981" />
                  ))}
                </svg>

                {/* Trục X Ngày */}
                <div className="flex justify-between text-[9px] text-slate-400 mt-3">
                  <span>01/04</span><span>05/04</span><span>10/04</span><span>15/04</span><span>20/04</span><span>25/04</span><span>30/04</span>
                </div>
              </div>
            </div>

            {/* Biểu đồ Donut Tỷ lệ hoàn thành (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#17305f] text-xs">Tỷ lệ hoàn thành</h2>
                <button className="text-slate-400 hover:text-slate-600">•••</button>
              </div>

              <div className="flex flex-col items-center justify-center py-2">
                {/* Vòng tròn Donut Chart */}
                <div className="relative size-36 flex items-center justify-center">
                  <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Đang học 32% (Xanh nhạt) */}
                    <path
                      strokeDasharray="100 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                    />
                    {/* Hoàn thành 68% (Xanh đậm) */}
                    <path
                      strokeDasharray="68 100"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-extrabold text-[#17305f] block">68%</span>
                  </div>
                </div>

                {/* Chú thích */}
                <div className="mt-4 space-y-1.5 text-[11px] w-full px-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <i className="size-2 rounded-full bg-blue-600 inline-block" /> Hoàn thành
                    </span>
                    <span className="font-bold text-slate-700">68%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <i className="size-2 rounded-full bg-slate-300 inline-block" /> Đang học
                    </span>
                    <span className="font-bold text-slate-700">32%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG 2: DOANH THU THEO THÁNG & KHÓA HỌC PHỔ BIẾN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Biểu đồ Cột Doanh thu theo tháng (8 cols) */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
              <h2 className="font-bold text-[#17305f] text-xs">Doanh thu theo tháng</h2>

              <div className="h-48 w-full flex items-end justify-between gap-4 pt-4 px-2">
                {[
                  { month: "T1", val: "10.5M", height: "55%" },
                  { month: "T2", val: "8.2M", height: "42%" },
                  { month: "T3", val: "6.4M", height: "32%" },
                  { month: "T4", val: "12.8M", height: "65%" },
                  { month: "T5", val: "10.0M", height: "50%" },
                  { month: "T6", val: "14.5M", height: "75%" },
                ].map((col) => (
                  <div key={col.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className="w-full max-w-10.5 bg-blue-600 hover:bg-blue-700 rounded-t-lg transition-all duration-300 cursor-pointer"
                      style={{ height: col.height }}
                    />
                    <span className="text-[10px] text-slate-400 font-medium">{col.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách Khóa học phổ biến (4 cols) */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#17305f] text-xs">Khóa học phổ biến</h2>
                <button className="text-blue-600 font-bold text-[10px] hover:underline flex items-center gap-0.5">
                  Xem tất cả <ChevronRight className="size-3" />
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {popularCourses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <span
                        className={`size-9 rounded-xl bg-linear-to-br ${c.tone} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                      >
                        {c.icon}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{c.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{c.students}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}