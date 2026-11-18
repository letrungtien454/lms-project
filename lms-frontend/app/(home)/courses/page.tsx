"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getStudentCategoryLabel,
  matchesStudentCategory,
  studentCategories,
} from "@/components/student-category-menu";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import {
  type CatalogCourse,
  formatCourseDuration,
  STUDENT_API_URL,
  type StudentUser,
} from "@/lib/student-api";
import { StudentHeader } from "@/components/student-header";
import { StudentFooter } from "@/components/student-footer";
import { StudentSidebar } from "@/components/student-sidebar";
import { useStudentSidebarState } from "@/components/student-sidebar-state";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  Filter,
  RotateCcw,
  Search,
  Star,
  Users,
} from "lucide-react";

const categories = studentCategories.map(({ name }) => name);
const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"];
const levelLabels: Record<string, string> = {
  BEGINNER: "Sơ cấp",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Cao cấp",
  ALL_LEVELS: "Mọi trình độ",
};

const formatPrice = (price: number) =>
  price === 0 ? "Miễn phí" : `${new Intl.NumberFormat("vi-VN").format(price)}đ`;

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-100 py-3.5 first:pt-0 last:border-b-0">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#17305f]">
        {title}
      </h3>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

function CheckOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-3.5 rounded border-slate-300 accent-blue-600"
      />
      {label}
    </label>
  );
}

