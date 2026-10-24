"use client";

import { FormEvent, useEffect, useState, ChangeEvent, useRef } from "react";
import {
  User,
  KeyRound,
  Bell,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Lock,
  Mail,
  Camera,
  Upload,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type Profile = {
  id: number;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getMediaUrl(pathUrl?: string | null): string {
  if (!pathUrl || !pathUrl.trim()) {
    return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300";
  }
  if (pathUrl.startsWith("http://") || pathUrl.startsWith("https://")) {
    return pathUrl;
  }
  const cleanPath = pathUrl.startsWith("/") ? pathUrl : `/${pathUrl}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export default function TeacherSettingsPage() {
  const [activeTab, setActiveTab] = useState<"PROFILE" | "PASSWORD" | "NOTIFICATIONS">("PROFILE");
  
  // Profile States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest<Profile>("/api/users/me")
      .then((data) => {
        setProfile(data);
        setFullName(data.fullName);
        setAvatarUrl(data.avatarUrl ?? "");
        setError("");
      })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Không tải được thông tin cá nhân.")
      )
      .finally(() => setLoading(false));
  }, []);

  // Xử lý khi người dùng chọn file từ máy tính
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Kích thước ảnh tối đa là 5MB.");
        return;
      }
      setSelectedFile(file);
      // Tạo URL xem trước ảnh tạm thời
      const objectUrl = URL.createObjectURL(file);
      setPreviewAvatar(objectUrl);
      setError("");
    }
  };

  // 1. Xử lý Cập nhật Hồ sơ Cá nhân
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      let finalAvatarUrl = avatarUrl;

      // Nếu người dùng có chọn file từ máy tính, tiến hành upload file lên Backend trước
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        // Gọi API Upload File ảnh (Ví dụ: POST /api/upload)
        const uploadRes = await apiRequest<{ fileUrl: string }>("/api/upload", {
          method: "POST",
          body: formData, // apiRequest sẽ tự nhận diện FormData nếu xử lý đúng
        });

        finalAvatarUrl = uploadRes.fileUrl;
      }

      // Cập nhật thông tin Profile người dùng
      const updated = await apiRequest<Profile>("/api/teacher/profile", {
        method: "PUT",
        body: JSON.stringify({ fullName, avatarUrl: finalAvatarUrl || null }),
      });

      setProfile(updated);
      setAvatarUrl(updated.avatarUrl ?? "");
      setSelectedFile(null);
      setPreviewAvatar(null);
      setNotice("Đã cập nhật hồ sơ cá nhân thành công.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không cập nhật được hồ sơ.");
    } finally {
      setBusy(false);
    }
  }

  // 2. Xử lý Đổi Mật Khẩu
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp với mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có tối thiểu 6 ký tự.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setNotice("Đã đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f4f7fc] p-8 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Đang tải cài đặt tài khoản...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-5xl space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
            Cài đặt tài khoản
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Quản lý thông tin cá nhân, bảo mật mật khẩu và thiết lập thông báo trên EduFlow.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{notice}</span>
          </p>
        )}

        {/* Tabs navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("PROFILE");
              setError("");
              setNotice("");
            }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "PROFILE"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80"
            }`}
          >
            <User className="size-3.5" />
            <span>Hồ sơ cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("PASSWORD");
              setError("");
              setNotice("");
            }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "PASSWORD"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80"
            }`}
          >
            <KeyRound className="size-3.5" />
            <span>Đổi mật khẩu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("NOTIFICATIONS");
              setError("");
              setNotice("");
            }}
            className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "NOTIFICATIONS"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200/80"
            }`}
          >
            <Bell className="size-3.5" />
            <span>Thông báo</span>
          </button>
        </div>

        {/* TAB 1: HỒ SƠ CÁ NHÂN */}
        {activeTab === "PROFILE" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Card Bên Trái: Avatar Preview & Nút Chọn File */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-center text-center space-y-4">
                
                {/* Khung Ảnh Đại Diện */}
                <div className="relative group">
                  <img
                    src={previewAvatar || getMediaUrl(avatarUrl)}
                    alt={fullName}
                    className="size-28 rounded-full object-cover ring-4 ring-blue-50 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
                    title="Tải ảnh mới từ máy tính"
                  >
                    <Camera className="size-4" />
                  </button>
                </div>

                {/* Input File Ẩn */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div>
                  <h3 className="text-base font-extrabold text-[#17305f]">{fullName || "Chưa đặt tên"}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{profile?.email}</p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition cursor-pointer"
                >
                  <Upload className="size-3.5" />
                  <span>Chọn ảnh từ máy tính</span>
                </button>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  <ShieldCheck className="size-3" />
                  {profile?.role === "TEACHER" ? "Giảng viên" : profile?.role === "ADMIN" ? "Quản trị viên" : "Học viên"}
                </span>
              </div>
            </div>

            {/* Form Nhập Thông Tin Cá Nhân */}
            <div className="lg:col-span-8">
              <form onSubmit={saveProfile} className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 text-xs">
                <h2 className="text-sm font-bold text-[#17305f] border-b border-slate-100 pb-3">
                  Thông tin cơ bản
                </h2>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="size-3.5 text-blue-600" />
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    maxLength={100}
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-slate-400" />
                    Địa chỉ Email (Không thể thay đổi)
                  </label>
                  <input
                    disabled
                    value={profile?.email ?? ""}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100/80 p-3 text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Camera className="size-3.5 text-blue-600" />
                    Đường dẫn URL Ảnh đại diện (Hoặc chọn file ở bên)
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setPreviewAvatar(null);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={busy || !profile}
                    className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
                  >
                    {busy && <Loader2 className="size-4 animate-spin" />}
                    <span>{busy ? "Đang lưu..." : "Lưu thay đổi"}</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: ĐỔI MẬT KHẨU */}
        {activeTab === "PASSWORD" && (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={changePassword} className="rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 text-xs">
              <h2 className="text-sm font-bold text-[#17305f] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Lock className="size-4 text-blue-600" />
                Thay đổi mật khẩu đăng nhập
              </h2>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={busy}
                  className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
                >
                  {busy && <Loader2 className="size-4 animate-spin" />}
                  <span>{busy ? "Đang cập nhật..." : "Đổi mật khẩu"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: THÔNG BÁO */}
        {activeTab === "NOTIFICATIONS" && (
          <div className="max-w-2xl mx-auto rounded-3xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-[#17305f] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Bell className="size-4 text-blue-600" />
              Cấu hình thông báo Email & Hệ thống
            </h2>

            <div className="space-y-3 divide-y divide-slate-100">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-bold text-slate-800">Thông báo lượt ghi danh mới</p>
                  <p className="text-[11px] text-slate-400">Nhận thông báo khi có học viên mới đăng ký khóa học.</p>
                </div>
                <input type="checkbox" defaultChecked className="size-4 text-blue-600 rounded-md cursor-pointer" />
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <p className="font-bold text-slate-800">Thông báo đánh giá & bình luận</p>
                  <p className="text-[11px] text-slate-400">Nhận thông báo khi có bình luận hoặc câu hỏi mới.</p>
                </div>
                <input type="checkbox" defaultChecked className="size-4 text-blue-600 rounded-md cursor-pointer" />
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}