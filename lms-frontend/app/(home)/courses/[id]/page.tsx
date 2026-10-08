"use client";

import useSWR from "swr";
import { useState, useRef, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  GraduationCap,
  Home,
  LogOut,
  Moon,
  PanelLeft,
  Play,
  Search,
  ShieldCheck,
  Star,
  Sun,
  Target,
  UserRound,
  Users,
  Video,
  X,
  Menu,
  MessageCircle,
  Lock,
  Sparkles,
  HelpCircle,
  FileText,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type ApiLesson = {
  id: string | number;
  name: string;
  duration?: string;
  isPreview?: boolean;
  orderIndex?: number;
  lessonType?: string;
};

type ApiChapter = {
  id: string | number;
  title: string;
  orderIndex?: number;
  lessons?: ApiLesson[];
};

type ApiCourse = {
  id?: string | number;
  title?: string;
  description?: string;
  outcomes?: string;
  requirements?: string;
  price?: number;
  level?: string;
  thumbnailUrl?: string;
  thumbnail?: string;
  category?: string;
  instructor?: string;
  chapters?: ApiChapter[];
};

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
  const headers: HeadersInit = {};

  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { headers }).then((response) => {
    if (!response.ok) throw new Error("Không thể tải khóa học");
    return response.json();
  });
};

const authUrlFor = (returnUrl: string) => `/auth?returnUrl=${encodeURIComponent(returnUrl)}`;

const fallbackCourse: Required<ApiCourse> = {
  id: "1",
  title: "Khóa học Lập trình EduFlow",
  description: "Hiểu sâu hơn về cách JavaScript hoạt động, tìm hiểu về IIFE, closure, reference types, this keyword, bind, call, apply, prototype, ...",
  outcomes: "Được học kiến thức miễn phí với nội dung chất lượng hơn mất phí\nCác kiến thức nâng cao của Javascript giúp code trở nên tối ưu hơn\nHiểu được cách tư duy nâng cao của các lập trình viên có kinh nghiệm\nHiểu được các khái niệm khó như từ khóa this, phương thức bind, call, apply & xử lý bất đồng bộ",
  requirements: "Hoàn thành khóa học Javascript cơ bản hoặc đã nắm chắc kiến thức căn bản.\nMáy tính kết nối internet và tinh thần tự học cao.",
  price: 0,
  level: "ALL_LEVELS",
  thumbnailUrl: "",
  thumbnail: "",
  category: "Lập trình Web",
  instructor: "EduFlow Instructor",
  chapters: [],
};

const relatedCoursesData = [
  {
    id: "2",
    title: "HTML CSS Từ Nền Tảng Đến Thực Chiến",
    students: "12.450",
    rating: 4.9,
    price: 0,
    lessons: 28,
    duration: "08h 30m",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500",
  },
  {
    title: "Lập Trình JavaScript Cơ Bản Đến Nâng Cao",
    id: "3",
    students: "24.180",
    rating: 5.0,
    price: 299000,
    lessons: 45,
    duration: "14h 20m",
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500",
  },
  {
    id: "4",
    title: "Xây Dựng Website Đa Nền Tảng Với React.js",
    students: "18.900",
    rating: 4.8,
    price: 499000,
    lessons: 52,
    duration: "18h 45m",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500",
  },
];

const initialReviews = [
  {
    name: "Hoàng Nguyễn Văn",
    initials: "HV",
    text: "Khóa học rất hay, bài giảng xúc tích, dễ hiểu và sát với thực tế đi làm.",
    rating: 5,
    title: "Khóa học dễ hiểu và thực tế",
    verified: true,
  },
  {
    name: "Nguyễn Minh Anh",
    initials: "MA",
    text: "Nội dung thực tế, giảng viên giải thích rõ ràng và dễ áp dụng.",
    rating: 5,
    title: "Tuyệt vời",
    verified: true,
  },
];

