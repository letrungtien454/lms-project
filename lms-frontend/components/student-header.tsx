"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  ChevronDown,
  GraduationCap,
  Globe2,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserRound,
  Users,
  X,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { StudentCategoryMenu } from "@/components/student-category-menu";
import { StudentNotificationBell } from "@/components/student-notification-bell";
import { STUDENT_API_URL } from "@/lib/student-api";

type HeaderCourse = {
  id: string | number;
  title?: string;
  name?: string;
  instructor?: string | null;
  instructorName?: string | null;
  teacher?: { fullName?: string };
};

type HeaderUser = {
  fullName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string | null;
} | null;

export function StudentHeader({
  collapsed = false,
  onToggle,
  isLoggedIn,
  user,
  courses = [],
  onLogout,
  onCategorySelect,
  authHref = "/auth",
  variant = "courses",
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  isLoggedIn: boolean;
  user: HeaderUser;
  courses?: HeaderCourse[];
  onLogout: () => void;
  onCategorySelect?: (categoryName: string | null) => void;
  authHref?: string;
  variant?: "courses" | "learning";
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const homeIsActive = pathname === "/" || pathname === "/dashboard";
  const coursesIsActive =
    pathname === "/courses" ||
    pathname.startsWith("/courses/") ||
    pathname.startsWith("/learning/");
  const searchResults = headerSearch.trim()
    ? courses
        .filter((course) => {
          const instructor =
            course.teacher?.fullName ||
            course.instructorName ||
            course.instructor ||
            "";
          return `${course.title || course.name || ""} ${instructor}`
            .toLocaleLowerCase("vi")
            .includes(headerSearch.trim().toLocaleLowerCase("vi"));
        })
        .slice(0, 6)
    : [];
  const avatarUrl = user?.avatarUrl
    ? new URL(user.avatarUrl, STUDENT_API_URL).toString()
    : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCourses = () => {
    if (!headerSearch.trim()) return;
    router.push(`/courses?search=${encodeURIComponent(headerSearch.trim())}`);
    setSearchOpen(false);
    setMobileMenuOpen(false);
  };

  const selectCategory = (categoryName: string | null) => {
    onCategorySelect?.(categoryName);
    setMobileMenuOpen(false);
  };

  const activeLinkClass = "text-sm font-bold text-blue-600";
  const inactiveLinkClass =
    "text-sm font-semibold text-slate-600 transition hover:text-blue-600";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-17.5 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <a
            href="/dashboard"
            className="flex items-center gap-2.5"
            aria-label="EduFlow trang chủ"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-[#17305f]">
              EduFlow
            </span>
          </a>
          {isLoggedIn && onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? "Mở thanh bên" : "Thu gọn thanh bên"}
              aria-expanded={!collapsed}
              title={collapsed ? "Mở thanh bên" : "Thu gọn thanh bên"}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
            >
              {collapsed ? (
                <PanelLeftOpen className="size-5" />
              ) : (
                <PanelLeftClose className="size-5" />
              )}
            </button>
          )}
        </div>

        <nav
          className="hidden shrink-0 items-center gap-6 lg:flex"
          aria-label="Điều hướng chính"
        >
          <a
            aria-current={homeIsActive ? "page" : undefined}
            className={homeIsActive ? activeLinkClass : inactiveLinkClass}
            href="/dashboard"
          >
            Trang chủ
          </a>
          <a
            aria-current={coursesIsActive ? "page" : undefined}
            className={coursesIsActive ? activeLinkClass : inactiveLinkClass}
            href="/courses"
          >
            Khóa học
          </a>
          <StudentCategoryMenu onSelect={onCategorySelect} />
        </nav>

        <div className="hidden max-w-sm flex-1 md:block">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={headerSearch}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setHeaderSearch(event.target.value);
                setSearchOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") searchCourses();
              }}
              className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              placeholder={
                variant === "learning"
                  ? "Tìm khóa học, bài giảng..."
                  : "Tìm khóa học, giảng viên..."
              }
              aria-label="Tìm khóa học hoặc giảng viên"
              aria-expanded={searchOpen && !!headerSearch.trim()}
              aria-controls="student-course-search-suggestions"
            />
            {searchOpen && headerSearch.trim() && (
              <div
                id="student-course-search-suggestions"
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl"
              >
                {searchResults.length ? (
                  searchResults.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      role="option"
                      onClick={() => {
                        router.push(`/courses/${course.id}`);
                        setHeaderSearch("");
                        setSearchOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-blue-50"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-bold text-slate-800">
                          {course.title || course.name}
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-slate-400">
                          {course.teacher?.fullName ||
                            course.instructorName ||
                            course.instructor ||
                            "EduFlow"}
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-blue-500" />
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-xs text-slate-500">
                    Không tìm thấy khóa học phù hợp.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {variant === "courses" && (
            <button
              type="button"
              onClick={() => setIsDark((dark) => !dark)}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
              aria-label="Chuyển chế độ sáng tối"
              title="Chế độ Tối/Sáng"
            >
              {isDark ? (
                <Sun className="size-4 text-amber-500" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
          )}
          {(variant === "courses" || isLoggedIn) && <StudentNotificationBell />}
          {isLoggedIn ? (
            <div
              className="relative ml-2 flex items-center gap-2 border-l border-slate-200 pl-3"
              ref={dropdownRef}
            >
              <button
                type="button"
                onClick={() => setDropdownOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 hover:border-blue-200 hover:bg-blue-50"
                aria-expanded={dropdownOpen}
                aria-label="Mở menu tài khoản"
              >
                <span className="flex size-8 items-center justify-center overflow-hidden rounded-lg bg-blue-600 text-sm font-bold text-white">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    (user?.fullName?.trim().split(/\s+/).at(-1)?.[0] ||
                      user?.username?.[0] ||
                      "U"
                    ).toUpperCase()
                  )}
                </span>
                <span className="max-w-32 truncate text-xs font-bold text-slate-700">
                  {user?.fullName || user?.username || "Học viên"}
                </span>
                <ChevronDown className="size-3.5 text-slate-400" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                  <div className="mb-1 border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {user?.fullName || user?.username || "Học viên"}
                    </p>
                    <p className="truncate text-[11px] text-slate-400">
                      {user?.email || "student@eduflow.com"}
                    </p>
                  </div>
                  {variant === "learning" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => router.push("/student/dashboard")}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <UserRound className="size-4 text-slate-400" />
                        Hồ sơ của tôi
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push("/student/certificates")}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Award className="size-4 text-slate-400" />
                        Chứng chỉ của tôi
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard")}
                      className="w-full rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Trang cá nhân
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    {variant === "learning" && (
                      <LogOut className="size-4 text-red-500" />
                    )}
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <a
                href={authHref}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50"
              >
                Đăng ký
              </a>
              <a
                href={authHref}
                className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
              >
                Đăng nhập
              </a>
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-slate-600 lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Điều hướng di động">
            <a
              href="/dashboard"
              aria-current={homeIsActive ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                homeIsActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Trang chủ
            </a>
            <a
              href="/courses"
              aria-current={coursesIsActive ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={`rounded-lg px-3 py-3 text-sm font-semibold ${
                coursesIsActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Khóa học
            </a>
            <StudentCategoryMenu
              variant="mobile"
              onSelect={selectCategory}
            />
            <label className="relative mt-2 block md:hidden">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={headerSearch}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => {
                  setHeaderSearch(event.target.value);
                  setSearchOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") searchCourses();
                }}
                placeholder="Tìm khóa học..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-blue-300"
                aria-label="Tìm khóa học"
              />
            </label>
            {searchOpen && headerSearch.trim() && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {searchResults.length ? (
                  searchResults.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        router.push(`/courses/${course.id}`);
                        setHeaderSearch("");
                        setSearchOpen(false);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full border-b border-slate-100 px-3 py-3 text-left last:border-0"
                    >
                      <span className="block truncate text-xs font-bold text-slate-800">
                        {course.title || course.name}
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-slate-400">
                        {course.teacher?.fullName ||
                          course.instructorName ||
                          course.instructor ||
                          "EduFlow"}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-xs text-slate-500">
                    Không tìm thấy khóa học phù hợp.
                  </p>
                )}
              </div>
            )}
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
              {isLoggedIn ? (
                <>
                  <span className="flex-1 self-center truncate text-sm font-semibold text-slate-700">
                    {user?.fullName || user?.username || "Học viên"}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <a
                    href={authHref}
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700"
                  >
                    Đăng nhập
                  </a>
                  <a
                    href={authHref}
                    className="flex-1 rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Đăng ký
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
