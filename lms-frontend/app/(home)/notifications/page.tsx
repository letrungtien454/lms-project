"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Notification = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  senderName: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await apiRequest<Notification[]>("/api/notifications");
      setNotifications(items);
      const unreadNotifications = items.filter((item) => !item.isRead);
      if (unreadNotifications.length > 0) {
        await Promise.all(unreadNotifications.map((item) =>
          apiRequest(`/api/notifications/${item.id}/read`, { method: "PATCH" })));
        setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
        window.dispatchEvent(new Event("notifications-updated"));
      }
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được thông báo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function markRead(notification: Notification) {
    try {
      await apiRequest(`/api/notifications/${notification.id}/read`, { method: "PATCH" });
      setNotifications((items) => items.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item));
      window.dispatchEvent(new Event("notifications-updated"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được trạng thái thông báo.");
    }
  }

  return <main className="min-h-screen bg-[#f6f9fd] p-4 text-slate-800 sm:p-8">
    <div className="mx-auto max-w-4xl">
      <p className="text-sm text-slate-500">Hộp thư / Thông báo</p>
      <h1 className="mt-1 text-2xl font-bold text-[#17305f]">Thông báo</h1>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <section className="mt-6 divide-y rounded-2xl border bg-white shadow-sm">
        {loading ? <p className="p-8 text-center text-slate-500">Đang tải thông báo...</p> :
          notifications.map((item) => <article key={item.id} className={`flex items-start justify-between gap-4 p-5 ${item.isRead ? "" : "bg-blue-50/50"}`}>
            <div><h2 className="font-semibold">{item.title}</h2><p className="mt-2 text-sm text-slate-600">{item.message}</p><p className="mt-2 text-xs text-slate-400">Từ: {item.senderName} · {new Date(item.createdAt).toLocaleString("vi-VN")}</p></div>
            {!item.isRead && <button onClick={() => void markRead(item)} className="shrink-0 rounded-lg border px-3 py-2 text-xs">Đánh dấu đã đọc</button>}
          </article>)}
        {!loading && notifications.length === 0 && <p className="p-8 text-center text-slate-500">Chưa có thông báo.</p>}
      </section>
    </div>
  </main>;
}
