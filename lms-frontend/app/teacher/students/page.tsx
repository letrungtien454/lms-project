"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

// 1. Navigation items Sidebar
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

// 2. Dữ liệu học viên mẫu (Khớp hoàn toàn với ảnh chụp mẫu)
const studentsData = [
  {
    stt: 1,
    name: "Nguyễn Thị Lan",
    email: "lan.nguyen@gmail.com",
    course: "Java Full Stack",
    status: "Đang học",
    date: "12/04/2025",
    avatarTone: "from-rose-400 to-pink-600",
  },
  {
    stt: 2,
    name: "Trần Minh Hoàng",
    email: "hoangtm@gmail.com",
    course: "Python Data Science",
    status: "Đang học",
    date: "10/04/2025",
    avatarTone: "from-blue-400 to-indigo-600",
  },
  {
    stt: 3,
    name: "Lê Thị Mai",
    email: "mai.lt@gmail.com",
    course: "Web Development",
    status: "Đã hoàn thành",
    date: "08/04/2025",
    avatarTone: "from-amber-400 to-orange-500",
  },
  {
    stt: 4,
    name: "Phạm Văn Tuấn",
    email: "tuanpv@gmail.com",
    course: "Java Full Stack",
    status: "Đang học",
    date: "05/04/2025",
    avatarTone: "from-emerald-400 to-teal-600",
  },
  {
    stt: 5,
    name: "Hoàng Đức Anh",
    email: "anhhd@gmail.com",
    course: "Machine Learning",
    status: "Đang học",
    date: "03/04/2025",
    avatarTone: "from-purple-400 to-violet-600",
  },
];

export default function TeacherStudentsPage() {
  const [selectedCourse, setSelectedCourse] = useState("Tất cả khóa học");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [currentPage, setCurrentPage] = useState(1);

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
              const isActive = label === "Quản lý học viên";
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

        {/* Nội dung trang */}
        <main className="p-6 space-y-5 max-w-375">
          {/* Tiêu đề trang & Các nút Action */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">
                Quản lý học viên
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi và quản lý học viên đăng ký các khóa học của bạn
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-2 shadow-2xs transition cursor-pointer">
                <Download className="size-4 text-blue-600" /> Xuất Excel
              </button>
              <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer">
                <Plus className="size-4" /> Thêm học viên
              </button>
            </div>
          </div>

          {/* Thanh lọc & Tìm kiếm */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
              <Search className="size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm học viên (tên, email...)"
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <div className="md:col-span-7 flex items-center gap-3 justify-end">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-37.5"
              >
                <option>Tất cả khóa học</option>
                <option>Java Full Stack</option>
                <option>Python Data Science</option>
                <option>Web Development</option>
                <option>Machine Learning</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-35"
              >
                <option>Tất cả trạng thái</option>
                <option>Đang học</option>
                <option>Đã hoàn thành</option>
              </select>
            </div>
          </div>

          {/* 4 Thẻ Thống Kê Chỉ Số Học Viên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <BookOpen className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tổng học viên</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">428</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 12% so với tháng trước
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Users className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Học viên mới</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">86</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 18% so với tháng trước
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <UserCheck className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Đang học</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">312</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 8% so với tháng trước
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Hoàn thành</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">116</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 15% so với tháng trước
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bảng Danh Sách Học Viên */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-[11px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-14 text-center">STT</th>
                    <th className="py-3.5 px-4">Họ tên</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Khóa học</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4">Ngày đăng ký</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {studentsData.map((student) => (
                    <tr
                      key={student.stt}
                      className="hover:bg-slate-50/50 transition"
                    >
                      {/* Ô Số Thứ Tự tròn màu nhạt */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                          {student.stt}
                        </span>
                      </td>

                      {/* Họ tên + Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${student.avatarTone} font-bold text-white text-[10px] shadow-2xs`}
                          >
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                          <span className="font-bold text-slate-900">
                            {student.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {student.email}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {student.course}
                      </td>

                      {/* Trạng thái Huy hiệu Pill */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                            student.status === "Đang học"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-amber-50 text-amber-600 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              student.status === "Đang học"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {student.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {student.date}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer transition">
                          <MoreHorizontal className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-1.5 text-xs">
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
                      ? "bg-blue-600 text-white"
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
        </main>
      </div>
    </div>
  );
}