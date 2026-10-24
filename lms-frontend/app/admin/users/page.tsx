"use client";

import { useCallback, useEffect, useState, useMemo, useRef, FormEvent } from "react";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  Filter,
  Edit3,
  Lock,
  Unlock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Mail,
  User,
  KeyRound,
  Image as ImageIcon,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type AdminUser = {
  id: number;
  email: string;
  fullName: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string | null;
  avatar?: string | null;
};

type CurrentUser = { id: number };

const roles = ["STUDENT", "TEACHER", "ADMIN"] as const;
const labels: Record<string, string> = {
  STUDENT: "Học viên",
  TEACHER: "Giảng viên",
  ADMIN: "Admin",
};

function getMediaUrl(pathUrl?: string | null): string | null {
  if (!pathUrl || !pathUrl.trim()) return null;
  if (pathUrl.startsWith("http://") || pathUrl.startsWith("https://")) {
    return pathUrl;
  }
  const cleanPath = pathUrl.startsWith("/") ? pathUrl : `/${pathUrl}`;
  return `${API_BASE_URL}${cleanPath}`;
}

function getVietnameseInitial(fullName: string): string {
  if (!fullName || !fullName.trim()) return "U";
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[parts.length - 1];
  return firstName.charAt(0).toUpperCase();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Filter states
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [query, setQuery] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  // States cho Modal Thêm người dùng mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT" as "STUDENT" | "TEACHER" | "ADMIN",
    avatarUrl: "",
  });

  // Active Menu Dropdown State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, current] = await Promise.all([
        apiRequest<AdminUser[]>(
          `/api/admin/users?${new URLSearchParams({
            ...(roleFilter ? { role: roleFilter } : {}),
            ...(query ? { query } : {}),
          })}`
        ),
        apiRequest<CurrentUser>("/api/users/me"),
      ]);
      setUsers(userData || []);
      setCurrentUserId(current.id);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được người dùng.");
    } finally {
      setLoading(false);
    }
  }, [query, roleFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const requestedRole = new URLSearchParams(window.location.search).get("role");
    const matchingRole = roles.find((role) => role === requestedRole);
    if (matchingRole) setRoleFilter(matchingRole);
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

  // Mở Modal Thêm người dùng
  const openCreateModal = () => {
    setUserForm({
      fullName: "",
      email: "",
      password: "",
      role: "STUDENT",
      avatarUrl: "",
    });
    setShowCreateModal(true);
  };

  // Nộp Form tạo người dùng mới
  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!userForm.fullName.trim() || !userForm.email.trim() || !userForm.password.trim()) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: userForm.fullName.trim(),
          email: userForm.email.trim(),
          password: userForm.password,
          role: userForm.role,
          avatarUrl: userForm.avatarUrl.trim() || null,
        }),
      });

      setShowCreateModal(false);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Thêm người dùng mới thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  // Logic Lọc Dữ Liệu
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "" ||
        (statusFilter === "ACTIVE" && u.isActive) ||
        (statusFilter === "LOCKED" && !u.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [users, query, statusFilter]);

  // Thống kê Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const studentCount = users.filter((u) => u.role === "STUDENT").length;
    const teacherCount = users.filter((u) => u.role === "TEACHER").length;
    const adminCount = users.filter((u) => u.role === "ADMIN").length;

    return { total, studentCount, teacherCount, adminCount };
  }, [users]);

  // Logic Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Cập nhật thông tin tài khoản
  async function update(userId: number, changes: { role?: string; isActive?: boolean }) {
    setBusyId(userId);
    setActiveMenuId(null);
    setError("");
    try {
      await apiRequest(`/api/admin/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được tài khoản.");
    } finally {
      setBusyId(null);
    }
  }

  // Xóa tài khoản
  async function removeUser(userId: number, fullName: string) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${fullName}" không?`)) return;
    setBusyId(userId);
    setActiveMenuId(null);
    setError("");
    try {
      await apiRequest(`/api/admin/users/${userId}`, { method: "DELETE" });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không xóa được tài khoản.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* --- 1. HEADER CHÍNH & NÚT THÊM --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
              Quản lý người dùng
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Quản lý tài khoản người dùng và phân quyền trên hệ thống EduFlow.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
          >
            <Plus className="size-4" /> Thêm người dùng
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {error}
          </p>
        )}

        {/* --- 2. THẺ THỐNG KÊ (METRIC CARDS) --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <Users className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Tổng người dùng</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.total}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shrink-0">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Học viên</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.studentCount}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shrink-0">
              <UserCheck className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Giảng viên</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.teacherCount}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Quản trị viên</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{stats.adminCount}</h3>
            </div>
          </div>
        </div>

        {/* --- 3. BẢNG DANH SÁCH & THANH LỌC --- */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-60 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm kiếm theo tên, email..."
                className="w-full rounded-2xl border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="">Tất cả vai trò</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {labels[r]}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="LOCKED">Đang khóa</option>
            </select>

            <button
              type="button"
              onClick={() => void load()}
              className="flex items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              <Filter className="size-3.5" /> Lọc
            </button>
          </div>

          <div className="overflow-x-auto min-h-87.5">
            <table className="w-full min-w-212.5 text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3 w-12 text-center">#</th>
                  <th className="pb-3 pl-2">Họ tên</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Vai trò</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3">Ngày tạo</th>
                  <th className="pb-3 text-right pr-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="size-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>Đang tải danh sách người dùng...</span>
                    </td>
                  </tr>
                ) : paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                      Không tìm thấy người dùng phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1;
                    const initial = getVietnameseInitial(user.fullName);
                    const userAvatar = getMediaUrl(user.avatarUrl || user.avatar);
                    const isSelf = user.id === currentUserId;
                    const isBusy = busyId === user.id;

                    return (
                      <tr key={user.id} className="group hover:bg-slate-50/60 transition">
                        <td className="py-3.5 pl-3 text-center font-bold text-slate-400">
                          {stt}
                        </td>

                        <td className="py-3.5 pl-2 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            {userAvatar ? (
                              <img
                                src={userAvatar}
                                alt={user.fullName}
                                className="size-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                              />
                            ) : (
                              <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shrink-0 shadow-2xs">
                                {initial}
                              </span>
                            )}
                            <span>{user.fullName}</span>
                          </div>
                        </td>

                        <td className="text-slate-500 font-medium">
                          {user.email}
                        </td>

                        <td>
                          {user.role === "STUDENT" && (
                            <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold text-purple-600">
                              Học viên
                            </span>
                          )}
                          {user.role === "TEACHER" && (
                            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600">
                              Giảng viên
                            </span>
                          )}
                          {user.role === "ADMIN" && (
                            <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600">
                              Admin
                            </span>
                          )}
                        </td>

                        <td>
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                              <span className="size-1.5 rounded-full bg-emerald-500"></span>
                              Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-600">
                              <span className="size-1.5 rounded-full bg-rose-500"></span>
                              Đang khóa
                            </span>
                          )}
                        </td>

                        <td className="text-slate-400 font-medium">
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </td>

                        <td className="py-3.5 text-right pr-3 relative">
                          <button
                            type="button"
                            disabled={isBusy || isSelf}
                            onClick={() =>
                              setActiveMenuId(activeMenuId === user.id ? null : user.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer disabled:opacity-40"
                          >
                            {isBusy ? (
                              <Loader2 className="size-4 animate-spin text-blue-600" />
                            ) : (
                              <MoreVertical className="size-4" />
                            )}
                          </button>

                          {activeMenuId === user.id && (
                            <div
                              ref={menuRef}
                              className="absolute right-3 top-10 z-50 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/50 animate-in fade-in duration-150 text-left"
                            >
                              {user.role === "STUDENT" && (
                                <button
                                  type="button"
                                  onClick={() => void update(user.id, { role: "TEACHER" })}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                                >
                                  <ArrowUpRight className="size-3.5" />
                                  Nâng thành Giảng viên
                                </button>
                              )}

                              {user.role === "TEACHER" && (
                                <button
                                  type="button"
                                  onClick={() => void update(user.id, { role: "STUDENT" })}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                                >
                                  <ArrowDownLeft className="size-3.5" />
                                  Chuyển thành Học viên
                                </button>
                              )}

                              <button
                                type="button"
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                              >
                                <Edit3 className="size-3.5 text-slate-500" />
                                Chỉnh sửa tài khoản
                              </button>

                              {user.isActive ? (
                                <button
                                  type="button"
                                  onClick={() => void update(user.id, { isActive: false })}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                >
                                  <Lock className="size-3.5" />
                                  Khóa tài khoản
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void update(user.id, { isActive: true })}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                >
                                  <Unlock className="size-3.5" />
                                  Mở khóa tài khoản
                                </button>
                              )}

                              <div className="my-1 border-t border-slate-100"></div>

                              <button
                                type="button"
                                onClick={() => void removeUser(user.id, user.fullName)}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                                Xóa tài khoản
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

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold text-slate-400">
              Hiển thị {paginatedUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, filteredUsers.length)} trong{" "}
              {filteredUsers.length} người dùng
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => handlePageChange(pageNum)}
                  className={`flex size-7 items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* --- 4. MODAL THÊM NGƯỜI DÙNG MỚI --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#17305f]">
                  Thêm người dùng mới
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tạo tài khoản người dùng mới trên hệ thống
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <User className="size-3.5 text-blue-600" />
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn Nam"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-blue-600" />
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="nam.nguyen@example.com"
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-blue-600" />
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vai trò hệ thống <span className="text-rose-500">*</span>
                </label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      role: e.target.value as "STUDENT" | "TEACHER" | "ADMIN",
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="STUDENT">Học viên</option>
                  <option value="TEACHER">Giảng viên</option>
                
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-slate-400" />
                  Ảnh đại diện (URL tùy chọn)
                </label>
                <input
                  type="url"
                  value={userForm.avatarUrl}
                  onChange={(e) => setUserForm({ ...userForm, avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  <span>{submitting ? "Đang tạo..." : "Thêm người dùng"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}