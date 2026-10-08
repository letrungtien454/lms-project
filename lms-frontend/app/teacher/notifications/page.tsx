"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Info,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

// 1. Navigation items Sidebar Giảng viên
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

// 2. Dữ liệu danh sách thông báo mẫu
const notificationsData = [
  {
    id: 1,
    title: "Học viên mới đăng ký khóa học",
    desc: "Nguyễn Thị Lan đã đăng ký khóa Java Full Stack",
    time: "10 phút trước",
    isRead: false,
    icon: UserPlus,
    iconBg: "bg-cyan-50 text-cyan-600 border-cyan-200",
  },
  {
    id: 2,
    title: "Bài nộp mới cần chấm",
    desc: "Trần Minh Hoàng đã nộp bài Quiz Java OOP",
    time: "25 phút trước",
    isRead: false,
    icon: FileCheck,
    iconBg: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    id: 3,
    title: "Có 3 câu hỏi mới trong thảo luận",
    desc: "Trong khóa Python Data Science",
    time: "1 giờ trước",
    isRead: false,
    icon: MessageSquare,
    iconBg: "bg-rose-50 text-rose-500 border-rose-200",
  },
  {
    id: 4,
    title: "Đánh giá mới",
    desc: "Lê Thị Mai đã đánh giá 5 sao cho khóa Web Development",
    time: "2 giờ trước",
    isRead: true,
    icon: Star,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    id: 5,
    title: "Hệ thống",
    desc: "Cập nhật phiên bản hệ thống thành công",
    time: "3 giờ trước",
    isRead: true,
    icon: Info,
    iconBg: "bg-orange-50 text-orange-500 border-orange-200",
  },
  {
    id: 6,
    title: "Nhắc nhở",
    desc: "Bạn có 1 khóa học chưa xuất bản",
    time: "1 ngày trước",
    isRead: true,
    icon: Bell,
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
];

export default function TeacherNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all");

  // State các toggle cài đặt thông báo
  const [settings, setSettings] = useState({
    studentRegister: true,
    quizSubmit: true,
    comment: true,
    newRating: true,
    systemNotification: true,
    emailNotification: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Lọc thông báo theo tab
  const filteredNotifications = notificationsData.filter((item) => {
    if (activeTab === "unread") return !item.isRead;
    if (activeTab === "read") return item.isRead;
    return true;
  });

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
                  {label === "Thông báo" && (
                    <span className="ml-auto flex size-2 rounded-full bg-red-500" />
                  )}
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

        {/* Nội dung chính trang Thông báo */}
        <main className="p-6 space-y-6 max-w-350">
          {/* Header tiêu đề */}
          <div>
            <h1 className="text-xl font-bold text-[#17305f]">Thông báo</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi các thông báo quan trọng từ hệ thống và học viên
            </p>
          </div>

          {/* BỐ CỤC 2 CỘT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* CỘT TRÁI (8 COLS): DANH SÁCH THÔNG BÁO */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
              
              {/* Tabs Lọc Thông Báo */}
              <div className="flex gap-2 border-b border-slate-100 pb-3">
                {[
                  { id: "all", label: "Tất cả (12)" },
                  { id: "unread", label: "Chưa đọc (3)" },
                  { id: "read", label: "Đã đọc (9)" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600 border border-blue-200"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Danh sách Item Thông báo */}
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 flex items-start justify-between gap-4 rounded-xl transition hover:bg-slate-50/80 ${
                        !item.isRead ? "bg-slate-50/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <span
                          className={`flex size-9 items-center justify-center rounded-xl border shrink-0 mt-0.5 ${item.iconBg}`}
                        >
                          <IconComponent className="size-4.5" />
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                            {item.title}
                            {!item.isRead && (
                              <span className="size-2 rounded-full bg-blue-600 inline-block" />
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium shrink-0 pt-0.5">
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI (4 COLS): CÀI ĐẶT THÔNG BÁO */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-5">
              <h2 className="font-bold text-[#17305f] text-xs">
                Cài đặt thông báo
              </h2>

              <div className="space-y-4 text-xs font-medium text-slate-700">
                {/* 1. Học viên đăng ký khóa học */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <UserPlus className="size-4 text-slate-400" />
                    <span>Học viên đăng ký khóa học</span>
                  </div>
                  <button
                    onClick={() => toggleSetting("studentRegister")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.studentRegister ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        settings.studentRegister ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Bài nộp cần chấm */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="size-4 text-slate-400" />
                    <span>Bài nộp cần chấm</span>
                  </div>
                  <button
                    onClick={() => toggleSetting("quizSubmit")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.quizSubmit ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        settings.quizSubmit ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Bình luận / Hỏi đáp */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="size-4 text-slate-400" />
                    <span>Bình luận / Hỏi đáp</span>
                  </div>
                  <button
                    onClick={() => toggleSetting("comment")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.comment ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        settings.comment ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 4. Đánh giá mới */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Star className="size-4 text-slate-400" />
                    <span>Đánh giá mới</span>
                  </div>
                  <button
                    onClick={() => toggleSetting("newRating")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.newRating ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        settings.newRating ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 5. Thông báo hệ thống */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Info className="size-4 text-slate-400" />
                    <span>Thông báo hệ thống</span>
                  </div>
                  <button
                    onClick={() => toggleSetting("systemNotification")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.systemNotification ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        settings.systemNotification ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 6. Email thông báo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mail className="size-4 text-slate-400" />
                    <span>Email thông báo</span>
                  </div>
                  <button
                    onClick={() => toggleSetting("emailNotification")}
                    className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                      settings.emailNotification ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <div
                      className={`bg-white size-4 rounded-full shadow-md transform transition-transform ${
                        settings.emailNotification ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Nút Lưu cài đặt */}
              <div className="pt-2">
                <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200 transition cursor-pointer">
                  Lưu cài đặt
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}