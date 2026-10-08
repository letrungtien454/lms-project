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
  UserCheck,
  UserLock,
  UserX,
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

// 2. Dữ liệu danh sách giảng viên chuẩn theo ảnh chụp mẫu
const teachersList = [
  {
    stt: 1,
    name: "Nguyễn Văn Nam",
    email: "nam.nguyen@email.com",
    specialty: "Java, Spring Boot",
    courseCount: 3,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    avatarTone: "from-blue-400 to-indigo-600",
  },
  {
    stt: 2,
    name: "Trần Thị Hương",
    email: "huong.tran@email.com",
    specialty: "Python, Data Science",
    courseCount: 2,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    avatarTone: "from-rose-400 to-pink-600",
  },
  {
    stt: 3,
    name: "Lê Quốc Bảo",
    email: "bao.le@email.com",
    specialty: "Web Development",
    courseCount: 4,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    avatarTone: "from-amber-400 to-orange-500",
  },
  {
    stt: 4,
    name: "Phạm Thị Mai",
    email: "mai.pham@email.com",
    specialty: "Machine Learning",
    courseCount: 2,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    avatarTone: "from-purple-400 to-violet-600",
  },
  {
    stt: 5,
    name: "Hoàng Anh Tuấn",
    email: "tuan.hoang@email.com",
    specialty: "Database",
    courseCount: 1,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    avatarTone: "from-cyan-400 to-blue-600",
  },
  {
    stt: 6,
    name: "Đỗ Văn Kiên",
    email: "kien.do@email.com",
    specialty: "Frontend",
    courseCount: 3,
    status: "Tạm khóa",
    statusStyle: "bg-rose-50 text-rose-600 border-rose-200",
    dotColor: "bg-rose-500",
    avatarTone: "from-slate-400 to-slate-600",
  },
  {
    stt: 7,
    name: "Nguyễn Thị Lan",
    email: "lan.nguyen@email.com",
    specialty: "UI/UX Design",
    courseCount: 1,
    status: "Hoạt động",
    statusStyle: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dotColor: "bg-emerald-500",
    avatarTone: "from-teal-400 to-emerald-600",
  },
  {
    stt: 8,
    name: "Lý Minh Đức",
    email: "duc.ly@email.com",
    specialty: "Mobile App",
    courseCount: 2,
    status: "Chờ duyệt",
    statusStyle: "bg-amber-50 text-amber-600 border-amber-200",
    dotColor: "bg-amber-500",
    avatarTone: "from-indigo-400 to-blue-600",
  },
];

export default function AdminTeachersPage() {
  const [selectedStatus, setSelectedStatus] = useState("Tất cả trạng thái");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tất cả chuyên môn");
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
              const isActive = label === "Quản lý giảng viên";
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

        {/* Nội dung trang Quản lý giảng viên */}
        <main className="p-6 space-y-6 max-w-375">
          {/* Header tiêu đề & Nút Thêm giảng viên */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">Quản lý giảng viên</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý thông tin giảng viên trên hệ thống.
              </p>
            </div>

            <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer">
              <Plus className="size-4" /> Thêm giảng viên
            </button>
          </div>

          {/* 4 Thẻ KPI Thống kê giảng viên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <BookOpen className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tổng giảng viên</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">86</h3>
                  <span className="text-[10px] font-bold text-emerald-600">↑ 6%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <UserCheck className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Đang hoạt động</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">78</h3>
                  <span className="text-[10px] font-bold text-emerald-600">↑ 8%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <UserX className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tạm khóa</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">5</h3>
                  <span className="text-[10px] font-bold text-rose-500">↓ 2%</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <UserLock className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Chờ duyệt</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">3</h3>
                  <span className="text-[10px] font-bold text-slate-400">→ 0%</span>
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
                placeholder="Tìm kiếm giảng viên theo tên, email..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <div className="md:col-span-7 flex items-center gap-3 justify-end">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-35"
              >
                <option>Tất cả trạng thái</option>
                <option>Hoạt động</option>
                <option>Tạm khóa</option>
                <option>Chờ duyệt</option>
              </select>

              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-37.5"
              >
                <option>Tất cả chuyên môn</option>
                <option>Java, Spring Boot</option>
                <option>Python, Data Science</option>
                <option>Web Development</option>
                <option>Machine Learning</option>
              </select>

              <button className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center gap-2 shadow-2xs transition cursor-pointer">
                <Filter className="size-3.5 text-blue-600" /> Lọc
              </button>
            </div>
          </div>

          {/* BẢNG DANH SÁCH GIẢNG VIÊN */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-[11px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">Họ tên</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Chuyên môn</th>
                    <th className="py-3.5 px-4 text-center">Số khóa học</th>
                    <th className="py-3.5 px-4">Trạng thái</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {teachersList.map((teacher) => (
                    <tr key={teacher.stt} className="hover:bg-slate-50/50 transition">
                      {/* STT */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {teacher.stt}
                      </td>

                      {/* Họ tên + Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${teacher.avatarTone} font-bold text-white text-[10px] shadow-2xs`}
                          >
                            {teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                          <span className="font-bold text-slate-900">{teacher.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-500">{teacher.email}</td>

                      {/* Chuyên môn */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{teacher.specialty}</td>

                      {/* Số khóa học */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {teacher.courseCount}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${teacher.statusStyle}`}
                        >
                          <span className={`size-1.5 rounded-full ${teacher.dotColor}`} />
                          {teacher.status}
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
                            title="Khóa/Mở khóa"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Lock className="size-3.5" />
                          </button>
                          <button
                            title="Thao tác khác"
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
                Hiển thị 1 - 8 trong 86 giảng viên
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