"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CreditCard,
  Flame,
  GraduationCap,
  Play,
  Settings,
  Target,
  UserRound,
} from "lucide-react";

export function StudentSidebar({
  collapsed,
  activeTab,
  setActiveTab,
  isLearning = false,
}: {
  collapsed: boolean;
  activeTab?: string | null;
  setActiveTab?: (tab: string) => void;
  isLearning?: boolean;
}) {
  const router = useRouter();
  const targetMinutes = 30;
  const [streak, setStreak] = useState({
    date: "",
    todayMinutes: 0,
    currentStreak: 0,
    bestStreak: 0,
    completedDate: "",
    recordDate: "",
  });
  const [isStreakLoaded, setIsStreakLoaded] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const isCompletedToday = streak.todayMinutes >= targetMinutes;
  const hasActiveStreak = streak.currentStreak > 0;
  const remainingMinutes = Math.max(0, targetMinutes - streak.todayMinutes);
  const storageKey = "eduflow:student-streak";
  const recordLabel =
    streak.bestStreak === 0
      ? "🏆 Chưa có kỷ lục. Hãy bắt đầu tích chuỗi!"
      : isCompletedToday && streak.recordDate === streak.date
        ? `🎉 Kỷ lục mới: ${streak.bestStreak} ngày!`
        : isCompletedToday
          ? `🏆 Kỷ lục cao nhất: ${streak.bestStreak} ngày`
          : hasActiveStreak
            ? `🏆 Kỷ lục: ${streak.bestStreak} ngày · Cố lên, bạn sắp vượt mốc!`
            : `🏆 Kỷ lục trước đây: ${streak.bestStreak} ngày · Quay lại chinh phục nhé!`;

  const streakTooltip = isCompletedToday
    ? `🔥 ${streak.currentStreak} ngày liên tiếp! Đã hoàn thành hôm nay 🎉`
    : hasActiveStreak
      ? `Giữ chuỗi ${streak.currentStreak} ngày! Còn ${remainingMinutes} phút`
      : `Bắt đầu tích chuỗi (${streak.todayMinutes}/${targetMinutes} phút)`;

  const getLocalDate = (date = new Date()) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return getLocalDate(yesterday);
  };

  const persistStreak = (nextStreak: typeof streak) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextStreak));
    } catch (error) {
      console.error("Không thể lưu chuỗi học tập trên thiết bị này.", error);
    }
  };

  useEffect(() => {
    const today = getLocalDate();
    let restored = {
      date: today,
      todayMinutes: 0,
      currentStreak: 0,
      bestStreak: 0,
      completedDate: "",
      recordDate: "",
    };

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<typeof restored>;
        const completedDate =
          typeof parsed.completedDate === "string" ? parsed.completedDate : "";
        const currentStreak =
          completedDate === today || completedDate === getYesterday()
            ? Number(parsed.currentStreak) || 0
            : 0;
        restored = {
          date: today,
          todayMinutes:
            parsed.date === today
              ? Math.max(0, Number(parsed.todayMinutes) || 0)
              : 0,
          currentStreak,
          bestStreak: Math.max(0, Number(parsed.bestStreak) || 0),
          completedDate,
          recordDate:
            typeof parsed.recordDate === "string" ? parsed.recordDate : "",
        };
      }
    } catch (error) {
      console.error("Không thể đọc chuỗi học tập đã lưu.", error);
    }

    setStreak(restored);
    persistStreak(restored);
    setIsStreakLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLearning || !isStreakLoaded) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      const today = getLocalDate();
      const yesterday = getYesterday();

      setStreak((previous) => {
        const base =
          previous.date === today
            ? previous
            : {
                ...previous,
                date: today,
                todayMinutes: 0,
                currentStreak:
                  previous.completedDate === yesterday
                    ? previous.currentStreak
                    : 0,
              };
        const todayMinutes = Math.min(targetMinutes, base.todayMinutes + 1);
        let currentStreak = base.currentStreak;
        let bestStreak = base.bestStreak;
        let completedDate = base.completedDate;
        let recordDate = base.recordDate;

        if (todayMinutes >= targetMinutes && completedDate !== today) {
          currentStreak =
            completedDate === yesterday ? currentStreak + 1 : 1;
          completedDate = today;
          if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
            recordDate = today;
          }
        }

        const nextStreak = {
          ...base,
          todayMinutes,
          currentStreak,
          bestStreak,
          completedDate,
          recordDate,
        };
        persistStreak(nextStreak);
        return nextStreak;
      });
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [isLearning, isStreakLoaded]);

  const items = [
    ["Trang cá nhân", UserRound, "/student/dashboard"],
    ["Khóa học của tôi", GraduationCap, "/student/mycourses"],
    ["Tiến độ & Lộ trình", Target, "/student/progress"],
    ["Thông báo", Bell, "/student/notifications"],
    ["Lịch sử thanh toán", CreditCard, "/student/billing"],
    ["Cài đặt tài khoản", Settings, "/student/settings"],
  ] as const;

  return (
    <aside
      className={`fixed left-0 top-17.5 z-40 h-[calc(100vh-70px)] shrink-0 flex-col justify-between border-r border-slate-200 bg-white/95 px-3 py-5 shadow-sm backdrop-blur-xl overflow-visible transition-[width] duration-200 ease-in-out ${
        collapsed ? "hidden md:flex md:w-19" : "flex w-64"
      }`}
      aria-label="Student workspace navigation"
    >
      <div>
        <p
          className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 ${
            collapsed ? "sr-only" : ""
          }`}
        >
          HỌC TẬP
        </p>
        <nav className="flex flex-col gap-1.5">
          {items.map(([label, Icon, path]) => {
            const isActive = activeTab === label;
            return (
              <div
                key={label}
                className="relative group"
                onMouseEnter={() => setActiveTooltip(label)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                <button
                  type="button"
                  title={collapsed ? label : undefined}
                  onClick={() => {
                    setActiveTab?.(label);
                    router.push(path);
                  }}
                  onTouchStart={() =>
                    setActiveTooltip(activeTooltip === label ? null : label)
                  }
                  aria-label={label}
                  className={`flex w-full items-center rounded-xl py-3 text-sm font-semibold transition shrink-0 cursor-pointer ${
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                  } ${
                    isActive
                      ? collapsed
                        ? "text-blue-700"
                        : "border-l-4 border-blue-600 bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      isActive
                        ? collapsed
                          ? "bg-blue-100 text-blue-600"
                          : "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                  </span>
                  <span className={collapsed ? "sr-only" : "truncate"}>
                    {label}
                  </span>
                </button>

                {/* TOOLTIP NỔI BÊN CẠNH KHI THU GỌN (CHẠM VÀO HOẶC RÊ CHUỘT SẼ HIỆN TÊN) */}
                {collapsed && (
                  <div
                    className={`pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xl transition-all duration-200 z-50 ${
                      activeTooltip === label
                        ? "visible opacity-100 translate-x-0"
                        : "invisible opacity-0 -translate-x-1"
                    }`}
                  >
                    {label}
                    {/* Mũi tên nhỏ trỏ vào icon */}
                    <div className="absolute top-1/2 -left-1 -mt-1 size-2 rotate-45 bg-slate-900" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* KHỐI CHUỖI HỌC (STREAK) - XỬ LÝ CHUẨN MÀU XÁM KHI CHƯA GIỮ CHUỖI */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        {collapsed ? (
          /* TRẠNG THÁI THU GỌN: ICON NGỌN LỬA + TOOLTIP */
          <div
            className="relative group flex justify-center"
            onMouseEnter={() => setActiveTooltip("streak")}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <button
              type="button"
              onClick={() => router.push("/student/mycourses")}
              onTouchStart={() =>
                setActiveTooltip(activeTooltip === "streak" ? null : "streak")
              }
              aria-label={streakTooltip}
              title={streakTooltip}
              className={`flex size-10 items-center justify-center rounded-xl transition shadow-xs cursor-pointer ${
                isCompletedToday
                  ? "bg-linear-to-br from-orange-500 to-amber-500 text-white shadow-orange-500/30 animate-bounce"
                  : hasActiveStreak
                    ? "bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/30"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Flame
                className={`size-5 ${
                  isCompletedToday || hasActiveStreak
                    ? "fill-current"
                    : "text-slate-400"
                }`}
              />
            </button>

            {/* Tooltip hiển thị khi chạm/rê vào ngọn lửa thu gọn */}
            <div
              className={`pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-xl transition-all duration-200 z-50 ${
                activeTooltip === "streak"
                  ? "visible opacity-100 translate-x-0"
                  : "invisible opacity-0 -translate-x-1"
              }`}
            >
              <span
                className={
                  isCompletedToday
                    ? "text-amber-400"
                    : hasActiveStreak
                      ? "text-emerald-300"
                      : "text-slate-300"
                }
              >
                {streakTooltip}
              </span>
              <div className="absolute top-1/2 -left-1 -mt-1 size-2 rotate-45 bg-slate-900" />
            </div>
          </div>
        ) : isCompletedToday ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => router.push("/student/mycourses")}
              className="flex w-full items-center gap-2 rounded-2xl border border-orange-200 bg-linear-to-r from-orange-50 to-amber-50 p-3 text-left shadow-xs transition hover:shadow-sm"
              title={streakTooltip}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30">
                <Flame className="size-5 animate-bounce fill-current" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-extrabold text-orange-800">
                  🔥 Đã giữ chuỗi {streak.currentStreak} ngày!
                </span>
                <span className="block truncate text-[10px] font-semibold text-orange-700">
                  Đã hoàn thành mục tiêu hôm nay 🎉
                </span>
              </span>
            </button>
            <p className="px-1 text-center text-[10px] font-semibold text-slate-500">
              {recordLabel}
            </p>
          </div>
        ) : (
          /* TRẠNG THÁI MỞ RỘNG: HIỂN THỊ ĐẦY ĐỦ */
          <div
            className={`rounded-2xl p-3.5 border space-y-3 transition-all duration-300 ${
              hasActiveStreak
                ? "bg-linear-to-br from-emerald-50 via-blue-50/60 to-white border-emerald-200 shadow-xs"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl transition ${
                  hasActiveStreak
                    ? "bg-linear-to-br from-emerald-500 to-blue-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                <Flame
                  className={`size-5 ${
                    hasActiveStreak ? "fill-current" : "text-slate-400"
                  }`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-800 truncate">
                  {hasActiveStreak
                    ? `Đang giữ chuỗi ${streak.currentStreak} ngày 🔥`
                    : "Bắt đầu chuỗi học tập"}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 truncate">
                  {hasActiveStreak
                    ? `Còn ${remainingMinutes} phút để giữ chuỗi hôm nay`
                    : "Học 30 phút để bắt đầu tích chuỗi"}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                <span>Hôm nay</span>
                <span
                  className={hasActiveStreak ? "text-emerald-600" : "text-slate-500"}
                >
                  {streak.todayMinutes}/{targetMinutes} phút
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    hasActiveStreak
                      ? "bg-linear-to-r from-emerald-500 to-blue-500"
                      : "bg-slate-400"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (streak.todayMinutes / targetMinutes) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/student/mycourses")}
              className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition cursor-pointer active:scale-98 ${
                hasActiveStreak
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs shadow-emerald-600/20"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
            >
              <Play className="size-3.5 fill-current" />
              <span>
                {hasActiveStreak ? "Tiếp tục giữ chuỗi" : "Bắt đầu tích chuỗi"}
              </span>
            </button>
            <p className="text-center text-[10px] font-semibold text-slate-500">
              {recordLabel}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}