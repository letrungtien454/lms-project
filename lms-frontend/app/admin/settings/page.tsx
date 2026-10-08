"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  FileCheck,
  FolderKanban,
  Globe,
  GraduationCap,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
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

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "info" | "security" | "payment" | "appearance" | "other"
  >("info");

  // State Dữ liệu Form Thông tin hệ thống
  const [systemInfo, setSystemInfo] = useState({
    name: "EduFlow LMS",
    description: "Hệ thống quản lý học tập trực tuyến",
    email: "support@eduflow.vn",
    phone: "0123 456 789",
    address: "Số 123, Đường Nguyễn Văn Cừ, TP. Vinh, Nghệ An",
  });

  // State Dữ liệu Cài đặt chung (Toggles)
  const [generalSettings, setGeneralSettings] = useState({
    allowRegistration: true,
    manualCourseApproval: true,
    enableNotifications: true,
    maintenanceMode: false,
    defaultLanguage: "Tiếng Việt",
    timezone: "(GMT+7) Asia/Ho_Chi_Minh",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSystemInfo({ ...systemInfo, [e.target.name]: e.target.value });
  };

  const toggleSetting = (key: keyof typeof generalSettings) => {
    if (typeof generalSettings[key] === "boolean") {
      setGeneralSettings({ ...generalSettings, [key]: !generalSettings[key] });
    }
  };

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

        {/* Nội dung trang Cài đặt hệ thống */}
        <main className="p-6 space-y-6 max-w-375">
          {/* Header tiêu đề */}
          <div>
            <h1 className="text-xl font-bold text-[#17305f]">
              Cài đặt hệ thống
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tùy chỉnh các cấu hình chung của hệ thống.
            </p>
          </div>

          {/* Sub-Tabs chuyển đổi cài đặt */}
          <div className="flex items-center gap-8 border-b border-slate-200/80 pt-1 pb-3">
            {[
              { id: "info", label: "Thông tin hệ thống" },
              { id: "security", label: "Bảo mật" },
              { id: "payment", label: "Thanh toán" },
              { id: "appearance", label: "Giao diện" },
              { id: "other", label: "Khác" },
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

          {/* BỐ CỤC 2 CỘT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* CỘT TRÁI (7 COLS): THÔNG TIN HỆ THỐNG */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-5">
              <h2 className="text-sm font-bold text-[#17305f]">
                Thông tin hệ thống
              </h2>

              <div className="space-y-4">
                {/* Tên hệ thống */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Tên hệ thống
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={systemInfo.name}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>

                {/* Mô tả */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={systemInfo.description}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>

                {/* Email liên hệ */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={systemInfo.email}
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
                    value={systemInfo.phone}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>

                {/* Địa chỉ */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={systemInfo.address}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
                  />
                </div>

                {/* Logo hệ thống */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Logo hệ thống
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-blue-500 to-blue-700 text-white shadow-md">
                      <GraduationCap className="size-8" />
                    </span>

                    <button className="h-9 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 font-bold rounded-xl flex items-center gap-2 shadow-2xs transition cursor-pointer">
                      <ImageIcon className="size-4" /> Thay đổi logo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (5 COLS): CÀI ĐẶT CHUNG */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-6">
              <h2 className="text-sm font-bold text-[#17305f]">
                Cài đặt chung
              </h2>

              <div className="space-y-4">
                {/* 1. Cho phép đăng ký tài khoản mới */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-700">
                    Cho phép đăng ký tài khoản mới
                  </span>
                  <button
                    onClick={() => toggleSetting("allowRegistration")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      generalSettings.allowRegistration
                        ? "bg-blue-600"
                        : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        generalSettings.allowRegistration
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Duyệt thủ công khóa học */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-700">
                    Duyệt thủ công khóa học
                  </span>
                  <button
                    onClick={() => toggleSetting("manualCourseApproval")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      generalSettings.manualCourseApproval
                        ? "bg-blue-600"
                        : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        generalSettings.manualCourseApproval
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Kích hoạt thông báo hệ thống */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-700">
                    Kích hoạt thông báo hệ thống
                  </span>
                  <button
                    onClick={() => toggleSetting("enableNotifications")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      generalSettings.enableNotifications
                        ? "bg-blue-600"
                        : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        generalSettings.enableNotifications
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Bảo trì hệ thống */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-700">
                    Bảo trì hệ thống
                  </span>
                  <button
                    onClick={() => toggleSetting("maintenanceMode")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      generalSettings.maintenanceMode
                        ? "bg-blue-600"
                        : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        generalSettings.maintenanceMode
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Ngôn ngữ mặc định */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-bold text-slate-700">
                    Ngôn ngữ mặc định
                  </label>
                  <select
                    value={generalSettings.defaultLanguage}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        defaultLanguage: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition cursor-pointer"
                  >
                    <option>Tiếng Việt</option>
                    <option>English</option>
                  </select>
                </div>

                {/* Múi giờ */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    Múi giờ
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        timezone: e.target.value,
                      })
                    }
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition cursor-pointer"
                  >
                    <option>(GMT+7) Asia/Ho_Chi_Minh</option>
                    <option>(GMT+0) UTC</option>
                    <option>(GMT-5) America/New_York</option>
                  </select>
                </div>
              </div>

              {/* Nút Đặt lại & Lưu thay đổi */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 text-xs transition cursor-pointer">
                  Đặt lại
                </button>
                <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200 transition cursor-pointer">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}