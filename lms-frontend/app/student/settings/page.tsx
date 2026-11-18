"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import { CheckCircle2, Lock, Save, ShieldCheck, User } from "lucide-react";
import { StudentHeader } from "@/components/student-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { useStudentSidebarState } from "@/components/student-sidebar-state";
import { StudentFooter } from "@/components/student-footer";
import {
  type CatalogCourse,
  type StudentUser,
  STUDENT_API_URL,
  studentApi,
} from "@/lib/student-api";

type SettingsTab = "profile" | "security";

export default function AccountSettingsPage() {
  const router = useRouter();
  const avatarInput = useRef<HTMLInputElement>(null);
  const { collapsed, setCollapsed } = useStudentSidebarState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [dbCourses, setDbCourses] = useState<CatalogCourse[]>([]);
  const [activeSettingTab, setActiveSettingTab] = useState<SettingsTab>("profile");
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(`/auth?returnUrl=${encodeURIComponent("/student/settings")}`);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoggedIn(true);
    Promise.all([
      studentApi<StudentUser>("/api/users/me"),
      studentApi<CatalogCourse[]>("/api/courses"),
    ])
      .then(([profile, catalog]) => {
        if (cancelled) return;
        setUser(profile);
        setFullName(profile.fullName);
        setDbCourses(catalog);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Không thể tải thông tin tài khoản.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/auth");
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const updated = await studentApi<StudentUser>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({ fullName, avatarUrl: user?.avatarUrl ?? null }),
      });
      setUser(updated);
      setFullName(updated.fullName);
      setSuccess("Cập nhật thông tin thành công.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật thông tin.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploaded = await studentApi<{ fileUrl: string }>("/api/users/upload", {
        method: "POST",
        body: formData,
      });
      const updated = await studentApi<StudentUser>("/api/users/me", {
        method: "PUT",
        body: JSON.stringify({ fullName, avatarUrl: uploaded.fileUrl }),
      });
      setUser(updated);
      setFullName(updated.fullName);
      setSuccess("Đã cập nhật ảnh đại diện.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể cập nhật ảnh đại diện.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setIsSaving(true);
    try {
      await studentApi<void>("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Đổi mật khẩu thành công.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể đổi mật khẩu.");
    } finally {
      setIsSaving(false);
    }
  };

  const avatarUrl = user?.avatarUrl
    ? new URL(user.avatarUrl, STUDENT_API_URL).toString()
    : null;
  const passwordFields: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete: string;
    minLength?: number;
  }[] = [
    { id: "currentPassword", label: "Mật khẩu hiện tại", value: currentPassword, onChange: setCurrentPassword, autoComplete: "current-password" },
    { id: "newPassword", label: "Mật khẩu mới", value: newPassword, onChange: setNewPassword, autoComplete: "new-password", minLength: 6 },
    { id: "confirmPassword", label: "Xác nhận mật khẩu mới", value: confirmPassword, onChange: setConfirmPassword, autoComplete: "new-password", minLength: 6 },
  ];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f8fbff] text-slate-900">
      <StudentHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
        courses={dbCourses}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        {isLoggedIn && <StudentSidebar collapsed={collapsed} activeTab="Cài đặt tài khoản" />}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isLoggedIn ? (collapsed ? "md:ml-19" : "md:ml-64") : "ml-0"
          }`}
        >
          <div className="mx-auto max-w-7xl space-y-6 p-5 lg:p-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">Cài đặt tài khoản</h1>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Quản lý hồ sơ và bảo mật tài khoản của bạn
              </p>
            </div>

            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {success && (
              <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="size-4" /> {success}
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <aside className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
                <div className="flex flex-col items-center border-b border-slate-100 pb-6 text-center">
                  <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-2xl font-bold text-blue-600 ring-4 ring-blue-50/50">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Ảnh đại diện" className="size-full object-cover" />
                    ) : (
                      fullName.trim().charAt(0).toUpperCase() || <User className="size-9" />
                    )}
                  </div>
                  <h2 className="mt-3 text-sm font-bold text-slate-800">{fullName || "Học viên"}</h2>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">{user?.email ?? ""}</p>
                  <input
                    ref={avatarInput}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => void handleAvatarChange(event)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isLoading || isSaving}
                    onClick={() => avatarInput.current?.click()}
                    className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSaving ? "Đang lưu..." : "Thay đổi ảnh"}
                  </button>
                </div>

                <nav className="flex flex-col gap-1 text-xs font-semibold">
                  {([
                    ["profile", "Thông tin cá nhân", User],
                    ["security", "Bảo mật", ShieldCheck],
                  ] as const).map(([tab, label, Icon]) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setActiveSettingTab(tab);
                        setError("");
                        setSuccess("");
                      }}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                        activeSettingTab === tab
                          ? "rounded-l-none border-l-4 border-blue-600 bg-blue-50 font-bold text-blue-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  ))}
                </nav>
              </aside>

              <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs lg:p-8">
                {isLoading ? (
                  <p role="status" className="py-12 text-center text-sm text-slate-500">Đang tải thông tin tài khoản...</p>
                ) : activeSettingTab === "profile" ? (
                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-base font-bold text-slate-800">Thông tin cá nhân</h2>
                      <p className="mt-0.5 text-xs text-slate-400">Cập nhật tên hiển thị và ảnh đại diện.</p>
                    </div>
                    <div className="space-y-4 text-xs font-semibold">
                      <div>
                        <label htmlFor="fullName" className="mb-1.5 block text-slate-700">Họ và tên</label>
                        <input
                          id="fullName"
                          type="text"
                          required
                          maxLength={100}
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          className="h-10.5 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="mb-1.5 block text-slate-700">Email</label>
                        <div className="relative">
                          <input
                            id="email"
                            type="email"
                            value={user?.email ?? ""}
                            readOnly
                            className="h-10.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 pr-10 text-slate-500 outline-none"
                          />
                          <Lock className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                        </div>
                        <p className="mt-1.5 text-[11px] font-normal text-slate-400">Email không thể thay đổi tại đây.</p>
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-slate-100 pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save className="size-4" /> {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-base font-bold text-slate-800">Đổi mật khẩu</h2>
                      <p className="mt-0.5 text-xs text-slate-400">Chọn mật khẩu có ít nhất 6 ký tự.</p>
                    </div>
                    <div className="space-y-4 text-xs font-semibold">
                      {passwordFields.map((field) => (
                        <div key={field.id}>
                          <label htmlFor={field.id} className="mb-1.5 block text-slate-700">{field.label}</label>
                          <input
                            id={field.id}
                            type="password"
                            required
                            minLength={field.minLength}
                            autoComplete={field.autoComplete}
                            value={field.value}
                            onChange={(event) => field.onChange(event.target.value)}
                            className="h-10.5 w-full rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end border-t border-slate-100 pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        <ShieldCheck className="size-4" /> {isSaving ? "Đang cập nhật..." : "Đổi mật khẩu"}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </div>
          </div>
          <StudentFooter variant="learning" />
        </main>
      </div>
    </div>
  );
}
