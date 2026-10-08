"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  MoreVertical,
  PlayCircle,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  TrendingUp,
} from "lucide-react";

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

const chaptersData = [
  {
    id: 1,
    title: "Chương 1: Giới thiệu Java và OOP",
    lessonCount: 5,
    lessons: [
      { id: 101, title: "1.1 Tổng quan về Java", type: "Video", duration: "10:15", status: "Đã xuất bản" },
      { id: 102, title: "1.2 Cài đặt môi trường", type: "Tài liệu", duration: "05:00", status: "Đã xuất bản" },
      { id: 103, title: "1.3 Biến, kiểu dữ liệu", type: "Video", duration: "12:30", status: "Đã xuất bản" },
      { id: 104, title: "1.4 Lập trình hướng đối tượng", type: "Code", duration: "25:00", status: "Đã xuất bản" },
      { id: 105, title: "1.5 Bài tập thực hành", type: "Quiz", duration: "15:00", status: "Bản nháp" },
    ],
  },
  {
    id: 2,
    title: "Chương 2: Collection Framework",
    lessonCount: 4,
    lessons: [
      { id: 201, title: "2.1 List, Set, Map", type: "Video", duration: "18:20", status: "Đã xuất bản" },
    ],
  },
  {
    id: 3,
    title: "Chương 3: Exception Handling",
    lessonCount: 3,
    lessons: [],
  },
  {
    id: 4,
    title: "Chương 4: Spring Boot",
    lessonCount: 6,
    lessons: [],
  },
];

