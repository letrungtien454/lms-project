"use client";

import useSWR from "swr";
import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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

type ApiCourse = {
  id?: string | number;
  title?: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  category?: string;
  instructor?: string;
};

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error("Không thể tải khóa học");
    return response.json();
  });

const fallbackCourse: Required<ApiCourse> = {
  id: "1",
  title: "Responsive Với Grid System",
  description:
    "Trong khóa này chúng ta sẽ học về cách xây dựng giao diện web responsive với Grid System, tương tự Bootstrap 4.",
  price: 0,
  thumbnail: "",
  category: "Lập trình Web",
  instructor: "Nguyễn Văn An",
};

// Dữ liệu mẫu các Khóa học liên quan
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

const outcomes = [
  "Biết cách xây dựng website Responsive chuẩn chỉnh",
  "Hiểu được tư tưởng thiết kế với Grid system hiện đại",
  "Tự tay xây dựng được thư viện CSS Grid cá nhân",
  "Tự hiểu và làm chủ Grid layout trong Bootstrap",
];

const chapters = [
  {
    title: "Bắt đầu",
    lessons: [
      { id: "1.1", name: "Responsive là gì?", duration: "07:28", preview: true },
      { id: "1.2", name: "Chúng ta sẽ làm gì?", duration: "01:58", preview: true },
      { id: "1.3", name: "Chuẩn bị công cụ làm việc", duration: "03:55", preview: false },
    ],
  },
  {
    title: "Viewport, @media, breakpoint",
    lessons: [
      { id: "2.1", name: "Tìm hiểu viewport", duration: "12:20", preview: false },
      { id: "2.2", name: "Media query trong CSS", duration: "15:10", preview: false },
      { id: "2.3", name: "Responsive thực chiến", duration: "18:40", preview: false },
      { id: "2.4", name: "Bài tập tổng hợp", duration: "10:25", preview: false },
    ],
  },
  {
    title: "Thực hành nhỏ",
    lessons: [
      { id: "3.1", name: "Xây dựng layout responsive", duration: "22:12", preview: false },
      { id: "3.2", name: "Hoàn thiện giao diện", duration: "16:30", preview: false },
    ],
  },
  {
    title: "Grid system",
    lessons: [
      { id: "4.1", name: "Tư duy Grid system", duration: "18:05", preview: false },
      { id: "4.2", name: "Các cột và hàng", duration: "20:15", preview: false },
    ],
  },
];

