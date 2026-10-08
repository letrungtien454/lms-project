"use client";

import { useState } from "react";
import {
  AlertCircle,
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  FileCheck,
  FileQuestion,
  FileText,
  FolderKanban,
  GraduationCap,
  History,
  Info,
  LayoutDashboard,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  X,
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

// 2. Dữ liệu mẫu Quản lý người dùng
const usersData = [
  {
    stt: 1,
    name: "Nguyễn Văn An",
    email: "an.nguyen@email.com",
    role: "Học viên",
    roleBg: "bg-blue-50 text-blue-600 border-blue-200",
    status: "Hoạt động",
    date: "12/03/2025",
    avatarTone: "from-blue-400 to-indigo-600",
  },
  {
    stt: 2,
    name: "Trần Thị Bình",
    email: "binh.tran@email.com",
    role: "Học viên",
    roleBg: "bg-blue-50 text-blue-600 border-blue-200",
    status: "Hoạt động",
    date: "11/03/2025",
    avatarTone: "from-pink-400 to-rose-600",
  },
  {
    stt: 3,
    name: "Lê Minh Hoàng",
    email: "hoang.le@email.com",
    role: "Giảng viên",
    roleBg: "bg-purple-50 text-purple-600 border-purple-200",
    status: "Hoạt động",
    date: "10/03/2025",
    avatarTone: "from-amber-400 to-orange-500",
  },
  {
    stt: 4,
    name: "Phạm Quốc Việt",
    email: "viet.pham@email.com",
    role: "Giảng viên",
    roleBg: "bg-purple-50 text-purple-600 border-purple-200",
    status: "Hoạt động",
    date: "08/03/2025",
    avatarTone: "from-emerald-400 to-teal-600",
  },
  {
    stt: 5,
    name: "Đỗ Thị Mai",
    email: "mai.do@email.com",
    role: "Admin",
    roleBg: "bg-amber-50 text-amber-600 border-amber-200",
    status: "Hoạt động",
    date: "01/03/2025",
    avatarTone: "from-violet-400 to-purple-600",
  },
];

// 3. Dữ liệu mẫu Khóa học nổi bật
const featuredCourses = [
  {
    stt: 1,
    title: "Java Full Stack",
    category: "Lập trình",
    students: "128",
    revenue: "12.8M₫",
    tone: "from-blue-600 to-indigo-900",
  },
  {
    stt: 2,
    title: "Python for Data Science",
    category: "Dữ liệu",
    students: "96",
    revenue: "9.6M₫",
    tone: "from-sky-500 to-blue-900",
  },
  {
    stt: 3,
    title: "Web Development",
    category: "Web",
    students: "84",
    revenue: "8.4M₫",
    tone: "from-indigo-500 to-purple-900",
  },
  {
    stt: 4,
    title: "Machine Learning cơ bản",
    category: "AI",
    students: "62",
    revenue: "6.2M₫",
    tone: "from-violet-500 to-purple-950",
  },
  {
    stt: 5,
    title: "Git & GitHub",
    category: "Công cụ",
    students: "38",
    revenue: "3.8M₫",
    tone: "from-slate-600 to-slate-900",
  },
];

// 4. Dữ liệu Đánh giá gần đây
const recentReviews = [
  {
    stt: 1,
    name: "Nguyễn Thị Lan",
    course: "Java Full Stack",
    rating: "5.0",
    comment: "Khóa học rất hay, giảng viên nhiệt tình...",
    time: "2 giờ trước",
    avatarTone: "from-rose-400 to-pink-600",
  },
  {
    stt: 2,
    name: "Trần Minh Hoàng",
    course: "Python for Data Science",
    rating: "4.8",
    comment: "Nội dung dễ hiểu, bài tập thực tế",
    time: "5 giờ trước",
    avatarTone: "from-blue-400 to-indigo-600",
  },
  {
    stt: 3,
    name: "Lê Thị Mai",
    course: "Web Development",
    rating: "5.0",
    comment: "Hỗ trợ rất tốt, bài giảng chất lượng",
    time: "1 ngày trước",
    avatarTone: "from-amber-400 to-orange-500",
  },
  {
    stt: 4,
    name: "Phạm Văn Tuấn",
    course: "Machine Learning cơ bản",
    rating: "4.7",
    comment: "Khóa học phù hợp với người mới bắt đầu",
    time: "1 ngày trước",
    avatarTone: "from-emerald-400 to-teal-600",
  },
  {
    stt: 5,
    name: "Hoàng Đức Anh",
    course: "Git & GitHub",
    rating: "4.5",
    comment: "Cần thêm ví dụ thực hành nâng cao",
    time: "2 ngày trước",
    avatarTone: "from-purple-400 to-violet-600",
  },
];

export default function AdminDashboardPage() {
  const [activeUserTab, setActiveUserTab] = useState<"all" | "student" | "teacher" | "admin">("all");

  return (
    <div className="flex min-h-screen bg-[#f6f9fd] text-slate-800 font-sans text-xs antialiased">
      {/* 1. SIDEBAR ADMIN TRÁI */}
      <aside className="fixed inset-y-0 left-0 z-40 w-57.5 bg-[#102957] text-white flex flex-col justify-between">
        <div>
          {/* Top Logo Admin */}
          <div className="flex h-17.5 items-center gap-3 border-b border-white/10 px-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500 shadow-md">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">EduFlow</p>
              <p className="text-[10px] text-blue-200/80 leading-tight mt-0.5">Không gian quản trị</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {adminNavItems.map(([label, Icon, path]) => {
              const isActive = label === "Dashboard";
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
                <p className="font-bold text-slate-800 leading-tight">Trần Quốc Huy</p>
                <p className="text-[10px] text-slate-400">Admin</p>
              </div>
              <ChevronDown className="size-4 text-slate-400 ml-1" />
            </div>
          </div>
        </header>

        {/* Nội dung Dashboard Admin */}
        <main className="p-6 space-y-6 max-w-[1600px]">
          {/* BỐ CỤC LỚN: 2 CỘT (Cột trái 8.5/12, Cột phải 3.5/12) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* CỘT TRÁI CHÍNH (8.5 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Lời chào & Banner Quản trị Admin */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-7 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👋</span>
                    <h1 className="text-xl font-bold text-[#17305f]">Xin chào, Trần Quốc Huy!</h1>
                  </div>
                  <p className="text-xs text-slate-500">
                    Chào mừng bạn trở lại với bảng điều khiển quản trị hệ thống EduFlow.
                  </p>
                </div>

    
              </div>

              {/* 4 Thẻ Chỉ Số Tổng Quan (KPIs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Tổng người dùng</span>
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                      <Users className="size-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-bold text-[#17305f]">1,248</h3>
                    <span className="text-[10px] font-bold text-emerald-600">↑ 12%</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Học viên: 1,032 | Giảng viên: 86 | Admin: 5</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Tổng khóa học</span>
                    <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                      <BookOpen className="size-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-bold text-[#17305f]">32</h3>
                    <span className="text-[10px] font-bold text-emerald-600">↑ 8%</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Đang hoạt động: 28 | Tạm dừng: 2 | Nháp: 2</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Tổng doanh thu</span>
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                      <Coins className="size-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-bold text-[#17305f]">68.5M₫</h3>
                    <span className="text-[10px] font-bold text-emerald-600">↑ 24%</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Trong tháng này</p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium">Tổng lượt đăng ký</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <TrendingUp className="size-4" />
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl font-bold text-[#17305f]">342</h3>
                    <span className="text-[10px] font-bold text-emerald-600">↑ 16%</span>
                  </div>
                  <p className="text-[9px] text-slate-400">Trong tháng này</p>
                </div>
              </div>

              {/* 2 Biểu đồ: Thống kê tổng quan & Phân bố vai trò người dùng */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Biểu đồ đường Thống kê tổng quan (8 cols) */}
                <div className="md:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-[#17305f] text-xs">Thống kê tổng quan</h2>
                    <select className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-[10px] text-slate-500 outline-none">
                      <option>7 ngày qua</option>
                      <option>30 ngày qua</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-blue-600 inline-block" /> Người dùng mới</span>
                    <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-emerald-500 inline-block" /> Đăng ký khóa học</span>
                    <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-indigo-400 inline-block" /> Doanh thu</span>
                  </div>

                  {/* SVG Biểu đồ vẽ mẫu */}
                  <div className="h-44 w-full relative pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                      <path d="M0,120 C60,110 120,100 180,70 C240,40 300,80 360,50 C420,60 480,20 500,10" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                      <path d="M0,135 C60,125 120,115 180,95 C240,75 300,105 360,80 C420,90 480,50 500,40" fill="none" stroke="#10b981" strokeWidth="2.5" />
                      <path d="M0,100 C60,80 120,90 180,50 C240,30 300,60 360,30 C420,40 480,10 500,5" fill="none" stroke="#818cf8" strokeWidth="2" strokeDasharray="4 4" />
                    </svg>
                    <div className="flex justify-between text-[9px] text-slate-400 mt-2">
                      <span>20/04</span><span>21/04</span><span>22/04</span><span>23/04</span><span>24/04</span><span>25/04</span><span>26/04</span><span>27/04</span>
                    </div>
                  </div>
                </div>

                {/* Biểu đồ Donut Phân bố vai trò người dùng (5 cols) */}
                <div className="md:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
                  <h2 className="font-bold text-[#17305f] text-xs">Phân bố vai trò người dùng</h2>

                  <div className="flex items-center justify-between">
                    {/* Khối vòng Donut */}
                    <div className="relative size-28 flex items-center justify-center shrink-0">
                      <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
                        <path strokeDasharray="82.7 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2563eb" strokeWidth="4" />
                        <path strokeDasharray="6.9 100" strokeDashoffset="-82.7" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" />
                        <path strokeDasharray="0.4 100" strokeDashoffset="-89.6" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4" />
                        <path strokeDasharray="9.0 100" strokeDashoffset="-90.0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#8b5cf6" strokeWidth="4" />
                      </svg>
                      <div className="absolute text-center">
                        <span className="font-extrabold text-[#17305f] text-xs block">1,248</span>
                        <span className="text-[8px] text-slate-400 block">Tổng người dùng</span>
                      </div>
                    </div>

                    {/* Chú thích Tỉ lệ % */}
                    <div className="space-y-1.5 text-[10px] pl-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-blue-600 inline-block" /> Học viên</span>
                        <span className="font-bold text-slate-700">82.7% <span className="text-slate-400 font-normal">(1,032)</span></span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-emerald-500 inline-block" /> Giảng viên</span>
                        <span className="font-bold text-slate-700">6.9% <span className="text-slate-400 font-normal">(86)</span></span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-500 inline-block" /> Admin</span>
                        <span className="font-bold text-slate-700">0.4% <span className="text-slate-400 font-normal">(5)</span></span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-purple-500 inline-block" /> Khác</span>
                        <span className="font-bold text-slate-700">9.0% <span className="text-slate-400 font-normal">(112)</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bảng Quản lý người dùng + Bảng Khóa học nổi bật */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Bảng Quản lý người dùng (7 cols) */}
                <div className="md:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-[#17305f] text-xs">Quản lý người dùng</h2>
                    <button className="text-blue-600 font-bold text-[10px] hover:underline">Xem tất cả →</button>
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex gap-1.5 bg-slate-100/70 p-1 rounded-xl w-fit">
                    {[
                      { id: "all", label: "Tất cả" },
                      { id: "student", label: "Học viên" },
                      { id: "teacher", label: "Giảng viên" },
                      { id: "admin", label: "Admin" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveUserTab(tab.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          activeUserTab === tab.id ? "bg-white text-blue-600 shadow-xs" : "text-slate-500"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-400">
                        <tr>
                          <th className="py-2 px-2 font-medium">STT</th>
                          <th className="py-2 px-2 font-medium">Họ và tên</th>
                          <th className="py-2 px-2 font-medium">Email</th>
                          <th className="py-2 px-2 font-medium">Vai trò</th>
                          <th className="py-2 px-2 font-medium">Trạng thái</th>
                          <th className="py-2 px-2 font-medium">Đăng ký</th>
                          <th className="py-2 px-2 text-center font-medium">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersData.map((u) => (
                          <tr key={u.stt} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-2 font-bold text-slate-400">{u.stt}</td>
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2">
                                <span className={`size-6 rounded-full bg-linear-to-br ${u.avatarTone} text-white font-bold text-[8px] flex items-center justify-center shrink-0`}>
                                  {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </span>
                                <span className="font-bold text-slate-800 truncate max-w-22.5">{u.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-slate-500 truncate max-w-25">{u.email}</td>
                            <td className="py-2.5 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${u.roleBg}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="text-emerald-600 font-bold text-[9px] flex items-center gap-1">
                                <i className="size-1.5 rounded-full bg-emerald-500 inline-block" /> Hoạt động
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-slate-400">{u.date}</td>
                            <td className="py-2.5 px-2 text-center text-slate-400">•••</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bảng Khóa học nổi bật (5 cols) */}
                <div className="md:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-[#17305f] text-xs">Khóa học nổi bật</h2>
                    <button className="text-blue-600 font-bold text-[10px] hover:underline">Xem tất cả →</button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-400">
                        <tr>
                          <th className="py-2 px-2 font-medium">STT</th>
                          <th className="py-2 px-2 font-medium">Tên khóa học</th>
                          <th className="py-2 px-2 font-medium">Danh mục</th>
                          <th className="py-2 px-2 font-medium">Học viên</th>
                          <th className="py-2 px-2 text-right font-medium">Doanh thu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {featuredCourses.map((c) => (
                          <tr key={c.stt} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-2 font-bold text-slate-400">{c.stt}</td>
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2">
                                <span className={`size-6 rounded-md bg-linear-to-br ${c.tone} text-white font-bold text-[8px] flex items-center justify-center shrink-0`}>
                                  {c.title[0]}
                                </span>
                                <span className="font-bold text-slate-800 truncate max-w-25">{c.title}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-slate-500">{c.category}</td>
                            <td className="py-2.5 px-2 text-slate-700 font-bold">{c.students}</td>
                            <td className="py-2.5 px-2 text-right font-bold text-slate-800">{c.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bảng Đánh giá gần đây + Thống kê nhanh */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Bảng Đánh giá & Nhận xét gần đây (7 cols) */}
                <div className="md:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-[#17305f] text-xs">Đánh giá & Nhận xét gần đây</h2>
                    <button className="text-blue-600 font-bold text-[10px] hover:underline">Xem tất cả →</button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-400">
                        <tr>
                          <th className="py-2 px-2 font-medium">STT</th>
                          <th className="py-2 px-2 font-medium">Học viên</th>
                          <th className="py-2 px-2 font-medium">Khóa học</th>
                          <th className="py-2 px-2 font-medium">Đánh giá</th>
                          <th className="py-2 px-2 font-medium">Nội dung</th>
                          <th className="py-2 px-2 text-right font-medium">Thời gian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentReviews.map((r) => (
                          <tr key={r.stt} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-2 font-bold text-slate-400">{r.stt}</td>
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2">
                                <span className={`size-6 rounded-full bg-linear-to-br ${r.avatarTone} text-white font-bold text-[8px] flex items-center justify-center shrink-0`}>
                                  {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </span>
                                <span className="font-bold text-slate-800 truncate max-w-20">{r.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-slate-500 truncate max-w-22.5">{r.course}</td>
                            <td className="py-2.5 px-2 text-amber-500 font-bold">★ {r.rating}</td>
                            <td className="py-2.5 px-2 text-slate-500 truncate max-w-27.5">{r.comment}</td>
                            <td className="py-2.5 px-2 text-right text-slate-400">{r.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Khối Thống kê nhanh (5 cols) */}
                <div className="md:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
                  <h2 className="font-bold text-[#17305f] text-xs">Thống kê nhanh</h2>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px]">Khóa học đang hoạt động</span>
                        <BookOpen className="size-3.5 text-blue-600" />
                      </div>
                      <h4 className="text-base font-bold text-[#17305f]">28</h4>
                      <p className="text-[9px] text-emerald-600 font-bold">↑ 7%</p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px]">Khóa học tạm dừng</span>
                        <BookOpen className="size-3.5 text-rose-500" />
                      </div>
                      <h4 className="text-base font-bold text-[#17305f]">2</h4>
                      <p className="text-[9px] text-slate-400 font-bold">0%</p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px]">Khóa học nháp</span>
                        <FileText className="size-3.5 text-amber-500" />
                      </div>
                      <h4 className="text-base font-bold text-[#17305f]">2</h4>
                      <p className="text-[9px] text-slate-400 font-bold">0%</p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="text-[10px]">Số lượng bài học</span>
                        <FileQuestion className="size-3.5 text-purple-600" />
                      </div>
                      <h4 className="text-base font-bold text-[#17305f]">245</h4>
                      <p className="text-[9px] text-emerald-600 font-bold">↑ 12%</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* CỘT PHẢI CỐ ĐỊNH (3.5 COLS) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* KHỐI 1: THÔNG BÁO HỆ THỐNG */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[#17305f] text-xs">Thông báo hệ thống</h2>
                  <button className="text-blue-600 font-bold text-[10px] hover:underline">Xem tất cả →</button>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-2.5">
                    <UserPlus className="size-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] leading-tight">Có 1 tài khoản đăng ký trở thành giảng viên mới</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Hôm nay · 10:24</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] leading-tight">Khóa học "Spring Boot Advanced" đã được duyệt</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Hôm nay · 09:47</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-2.5">
                    <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] leading-tight">Có 3 báo cáo nội dung cần kiểm duyệt</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Hôm nay · 08:32</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-2.5">
                    <Clock className="size-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] leading-tight">Hệ thống bảo trì định kỳ vào 02:00 - 04:00</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Hôm nay · 01:00</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start gap-2.5">
                    <Info className="size-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] leading-tight">Cập nhật phiên bản hệ thống v2.1.0</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Hôm qua · 18:20</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KHỐI 2: HOẠT ĐỘNG GẦN ĐÂY */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-[#17305f] text-xs">Hoạt động gần đây</h2>
                  <button className="text-blue-600 font-bold text-[10px] hover:underline">Xem tất cả →</button>
                </div>

                <div className="space-y-3 relative pl-2 border-l border-slate-100 ml-2">
                  <div className="relative pl-4 space-y-0.5">
                    <span className="absolute -left-4.25 top-0 size-3 rounded-full bg-blue-600 border-2 border-white" />
                    <p className="font-bold text-slate-800 text-[11px] leading-tight">
                      Nguyễn Thị Lan <span className="font-normal text-slate-500">đăng ký khóa học</span> Java Full Stack
                    </p>
                    <p className="text-[9px] text-slate-400">10 phút trước</p>
                  </div>

                  <div className="relative pl-4 space-y-0.5">
                    <span className="absolute -left-4.25 top-0 size-3 rounded-full bg-amber-500 border-2 border-white" />
                    <p className="font-bold text-slate-800 text-[11px] leading-tight">
                      Trần Minh Hoàng <span className="font-normal text-slate-500">đánh giá 5 ★</span> Python for Data Science
                    </p>
                    <p className="text-[9px] text-slate-400">32 phút trước</p>
                  </div>

                  <div className="relative pl-4 space-y-0.5">
                    <span className="absolute -left-4.25 top-0 size-3 rounded-full bg-purple-600 border-2 border-white" />
                    <p className="font-bold text-slate-800 text-[11px] leading-tight">
                      Có 3 câu hỏi mới trong diễn đàn <span className="font-normal text-slate-500">Java Full Stack</span>
                    </p>
                    <p className="text-[9px] text-slate-400">1 giờ trước</p>
                  </div>

                  <div className="relative pl-4 space-y-0.5">
                    <span className="absolute -left-4.25 top-0 size-3 rounded-full bg-emerald-500 border-2 border-white" />
                    <p className="font-bold text-slate-800 text-[11px] leading-tight">
                      Phạm Văn Tuấn <span className="font-normal text-slate-500">hoàn thành bài học</span> Lesson 2 - Java Core
                    </p>
                    <p className="text-[9px] text-slate-400">2 giờ trước</p>
                  </div>

                  <div className="relative pl-4 space-y-0.5">
                    <span className="absolute -left-4.25 top-0 size-3 rounded-full bg-rose-500 border-2 border-white" />
                    <p className="font-bold text-slate-800 text-[11px] leading-tight">
                      Hệ thống xử lý báo cáo nội dung <span className="font-normal text-slate-500">Có 1 nội dung cần duyệt</span>
                    </p>
                    <p className="text-[9px] text-slate-400">3 giờ trước</p>
                  </div>
                </div>
              </div>

              {/* KHỐI 3: CÀI ĐẶT NHANH */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
                <h2 className="font-bold text-[#17305f] text-xs">Cài đặt nhanh</h2>

                <div className="space-y-1.5">
                  <button className="w-full p-2.5 rounded-xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 text-slate-700 font-bold text-[11px] flex items-center gap-2 transition cursor-pointer">
                    <Plus className="size-4 text-blue-600" /> Thêm khóa học mới
                  </button>

                  <button className="w-full p-2.5 rounded-xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 text-slate-700 font-bold text-[11px] flex items-center gap-2 transition cursor-pointer">
                    <UserPlus className="size-4 text-blue-600" /> Thêm người dùng
                  </button>

                  <button className="w-full p-2.5 rounded-xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 text-slate-700 font-bold text-[11px] flex items-center gap-2 transition cursor-pointer">
                    <FileCheck className="size-4 text-blue-600" /> Kiểm duyệt nội dung
                  </button>

                  <button className="w-full p-2.5 rounded-xl border border-slate-100 hover:bg-blue-50/50 hover:border-blue-200 text-slate-700 font-bold text-[11px] flex items-center gap-2 transition cursor-pointer">
                    <TrendingUp className="size-4 text-blue-600" /> Xem báo cáo
                  </button>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}