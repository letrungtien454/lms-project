"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  BookOpen,
  UserPlus,
  DollarSign,
  Calendar,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function getCourseImageUrl(pathUrl?: string | null): string {
  if (!pathUrl?.trim()) return "/placeholder.jpg";
  if (/^https?:\/\//i.test(pathUrl)) return pathUrl;
  return new URL(pathUrl.startsWith("/") ? pathUrl : `/${pathUrl}`, API_BASE_URL).toString();
}

type TopCourse = {
  id: number;
  title: string;
  categoryName?: string | null;
  studentCount: number;
  revenue: number;
  thumbnailUrl?: string | null;
};

type AnalyticsData = {
  totalUsers: number;
  totalTeachers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  topCourses?: TopCourse[];
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Filter state: Mặc định ban đầu là "0" (Tất cả)
  const [timeRange, setTimeRange] = useState<"0" | "7" | "30">("0");

  useEffect(() => {
    setLoading(true);
    setError("");

    // Gọi API thật từ Backend
    apiRequest<AnalyticsData>(`/api/admin/analytics?days=${timeRange}`)
      .then((res) => {
        setData(res);
      })
      .catch((cause: unknown) => {
        setError(
          cause instanceof Error ? cause.message : "Không tải được báo cáo thống kê từ máy chủ."
        );
      })
      .finally(() => setLoading(false));
  }, [timeRange]);

  // Format tiền tệ VND
  const formatVND = (amount?: number) => {
    if (!amount) return "0đ";
    if (amount >= 1_000_000) {
      return (amount / 1_000_000).toFixed(1) + "Mđ";
    }
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  };

  // Tính toán Cơ cấu Người dùng THẬT (Chỉ Học viên & Giảng viên)
  const userRatio = useMemo(() => {
    if (!data) return { studentPercent: 0, teacherPercent: 0, studentCount: 0, teacherCount: 0 };
    
    const teacherCount = data.totalTeachers || 0;
    const studentCount = Math.max(0, (data.totalUsers || 0) - teacherCount);
    const totalTargetUsers = studentCount + teacherCount;

    if (totalTargetUsers === 0) {
      return { studentPercent: 0, teacherPercent: 0, studentCount: 0, teacherCount: 0 };
    }

    const studentPercent = Math.round((studentCount / totalTargetUsers) * 100);
    const teacherPercent = 100 - studentPercent;

    return { studentPercent, teacherPercent, studentCount, teacherCount };
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fc] p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Đang tải dữ liệu báo cáo từ Backend...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* --- 1. HEADER CHÍNH & BỘ LỌC THỜI GIAN (MẶC ĐỊNH TẤT CẢ) --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
              Báo cáo & Thống kê
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Tổng quan hoạt động của hệ thống theo dữ liệu thực tế.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-2xs">
              <Calendar className="size-4 text-blue-600" />
              <span>Dữ liệu toàn sàn</span>
            </div>

            <div className="flex items-center rounded-2xl bg-white p-1 border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setTimeRange("0")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  timeRange === "0"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("7")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  timeRange === "7"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                7 ngày
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("30")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  timeRange === "30"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                30 ngày
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {error}
          </p>
        )}

        {/* --- 2. THẺ THỐNG KÊ (METRIC CARDS REAL DATA) --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <Users className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Tổng người dùng</p>
              <h3 className="text-lg font-extrabold text-[#17305f] mt-0.5">
                {data?.totalUsers?.toLocaleString("vi-VN") ?? 0}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Tổng giảng viên</p>
              <h3 className="text-lg font-extrabold text-[#17305f] mt-0.5">
                {data?.totalTeachers?.toLocaleString("vi-VN") ?? 0}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shrink-0">
              <BookOpen className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Tổng khóa học</p>
              <h3 className="text-lg font-extrabold text-[#17305f] mt-0.5">
                {data?.totalCourses?.toLocaleString("vi-VN") ?? 0}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
              <UserPlus className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Tổng lượt đăng ký</p>
              <h3 className="text-lg font-extrabold text-[#17305f] mt-0.5">
                {data?.totalEnrollments?.toLocaleString("vi-VN") ?? 0}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <DollarSign className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Tổng doanh thu</p>
              <h3 className="text-lg font-extrabold text-[#17305f] mt-0.5">
                {formatVND(data?.totalRevenue)}
              </h3>
            </div>
          </div>
        </div>

        {/* --- 3. CƠ CẤU NGƯỜI DÙNG CHỈ GỒM HỌC VIÊN VÀ GIẢNG VIÊN --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 lg:col-span-5 flex flex-col justify-between space-y-4">
            <h2 className="text-sm font-bold text-[#17305f]">Cơ cấu người dùng</h2>

            <div className="relative flex items-center justify-center py-2">
              <div className="size-36 rounded-full border-[14px] border-blue-600 border-t-purple-500 flex items-center justify-center shadow-2xs">
                <div className="text-center">
                  <p className="text-base font-extrabold text-[#17305f]">
                    {(userRatio.studentCount + userRatio.teacherCount).toLocaleString("vi-VN")}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400">Người dùng</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="size-2.5 rounded-full bg-blue-600"></span> Học viên
                </span>
                <span className="text-slate-800 font-extrabold">
                  {userRatio.studentPercent}%{" "}
                  <span className="text-slate-400 font-normal">
                    ({userRatio.studentCount.toLocaleString("vi-VN")})
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="size-2.5 rounded-full bg-purple-500"></span> Giảng viên
                </span>
                <span className="text-slate-800 font-extrabold">
                  {userRatio.teacherPercent}%{" "}
                  <span className="text-slate-400 font-normal">
                    ({userRatio.teacherCount.toLocaleString("vi-VN")})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* --- 4. BẢNG TOP KHÓA HỌC MAP ĐÚNG DỮ LIỆU THẬT --- */}
          <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#17305f]">Khóa học có lượt đăng ký cao nhất</h2>
            </div>

            <div className="overflow-x-auto min-h-[220px]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-2.5 pl-2 w-8">#</th>
                    <th className="pb-2.5">Tên khóa học</th>
                    <th className="pb-2.5">Danh mục</th>
                    <th className="pb-2.5 text-center">Lượt đăng ký</th>
                    <th className="pb-2.5 text-right pr-2">Doanh thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {!data?.topCourses || data.topCourses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                        Chưa có dữ liệu đăng ký khóa học nào.
                      </td>
                    </tr>
                  ) : (
                    data.topCourses.map((course, idx) => (
                      <tr key={course.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 pl-2 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 font-bold text-slate-800">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={getCourseImageUrl(course.thumbnailUrl)}
                              alt={course.title}
                              className="size-7 rounded-lg object-cover ring-1 ring-slate-200/80 shrink-0"
                            />
                            <span className="truncate max-w-[180px]">{course.title}</span>
                          </div>
                        </td>
                        <td>
                          <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {course.categoryName || "Chưa phân loại"}
                          </span>
                        </td>
                        <td className="text-center font-bold text-slate-700">
                          {(course.studentCount ?? 0).toLocaleString("vi-VN")}
                        </td>
                        <td className="text-right font-extrabold text-slate-800 pr-2">
                          {formatVND(course.revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}