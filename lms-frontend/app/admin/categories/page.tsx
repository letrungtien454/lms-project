"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Cpu,
  Database,
  Edit,
  FileCheck,
  FolderKanban,
  Globe,
  GraduationCap,
  History,
  Info,
  LayoutDashboard,
  Layers,
  Lock,
  MoreVertical,
  Palette,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
  Wrench,
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

// 2. Dữ liệu danh sách danh mục chuẩn theo ảnh chụp mẫu
const categoriesList = [
  {
    stt: 1,
    name: "Lập trình",
    slug: "lap-trinh",
    desc: "Các khóa học về lập trình",
    courseCount: 8,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: Code2,
    iconTone: "from-blue-500 to-indigo-700",
  },
  {
    stt: 2,
    name: "Dữ liệu",
    slug: "du-lieu",
    desc: "Phân tích và xử lý dữ liệu",
    courseCount: 5,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: Layers,
    iconTone: "from-purple-500 to-indigo-800",
  },
  {
    stt: 3,
    name: "Web",
    slug: "web",
    desc: "Phát triển web, frontend, backend",
    courseCount: 6,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: Globe,
    iconTone: "from-sky-400 to-blue-700",
  },
  {
    stt: 4,
    name: "AI",
    slug: "ai",
    desc: "Trí tuệ nhân tạo, Machine Learning",
    courseCount: 4,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: Cpu,
    iconTone: "from-indigo-500 to-violet-800",
  },
  {
    stt: 5,
    name: "Công cụ",
    slug: "cong-cu",
    desc: "Công cụ và kỹ năng hỗ trợ",
    courseCount: 3,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: Wrench,
    iconTone: "from-slate-500 to-slate-800",
  },
  {
    stt: 6,
    name: "Di động",
    slug: "di-dong",
    desc: "Lập trình ứng dụng di động",
    courseCount: 2,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: Smartphone,
    iconTone: "from-rose-500 to-pink-700",
  },
  {
    stt: 7,
    name: "Cơ sở dữ liệu",
    slug: "co-so-du-lieu",
    desc: "Database, SQL, NoSQL",
    courseCount: 4,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: Database,
    iconTone: "from-cyan-500 to-blue-800",
  },
  {
    stt: 8,
    name: "Thiết kế",
    slug: "thiet-ke",
    desc: "UI/UX, Graphic Design",
    courseCount: 2,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: Palette,
    iconTone: "from-teal-400 to-emerald-700",
  },
];

export default function AdminCategoriesPage() {
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
              const isActive = label === "Quản lý danh mục";
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

        {/* Nội dung trang Quản lý danh mục */}
        <main className="p-6 space-y-6 max-w-375">
          {/* Header tiêu đề & Nút Thêm danh mục */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">Quản lý danh mục</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý các danh mục khóa học trên hệ thống.
              </p>
            </div>

            <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer">
              <Plus className="size-4" /> Thêm danh mục
            </button>
          </div>

          {/* BẢNG TÌM KIẾM & DANH SÁCH DANH MỤC */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
            {/* Ô tìm kiếm danh mục */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 max-w-125">
              <Search className="size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm danh mục theo tên, slug..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            {/* Bảng Dữ liệu */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-[11px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Tên danh mục</th>
                    <th className="py-3.5 px-4">Slug</th>
                    <th className="py-3.5 px-4">Mô tả</th>
                    <th className="py-3.5 px-4 text-center">Số khóa học</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {categoriesList.map((cat) => {
                    const CategoryIcon = cat.icon;
                    return (
                      <tr key={cat.stt} className="hover:bg-slate-50/50 transition">
                        {/* STT */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                          {cat.stt}
                        </td>

                        {/* Tên danh mục + Icon */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${cat.iconTone} text-white shadow-2xs`}
                            >
                              <CategoryIcon className="size-4" />
                            </span>
                            <span className="font-bold text-slate-900">{cat.name}</span>
                          </div>
                        </td>

                        {/* Slug */}
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                          {cat.slug}
                        </td>

                        {/* Mô tả */}
                        <td className="py-3.5 px-4 text-slate-600">{cat.desc}</td>

                        {/* Số khóa học */}
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                          {cat.courseCount}
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${cat.statusStyle}`}
                          >
                            <span className={`size-1.5 rounded-full ${cat.dotColor}`} />
                            {cat.status}
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
                              title="Khóa/Xóa"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                              <Lock className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phân trang (Pagination) */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium text-[11px]">
                Hiển thị 1 - 8 trong 8 danh mục
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>

                {[1, 2].map((page) => (
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
                  onClick={() => setCurrentPage((p) => Math.min(2, p + 1))}
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