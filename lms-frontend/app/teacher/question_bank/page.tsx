"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileQuestion,
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

// 2. Dữ liệu mẫu (Mock Data) chuẩn 100% theo hình ảnh
const questionsData = [
  {
    id: 1,
    title: "Java là gì?",
    desc: "Java là một ngôn ngữ lập trình hướng đối tượng...",
    course: "Java Full Stack",
    type: "Trắc nghiệm",
    level: "Dễ",
    createdBy: "Nguyễn Văn Nam",
    createdAt: "12/08/2025",
  },
  {
    id: 2,
    title: "Cho đoạn code sau, kết quả là gì?",
    desc: "System.out.println(10 + 5);",
    course: "Java Full Stack",
    type: "Trắc nghiệm",
    level: "Trung bình",
    createdBy: "Nguyễn Văn Nam",
    createdAt: "10/08/2025",
  },
  {
    id: 3,
    title: "Viết hàm tính giai thừa của một số nguyên dương n",
    desc: "Yêu cầu sử dụng đệ quy hoặc vòng lặp...",
    course: "Java Full Stack",
    type: "Lập trình",
    level: "Khó",
    createdBy: "Nguyễn Văn Nam",
    createdAt: "08/08/2025",
  },
  {
    id: 4,
    title: "Phân biệt giữa ArrayList và LinkedList?",
    desc: "Trả lời ngắn gọn về ưu và nhược điểm...",
    course: "Java Full Stack",
    type: "Tự luận",
    level: "Trung bình",
    createdBy: "Nguyễn Văn Nam",
    createdAt: "05/08/2025",
  },
  {
    id: 5,
    title: "Trong Python, đâu là kiểu dữ liệu phù hợp nhất?",
    desc: "Khi lưu trữ một danh sách các số nguyên...",
    course: "Python for Data Science",
    type: "Trắc nghiệm",
    level: "Dễ",
    createdBy: "Nguyễn Văn Nam",
    createdAt: "02/08/2025",
  },
];

export default function QuestionBankPage() {
  const [selectedCourse, setSelectedCourse] = useState("Tất cả khóa học");
  const [selectedType, setSelectedType] = useState("Tất cả loại");
  const [selectedLevel, setSelectedLevel] = useState("Tất cả mức độ");
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="flex min-h-screen bg-[#f6f9fd] text-slate-800 font-sans text-xs antialiased">
      {/* SIDEBAR TRÁI */}
      <aside className="fixed inset-y-0 left-0 z-40 w-57.5 bg-[#102957] text-white flex flex-col justify-between">
        <div>
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
              const isActive = label === "Ngân hàng câu hỏi";
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
          {/* Tiêu đề trang & Nút Tạo câu hỏi */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">
                Ngân hàng câu hỏi
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý và tạo câu hỏi cho các bài quiz và bài tập
              </p>
            </div>
            <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer">
              <Plus className="size-4" /> Tạo câu hỏi
            </button>
          </div>

          {/* Thanh lọc & Tìm kiếm */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
              <Search className="size-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm câu hỏi, chủ đề..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <div className="md:col-span-7 flex items-center gap-3 justify-end">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-35"
              >
                <option>Tất cả khóa học</option>
                <option>Java Full Stack</option>
                <option>Python for Data Science</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-30"
              >
                <option>Tất cả loại</option>
                <option>Trắc nghiệm</option>
                <option>Tự luận</option>
                <option>Lập trình</option>
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 outline-none shadow-2xs cursor-pointer min-w-32.5"
              >
                <option>Tất cả mức độ</option>
                <option>Dễ</option>
                <option>Trung bình</option>
                <option>Khó</option>
              </select>
            </div>
          </div>

          {/* 4 Thẻ Thống Kê Tổng Quan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <FileQuestion className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tổng câu hỏi</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">246</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 12 tuần này
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <HelpCircle className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Trắc nghiệm</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">180</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 73%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Tự luận</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">32</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 13%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <Code2 className="size-5" />
              </span>
              <div>
                <p className="text-[11px] text-slate-400">Lập trình</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-xl font-bold text-[#17305f]">34</h3>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ↑ 14%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bảng Danh Sách Câu Hỏi */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left text-[11px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input type="checkbox" className="rounded border-slate-300 accent-blue-600" />
                    </th>
                    <th className="py-3.5 px-2">Nội dung câu hỏi</th>
                    <th className="py-3.5 px-4">Khóa học</th>
                    <th className="py-3.5 px-3">Loại</th>
                    <th className="py-3.5 px-3">Mức độ</th>
                    <th className="py-3.5 px-4">Tạo bởi</th>
                    <th className="py-3.5 px-4">Ngày tạo</th>
                    <th className="py-3.5 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {questionsData.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3.5 text-center">
                        <input type="checkbox" className="rounded border-slate-300 accent-blue-600" />
                      </td>
                      <td className="py-3.5 px-2 max-w-70">
                        <p className="font-bold text-slate-900 truncate">{q.title}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{q.desc}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{q.course}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            q.type === "Trắc nghiệm"
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : q.type === "Tự luận"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-indigo-50 text-indigo-600 border-indigo-200"
                          }`}
                        >
                          {q.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-bold ${
                            q.level === "Dễ"
                              ? "text-emerald-600"
                              : q.level === "Trung bình"
                              ? "text-amber-500"
                              : "text-rose-500"
                          }`}
                        >
                          {q.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{q.createdBy}</td>
                      <td className="py-3.5 px-4 text-slate-500">{q.createdAt}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer">
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

              {[1, 2, 3, 4, 5].map((page) => (
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