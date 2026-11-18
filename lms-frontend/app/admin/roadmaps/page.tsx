"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronDown,
  GitBranch,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { ROADMAP_ICON_OPTIONS, RoadmapIcon } from "@/components/roadmap-icon";

type RoadmapStage = {
  id?: number;
  title: string;
  description: string;
  orderIndex: number;
  durationWeeks: number | null;
  courseId: number | null;
  courseTitle?: string | null;
};

type Roadmap = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  durationWeeks: number | null;
  targetAudience: string | null;
  iconUrl: string | null;
  colorTheme: string;
  isPublished: boolean;
  stages: RoadmapStage[];
};

type Course = {
  id: number;
  title: string;
  isPublished?: boolean;
};

type RoadmapInput = Omit<Roadmap, "id">;

const EMPTY_ROADMAP: RoadmapInput = {
  title: "",
  slug: "",
  description: "",
  category: "",
  durationWeeks: null,
  targetAudience: "",
  iconUrl: "",
  colorTheme: "from-blue-600 to-indigo-700",
  isPublished: false,
  stages: [],
};

const COLOR_THEMES = [
  { value: "from-blue-600 to-indigo-700", label: "Đại dương" },
  { value: "from-violet-600 to-purple-800", label: "Tím mộng mơ" },
  { value: "from-emerald-500 to-teal-700", label: "Thiên nhiên" },
  { value: "from-amber-500 to-orange-700", label: "Nắng ấm" },
  { value: "from-cyan-500 to-blue-800", label: "Bầu trời" },
];

const DEFAULT_COLOR_THEME = COLOR_THEMES[0].value;

