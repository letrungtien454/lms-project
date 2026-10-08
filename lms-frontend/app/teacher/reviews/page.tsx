"use client";

import { useState } from "react";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  Users,
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

const reviewsData = [
  {
    id: 1,
    name: "Nguyễn Thị Lan",
    course: "Java Full Stack",
    rating: 5,
    comment: "Rất hay, giảng viên nhiệt tình.",
    fullComment: "Khóa học rất hay, nội dung dễ hiểu và thực hành tốt.",
    time: "2 giờ trước",
    avatarTone: "from-rose-400 to-pink-600",
  },
  {
    id: 2,
    name: "Trần Minh Hoàng",
    course: "Python Data Science",
    rating: 4,
    comment: "Nội dung dễ hiểu, bài tập nhiều.",
    fullComment: "Nội dung khá chi tiết, có thêm nhiều ví dụ thực tế hơn thì tuyệt vời.",
    time: "5 giờ trước",
    avatarTone: "from-blue-400 to-indigo-600",
  },
  {
    id: 3,
    name: "Lê Thị Mai",
    course: "Web Development",
    rating: 5,
    comment: "Khóa học chất lượng. Nên học.",
    fullComment: "Giảng viên giải thích rất tỉ mỉ, hỗ trợ trả lời thắc mắc nhanh chóng.",
    time: "1 ngày trước",
    avatarTone: "from-amber-400 to-orange-500",
  },
  {
    id: 4,
    name: "Phạm Văn Tuấn",
    course: "Java Full Stack",
    rating: 4,
    comment: "Cần thêm bài tập thực hành.",
    fullComment: "Kiến thức lý thuyết rất đầy đủ, mong thầy bổ sung thêm các project lớn.",
    time: "1 ngày trước",
    avatarTone: "from-emerald-400 to-teal-600",
  },
  {
    id: 5,
    name: "Hoàng Đức Anh",
    course: "Machine Learning",
    rating: 5,
    comment: "Tuyệt vời",
    fullComment: "Một trong những khóa học AI dễ tiếp cận nhất mà mình từng học.",
    time: "2 ngày trước",
    avatarTone: "from-purple-400 to-violet-600",
  },
];

const ratingBreakdown = [
  { stars: 5, percent: 68 },
  { stars: 4, percent: 22 },
  { stars: 3, percent: 7 },
  { stars: 2, percent: 2 },
  { stars: 1, percent: 1 },
];

export default function TeacherReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState("Tất cả khóa học");

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
              const isActive = label === "Đánh giá & Nhận xét"; // Giả sử trang hiện tại là "Đánh giá & Nhận xét"
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
        <main className="p-6 space-y-6 max-w-300">
          
          {/* KHỐI 1: TỔNG QUAN ĐÁNH GIÁ */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-4">
            <h2 className="text-lg font-bold text-[#17305f]">Tổng quan đánh giá</h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                <span className="text-4xl font-extrabold text-[#17305f]">4.7/5</span>
                
                <div className="flex gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-[11px] text-slate-400 font-medium">
                  (124 đánh giá)
                </p>
              </div>

              <div className="md:col-span-8 space-y-2 pr-2">
                {ratingBreakdown.map((item) => (
                  <div key={item.stars} className="flex items-center gap-3 text-[11px]">
                    <span className="w-10 text-slate-500 font-medium shrink-0">
                      {item.stars} sao
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="w-10 text-right font-bold text-slate-600 shrink-0">
                      {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* KHỐI 2: ĐÁNH GIÁ GẦN ĐÂY (BẢNG CÓ PHÂN TRANG) */}
          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.05)] overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <h2 className="font-bold text-[#17305f] text-sm">Danh sách đánh giá</h2>
              
              {/* Bộ lọc khóa học */}
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-8 px-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs outline-none cursor-pointer"
              >
                <option>Tất cả khóa học</option>
                <option>Java Full Stack</option>
                <option>Python Data Science</option>
                <option>Web Development</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-175 text-left text-[11px]">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Học viên</th>
                    <th className="py-3 px-4">Khóa học</th>
                    <th className="py-3 px-4">Đánh giá</th>
                    <th className="py-3 px-4">Nội dung</th>
                    <th className="py-3 px-4 text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reviewsData.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${review.avatarTone} font-bold text-white text-[9px]`}
                          >
                            {review.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                          <span className="font-bold text-slate-900">
                            {review.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">{review.course}</td>

                      <td className="py-3.5 px-4">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${
                                i < review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 max-w-55 truncate">
                        {review.comment}
                      </td>

                      <td className="py-3.5 px-4 text-right text-slate-400">
                        {review.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* THANH PHÂN TRANG (PAGINATION) */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium text-[11px]">
                Hiển thị 1 - 5 trong số 124 đánh giá
              </span>

              <div className="flex items-center gap-1.5">
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
                        ? "bg-blue-600 text-white shadow-xs"
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
          </section>

          {/* KHỐI 3: NHẬN XÉT MỚI NHẤT (CARD) */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_4px_18px_rgba(23,48,95,0.05)] space-y-3">
            <h2 className="font-bold text-[#17305f] text-sm">Nhận xét mới nhất</h2>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/60 border border-slate-100">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-rose-400 to-pink-600 font-bold text-white text-xs shadow-2xs">
                TL
              </span>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">
                    {reviewsData[0].name}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {reviewsData[0].time}
                  </span>
                </div>

                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {reviewsData[0].fullComment}
                </p>

                <p className="text-[10px] font-bold text-blue-600">
                  {reviewsData[0].course} • {reviewsData[0].time}
                </p>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}