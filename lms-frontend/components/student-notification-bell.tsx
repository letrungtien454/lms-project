"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";

export function StudentNotificationBell({ className }: { className?: string }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadUnreadCount = () => {
      if (!getAccessToken()) {
        setUnreadCount(0);
        return;
      }
      apiRequest<number>("/api/notifications/unread-count")
        .then(setUnreadCount)
        .catch((cause: unknown) => console.error("Không tải được số thông báo chưa đọc:", cause));
    };
    loadUnreadCount();
    window.addEventListener("notifications-updated", loadUnreadCount);
    return () => window.removeEventListener("notifications-updated", loadUnreadCount);
  }, []);

  return <button
    type="button"
    onClick={() => router.push(
      getAccessToken()
        ? "/student/notifications"
        : `/auth?returnUrl=${encodeURIComponent("/student/notifications")}`,
    )}
    className={`relative rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 ${className ?? ""}`}
    aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ""}`}
  >
    <Bell className="size-4" />
    {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
  </button>;
}
