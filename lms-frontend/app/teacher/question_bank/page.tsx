"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import {
  Plus,
  Search,
  Trash2,
  X,
  HelpCircle,
  Code2,
  FileText,
  Loader2,
  Edit3,
  Edit,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

// --- TYPES KHỚP DATABASE SCHEMA & PAGE_2.TSX ---
type Course = { id: number; title: string };
type Chapter = { id: number; title: string };

type QuestionOption = { id: string; text: string };
type ParsedQuestionOption = QuestionOption & { originalId: string };

type Question = {
  id: number;
  questionText: string;
  optionsJson?: unknown;
  correctOption: string;
  explanation: string | null;
  hint?: string | null;
  courseId: number | null;
  chapterId?: number | null;
  questionType?: "MULTIPLE_CHOICE" | "ESSAY" | "CODE";
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  createdAt?: string;
};

const questionTypeLabels: Record<string, string> = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  ESSAY: "Tự luận",
  CODE: "Lập trình",
};

const difficultyLabels: Record<string, string> = {
  EASY: "Dễ",
  MEDIUM: "Trung bình",
  HARD: "Khó",
};

function parseOptions(value: unknown): ParsedQuestionOption[] {
  let parsed = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return [];
    }
  }
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>;
    const nestedOptions = record.options ?? record.answers ?? record.choices;
    if (Array.isArray(nestedOptions)) parsed = nestedOptions;
    else {
      parsed = Object.entries(record)
        .filter(([key]) => /^(?:[A-D]|OPTION[_ -]?[A-D1-4])$/i.test(key))
        .map(([id, text]) => ({ id: id.toUpperCase(), text }));
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((option, index) => {
    const record = typeof option === "string"
      ? { text: option }
      : typeof option === "object" && option !== null
        ? option as Record<string, unknown>
        : null;
    if (!record) return [];
    const rawId = record.id ?? record.key ?? record.label ?? record.optionId;
    const originalId = typeof rawId === "string" || typeof rawId === "number"
      ? String(rawId).trim().toUpperCase()
      : String.fromCharCode(65 + index);
    const text = record.text ?? record.content ?? record.value ?? record.answer ?? record.optionText;
    const letter = /^[A-D]$/.test(originalId)
      ? originalId
      : /^[1-4]$/.test(originalId)
        ? String.fromCharCode(64 + Number(originalId))
        : /^[A-D]$/.test(String.fromCharCode(65 + index))
          ? String.fromCharCode(65 + index)
          : originalId;
    return typeof text === "string" ? [{ id: letter, originalId, text }] : [];
  });
}

function getCanonicalCorrectOption(correctOption: string, options: ParsedQuestionOption[]): string {
  const normalized = correctOption.trim().toUpperCase();
  const byId = options.find((option) => option.id === normalized || option.originalId === normalized);
  if (byId) return byId.id;
  const numericIndex = Number(normalized.replace(/^OPTION[_ -]?/, ""));
  if (Number.isInteger(numericIndex) && numericIndex >= 1 && numericIndex <= options.length) {
    return options[numericIndex - 1].id;
  }
  return "A";
}