export default function TeacherLessonsPage() {
  const [selectedCourse, setSelectedCourse] = useState("Java Full Stack");
  const [activeChapter, setActiveChapter] = useState<number | null>(1);
  const [selectedLessonId, setSelectedLessonId] = useState(103);
  const [activeTab, setActiveTab] = useState<"content" | "attachment" | "code" | "quiz" | "discussion">("content");

  const activeLesson = chaptersData
    .flatMap((c) => c.lessons)
    .find((l) => l.id === selectedLessonId) || chaptersData[0].lessons[2];

  return (
    <div className="flex min-h-screen bg-[#f6f9fd] text-slate-800 font-sans text-xs antialiased">
      {/* 1. SIDEBAR TRÁI */}
      <aside className="fixed inset-y-0 left-0 z-40 w-57.5 bg-[#102957] text-white flex flex-col justify-between">
        <div>
          <div className="flex h-17.5 items-center gap-3 border-b border-white/10 px-5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-500 shadow-md">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">Giảng viên</p>
              <p className="text-[10px] text-blue-200/80 leading-tight mt-0.5">Không gian quản lý</p>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map(([label, Icon, path]) => {
              const isActive = label === "Quản lý bài học";
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

      {/* 2. KHU VỰC CHÍNH */}
      <div className="pl-57.5 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-17.5 border-b border-slate-200 bg-white/95 backdrop-blur px-7 flex items-center justify-between">
          <div className="flex max-w-110 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search className="size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài học, chương..."
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
                <p className="font-bold text-slate-800 leading-tight">Nguyễn Văn Nam</p>
                <p className="text-[10px] text-slate-400">Giảng viên</p>
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung chính */}
        <main className="p-6 space-y-5 max-w-375">
          {/* Action Bar trên cùng */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">Quản lý bài học</h1>
              <p className="text-xs text-slate-500 mt-0.5">Quản lý các chương và bài học trong khóa học của bạn</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option>Java Full Stack</option>
                <option>Python for Data Science</option>
                <option>Web Development</option>
              </select>

              <select className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none">
                <option>Tất cả chương</option>
              </select>

              <select className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none">
                <option>Tất cả loại</option>
              </select>

              <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer">
                <Plus className="size-4" /> Tạo bài học mới
              </button>
            </div>
          </div>

          {/* Bố cục Master - Detail (2 Cột) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* 1. KHỐI CỘT TRÁI (4 cols): KHÓA HỌC + DANH SÁCH CHƯƠNG GỘP LÀM 1 KHỐI DÙNG CHUNG */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
              {/* Đầu khối: Thông tin Khóa học */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="size-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-900 text-white font-bold flex items-center justify-center shrink-0">
                  Java
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs">Java Full Stack</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">128 học viên • ⭐ 4.8</p>
                </div>
              </div>

              {/* Thân khối: Accordion Danh sách Chương & Bài học */}
              <div className="space-y-2">
                {chaptersData.map((chapter) => {
                  const isOpen = activeChapter === chapter.id;
                  return (
                    <div key={chapter.id} className="rounded-xl border border-slate-200/80 overflow-hidden">
                      <button
                        onClick={() => setActiveChapter(isOpen ? null : chapter.id)}
                        className="w-full p-3 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/80 transition font-bold text-slate-800 text-left"
                      >
                        <div>
                          <p className="text-xs">{chapter.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{chapter.lessonCount} bài học</p>
                        </div>
                        {isOpen ? <ChevronUp className="size-4 text-slate-400" /> : <ChevronDown className="size-4 text-slate-400" />}
                      </button>

                      {isOpen && chapter.lessons.length > 0 && (
                        <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                          {chapter.lessons.map((lesson) => {
                            const isSelected = selectedLessonId === lesson.id;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => setSelectedLessonId(lesson.id)}
                                className={`w-full flex items-center justify-between p-2 rounded-lg transition cursor-pointer text-left ${
                                  isSelected
                                    ? "bg-blue-50 border border-blue-200 text-blue-700 font-bold"
                                    : "hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <span className="truncate pr-2">{lesson.title}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${
                                    lesson.type === "Video"
                                      ? "bg-blue-50 text-blue-600 border-blue-200"
                                      : lesson.type === "Tài liệu"
                                      ? "bg-sky-50 text-sky-600 border-sky-200"
                                      : lesson.type === "Code"
                                      ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                                      : "bg-rose-50 text-rose-600 border-rose-200"
                                  }`}
                                >
                                  {lesson.type}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. KHỐI CỘT PHẢI (8 cols): TOÀN BỘ CHI TIẾT BÀI HỌC, VIDEO PREVIEW & TABS GỘP LÀM 1 KHỐI DÙNG CHUNG */}
            <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
              {/* Phần 1: Header Bài học (Tiêu đề, Bảng trạng thái & Nút Sửa) */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-extrabold text-slate-900">{activeLesson.title}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-200">
                    ● {activeLesson.type}
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="size-3" /> {activeLesson.duration}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
                    ● {activeLesson.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 flex items-center gap-1 transition cursor-pointer">
                    <Edit3 className="size-3.5" /> Sửa
                  </button>
                  <button className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 cursor-pointer">
                    <MoreVertical className="size-4" />
                  </button>
                </div>
              </div>

              {/* Phần 2: Trình xem Video / Khung Preview */}
              <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-inner relative aspect-video flex items-center justify-center">
                <div className="text-center text-white space-y-3">
                  <div className="size-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg hover:scale-105 transition cursor-pointer">
                    <PlayCircle className="size-10" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Java Variables & Data Types</h4>
                    <p className="text-[10px] text-slate-400">Xem trước video bài giảng (12:30)</p>
                  </div>
                </div>
              </div>

              {/* Phần 3: Thanh Tabs chuyển đổi nội dung */}
              <div className="flex gap-2 border-b border-slate-100 pb-3">
                {[
                  { key: "content", label: "Nội dung" },
                  { key: "attachment", label: "Tài liệu đi kèm" },
                  { key: "code", label: "Mã nguồn" },
                  { key: "quiz", label: "Quiz" },
                  { key: "discussion", label: "Thảo luận" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeTab === tab.key
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Phần 4: Nội dung chi tiết bài học */}
              <div className="pt-1 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">Nội dung bài học</h4>
                <div className="text-xs leading-relaxed text-slate-600 space-y-2">
                  <p>Trong bài học này chúng ta sẽ tìm hiểu về:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Các kiểu dữ liệu cơ bản trong Java (int, double, boolean...)</li>
                    <li>Cách khai báo và sử dụng biến</li>
                    <li>Các toán tử và biểu thức cơ bản</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}