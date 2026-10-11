"use client";

import useSWR from "swr";
import { useState, useRef, useEffect, use, type FormEvent } from "react";
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
  ThumbsUp,
  MessageSquare,
  Send,
  Pencil,
  ChevronUp,
} from "lucide-react";

type ApiLesson = {
  id: string | number;
  name: string;
  duration?: string | number;
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
  instructorName?: string;
  categoryName?: string;
  chapters?: ApiChapter[];
};

type ReviewReply = {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string | null;
  comment: string;
  createdAt: string;
  parentId?: number | null;
  helpfulCount?: number;
  helpfulByMe?: boolean;
};

type ReviewItem = {
  id: number;
  studentId: number;
  studentName: string;
  studentAvatar?: string | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
  helpfulCount: number;
  helpfulByMe: boolean;
  editableByMe: boolean;
  replies: ReviewReply[];
};

type ReviewListResponse = {
  averageRating: number;
  reviewCount: number;
  ratingDistribution: Record<string, number>;
  reviews: ReviewItem[];
};

function formatLessonDuration(value?: string | number | null): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" || /^\d+(?:\.\d+)?$/.test(String(value).trim())) {
    const seconds = Math.max(0, Math.floor(Number(value)));
    if (!Number.isFinite(seconds) || seconds <= 0) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
      : `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }
  const raw = String(value).trim();
  const iso = raw.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (iso) {
    const seconds = Number(iso[1] || 0) * 3600 + Number(iso[2] || 0) * 60 + Number(iso[3] || 0);
    return formatLessonDuration(seconds);
  }
  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(raw)) return raw;
  return null;
}

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
  const headers: HeadersInit = {};

  if (token && token !== "null" && token !== "undefined") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, { headers }).then((response) => {
    if (!response.ok) throw new Error("Không thể tải dữ liệu");
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
  categoryName: "Lập trình Web",
  instructor: "EduFlow Instructor",
  instructorName: "EduFlow Instructor",
  chapters: [],
};

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

function Stars({ small = false, rating = 5 }: { small?: boolean; rating?: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${small ? "size-3" : "size-4"} ${star <= Math.round(rating) ? "fill-current text-amber-400" : "text-slate-200"}`}
        />
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
                            {formatLessonDuration(lesson.duration) && (
                              <span className="flex items-center gap-1 font-medium text-slate-400" title="Thời lượng bài học">
                                <Clock3 className="size-3.5 text-slate-300" />
                                {formatLessonDuration(lesson.duration)}
                              </span>
                            )}
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

const categories = [
  "Programming",
  "Web Development",
  "Database",
  "Artificial Intelligence",
  "Data Science",
  "Cyber Security",
  "General",
];

const categoryValues: Record<string, string[]> = {
  Programming: ["programming"],
  "Web Development": ["web development", "web dev"],
  Database: ["database"],
  "Artificial Intelligence": ["artificial intelligence", "ai"],
  "Data Science": ["data science"],
  "Cyber Security": ["cyber security", "security"],
  General: ["general"],
};

const categoryLabels: Record<string, string> = {
  Programming: "Lập trình",
  "Web Development": "Phát triển Web",
  Database: "Cơ sở dữ liệu",
  "Artificial Intelligence": "Trí tuệ nhân tạo",
  "Data Science": "Khoa học dữ liệu",
  "Cyber Security": "An ninh mạng",
  General: "Tổng hợp",
};

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"];
const levelLabels: Record<string, string> = {
  BEGINNER: "Sơ cấp",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Cao cấp",
  ALL_LEVELS: "Mọi trình độ",
};

function normalizeCategory(value?: string): string | null {
  if (!value) return null;
  const normalized = value.trim().toLocaleLowerCase();
  for (const category of categories) {
    const names = [category, categoryLabels[category], ...categoryValues[category]];
    if (names.some((name) => normalized === name.toLocaleLowerCase() || normalized.includes(name.toLocaleLowerCase()))) {
      return category;
    }
  }
  return null;
}

