"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Award,
  Bell,
  PanelLeft,
  UserRound,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  Globe2,
  GraduationCap,
  LayoutGrid,
  Menu,
  MessageCircle,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  X,
  Zap,
  LogOut,
  CreditCard,
  Settings,
  Activity,
  ChevronDown,
} from "lucide-react";

const categories = [
  {
    name: "Programming",
    courses: "42 courses",
    icon: Code2,
    tint: "bg-blue-50 text-blue-600",
  },
  {
    name: "Web Development",
    courses: "36 courses",
    icon: Globe2,
    tint: "bg-cyan-50 text-cyan-600",
  },
  {
    name: "Database",
    courses: "18 courses",
    icon: Database,
    tint: "bg-violet-50 text-violet-600",
  },
  {
    name: "Artificial Intelligence",
    courses: "24 courses",
    icon: Brain,
    tint: "bg-fuchsia-50 text-fuchsia-600",
  },
  {
    name: "Data Science",
    courses: "29 courses",
    icon: Target,
    tint: "bg-amber-50 text-amber-600",
  },
  {
    name: "Cyber Security",
    courses: "16 courses",
    icon: ShieldCheck,
    tint: "bg-emerald-50 text-emerald-600",
  },
];

// Dữ liệu mẫu dự phòng cho Khóa học Nổi bật
const fallbackFeaturedCourses = [
  {
    id: "js-fullstack",
    title: "JavaScript Full Stack Development Masterclass",
    instructor: "Alex Morgan",
    rating: "4.9",
    students: "2.4k",
    duration: "18h 30m",
    level: "Intermediate",
    price: 1200000,
    color: "from-orange-400 via-red-500 to-indigo-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600",
  },
  {
    id: "python-data-science",
    title: "Python for Data Science & Machine Learning",
    instructor: "Nora Patel",
    rating: "4.8",
    students: "1.8k",
    duration: "22h 10m",
    level: "Beginner",
    price: 1000000,
    color: "from-sky-400 via-cyan-500 to-indigo-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600",
  },
  {
    id: "modern-web-dev",
    title: "Modern Web Development với Next.js 14",
    instructor: "Marcus Lee",
    rating: "4.9",
    students: "3.1k",
    duration: "26h 45m",
    level: "Intermediate",
    price: 900000,
    color: "from-cyan-400 via-blue-600 to-violet-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
  },
  {
    id: "ml-essentials",
    title: "Machine Learning Essentials & Deep Learning",
    instructor: "Dr. Priya Shah",
    rating: "4.7",
    students: "980",
    duration: "16h 20m",
    level: "Advanced",
    price: 1100000,
    color: "from-violet-500 via-fuchsia-600 to-indigo-950",
    thumbnailUrl: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600",
  },
];

// Dữ liệu mẫu dự phòng cho Khóa học Trả phí
const fallbackPaidCourses = [
  {
    id: "spring-boot-masterclass",
    title: "Spring Boot & Microservices Masterclass",
    instructor: "David Miller",
    rating: "4.9",
    students: "1.5k",
    duration: "32h 15m",
    level: "Advanced",
    price: 1500000,
    color: "from-emerald-500 via-teal-600 to-indigo-950",
    thumbnailUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
  },
  {
    id: "react-native-mobile",
    title: "React Native & Mobile App Development",
    instructor: "Sarah Jenkins",
    rating: "4.8",
    students: "2.1k",
    duration: "24h 50m",
    level: "Intermediate",
    price: 1350000,
    color: "from-blue-500 via-indigo-600 to-slate-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
  },
  {
    id: "devops-docker-kubernetes",
    title: "DevOps & Docker/Kubernetes in Practice",
    instructor: "Michael Chang",
    rating: "4.9",
    students: "1.2k",
    duration: "28h 00m",
    level: "Advanced",
    price: 1800000,
    color: "from-rose-500 via-purple-600 to-slate-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=600",
  },
  {
    id: "ui-ux-figma",
    title: "UI/UX Design System with Figma",
    instructor: "Emma Watson",
    rating: "4.7",
    students: "3.4k",
    duration: "15h 40m",
    level: "Beginner",
    price: 850000,
    color: "from-amber-400 via-orange-500 to-indigo-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600",
  },
];