export default function QuestionBankPage() {
  // --- STATES DANH SÁCH & LỌC ---
  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCategories] = useState<Course[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  // States chọn nhiều
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDifficulty, setFilterDifficulty] = useState("ALL");

  // --- STATES MODAL TẠO / SỬA CÂU HỎI ---
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [questionText, setQuestionText] = useState("");
  const [questionCourseId, setQuestionCourseId] = useState("");
  const [questionChapterId, setQuestionChapterId] = useState("");
  const [questionType, setQuestionType] = useState<"MULTIPLE_CHOICE" | "ESSAY" | "CODE">("MULTIPLE_CHOICE");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] = useState("");

  // 4 Ô đáp án nhập trực tiếp
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");

  // Status
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // --- TẢI DỮ LIỆU TỪ BACKEND ---
  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    const [questionResult, courseResult] = await Promise.allSettled([
      apiRequest<Question[]>(`/api/teacher/question-bank${filterCourseId ? `?courseId=${filterCourseId}` : ""}`),
      apiRequest<Course[]>("/api/teacher/courses"),
    ]);

    if (questionResult.status === "fulfilled") {
      setQuestions(questionResult.value);
    } else {
      const cause = questionResult.reason;
      setError(cause instanceof Error ? cause.message : "Không tải được danh sách câu hỏi.");
    }

    if (courseResult.status === "fulfilled") {
      setCategories(courseResult.value);
    } else {
      setCategories([]);
    }
    setLoading(false);
  }, [filterCourseId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Load danh sách chương khi chọn Khóa học trong Form
  useEffect(() => {
    if (!questionCourseId) {
      setChapters([]);
      setQuestionChapterId("");
      return;
    }
    apiRequest<Chapter[]>(`/api/teacher/courses/${questionCourseId}/chapters`)
      .then((data) => setChapters(data || []))
    .catch((cause: unknown) => {
      setChapters([]);
      setError(cause instanceof Error ? cause.message : "Không tải được chương của khóa học.");
    });
  }, [questionCourseId]);

  // Reset Form khi đóng/mở
  const resetForm = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setQuestionCourseId("");
    setQuestionChapterId("");
    setQuestionType("MULTIPLE_CHOICE");
    setDifficulty("EASY");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setExplanation("");
    setHint("");
  };

  const openCreateModal = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText || "");
    setQuestionCourseId(q.courseId ? String(q.courseId) : "");
    setQuestionChapterId(q.chapterId ? String(q.chapterId) : "");
    setQuestionType(q.questionType || "MULTIPLE_CHOICE");
    setDifficulty(q.difficulty || "EASY");
    setCorrectOption(q.correctOption ? getCanonicalCorrectOption(q.correctOption, parseOptions(q.optionsJson)) : "A");
    setExplanation(q.explanation || "");
    setHint(q.hint || "");

    const options = parseOptions(q.optionsJson);
    if (q.questionType === "MULTIPLE_CHOICE" && options.length === 0) {
      setError("Câu hỏi cũ không có đáp án ở định dạng nhận diện được.");
    }
    setOptionA(options.find((o) => o.id === "A")?.text || options[0]?.text || "");
    setOptionB(options.find((o) => o.id === "B")?.text || options[1]?.text || "");
    setOptionC(options.find((o) => o.id === "C")?.text || options[2]?.text || "");
    setOptionD(options.find((o) => o.id === "D")?.text || options[3]?.text || "");

    setShowForm(true);
  };

  // --- XỬ LÝ LƯU CÂU HỎI (TẠO MỚI HOẶC SỬA) ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!questionText.trim()) {
      setError("Vui lòng nhập nội dung câu hỏi.");
      return;
    }

    let optionsPayload: QuestionOption[] = [];
    if (questionType === "MULTIPLE_CHOICE") {
      if (!optionA.trim() || !optionB.trim()) {
        setError("Vui lòng nhập ít nhất Đáp án A và Đáp án B.");
        return;
      }
      optionsPayload = [
        { id: "A", text: optionA.trim() },
        { id: "B", text: optionB.trim() },
      ];
      if (optionC.trim()) optionsPayload.push({ id: "C", text: optionC.trim() });
      if (optionD.trim()) optionsPayload.push({ id: "D", text: optionD.trim() });
    }

    setSaving(true);
    try {
      const payload = {
        questionText: questionText.trim(),
        optionsJson: optionsPayload,
        correctOption: questionType === "MULTIPLE_CHOICE" ? correctOption.trim() : "A",
        explanation: explanation.trim() || null,
        hint: hint.trim() || null,
        courseId: questionCourseId ? Number(questionCourseId) : null,
        chapterId: questionChapterId ? Number(questionChapterId) : null,
        questionType,
        difficulty,
      };

      if (editingQuestion) {
        // Cập nhật câu hỏi (PUT)
        await apiRequest<Question>(`/api/teacher/question-bank/${editingQuestion.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setNotice("Đã cập nhật câu hỏi thành công!");
      } else {
        // Tạo mới câu hỏi (POST)
        await apiRequest<Question>("/api/teacher/question-bank", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setNotice("Đã tạo câu hỏi thành công vào ngân hàng!");
      }

      resetForm();
      setShowForm(false);
      await loadData();
    } catch (cause: any) {
      setError(cause instanceof Error ? cause.message : "Thao tác thất bại.");
    } finally {
      setSaving(false);
    }
  };

  // --- XÓA CÂU HỎI ĐƠN LẺ ---
  const handleRemove = async (id: number) => {
    if (!window.confirm("Xóa câu hỏi này khỏi ngân hàng?")) return;
    setError("");
    setNotice("");
    try {
      await apiRequest(`/api/teacher/question-bank/${id}`, { method: "DELETE" });
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      setNotice("Đã xóa câu hỏi thành công.");
      await loadData();
    } catch (cause: any) {
      setError(cause instanceof Error ? cause.message : "Không xóa được câu hỏi.");
    }
  };

  // --- XÓA CÁC CÂU HỎI ĐÃ CHỌN ---
  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} câu hỏi đã chọn?`)) return;

    setError("");
    setNotice("");
    const deletedIds: number[] = [];
    const failures: string[] = [];
    for (const id of selectedIds) {
      try {
        await apiRequest(`/api/teacher/question-bank/${id}`, { method: "DELETE" });
        deletedIds.push(id);
      } catch (cause) {
        failures.push(cause instanceof Error ? cause.message : `Không xóa được câu hỏi #${id}.`);
      }
    }
    if (deletedIds.length > 0) {
      setSelectedIds((current) => current.filter((id) => !deletedIds.includes(id)));
      setNotice(`Đã xóa ${deletedIds.length} câu hỏi${failures.length ? `; ${failures.length} câu không thể xóa` : ""}.`);
    }
    if (failures.length > 0) setError(failures.join(" "));
    await loadData();
  };

  // Lọc câu hỏi hiển thị
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || q.questionType === filterType;
    const matchesDifficulty = filterDifficulty === "ALL" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesType && matchesDifficulty;
  });

  // Tích chọn tất cả
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredQuestions.map((q) => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Thống kê
  const stats = {
    total: questions.length,
    multipleChoice: questions.filter((q) => !q.questionType || q.questionType === "MULTIPLE_CHOICE").length,
    essay: questions.filter((q) => q.questionType === "ESSAY").length,
    code: questions.filter((q) => q.questionType === "CODE").length,
  };

  return (
    <main className="min-h-screen bg-[#f6f9fd] p-4 text-xs text-slate-800 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* HEADER & NÚT MỞ FORM */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-[#17305f]">Ngân hàng câu hỏi</h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Quản lý và tạo câu hỏi cho các bài quiz và bài tập
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleRemoveSelected}
                className="flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-4 font-bold text-white shadow-md shadow-rose-200 hover:bg-rose-700 transition cursor-pointer"
              >
                <Trash2 className="size-4" /> Xóa ({selectedIds.length}) đã chọn
              </button>
            )}

            <button
              type="button"
              onClick={openCreateModal}
              className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="size-4" /> Tạo câu hỏi
            </button>
          </div>
        </div>

        {/* CẢNH BÁO / THÔNG BÁO */}
        {error && <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-xl">{error}</div>}
        {notice && <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl">{notice}</div>}

        {/* THANH BỘ LỌC DỮ LIỆU */}
        <div className="grid grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="col-span-12 md:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi, chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:border-blue-500"
            />
          </div>

          <div className="col-span-12 sm:col-span-4 md:col-span-3">
            <select
              value={filterCourseId}
              onChange={(e) => setFilterCourseId(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="">Tất cả khóa học</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-6 sm:col-span-4 md:col-span-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả loại</option>
              <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
              <option value="ESSAY">Tự luận</option>
              <option value="CODE">Lập trình</option>
            </select>
          </div>

          <div className="col-span-6 sm:col-span-4 md:col-span-3">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
          </div>
        </div>

        {/* STATS CARDS THỐNG KÊ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tổng câu hỏi</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><HelpCircle className="size-5" /></div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Trắc nghiệm</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.multipleChoice}</h3>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl"><FileText className="size-5" /></div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tự luận</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.essay}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Edit3 className="size-5" /></div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Lập trình</p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.code}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Code2 className="size-5" /></div>
          </div>
        </div>

        {/* BẢNG CÂU HỎI */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      className="rounded cursor-pointer"
                      checked={
                        filteredQuestions.length > 0 &&
                        selectedIds.length === filteredQuestions.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="p-3.5 w-12 text-center">STT</th>
                  <th className="p-3.5">Nội dung câu hỏi</th>
                  <th className="p-3.5">Khóa học</th>
                  <th className="p-3.5">Loại</th>
                  <th className="p-3.5">Mức độ</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Loader2 className="size-5 animate-spin mx-auto mb-2 text-blue-600" />
                      <span>Đang tải dữ liệu câu hỏi...</span>
                    </td>
                  </tr>
                ) : filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                      Chưa có câu hỏi nào trong danh sách.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q, index) => {
                    const courseObj = courses.find((c) => c.id === q.courseId);
                    const options = parseOptions(q.optionsJson);
                    const isChecked = selectedIds.includes(q.id);

                    return (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            className="rounded cursor-pointer"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(q.id, e.target.checked)}
                          />
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="p-3.5 max-w-md">
                          <p className="font-bold text-slate-900">{q.questionText}</p>
                          {options.length > 0 && (
                            <p className="text-[11px] text-slate-400 mt-1">
                              Đáp án đúng: <span className="font-bold text-emerald-600">{q.correctOption}</span> ({options.length} lựa chọn)
                            </p>
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-600">{courseObj?.title || "Dùng chung"}</td>
                        <td className="p-3.5">
                          <span className="bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded text-[10px]">
                            {questionTypeLabels[q.questionType ?? "MULTIPLE_CHOICE"] ?? "Trắc nghiệm"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                            {difficultyLabels[q.difficulty ?? "EASY"] ?? "Dễ"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(q)}
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              title="Chỉnh sửa câu hỏi"
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemove(q.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Xóa câu hỏi"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL THÊM / SỬA CÂU HỎI */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {editingQuestion ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {editingQuestion ? "Cập nhật nội dung câu hỏi trong ngân hàng" : "Thêm câu hỏi vào ngân hàng dùng chung"}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
              {/* CỘT TRÁI (6/12): THÔNG TIN CƠ BẢN */}
              <div className="col-span-12 lg:col-span-6 space-y-3.5">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                  Thông tin cơ bản
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khóa học *</label>
                  <select
                    value={questionCourseId}
                    onChange={(e) => setQuestionCourseId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">-- Dùng chung cho tất cả --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Chương học *</label>
                  <select
                    value={questionChapterId}
                    onChange={(e) => setQuestionChapterId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">-- Chọn Chương học --</option>
                    {chapters.map((ch) => (
                      <option key={ch.id} value={ch.id}>{ch.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loại câu hỏi *</label>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={questionType === "MULTIPLE_CHOICE"}
                        onChange={() => setQuestionType("MULTIPLE_CHOICE")}
                      />
                      Trắc nghiệm
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={questionType === "ESSAY"}
                        onChange={() => setQuestionType("ESSAY")}
                      />
                      Tự luận
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={questionType === "CODE"}
                        onChange={() => setQuestionType("CODE")}
                      />
                      Lập trình
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ *</label>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="diff"
                        checked={difficulty === "EASY"}
                        onChange={() => setDifficulty("EASY")}
                      />
                      Dễ
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="diff"
                        checked={difficulty === "MEDIUM"}
                        onChange={() => setDifficulty("MEDIUM")}
                      />
                      Trung bình
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="diff"
                        checked={difficulty === "HARD"}
                        onChange={() => setDifficulty("HARD")}
                      />
                      Khó
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi *</label>
                  <textarea
                    required
                    rows={3}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Nhập nội dung câu hỏi..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gợi ý (tùy chọn)</label>
                  <textarea
                    rows={2}
                    value={hint}
                    onChange={(e) => setHint(e.target.value)}
                    placeholder="Nhập gợi ý cho học viên..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* CỘT PHẢI (6/12): ĐÁP ÁN & GIẢI THÍCH */}
              <div className="col-span-12 lg:col-span-6 space-y-3.5">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-1">
                  Đáp án & Hướng dẫn
                </h3>

                {questionType === "MULTIPLE_CHOICE" ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">A</span>
                      <input
                        type="text"
                        required={questionType === "MULTIPLE_CHOICE"}
                        value={optionA}
                        onChange={(e) => setOptionA(e.target.value)}
                        placeholder="Nhập đáp án A..."
                        className="flex-1 rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">B</span>
                      <input
                        type="text"
                        required={questionType === "MULTIPLE_CHOICE"}
                        value={optionB}
                        onChange={(e) => setOptionB(e.target.value)}
                        placeholder="Nhập đáp án B..."
                        className="flex-1 rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">C</span>
                      <input
                        type="text"
                        value={optionC}
                        onChange={(e) => setOptionC(e.target.value)}
                        placeholder="Nhập đáp án C (tùy chọn)..."
                        className="flex-1 rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">D</span>
                      <input
                        type="text"
                        value={optionD}
                        onChange={(e) => setOptionD(e.target.value)}
                        placeholder="Nhập đáp án D (tùy chọn)..."
                        className="flex-1 rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Đáp án đúng *</label>
                      <select
                        value={correctOption}
                        onChange={(e) => setCorrectOption(e.target.value)}
                        className="w-32 rounded-xl border border-slate-200 p-2 text-xs font-bold text-emerald-600 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {[
                          ["A", optionA],
                          ["B", optionB],
                          ["C", optionC],
                          ["D", optionD],
                        ].filter(([, optionText]) => optionText.trim()).map(([id]) => (
                          <option key={id} value={id}>Đáp án {id}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 border rounded-xl text-slate-500 text-xs italic">
                    Câu hỏi dạng Tự luận / Lập trình không cần chọn A/B/C/D.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giải thích (tùy chọn)</label>
                  <textarea
                    rows={3}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="Nhập giải thích chi tiết cho câu hỏi..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {saving && <Loader2 className="size-3.5 animate-spin" />}
                    <span>{saving ? "Đang lưu..." : editingQuestion ? "Lưu thay đổi" : "Lưu câu hỏi"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}