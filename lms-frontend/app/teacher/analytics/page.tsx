"use client";

import { useEffect, useState, useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  UserCheck,
  Calendar,
  BookOpen,
  Loader2,
  BarChart3,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type Analytics = {
  totalEnrollments: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  registrationTrend: { date: string; count: number }[];
};

export default function TeacherAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest<Analytics>("/api/teacher/analytics")
      .then((res) => {
        setData(res);
        setError("");
      })
      .catch((cause: unknown) => {
        setError(
          cause instanceof Error
            ? cause.message
            : "Không tải được báo cáo phân tích kinh doanh."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Format tiền tệ VND
  const formatMoney = (value: number) => {
    if (!value) return "0đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Peak điểm cao nhất để tính phần trăm chiều cao cột chính xác giống Dashboard
  const peak = useMemo(() => {
    if (!data?.registrationTrend || data.registrationTrend.length === 0) return 1;
    return Math.max(1, ...data.registrationTrend.map((point) => point.count));
  }, [data]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fc] p-8 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold">Đang tải dữ liệu tổng quan...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* --- 1. BANNER CHÀO MỪNG DẠNG CARD BANNER --- */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-blue-500/15">
          <div className="absolute -right-10 -top-10 size-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute right-40 bottom-0 size-40 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-blue-100">
                <Calendar className="size-3.5" />
                <span>
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "full" }).format(new Date())}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Báo cáo Phân tích Kinh doanh <Sparkles className="inline-block size-6 text-amber-300" />
              </h1>
              <p className="max-w-xl text-xs text-blue-100/90 leading-relaxed">
                Cùng theo dõi chi tiết hiệu suất kinh doanh, tổng hợp doanh thu và xu hướng đăng ký khóa học theo thời gian thực.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
            {error}
          </p>
        )}

        {/* --- 2. HÀNG 4 Ô THỐNG KÊ (METRIC CARDS) CHUẨN DASHBOARD --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-13 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <BookOpen className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Tổng ghi danh</p>
              <h3 className="text-2xl font-black text-[#17305f] mt-0.5">
                {data?.totalEnrollments?.toLocaleString("vi-VN") || 0}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <TrendingUp className="size-3" /> lượt đăng ký
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-13 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shrink-0">
              <UserCheck className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Học viên duy nhất</p>
              <h3 className="text-2xl font-black text-[#17305f] mt-0.5">
                {data?.totalStudents?.toLocaleString("vi-VN") || 0}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-purple-600">
                tài khoản ghi danh
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-13 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shrink-0">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Doanh thu tháng này</p>
              <h3 className="text-xl font-black text-[#17305f] mt-0.5">
                {formatMoney(data?.monthlyRevenue || 0)}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-500">
                tháng hiện tại
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-13 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <WalletCards className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Doanh thu tích lũy</p>
              <h3 className="text-xl font-black text-[#17305f] mt-0.5">
                {formatMoney(data?.totalRevenue || 0)}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                <TrendingUp className="size-3" /> toàn thời gian
              </p>
            </div>
          </div>

        </div>

        {/* --- 3. ĐỒ THỊ ĐĂNG KÝ HỌC VIÊN 100% GIỐNG KHUNG DASHBOARD --- */}
        <article className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#17305f]">Đăng ký học viên</h2>
              <p className="text-xs text-slate-400 mt-0.5">Số lượt ghi danh khóa học theo mốc thời gian</p>
            </div>
          </div>

          {!data?.registrationTrend || data.registrationTrend.length === 0 ? (
            <p className="py-12 text-center text-xs text-slate-400">Chưa có dữ liệu đăng ký.</p>
          ) : (
            <div className="mt-4 flex h-52 items-end gap-3 pt-6 pb-2 px-2 overflow-x-auto">
              {data.registrationTrend.map((point) => {
                const heightPercent = Math.max(8, (point.count / peak) * 80);
                return (
                  <div
                    key={point.date}
                    className="group flex flex-1 flex-col items-center gap-2 h-full justify-end min-w-8"
                    title={`${point.count} học viên`}
                  >
                    <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                      {point.count}
                    </span>
                    <div
                      className="w-full rounded-t-xl bg-linear-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-semibold text-slate-400">
                      {new Date(`${point.date}T00:00:00`).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </article>

      </div>
    </main>
  );
}