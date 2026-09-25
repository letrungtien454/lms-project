"use client";

import useSWR from "swr";
import { useState, useRef, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  Bell,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  GraduationCap,
  Home,
  LogOut,
  Moon,
  PanelLeft,
  Search,
  Star,
  Sun,
  Target,
  UserRound,
  Video,
  X,
  Menu,
  MessageCircle,
  Lock,
  Bot,
  Download,
  Send,
  FileText,
  HelpCircle,
  Play,
  Sparkles,
  ChevronRight,
  Maximize2,
  CheckCircle2,
} from "lucide-react";

type ApiCourse = {
  id?: string | number;
  title?: string;
  description?: string;
};

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error("Không thể tải thông tin bài học");
    return response.json();
  });

const chapters = [
  {
    title: "Chương 1: Java cơ bản",
    lessons: [
      { id: "1.1", name: "Bài 1: Giới thiệu Java", duration: "05:20", preview: true, completed: true },
      { id: "1.2", name: "Bài 2: Cấu trúc chương trình", duration: "10:15", preview: true, completed: true },
    ],
  },
  {
    title: "Chương 2: OOP",
    lessons: [
      { id: "2.1", name: "Bài 1: Class và Object", duration: "12:45", preview: true, completed: true },
      { id: "2.2", name: "Bài 2: Kế thừa", duration: "14:30", preview: true, completed: false },
    ],
  },
  {
    title: "Chương 3: Lập trình hướng đối tượng",
    lessons: [
      { id: "3.1", name: "Bài 1: Interface & Abstract Class", duration: "15:02", preview: true, completed: false },
      { id: "3.2", name: "Bài 2: Đa hình (Polymorphism)", duration: "18:20", preview: false, completed: false },
      { id: "3.3", name: "Bài 3: Encapsulation", duration: "11:10", preview: false, completed: false },
    ],
  },
  {
    title: "Chương 4: Exception Handling",
    lessons: [
      { id: "4.1", name: "Bài 1: Try Catch & Finally", duration: "09:40", preview: false, completed: false },
    ],
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
    <a href="/" className="flex items-center gap-2.5">
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
            >
              <PanelLeft className="size-5" />
            </button>
          )}
        </div>

        <nav className="hidden items-center gap-6 lg:flex shrink-0">
          <a className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition" href="/">Trang chủ</a>
          <a className="text-xs font-bold text-blue-600" href="/courses">Khóa học</a>
          <a className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition" href="/courses#filters">Danh mục</a>
        </nav>

        <div className="hidden max-w-sm flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              placeholder="Tìm khóa học, bài giảng..."
            />
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex shrink-0">
          <button
            onClick={() => setIsDark(!isDark)}
            className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
          >
            {isDark ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4" />}
          </button>

          {isLoggedIn ? (
            <div className="relative flex items-center gap-2 pl-2" ref={dropdownRef}>
              <button className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer">
                <Bell className="size-4" />
              </button>

              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-1.5 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-sm">
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
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || user?.username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || "student@eduflow.com"}</p>
                  </div>
                  <div className="flex flex-col gap-0.5 text-xs text-slate-600 font-medium">
                    <button onClick={() => router.push("/student/dashboard")} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left cursor-pointer">
                      <UserRound className="size-4 text-slate-400" /> Hồ sơ của tôi
                    </button>
                    <button onClick={() => router.push("/student/certificates")} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left cursor-pointer">
                      <Award className="size-4 text-slate-400" /> Chứng chỉ của tôi
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-50 transition text-left font-semibold cursor-pointer">
                      <LogOut className="size-4 text-red-500" /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <a href="/auth" className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 transition">Đăng ký</a>
              <a href="/auth" className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition">Đăng nhập</a>
            </div>
          )}
        </div>

        <button className="rounded-xl p-2 text-slate-600 lg:hidden cursor-pointer" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
    </header>
  );
}

