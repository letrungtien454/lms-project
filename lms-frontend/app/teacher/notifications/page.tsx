"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Notification = { id: number; title: string; message: string; isRead: boolean; createdAt: string };

export default function TeacherNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  async function load() {
    try { setNotifications(await apiRequest<Notification[]>("/api/teacher/notifications")); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được thông báo."); }
  }
  useEffect(() => { void load(); }, []);

  async function markRead(item: Notification) {
    try {
      await apiRequest(`/api/teacher/notifications/${item.id}/read`, { method: "PATCH" });
      setNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, isRead: true } : notification));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không cập nhật được thông báo."); }
  }

  return <main className="min-h-screen bg-[#f6f9fd] p-4 text-slate-800 sm:p-8"><div className="mx-auto max-w-4xl">
    <p className="text-sm text-slate-500">Giảng viên / Thông báo</p><h1 className="mt-1 text-2xl font-bold text-[#17305f]">Thông báo</h1>
    {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <section className="mt-6 divide-y rounded-2xl border bg-white shadow-sm">{notifications.map((item) => <article key={item.id} className={`flex items-start justify-between gap-4 p-5 ${item.isRead ? "" : "bg-blue-50/50"}`}>
      <div><h2 className="font-semibold">{item.title}</h2><p className="mt-2 text-sm text-slate-600">{item.message}</p><p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</p></div>
      {!item.isRead && <button onClick={() => void markRead(item)} className="shrink-0 rounded-lg border px-3 py-2 text-xs">Đánh dấu đã đọc</button>}
    </article>)}{notifications.length === 0 && <p className="p-8 text-center text-slate-500">Chưa có thông báo.</p>}</section>
  </div></main>;
}
