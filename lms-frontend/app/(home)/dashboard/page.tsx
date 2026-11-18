"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  LayoutGrid,
  Play,
  Sparkles,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";

// Import 3 Component dùng chung
import { StudentHeader } from "@/components/student-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { useStudentSidebarState } from "@/components/student-sidebar-state";
import { StudentFooter } from "@/components/student-footer";
import {
  getStudentCategoryLabel,
  matchesStudentCategory,
  studentCategories,
} from "@/components/student-category-menu";
import {
  type CatalogCourse,
  formatCourseDuration,
  STUDENT_API_URL,
  type StudentUser,
} from "@/lib/student-api";

const dashboardCategories = studentCategories.filter(
  (category) => category.showOnDashboard !== false,
);

function getCategoryCount(courses: CatalogCourse[], categoryName: string) {
  return courses.filter((course) => {
    const name = course.categoryName || "";
    return matchesStudentCategory(name, categoryName);
  }).length;
}

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
          <p className="text-[10px] text-slate-400">
            Chúc mừng bạn đã hoàn thành khóa học!
          </p>
        </div>
      </div>
      <div className="absolute left-3 top-28 w-44 rounded-2xl border border-white bg-white p-4 shadow-xl shadow-indigo-100">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Tiến độ học tập
          </span>
          <span className="text-xs font-bold text-blue-600">Học tập</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-full w-[82%] rounded-full bg-blue-500" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
          <Users className="size-3" /> Theo dõi tiến độ học tập của bạn
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
                  Khóa học của bạn
                </p>
                <p className="text-[9px] text-slate-400">
                  Bắt đầu từ bài học đầu tiên
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-blue-100">
              <div className="h-full w-2/3 rounded-full bg-blue-500" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-[9px] text-slate-400">Bài học</p>
              <p className="text-sm font-bold text-slate-800">Học ngay</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-[9px] text-slate-400">Tiến độ</p>
              <p className="text-sm font-bold text-slate-800">Của bạn</p>
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
    </div>
  );
}