// Dữ liệu mẫu dự phòng cho Khóa học Miễn phí
const fallbackFreeCourses = [
  {
    id: "html5-css3-beginner",
    title: "HTML5 & CSS3 Cho Người Mới Bắt Đầu",
    instructor: "EduFlow Team",
    rating: "4.9",
    students: "12.5k",
    duration: "8h 20m",
    level: "Beginner",
    price: 0,
    color: "from-green-400 via-emerald-500 to-teal-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600",
  },
  {
    id: "cplusplus-intro",
    title: "Nhập Môn Lập Trình Cơ Bản Với C++",
    instructor: "Trần Văn A",
    rating: "4.8",
    students: "8.9k",
    duration: "10h 15m",
    level: "Beginner",
    price: 0,
    color: "from-blue-400 via-sky-500 to-indigo-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600",
  },
  {
    id: "git-github-basic",
    title: "Git & GitHub Căn Bản Cho Developer",
    instructor: "Lê Thị B",
    rating: "5.0",
    students: "15.2k",
    duration: "4h 30m",
    level: "Beginner",
    price: 0,
    color: "from-gray-500 via-slate-600 to-zinc-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600",
  },
  {
    id: "dsa-basic",
    title: "Cấu Trúc Dữ Liệu & Giải Thuật Cơ Bản",
    instructor: "Dr. Nguyễn C",
    rating: "4.8",
    students: "6.7k",
    duration: "12h 00m",
    level: "Intermediate",
    price: 0,
    color: "from-indigo-400 via-purple-500 to-slate-900",
    thumbnailUrl: "https://images.unsplash.com/photo-1516116211223-48a122637329?w=600",
  },
];

const benefits = [
  [
    "Lộ trình học tập có cấu trúc",
    "Biết chính xác mình cần học gì tiếp theo với các lộ trình học tập được thiết kế sẵn.",
    LayoutGrid,
  ],
  [
    "Theo dõi tiến độ của bạn",
    "Xem nhanh tiến độ, các cột mốc và mục tiêu tiếp theo của bạn..",
    Target,
  ],
  [
    "Bài kiểm tra tương tác",
    "Luyện tập các khái niệm với những bài kiểm tra kiến ​​thức nhanh chóng và tập trung.",
    CheckCircle2,
  ],
  [
    "Chứng chỉ hoàn thành",
    "Ăn mừng những thành tựu của bạn với những chứng nhận có thể chia sẻ.",
    Award,
  ],
  [
    "Trợ lý AI thông minh",
    "Vượt qua khó khăn với những lời giải thích phù hợp với trình độ của bạn..",
    Sparkles,
  ],
  [
    "Lựa chọn cá nhân hóa",
    "Khám phá những khóa học phù hợp với mục tiêu và sở thích của bạn.",
    Zap,
  ],
] as const;

const testimonials = [
  [
    "LN",
    "Linh Nguyen",
    "Frontend Developer",
    "EduFlow helped me turn scattered tutorials into a clear path. I shipped my first portfolio in three months.",
    "5.0",
  ],
  [
    "TK",
    "Thien Khai",
    "Computer Science Student",
    "The AI Tutor is like having a patient mentor available whenever I get stuck on a difficult concept.",
    "4.9",
  ],
  [
    "MA",
    "Mai Anh",
    "Career Switcher",
    "The short lessons and practical projects fit perfectly around my full-time job.",
    "5.0",
  ],
];