function toInput(roadmap: Roadmap): RoadmapInput {
  return {
    title: roadmap.title,
    slug: roadmap.slug,
    description: roadmap.description ?? "",
    category: roadmap.category ?? "",
    durationWeeks: roadmap.durationWeeks ?? null,
    targetAudience: roadmap.targetAudience ?? "",
    iconUrl: roadmap.iconUrl ?? "",
    colorTheme: roadmap.colorTheme || DEFAULT_COLOR_THEME,
    isPublished: roadmap.isPublished,
    stages: [...roadmap.stages]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((stage, index) => ({
        title: stage.title,
        description: stage.description ?? "",
        orderIndex: index + 1,
        durationWeeks: stage.durationWeeks ?? null,
        courseId: stage.courseId ?? null,
      })),
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminRoadmapManagementPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<RoadmapInput>({ ...EMPTY_ROADMAP });
  const [slugEdited, setSlugEdited] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"details" | "stages">("details");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [roadmapData, courseData] = await Promise.all([
        apiRequest<Roadmap[]>("/api/admin/roadmaps"),
        apiRequest<Course[]>("/api/admin/courses"),
      ]);
      setRoadmaps(roadmapData);
      setCourses(courseData);
      setSelectedId((current) =>
        current !== null && roadmapData.some((roadmap) => roadmap.id === current)
          ? current
          : roadmapData[0]?.id ?? null,
      );
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không tải được dữ liệu lộ trình.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRoadmaps = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return roadmaps.filter((roadmap) => {
      const matchesQuery =
        !query ||
        roadmap.title.toLocaleLowerCase("vi").includes(query) ||
        roadmap.slug.toLocaleLowerCase("vi").includes(query);
      const matchesStatus =
        publishedFilter === "ALL" ||
        (publishedFilter === "PUBLISHED" && roadmap.isPublished) ||
        (publishedFilter === "DRAFT" && !roadmap.isPublished);
      return matchesQuery && matchesStatus;
    });
  }, [roadmaps, search, publishedFilter]);

  const selectedRoadmap = roadmaps.find((roadmap) => roadmap.id === selectedId) ?? null;
  const publishedCount = roadmaps.filter((roadmap) => roadmap.isPublished).length;
  const stageCount = roadmaps.reduce((total, roadmap) => total + roadmap.stages.length, 0);

  function openCreate() {
    setEditingId(null);
    setSlugEdited(false);
    setAdvancedOpen(false);
    setModalTab("details");
    setDraft({ ...EMPTY_ROADMAP, stages: [] });
    setEditorOpen(true);
  }

  function openEdit(roadmap: Roadmap) {
    setEditingId(roadmap.id);
    setSlugEdited(true);
    setAdvancedOpen(false);
    setModalTab("details");
    setDraft(toInput(roadmap));
    setEditorOpen(true);
  }

  function updateStage(index: number, patch: Partial<RoadmapStage>) {
    setDraft((current) => ({
      ...current,
      stages: current.stages.map((stage, stageIndex) =>
        stageIndex === index ? { ...stage, ...patch } : stage,
      ),
    }));
  }

  function moveStage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.stages.length) return;
    setDraft((current) => {
      const stages = [...current.stages];
      [stages[index], stages[target]] = [stages[target], stages[index]];
      return {
        ...current,
        stages: stages.map((stage, stageIndex) => ({ ...stage, orderIndex: stageIndex + 1 })),
      };
    });
  }

  async function saveRoadmap(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload: RoadmapInput = {
      ...draft,
      title: draft.title.trim(),
      slug: draft.slug.trim() || slugify(draft.title),
      description: draft.description?.trim() || null,
      category: draft.category?.trim() || null,
      durationWeeks: draft.durationWeeks || null,
      targetAudience: draft.targetAudience?.trim() || null,
      iconUrl: draft.iconUrl?.trim() || null,
      stages: draft.stages.map((stage, index) => ({
        ...stage,
        title: stage.title.trim(),
        description: stage.description.trim(),
        orderIndex: index + 1,
        durationWeeks: stage.durationWeeks || null,
        courseId: stage.courseId || null,
      })),
    };
    if (!payload.title || !payload.slug) {
      setError("Vui lòng nhập tên và đường dẫn (slug) cho lộ trình.");
      return;
    }
    if (payload.stages.some((stage) => !stage.title)) {
      setError("Mỗi chặng cần có tiêu đề.");
      return;
    }
    const wasPublished = editingId !== null && roadmaps.find((item) => item.id === editingId)?.isPublished;
    if (
      payload.isPublished &&
      !wasPublished &&
      (payload.stages.length === 0 || payload.stages.some((stage) => stage.courseId === null))
    ) {
      setError("Trước khi công khai, hãy thêm ít nhất một chặng và gắn một khóa học cho mỗi chặng.");
      return;
    }
    if (payload.isPublished && !wasPublished && !window.confirm("Công khai lộ trình này cho học viên?")) {
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editingId === null) {
        const created = await apiRequest<Roadmap>("/api/admin/roadmaps", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setRoadmaps((current) => [...current, created]);
        setSelectedId(created.id);
      } else {
        const updated = await apiRequest<Roadmap>(`/api/admin/roadmaps/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setRoadmaps((current) =>
          current.map((roadmap) => (roadmap.id === updated.id ? updated : roadmap)),
        );
        setSelectedId(updated.id);
      }
      setEditorOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được lộ trình.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRoadmap(roadmap: Roadmap) {
    if (!window.confirm(`Xóa lộ trình "${roadmap.title}"? Học viên đang theo lộ trình này cũng sẽ bị gỡ đăng ký.`)) {
      return;
    }
    setDeletingId(roadmap.id);
    setError("");
    try {
      await apiRequest<void>(`/api/admin/roadmaps/${roadmap.id}`, { method: "DELETE" });
      setRoadmaps((current) => current.filter((item) => item.id !== roadmap.id));
      setSelectedId((current) => (current === roadmap.id ? null : current));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không xóa được lộ trình.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[#f4f7fc] p-4 text-slate-800 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="size-6 text-blue-600" />
              <h1 className="text-xl font-extrabold text-[#17305f]">Quản lý lộ trình học tập</h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Tạo lộ trình và sắp xếp các khóa học thành từng chặng.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
          >
            <Plus className="size-4" /> Tạo lộ trình
          </button>
        </div>

        {error && (
          <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Đóng thông báo">
              <X className="size-4" />
            </button>
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Tổng lộ trình", value: roadmaps.length, icon: GitBranch, tone: "bg-blue-50 text-blue-600" },
            { label: "Đang công khai", value: publishedCount, icon: Check, tone: "bg-emerald-50 text-emerald-600" },
            { label: "Tổng số chặng", value: stageCount, icon: BookOpen, tone: "bg-violet-50 text-violet-600" },
          ].map(({ label, value, icon: Icon, tone }) => (
            <article key={label} className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.04)]">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-black text-slate-900">{value.toLocaleString("vi-VN")}</p>
              </div>
              <span className={`flex size-10 items-center justify-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
            </article>
          ))}
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.65fr)]">
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_18px_rgba(23,48,95,0.04)]">
            <div className="space-y-3 border-b border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900">Danh sách lộ trình</h2>
                <span className="text-[11px] text-slate-400">{filteredRoadmaps.length} mục</span>
              </div>
              <div className="flex gap-2">
                <label className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm lộ trình..."
                    className="w-full rounded-xl border border-slate-200 py-2 pl-8 pr-3 text-xs outline-none focus:border-blue-500"
                  />
                </label>
                <select
                  aria-label="Lọc trạng thái"
                  value={publishedFilter}
                  onChange={(event) => setPublishedFilter(event.target.value as typeof publishedFilter)}
                  className="rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none focus:border-blue-500"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="PUBLISHED">Công khai</option>
                  <option value="DRAFT">Bản nháp</option>
                </select>
              </div>
            </div>

            <div className="max-h-[70vh] space-y-2 overflow-y-auto p-3">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="size-5 animate-spin text-blue-600" /></div>
              ) : filteredRoadmaps.length === 0 ? (
                <p className="px-3 py-10 text-center text-xs text-slate-500">
                  {roadmaps.length ? "Không tìm thấy lộ trình phù hợp." : "Chưa có lộ trình nào. Hãy tạo lộ trình đầu tiên."}
                </p>
              ) : filteredRoadmaps.map((roadmap) => {
                const active = roadmap.id === selectedId;
                return (
                  <button
                    key={roadmap.id}
                    type="button"
                    onClick={() => setSelectedId(roadmap.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      active ? "border-blue-300 bg-blue-50/70 ring-1 ring-blue-500/15" : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br ${roadmap.colorTheme || DEFAULT_COLOR_THEME} text-white`}>
                      <RoadmapIcon value={roadmap.iconUrl} className="size-5" imageClassName="size-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-slate-900">{roadmap.title}</span>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">{roadmap.slug}</span>
                      <span className="mt-1 block truncate text-[10px] text-slate-400">
                        {[roadmap.category, roadmap.durationWeeks ? `${roadmap.durationWeeks} tuần` : null, `${roadmap.stages.length} chặng`].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold ${roadmap.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {roadmap.isPublished ? "Công khai" : "Bản nháp"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="min-w-0">
            {selectedRoadmap ? (
              <div className="space-y-4">
                <div className={`relative overflow-hidden rounded-2xl bg-linear-to-r ${selectedRoadmap.colorTheme || DEFAULT_COLOR_THEME} p-5 text-white shadow-lg`}>
                  <GitBranch className="absolute -bottom-5 -right-4 size-36 opacity-10" />
                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/15">
                        <RoadmapIcon value={selectedRoadmap.iconUrl} className="size-6" imageClassName="size-full object-cover" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-extrabold">{selectedRoadmap.title}</h2>
                        <p className="mt-1 text-xs text-white/75">/{selectedRoadmap.slug}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button type="button" onClick={() => openEdit(selectedRoadmap)} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-bold hover:bg-white/25">
                        <Pencil className="size-3.5" /> Sửa
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === selectedRoadmap.id}
                        onClick={() => void deleteRoadmap(selectedRoadmap)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/80 px-3 py-2 text-xs font-bold hover:bg-red-500 disabled:opacity-60"
                      >
                        {deletingId === selectedRoadmap.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                        Xóa
                      </button>
                    </div>
                  </div>
                  {selectedRoadmap.description && (
                    <p className="relative mt-4 max-w-3xl text-xs leading-5 text-white/85">{selectedRoadmap.description}</p>
                  )}
                  <div className="relative mt-4 flex flex-wrap gap-2 text-[10px] font-semibold">
                    <span className="rounded-full bg-white/15 px-2.5 py-1">{selectedRoadmap.stages.length} chặng</span>
                    <span className="rounded-full bg-white/15 px-2.5 py-1">{selectedRoadmap.isPublished ? "Đang công khai" : "Bản nháp"}</span>
                    {selectedRoadmap.category && <span className="rounded-full bg-white/15 px-2.5 py-1">{selectedRoadmap.category}</span>}
                    {selectedRoadmap.durationWeeks && <span className="rounded-full bg-white/15 px-2.5 py-1">Dự kiến {selectedRoadmap.durationWeeks} tuần</span>}
                    {selectedRoadmap.targetAudience && <span className="rounded-full bg-white/15 px-2.5 py-1">Dành cho {selectedRoadmap.targetAudience}</span>}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_18px_rgba(23,48,95,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Các chặng trong lộ trình</h3>
                      <p className="mt-1 text-[11px] text-slate-500">Thứ tự này được dùng để hiển thị tiến độ học viên.</p>
                    </div>
                    <button type="button" onClick={() => openEdit(selectedRoadmap)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-bold text-blue-700 hover:bg-blue-50">
                      <Pencil className="size-3.5" /> Sửa chặng
                    </button>
                  </div>
                  {selectedRoadmap.stages.length === 0 ? (
                    <p className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-xs text-slate-500">
                      Lộ trình chưa có chặng nào.
                    </p>
                  ) : (
                    <ol className="mt-4 space-y-3">
                      {[...selectedRoadmap.stages].sort((a, b) => a.orderIndex - b.orderIndex).map((stage, index) => (
                        <li key={stage.id ?? `${selectedRoadmap.id}-${stage.orderIndex}`} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</span>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900">{stage.title}</h4>
                            {stage.description && <p className="mt-1 text-[11px] leading-5 text-slate-500">{stage.description}</p>}
                            <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-400">
                              <BookOpen className="size-3" />
                              {stage.courseTitle || courses.find((course) => course.id === stage.courseId)?.title || "Chưa gắn khóa học"}
                            </p>
                          </div>
                          {stage.durationWeeks && (
                            <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                              {stage.durationWeeks} tuần
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <GitBranch className="size-9 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-700">Chưa chọn lộ trình</p>
                <p className="mt-1 text-xs text-slate-500">Chọn một lộ trình để xem chi tiết hoặc tạo lộ trình mới.</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 sm:p-6" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setEditorOpen(false);
        }}>
          <form onSubmit={saveRoadmap} className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{editingId === null ? "Tạo lộ trình mới" : "Chỉnh sửa lộ trình"}</h2>
                <p className="mt-1 text-[11px] text-slate-500">Thông tin và các chặng sẽ được lưu vào cơ sở dữ liệu.</p>
              </div>
              <button type="button" disabled={saving} onClick={() => setEditorOpen(false)} aria-label="Đóng" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
            </div>
            <div className="grid grid-cols-2 border-b border-slate-100 px-5 pt-2">
              <button
                type="button"
                role="tab"
                aria-selected={modalTab === "details"}
                onClick={() => setModalTab("details")}
                className={`border-b-2 px-3 py-3 text-xs font-bold ${modalTab === "details" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Thông tin lộ trình
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={modalTab === "stages"}
                onClick={() => setModalTab("stages")}
                className={`border-b-2 px-3 py-3 text-xs font-bold ${modalTab === "stages" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                Các chặng ({draft.stages.length})
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {modalTab === "details" ? (
              <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                  Tên lộ trình *
                  <input required maxLength={255} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value, slug: slugEdited ? current.slug : slugify(event.target.value) }))} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" />
                  <span className="block truncate text-[10px] font-normal text-slate-400">
                    Đường dẫn: /{draft.slug || "ten-lo-trinh"}
                  </span>
                </label>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[11px] font-bold text-slate-700">Đường dẫn được tạo tự động</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                    Slug lấy từ tên lộ trình. Bạn chỉ cần chỉnh trong phần nâng cao nếu muốn thay đổi.
                  </p>
                </div>
              </div>
              <label className="block space-y-1.5 text-xs font-semibold text-slate-700">
                Mô tả
                <textarea rows={2} value={draft.description ?? ""} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500" />
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                  Danh mục
                  <input
                    maxLength={255}
                    list="roadmap-category-options"
                    value={draft.category ?? ""}
                    onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                    placeholder="Ví dụ: Web Fullstack"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-normal outline-none focus:border-blue-500"
                  />
                  <datalist id="roadmap-category-options">
                    {["Lập trình", "Web Fullstack", "Khoa học dữ liệu", "Trí tuệ nhân tạo", "Digital Marketing"].map((item) => <option key={item} value={item} />)}
                  </datalist>
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                  Thời lượng dự kiến
                  <span className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={520}
                      value={draft.durationWeeks ?? ""}
                      onChange={(event) => setDraft((current) => ({ ...current, durationWeeks: event.target.value ? Number(event.target.value) : null }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-normal outline-none focus:border-blue-500"
                    />
                    <span className="text-[11px] font-medium text-slate-500">tuần</span>
                  </span>
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-slate-700">
                  Đối tượng học viên
                  <input
                    maxLength={255}
                    list="roadmap-audience-options"
                    value={draft.targetAudience ?? ""}
                    onChange={(event) => setDraft((current) => ({ ...current, targetAudience: event.target.value }))}
                    placeholder="Ví dụ: Người mới bắt đầu"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-normal outline-none focus:border-blue-500"
                  />
                  <datalist id="roadmap-audience-options">
                    {["Người mới bắt đầu", "Đã có kiến thức cơ bản", "Trình độ trung cấp", "Nâng cao"].map((item) => <option key={item} value={item} />)}
                  </datalist>
                </label>
              </div>

              <section className="space-y-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-700">Biểu tượng</h3>
                  <p className="mt-1 text-[10px] text-slate-500">Chọn biểu tượng có sẵn; chưa cần tìm hoặc nhập URL ảnh.</p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {ROADMAP_ICON_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={draft.iconUrl === value}
                      onClick={() => setDraft((current) => ({ ...current, iconUrl: value }))}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-[10px] font-semibold transition ${
                        draft.iconUrl === value ? "border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10" : "border-slate-200 text-slate-600 hover:border-blue-200"
                      }`}
                    >
                      <span className={`flex size-9 items-center justify-center rounded-lg bg-linear-to-br ${draft.colorTheme || DEFAULT_COLOR_THEME} text-white`}>
                        <RoadmapIcon value={value} className="size-4.5" />
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
                {draft.iconUrl && !ROADMAP_ICON_OPTIONS.some((option) => option.value === draft.iconUrl) && (
                  <p className="text-[10px] text-amber-700">Đang giữ biểu tượng/ảnh đã lưu trước đây. Chọn biểu tượng ở trên để thay đổi.</p>
                )}
              </section>

              <section className="space-y-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-700">Màu chủ đề</h3>
                  <p className="mt-1 text-[10px] text-slate-500">Chọn màu xem trước thay vì nhập mã màu.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      aria-pressed={draft.colorTheme === theme.value}
                      onClick={() => setDraft((current) => ({ ...current, colorTheme: theme.value }))}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left text-[10px] font-semibold text-slate-700 transition ${
                        draft.colorTheme === theme.value ? "border-blue-400 bg-blue-50 ring-2 ring-blue-500/10" : "border-slate-200 hover:border-blue-200"
                      }`}
                    >
                      <span className={`h-7 w-9 shrink-0 rounded-lg bg-linear-to-r ${theme.value}`} />
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700">Trạng thái khi lưu</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    aria-pressed={!draft.isPublished}
                    onClick={() => setDraft((current) => ({ ...current, isPublished: false }))}
                    className={`rounded-xl border p-3 text-left transition ${!draft.isPublished ? "border-blue-400 bg-blue-50 ring-2 ring-blue-500/10" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <span className="block text-xs font-bold text-slate-800">Lưu bản nháp</span>
                    <span className="mt-1 block text-[10px] leading-4 text-slate-500">Chưa hiển thị cho học viên. Đây là lựa chọn mặc định.</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={draft.isPublished}
                    onClick={() => setDraft((current) => ({ ...current, isPublished: true }))}
                    className={`rounded-xl border p-3 text-left transition ${draft.isPublished ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-500/10" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <span className="block text-xs font-bold text-slate-800">Công khai cho học viên</span>
                    <span className="mt-1 block text-[10px] leading-4 text-slate-500">Chỉ chọn sau khi đã hoàn thiện các chặng và khóa học.</span>
                  </button>
                </div>
              </section>

              <details
                open={advancedOpen}
                onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}
                className="rounded-xl border border-slate-200"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-xs font-bold text-slate-700">
                  Tùy chỉnh nâng cao
                  <ChevronDown className="size-4 text-slate-400" />
                </summary>
                <div className="space-y-2 border-t border-slate-100 p-3">
                  <label className="block space-y-1.5 text-[11px] font-semibold text-slate-700">
                    Slug
                    <input
                      maxLength={255}
                      value={draft.slug}
                      onChange={(event) => {
                        setSlugEdited(true);
                        setDraft((current) => ({ ...current, slug: slugify(event.target.value) }));
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-xs font-normal outline-none focus:border-blue-500"
                    />
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[10px] leading-4 text-slate-500">Dùng chữ thường, số và dấu gạch ngang; slug phải là duy nhất.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSlugEdited(false);
                        setDraft((current) => ({ ...current, slug: slugify(current.title) }));
                      }}
                      className="shrink-0 text-[10px] font-bold text-blue-700 hover:underline"
                    >
                      Tạo lại từ tên
                    </button>
                  </div>
                </div>
              </details>

              </div>
              ) : (
              <div className="space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Các chặng học</h3>
                <p className="mt-1 text-[11px] text-slate-500">Sắp xếp thứ tự, đặt thời lượng dự kiến và gắn một khóa học cho mỗi chặng.</p>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-900">Các chặng</h3>
                    <p className="mt-1 text-[10px] text-slate-500">Mỗi chặng có tên riêng và gắn tối đa một khóa học.</p>
                  </div>
                  <button type="button" onClick={() => setDraft((current) => ({
                    ...current,
                    stages: [...current.stages, { title: "", description: "", orderIndex: current.stages.length + 1, durationWeeks: null, courseId: null }],
                  }))} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-2 text-[11px] font-bold text-blue-700 hover:bg-blue-50">
                    <Plus className="size-3.5" /> Thêm chặng
                  </button>
                </div>
                <div className="mt-3 space-y-3">
                  {draft.stages.map((stage, index) => (
                    <fieldset key={`${editingId ?? "new"}-${index}`} className="space-y-3 rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <legend className="px-1 text-[11px] font-bold text-slate-700">Chặng {index + 1}</legend>
                        <div className="flex items-center gap-1">
                          <button type="button" disabled={index === 0} onClick={() => moveStage(index, -1)} aria-label="Chuyển chặng lên" className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
                          <button type="button" disabled={index === draft.stages.length - 1} onClick={() => moveStage(index, 1)} aria-label="Chuyển chặng xuống" className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
                          <button type="button" onClick={() => setDraft((current) => ({ ...current, stages: current.stages.filter((_, stageIndex) => stageIndex !== index).map((item, stageIndex) => ({ ...item, orderIndex: stageIndex + 1 })) }))} aria-label="Xóa chặng" className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="space-y-1 text-[11px] font-semibold text-slate-600">
                          Tên chặng *
                          <input required maxLength={255} value={stage.title} onChange={(event) => updateStage(index, { title: event.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal outline-none focus:border-blue-500" />
                        </label>
                        <label className="space-y-1 text-[11px] font-semibold text-slate-600">
                          Thời lượng
                          <span className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={520}
                              value={stage.durationWeeks ?? ""}
                              onChange={(event) => updateStage(index, { durationWeeks: event.target.value ? Number(event.target.value) : null })}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal outline-none focus:border-blue-500"
                            />
                            <span className="text-[10px] font-medium text-slate-500">tuần</span>
                          </span>
                        </label>
                        <label className="space-y-1 text-[11px] font-semibold text-slate-600">
                          Khóa học trong chặng
                          <select value={stage.courseId ?? ""} onChange={(event) => updateStage(index, { courseId: event.target.value ? Number(event.target.value) : null })} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:border-blue-500">
                            <option value="">Chưa gắn khóa học</option>
                            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                          </select>
                        </label>
                      </div>
                      <label className="block space-y-1 text-[11px] font-semibold text-slate-600">
                        Mô tả chặng
                        <textarea rows={2} value={stage.description} onChange={(event) => updateStage(index, { description: event.target.value })} className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-xs font-normal outline-none focus:border-blue-500" />
                      </label>
                    </fieldset>
                  ))}
                  {draft.stages.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-center text-[11px] text-slate-500">Chưa có chặng nào.</p>}
                </div>
              </div>
              </div>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
              <button type="button" disabled={saving} onClick={() => setEditorOpen(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-60">Hủy</button>
              <button type="submit" disabled={saving} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-60 ${draft.isPublished ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {draft.isPublished ? "Lưu và công khai" : editingId === null ? "Lưu bản nháp" : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
