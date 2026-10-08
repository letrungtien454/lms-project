"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Filter,
  FolderKanban,
  GraduationCap,
  History,
  LayoutDashboard,
  Plus,
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

// 2. Dữ liệu Nhật ký hệ thống chuẩn 100% theo ảnh mẫu
const logsData = [
  {
    stt: 1,
    time: "12/06/2025 10:24",
    user: "Trần Quốc Huy",
    role: "Admin",
    action: "Đăng nhập",
    actionStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    target: "Hệ thống",
    ip: "171.234.56.78",
    device: "Chrome - Win11",
    detail: "Đăng nhập thành công",
  },
  {
    stt: 2,
    time: "12/06/2025 09:17",
    user: "Nguyễn Văn Nam",
    role: "Giảng viên",
    action: "Tạo khóa học",
    actionStyle: "bg-blue-50 text-blue-600 border-blue-200",
    dotColor: "bg-blue-500",
    target: "Khóa học #12",
    ip: "113.162.45.90",
    device: "Edge - Win11",
    detail: "Java Full Stack",
  },
  {
    stt: 3,
    time: "11/06/2025 16:03",
    user: "Lê Thị Mai",
    role: "Giảng viên",
    action: "Cập nhật bài học",
    actionStyle: "bg-cyan-50 text-cyan-600 border-cyan-200",
    dotColor: "bg-cyan-500",
    target: "Bài học #58",
    ip: "14.168.23.11",
    device: "Chrome - Win10",
    detail: "Sửa nội dung",
  },
  {
    stt: 4,
    time: "11/06/2025 14:22",
    user: "Phạm Văn Tuấn",
    role: "Giảng viên",
    action: "Thêm câu hỏi",
    actionStyle: "bg-teal-50 text-teal-600 border-teal-200",
    dotColor: "bg-teal-500",
    target: "Câu hỏi #241",
    ip: "42.112.34.67",
    device: "Firefox - Win11",
    detail: "Trắc nghiệm",
  },
  {
    stt: 5,
    time: "11/06/2025 11:36",
    user: "Nguyễn Thị Lan",
    role: "Học viên",
    action: "Đăng ký khóa học",
    actionStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    target: "Khóa học #8",
    ip: "118.69.12.45",
    device: "Chrome - Android",
    detail: "Python for Data Science",
  },
  {
    stt: 6,
    time: "10/06/2025 18:20",
    user: "Trần Minh Hoàng",
    role: "Học viên",
    action: "Gửi bình luận",
    actionStyle: "bg-indigo-50 text-indigo-600 border-indigo-200",
    dotColor: "bg-indigo-500",
    target: "Bài học #47",
    ip: "27.72.23.18",
    device: "Safari - iOS",
    detail: "Thảo luận bài học",
  },
  {
    stt: 7,
    time: "10/06/2025 15:03",
    user: "Admin",
    role: "",
    action: "Duyệt nội dung",
    actionStyle: "bg-amber-50 text-amber-600 border-amber-200",
    dotColor: "bg-amber-500",
    target: "Khóa học #7",
    ip: "171.234.56.78",
    device: "Chrome - Win11",
    detail: "Đã duyệt",
  },
  {
    stt: 8,
    time: "09/06/2025 09:12",
    user: "Nguyễn Văn Nam",
    role: "Giảng viên",
    action: "Xóa bài học",
    actionStyle: "bg-rose-50 text-rose-600 border-rose-200",
    dotColor: "bg-rose-500",
    target: "Bài học #32",
    ip: "113.162.45.90",
    device: "Edge - Win11",
    detail: "Xóa nội dung",
  },
];

export default function AdminLogsPage() {
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
              const isActive = label === "Nhật ký hệ thống";
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

        {/* Nội dung trang Nhật ký hệ thống */}
        <main className="p-6 space-y-5 max-w-375">
          {/* Header tiêu đề & Nút Tạo thông báo mới */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">
                Nhật ký hệ thống
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi các hoạt động và sự kiện diễn ra trong hệ thống.
              </p>
            </div>

            <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer">
              <Plus className="size-4" /> Tạo thông báo mới
            </button>
          </div>

          {/* Thanh công cụ Tìm kiếm & Lọc thời gian */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs w-full">
              <Search className="size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo người dùng, hành động, IP..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs shadow-2xs">
                <span>Từ ngày</span>
                <ChevronDown className="size-3.5 text-slate-400" />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs shadow-2xs">
                <span>Đến ngày</span>
                <ChevronDown className="size-3.5 text-slate-400" />
              </div>

              <button className="h-9 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 font-bold rounded-xl shadow-2xs transition cursor-pointer">
                Lọc
              </button>
            </div>
          </div>

          {/* BẢNG DANH SÁCH NHẬT KÝ HỆ THỐNG */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left text-[11px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Thời gian</th>
                    <th className="py-3.5 px-4">Người dùng</th>
                    <th className="py-3.5 px-4">Hành động</th>
                    <th className="py-3.5 px-4">Đối tượng</th>
                    <th className="py-3.5 px-4">IP</th>
                    <th className="py-3.5 px-4">Thiết bị</th>
                    <th className="py-3.5 px-4">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {logsData.map((log) => (
                    <tr key={log.stt} className="hover:bg-slate-50/50 transition">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {log.stt}
                      </td>

                      {/* Thời gian */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                        {log.time}
                      </td>

                      {/* Người dùng */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">
                          {log.user}
                        </span>
                        {log.role && (
                          <span className="text-[10px] text-slate-400 block font-normal">
                            ({log.role})
                          </span>
                        )}
                      </td>

                      {/* Hành động */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${log.actionStyle}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${log.dotColor}`}
                          />
                          {log.action}
                        </span>
                      </td>

                      {/* Đối tượng */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {log.target}
                      </td>

                      {/* IP */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                        {log.ip}
                      </td>

                      {/* Thiết bị */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {log.device}
                      </td>

                      {/* Chi tiết */}
                      <td className="py-3.5 px-4 font-bold text-blue-600">
                        {log.detail}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang (Pagination) */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-1.5 text-xs">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className={`size-8 rounded-lg font-bold text-xs cursor-pointer ${
                  currentPage === 1
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                1
              </button>

              <button
                onClick={() => setCurrentPage(2)}
                className={`size-8 rounded-lg font-bold text-xs cursor-pointer ${
                  currentPage === 2
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                2
              </button>

              <button
                onClick={() => setCurrentPage(5)}
                className={`size-8 rounded-lg font-bold text-xs cursor-pointer ${
                  currentPage === 5
                    ? "bg-blue-600 text-white shadow-xs"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                5
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
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