function AppSidebar({ collapsed, activeTab, setActiveTab }: { collapsed: boolean; activeTab: string | null; setActiveTab: (tab: string) => void }) {
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
    <aside className={`fixed left-0 top-17.5 z-40 hidden h-[calc(100vh-70px)] shrink-0 border-r border-slate-200/80 bg-white/95 px-3 py-5 shadow-sm backdrop-blur-xl overflow-y-auto md:block transition-all duration-300 ${collapsed ? "w-19" : "w-64"}`}>
      <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 ${collapsed ? "sr-only" : ""}`}>
        Không gian làm việc
      </p>
      <nav className="flex flex-col gap-1.5">
        {items.map(([label, Icon, path]) => (
          <button
            key={label}
            onClick={() => { setActiveTab(label); router.push(path); }}
            className={`group relative flex w-full items-center rounded-xl py-3 text-sm font-semibold transition shrink-0 cursor-pointer ${collapsed ? "justify-center px-0" : "gap-3 px-3"} ${activeTab === label ? (collapsed ? "text-blue-700" : "border-l-4 border-blue-600 bg-blue-50/80 text-blue-700 font-bold") : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}
          >
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${activeTab === label ? (collapsed ? "bg-blue-100 text-blue-600" : "bg-blue-600 text-white shadow-xs") : "bg-slate-100/80 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"}`}>
              <Icon className="size-4 shrink-0" />
            </span>
            <span className={collapsed ? "sr-only" : "truncate"}>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

// Modal Popup Yêu cầu Đăng ký khi chọn bài học bị khóa
function LockModal({ isOpen, onClose, onRegister }: { isOpen: boolean; onClose: () => void; onRegister: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Lock className="size-7" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Bài học này đã bị khóa!</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Bạn đã xem hết danh sách bài học thử. Vui lòng Đăng ký / Bắt đầu khóa học để mở khóa trọn bộ bài giảng và thực hành cùng AI Tutor.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Xem lại bài trước
          </button>
          <button onClick={onRegister} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700">
            Đăng ký học ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeLesson, setActiveLesson] = useState(searchParams.get("lesson") || "3.1");
  const [currentTab, setCurrentTab] = useState<"video" | "docs" | "code" | "quiz" | "discuss">("video");
  const [aiOpen, setAiOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);

  // Quiz state
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      fetch("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => { if (data) setUser(data); })
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleSelectLesson = (lesson: any) => {
    if (lesson.preview || isEnrolled) {
      setActiveLesson(lesson.id);
    } else {
      setLockModalOpen(true);
    }
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

      {/* Banner thông báo xem thử */}
      {!isEnrolled && (
        <div className={`bg-blue-600 text-white text-xs font-semibold py-2 px-5 text-center flex items-center justify-center gap-2 transition-all ${isLoggedIn ? (collapsed ? "md:pl-19" : "md:pl-64") : "pl-0"}`}>
          <Sparkles className="size-4 text-amber-300" />
          <span>Bạn đang trong chế độ học thử bài giảng.</span>
          <button onClick={() => setIsEnrolled(true)} className="underline font-bold hover:text-amber-200 cursor-pointer">
            Đăng ký khóa học ngay
          </button>
        </div>
      )}

      <main className={`flex-1 transition-all duration-300 ${isLoggedIn ? (collapsed ? "md:pl-19" : "md:pl-64") : "pl-0"}`}>
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
          
          {/* Tiến độ khóa học */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="text-blue-600">Khóa học</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span>Java Full Stack</span>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-500">Chương 3: Lập trình hướng đối tượng</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600">Tiến độ khóa học:</span>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: "45%" }} />
              </div>
              <span className="text-xs font-extrabold text-blue-600">45%</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            
            {/* Cột Bên Trái: Sidebar Bài học */}
            <aside className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs h-fit">
              <h2 className="text-sm font-bold text-slate-900 mb-3 px-1">Danh sách bài học</h2>
              <div className="flex flex-col gap-3">
                {chapters.map((chapter) => (
                  <div key={chapter.title} className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider">{chapter.title}</p>
                    {chapter.lessons.map((lesson) => {
                      const isActive = activeLesson === lesson.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition cursor-pointer text-left ${
                            isActive
                              ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            {lesson.completed ? (
                              <CheckCircle2 className={`size-3.5 shrink-0 ${isActive ? "text-white" : "text-emerald-500"}`} />
                            ) : (
                              <Video className={`size-3.5 shrink-0 ${isActive ? "text-white" : "text-blue-600"}`} />
                            )}
                            <span className="truncate">{lesson.name}</span>
                          </span>
                          {!lesson.preview && !isEnrolled && (
                            <Lock className={`size-3 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </aside>

            {/* Khhu Vực Chính: Video & Nội Dung Bài Học */}
            <div className="flex flex-col gap-6 min-w-0">
              
              {/* Tiêu đề & Chuyển Tab */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <h1 className="text-xl font-black text-[#17305f]">
                  Bài 1: Interface & Abstract Class
                </h1>

                <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-100 pb-2">
                  {[
                    ["video", "Video", Video],
                    ["docs", "Tài liệu", FileText],
                    ["code", "Code", Code2],
                    ["quiz", "Quiz", HelpCircle],
                    ["discuss", "Thảo luận", MessageCircle],
                  ].map(([tabKey, label, Icon]: any) => (
                    <button
                      key={tabKey}
                      onClick={() => setCurrentTab(tabKey)}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                        currentTab === tabKey
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="size-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Nội dung theo Tab chọn */}
                <div className="mt-5">
                  {currentTab === "video" && (
                    <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900 shadow-md">
                      <iframe
                        className="size-full"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                        title="Video bài giảng"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {currentTab === "docs" && (
                    <div className="flex flex-col gap-3">
                      <h3 className="text-xs font-bold text-slate-800">Tài liệu đính kèm bài học</h3>
                      <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50">
                        <div className="flex items-center gap-3">
                          <FileText className="size-5 text-blue-600" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Bài giảng: Interface & Abstract Class (PDF)</p>
                            <p className="text-[11px] text-slate-400">2.4 MB</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700">
                          <Download className="size-3.5" /> Tải xuống
                        </button>
                      </div>
                    </div>
                  )}

                  {currentTab === "quiz" && (
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                      <h3 className="text-xs font-bold text-slate-900">1. Interface có thể chứa phương thức có thân (default method) không?</h3>
                      <div className="mt-3 flex flex-col gap-2">
                        {[
                          ["A", "Có"],
                          ["B", "Không"],
                          ["C", "Chỉ trong Java 8+"],
                          ["D", "Tùy trường hợp"],
                        ].map(([key, val]) => (
                          <button
                            key={key}
                            onClick={() => setSelectedQuiz(key)}
                            className={`flex items-center gap-3 rounded-xl border p-3 text-xs font-medium text-left transition cursor-pointer ${
                              selectedQuiz === key ? "border-blue-600 bg-blue-50 text-blue-700 font-bold" : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <span className="flex size-5 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold">{key}</span>
                            {val}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setQuizChecked(true)}
                        className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                      >
                        Kiểm tra đáp án
                      </button>

                      {quizChecked && (
                        <p className="mt-3 text-xs font-bold text-emerald-600">
                          ✓ Chính xác! Từ Java 8 trở đi, Interface đã hỗ trợ default method.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tài liệu & Tải Source Code bên dưới */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <Code2 className="size-5 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Source code ví dụ thực hành</p>
                    <p className="text-[11px] text-slate-400">File mã nguồn đầy đủ của bài giảng này</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                  <Download className="size-3.5" /> Tải source code
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Cửa Sổ AI Tutor Nổi Nâng Cấp (Collapsible AI Floating Widget) */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {aiOpen && (
            <div className="mb-3 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
              <div className="flex items-center justify-between bg-blue-600 p-3.5 text-white">
                <div className="flex items-center gap-2">
                  <Bot className="size-5 text-amber-300" />
                  <span className="text-xs font-bold">AI Tutor - Hỗ trợ học tập</span>
                </div>
                <button onClick={() => setAiOpen(false)} className="rounded-lg p-1 hover:bg-blue-700 cursor-pointer">
                  <X className="size-4" />
                </button>
              </div>

              <div className="p-4 max-h-80 overflow-y-auto text-xs space-y-3 bg-slate-50/50">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <p className="font-bold text-slate-800 mb-1">Dưới đây là so sánh Interface và Abstract Class:</p>
                  <table className="w-full text-[11px] border-collapse mt-2">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="p-1 border text-left">Tiêu chí</th>
                        <th className="p-1 border text-left">Interface</th>
                        <th className="p-1 border text-left">Abstract</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1 border font-semibold">Từ khóa</td>
                        <td className="p-1 border">interface</td>
                        <td className="p-1 border">abstract class</td>
                      </tr>
                      <tr>
                        <td className="p-1 border font-semibold">Kế thừa</td>
                        <td className="p-1 border">Nhiều</td>
                        <td className="p-1 border">Đơn kế thừa</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 border-t border-slate-100 bg-white flex gap-2">
                <input
                  placeholder="Hỏi AI về bài học này..."
                  className="flex-1 h-8 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-500"
                />
                <button className="flex size-8 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setAiOpen(!aiOpen)}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition cursor-pointer"
          >
            <Bot className="size-5 text-amber-300" />
            <span>{aiOpen ? "Đóng AI Tutor" : "Hỏi AI Tutor"}</span>
          </button>
        </div>

        <LockModal
          isOpen={lockModalOpen}
          onClose={() => setLockModalOpen(false)}
          onRegister={() => {
            setIsEnrolled(true);
            setLockModalOpen(false);
            alert("Đã đăng ký thành công! Mở khóa trọn bộ bài giảng.");
          }}
        />

        <footer className="mt-16 bg-[#102653] text-blue-100">
          <div className="mx-auto max-w-7xl px-5 py-8 text-center text-xs text-blue-200/50">
            © 2026 EduFlow. Learn smarter, grow faster.
          </div>
        </footer>
      </main>
    </div>
  );
}