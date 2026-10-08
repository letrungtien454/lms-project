"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FileQuestion,
  FileText,
  Filter,
  FolderKanban,
  GraduationCap,
  History,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
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

// 2. Dữ liệu danh sách khóa học chờ duyệt chuẩn theo ảnh chụp mẫu
const pendingCoursesList = [
  {
    stt: 1,
    title: "Spring Boot Advanced",
    instructor: "Nguyễn Văn Nam",
    category: "Lập trình",
    submittedAt: "12/06/2025 10:24",
    status: "Chờ duyệt",
    statusStyle: "bg-amber-50 text-amber-600 border-amber-200",
    dotColor: "bg-amber-500",
    thumbTone: "from-blue-600 to-indigo-900",
    icon: "☕",
  },
  {
    stt: 2,
    title: "Data Analysis with Python",
    instructor: "Nguyễn Thị Lan",
    category: "Dữ liệu",
    submittedAt: "11/06/2025 16:30",
    status: "Chờ duyệt",
    statusStyle: "bg-amber-50 text-amber-600 border-amber-200",
    dotColor: "bg-amber-500",
    thumbTone: "from-sky-500 to-blue-900",
    icon: "Py",
  },
  {
    stt: 3,
    title: "UI/UX Design cơ bản",
    instructor: "Phạm Văn Tuấn",
    category: "Thiết kế",
    submittedAt: "10/06/2025 14:12",
    status: "Chờ duyệt",
    statusStyle: "bg-amber-50 text-amber-600 border-amber-200",
    dotColor: "bg-amber-500",
    thumbTone: "from-rose-500 to-purple-900",
    icon: "🎨",
  },
  {
    stt: 4,
    title: "React Native thực chiến",
    instructor: "Hoàng Đức Anh",
    category: "Di động",
    submittedAt: "09/06/2025 09:45",
    status: "Đã duyệt",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    thumbTone: "from-cyan-500 to-blue-800",
    icon: "⚛️",
  },
  {
    stt: 5,
    title: "Kỹ năng mềm cho lập trình viên",
    instructor: "Lê Thị Mai",
    category: "Kỹ năng",
    submittedAt: "08/06/2025 11:20",
    status: "Chờ duyệt",
    statusStyle: "bg-amber-50 text-amber-600 border-amber-200",
    dotColor: "bg-amber-500",
    thumbTone: "from-amber-500 to-orange-800",
    icon: "💡",
  },
];

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<
    "courses" | "lessons" | "questions" | "comments"
  >("courses");
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
              <p className="text-[10px] text-blue-200/80 leading-tight mt-0.5">
                Learn · Build · Grow
              </p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="p-3 space-y-1">
            {adminNavItems.map(([label, Icon, path]) => {
              const isActive = label === "Kiểm duyệt nội dung";
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

        {/* Nội dung trang Kiểm duyệt nội dung */}
        <main className="p-6 space-y-5 max-w-375">
          {/* Header tiêu đề & Ô tìm kiếm + Nút Lọc nâng cao */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">
                Kiểm duyệt nội dung
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý và duyệt các nội dung do giảng viên và người dùng gửi lên.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 min-w-60 shadow-2xs">
                <Search className="size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, tiêu đề..."
                  className="w-full bg-transparent text-xs outline-none"
                />
              </div>

              <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer">
                <Filter className="size-3.5" /> Lọc nâng cao
              </button>
            </div>
          </div>

          {/* Sub-Tabs chuyển đổi loại nội dung */}
          <div className="flex items-center gap-8 border-b border-slate-200/80 pt-1 pb-3">
            {[
              { id: "courses", label: "Khóa học chờ duyệt" },
              { id: "lessons", label: "Bài học chờ duyệt" },
              { id: "questions", label: "Câu hỏi chờ duyệt" },
              { id: "comments", label: "Bình luận chờ duyệt" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`font-bold text-xs pb-1 transition relative cursor-pointer ${
                  activeTab === tab.id
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute -bottom-3.25 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* 4 THẺ KPI CHỈ SỐ LƯỢNG CHỜ DUYỆT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <BookOpen className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Khóa học chờ duyệt</p>
                <h3 className="text-xl font-bold text-[#17305f] mt-0.5">3</h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Bài học chờ duyệt</p>
                <h3 className="text-xl font-bold text-[#17305f] mt-0.5">12</h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500 shrink-0">
                <FileQuestion className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Câu hỏi chờ duyệt</p>
                <h3 className="text-xl font-bold text-[#17305f] mt-0.5">8</h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <MessageSquare className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Bình luận chờ duyệt</p>
                <h3 className="text-xl font-bold text-[#17305f] mt-0.5">5</h3>
              </div>
            </div>
          </div>

          {/* BẢNG DANH SÁCH NỘI DUNG CHỜ DUYỆT */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
            <h2 className="font-bold text-[#17305f] text-xs">
              Danh sách khóa học chờ duyệt
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-[11px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Ảnh bìa</th>
                    <th className="py-3.5 px-4">Tên khóa học</th>
                    <th className="py-3.5 px-4">Giảng viên</th>
                    <th className="py-3.5 px-4">Danh mục</th>
                    <th className="py-3.5 px-4">Ngày gửi</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pendingCoursesList.map((item) => (
                    <tr key={item.stt} className="hover:bg-slate-50/50 transition">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {item.stt}
                      </td>

                      {/* Ảnh bìa */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${item.thumbTone} font-bold text-white text-xs shadow-2xs`}
                        >
                          {item.icon}
                        </span>
                      </td>

                      {/* Tên khóa học */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.title}
                      </td>

                      {/* Giảng viên */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.instructor}
                      </td>

                      {/* Danh mục */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {item.category}
                      </td>

                      {/* Ngày gửi */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {item.submittedAt}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${item.statusStyle}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${item.dotColor}`}
                          />
                          {item.status}
                        </span>
                      </td>

                      {/* Cột Thao tác */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button className="px-3 py-1 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer">
                            Xem
                          </button>
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                            <MoreHorizontal className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang (Pagination) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5 text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>

              {[1, 2, 3].map((page) => (
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
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}