function RelatedCourses({
  courseId,
  categoryName,
}: {
  courseId: string | number;
  categoryName?: string;
}) {
  const router = useRouter();
  const { data: courses, isLoading, error } = useSWR<ApiCourse[]>(
    "http://localhost:8080/api/courses",
    fetcher,
    { revalidateOnFocus: false }
  );

  const currentCategory = normalizeCategory(categoryName);
  const related = (courses ?? [])
    .filter((item) => String(item.id) !== String(courseId))
    .filter((item) => {
      return !currentCategory || normalizeCategory(item.categoryName || item.category) === currentCategory;
    })
    .slice(0, 3);

  return (
    <section className="mt-12 border-t border-slate-200/80 pt-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Khóa học liên quan</h2>
          <p className="mt-1 text-xs text-slate-500">Các khóa học khác trên EduFlow, ưu tiên cùng danh mục</p>
        </div>
        <a href="/courses" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700">
          Xem tất cả <ArrowRight className="size-4" />
        </a>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" /> Đang tải khóa học...
        </div>
      ) : error ? (
        <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Chưa thể tải khóa học liên quan.</p>
      ) : related.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">Chưa có khóa học khác để gợi ý.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => {
            const itemId = String(item.id);
            const thumbnail = item.thumbnailUrl || item.thumbnail || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600";
            const lessonCount = (item.chapters ?? []).reduce((sum, chapter) => sum + (chapter.lessons?.length ?? 0), 0);
            const price = Number(item.price ?? 0);
            return (
              <button
                type="button"
                key={itemId}
                onClick={() => router.push(`/courses/${itemId}`)}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img src={thumbnail} alt={item.title || "Ảnh khóa học"} className="size-full object-cover transition duration-300 group-hover:scale-105" />
                  {(item.categoryName || item.category) && (
                    <span className="absolute left-3 top-3 max-w-[85%] truncate rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                      {categoryLabels[normalizeCategory(item.categoryName || item.category) || ""] || item.categoryName || item.category}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-bold text-slate-900 transition group-hover:text-blue-600">{item.title || "Khóa học"}</h3>
                  <p className="mt-2 text-xs text-slate-500">{item.instructorName || item.instructor || "Giảng viên EduFlow"}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><BookOpen className="size-3.5" /> {lessonCount} bài học</span>
                    <span>{levelLabels[levels.includes(String(item.level || "ALL_LEVELS").toUpperCase()) ? String(item.level || "ALL_LEVELS").toUpperCase() : "ALL_LEVELS"]}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className={`text-sm font-black ${price === 0 ? "text-blue-600" : "text-slate-900"}`}>
                      {price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")}đ`}
                    </span>
                    <span className="text-xs font-bold text-blue-600 group-hover:underline">Xem chi tiết</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// 🎯 HÀM HIGHLIGHT DỰA TRÊN DẤU HAI CHẤM (THUẬT TOÁN BẮT TRỌN CẢ TÊN CÓ KHOẢNG TRẮNG)
function renderCommentWithMentions(text: string) {
  if (!text) return null;

  // Nếu bình luận bắt đầu bằng dấu @
  if (text.startsWith("@")) {
    // Trường hợp 1: Có dấu : phân cách (ví dụ "@Trung Tiến: Bạn có gặp...")
    if (text.includes(":")) {
      const colonIndex = text.indexOf(":");
      const mentionPart = text.substring(0, colonIndex).trim(); // Lấy trọn vẹn "@Trung Tiến"
      const restContent = text.substring(colonIndex); // Lấy phần còn lại bao gồm ":"

      return (
        <>
          <span className="inline-block rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-700 mr-1 select-none shadow-2xs">
            {mentionPart}
          </span>
          <span className="text-slate-700 font-normal">{restContent}</span>
        </>
      );
    }

    // Trường hợp 2: Dự phòng người dùng lỡ tay xóa dấu : (bắt từ @ đến trước từ viết thường/chữ số đầu tiên)
    const match = text.match(/^(@[^\n\r]+?)(?=\s+[\p{Ll}0-9!?,.]|\s*$)/u);
    if (match) {
      const mentionPart = match[1].trim();
      const restContent = text.slice(match[1].length);

      return (
        <>
          <span className="inline-block rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-bold text-blue-700 mr-1 select-none shadow-2xs">
            {mentionPart}
          </span>
          <span className="text-slate-700 font-normal">{restContent}</span>
        </>
      );
    }
  }

  return <span className="text-slate-700 font-normal">{text}</span>;
}

// COMPONENT ĐỆ QUY HIỂN THỊ CÂY CÂU TRẢ LỜI LỒNG NHAU (TREE ITEM)
function ReplyNode({
  reply,
  allReplies,
  reviewId,
  depth = 0,
  onReplyClick,
  onToggleHelpful,
  helpfulBusyId,
}: {
  reply: ReviewReply;
  allReplies: ReviewReply[];
  reviewId: number;
  depth?: number;
  onReplyClick: (reviewId: number, parentId: number, targetUserName: string) => void;
  onToggleHelpful: (replyId: number) => void;
  helpfulBusyId: number | null;
}) {
  const [openChildBranch, setOpenChildBranch] = useState(false);

  const childReplies = allReplies.filter((r) => r.parentId === reply.id);
  const initials = reply.userName?.trim().split(/\s+/).slice(-2).map((p) => p[0]).join("").toUpperCase() || "HV";

  const indentClass =
    depth === 0
      ? ""
      : depth === 1
      ? "ml-3 sm:ml-5 border-l-2 border-blue-200 pl-2.5 sm:pl-3"
      : "ml-2 sm:ml-3 border-l border-slate-200 pl-2";

  return (
    <div className={`mt-2.5 ${indentClass}`}>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition hover:border-blue-200">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {reply.userAvatar ? (
              <img
                src={reply.userAvatar}
                alt={reply.userName}
                className="size-7 rounded-xl object-cover ring-2 ring-blue-50"
              />
            ) : (
              <div className="flex size-7 items-center justify-center rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-[10px] font-bold text-white shadow-2xs">
                {initials}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-slate-800">{reply.userName || "Học viên"}</p>
              <p className="text-[10px] text-slate-400">
                {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString("vi-VN") : ""}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
          {renderCommentWithMentions(reply.comment)}
        </p>

        <div className="mt-2.5 flex items-center gap-3 border-t border-slate-100 pt-2 text-[11px]">
          <button
            type="button"
            onClick={() => onToggleHelpful(reply.id)}
            disabled={helpfulBusyId === reply.id}
            className={`flex items-center gap-1 font-semibold transition cursor-pointer disabled:opacity-50 ${
              reply.helpfulByMe ? "text-blue-600 font-bold" : "text-slate-500 hover:text-blue-600"
            }`}
          >
            {helpfulBusyId === reply.id ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <ThumbsUp className={`size-3 ${reply.helpfulByMe ? "fill-current" : ""}`} />
            )}
            Hữu ích ({reply.helpfulCount || 0})
          </button>

          <button
            type="button"
            onClick={() => onReplyClick(reviewId, reply.id, reply.userName)}
            className="flex items-center gap-1 font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer"
          >
            <MessageCircle className="size-3" />
            Trả lời
          </button>

          {childReplies.length > 0 && (
            <button
              type="button"
              onClick={() => setOpenChildBranch(!openChildBranch)}
              className="ml-auto flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
            >
              {openChildBranch ? "Thu gọn" : `Xem ${childReplies.length} câu trả lời`}
              {openChildBranch ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>
          )}
        </div>
      </div>

      {childReplies.length > 0 && openChildBranch && (
        <div className="space-y-1">
          {childReplies.map((child) => (
            <ReplyNode
              key={child.id}
              reply={child}
              allReplies={allReplies}
              reviewId={reviewId}
              depth={depth + 1}
              onReplyClick={onReplyClick}
              onToggleHelpful={onToggleHelpful}
              helpfulBusyId={helpfulBusyId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Reviews({
  courseId,
  isLoggedIn,
  isEnrolled,
  authHref,
  showToast,
  data,
  refresh,
}: {
  courseId: string | number;
  isLoggedIn: boolean;
  isEnrolled: boolean;
  authHref: string;
  showToast: (msg: string, type?: "success" | "error") => void;
  data?: ReviewListResponse;
  refresh: () => Promise<unknown>;
}) {
  const router = useRouter();
  const replyInputRef = useRef<HTMLInputElement>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replyFormOpenFor, setReplyFormOpenFor] = useState<number | null>(null);
  const [targetParentId, setTargetParentId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  const [openReplyList, setOpenReplyList] = useState<Record<number, boolean>>({});
  const [helpfulBusy, setHelpfulBusy] = useState<number | null>(null);
  const [replyHelpfulBusy, setReplyHelpfulBusy] = useState<number | null>(null);

  const ownReview = data?.reviews?.find((review) => review.editableByMe);

  const toggleReplyList = (reviewId: number) => {
    setOpenReplyList((prev) => ({ ...prev, [reviewId]: !prev[reviewId] }));
  };

  const handleReplyClick = (reviewId: number, parentId?: number | null, targetUserName?: string) => {
    if (!isLoggedIn) {
      showToast("Vui lòng đăng nhập để trả lời.", "error");
      router.push(authHref);
      return;
    }
    if (!isEnrolled) {
      showToast("Bạn cần đăng ký khóa học để tham gia trả lời.", "error");
      return;
    }

    setReplyFormOpenFor(reviewId);
    setTargetParentId(parentId ?? null);

    if (targetUserName) {
      // 🎯 QUAN TRỌNG: Tự động thêm dấu hai chấm : ngay sau tên
      const mentionText = `@${targetUserName}: `;
      setReplyDrafts((prev) => ({
        ...prev,
        [reviewId]: prev[reviewId]?.startsWith(mentionText) ? prev[reviewId] : `${mentionText}${prev[reviewId] || ""}`,
      }));
    }

    setTimeout(() => {
      replyInputRef.current?.focus();
    }, 50);
  };

  const openReviewForm = () => {
    if (!isLoggedIn) {
      showToast("Vui lòng đăng nhập để viết đánh giá.", "error");
      router.push(authHref);
      return;
    }
    if (!isEnrolled) {
      showToast("Bạn cần đăng ký khóa học trước khi đánh giá.", "error");
      return;
    }
    setEditingReviewId(ownReview?.id ?? null);
    setRating(ownReview?.rating ?? 5);
    setComment(ownReview?.comment ?? "");
    setFormOpen(true);
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(authHref);
      return;
    }
    setSaving(true);
    try {
      const url = editingReviewId
        ? `http://localhost:8080/api/courses/${courseId}/reviews/${editingReviewId}`
        : `http://localhost:8080/api/courses/${courseId}/reviews`;
      const response = await fetch(url, {
        method: editingReviewId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment: comment.trim() }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || body?.detail || `Không thể lưu đánh giá (HTTP ${response.status}).`);
      await refresh();
      setFormOpen(false);
      showToast(editingReviewId ? "Đã cập nhật đánh giá." : "Đã gửi đánh giá.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể lưu đánh giá.", "error");
    } finally {
      setSaving(false);
    }
  };

  const submitReply = async (event: FormEvent<HTMLFormElement>, reviewId: number) => {
    event.preventDefault();
    const text = (replyDrafts[reviewId] ?? "").trim();
    if (!text) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(authHref);
      return;
    }

    setReplyingTo(reviewId);
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${reviewId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: text, parentId: targetParentId }),
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || body?.detail || `Không thể gửi trả lời.`);

      setReplyDrafts((current) => ({ ...current, [reviewId]: "" }));
      setReplyFormOpenFor(null);
      setTargetParentId(null);
      setOpenReplyList((prev) => ({ ...prev, [reviewId]: true }));

      await refresh();
      showToast("Đã gửi câu trả lời.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể gửi trả lời.", "error");
    } finally {
      setReplyingTo(null);
    }
  };

  const toggleReplyHelpful = async (replyId: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      showToast("Vui lòng đăng nhập để đánh dấu hữu ích.", "error");
      router.push(authHref);
      return;
    }

    setReplyHelpfulBusy(replyId);
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/replies/${replyId}/helpful`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Lỗi cập nhật lượt hữu ích.");
      await refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Không thể cập nhật lượt hữu ích.", "error");
    } finally {
      setReplyHelpfulBusy(null);
    }
  };

  const toggleHelpful = async (review: ReviewItem) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      showToast("Vui lòng đăng nhập để đánh dấu hữu ích.", "error");
      router.push(authHref);
      return;
    }

    setHelpfulBusy(review.id);
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${review.id}/helpful`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Lỗi cập nhật lượt hữu ích.");
      await refresh();
    } catch (error) {
      showToast("Không thể cập nhật lượt hữu ích.", "error");
    } finally {
      setHelpfulBusy(null);
    }
  };

  const count = data?.reviewCount ?? 0;
  const average = data?.averageRating ?? 0;
  const distribution = data?.ratingDistribution ?? {};

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Đánh giá của học viên</h2>
          <p className="mt-0.5 text-xs text-slate-500">Đánh giá trực tiếp từ học viên EduFlow</p>
        </div>
        <button type="button" onClick={openReviewForm} className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-200 transition hover:bg-orange-700">
          <Star className="size-4 fill-current" /> {ownReview ? "Sửa đánh giá của bạn" : "Viết đánh giá"}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={submitReview} className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <h3 className="font-bold text-slate-900">{editingReviewId ? "Chỉnh sửa đánh giá" : "Đánh giá khóa học"}</h3>
          <div className="mt-3 flex items-center gap-1" role="radiogroup" aria-label="Chọn số sao">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)} aria-label={`${star} sao`} aria-pressed={rating === star} className="rounded-md p-1 transition hover:scale-110">
                <Star className={`size-7 ${star <= rating ? "fill-current text-amber-400" : "text-slate-300"}`} />
              </button>
            ))}
            <span className="ml-2 text-sm font-bold text-slate-700">{rating}/5</span>
          </div>
          <label className="mt-3 block text-xs font-semibold text-slate-700" htmlFor="course-review-comment">Nhận xét (không bắt buộc)</label>
          <textarea id="course-review-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={5000} rows={4} placeholder="Chia sẻ trải nghiệm học tập của bạn..." className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Hủy</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60">
              {saving && <Loader2 className="size-3.5 animate-spin" />} {saving ? "Đang lưu..." : "Lưu đánh giá"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 grid gap-6 sm:grid-cols-[140px_1fr]">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <p className="text-4xl font-black text-slate-900">{count ? average.toFixed(1) : "—"}</p>
          <div className="mt-1"><Stars rating={average} /></div>
          <p className="mt-1 text-center text-[11px] font-semibold text-amber-700">{count} đánh giá</p>
        </div>
        <div className="flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const amount = Number(distribution[String(star)] ?? 0);
            const percentage = count > 0 ? Math.round((amount / count) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2.5 text-xs text-slate-500">
                <span className="w-10 text-right font-bold text-slate-600">{star} sao</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${percentage}%` }} /></div>
                <span className="w-10 text-right font-medium">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {!data ? (
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
            <Loader2 className="size-4 animate-spin" /> Đang tải đánh giá...
          </div>
        ) : data.reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Chưa có đánh giá nào.
          </div>
        ) : (
          data.reviews.map((review) => {
            const initials = review.studentName?.trim().split(/\s+/).slice(-2).map((p) => p[0]).join("").toUpperCase() || "HV";
            const isReplyListOpen = Boolean(openReplyList[review.id]);

            const rootReplies = review.replies?.filter((r) => !r.parentId) || [];

            return (
              <article key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {review.studentAvatar ? (
                      <img src={review.studentAvatar} alt={review.studentName} className="size-9 rounded-xl object-cover" />
                    ) : (
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-slate-900">{review.studentName || "Học viên"}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Stars small rating={review.rating} />
                        <span className="text-[10px] text-slate-400">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString("vi-VN") : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.editableByMe && <button type="button" onClick={openReviewForm} className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-50"><Pencil className="size-3" /> Sửa</button>}
                </div>

                {review.comment && (
                  <div className="mt-3 text-sm leading-relaxed text-slate-700">
                    {renderCommentWithMentions(review.comment)}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200/70 pt-3">
                  <button
                    type="button"
                    onClick={() => void toggleHelpful(review)}
                    disabled={helpfulBusy === review.id}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
                      review.helpfulByMe ? "bg-blue-100 text-blue-700 font-bold" : "text-slate-500 hover:bg-slate-200/60 hover:text-blue-600"
                    }`}
                  >
                    {helpfulBusy === review.id ? <Loader2 className="size-3.5 animate-spin" /> : <ThumbsUp className={`size-3.5 ${review.helpfulByMe ? "fill-current" : ""}`} />}
                    Hữu ích ({review.helpfulCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReplyClick(review.id, null)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200/60 hover:text-blue-600 transition cursor-pointer"
                  >
                    <MessageCircle className="size-3.5" />
                    Trả lời
                  </button>

                  {review.replies?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleReplyList(review.id)}
                      className="ml-auto flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
                    >
                      <MessageSquare className="size-3.5" />
                      {isReplyListOpen ? "Ẩn câu trả lời" : `Xem ${review.replies.length} câu trả lời`}
                      {isReplyListOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                    </button>
                  )}
                </div>

                {replyFormOpenFor === review.id && (
                  <form onSubmit={(event) => void submitReply(event, review.id)} className="mt-3 flex gap-2 animate-in fade-in duration-200">
                    <input
                      ref={replyInputRef}
                      value={replyDrafts[review.id] ?? ""}
                      onChange={(event) => setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))}
                      maxLength={5000}
                      placeholder="Viết câu trả lời của bạn..."
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="submit"
                      disabled={replyingTo === review.id || !(replyDrafts[review.id] ?? "").trim()}
                      className="flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-3.5 text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      {replyingTo === review.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyFormOpenFor(null);
                        setTargetParentId(null);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                  </form>
                )}

                {review.replies?.length > 0 && isReplyListOpen && (
                  <div className="mt-3 space-y-2">
                    {rootReplies.map((rootReply) => (
                      <ReplyNode
                        key={rootReply.id}
                        reply={rootReply}
                        allReplies={review.replies}
                        reviewId={review.id}
                        depth={0}
                        onReplyClick={handleReplyClick}
                        onToggleHelpful={toggleReplyHelpful}
                        helpfulBusyId={replyHelpfulBusy}
                      />
                    ))}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
      {!isEnrolled && isLoggedIn && <p className="mt-4 text-xs text-slate-500">Đăng ký khóa học để viết đánh giá hoặc trả lời đánh giá.</p>}
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
    let cancelled = false;
    setIsEnrolled(false);
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
          if (!cancelled) setIsEnrolled(Boolean(data?.isEnrolled ?? data?.enrolled ?? data?.exists));
        })
        .catch(() => { if (!cancelled) setIsEnrolled(false); });
    } else {
      setIsLoggedIn(false);
    }
    return () => { cancelled = true; };
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

  const { data: reviewsData, mutate: mutateReviews } = useSWR<ReviewListResponse>(
    `http://localhost:8080/api/courses/${resolvedParams.id}/reviews`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const { data: enrollmentCountData, error: enrollmentCountError, mutate: mutateEnrollmentCount } = useSWR<number | { enrollmentCount?: number; count?: number }>(
    `http://localhost:8080/api/courses/${resolvedParams.id}/enrollment-count`,
    fetcher,
    { revalidateOnFocus: true, refreshInterval: 15000 }
  );

  const enrollmentCount = typeof enrollmentCountData === "number"
    ? enrollmentCountData
    : enrollmentCountData?.enrollmentCount ?? enrollmentCountData?.count;

  const enrollmentCountLabel = enrollmentCount !== undefined
    ? `${enrollmentCount.toLocaleString("vi-VN")} học viên`
    : enrollmentCountError
      ? "Chưa tải được số học viên"
      : "Đang tải số học viên...";

  const course = { ...fallbackCourse, ...(data ?? {}) };
  const courseChapters = course.chapters || [];

  const outcomesList = course.outcomes
    ? course.outcomes.split("\n").filter((item) => item.trim().length > 0)
    : [];

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
        await mutateEnrollmentCount();
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
            await mutateEnrollmentCount();
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
                    <Stars rating={reviewsData?.averageRating ?? 0} />
                    <strong className="text-slate-800 font-bold">{reviewsData?.reviewCount ? reviewsData.averageRating.toFixed(1) : "—"}</strong>
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                    <Users className="size-4 text-blue-600" /> {enrollmentCountLabel}
                  </span>
                </div>
              </div>

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

              <div className="mt-10">
                <Reviews
                  courseId={resolvedParams.id}
                  isLoggedIn={isLoggedIn}
                  isEnrolled={isEnrolled}
                  authHref={authHref}
                  showToast={showToast}
                  data={reviewsData}
                  refresh={() => mutateReviews()}
                />
              </div>

              <RelatedCourses
                courseId={resolvedParams.id}
                categoryName={course.categoryName || course.category}
              />
            </div>

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