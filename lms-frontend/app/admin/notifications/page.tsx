"use client";

import { FormEvent, useState, useEffect, useMemo, useRef } from "react";
import {
  Bell,
  Plus,
  Search,
  Users,
  Send,
  MoreVertical,
  Trash2,
  Edit3,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Megaphone,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  userId?: number | null;
  targetRole?: string | null;
  senderName?: string | null;
  createdAt: string;
  isRead?: boolean;
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  
  // Filter & Search states
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modal Form States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<NotificationItem | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"ALL" | "STUDENTS" | "TEACHERS" | "SPECIFIC">("ALL");
  const [userIds, setUserIds] = useState("");
  const [busy, setBusy] = useState(false);

  // Active Menu Dropdown State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load danh sách thông báo từ Backend
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await apiRequest<NotificationItem[]>("/api/admin/notifications");
      setNotifications(data || []);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được danh sách thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
  }, []);

  useEffect(() => {
    let active = true;
    const markUnreadNotifications = async () => {
      try {
        const inbox = await apiRequest<NotificationItem[]>("/api/notifications");
        const unreadNotifications = inbox.filter((notification) => !notification.isRead);
        if (unreadNotifications.length === 0) return;

        await Promise.all(unreadNotifications.map((notification) =>
          apiRequest(`/api/notifications/${notification.id}/read`, { method: "PATCH" })));
        if (active) window.dispatchEvent(new Event("notifications-updated"));
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái thông báo.");
        }
      }
    };
    void markUnreadNotifications();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mở Modal Tạo mới
  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setMessage("");
    setTargetType("ALL");
    setUserIds("");
    setShowModal(true);
  };

  // Mở Modal Chỉnh sửa
  const openEditModal = (item: NotificationItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setMessage(item.message);
    setTargetType("ALL");
    setShowModal(true);
    setActiveMenuId(null);
  };

  // Xử lý gửi / cập nhật thông báo
  async function handleSaveNotification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (!title.trim() || !message.trim()) {
        setError("Vui lòng nhập tiêu đề và nội dung thông báo.");
        return;
      }
      if (editingItem) {
        // Cập nhật thông báo (PUT)
        await apiRequest(`/api/admin/notifications/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify({ title, message }),
        });
        setNotice("Đã cập nhật thông báo thành công.");
      } else {
        // Gửi thông báo mới (POST)
        const ids =
          targetType === "SPECIFIC" && userIds.trim()
            ? userIds.split(",").map((v) => Number(v.trim()))
            : null;
        if (targetType === "SPECIFIC" && (!ids || ids.some((id) => !Number.isInteger(id) || id <= 0))) {
          setError("Vui lòng nhập ID người nhận hợp lệ, phân tách bằng dấu phẩy.");
          return;
        }

        const sentCount = await apiRequest<number>("/api/admin/notifications", {
          method: "POST",
          body: JSON.stringify({ title, message, userIds: ids, targetType }),
        });
        setNotice(`Đã gửi thông báo đến ${sentCount} người dùng.`);
      }

      setShowModal(false);
      await loadNotifications();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Thao tác không thành công.");
    } finally {
      setBusy(false);
    }
  }

  // Xóa thông báo
  async function handleDelete(id: number) {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thông báo này không?")) return;
    setActiveMenuId(null);
    try {
      await apiRequest(`/api/admin/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setNotice("Đã xóa thông báo.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không xóa được thông báo.");
    }
  }

  // Filter & Pagination Logic
  const filteredList = useMemo(() => {
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.message.toLowerCase().includes(query.toLowerCase())
    );
  }, [notifications, query]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* --- 1. HEADER CHÍNH & NÚT GỬI THÔNG BÁO --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
              Quản lý thông báo
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Danh sách các thông báo hệ thống và công cụ phát hành tin tức đến người dùng.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
          >
            <Plus className="size-4" /> Gửi thông báo mới
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </p>
        )}

        {/* --- 2. METRIC CARDS --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <Bell className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Tổng thông báo</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{notifications.length}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shrink-0">
              <Megaphone className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Thông báo toàn sàn</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">
                {notifications.filter((n) => !n.userId).length}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Thông báo cá nhân</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">
                {notifications.filter((n) => n.userId).length}
              </h3>
            </div>
          </div>
        </div>

        {/* --- 3. BẢNG DANH SÁCH THÔNG BÁO --- */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tìm kiếm tiêu đề, nội dung thông báo..."
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3 w-12 text-center">STT</th>
                  <th className="pb-3 pl-2">Tiêu đề thông báo</th>
                  <th className="pb-3">Nội dung tóm tắt</th>
                  <th className="pb-3">Đối tượng</th>
                  <th className="pb-3">Thời gian</th>
                  <th className="pb-3 text-right pr-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Loader2 className="size-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>Đang tải thông báo...</span>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                      Chưa có thông báo nào.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1;

                    return (
                      <tr key={item.id} className="group hover:bg-slate-50/60 transition">
                        <td className="py-3.5 pl-3 text-center font-bold text-slate-400">
                          {stt}
                        </td>

                        <td className="py-3.5 pl-2 font-bold text-slate-800">
                          {item.title}
                          <p className="mt-1 text-[10px] font-normal text-slate-400">Người gửi: {item.senderName || "Quản trị viên"}</p>
                        </td>

                        <td className="text-slate-500 font-medium max-w-xs truncate">
                          {item.message}
                        </td>

                        <td>
                          <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
                            {{ ALL: "Tất cả người dùng", STUDENTS: "Học viên", TEACHERS: "Giảng viên", SPECIFIC: "Người nhận chỉ định" }[item.targetRole ?? ""] || (item.userId ? `Người dùng #${item.userId}` : "Tất cả")}
                          </span>
                        </td>

                        <td className="text-slate-400 font-medium">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </td>

                        <td className="py-3.5 text-right pr-3 relative">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === item.id ? null : item.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          >
                            <MoreVertical className="size-4" />
                          </button>

                          {activeMenuId === item.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-3 top-10 z-50 w-40 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/50 animate-in fade-in duration-150 text-left"
                            >
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                              >
                                <Edit3 className="size-3.5 text-slate-500" />
                                Chỉnh sửa
                              </button>

                              <div className="my-1 border-t border-slate-100"></div>

                              <button
                                type="button"
                                onClick={() => void handleDelete(item.id)}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                                Xóa thông báo
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold text-slate-400">
              Hiển thị {paginatedList.length} trên tổng số {filteredList.length} thông báo
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>

              <span className="text-xs font-bold text-slate-600 px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ================= MODAL FORM GỬI / SỬA THÔNG BÁO ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#17305f]">
                {editingItem ? "Chỉnh sửa thông báo" : "Gửi thông báo mới"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNotification} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tiêu đề thông báo <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  maxLength={255}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Lịch bảo trì hệ thống định kỳ..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              {!editingItem && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đối tượng nhận thông báo
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ALL">Tất cả người dùng (Toàn sàn)</option>
                    <option value="STUDENTS">Chỉ Học viên (STUDENT)</option>
                    <option value="TEACHERS">Chỉ Giảng viên (TEACHER)</option>
                    <option value="SPECIFIC">Theo User ID cụ thể</option>
                  </select>
                </div>
              )}

              {!editingItem && targetType === "SPECIFIC" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Danh sách User ID (Phân tách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={userIds}
                    onChange={(e) => setUserIds(e.target.value)}
                    placeholder="Ví dụ: 12, 18, 25..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung thông báo <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập nội dung chi tiết của thông báo..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer disabled:opacity-60"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-3.5" />}
                  <span>{busy ? "Đang xử lý..." : editingItem ? "Lưu thay đổi" : "Gửi ngay"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}