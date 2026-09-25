'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  Filter,
  Globe2,
  GraduationCap,
  LayoutGrid,
  Menu,
  MessageCircle,
  Moon,
  PanelLeft,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react'

// Dữ liệu mẫu danh sách khóa học dự phòng
const defaultCourses = [
  { id: 'javascript-full-stack', title: 'JavaScript Full Stack Development Masterclass', instructor: 'Alex Morgan', category: 'Programming', rating: 4.9, students: '2.4k', price: 1200000, level: 'Intermediate', duration: '18h 30m', color: 'from-orange-400 via-red-500 to-indigo-900', thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600' },
  { id: 'python-data-science', title: 'Python for Data Science & Machine Learning', instructor: 'Nora Patel', category: 'Data Science', rating: 4.8, students: '1.8k', price: 1000000, level: 'Beginner', duration: '22h 10m', color: 'from-sky-400 via-cyan-500 to-indigo-900', thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600' },
  { id: 'modern-web-development', title: 'Modern Web Development với Next.js 14', instructor: 'Marcus Lee', category: 'Web Dev', rating: 4.9, students: '3.1k', price: 900000, level: 'Intermediate', duration: '26h 45m', color: 'from-cyan-400 via-blue-600 to-violet-900', thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600' },
  { id: 'machine-learning-essentials', title: 'Machine Learning Essentials & Deep Learning', instructor: 'Dr. Priya Shah', category: 'AI', rating: 4.7, students: '980', price: 1100000, level: 'Advanced', duration: '16h 20m', color: 'from-violet-500 via-fuchsia-600 to-indigo-950', thumbnailUrl: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600' },
  { id: 'sql-database-design', title: 'SQL & Database Design Masterclass', instructor: 'Theo Nguyen', category: 'Programming', rating: 4.6, students: '1.2k', price: 650000, level: 'Beginner', duration: '12h 15m', color: 'from-emerald-400 via-teal-500 to-blue-900', thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600' },
  { id: 'cyber-security-foundations', title: 'Cyber Security Foundations for Beginners', instructor: 'Sam Wilson', category: 'Security', rating: 4.8, students: '760', price: 0, level: 'Beginner', duration: '9h 40m', color: 'from-slate-500 via-blue-700 to-[#17305f]', thumbnailUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600' },
  { id: 'react-product-build', title: 'Build Scalable Products with React & Redux', instructor: 'Lina Tran', category: 'Web Dev', rating: 4.5, students: '2.1k', price: 850000, level: 'Advanced', duration: '20h 05m', color: 'from-blue-400 via-indigo-600 to-purple-900', thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600' },
  { id: 'data-visualization', title: 'Data Visualization & Analytics with Python', instructor: 'Owen Clark', category: 'Data Science', rating: 4.4, students: '540', price: 0, level: 'Intermediate', duration: '10h 30m', color: 'from-amber-400 via-orange-500 to-rose-900', thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600' },
]

const categories = ['Programming', 'Web Dev', 'Data Science', 'AI', 'Security']
const levels = ['Beginner', 'Intermediate', 'Advanced']

const formatPrice = (price: number) =>
  price === 0 ? 'Miễn phí' : `${new Intl.NumberFormat('vi-VN').format(price)}đ`

function Logo() {
  return (
    <a href="/dashboard" className="flex items-center gap-2.5" aria-label="EduFlow trang chủ">
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#173b8f] text-white shadow-sm">
        <GraduationCap className="size-5" />
      </span>
      <span className="text-xl font-bold tracking-tight text-[#17305f]">
        EduFlow
      </span>
    </a>
  )
}

function Header({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-17.5 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <div className="flex items-center gap-2 shrink-0">
          <Logo />
          <button
            onClick={onToggle}
            className="hidden ml-2 rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 md:block"
            aria-label={collapsed ? 'Mở thanh bên' : 'Thu gọn thanh bên'}
          >
            <PanelLeft className="size-5" />
          </button>
        </div>

        <nav className="hidden items-center gap-6 lg:flex shrink-0" aria-label="Điều hướng chính">
          <a className="text-xs font-semibold text-slate-600 hover:text-blue-600" href="/dashboard">
            Trang chủ
          </a>
          <a className="text-xs font-bold text-blue-600" href="/courses">
            Khóa học
          </a>
          <a className="text-xs font-semibold text-slate-600 hover:text-blue-600" href="/categories">
            Danh mục
          </a>
        </nav>

        <div className="hidden max-w-sm flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              placeholder="Tìm khóa học, giảng viên..."
            />
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex shrink-0">
          <button
            onClick={() => setIsDark(!isDark)}
            className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
            aria-label="Chuyển chế độ sáng tối"
            title="Chế độ Tối/Sáng"
          >
            {isDark ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4" />}
          </button>

          <button
            className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
            aria-label="Thông báo"
          >
            <Bell className="size-4" />
          </button>

          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
            <a
              href="/auth"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50"
            >
              Đăng ký
            </a>
            <a
              href="/auth"
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
            >
              Đăng nhập
            </a>
          </div>
        </div>

        <button
          className="rounded-xl p-2 text-slate-600 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {['Trang chủ', 'Khóa học', 'Danh mục'].map((item) => (
              <a
                key={item}
                href={item === 'Trang chủ' ? '/' : `/courses`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {item}
              </a>
            ))}
            <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
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
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function AppSidebar({
  collapsed,
  activeTab,
  setActiveTab,
}: {
  collapsed: boolean
  activeTab: string | null
  setActiveTab: (tab: string) => void
}) {
  const items = [
    ['Trang cá nhân', UserRound],
    ['Lộ trình học', Target],
    ['Khóa học của tôi', GraduationCap],
    ['Code Day', Code2],
    ['Luyện phỏng vấn', MessageCircle],
    ['Tiến độ học tập', Award],
  ] as const

  return (
    <aside
      className={`fixed left-0 top-17.5 z-40 hidden h-[calc(100vh-70px)] shrink-0 border-r border-slate-200 bg-white/95 px-3 py-5 shadow-sm backdrop-blur-xl overflow-y-auto md:block transition-all duration-300 ${
        collapsed ? 'w-19' : 'w-64'
      }`}
      aria-label="Student workspace navigation"
    >
      <p
        className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 ${
          collapsed ? 'sr-only' : ''
        }`}
      >
        Không gian làm việc
      </p>
      <nav className="flex flex-col gap-1.5">
        {items.map(([label, Icon]) => {
          const isActive = activeTab === label
          return (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`group relative flex w-full items-center rounded-xl py-3 text-sm font-semibold transition shrink-0 ${
                collapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } ${
                isActive
                  ? collapsed
                    ? 'text-blue-700'
                    : 'border-l-4 border-blue-600 bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  isActive
                    ? collapsed
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
                }`}
              >
                <Icon className="size-4 shrink-0" />
              </span>
              <span className={collapsed ? 'sr-only' : 'truncate'}>{label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-slate-100 py-3.5 first:pt-0 last:border-b-0">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#17305f]">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  )
}

function CheckOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-3.5 rounded border-slate-300 accent-blue-600" />
      {label}
    </label>
  )
}

// Component Thẻ khóa học: Tối ưu kích thước chữ & ảnh mặc định
function CourseCard({ course }: { course: any }) {
  const numericPrice = typeof course.price === 'number' ? course.price : Number(course.price) || 0
  const isFree = numericPrice === 0

  const instructorName = course.teacher?.fullName || course.instructor || course.instructorName || 'EduFlow Instructor'

  // Ảnh mặc định chất lượng cao nếu Database trả về null/rỗng
  const defaultImage = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600'
  const courseImage = course.thumbnailUrl || course.imageUrl || course.thumbnail || defaultImage

  return (
    <a
      href={`/courses/${course.id || ''}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60 justify-between"
    >
      <div>
        {/* Banner hiển thị ảnh */}
        <div className="relative h-36 w-full overflow-hidden bg-slate-100">
          <img
            src={courseImage}
            alt={course.title || course.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 z-10 bg-gradient-to-b from-black/50 to-transparent">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm ${
                isFree ? 'bg-emerald-500/90' : 'bg-blue-600/90'
              }`}
            >
              {isFree ? 'Free' : course.category || 'Bestseller'}
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

          <p className="mt-2 text-xs text-slate-500">Bởi {instructorName}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-amber-500">
              <Star className="size-3.5 fill-current" /> {course.rating || '4.8'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {course.students || '1.2k'}
            </span>
            <span className="flex items-center gap-1">
              <Clock3 className="size-3.5" /> {course.duration || '12h 00m'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer giá & Trình độ */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <p className={`text-sm font-bold ${isFree ? 'text-emerald-600' : 'text-[#17305f]'}`}>
            {formatPrice(numericPrice)}
          </p>
          <span className="text-[10px] font-semibold text-slate-400">{course.level || 'Beginner'}</span>
        </div>
      </div>
    </a>
  )
}

export default function CoursesPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [dbCourses, setDbCourses] = useState<any[]>([])

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [price, setPrice] = useState('All')
  const [selectedLevels, setSelectedLevels] = useState<string[]>([])
  const [rating, setRating] = useState('All')
  const [sort, setSort] = useState('Most Popular')
  const [search, setSearch] = useState('')
  const [mobileFilters, setMobileFilters] = useState(false)
  const [page, setPage] = useState(1)
  const totalPages = 10

  // Gọi API lấy toàn bộ danh sách khóa học từ Backend
  useEffect(() => {
    fetch('http://localhost:8080/api/courses')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbCourses(data)
        }
      })
      .catch((err) => console.error('Lỗi kết nối API Backend:', err))
  }, [])

  const coursesList = useMemo(() => {
    return dbCourses.length > 0 ? dbCourses : defaultCourses
  }, [dbCourses])

  const toggle = (value: string, values: string[], setter: (next: string[]) => void) =>
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])

  const resetFilters = () => {
    setSelectedCategories([])
    setPrice('All')
    setSelectedLevels([])
    setRating('All')
    setSearch('')
    setPage(1)
  }

  const filteredCourses = useMemo(() => {
    const result = coursesList.filter((course) => {
      const instructorName = course.teacher?.fullName || course.instructor || ''
      const matchesSearch = `${course.title || course.name} ${instructorName}`.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(course.category || course.category?.name)
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(course.level || 'Beginner')
      
      const p = Number(course.price) || 0
      const matchesPrice = price === 'All' || (price === 'Free' ? p === 0 : p > 0)
      
      const r = Number(course.rating) || 4.8
      const matchesRating = rating === 'All' || r >= Number(rating)

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesRating
    })

    return [...result].sort((a, b) => {
      if (sort === 'Highest Rated') return (Number(b.rating) || 0) - (Number(a.rating) || 0)
      if (sort === 'Price: Low to High') return (Number(a.price) || 0) - (Number(b.price) || 0)
      if (sort === 'Newest') return (b.id || 0) - (a.id || 0)
      return (Number(b.students) || 0) - (Number(a.students) || 0)
    })
  }, [coursesList, search, selectedCategories, selectedLevels, price, rating, sort])

  const getPaginationItems = () => {
    const items: (number | string)[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) items.push(i)
    } else {
      if (page <= 3) {
        items.push(1, 2, 3, 4, '...', totalPages)
      } else if (page >= totalPages - 2) {
        items.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        items.push(1, '...', page - 1, page, page + 1, '...', totalPages)
      }
    }
    return items
  }

  const filtersMarkup = (
    <div id="filters" className="flex flex-col gap-1">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-xs font-bold text-[#17305f] uppercase tracking-wider">Bộ lọc tìm kiếm</span>
        <button onClick={resetFilters} className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800">
          <RotateCcw className="size-3" /> Đặt lại
        </button>
      </div>
      <FilterGroup title="Danh mục">
        {categories.map((item) => (
          <CheckOption
            key={item}
            label={item}
            checked={selectedCategories.includes(item)}
            onChange={() => toggle(item, selectedCategories, setSelectedCategories)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Mức giá">
        {[
          ['All', 'Tất cả'],
          ['Free', 'Miễn phí'],
          ['Paid', 'Có phí'],
        ].map(([value, label]) => (
          <label key={value} className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600">
            <input type="radio" name="price" checked={price === value} onChange={() => setPrice(value)} className="size-3.5 accent-blue-600" />
            {label}
          </label>
        ))}
      </FilterGroup>
      <FilterGroup title="Trình độ">
        {levels.map((item) => (
          <CheckOption
            key={item}
            label={item}
            checked={selectedLevels.includes(item)}
            onChange={() => toggle(item, selectedLevels, setSelectedLevels)}
          />
        ))}
      </FilterGroup>
      <FilterGroup title="Đánh giá">
        {[
          ['All', 'Tất cả'],
          ['4.5', '4.5+ sao'],
          ['4.0', '4.0+ sao'],
        ].map(([value, label]) => (
          <label key={value} className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600">
            <input type="radio" name="rating" checked={rating === value} onChange={() => setRating(value)} className="size-3.5 accent-blue-600" />
            {label}
          </label>
        ))}
      </FilterGroup>
    </div>
  )

  return (
    <div className="flex min-h-screen w-screen flex-col bg-[#f8fbff] text-slate-900">
      <Header collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <AppSidebar collapsed={collapsed} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'md:pl-19' : 'md:pl-64'}`}>
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="mb-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-600">
              Khám phá tri thức cùng EduFlow
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#17305f]">Tất cả khóa học</h1>
            <p className="mt-1 text-xs text-slate-500">
              Tìm kiếm và chọn khóa học phù hợp để nâng cao kỹ năng lập trình của bạn.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[200px_1fr] items-start">
            <aside
              className={`${
                mobileFilters ? 'block' : 'hidden'
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
                      setSearch(e.target.value)
                      setPage(1)
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
                      <option>Most Popular</option>
                      <option>Newest</option>
                      <option>Highest Rated</option>
                      <option>Price: Low to High</option>
                    </select>
                  </label>
                </div>
              </div>

              {filteredCourses.length ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredCourses.map((course) => (
                      <CourseCard key={course.id || course.title} course={course} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                  <Search className="mx-auto size-10 text-slate-300" />
                  <h2 className="mt-3 text-base font-bold text-[#17305f]">Không tìm thấy khóa học</h2>
                  <p className="mt-1 text-xs text-slate-500">Hãy thử chọn lại từ khóa hoặc bấm đặt lại bộ lọc.</p>
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
                  typeof item === 'number' ? (
                    <button
                      key={idx}
                      onClick={() => setPage(item)}
                      className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold transition ${
                        page === item
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={idx} className="px-1.5 text-xs font-bold text-slate-400">
                      {item}
                    </span>
                  )
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

        <footer className="mt-16 bg-[#102653] text-blue-100">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-8">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-6 text-blue-200/70">
                Giải pháp học lập trình và phát triển kỹ năng công nghệ hiệu quả.
              </p>
              <div className="mt-5 flex gap-2">
                <a href="#" className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                  <Globe2 className="size-4" />
                </a>
                <a href="#" className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                  <MessageCircle className="size-4" />
                </a>
                <a href="#" className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                  <Users className="size-4" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Nền tảng</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
                <a href="/courses" className="hover:text-white">Duyệt khóa học</a>
                <a href="#filters" className="hover:text-white">Danh mục</a>
                <a href="#" className="hover:text-white">Trợ lý AI</a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Chủ đề hot</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
                <a href="/courses" className="hover:text-white">Lập trình Web</a>
                <a href="/courses" className="hover:text-white">Khoa học dữ liệu</a>
                <a href="/courses" className="hover:text-white">Trí tuệ nhân tạo</a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Hỗ trợ</h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
                <a href="#" className="hover:text-white">Trung tâm hỗ trợ</a>
                <a href="#" className="hover:text-white">Điều khoản sử dụng</a>
                <a href="#" className="hover:text-white">Chính sách bảo mật</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-blue-200/50 lg:px-8">
            © 2026 EduFlow. Learn smarter, grow faster.
          </div>
        </footer>
      </main>
    </div>
  )
}