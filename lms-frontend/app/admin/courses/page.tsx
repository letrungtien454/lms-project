"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  FileCheck,
  FileText,
  Filter,
  FolderKanban,
  GraduationCap,
  History,
  LayoutDashboard,
  Lock,
  MoreVertical,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

// 1. Sidebar Nav items dành riêng cho Admin
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

// 2. Dữ liệu danh sách khóa học chuẩn theo ảnh chụp mẫu
const coursesList = [
  {
    stt: 1,
    title: "Java Full Stack",
    instructor: "Nguyễn Văn Nam",
    category: "Lập trình",
    students: 128,
    price: "1.200.000₫",
    status: "Đang phát hành",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: "☕",
    iconTone: "from-blue-600 to-indigo-900",
  },
  {
    stt: 2,
    title: "Python for Data Science",
    instructor: "Trần Thị Bình",
    category: "Dữ liệu",
    students: 96,
    price: "1.000.000₫",
    status: "Đang phát hành",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: "Py",
    iconTone: "from-sky-500 to-blue-900",
  },
  {
    stt: 3,
    title: "Web Development",
    instructor: "Lê Minh Hoàng",
    category: "Web",
    students: 84,
    price: "800.000₫",
    status: "Bản nháp",
    statusStyle: "bg-amber-50 text-amber-600 border-amber-200",
    dotColor: "bg-amber-500",
    icon: "</>",
    iconTone: "from-indigo-500 to-purple-900",
  },
  {
    stt: 4,
    title: "Machine Learning cơ bản",
    instructor: "Phạm Quốc Việt",
    category: "AI",
    students: 62,
    price: "1.500.000₫",
    status: "Đang phát hành",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: "✣",
    iconTone: "from-violet-500 to-purple-950",
  },
  {
    stt: 5,
    title: "Git & GitHub",
    instructor: "Đỗ Thị Mai",
    category: "Công cụ",
    students: 38,
    price: "900.000₫",
    status: "Đang phát hành",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: "◇",
    iconTone: "from-slate-600 to-slate-900",
  },
  {
    stt: 6,
    title: "Database với PostgreSQL",
    instructor: "Hoàng Đức Anh",
    category: "Cơ sở dữ liệu",
    students: 45,
    price: "1.000.000₫",
    status: "Tạm dừng",
    statusStyle: "bg-rose-50 text-rose-600 border-rose-200",
    dotColor: "bg-rose-500",
    icon: "🛢️",
    iconTone: "from-cyan-600 to-blue-800",
  },
  {
    stt: 7,
    title: "ReactJS từ cơ bản đến nâng cao",
    instructor: "Vũ Thị Lan",
    category: "Frontend",
    students: 73,
    price: "1.200.000₫",
    status: "Đang phát hành",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: "⚛️",
    iconTone: "from-sky-400 to-indigo-600",
  },
  {
    stt: 8,
    title: "Spring Boot thực chiến",
    instructor: "Nguyễn Văn Tuấn",
    category: "Backend",
    students: 52,
    price: "1.300.000₫",
    status: "Đang phát hành",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: "🍃",
    iconTone: "from-emerald-500 to-teal-800",
  },
];

export default function AdminCoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả danh mục");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [currentPage, setCurrentPage] = useState(1);

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
              <p className="text-[10px] text-blue-200/80 leading-tight mt-0.5">Learn · Build · Grow</p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="p-3 space-y-1">
            {adminNavItems.map(([label, Icon, path]) => {
              const isActive = label === "Quản lý khóa học";
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

        {/* Nội dung trang Quản lý khóa học */}
        <main className="p-6 space-y-6 max-w-375">
          {/* Header tiêu đề & Nút Tạo khóa học */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">Quản lý khóa học</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý toàn bộ khóa học trên hệ thống.
              </p>
            </div>

            <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer">
              <Plus className="size-4" /> Tạo khóa học
            </button>
          </div>

          {/* 4 Thẻ KPI Thống kê khóa học */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <BookOpen className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tổng khóa học</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">32</h3>
                  <span className="text-[10px] font-bold text-emerald-600">↑ 8%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <BookOpen className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Đang phát hành</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">28</h3>
                  <span className="text-[10px] font-bold text-emerald-600">↑ 12%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Bản nháp</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">3</h3>
                  <span className="text-[10px] font-bold text-slate-400">→ 0%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <BookOpen className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tạm dừng</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">1</h3>
                  <span className="text-[10px] font-bold text-rose-500">↓ 50%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thanh Công cụ Lọc & Tìm kiếm */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
              <Search className="size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học theo tên, giảng viên..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <div className="md:col-span-7 flex items-center gap-3 justify-end">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-35"
              >
                <option>Tất cả danh mục</option>
                <option>Lập trình</option>
                <option>Dữ liệu</option>
                <option>Web</option>
                <option>AI</option>
                <option>Công cụ</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-35"
              >
                <option>Tất cả trạng thái</option>
                <option>Đang phát hành</option>
                <option>Bản nháp</option>
                <option>Tạm dừng</option>
              </select>

              <button className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-2 shadow-2xs transition cursor-pointer">
                <Filter className="size-3.5 text-blue-600" /> Lọc
              </button>
            </div>
          </div>

          {/* BẢNG DANH SÁCH KHÓA HỌC */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-[11px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Khóa học</th>
                    <th className="py-3.5 px-4">Giảng viên</th>
                    <th className="py-3.5 px-4">Danh mục</th>
                    <th className="py-3.5 px-4 text-center">Học viên</th>
                    <th className="py-3.5 px-4">Giá</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {coursesList.map((course) => (
                    <tr key={course.stt} className="hover:bg-slate-50/50 transition">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {course.stt}
                      </td>

                      {/* Khóa học + Icon */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${course.iconTone} font-bold text-white text-[10px] shadow-2xs`}
                          >
                            {course.icon}
                          </span>
                          <span className="font-bold text-slate-900">{course.title}</span>
                        </div>
                      </td>

                      {/* Giảng viên */}
                      <td className="py-3.5 px-4 text-slate-600">{course.instructor}</td>

                      {/* Danh mục */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                          {course.category}
                        </span>
                      </td>

                      {/* Học viên */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {course.students}
                      </td>

                      {/* Giá */}
                      <td className="py-3.5 px-4 text-slate-800 font-bold">{course.price}</td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${course.statusStyle}`}
                        >
                          <span className={`size-1.5 rounded-full ${course.dotColor}`} />
                          {course.status}
                        </span>
                      </td>

                      {/* Cột Thao tác */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Chỉnh sửa"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            title="Tùy chọn khác"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <MoreVertical className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang (Pagination) */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium text-[11px]">
                Hiển thị 1 - 8 trong 32 khóa học
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {[1, 2, 3, 4].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`size-8 rounded-lg font-bold text-xs cursor-pointer ${
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-xs"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}