function getFirstNameInitial(fullName?: string, username?: string): string {
  const name = fullName || username;
  if (!name) return "U";
  const parts = name.trim().split(" ");
  const lastPart = parts[parts.length - 1];
  return lastPart.charAt(0).toUpperCase();
}

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="EduFlow home">
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#173b8f] text-white shadow-sm">
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
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-17.5 max-w-7xl items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo />
          {isLoggedIn && (
            <button
              onClick={onToggle}
              className="hidden ml-12 rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 md:block"
              aria-label={collapsed ? "Mở thanh bên" : "Thu gọn thanh bên"}
            >
              <PanelLeft className="size-5" />
            </button>
          )}
        </div>

        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Điều hướng chính"
        >
          <a className="text-sm font-semibold text-blue-600" href="/dashboard">
            Trang chủ
          </a>
          <a
            className="text-sm text-slate-600 hover:text-blue-600"
            href="/courses"
          >
            Khóa học
          </a>
          <a
            className="text-sm text-slate-600 hover:text-blue-600"
            href="/categories"
          >
            Danh mục
          </a>
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <button
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-400 hover:border-blue-200 hover:text-blue-600"
            aria-label="Tìm kiếm"
          >
            <Search className="size-4" />
            <span className="text-xs">Tìm khóa học, giảng viên...</span>
          </button>

          {isLoggedIn ? (
            <div className="relative flex items-center gap-3 pl-2" ref={dropdownRef}>
              <button
                className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                aria-label="Thông báo"
              >
                <Bell className="size-4" />
              </button>

              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-1.5 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition"
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
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                    >
                      <UserRound className="size-4 text-slate-400" />
                      Hồ sơ của tôi
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/student/certificates");
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                    >
                      <Award className="size-4 text-slate-400" />
                      Chứng chỉ của tôi
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/student/activity");
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                    >
                      <Activity className="size-4 text-slate-400" />
                      Hoạt động của tôi
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/student/billing");
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                    >
                      <CreditCard className="size-4 text-slate-400" />
                      Đăng ký và thanh toán
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/student/settings");
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left"
                    >
                      <Settings className="size-4 text-slate-400" />
                      Cài đặt
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-50 transition text-left font-semibold"
                    >
                      <LogOut className="size-4 text-red-500" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <a
                href="/auth"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50"
              >
                Đăng ký
              </a>
              <a
                href="/auth"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
              >
                Đăng nhập
              </a>
            </>
          )}
        </div>
        <button
          className="rounded-xl p-2 text-slate-600 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {["Home", "Courses", "Categories", "About", "AI Tutor"].map(
              (item) => (
                <a
                  key={item}
                  href={
                    item === "Home"
                      ? "/"
                      : `#${item.toLowerCase().replace(" ", "-")}`
                  }
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {item}
                </a>
              )
            )}
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
              {isLoggedIn ? (
                <button
                  onClick={onLogout}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Đăng xuất
                </button>
              ) : (
                <>
                  <a
                    href="/auth"
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700"
                  >
                    Đăng nhập
                  </a>
                  <a
                    href="/auth"
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
      className={`fixed left-0 top-17.5 z-40 hidden h-[calc(100vh-70px)] shrink-0 border-r border-slate-200 bg-white/95 px-3 py-5 shadow-sm backdrop-blur-xl overflow-y-auto md:block transition-all duration-300 ${
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
              className={`group relative flex w-full items-center rounded-xl py-3 text-sm font-semibold transition shrink-0 ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive
                  ? collapsed
                    ? "text-blue-700"
                    : "border-l-4 border-blue-600 bg-blue-50 text-blue-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  isActive
                    ? collapsed
                      ? "bg-blue-100 text-blue-600"
                      : "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                }`}
              >
                <Icon className="size-4 shrink-0" />
              </span>
              <span className={collapsed ? "sr-only" : "truncate"}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto h-97.5 w-full max-w-130 lg:h-117.5">
      <div className="absolute inset-8 rounded-[42%] bg-linear-to-br from-blue-100 via-indigo-50 to-white" />
      <div className="absolute right-0 top-8 flex items-center gap-2 rounded-2xl border border-white bg-white px-4 py-3 shadow-xl shadow-blue-100">
        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <p className="text-xs font-bold text-slate-800">
            Khoá học hoàn thành
          </p>
          <p className="text-[10px] text-slate-400">Chúc mừng bạn đã hoàn thành khóa học!</p>
        </div>
      </div>
      <div className="absolute left-3 top-28 w-44 rounded-2xl border border-white bg-white p-4 shadow-xl shadow-indigo-100">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Tiến độ học tập 
          </span>
          <span className="text-xs font-bold text-blue-600">82%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-full w-[82%] rounded-full bg-blue-500" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
          <Users className="size-3" /> Bạn đã hoàn thành 14/18 bài học
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 flex h-60 w-72 -translate-x-1/2 items-center justify-center rounded-[32px] border-8 border-slate-800 bg-linear-to-br from-[#24468f] to-[#102653] shadow-2xl shadow-indigo-200">
        <div className="absolute inset-3 flex flex-col rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-700">
              Khoá học của tôi
            </span>
            <span className="size-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-4 rounded-xl bg-blue-50 p-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Code2 className="size-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-slate-800">
                  React essentials
                </p>
                <p className="text-[9px] text-slate-400">Hoàn thành 12/18 bài học</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-blue-100">
              <div className="h-full w-2/3 rounded-full bg-blue-500" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-[9px] text-slate-400">Chuỗi</p>
              <p className="text-sm font-bold text-slate-800">12</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-[9px] text-slate-400">XP nhận được</p>
              <p className="text-sm font-bold text-slate-800">2,480</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 right-2 flex size-24 items-center justify-center rounded-full bg-linear-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-200">
        <div className="text-center text-white">
          <Sparkles className="mx-auto size-7" />
          <p className="mt-1 text-[10px] font-bold">Trợ lý AI</p>
        </div>
      </div>
      <div className="absolute bottom-5 left-0 flex items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2.5 shadow-xl shadow-blue-100">
        <span className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-500">
          <Star className="size-4 fill-current" />
        </span>
        <div>
          <p className="text-xs font-bold text-slate-800">4.9 / 5</p>
          <p className="text-[10px] text-slate-400">Từ 10k+ người học</p>
        </div>
      </div>
    </div>
  );
}

// Component Thẻ khóa học: Tự động dùng ảnh mặc định đẹp mắt nếu DB trả về null
function CourseCard({ course }: { course: any }) {
  const numericPrice =
    typeof course.price === "number"
      ? course.price
      : course.price === "Miễn phí"
      ? 0
      : Number(course.price) || 0;

  const isFree = numericPrice === 0;

  const formattedPrice = isFree
    ? "Miễn phí"
    : `${new Intl.NumberFormat("vi-VN").format(numericPrice)}đ`;

  const instructorName =
    course.teacher?.fullName ||
    course.instructor ||
    course.instructorName ||
    "EduFlow Instructor";

  // Ảnh mặc định chất lượng cao nếu Database trả về null
  const defaultImage = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600";
  
  // Kiểm tra ảnh từ DB -> imageUrl -> thumbnail -> fallbackImage
  const courseImage = course.thumbnailUrl || course.imageUrl || course.thumbnail || defaultImage;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/70 flex flex-col justify-between">
      <div>
        {/* Banner: Luôn hiển thị hình ảnh mượt mà */}
        <div className="relative h-36 w-full overflow-hidden bg-slate-100">
          <img
            src={courseImage}
            alt={course.title || course.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Tag Bestseller / Free nằm đè nổi góc trên banner */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm ${
                isFree ? "bg-emerald-500/90" : "bg-blue-600/90"
              }`}
            >
              {isFree ? "Free" : "Bestseller"}
            </span>
            <div className="rounded-xl bg-black/20 p-1.5 text-white backdrop-blur-sm">
              <Code2 className="size-4" />
            </div>
          </div>
        </div>

        {/* Nội dung thông tin khóa học */}
        <div className="p-4">
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition">
            {course.title || course.name}
          </h3>

          <p className="mt-2 text-xs text-slate-500">By {instructorName}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="size-3.5 fill-current" /> {course.rating || "4.8"}
            </span>
            <span>{course.students || "1.2k"} learners</span>
            <span className="flex items-center gap-1">
              <Clock3 className="size-3.5" /> {course.duration || "12h 00m"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer giá tiền & Nút xem khóa học */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-bold truncate ${
                isFree ? "text-emerald-600" : "text-slate-900"
              }`}
            >
              {formattedPrice}
            </p>
            <p className="text-[10px] text-slate-400">{course.level || "Beginner"}</p>
          </div>
          <a
            href={`/courses/${course.id || ""}`}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0"
          >
            View course <ChevronRight className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Page() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [dbCourses, setDbCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/courses")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setDbCourses(data);
        }
      })
      .catch((err) => console.error("Lỗi kết nối API Backend:", err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      fetch("http://localhost:8080/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser(data);
        })
        .catch(() => {});
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    setUser(null);
  };

  // 1. KHÓA HỌC NỔI BẬT: Sắp xếp theo Rating cao nhất và lấy TOP 4
  const featuredCourses = useMemo(() => {
    if (dbCourses.length === 0) return fallbackFeaturedCourses;

    return [...dbCourses]
      .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
      .slice(0, 4);
  }, [dbCourses]);

  // 2. KHÓA HỌC TRẢ PHÍ: Lọc giá > 0, ưu tiên lấy 4 KHÓA HỌC MỚI NHẤT
  const paidCourses = useMemo(() => {
    const filtered = dbCourses.filter((course) => {
      const p = Number(course.price);
      return !isNaN(p) && p > 0;
    });

    if (filtered.length === 0) return fallbackPaidCourses;

    return [...filtered].reverse().slice(0, 4);
  }, [dbCourses]);

  // 3. KHÓA HỌC MIỄN PHÍ: Lọc giá = 0, ưu tiên lấy 4 KHÓA HỌC MỚI NHẤT
  const freeCourses = useMemo(() => {
    const filtered = dbCourses.filter((course) => {
      const p = Number(course.price);
      return course.price === 0 || course.price === "0" || p === 0;
    });

    if (filtered.length === 0) return fallbackFreeCourses;

    return [...filtered].reverse().slice(0, 4);
  }, [dbCourses]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f8fbff] text-slate-900">
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
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          isLoggedIn ? (collapsed ? "md:pl-19" : "md:pl-64") : "pl-0"
        }`}
      >
        <section className="overflow-hidden border-b border-blue-50 bg-linear-to-br from-[#f3f8ff] via-white to-[#edf3ff]">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 pb-16 pt-14 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:pb-20 lg:pt-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3.5 py-2 text-xs font-bold text-blue-600 shadow-sm">
                <Sparkles className="size-3.5" /> Học tập thông minh hơn với
                EduFlow
              </span>
              <h1 className="mt-6 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-[#17305f] sm:text-5xl lg:text-[40px]">
                Học tập thông minh.
                <br />
                <span className="text-blue-600">Phát triển tốt hơn.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                Phát triển các kỹ năng thực tế với các khóa học do chuyên gia
                hướng dẫn và thực hành thực tế và trợ lý AI giúp bạn tiến bộ mỗi
                ngày..
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#courses"
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
                >
                  Khám phá các khóa học <ArrowRight className="size-4" />
                </a>
                <a
                  href={isLoggedIn ? "/student/dashboard" : "/auth"}
                  className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3.5 text-sm font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <Play className="size-4 fill-current" />{" "}
                  {isLoggedIn ? "Bắt đầu học" : "Bắt đầu học tập"}
                </a>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="size-4" />
                  </span>
                  Học tập mọi lúc, mọi nơi
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <Award className="size-4" />
                  </span>
                  Chứng chỉ hoàn thành khóa học
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Users className="size-4" />
                  </span>
                  10k+ người học
                </div>
              </div>
            </div>
            <HeroVisual />
          </div>
        </section>

        <section
          id="categories"
          className="mx-auto max-w-7xl px-5 py-16 lg:px-8"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                Khám phá con đường của bạn
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17305f]">
                Tìm hiểu điều gì thúc đẩy bạn tiến lên
              </h2>
            </div>
            <a
              href="/courses"
              className="hidden items-center gap-1 text-sm font-bold text-blue-600 sm:flex"
            >
              Xem tất cả các danh mục <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(({ name, courses: count, icon: Icon, tint }) => (
              <a
                href="#courses"
                key={name}
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60"
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${tint}`}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  {name}
                </h3>
                <p className="mt-1 text-xs text-slate-400">{count}</p>
              </a>
            ))}
          </div>
        </section>

        {/* 1. SECTION: KHÓA HỌC NỔI BẬT */}
        <section
          id="courses"
          className="bg-white py-16 border-b border-slate-100"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                  Học hỏi từ những người giỏi nhất
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17305f]">
                  Các khóa học nổi bật
                </h2>
              </div>
              <a
                href="/courses"
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Xem thêm <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id || course.title} course={course} />
              ))}
            </div>
          </div>
        </section>

        {/* 2. SECTION: KHÓA HỌC TRẢ PHÍ (PAID) */}
        <section className="bg-[#f8fbff] py-16 border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">
                  Chuyên sâu & Chuyên nghiệp
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17305f]">
                  Khóa học trả phí cao cấp
                </h2>
              </div>
              <a
                href="/courses?type=paid"
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Xem tất cả khóa học có phí <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {paidCourses.map((course) => (
                <CourseCard key={course.id || course.title} course={course} />
              ))}
            </div>
          </div>
        </section>

        {/* 3. SECTION: KHÓA HỌC MIỄN PHÍ (FREE) */}
        <section className="bg-white py-16 border-b border-slate-100">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Khởi đầu hoàn toàn tự do
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17305f]">
                  Khóa học miễn phí
                </h2>
              </div>
              <a
                href="/courses?type=free"
                className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                Khám phá thêm miễn phí <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {freeCourses.map((course) => (
                <CourseCard key={course.id || course.title} course={course} />
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                Lý do nên chọn EduFlow?
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#17305f] sm:text-4xl">
                Học những gì bạn cần để học tập một cách tự tin.
              </h2>
              <p className="mt-4 max-w-md leading-7 text-slate-600">
                Từ bài học đầu tiên đến cột mốc sự nghiệp tiếp theo, EduFlow
                mang đến cấu trúc, sự hỗ trợ và động lực cho hành trình học tập
                của bạn.
              </p>
              <a
                href={isLoggedIn ? "/student/dashboard" : "/auth"}
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-blue-600"
              >
                Bắt đầu hành trình của bạn <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map(([title, description, Icon]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    {title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="ai-tutor"
          className="overflow-hidden bg-[#132e67] py-16 text-white"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[1fr_0.8fr] lg:px-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-blue-100">
                <Sparkles className="size-3.5" /> EduFlow AI
              </span>
              <h2 className="mt-5 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
                Trợ lý học tập AI cá nhân của bạn.
              </h2>
              <p className="mt-4 max-w-lg leading-7 text-blue-100">
                Đặt câu hỏi, nhận giải thích đơn giản, xem lại các bài học khó
                khăn, và nhận các khuyến nghị phù hợp với cách học của bạn.
              </p>
              <a
                href={isLoggedIn ? "/student/dashboard" : "/auth"}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#173b8f] hover:bg-blue-50"
              >
                Trợ lý AI <ArrowRight className="size-4" />
              </a>
            </div>
            <div className="relative mx-auto w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-2xl bg-white p-5 text-slate-900">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Sparkles className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold">EduFlow AI</p>
                    <p className="text-xs text-slate-400">
                      Người đồng hành học tập của bạn
                    </p>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl rounded-tl-sm bg-blue-50 p-3 text-sm leading-6 text-slate-700">
                  Bạn có thể giải thích React hooks một cách đơn giản được không?
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Sparkles className="size-3" />
                  </span>
                  <p className="rounded-2xl rounded-tl-sm bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                    Hãy coi hook như những công cụ cho phép các thành phần của bạn ghi nhớ thông tin 
                    và phản hồi lại các thay đổi.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-400">
                  Ask a follow-up question...{" "}
                  <ArrowRight className="ml-auto size-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
              Học tập đơn giản hơn
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17305f]">
              4 bước để bắt đầu học tập
            </h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-4">
            {[
              [
                "01",
                "Tạo tài khoản",
                "Đặt mục tiêu và cho chúng tôi biết điều gì khiến bạn háo hức.",
              ],
              [
                "02",
                "Chọn một khóa học",
                "Tìm kiếm lộ trình phù hợp với bước tiếp theo của bạn.",
              ],
              [
                "03",
                "Học và luyện tập",
                "Xây dựng kỹ năng với các bài học nhỏ.",
              ],
              [
                "04",
                "Theo dõi tiến độ",
                "Giữ vững động lực và kỷ niệm mỗi thành tựu.",
              ],
            ].map(([number, title, description]) => (
              <div className="relative text-center" key={number}>
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-100">
                  {number}
                </span>
                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                Câu chuyện người học
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#17305f]">
                Được yêu thích bởi những tâm hồn tò mò
              </h2>
            </div>
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {testimonials.map(([initials, name, role, quote, rating]) => (
                <article
                  key={name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-700 text-xs font-bold text-white">
                        {initials}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {name}
                        </p>
                        <p className="text-xs text-slate-400">{role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="size-3.5 fill-current" /> {rating}
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-slate-600">
                    &quot;{quote}&quot;
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-linear-to-r from-[#173b8f] to-[#2563eb] px-7 py-10 text-white shadow-xl shadow-blue-100 sm:flex-row sm:items-center sm:px-12">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Sẵn sàng bắt đầu học tập?
              </h2>
              <p className="mt-2 text-sm text-blue-100">
                Bước đột phá tiếp theo của bạn chỉ cách một bài học nữa thôi.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#courses"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                Khám phá các khóa học
              </a>
              <a
                href={isLoggedIn ? "/student/dashboard" : "/auth"}
                className="rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                {isLoggedIn ? "Vào Dashboard" : "Create free account"}
              </a>
            </div>
          </div>
        </section>

        <footer className="bg-[#102653] text-blue-100">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-8">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-6 text-blue-200/70">
                A better way to learn, practice, and grow the skills that move
                your future forward.
              </p>
              <div className="mt-5 flex gap-2">
                <a
                  href="#"
                  aria-label="Twitter"
                  className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
                >
                  <Globe2 className="size-4" />
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
                >
                  <MessageCircle className="size-4" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="rounded-lg bg-white/10 p-2 hover:bg-white/20"
                >
                  <Users className="size-4" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Platform</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
                <a href="#courses" className="hover:text-white">
                  Browse courses
                </a>
                <a href="#categories" className="hover:text-white">
                  Categories
                </a>
                <a href="#ai-tutor" className="hover:text-white">
                  AI Tutor
                </a>
                <a href="#about" className="hover:text-white">
                  About EduFlow
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Popular topics</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
                <a href="#courses" className="hover:text-white">
                  Programming
                </a>
                <a href="#courses" className="hover:text-white">
                  Web Development
                </a>
                <a href="#courses" className="hover:text-white">
                  Data Science
                </a>
                <a href="#courses" className="hover:text-white">
                  AI & Machine Learning
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Support</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
                <a href="#" className="hover:text-white">
                  Help center
                </a>
                <a href="#" className="hover:text-white">
                  Contact us
                </a>
                <a href="#" className="hover:text-white">
                  Privacy policy
                </a>
                <a href="#" className="hover:text-white">
                  Terms of use
                </a>
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