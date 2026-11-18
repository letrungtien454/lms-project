"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeft,
  Search,
  Settings,
  ShieldCheck,
  GitBranch,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthSession, getSessionUserName } from "@/lib/auth-session";
import { API_BASE_URL, apiRequest } from "@/lib/api";

type NavItem = { label: string; href: string; icon: LucideIcon };

const adminItems: NavItem[] = [
  { label: "Tổng quan", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Người dùng", href: "/admin/users", icon: Users },
  { label: "Lộ trình", href: "/admin/roadmaps", icon: GitBranch },
  { label: "Khóa học", href: "/admin/courses", icon: BookOpen },
  { label: "Danh mục", href: "/admin/categories", icon: FolderKanban },
  { label: "Báo cáo", href: "/admin/analytics", icon: BarChart3 },
  { label: "Kiểm duyệt", href: "/admin/moderation", icon: ShieldCheck },
  { label: "Nhật ký", href: "/admin/logs", icon: ClipboardList },
  { label: "Thông báo", href: "/admin/notifications", icon: Bell },
  { label: "Cài đặt", href: "/admin/settings", icon: Settings },
];

const teacherItems: NavItem[] = [
  { label: "Tổng quan", href: "/teacher/dashboard", icon: LayoutDashboard },
  { label: "Khóa học", href: "/teacher/courses", icon: BookOpen },
  { label: "Bài học", href: "/teacher/lessons", icon: FileText },
  { label: "Ngân hàng câu hỏi", href: "/teacher/question_bank", icon: ClipboardList },
  { label: "Học viên", href: "/teacher/students", icon: Users },
  { label: "Báo cáo", href: "/teacher/analytics", icon: BarChart3 },
  { label: "Đánh giá", href: "/teacher/reviews", icon: MessageSquare },
  { label: "Thông báo", href: "/teacher/notifications", icon: Bell },
  { label: "Cài đặt", href: "/teacher/settings", icon: Settings },
];

export function WorkspaceShell({
  role,
  children,
}: {
  role: "ADMIN" | "TEACHER";
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isAdmin = role === "ADMIN";
  const items = isAdmin ? adminItems : teacherItems;
  const currentItem = items.find((item) => pathname === item.href) ?? items[0];
  const workspaceName = isAdmin ? "EduFlow Admin" : "EduFlow Studio";
  const roleName = isAdmin ? "Quản trị viên" : "Không gian giảng viên";
  const initials = userName.split(/\s+/).filter(Boolean).slice(-2).map((word) => word[0]).join("").toUpperCase();

  useEffect(() => {
    setUserName(getSessionUserName() ?? "");
    const loadCurrentUser = () => {
      apiRequest<{ fullName: string; avatarUrl?: string | null }>("/api/users/me")
        .then((user) => {
          setUserName(user.fullName);
          setAvatarUrl(user.avatarUrl ?? null);
        })
        .catch((cause: unknown) => console.error("Không tải được hồ sơ người dùng:", cause));
    };
    const loadUnreadCount = () => {
      apiRequest<number>("/api/notifications/unread-count")
        .then(setUnreadCount)
        .catch((cause: unknown) => console.error("Không tải được số thông báo chưa đọc:", cause));
    };
    loadCurrentUser();
    loadUnreadCount();
    window.addEventListener("profile-updated", loadCurrentUser);
    window.addEventListener("notifications-updated", loadUnreadCount);
    return () => {
      window.removeEventListener("profile-updated", loadCurrentUser);
      window.removeEventListener("notifications-updated", loadUnreadCount);
    };
  }, []);

  const avatarSrc = avatarUrl
    ? avatarUrl.startsWith("http") ? avatarUrl : `${API_BASE_URL}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`
    : null;
  const renderAvatar = () => avatarSrc
    ? <img src={avatarSrc} alt="" className="size-8 shrink-0 rounded-full object-cover" onError={() => setAvatarUrl(null)} />
    : <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-blue-700 text-[10px] font-bold text-white">{initials || (isAdmin ? "AD" : "GV")}</span>;

  function signOut() {
    clearAuthSession();
    router.replace("/auth");
  }

  return (
    <div className="min-h-screen bg-[#f6f9fd] font-sans text-xs antialiased text-slate-800 lg:flex">
      {mobileOpen && <button aria-label="Đóng menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-57.5 flex-col justify-between bg-[#102957] text-white shadow-2xl transition-[width,transform] duration-300 lg:sticky lg:top-0 lg:z-10 lg:h-screen lg:shrink-0 lg:translate-x-0 lg:shadow-none ${collapsed ? "lg:w-19" : "lg:w-57.5"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
        <Link href={isAdmin ? "/admin/dashboard" : "/teacher/dashboard"} className={`flex h-17.5 items-center gap-3 border-b border-white/10 ${collapsed ? "lg:justify-center lg:px-2" : "px-5"}`}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 shadow-md">
            {isAdmin ? <ShieldCheck size={21} /> : <GraduationCap size={22} />}
          </span>
          <span className={collapsed ? "lg:hidden" : ""}>
            <span className="block text-sm font-bold leading-tight">{isAdmin ? "EduFlow" : "Giảng viên"}</span>
            <span className="mt-0.5 block text-[10px] leading-tight text-blue-200/80">{isAdmin ? "Không gian quản trị" : "Không gian quản lý"}</span>
          </span>
          <button aria-label="Đóng menu" onClick={(event) => { event.preventDefault(); setMobileOpen(false); }} className="ml-auto rounded-lg p-1 text-blue-100 lg:hidden"><X size={18} /></button>
        </Link>
        <nav className="space-y-1 overflow-y-auto p-3">
          {items.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition ${
                  active
                    ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-900/30"
                    : "text-blue-100/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className={`flex-1 ${collapsed ? "lg:hidden" : ""}`}>{label}</span>
                {active && <ChevronRight size={14} className={`text-blue-200 ${collapsed ? "lg:hidden" : ""}`} />}
              </Link>
            );
          })}
        </nav>
        </div>
        <div className="border-t border-white/10 p-3">
          <div className={`flex items-center gap-2.5 rounded-xl bg-white/6 p-2.5 ${collapsed ? "lg:justify-center" : ""}`}>
            {renderAvatar()}
            <span className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
              <span className="block truncate text-[11px] font-semibold">{userName || roleName}</span>
              <span className="mt-0.5 block text-[10px] text-blue-200/70">{roleName}</span>
            </span>
            <button onClick={signOut} aria-label="Đăng xuất" title="Đăng xuất" className={`rounded-lg p-2 text-blue-100/70 transition hover:bg-white/10 hover:text-white ${collapsed ? "lg:hidden" : ""}`}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className={`min-w-0 flex-1 transition-[margin] duration-300 ${collapsed ? "lg:ml-0" : ""}`}>
        <header className={`sticky top-0 z-30 h-17.5 border-b border-slate-200 bg-white/95 backdrop-blur ${collapsed ? "lg:left-19" : "lg:left-57.5"} left-0`}>
          <div className="flex h-full items-center gap-4 px-4 sm:px-7">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-1 text-slate-500 hover:text-blue-600 lg:hidden" aria-label="Mở menu"><Menu size={20} /></button>
            <button onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 lg:block" aria-label="Thu gọn thanh bên"><PanelLeft size={20} /></button>
            <div className="hidden max-w-110 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input aria-label="Tìm kiếm" className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" placeholder={isAdmin ? "Tìm kiếm người dùng, khóa học, giảng viên..." : "Tìm khóa học, học viên, nội dung..."} />
              <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-400 shadow-sm xl:block">⌘ K</kbd>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Link href={isAdmin ? "/admin/notifications" : "/teacher/notifications"} aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ""}`} className="relative rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"><Bell size={20} />{unreadCount > 0 && <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}</Link>
              <div className="hidden h-8 w-px bg-slate-200 sm:block" />
              <div className="flex items-center gap-2.5 rounded-xl p-1.5">
                {renderAvatar()}
                <span className="hidden max-w-44 text-left sm:block"><span className="block truncate text-xs font-bold text-slate-800">{userName || workspaceName}</span><span className="block text-[10px] text-slate-400">{isAdmin ? "Admin" : "Giảng viên"}</span></span>
                <button onClick={signOut} aria-label="Đăng xuất" title="Đăng xuất" className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:block"><LogOut size={15} /></button>
              </div>
            </div>
          </div>
        </header>
        <div className="min-w-0">{children}</div>
      </div>
      <button className="fixed bottom-5 left-4 z-30 flex size-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/25 transition hover:bg-blue-700 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Mở menu"><Menu size={20} /></button>
    </div>
  );
}
