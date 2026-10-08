"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FileText,
  GraduationCap,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  Lock,
  Mail,
  MessageSquare,
  Palette,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
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

export default function TeacherSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "notifications" | "security" | "appearance"
  >("profile");

  // State dữ liệu Form Hồ sơ cá nhân
  const [formData, setFormData] = useState({
    fullName: "Nguyễn Văn Nam",
    email: "nam@eduflow.com",
    phone: "0987 654 321",
    specialty: "Lập trình Web",
    bio: "Giảng viên chuyên ngành Công nghệ thông tin, với hơn 5 năm kinh nghiệm trong lĩnh vực phát triển phần mềm và giảng dạy.",
    role: "Giảng viên",
    joinDate: "20/01/2024",
    status: "Đang hoạt động",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
              const isActive = label === "Cài đặt";
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

        {/* Nội dung trang Cài đặt */}
        <main className="p-6 space-y-6 max-w-300">
          {/* Thanh Sub-Header / Sub-Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200/80 pb-3">
            {[
              { id: "profile", label: "Hồ sơ cá nhân" },
              { id: "password", label: "Đổi mật khẩu" },
              { id: "notifications", label: "Thông báo" },
              { id: "security", label: "Bảo mật" },
              { id: "appearance", label: "Giao diện" },
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

          {/* BỐ CỤC 2 CỘT FORM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CỘT TRÁI (8 Cols): THÔNG TIN CÁ NHÂN */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-6">
              <h2 className="text-sm font-extrabold text-[#17305f]">
                Thông tin cá nhân
              </h2>

              {/* Khối Avatar đại diện */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <span className="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-amber-300 to-orange-500 font-extrabold text-white text-lg shadow-md">
                    NV
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      Nguyễn Văn Nam
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Giảng viên
                    </p>
                  </div>
                </div>

                <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-blue-600 font-bold rounded-xl border border-slate-200 text-xs transition cursor-pointer">
                  Đổi ảnh
                </button>
              </div>

              {/* Form Chi Tiết */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Họ và tên */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>

                {/* Chuyên môn */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Chuyên môn
                  </label>
                  <select
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition cursor-pointer"
                  >
                    <option>Lập trình Web</option>
                    <option>Khoa học Dữ liệu</option>
                    <option>Trí tuệ Nhân tạo</option>
                    <option>Mobile App</option>
                  </select>
                </div>

                {/* Giới thiệu bản thân */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Giới thiệu <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs leading-relaxed outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition resize-none"
                  />
                </div>
              </div>

              {/* Nút Thao tác */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-blue-600 font-bold rounded-xl text-xs transition cursor-pointer">
                  Hủy
                </button>
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200 transition cursor-pointer">
                  Lưu thay đổi
                </button>
              </div>
            </div>

            {/* CỘT PHẢI (4 Cols): THÔNG TIN KHÁC */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-5">
              <h2 className="text-sm font-extrabold text-[#17305f]">
                Thông tin khác
              </h2>

              <div className="space-y-4">
                {/* Vai trò */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">
                    Vai trò
                  </label>
                  <div className="flex items-center gap-2.5 h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700">
                    <User className="size-4 text-slate-400" />
                    <span>{formData.role}</span>
                    <ChevronDown className="size-4 text-slate-400 ml-auto" />
                  </div>
                </div>

                {/* Ngày tham gia */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">
                    Ngày tham gia
                  </label>
                  <div className="flex items-center gap-2.5 h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
                    <Calendar className="size-4 text-slate-400" />
                    <span>{formData.joinDate}</span>
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">
                    Trạng thái
                  </label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                    <span className="flex size-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-emerald-600">
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}