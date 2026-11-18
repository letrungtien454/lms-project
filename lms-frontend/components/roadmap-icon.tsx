import {
  BookOpen,
  Code2,
  Database,
  GitBranch,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export const ROADMAP_ICON_OPTIONS: Array<{
  value: string;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "preset:code", label: "Lập trình", icon: Code2 },
  { value: "preset:book", label: "Kiến thức", icon: BookOpen },
  { value: "preset:database", label: "Dữ liệu", icon: Database },
  { value: "preset:idea", label: "Sáng tạo", icon: Sparkles },
  { value: "preset:roadmap", label: "Lộ trình", icon: GitBranch },
];

export function RoadmapIcon({
  value,
  className = "size-5",
  imageClassName = "size-full rounded-xl object-cover",
}: {
  value?: string | null;
  className?: string;
  imageClassName?: string;
}) {
  const preset = ROADMAP_ICON_OPTIONS.find((option) => option.value === value);
  if (preset) {
    const Icon = preset.icon;
    return <Icon className={className} aria-hidden="true" />;
  }

  if (value?.trim()) {
    const src = /^https?:\/\//i.test(value)
      ? value
      : new URL(value.startsWith("/") ? value : `/${value}`, API_BASE_URL).toString();
    return <img src={src} alt="" className={imageClassName} />;
  }

  return <GitBranch className={className} aria-hidden="true" />;
}
