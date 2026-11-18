"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Brain,
  ChevronDown,
  Code2,
  Database,
  Globe2,
  LayoutGrid,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";

type StudentCategory = {
  name: string;
  label: string;
  aliases: string[];
  icon: LucideIcon;
  tint: string;
  showOnDashboard?: boolean;
};

export const studentCategories: StudentCategory[] = [
  { name: "Programming", label: "Lập trình", aliases: ["programming"], icon: Code2, tint: "bg-blue-50 text-blue-600" },
  { name: "Web Development", label: "Phát triển Web", aliases: ["web development", "web dev"], icon: Globe2, tint: "bg-cyan-50 text-cyan-600" },
  { name: "Database", label: "Cơ sở dữ liệu", aliases: ["database"], icon: Database, tint: "bg-violet-50 text-violet-600" },
  { name: "Artificial Intelligence", label: "Trí tuệ nhân tạo", aliases: ["artificial intelligence", "ai"], icon: Brain, tint: "bg-fuchsia-50 text-fuchsia-600" },
  { name: "Data Science", label: "Khoa học dữ liệu", aliases: ["data science"], icon: Target, tint: "bg-amber-50 text-amber-600" },
  { name: "Cyber Security", label: "An ninh mạng", aliases: ["cyber security", "security"], icon: ShieldCheck, tint: "bg-emerald-50 text-emerald-600" },
];

export function matchesStudentCategory(courseCategory: string, selectedCategoryName: string): boolean {
  const normalizedCategory = courseCategory.trim().toLocaleLowerCase("vi");
  const selectedCategory = studentCategories.find((category) => category.name === selectedCategoryName);
  const aliases = selectedCategory
    ? [selectedCategory.name, selectedCategory.label, ...selectedCategory.aliases]
    : [selectedCategoryName];

  return aliases.some((alias) => {
    const normalizedAlias = alias.toLocaleLowerCase("vi");
    return normalizedAlias.length <= 2
      ? normalizedCategory === normalizedAlias
      : normalizedCategory.includes(normalizedAlias);
  });
}

export function getStudentCategoryLabel(categoryName?: string | null): string {
  if (!categoryName?.trim()) return "Chưa phân loại";
  if (categoryName.trim().toLocaleLowerCase("vi") === "general") return "Khác";
  return studentCategories.find((category) =>
    matchesStudentCategory(categoryName, category.name),
  )?.label ?? categoryName;
}

export function StudentCategoryMenu({
  variant = "desktop",
  onSelect,
}: {
  variant?: "desktop" | "mobile";
  onSelect?: (categoryName: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mobile = variant === "mobile";
  const linkClass = mobile
    ? "flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
    : "flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700";

  function selectCategory(categoryName: string | null) {
    setIsOpen(false);
    onSelect?.(categoryName);
  }

  return (
    <div ref={menuRef} className={`relative ${mobile ? "w-full" : "shrink-0"}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={mobile
          ? "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
          : "flex items-center gap-1.5 rounded-lg py-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"}
      >
        Danh mục
        <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div
          role="menu"
          className={`absolute z-50 mt-2 max-h-[min(70vh,24rem)] w-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/60 ${mobile ? "left-3 top-full mt-0" : "left-0 top-full"}`}
        >
          <Link
            href="/courses"
            role="menuitem"
            onClick={() => selectCategory(null)}
            className={linkClass}
          >
            <LayoutGrid className="mr-2 size-4 text-slate-400" />
            Tất cả khóa học
          </Link>
          <div className="my-1 border-t border-slate-100" />
          {studentCategories.map(({ name, label, icon: Icon }) => (
            <Link
              key={name}
              href={`/courses?category=${encodeURIComponent(name)}`}
              role="menuitem"
              onClick={() => selectCategory(name)}
              className={linkClass}
            >
              <Icon className="mr-2 size-4 text-blue-500" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