const initialReviews = [
  {
    name: "Hoàng Nguyễn Văn",
    initials: "HV",
    text: "Khóa học giúp mình hiểu rõ hơn về kiến thức mạng máy tính cơ bản, từ cách DNS phân giải tên miền, TCP, HTTPS đến các công cụ kiểm tra mạng. Rất phù hợp cho người mới!",
    rating: 5,
    title: "Khóa học dễ hiểu và thực tế",
    verified: true,
  },
  {
    name: "Nguyễn Minh Anh",
    initials: "MA",
    text: "Nội dung rất thực tế, giảng viên giải thích rõ ràng và dễ áp dụng.",
    rating: 5,
    title: "Tuyệt vời",
    verified: true,
  },
  {
    name: "Trần Quốc Bảo",
    initials: "QB",
    text: "Lộ trình học được sắp xếp tốt. Mình đã tự tin hơn rất nhiều.",
    rating: 5,
    title: "Bài giảng chất lượng",
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
}: {
  collapsed: boolean;
  onToggle: () => void;
  isLoggedIn: boolean;
  user: any;
  onLogout: () => void;
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
          <a className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition" href="/">
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
                <span className="text-xs font-bold text-slate-700 max-w-[130px] truncate">
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
                        router.push("/student/certificates");
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left cursor-pointer"
                    >
                      <Award className="size-4 text-slate-400" />
                      Chứng chỉ của tôi
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
                href="/auth"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 transition"
              >
                Đăng ký
              </a>
              <a
                href="/auth"
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
  isEnrolled,
  onEnroll,
}: {
  courseId: string | number;
  isEnrolled: boolean;
  onEnroll: () => void;
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

  const handleLessonClick = (lesson: any) => {
    if (lesson.preview || isEnrolled) {
      router.push(`/learning/${courseId}?lesson=${lesson.id}`);
    } else {
      onEnroll();
    }
  };

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Nội dung khóa học
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {chapters.length} chương <span className="mx-1">•</span>{" "}
            {chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)} bài học{" "}
            <span className="mx-1">•</span> 06 giờ 44 phút thời lượng
          </p>
        </div>

        <button
          onClick={toggleAll}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
        >
          {isAllExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {chapters.map((chapter, index) => {
          const isOpen = openChapters.includes(index);
          return (
            <div key={chapter.title} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              <button
                onClick={() => toggleChapter(index)}
                className="flex w-full items-center justify-between gap-4 bg-slate-50/70 px-5 py-3.5 text-left hover:bg-blue-50/50 transition cursor-pointer"
              >
                <span className="flex items-center gap-3 text-sm font-bold text-slate-800">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-blue-100 text-xs text-blue-700 font-extrabold">
                    {index + 1}
                  </span>
                  {chapter.title}
                </span>
                <span className="text-xs text-slate-500 font-medium">{chapter.lessons.length} bài học</span>
              </button>

              {isOpen && (
                <div className="divide-y divide-slate-100 border-t border-slate-100">
                  {chapter.lessons.map((lesson) => (
                    <div
                      key={lesson.name}
                      onClick={() => handleLessonClick(lesson)}
                      className="flex cursor-pointer items-center justify-between gap-4 px-6 py-3 text-xs hover:bg-blue-50/30 transition group"
                    >
                      <span className="flex min-w-0 items-center gap-3 font-medium text-slate-700 group-hover:text-blue-600 transition">
                        <span className="flex size-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                          <Video className="size-3.5 shrink-0" />
                        </span>
                        <span className="truncate">{lesson.name}</span>
                      </span>

                      <span className="flex shrink-0 items-center gap-2.5 text-slate-500">
                        {lesson.preview ? (
                          <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 shadow-2xs">
                            Xem trước
                          </span>
                        ) : (
                          !isEnrolled && <Lock className="size-3.5 text-slate-400" />
                        )}
                        <span className="font-medium text-slate-400">{lesson.duration}</span>
                        <Clock3 className="size-3.5 text-slate-300" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EnrollmentCard({
  course,
  isEnrolled,
  isEnrolling,
  onEnroll,
}: {
  course: Required<ApiCourse>;
  isEnrolled: boolean;
  isEnrolling: boolean;
  onEnroll: () => void;
}) {
  const original = course.price * 2 || 800000;
  const isFree = course.price === 0;
  const defaultImage = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600";
  const courseImage = course.thumbnail || defaultImage;

  const buttonText = isEnrolling
    ? "Đang xử lý..."
    : isEnrolled
    ? "TIẾP TỤC HỌC"
    : isFree
    ? "BẮT ĐẦU HỌC"
    : "ĐĂNG KÝ HỌC";

  return (
    <aside className="w-full max-w-[340px] shrink-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xl shadow-slate-200/50 lg:sticky lg:top-22">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-900 group">
        <img
          src={courseImage}
          alt="Ảnh bìa khóa học"
          className="absolute inset-0 size-full object-cover opacity-85 transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
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
            {isFree ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")}đ`}
          </span>
          {!isFree && (
            <span className="text-xs text-slate-400 line-through">
              {original.toLocaleString("vi-VN")}đ
            </span>
          )}
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
        <span className="flex items-center gap-2.5"><Code2 className="size-4 text-blue-600 shrink-0" /> Trình độ cơ bản</span>
        <span className="flex items-center gap-2.5"><BookOpen className="size-4 text-blue-600 shrink-0" /> Tổng số 36 bài học</span>
        <span className="flex items-center gap-2.5"><Clock3 className="size-4 text-blue-600 shrink-0" /> Thời lượng 06 giờ 44 phút</span>
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

function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: { rating: number; title: string; text: string }) => void;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Đánh giá khóa học</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Chọn mức độ hài lòng *</label>
            <div className="mt-1 flex gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition cursor-pointer"
                >
                  <Star className={`size-7 ${star <= rating ? "fill-current" : "text-slate-200"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Tiêu đề đánh giá (Tùy chọn)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt trải nghiệm của bạn..."
              className="mt-1 h-9.5 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Nội dung nhận xét</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Chia sẻ suy nghĩ của bạn về lộ trình khóa học này..."
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">
            Hủy
          </button>
          <button
            onClick={() => {
              onSubmit({ rating, title, text });
              onClose();
            }}
            className="rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-700 transition cursor-pointer"
          >
            Đăng đánh giá
          </button>
        </div>
      </div>
    </div>
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
          <p className="mt-0.5 text-xs text-slate-500">67% đánh giá đã được xác minh học viên</p>
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
          <p className="mt-1 text-[11px] font-semibold text-amber-700">3 đánh giá</p>
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

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const router = useRouter();

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);

      // Lấy thông tin user
      fetch("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser(data);
        })
        .catch(() => {});

      // Kiểm tra trạng thái đã đăng ký khóa học này chưa
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

  // NÚT ĐĂNG KÝ HỌC NGAY - ĐÃ SỬA LỖI JSON RỖNG
  const handleEnroll = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      showToast("Vui lòng đăng nhập để đăng ký khóa học!", "error");
      router.push("/auth");
      return;
    }

    if (isEnrolled) {
      router.push(`/learning/${course.id || resolvedParams.id}`);
      return;
    }

    setIsEnrolling(true);

    try {
      const res = await fetch(`http://localhost:8080/api/enrollments/${resolvedParams.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // 1. Nếu thành công (Status 200/201), chuyển hướng ngay bất kể Server có trả về body hay không
      if (res.ok) {
        showToast("Đăng ký khóa học thành công!", "success");
        setIsEnrolled(true);
        router.push(`/learning/${course.id || resolvedParams.id}`);
        return;
      }

      // 2. Trường hợp thất bại, đọc text trước để tránh đâm crash do JSON rỗng
      const text = await res.text();
      let errorMessage = "Đăng ký thất bại!";

      if (text) {
        try {
          const data = JSON.parse(text);
          if (data.message === "Bạn đã đăng ký khóa học này rồi!") {
            setIsEnrolled(true);
            router.push(`/learning/${course.id || resolvedParams.id}`);
            return;
          }
          if (data.message) errorMessage = data.message;
        } catch {
          // Nếu không parse được JSON thì dùng nguyên chuỗi text
          errorMessage = text;
        }
      }

      showToast(errorMessage, "error");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      showToast("Có lỗi xảy ra khi kết nối máy chủ!", "error");
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleOpenReviewModal = () => {
    if (!isLoggedIn) {
      showToast("Vui lòng đăng nhập để viết đánh giá!", "error");
      router.push("/auth");
      return;
    }
    if (!isEnrolled) {
      showToast("Bạn cần Bắt đầu / Đăng ký khóa học để viết đánh giá!", "error");
      return;
    }
    setReviewModalOpen(true);
  };

  return (
    <div className="flex min-h-screen w-screen flex-col bg-[#f8fbff] text-slate-900">
      <Header
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
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
              <div className="rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-transparent p-6 border border-blue-100/60 shadow-xs">
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
                    <span className="text-slate-400">(3 đánh giá)</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-2xs">
                    <Users className="size-4 text-blue-600" /> 48.742 học viên
                  </span>
                </div>
              </div>

              {/* Khối Bạn sẽ học được gì */}
              <div className="mt-8 rounded-2xl bg-blue-50/60 border border-blue-100 p-6">
                <h2 className="text-lg font-bold text-[#17305f] flex items-center gap-2">
                  <Check className="size-5 text-blue-600" /> Bạn sẽ học được gì?
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {outcomes.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-xs text-slate-700 font-semibold">
                      <span className="flex size-4 items-center justify-center rounded-full bg-blue-600 text-white shrink-0 mt-0.5">
                        <Check className="size-2.5" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <Curriculum
                  courseId={course.id || resolvedParams.id}
                  isEnrolled={isEnrolled}
                  onEnroll={handleEnroll}
                />
              </div>

              {/* Khối Yêu cầu & Mô tả khóa học */}
              <div className="mt-10 flex flex-col gap-6">
                <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-6">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                      <HelpCircle className="size-4" />
                    </span>
                    Yêu cầu khóa học
                  </h2>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    Bạn chỉ cần có máy tính kết nối Internet và tinh thần ham học hỏi. Không yêu cầu kinh nghiệm lập trình trước đó.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50/80 border border-slate-200/80 p-6">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <FileText className="size-4" />
                    </span>
                    Mô tả khóa học
                  </h2>
                  <p className="mt-3 text-xs leading-relaxed text-slate-600">
                    Khóa học cung cấp lộ trình thực tế, đi từ nền tảng đến xây dựng giao diện responsive hoàn chỉnh với các bài tập trực quan.
                  </p>
                </div>
              </div>

              {/* Đánh giá của học viên */}
              <div className="mt-10">
                <Reviews onOpenReviewModal={handleOpenReviewModal} />
              </div>

              {/* Khóa học liên quan */}
              <RelatedCourses />
            </div>

            {/* Cột Bên phải */}
            <EnrollmentCard
              course={course}
              isEnrolled={isEnrolled}
              isEnrolling={isEnrolling}
              onEnroll={handleEnroll}
            />
          </div>
        </div>

        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={(newReview) => {
            showToast("Cảm ơn bạn đã đăng đánh giá cho khóa học!");
          }}
        />

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