function getFirstNameInitial(fullName?: string, username?: string): string {
  const name = fullName || username;
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="EduFlow trang chủ">
      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
        <GraduationCap className="size-5" />
      </span>
      <span className="text-xl font-bold tracking-tight text-[#17305f]">
        EduFlow
      </span>
    </a>
  );
}

function Header({
  collapsed,
  onToggle,
  isLoggedIn,
  user,
  onLogout,
  authHref,
}: {
  collapsed: boolean;
  onToggle: () => void;
  isLoggedIn: boolean;
  user: any;
  onLogout: () => void;
  authHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-17.5 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <div className="flex items-center gap-2 shrink-0">
          <Logo />
          {isLoggedIn && (
            <button
              onClick={onToggle}
              className="hidden ml-2 rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 md:block cursor-pointer"
              aria-label={collapsed ? "Mở thanh bên" : "Thu gọn thanh bên"}
            >
              <PanelLeft className="size-5" />
            </button>
          )}
        </div>

        <nav className="hidden items-center gap-6 lg:flex shrink-0" aria-label="Điều hướng chính">
          <a className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition" href="/dashboard">
            Trang chủ
          </a>
          <a className="text-xs font-bold text-blue-600" href="/courses">
            Khóa học
          </a>
          <a className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition" href="/courses#filters">
            Danh mục
          </a>
        </nav>

        <div className="hidden max-w-sm flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              placeholder="Tìm khóa học, giảng viên..."
            />
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex shrink-0">
          <button
            onClick={() => setIsDark(!isDark)}
            className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
            aria-label="Chuyển chế độ sáng tối"
          >
            {isDark ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4" />}
          </button>

          {isLoggedIn ? (
            <div className="relative flex items-center gap-2 pl-2" ref={dropdownRef}>
              <button
                className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                aria-label="Thông báo"
              >
                <Bell className="size-4" />
              </button>

              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-1.5 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-sm shadow-xs">
                  {getFirstNameInitial(user?.fullName, user?.username)}
                </div>
                <span className="text-xs font-bold text-slate-700 max-w-32.5 truncate">
                  {user?.fullName || user?.username || "Học viên"}
                </span>
                <ChevronDown className="size-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/60 z-50">
                  <div className="border-b border-slate-100 px-3 py-2.5 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email || "student@eduflow.com"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-0.5 text-xs text-slate-600 font-medium">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/student/dashboard");
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left cursor-pointer"
                    >
                      <UserRound className="size-4 text-slate-400" />
                      Hồ sơ của tôi
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-50 transition text-left font-semibold cursor-pointer"
                    >
                      <LogOut className="size-4 text-red-500" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <a
                href={authHref}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 transition"
              >
                Đăng ký
              </a>
              <a
                href={authHref}
                className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition"
              >
                Đăng nhập
              </a>
            </div>
          )}
        </div>

        <button
          className="rounded-xl p-2 text-slate-600 lg:hidden cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
    </header>
  );
}

function AppSidebar({
  collapsed,
  activeTab,
  setActiveTab,
}: {
  collapsed: boolean;
  activeTab: string | null;
  setActiveTab: (tab: string) => void;
}) {
  const router = useRouter();
  const items = [
    ["Trang cá nhân", UserRound, "/student/dashboard"],
    ["Lộ trình học", Target, "/student/roadmap"],
    ["Khóa học của tôi", GraduationCap, "/student/my-courses"],
    ["Code Day", Code2, "/student/code-day"],
    ["Luyện phỏng vấn", MessageCircle, "/student/interview"],
    ["Tiến độ học tập", Award, "/student/progress"],
  ] as const;

  return (
    <aside
      className={`fixed left-0 top-17.5 z-40 hidden h-[calc(100vh-70px)] shrink-0 border-r border-slate-200/80 bg-white/95 px-3 pt-10 pb-5 shadow-sm backdrop-blur-xl overflow-y-auto md:block transition-all duration-300 ${
        collapsed ? "w-19" : "w-64"
      }`}
      aria-label="Student workspace navigation"
    >
      <p
        className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 ${
          collapsed ? "sr-only" : ""
        }`}
      >
        Không gian làm việc
      </p>
      <nav className="flex flex-col gap-1.5">
        {items.map(([label, Icon, path]) => {
          const isActive = activeTab === label;
          return (
            <button
              key={label}
              onClick={() => {
                setActiveTab(label);
                router.push(path);
              }}
              className={`group relative flex w-full items-center rounded-xl py-3 text-sm font-semibold transition shrink-0 cursor-pointer ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive
                  ? collapsed
                    ? "text-blue-700"
                    : "border-l-4 border-blue-600 bg-blue-50/80 text-blue-700 font-bold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  isActive
                    ? collapsed
                      ? "bg-blue-100 text-blue-600"
                      : "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100/80 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                }`}
              >
                <Icon className="size-4 shrink-0" />
              </span>
              <span className={collapsed ? "sr-only" : "truncate"}>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function Stars({ small = false }: { small?: boolean }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${small ? "size-3" : "size-4"} fill-current`} />
      ))}
    </span>
  );
}

function Breadcrumb({ title }: { title: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
      <Home className="size-3.5 text-blue-600" />
      <a href="/" className="hover:text-blue-600 transition">EduFlow</a>
      <span>/</span>
      <a href="/courses" className="hover:text-blue-600 transition">Khóa học</a>
      <span>/</span>
      <span className="text-slate-700 font-bold truncate max-w-xs">{title}</span>
    </div>
  );
}

function Curriculum({
  courseId,
  chapters = [],
  isLoggedIn,
  isEnrolled,
  authHref,
  onEnroll,
  showToast,
}: {
  courseId: string | number;
  chapters?: ApiChapter[];
  isLoggedIn: boolean;
  isEnrolled: boolean;
  authHref: string;
  onEnroll: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [openChapters, setOpenChapters] = useState<number[]>([0]);
  const router = useRouter();

  const isAllExpanded = openChapters.length === chapters.length;

  const toggleAll = () => {
    if (isAllExpanded) {
      setOpenChapters([]);
    } else {
      setOpenChapters(chapters.map((_, i) => i));
    }
  };

  const toggleChapter = (index: number) => {
    setOpenChapters((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleLessonClick = (lesson: ApiLesson) => {
    if (lesson.isPreview) {
      router.push(`/learning/${courseId}?lesson=${lesson.id}`);
      return;
    }

    if (!isLoggedIn) {
      showToast("Vui lòng đăng nhập để mở khóa bài học này!", "error");
      router.push(authHref);
      return;
    }

    if (!isEnrolled) {
      showToast("Bạn cần đăng ký khóa học để học bài này!", "error");
      onEnroll();
      return;
    }

    router.push(`/learning/${courseId}?lesson=${lesson.id}`);
  };

  const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Nội dung khóa học
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {chapters.length} chương <span className="mx-1">•</span> {totalLessons} bài học
          </p>
        </div>

        {chapters.length > 0 && (
          <button
            onClick={toggleAll}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            {isAllExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {chapters && chapters.length > 0 ? (
          chapters.map((chapter, chapterIndex) => {
            const isOpen = openChapters.includes(chapterIndex);
            const lessonList = chapter.lessons || [];

            return (
              <div key={chapter.id || chapterIndex} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                <button
                  onClick={() => toggleChapter(chapterIndex)}
                  className="flex w-full items-center justify-between gap-4 bg-slate-50/70 px-5 py-3.5 text-left hover:bg-blue-50/50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-3 text-sm font-bold text-slate-800">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-blue-100 text-xs text-blue-700 font-extrabold">
                      {chapterIndex + 1}
                    </span>
                    {chapter.title}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{lessonList.length} bài học</span>
                </button>

                {isOpen && (
                  <div className="divide-y divide-slate-100 border-t border-slate-100">
                    {lessonList.length > 0 ? (
                      lessonList.map((lesson, lessonIndex) => {
                        const LessonIcon = lesson.lessonType === "QUIZ"
                          ? HelpCircle
                          : ["ARTICLE", "DOCUMENT", "CODE_PRACTICE", "DOCUMENT_AND_CODING"].includes(lesson.lessonType ?? "")
                            ? FileText
                            : Video;
                        return (
                        <div
                          key={lesson.id || lesson.name}
                          onClick={() => handleLessonClick(lesson)}
                          className="flex cursor-pointer items-center justify-between gap-4 px-6 py-3 text-xs hover:bg-blue-50/30 transition group"
                        >
                          <span className="flex min-w-0 items-center gap-3 font-medium text-slate-700 group-hover:text-blue-600 transition">
                            <span className="flex size-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                              <LessonIcon className="size-3.5 shrink-0" />
                            </span>
                            <span className="truncate">
                              <strong className="font-bold text-slate-900 mr-1.5">
                                {chapterIndex + 1}.{lessonIndex + 1}
                              </strong>
                              {lesson.name}
                            </span>
                          </span>

                          <span className="flex shrink-0 items-center gap-2.5 text-slate-500">
                            {lesson.isPreview ? (
                              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 shadow-2xs">
                                Xem trước
                              </span>
                            ) : (
                              !isEnrolled && <Lock className="size-3.5 text-slate-400" />
                            )}
                            <span className="font-medium text-slate-400">{lesson.duration || "10:00"}</span>
                            <Clock3 className="size-3.5 text-slate-300" />
                          </span>
                        </div>
                      )})
                    ) : (
                      <div className="px-6 py-3 text-xs italic text-slate-400">
                        Chương này chưa có bài học nào.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
            Khóa học hiện chưa được cập nhật danh mục chương và bài học.
          </div>
        )}
      </div>
    </section>
  );
}

function EnrollmentCard({
  course,
  chapters = [],
  isEnrolled,
  isEnrolling,
  onEnroll,
}: {
  course: Required<ApiCourse>;
  chapters?: ApiChapter[];
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
}) {
  const isFree = (course.price || 0) === 0;
  const defaultImage = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600";
  const courseImage = course.thumbnailUrl || course.thumbnail || defaultImage;

  const totalLessons = chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0);

  const buttonText = isEnrolling
    ? "Đang xử lý..."
    : isEnrolled
    ? "TIẾP TỤC HỌC"
    : isFree
    ? "BẮT ĐẦU HỌC"
    : "ĐĂNG KÝ HỌC";

  return (
    <aside className="w-full max-w-85 shrink-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xl shadow-slate-200/50 lg:sticky lg:top-22">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-900 group">
        <img
          src={courseImage}
          alt="Ảnh bìa khóa học"
          className="absolute inset-0 size-full object-cover opacity-85 transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        
        <button
          onClick={onEnroll}
          disabled={isEnrolling}
          className="relative z-10 flex size-13 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/40 transition hover:scale-110 hover:bg-blue-700 cursor-pointer disabled:opacity-70"
        >
          {isEnrolling ? <Loader2 className="size-6 animate-spin" /> : <Play className="ml-0.5 size-6 fill-current" />}
        </button>
        <span className="absolute bottom-3 z-10 text-xs font-bold text-white drop-shadow-md flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-300" /> Xem giới thiệu khóa học
        </span>
      </div>

      <div className="flex flex-col items-center pt-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chi phí khóa học</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-blue-600">
            {isFree ? "Miễn phí" : `${(course.price || 0).toLocaleString("vi-VN")}đ`}
          </span>
        </div>

        <button
          onClick={onEnroll}
          disabled={isEnrolling}
          className="mt-4 flex items-center justify-center gap-2 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition active:scale-98 cursor-pointer disabled:opacity-70"
        >
          {isEnrolling && <Loader2 className="size-4 animate-spin" />}
          {buttonText}
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600">
        <span className="flex items-center gap-2.5"><Code2 className="size-4 text-blue-600 shrink-0" /> {({ BEGINNER: "Sơ cấp", INTERMEDIATE: "Trung cấp", ADVANCED: "Cao cấp", ALL_LEVELS: "Mọi trình độ" } as Record<string, string>)[String(course.level || "").toUpperCase()] || "Mọi trình độ"}</span>
        <span className="flex items-center gap-2.5"><BookOpen className="size-4 text-blue-600 shrink-0" /> Tổng số {totalLessons} bài học</span>
        <span className="flex items-center gap-2.5"><Award className="size-4 text-blue-600 shrink-0" /> Chứng chỉ hoàn thành</span>
        <span className="flex items-center gap-2.5"><ShieldCheck className="size-4 text-blue-600 shrink-0" /> Học mọi lúc, mọi nơi</span>
      </div>
    </aside>
  );
}

function RelatedCourses() {
  const router = useRouter();

  return (
    <section className="mt-12 border-t border-slate-200/80 pt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Khóa học liên quan</h2>
          <p className="mt-1 text-xs text-slate-500">Các khóa học cùng chủ đề bạn có thể quan tâm</p>
        </div>
        <a
          href="/courses"
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
        >
          Xem tất cả <ArrowRight className="size-4" />
        </a>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {relatedCoursesData.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/courses/${item.id}`)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="size-full object-cover transition duration-300 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                Lập trình Web
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                {item.title}
              </h3>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="size-3.5 fill-current" /> {item.rating}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Users className="size-3.5 text-slate-400" /> {item.students}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <BookOpen className="size-3.5 text-slate-400" /> {item.lessons} bài
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className={`text-sm font-black ${item.price === 0 ? "text-blue-600" : "text-slate-900"}`}>
                  {item.price === 0 ? "Miễn phí" : `${item.price.toLocaleString("vi-VN")}đ`}
                </span>
                <span className="text-xs font-bold text-blue-600 group-hover:underline">
                  Xem chi tiết
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Reviews({
  onOpenReviewModal,
}: {
  onOpenReviewModal: () => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Đánh giá của học viên</h2>
          <p className="mt-0.5 text-xs text-slate-500">100% đánh giá đã được xác minh học viên</p>
        </div>
        <button
          onClick={onOpenReviewModal}
          className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-700 transition cursor-pointer"
        >
          <Star className="size-4 fill-current" /> Viết đánh giá
        </button>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-[140px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-amber-50/60 p-4 border border-amber-100">
          <p className="text-4xl font-black text-slate-900">5.0</p>
          <div className="mt-1"><Stars /></div>
          <p className="mt-1 text-[11px] font-semibold text-amber-700">2 đánh giá</p>
        </div>

        <div className="flex flex-col gap-1.5 justify-center">
          {[
            ["5 sao", 100],
            ["4 sao", 0],
            ["3 sao", 0],
          ].map(([label, value]) => (
            <div key={label as string} className="flex items-center gap-2.5 text-xs text-slate-500">
              <span className="w-10 text-right font-bold text-slate-600">{label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${value}%` }} />
              </div>
              <span className="w-8 text-right font-medium">{value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {initialReviews.map((review) => (
          <article key={review.name} className="rounded-2xl bg-slate-50/70 p-4 border border-slate-100/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs">
                  {review.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">{review.name}</p>
                    {review.verified && (
                      <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        ✓ Học viên đã xác minh
                      </span>
                    )}
                  </div>
                  <Stars small />
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-xs font-bold text-slate-800">{review.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ToastNotification({
  toast,
  onClose,
}: {
  toast: { message: string; type: "success" | "error" } | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
      {toast.type === "success" ? (
        <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="size-5 text-amber-400 shrink-0" />
      )}
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-2 rounded-lg p-1 hover:bg-slate-800 text-slate-400 cursor-pointer">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const returnUrl = `/courses/${resolvedParams.id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const authHref = authUrlFor(returnUrl);

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const router = useRouter();

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && token !== "null" && token !== "undefined") {
      setIsLoggedIn(true);

      fetch("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser(data);
        })
        .catch(() => {});

      fetch(`http://localhost:8080/api/enrollments/check/${resolvedParams.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.isEnrolled) {
            setIsEnrolled(true);
          }
        })
        .catch(() => {});
    }
  }, [resolvedParams.id]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setUser(null);
    setIsEnrolled(false);
    showToast("Đã đăng xuất tài khoản!");
  };

  const { data } = useSWR<ApiCourse>(
    `http://localhost:8080/api/courses/${resolvedParams.id}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const course = { ...fallbackCourse, ...(data ?? {}) };
  const courseChapters = course.chapters || [];

  // TÁCH CHUỖI OUTCOMES THÀNH MẢNG
  const outcomesList = course.outcomes
    ? course.outcomes.split("\n").filter((item) => item.trim().length > 0)
    : [];

  // TÁCH CHUỖI REQUIREMENTS THÀNH MẢNG
  const requirementsList = course.requirements
    ? course.requirements.split("\n").filter((item) => item.trim().length > 0)
    : [];

  const handleEnroll = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      showToast("Vui lòng đăng nhập để đăng ký khóa học!", "error");
      router.push(authHref);
      return;
    }

    if (isEnrolled) {
      const courseId = String(course.id || resolvedParams.id);
      const lastLessonId = localStorage.getItem(`eduflow:lastLesson:${courseId}`);

      if (lastLessonId) {
        router.push(`/learning/${courseId}?lesson=${encodeURIComponent(lastLessonId)}`);
      } else {
        router.push(`/learning/${courseId}`);
      }
      return;
    }

    setIsEnrolling(true);

    try {
      const coursePrice = Number(course.price) || 0;
      if (coursePrice > 0) {
        const paymentResponse = await fetch(
          `http://localhost:8080/api/payments/vnpay/courses/${resolvedParams.id}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const paymentData = await paymentResponse.json();
        if (!paymentResponse.ok) {
          throw new Error(paymentData.message || "Không thể khởi tạo thanh toán VNPay.");
        }
        if (typeof paymentData.paymentUrl !== "string" || !paymentData.paymentUrl) {
          throw new Error("Máy chủ không trả về đường dẫn thanh toán hợp lệ.");
        }
        window.location.assign(paymentData.paymentUrl);
        return;
      }

      const res = await fetch(`http://localhost:8080/api/enrollments/${resolvedParams.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        showToast("Đăng ký khóa học thành công!", "success");
        setIsEnrolled(true);
        router.push(`/learning/${course.id || resolvedParams.id}`);
        return;
      }

      const text = await res.text();
      let errorMessage = "Đăng ký thất bại!";

      if (text) {
        try {
          const data = JSON.parse(text);
          if (data.message === "Bạn đã đăng ký khóa học này rồi!") {
            setIsEnrolled(true);
            const courseId = String(course.id || resolvedParams.id);
            const lastLessonId = localStorage.getItem(`eduflow:lastLesson:${courseId}`);
            router.push(
              lastLessonId
                ? `/learning/${courseId}?lesson=${encodeURIComponent(lastLessonId)}`
                : `/learning/${courseId}`
            );
            return;
          }
          if (data.message) errorMessage = data.message;
        } catch {
          errorMessage = text;
        }
      }

      showToast(errorMessage, "error");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      showToast(error instanceof Error ? error.message : "Có lỗi xảy ra khi kết nối máy chủ!", "error");
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen flex-col bg-[#f8fbff] text-slate-900">
      <Header
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
        authHref={authHref}
        onLogout={handleLogout}
      />

      {isLoggedIn && (
        <AppSidebar
          collapsed={collapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      <main
        className={`flex-1 transition-all duration-300 ${
          isLoggedIn ? (collapsed ? "md:pl-19" : "md:pl-64") : "pl-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <Breadcrumb title={course.title} />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Nội dung bên trái */}
            <div className="min-w-0 flex-1">
              <div className="rounded-2xl bg-linear-to-r from-blue-50/80 via-indigo-50/40 to-transparent p-6 border border-blue-100/60 shadow-xs">
                <h1 className="text-2xl font-black tracking-tight text-[#17305f] sm:text-3xl">
                  {course.title}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 max-w-3xl">
                  {course.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-5 text-xs">
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                    <Stars />
                    <strong className="text-slate-800 font-bold">5.0</strong>
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                    <Users className="size-4 text-blue-600" /> Học viên EduFlow
                  </span>
                </div>
              </div>

              {/* 🎯 KHỐI "BẠN SẼ HỌC ĐƯỢC GÌ?" (ĐỌC TỪ CỘT OUTCOMES) */}
              {outcomesList.length > 0 && (
                <div className="mt-8 rounded-2xl bg-blue-50/60 border border-blue-100 p-6">
                  <h2 className="text-xl font-bold text-[#17305f]">Bạn sẽ học được gì?</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {outcomesList.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs font-semibold text-slate-700">
                        <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white shrink-0 mt-0.5">
                          <Check className="size-3" />
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dữ liệu Chương & Bài học thật từ PostgreSQL */}
              <div id="curriculum" className="mt-10 scroll-mt-24">
                <Curriculum
                  courseId={course.id || resolvedParams.id}
                  chapters={courseChapters}
                  isLoggedIn={isLoggedIn}
                  isEnrolled={isEnrolled}
                  authHref={authHref}
                  onEnroll={handleEnroll}
                  showToast={showToast}
                />
              </div>

              {/* 🎯 KHỐI "YÊU CẦU" (ĐỌC TỪ CỘT REQUIREMENTS) */}
              {requirementsList.length > 0 && (
                <div className="mt-10 rounded-2xl bg-slate-50/80 border border-slate-200/80 p-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <FileText className="size-4" />
                    </span>
                    Yêu cầu
                  </h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {requirementsList.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs font-semibold text-slate-700">
                        <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-white shrink-0 mt-0.5">
                          <Check className="size-3" />
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Đánh giá của học viên */}
              <div className="mt-10">
                <Reviews onOpenReviewModal={() => {}} />
              </div>

              {/* Khóa học liên quan */}
              <RelatedCourses />
            </div>

            {/* Cột Bên phải */}
            <EnrollmentCard
              course={course}
              chapters={courseChapters}
              isEnrolled={isEnrolled}
              isEnrolling={isEnrolling}
              onEnroll={handleEnroll}
            />
          </div>
        </div>

        <ToastNotification toast={toast} onClose={() => setToast(null)} />

        <footer className="mt-16 bg-[#102653] text-blue-100">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-8">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-6 text-blue-200/70">
                Giải pháp học lập trình và phát triển kỹ năng công nghệ hiệu quả.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Nền tảng</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
                <a href="/courses" className="hover:text-white transition">Duyệt khóa học</a>
                <a href="/courses#filters" className="hover:text-white transition">Danh mục</a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Chủ đề hot</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
                <a href="/courses" className="hover:text-white transition">Lập trình Web</a>
                <a href="/courses" className="hover:text-white transition">Trí tuệ nhân tạo</a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Hỗ trợ</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
                <a href="#" className="hover:text-white transition">Trung tâm hỗ trợ</a>
                <a href="#" className="hover:text-white transition">Điều khoản sử dụng</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-blue-200/50 lg:px-8">
            © 2026 EduFlow. Learn smarter, grow faster.
          </div>
        </footer>
      </main>
    </div>
  );
}