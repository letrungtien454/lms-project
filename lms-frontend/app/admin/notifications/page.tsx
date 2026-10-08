"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  FileCheck,
  Filter,
  FolderKanban,
  GraduationCap,
  History,
  Info,
  LayoutDashboard,
  Megaphone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
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

// 2. Dữ liệu danh sách thông báo mẫu
const notificationsList = [
  {
    stt: 1,
    title: "Bảo trì hệ thống định kỳ tháng 6",
    content: "Hệ thống sẽ tạm dừng hoạt động từ 02:00 đến 04:00 ngày 15/06/2025 để nâng cấp máy chủ.",
    target: "Toàn hệ thống",
    targetStyle: "bg-purple-50 text-purple-600 border-purple-200",
    priority: "Quan trọng",
    priorityStyle: "bg-rose-50 text-rose-600 border-rose-200",
    priorityDot: "bg-rose-500",
    author: "Trần Quốc Huy",
    sentAt: "12/06/2025 08:30",
  },
  {
    stt: 2,
    title: "Cập nhật quy định kiểm duyệt khóa học mới",
    content: "Yêu cầu các giảng viên cập nhật đề cương chi tiết theo chuẩn định dạng mới trước ngày 30/06.",
    target: "Giảng viên",
    targetStyle: "bg-blue-50 text-blue-600 border-blue-200",
    priority: "Thông thường",
    priorityStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    priorityDot: "bg-emerald-500",
    author: "Trần Quốc Huy",
    sentAt: "10/06/2025 14:15",
  },
  {
    stt: 3,
    title: "Chương trình ưu đãi học phí mùa hè 2025",
    content: "Giảm 30% cho tất cả các khóa học Lập trình Web và Data Science khi nhập mã SUMMER2025.",
    target: "Học viên",
    targetStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    priority: "Thông thường",
    priorityStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    priorityDot: "bg-emerald-500",
    author: "Nguyễn Văn Nam",
    sentAt: "08/06/2025 09:00",
  },
  {
    stt: 4,
    title: "Cảnh báo bảo mật tài khoản",
    content: "Vui lòng kích hoạt xác thực 2 yếu tố (2FA) để đảm bảo an toàn cho tài khoản giảng viên.",
    target: "Giảng viên",
    targetStyle: "bg-blue-50 text-blue-600 border-blue-200",
    priority: "Cảnh báo",
    priorityStyle: "bg-amber-50 text-amber-600 border-amber-200",
    priorityDot: "bg-amber-500",
    author: "Trần Quốc Huy",
    sentAt: "05/06/2025 16:45",
  },
  {
    stt: 5,
    title: "Chào mừng phiên bản EduFlow 2.0",
    content: "Giao diện mới tối ưu trải nghiệm học tập và thêm nhiều tính năng làm bài tập trắc nghiệm.",
    target: "Toàn hệ thống",
    targetStyle: "bg-purple-50 text-purple-600 border-purple-200",
    priority: "Thông thường",
    priorityStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    priorityDot: "bg-emerald-500",
    author: "Trần Quốc Huy",
    sentAt: "01/06/2025 10:00",
  },
  {
    stt: 6,
    title: "Nhắc nhở nộp bài tập lớn khóa Java Full Stack",
    content: "Hạn chót nộp bài tập cuối khóa là 23:59 ngày 20/06/2025. Vui lòng nộp đúng hạn.",
    target: "Học viên",
    targetStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    priority: "Quan trọng",
    priorityStyle: "bg-rose-50 text-rose-600 border-rose-200",
    priorityDot: "bg-rose-500",
    author: "Lê Quốc Bảo",
    sentAt: "28/05/2025 11:20",
  },
];

export default function AdminNotificationsPage() {
  const [selectedTarget, setSelectedTarget] = useState("Tất cả đối tượng");
  const [selectedPriority, setSelectedPriority] = useState("Tất cả mức độ");
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
              const isActive = label === "Thông báo";
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

        {/* Khối bảo mật dưới cùng */}
        
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

        {/* Nội dung trang Thông báo */}
        <main className="p-6 space-y-6 max-w-375">
          {/* Header tiêu đề & Nút Tạo thông báo mới */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">
                Quản lý thông báo
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tạo và gửi thông báo hệ thống đến giảng viên, học viên hoặc toàn bộ người dùng.
              </p>
            </div>

            <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer">
              <Plus className="size-4" /> Tạo thông báo mới
            </button>
          </div>

          {/* 4 Thẻ KPI Thống kê thông báo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Megaphone className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tổng thông báo đã gửi</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">124</h3>
                  <span className="text-[10px] font-bold text-emerald-600">↑ 15%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Users className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Gửi toàn hệ thống</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">45</h3>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <GraduationCap className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Gửi đến Giảng viên</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">32</h3>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <UserCheck className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Gửi đến Học viên</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">47</h3>
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
                placeholder="Tìm kiếm thông báo theo tiêu đề, nội dung..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <div className="md:col-span-7 flex items-center gap-3 justify-end">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-35"
              >
                <option>Tất cả đối tượng</option>
                <option>Toàn hệ thống</option>
                <option>Giảng viên</option>
                <option>Học viên</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-35"
              >
                <option>Tất cả mức độ</option>
                <option>Quan trọng</option>
                <option>Thông thường</option>
                <option>Cảnh báo</option>
              </select>

              <button className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-2 shadow-2xs transition cursor-pointer">
                <Filter className="size-3.5 text-blue-600" /> Lọc
              </button>
            </div>
          </div>

          {/* BẢNG DANH SÁCH THÔNG BÁO */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left text-[11px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4 w-80">Tiêu đề & Nội dung</th>
                    <th className="py-3.5 px-4">Đối tượng nhận</th>
                    <th className="py-3.5 px-4">Mức độ</th>
                    <th className="py-3.5 px-4">Người tạo</th>
                    <th className="py-3.5 px-4">Thời gian gửi</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {notificationsList.map((item) => (
                    <tr key={item.stt} className="hover:bg-slate-50/50 transition">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {item.stt}
                      </td>

                      {/* Tiêu đề & Nội dung */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block text-xs">
                          {item.title}
                        </span>
                        <p className="text-slate-500 line-clamp-1 mt-0.5 text-[10px]">
                          {item.content}
                        </p>
                      </td>

                      {/* Đối tượng nhận */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${item.targetStyle}`}
                        >
                          {item.target}
                        </span>
                      </td>

                      {/* Mức độ */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${item.priorityStyle}`}
                        >
                          <span className={`size-1.5 rounded-full ${item.priorityDot}`} />
                          {item.priority}
                        </span>
                      </td>

                      {/* Người tạo */}
                      <td className="py-3.5 px-4 text-slate-700 font-bold">
                        {item.author}
                      </td>

                      {/* Thời gian gửi */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                        {item.sentAt}
                      </td>

                      {/* Cột Thao tác */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="Chỉnh sửa"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            title="Xóa thông báo"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
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
                Hiển thị 1 - 6 trong 124 thông báo
              </span>

              <div className="flex items-center gap-1.5">
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
          </div>
        </main>
      </div>
    </div>
  );
}