// Component Thẻ khóa học: Tối ưu kích thước chữ & ảnh mặc định
function CourseCard({ course }: { course: CatalogCourse }) {
  const numericPrice =
    typeof course.price === "number" ? course.price : Number(course.price) || 0;
  const isFree = numericPrice === 0;

  const instructorName = course.instructorName || "Giảng viên EduFlow";

  const defaultImage =
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600";
  const courseImage = course.thumbnailUrl || defaultImage;

  return (
    <a
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60 justify-between"
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
              {isFree
                ? "Miễn phí"
                : getStudentCategoryLabel(course.categoryName)}
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

          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="size-3.5 fill-current" />{" "}
              {course.reviewCount > 0 && course.averageRating != null
                ? `${course.averageRating.toFixed(1)} (${course.reviewCount})`
                : "Chưa có đánh giá"}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {course.studentCount} học viên
            </span>
            {formatCourseDuration(course.totalDurationSeconds) && (
              <span className="flex items-center gap-1">
                <Clock3 className="size-3.5" /> {formatCourseDuration(course.totalDurationSeconds)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <p
            className={`text-sm font-bold ${isFree ? "text-emerald-600" : "text-[#17305f]"}`}
          >
            {formatPrice(numericPrice)}
          </p>
          <span className="text-[10px] font-semibold text-slate-400">
            {levelLabels[String(course.level || "").toUpperCase()] ||
              "Chưa xác định trình độ"}
          </span>
        </div>
      </div>
    </a>
  );
}

export default function CoursesPage() {
  const { collapsed, setCollapsed } = useStudentSidebarState();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [dbCourses, setDbCourses] = useState<CatalogCourse[]>([]);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [price, setPrice] = useState("All");
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [rating, setRating] = useState("All");
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const priceParam = params.get("price") || params.get("type");
    const searchParam = params.get("search");

    if (category && category.toLowerCase() !== "all") {
      const matchedCategory = categories.find(
        (item) => item.toLowerCase() === category.toLowerCase(),
      );
      setSelectedCategories([matchedCategory || category]);
    }
    if (priceParam?.toLowerCase() === "free" || priceParam === "Miễn phí")
      setPrice("Free");
    if (priceParam?.toLowerCase() === "paid") setPrice("Paid");
    if (searchParam) setSearch(searchParam);
  }, []);

  // Gọi API lấy toàn bộ danh sách khóa học từ Backend
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
        setLoadError(error instanceof Error ? error.message : "Không thể tải danh sách khóa học.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    setIsLoggedIn(true);
    fetch(`${STUDENT_API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Không thể tải hồ sơ (HTTP ${response.status}).`);
        return response.json();
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch((error: unknown) => {
        console.error("Không thể tải thông tin tài khoản:", error);
      });
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setUser(null);
    setIsLoggedIn(false);
  };

  const coursesList = dbCourses;

  const toggle = (
    value: string,
    values: string[],
    setter: (next: string[]) => void,
  ) =>
    setter(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value],
    );

  const resetFilters = () => {
    setSelectedCategories([]);
    setPrice("All");
    setSelectedLevels([]);
    setRating("All");
    setSearch("");
    setPage(1);
  };

  const filteredCourses = useMemo(() => {
    const result = coursesList.filter((course) => {
      const instructorName = course.instructorName || "";
      const query = search.trim().toLocaleLowerCase("vi");
      const matchesSearch =
        `${course.title} ${instructorName}`
          .toLocaleLowerCase("vi")
          .includes(query);
      const category = String(course.categoryName || "");
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.some((selected) => {
          return matchesStudentCategory(category, selected);
        });
      const courseLevel = String(course.level || "").toUpperCase();
      const matchesLevel =
        selectedLevels.length === 0 ||
        selectedLevels.includes(courseLevel) ||
        (courseLevel === "ALL_LEVELS" &&
          selectedLevels.some((level) => level !== "ALL_LEVELS"));

      const p = Number(course.price) || 0;
      const matchesPrice =
        price === "All" || (price === "Free" ? p === 0 : p > 0);

      const r = Number(course.averageRating);
      const matchesRating =
        rating === "All" ||
        (course.reviewCount > 0 && Number.isFinite(r) && r >= Number(rating));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel &&
        matchesPrice &&
        matchesRating
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "rating")
        return (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0);
      if (sort === "price")
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      if (sort === "newest") return Number(b.id) - Number(a.id);
      return (Number(b.studentCount) || 0) - (Number(a.studentCount) || 0);
    });
  }, [
    coursesList,
    search,
    selectedCategories,
    selectedLevels,
    price,
    rating,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const paginatedCourses = filteredCourses.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategories, selectedLevels, price, rating, sort]);

  const getPaginationItems = () => {
    const items: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
    } else {
      if (page <= 3) {
        items.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        items.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        items.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return items;
  };

  const filtersMarkup = (
    <div id="filters" className="flex flex-col gap-1">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-[#17305f] uppercase tracking-wider">
          Bộ lọc tìm kiếm
        </span>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
        >
          <RotateCcw className="size-3" /> Đặt lại
        </button>
      </div>
      <FilterGroup title="Danh mục">
        <CheckOption
          label="Tất cả danh mục"
          checked={selectedCategories.length === 0}
          onChange={() => setSelectedCategories([])}
        />
        {categories.map((item) => (
          <CheckOption
            key={item}
            label={getStudentCategoryLabel(item)}
            checked={selectedCategories.includes(item)}
            onChange={() =>
              toggle(item, selectedCategories, setSelectedCategories)
            }
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Mức giá">
        {[
          ["All", "Tất cả"],
          ["Free", "Miễn phí"],
          ["Paid", "Có phí"],
        ].map(([value, label]) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600"
          >
            <input
              type="radio"
              name="price"
              checked={price === value}
              onChange={() => setPrice(value)}
              className="size-3.5 accent-blue-600"
            />
            {label}
          </label>
        ))}
      </FilterGroup>
      <FilterGroup title="Trình độ">
        {levels.map((item) => (
          <CheckOption
            key={item}
            label={levelLabels[item]}
            checked={selectedLevels.includes(item)}
            onChange={() => toggle(item, selectedLevels, setSelectedLevels)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Đánh giá">
        {[
          ["All", "Tất cả đánh giá"],
          ["4.5", "4.5 ⭐ trở lên"],
          ["4.0", "4.0 ⭐ trở lên"],
          ["3.5", "3.5 ⭐ trở lên"],
        ].map(([value, label]) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600"
          >
            <input
              type="radio"
              name="rating"
              checked={rating === value}
              onChange={() => setRating(value)}
              className="size-3.5 accent-blue-600"
            />
            {label}
          </label>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="flex min-h-screen w-screen flex-col bg-[#f8fbff] text-slate-900">
      <StudentHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
        courses={coursesList}
        onLogout={handleLogout}
        variant="courses"
        onCategorySelect={(categoryName) =>
          setSelectedCategories(categoryName ? [categoryName] : [])
        }
      />

      {/* TÁI SỬ DỤNG STUDENT SIDEBAR DÙNG CHUNG */}
      <StudentSidebar
        collapsed={collapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main
        className={`flex-1 transition-all duration-300 ${collapsed ? "md:pl-19" : "md:pl-64"}`}
      >
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="mb-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
              Khám phá tri thức cùng EduFlow
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#17305f]">
              Tất cả khóa học
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Tìm kiếm và chọn khóa học phù hợp để nâng cao kỹ năng lập trình
              của bạn.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[200px_1fr] items-start">
            <aside
              className={`${
                mobileFilters ? "block" : "hidden"
              } rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-22 lg:block lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto`}
              aria-label="Bộ lọc khóa học"
            >
              {filtersMarkup}
            </aside>

            <section>
              <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 w-full rounded-xl border-0 bg-slate-50 pl-10 pr-3 text-xs outline-none focus:bg-blue-50"
                    placeholder="Lọc nhanh danh sách bên dưới..."
                  />
                </div>
                <div className="flex items-center justify-between gap-3 px-1">
                  <button
                    onClick={() => setMobileFilters(!mobileFilters)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 lg:hidden"
                  >
                    <Filter className="size-3.5" /> Bộ lọc
                  </button>
                  <label className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-slate-500">
                    Sắp xếp:
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="rounded-lg border-0 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-[#17305f] outline-none"
                    >
                      <option value="popular">Phổ biến nhất</option>
                      <option value="newest">Mới nhất</option>
                      <option value="rating">Đánh giá cao nhất</option>
                      <option value="price">Giá: Thấp đến cao</option>
                    </select>
                  </label>
                </div>
              </div>

              {loadError ? (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>
              ) : isLoading ? (
                <p role="status" className="rounded-xl border border-slate-100 bg-white p-8 text-center text-sm text-slate-500">Đang tải khóa học...</p>
              ) : filteredCourses.length ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedCourses.map((course) => (
                      <CourseCard
                        key={course.id || course.title}
                        course={course}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                  <Search className="mx-auto size-10 text-slate-300" />
                  <h2 className="mt-3 text-base font-bold text-[#17305f]">
                    Không tìm thấy khóa học
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Hãy thử chọn lại từ khóa hoặc bấm đặt lại bộ lọc.
                  </p>
                </div>
              )}

              <div className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-40"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                </button>

                {getPaginationItems().map((item, idx) =>
                  typeof item === "number" ? (
                    <button
                      key={idx}
                      onClick={() => setPage(item)}
                      className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                        page === item
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span
                      key={idx}
                      className="px-1.5 text-xs font-bold text-slate-400"
                    >
                      {item}
                    </span>
                  ),
                )}

                <button
                  className="flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600 disabled:opacity-40"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* TÁI SỬ DỤNG STUDENT FOOTER DÙNG CHUNG */}
        <StudentFooter variant="learning" />
      </main>
    </div>
  );
}