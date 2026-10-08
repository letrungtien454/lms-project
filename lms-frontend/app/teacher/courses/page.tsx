"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";

const courses = [
  [
    "Java Full Stack",
    "Lập trình",
    "128",
    "1,200,000₫",
    "Đang phát hành",
    "12/08/2025",
    "from-orange-500 to-red-900",
    "☕",
  ],
  [
    "Python for Data Science",
    "Dữ liệu",
    "96",
    "1,000,000₫",
    "Đang phát hành",
    "05/08/2025",
    "from-sky-500 to-blue-950",
    "Py",
  ],
  [
    "Web Development",
    "Web",
    "84",
    "800,000₫",
    "Bản nháp",
    "28/07/2025",
    "from-cyan-500 to-indigo-950",
    "</>",
  ],
  [
    "Machine Learning cơ bản",
    "AI",
    "62",
    "1,500,000₫",
    "Đang phát hành",
    "20/07/2025",
    "from-violet-500 to-indigo-950",
    "✣",
  ],
  [
    "Data Structure & Algorithm",
    "Lập trình",
    "45",
    "900,000₫",
    "Đang phát hành",
    "15/07/2025",
    "from-slate-700 to-slate-950",
    "◇",
  ],
] as const;

const nav = [
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

function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-57.5 flex-col bg-[#102957] text-white md:flex ${open ? "flex" : "hidden"}`}
      >
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
          {nav.map(([label, Icon, path]) => {
            const isActive = label === "Quản lý khóa học";
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
      </aside>
      <button
        className="fixed bottom-5 left-4 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Mở menu"
      >
        <Menu className="size-5" />
      </button>
    </>
  );
}

export default function TeacherCourses() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f6f9fd] text-slate-800 font-sans text-xs antialiased">
      <Sidebar open={open} setOpen={setOpen} />
      <main className="min-h-screen md:pl-57.5">
        <header className="sticky top-0 z-30 flex h-17.5 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-4 sm:px-7">
          <div className="flex items-center gap-3 flex-1">
            <button
              className="md:hidden p-1 text-slate-500 hover:text-blue-600"
              onClick={() => setOpen(!open)}
              aria-label="Mở menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex max-w-110 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="size-4 text-slate-400" />
              <input
                className="w-full bg-transparent text-xs outline-none"
                placeholder="Tìm khóa học, học viên, nội dung..."
              />
            </div>
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
              <div className="hidden sm:block">
                <p className="font-bold text-slate-800 leading-tight">Nguyễn Văn Nam</p>
                <p className="text-[10px] text-slate-400">Giảng viên</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-375 space-y-5 p-4 sm:p-6 lg:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#17305f]">Quản lý khóa học</h1>
              <p className="text-xs text-slate-500 mt-0.5">Tạo, chỉnh sửa và quản lý các khóa học của bạn</p>
            </div>
            <button className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 shadow-md shadow-blue-200 transition cursor-pointer self-start sm:self-auto">
              <Plus className="size-4" /> Tạo khóa học mới
            </button>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              [
                "Tổng khóa học",
                "5",
                "↑ 1 khóa học",
                "bg-blue-50 text-blue-600",
                BookOpen,
              ],
              [
                "Đang phát hành",
                "3",
                "↑ 60%",
                "bg-violet-50 text-violet-600",
                Users,
              ],
              [
                "Bản nháp",
                "1",
                "↑ 20%",
                "bg-amber-50 text-amber-600",
                FileQuestion,
              ],
              [
                "Tổng học viên",
                "428",
                "↑ 12%",
                "bg-blue-50 text-blue-600",
                Users,
              ],
            ].map(([label, value, change, tone, Icon]) => (
              <div
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.05)]"
                key={label as string}
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-full ${tone as string}`}
                >
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 text-xs text-slate-500">{label as string}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <strong className="text-2xl font-bold text-[#17305f]">
                    {value as string}
                  </strong>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    {change as string}
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)]">
            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <Search className="size-4 text-slate-400" />
                <input
                  placeholder="Tìm kiếm khóa học..."
                  className="w-full bg-transparent text-xs outline-none"
                />
              </div>
              <select className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none">
                <option>Tất cả danh mục</option>
              </select>
              <select className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none">
                <option>Tất cả trạng thái</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-212.5 text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="px-2 pb-3 font-medium">Tên khóa học</th>
                    <th className="pb-3 font-medium">Danh mục</th>
                    <th className="pb-3 font-medium">Học viên</th>
                    <th className="pb-3 font-medium">Giá</th>
                    <th className="pb-3 font-medium">Trạng thái</th>
                    <th className="pb-3 font-medium">Ngày tạo</th>
                    <th className="pb-3 text-right font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(
                    ([
                      title,
                      category,
                      students,
                      price,
                      status,
                      date,
                      tone,
                      mark,
                    ]) => (
                      <tr
                        key={title}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition"
                      >
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${tone} text-[9px] font-black text-white`}
                            >
                              {mark}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800">
                                {title}
                              </p>
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600">
                            {category}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{students}</td>
                        <td className="py-3 text-slate-600 font-semibold">{price}</td>
                        <td className="py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              status === "Bản nháp"
                                ? "bg-orange-50 text-orange-600 border border-orange-200"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            ● {status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">{date}</td>
                        <td className="py-3 text-right">
                          <button
                            aria-label={`Tùy chọn ${title}`}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-400">Hiển thị 1-5 trong số 5 khóa học</p>
              <div className="flex gap-1.5">
                <button className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50">
                  <ChevronLeft className="size-3.5" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    className={`size-7 rounded-lg text-xs font-bold transition ${
                      page === 1
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50">
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}