function CourseCard({ course }: { course: CatalogCourse }) {
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

  const instructorName = course.instructorName || "Giảng viên EduFlow";

  const defaultImage =
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600";
  const courseImage = course.thumbnailUrl || defaultImage;

  return (
    <a
      href={`/courses/${course.id}`}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100/70"
    >
      <div>
        <div className="relative h-36 w-full overflow-hidden bg-slate-100">
          <img
            src={courseImage}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 z-10 bg-linear-to-b from-black/50 to-transparent">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm ${
                isFree ? "bg-emerald-500/90" : "bg-blue-600/90"
              }`}
            >
              {isFree ? "Miễn phí" : getStudentCategoryLabel(course.categoryName)}
            </span>
            <div className="rounded-xl bg-black/20 p-1.5 text-white backdrop-blur-sm">
              <Code2 className="size-4" />
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-10 group-hover:text-blue-600 transition">
            {course.title}
          </h3>

          <p className="mt-2 text-xs text-slate-500">Bởi {instructorName}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="size-3.5 fill-current" />{" "}
              {course.reviewCount > 0 && course.averageRating != null
                ? `${course.averageRating.toFixed(1)} (${course.reviewCount})`
                : "Chưa có đánh giá"}
            </span>
            <span>{course.studentCount} học viên</span>
            {formatCourseDuration(course.totalDurationSeconds) && (
              <span className="flex items-center gap-1">
                <Clock3 className="size-3.5" /> {formatCourseDuration(course.totalDurationSeconds)}
              </span>
            )}
          </div>
        </div>
      </div>

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
            <p className="text-[10px] text-slate-400">
              {(
                {
                  BEGINNER: "Sơ cấp",
                  INTERMEDIATE: "Trung cấp",
                  ADVANCED: "Cao cấp",
                  ALL_LEVELS: "Mọi trình độ",
                } as Record<string, string>
              )[course.level] ||
                course.level ||
                "Chưa xác định trình độ"}
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs font-bold text-blue-600 shrink-0">
            Xem khóa học <ChevronRight className="size-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

export default function Page() {
  const { collapsed, setCollapsed } = useStudentSidebarState();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [dbCourses, setDbCourses] = useState<CatalogCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    fetch(`${STUDENT_API_URL}/api/courses`)
      .then((res) => {
        if (!res.ok) throw new Error(`Không thể tải khóa học (HTTP ${res.status}).`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setDbCourses(data);
        }
      })
      .catch((error: unknown) => {
        setCoursesError(error instanceof Error ? error.message : "Không thể tải danh sách khóa học.");
      })
      .finally(() => setIsLoadingCourses(false));
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setIsLoggedIn(true);
      fetch(`${STUDENT_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Không thể tải hồ sơ (HTTP ${res.status}).`);
          return res.json();
        })
        .then((data) => {
          if (data) setUser(data);
        })
        .catch((error: unknown) => console.error("Không thể tải thông tin tài khoản:", error));
    }
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    setUser(null);
  };

  const featuredCourses = useMemo(() => {
    return [...dbCourses]
      .sort((a, b) =>
        Number(b.reviewCount > 0) - Number(a.reviewCount > 0) ||
        (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0) ||
        b.studentCount - a.studentCount)
      .slice(0, 4);
  }, [dbCourses]);

  const paidCourses = useMemo(() => {
    return dbCourses
      .filter((course) => Number(course.price) > 0)
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 4);
  }, [dbCourses]);

  const freeCourses = useMemo(() => {
    return dbCourses
      .filter((course) => Number(course.price) === 0)
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 4);
  }, [dbCourses]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f8fbff] text-slate-900">
      {/* 1. HEADER DÙNG CHUNG */}
      <StudentHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
        courses={dbCourses}
        onLogout={handleLogout}
      />

      {/* 2. SIDEBAR DÙNG CHUNG */}
      {isLoggedIn && (
        <StudentSidebar
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
                  href={isLoggedIn ? "#courses" : "/auth"}
                  className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-3.5 text-sm font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <Play className="size-4 fill-current" />{" "}
                  {isLoggedIn ? "Bắt đầu học" : "Bắt đầu học tập"}
                </a>
              </div>
              {user?.role === "STUDENT" && (
                <a
                  href="/teacher-application"
                  className="mt-4 inline-flex text-sm font-semibold text-blue-700 underline"
                >
                  Đăng ký trở thành giảng viên
                </a>
              )}
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
            <Link
              href="/courses?category=all"
              className="hidden items-center gap-1 text-sm font-bold text-blue-600 sm:flex"
            >
              Xem tất cả các danh mục <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {dashboardCategories.map(({ name, label, icon: Icon, tint }) => (
              <Link
                href={`/courses?category=${encodeURIComponent(name)}`}
                key={name}
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60"
              >
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ${tint}`}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  {label}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {getCategoryCount(dbCourses, name)} khóa học
                </p>
              </Link>
            ))}
          </div>
        </section>

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
            {coursesError ? (
              <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{coursesError}</p>
            ) : isLoadingCourses ? (
              <p role="status" className="mt-8 rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">Đang tải khóa học...</p>
            ) : featuredCourses.length ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featuredCourses.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>
            ) : (
              <p className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Hiện chưa có khóa học đã xuất bản.</p>
            )}
          </div>
        </section>

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
                href="/courses?price=paid"
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                Xem tất cả khóa học có phí <ArrowRight className="size-4" />
              </a>
            </div>
            {coursesError ? (
              <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{coursesError}</p>
            ) : isLoadingCourses ? (
              <p role="status" className="mt-8 rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">Đang tải khóa học...</p>
            ) : paidCourses.length ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {paidCourses.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>
            ) : (
              <p className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Chưa có khóa học trả phí được xuất bản.</p>
            )}
          </div>
        </section>

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
                href="/courses?price=free"
                className="flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                Khám phá thêm miễn phí <ArrowRight className="size-4" />
              </a>
            </div>
            {coursesError ? (
              <p role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{coursesError}</p>
            ) : isLoadingCourses ? (
              <p role="status" className="mt-8 rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">Đang tải khóa học...</p>
            ) : freeCourses.length ? (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {freeCourses.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>
            ) : (
              <p className="mt-8 rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Chưa có khóa học miễn phí được xuất bản.</p>
            )}
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
                href="/courses"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#173b8f] hover:bg-blue-50"
              >
                Trải nghiệm ngay <ArrowRight className="size-4" />
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
                  Bạn có thể giải thích React hooks một cách đơn giản được
                  không?
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Sparkles className="size-3" />
                  </span>
                  <p className="rounded-2xl rounded-tl-sm bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                    Hãy coi hook như những công cụ cho phép các thành phần của
                    bạn ghi nhớ thông tin và phản hồi lại các thay đổi.
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
                href="/courses"
                className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                Khám phá các khóa học
              </a>
              <a
                href="/courses"
                className="rounded-xl border border-white/40 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                {isLoggedIn ? "Vào Dashboard" : "Create free account"}
              </a>
            </div>
          </div>
        </section>

        {/* 3. FOOTER DÙNG CHUNG */}
        <StudentFooter variant="learning" />
      </main>
    </div>
  );
}