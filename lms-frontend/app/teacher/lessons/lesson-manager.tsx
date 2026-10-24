"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";
import { API_BASE_URL, apiRequest } from "@/lib/api";

type Course = { id: number; title: string };
type Attachment = {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: "PDF" | "CODE" | "ZIP" | "DOCUMENT";
  fileSizeBytes: number | null;
};
type Lesson = {
  id: number;
  chapterId: number;
  title: string;
  lessonType: "VIDEO" | "ARTICLE" | "CODE_PRACTICE" | "QUIZ" | "DOCUMENT" | "DOCUMENT_AND_CODING";
  videoUrl: string | null;
  contentText: string | null;
  durationSeconds: number;
  orderIndex: number;
  isFreePreview: boolean;
  attachments: Attachment[];
};
type Chapter = {
  id: number;
  courseId: number;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
};
type Question = { id: number; questionText: string; courseId: number | null };
type VideoQuestionDraft = { questionId: number | null; minutes: string; seconds: string };

type QuizConfig = {
  title: string;
  timeLimitMinutes: number;
  passScore: number;
  questionCount: number; // Số câu hỏi rút ngẫu nhiên
  selectionMode: "RANDOM" | "MANUAL"; // Chế độ: Rút ngẫu nhiên hoặc Chọn thủ công
  questionIds: number[];
};

type LessonForm = {
  title: string;
  lessonType: Lesson["lessonType"];
  videoUrl: string;
  contentText: string;
  durationSeconds: string;
  orderIndex: string;
  isFreePreview: boolean;
};

const emptyLessonForm: LessonForm = {
  title: "",
  lessonType: "VIDEO",
  videoUrl: "",
  contentText: "",
  durationSeconds: "0",
  orderIndex: "1",
  isFreePreview: false,
};

const emptyVideoQuestion: VideoQuestionDraft = { questionId: null, minutes: "0", seconds: "0" };

const lessonTypeLabels: Record<Lesson["lessonType"], string> = {
  VIDEO: "Video",
  ARTICLE: "Bài đọc",
  DOCUMENT: "Tài liệu",
  CODE_PRACTICE: "Thực hành code",
  DOCUMENT_AND_CODING: "Tài liệu & thực hành",
  QUIZ: "Quiz",
};

function lessonIcon(type: Lesson["lessonType"]) {
  if (type === "VIDEO") return Video;
  if (type === "QUIZ") return HelpCircle;
  return FileText;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function buildVideoQuestionPayload(drafts: VideoQuestionDraft[]) {
  const activeDrafts = drafts.filter(
    (draft) => draft.questionId !== null || draft.minutes !== "0" || draft.seconds !== "0"
  );
  const seenQuestionIds = new Set<number>();
  return activeDrafts.map((draft) => {
    const minutes = Number(draft.minutes);
    const seconds = Number(draft.seconds);
    if (draft.questionId === null) throw new Error("Hãy chọn câu hỏi cho từng mốc video đã thêm.");
    if (!Number.isInteger(minutes) || minutes < 0 || !Number.isInteger(seconds) || seconds < 0 || seconds > 59) {
      throw new Error("Thời gian video cần có phút hợp lệ và giây từ 0 đến 59.");
    }
    if (seenQuestionIds.has(draft.questionId)) throw new Error("Không thể thêm trùng một câu hỏi vào video.");
    seenQuestionIds.add(draft.questionId);
    return { questionId: draft.questionId, videoTimestamp: minutes * 60 + seconds };
  });
}

export default function LessonManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLessonForm);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [videoQuestionsLoading, setVideoQuestionsLoading] = useState(false);
  const [videoQuestionsLoadError, setVideoQuestionsLoadError] = useState(false);
  
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    title: "",
    timeLimitMinutes: 15,
    passScore: 80,
    questionCount: 10,
    selectionMode: "RANDOM",
    questionIds: [],
  });

  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<Lesson["lessonType"]>("VIDEO");
  const [newLessonChapterId, setNewLessonChapterId] = useState<number | null>(null);
  const [newLessonStep, setNewLessonStep] = useState<1 | 2>(1);
  const [newLessonDetails, setNewLessonDetails] = useState<LessonForm>(emptyLessonForm);
  const [videoQuestionDrafts, setVideoQuestionDrafts] = useState<VideoQuestionDraft[]>([]);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState("");
  const [editingChapterOrder, setEditingChapterOrder] = useState("1");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentType, setAttachmentType] = useState<Attachment["fileType"]>("DOCUMENT");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const selectedLessonIdRef = useRef<number | null>(null);

  const selectedLesson = useMemo(
    () => chapters.flatMap((chapter) => chapter.lessons).find((lesson) => lesson.id === selectedLessonId) ?? null,
    [chapters, selectedLessonId]
  );
  const lessonCount = chapters.reduce((total, chapter) => total + chapter.lessons.length, 0);
  const questionIds = useMemo(() => new Set(quizConfig.questionIds), [quizConfig.questionIds]);

  const loadCurriculum = useCallback(async (id: string, preferredLessonId?: number) => {
    if (!id) {
      setChapters([]);
      setSelectedLessonId(null);
      selectedLessonIdRef.current = null;
      return;
    }
    setContentLoading(true);
    setError("");
    try {
      const data = await apiRequest<Chapter[]>(`/api/teacher/courses/${id}/content`);
      const ordered = [...data]
        .sort((left, right) => left.orderIndex - right.orderIndex || left.id - right.id)
        .map((chapter) => ({
          ...chapter,
          lessons: [...chapter.lessons].sort(
            (left, right) => left.orderIndex - right.orderIndex || left.id - right.id
          ),
        }));
      setChapters(ordered);
      setExpandedChapters(ordered.map((chapter) => chapter.id));
      const availableIds = ordered.flatMap((chapter) => chapter.lessons.map((lesson) => lesson.id));
      const nextLessonId =
        preferredLessonId != null && availableIds.includes(preferredLessonId) ? preferredLessonId : null;
      selectedLessonIdRef.current = nextLessonId;
      setSelectedLessonId(nextLessonId);
    } catch (cause) {
      setChapters([]);
      setSelectedLessonId(null);
      selectedLessonIdRef.current = null;
      setError(cause instanceof Error ? cause.message : "Không tải được nội dung khóa học.");
    } finally {
      setContentLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    apiRequest<Course[]>("/api/teacher/courses")
      .then((data) => {
        if (!active) return;
        setCourses(data);
        const requestedId = new URLSearchParams(window.location.search).get("courseId");
        const requestedCourse = data.find((course) => String(course.id) === requestedId);
        setCourseId(String(requestedCourse?.id ?? data[0]?.id ?? ""));
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không tải được danh sách khóa học.");
      })
      .finally(() => {
        if (active) setCoursesLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void loadCurriculum(courseId);
  }, [courseId, loadCurriculum]);

  useEffect(() => {
    if (!selectedLesson) {
      setLessonForm(emptyLessonForm);
      setQuizConfig({
        title: "",
        timeLimitMinutes: 15,
        passScore: 80,
        questionCount: 10,
        selectionMode: "RANDOM",
        questionIds: [],
      });
      return;
    }
    setLessonForm({
      title: selectedLesson.title,
      lessonType: selectedLesson.lessonType,
      videoUrl: selectedLesson.videoUrl ?? "",
      contentText: selectedLesson.contentText ?? "",
      durationSeconds: String(selectedLesson.durationSeconds ?? 0),
      orderIndex: String(selectedLesson.orderIndex),
      isFreePreview: selectedLesson.isFreePreview,
    });
  }, [selectedLesson]);

  useEffect(() => {
    let active = true;
    if (!courseId) {
      setQuestions([]);
      setQuestionsLoading(false);
      return;
    }
    setQuestionsLoading(true);
    apiRequest<Question[]>(`/api/teacher/question-bank?courseId=${courseId}`)
      .then((data) => {
        if (active) setQuestions(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không tải được ngân hàng câu hỏi.");
      })
      .finally(() => {
        if (active) setQuestionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  useEffect(() => {
    let active = true;
    if (!selectedLesson || selectedLesson.lessonType !== "VIDEO") {
      setVideoQuestionsLoading(false);
      setVideoQuestionsLoadError(false);
      setVideoQuestionDrafts([]);
      return;
    }
    setVideoQuestionsLoading(true);
    setVideoQuestionsLoadError(false);
    setVideoQuestionDrafts([]);
    apiRequest<Array<{ questionId: number; videoTimestamp: number }>>(
      `/api/teacher/lessons/${selectedLesson.id}/interactive-questions`
    )
      .then((items) => {
        if (!active) return;
        setVideoQuestionDrafts(
          items.map((item) => ({
            questionId: item.questionId,
            minutes: String(Math.floor(item.videoTimestamp / 60)),
            seconds: String(item.videoTimestamp % 60),
          }))
        );
      })
      .catch((cause: unknown) => {
        if (active) {
          setVideoQuestionsLoadError(true);
          setError(cause instanceof Error ? cause.message : "Không tải được câu hỏi tương tác của video.");
        }
      })
      .finally(() => {
        if (active) setVideoQuestionsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedLesson]);

  useEffect(() => {
    let active = true;
    if (!selectedLesson || selectedLesson.lessonType !== "QUIZ") {
      setQuizConfig({
        title: "",
        timeLimitMinutes: 15,
        passScore: 80,
        questionCount: 10,
        selectionMode: "RANDOM",
        questionIds: [],
      });
      return;
    }
    setQuizConfig({
      title: selectedLesson.title,
      timeLimitMinutes: 15,
      passScore: 80,
      questionCount: 10,
      selectionMode: "RANDOM",
      questionIds: [],
    });
    apiRequest<{
      id: number;
      title: string;
      timeLimitMinutes: number;
      passScore: number;
      questionCount: number;
      selectionMode: "RANDOM" | "MANUAL";
      questionIds: number[];
    }>(`/api/teacher/lessons/${selectedLesson.id}/quiz`)
      .then((quiz) => {
        if (active && quiz.id !== null) {
          setQuizConfig({
            title: quiz.title,
            timeLimitMinutes: quiz.timeLimitMinutes,
            passScore: quiz.passScore,
            questionCount: quiz.questionCount,
            selectionMode: quiz.selectionMode,
            questionIds: quiz.questionIds ?? [],
          });
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không tải được cấu hình quiz.");
      });
    return () => {
      active = false;
    };
  }, [selectedLesson]);

  function selectLesson(lesson: Lesson) {
    selectedLessonIdRef.current = lesson.id;
    setSelectedLessonId(lesson.id);
    setNotice("");
  }

  async function createChapter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courseId || !newChapterTitle.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const nextOrderIndex = chapters.reduce((maximum, chapter) => Math.max(maximum, chapter.orderIndex), 0) + 1;
      await apiRequest(`/api/teacher/courses/${courseId}/chapters`, {
        method: "POST",
        body: JSON.stringify({ title: newChapterTitle.trim(), orderIndex: nextOrderIndex }),
      });
      setNewChapterTitle("");
      await loadCurriculum(courseId);
      setNotice("Đã thêm chương vào khóa học.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thêm được chương.");
    } finally {
      setBusy(false);
    }
  }

  async function saveChapter(chapter: Chapter) {
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/teacher/chapters/${chapter.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editingChapterTitle.trim(),
          orderIndex: Number(editingChapterOrder),
        }),
      });
      setEditingChapterId(null);
      await loadCurriculum(courseId);
      setNotice("Đã cập nhật chương.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được chương.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteChapter(chapter: Chapter) {
    if (!window.confirm(`Xóa chương "${chapter.title}" và toàn bộ bài học trong chương?`)) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/teacher/chapters/${chapter.id}`, { method: "DELETE" });
      await loadCurriculum(courseId);
      setNotice("Đã xóa chương.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không xóa được chương.");
    } finally {
      setBusy(false);
    }
  }

  function continueLessonCreation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newLessonChapterId || !newLessonTitle.trim()) return;
    setNewLessonDetails({
      ...emptyLessonForm,
      title: newLessonTitle.trim(),
      lessonType: newLessonType,
      orderIndex: String(
        (chapters.find((chapter) => chapter.id === newLessonChapterId)?.lessons ?? []).reduce(
          (maximum, lesson) => Math.max(maximum, lesson.orderIndex),
          0
        ) + 1
      ),
    });
    setVideoQuestionDrafts([]);
    setNewLessonStep(2);
  }

  async function createLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newLessonChapterId || !newLessonTitle.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/api/teacher/chapters/${newLessonChapterId}/lessons`, {
        method: "POST",
        body: JSON.stringify({
          title: newLessonTitle.trim(),
          lessonType: newLessonType,
          videoUrl: newLessonDetails.videoUrl.trim() || null,
          contentText: newLessonDetails.contentText.trim() || null,
          durationSeconds: Number(newLessonDetails.durationSeconds) || 0,
          orderIndex: Number(newLessonDetails.orderIndex),
          isFreePreview: newLessonDetails.isFreePreview,
          interactiveQuestions: newLessonType === "VIDEO" ? buildVideoQuestionPayload(videoQuestionDrafts) : null,
        }),
      });
      setNewLessonTitle("");
      setNewLessonChapterId(null);
      setNewLessonStep(1);
      setNewLessonDetails(emptyLessonForm);
      await loadCurriculum(courseId);
      setNotice("Đã thêm bài học vào chương.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thêm được bài học.");
    } finally {
      setBusy(false);
    }
  }

  async function saveLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLesson) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/api/teacher/lessons/${selectedLesson.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: lessonForm.title.trim(),
          lessonType: lessonForm.lessonType,
          videoUrl: lessonForm.videoUrl.trim() || null,
          contentText: lessonForm.contentText.trim() || null,
          durationSeconds: Number(lessonForm.durationSeconds),
          orderIndex: Number(lessonForm.orderIndex),
          isFreePreview: lessonForm.isFreePreview,
          interactiveQuestions:
            lessonForm.lessonType === "VIDEO" ? buildVideoQuestionPayload(videoQuestionDrafts) : null,
        }),
      });
      selectedLessonIdRef.current = null;
      setSelectedLessonId(null);
      await loadCurriculum(courseId);
      setNotice("Đã lưu thông tin bài học.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được bài học.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteLesson(lesson: Lesson) {
    if (!window.confirm(`Xóa bài học "${lesson.title}"?`)) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/teacher/lessons/${lesson.id}`, { method: "DELETE" });
      selectedLessonIdRef.current = null;
      await loadCurriculum(courseId);
      setNotice("Đã xóa bài học.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không xóa được bài học.");
    } finally {
      setBusy(false);
    }
  }

  async function saveQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLesson) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await apiRequest(`/api/teacher/lessons/${selectedLesson.id}/quiz`, {
        method: "PUT",
        body: JSON.stringify({
          title: quizConfig.title.trim() || selectedLesson.title,
          timeLimitMinutes: quizConfig.timeLimitMinutes,
          passScore: quizConfig.passScore,
          questionCount: quizConfig.questionCount,
          selectionMode: quizConfig.selectionMode,
          questionIds: quizConfig.selectionMode === "MANUAL" ? quizConfig.questionIds : [],
        }),
      });
      setNotice("Đã lưu cấu hình quiz.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được quiz.");
    } finally {
      setBusy(false);
    }
  }

  async function addAttachment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLesson) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (attachmentFile) {
        const body = new FormData();
        body.set("file", attachmentFile);
        body.set("fileType", attachmentType);
        await apiRequest(`/api/teacher/lessons/${selectedLesson.id}/attachments/upload`, {
          method: "POST",
          body,
        });
        setAttachmentFile(null);
      } else {
        await apiRequest(`/api/teacher/lessons/${selectedLesson.id}/attachments`, {
          method: "POST",
          body: JSON.stringify({
            fileName: attachmentName.trim(),
            fileUrl: attachmentUrl.trim(),
            fileType: attachmentType,
          }),
        });
        setAttachmentName("");
        setAttachmentUrl("");
      }
      await loadCurriculum(courseId, selectedLesson.id);
      setNotice("Đã thêm tài liệu.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thêm được tài liệu.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteAttachment(attachment: Attachment) {
    if (!selectedLesson || !window.confirm(`Xóa tài liệu "${attachment.fileName}"?`)) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/teacher/lessons/${selectedLesson.id}/attachments/${attachment.id}`, {
        method: "DELETE",
      });
      await loadCurriculum(courseId, selectedLesson.id);
      setNotice("Đã xóa tài liệu.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không xóa được tài liệu.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-70px)] bg-[#f6f9fd] p-4 text-slate-800 sm:p-6 lg:p-7">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-[#17305f]">Chương trình học</h1>
            <p className="mt-1 text-xs text-slate-500">
              Sắp xếp chương, bài học, tài liệu và nội dung quiz trong khóa học.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <select
              aria-label="Chọn khóa học"
              value={courseId}
              disabled={coursesLoading || courses.length === 0}
              onChange={(event) => {
                setCourseId(event.target.value);
                selectedLessonIdRef.current = null;
                setSelectedLessonId(null);
                setError("");
              }}
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 sm:w-64 sm:flex-none"
            >
              {courses.length === 0 && <option value="">Chưa có khóa học</option>}
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <a
              href="/teacher/courses"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <BookOpen size={15} /> Khóa học
            </a>
          </div>
        </header>

        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
            {notice}
          </p>
        )}

        {courses.length === 0 && !coursesLoading ? (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <BookOpen className="mx-auto size-9 text-slate-300" />
            <h2 className="mt-3 font-bold text-[#17305f]">Tạo khóa học để bắt đầu</h2>
            <p className="mt-1 text-xs text-slate-500">Chương và bài học sẽ được gắn vào khóa học bạn chọn.</p>
            <a
              href="/teacher/courses"
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white"
            >
              Mở quản lý khóa học
            </a>
          </section>
        ) : (
          <div className="w-full">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-[#17305f]">
                    <Layers size={16} /> Nội dung khóa học
                  </h2>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {chapters.length} chương · {lessonCount} bài học
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!courseId || busy}
                  onClick={() => {
                    setError("");
                    setNotice("");
                    document.getElementById("new-chapter-title")?.focus();
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  <Plus size={14} /> Thêm chương
                </button>
              </div>
              <form onSubmit={createChapter} className="flex gap-2 border-b border-slate-100 bg-slate-50/70 p-3">
                <input
                  id="new-chapter-title"
                  required
                  maxLength={255}
                  value={newChapterTitle}
                  onChange={(event) => setNewChapterTitle(event.target.value)}
                  placeholder="Tên chương mới"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-400"
                />
                <button
                  disabled={busy || !courseId}
                  className="h-9 rounded-lg bg-slate-800 px-3 font-semibold text-white disabled:opacity-50 cursor-pointer"
                >
                  {busy ? <LoaderCircle size={15} className="animate-spin" /> : "Tạo"}
                </button>
              </form>

              {contentLoading || coursesLoading ? (
                <div className="flex items-center justify-center gap-2 p-10 text-xs text-slate-500">
                  <LoaderCircle size={16} className="animate-spin" /> Đang tải nội dung...
                </div>
              ) : chapters.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500">
                  Khóa học này chưa có chương. Thêm chương ở phía trên.
                </p>
              ) : (
                <div className="space-y-3 p-3">
                  {chapters.map((chapter) => {
                    const expanded = expandedChapters.includes(chapter.id);
                    const editing = editingChapterId === chapter.id;
                    return (
                      <article key={chapter.id} className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5">
                          <button
                            type="button"
                            aria-label={expanded ? "Thu gọn chương" : "Mở chương"}
                            onClick={() =>
                              setExpandedChapters((current) =>
                                expanded ? current.filter((id) => id !== chapter.id) : [...current, chapter.id]
                              )
                            }
                            className="text-slate-500 cursor-pointer"
                          >
                            {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                          {editing ? (
                            <div className="grid min-w-0 flex-1 grid-cols-[1fr_54px_auto_auto] gap-1.5">
                              <input
                                value={editingChapterTitle}
                                onChange={(event) => setEditingChapterTitle(event.target.value)}
                                className="min-w-0 rounded-md border px-2 py-1 text-xs"
                                aria-label="Tên chương"
                              />
                              <input
                                type="number"
                                min="0"
                                value={editingChapterOrder}
                                onChange={(event) => setEditingChapterOrder(event.target.value)}
                                className="w-full rounded-md border px-1 py-1 text-xs"
                                aria-label="Thứ tự chương"
                              />
                              <button
                                type="button"
                                onClick={() => void saveChapter(chapter)}
                                disabled={busy}
                                className="rounded-md bg-blue-600 px-2 text-white cursor-pointer"
                              >
                                <Save size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingChapterId(null)}
                                className="rounded-md border px-2 text-slate-500 cursor-pointer"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedChapters((current) =>
                                    expanded ? current.filter((id) => id !== chapter.id) : [...current, chapter.id]
                                  )
                                }
                                className="min-w-0 flex-1 text-left cursor-pointer"
                              >
                                <span className="block truncate text-xs font-bold text-slate-800">
                                  {chapter.orderIndex}. {chapter.title}
                                </span>
                                <span className="text-[10px] text-slate-500">{chapter.lessons.length} bài học</span>
                              </button>
                              <button
                                type="button"
                                title="Sửa chương và thứ tự"
                                onClick={() => {
                                  setEditingChapterId(chapter.id);
                                  setEditingChapterTitle(chapter.title);
                                  setEditingChapterOrder(String(chapter.orderIndex));
                                }}
                                className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-blue-600 cursor-pointer"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                title="Xóa chương"
                                onClick={() => void deleteChapter(chapter)}
                                className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                        {expanded && (
                          <div className="divide-y divide-slate-100">
                            {chapter.lessons.map((lesson) => {
                              const Icon = lessonIcon(lesson.lessonType);
                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 transition cursor-pointer"
                                >
                                  <button
                                    type="button"
                                    onClick={() => selectLesson(lesson)}
                                    className="flex min-w-0 flex-1 items-center gap-2 text-left cursor-pointer"
                                  >
                                    <Icon size={14} className="shrink-0 text-slate-400" />
                                    <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-slate-700">
                                      {lesson.orderIndex}. {lesson.title}
                                    </span>
                                    {lesson.isFreePreview && (
                                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                                        Học thử
                                      </span>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    title="Sửa bài học"
                                    aria-label={`Sửa bài học ${lesson.title}`}
                                    onClick={() => selectLesson(lesson)}
                                    className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Xóa bài học"
                                    onClick={() => void deleteLesson(lesson)}
                                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() => {
                                setNewLessonChapterId(chapter.id);
                                setNewLessonTitle("");
                                setNewLessonType("VIDEO");
                                setNewLessonDetails(emptyLessonForm);
                                setNewLessonStep(1);
                                setVideoQuestionDrafts([]);
                                setError("");
                                setNotice("");
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer"
                            >
                              <Plus size={13} /> Thêm bài học vào chương
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* MODAL POP-UP CHỈNH SỬA BÀI HỌC KHI ĐƯỢC CHỌN */}
        {selectedLesson && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedLessonId(null);
            }}
          >
            <div className="max-h-[90vh] w-full max-w-4xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                    {chapters.find((chapter) => chapter.id === selectedLesson.chapterId)?.title} ·{" "}
                    {lessonTypeLabels[selectedLesson.lessonType]}
                  </p>
                  <h2 className="mt-1 truncate text-base font-bold text-[#17305f]">{selectedLesson.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  {(selectedLesson.lessonType === "QUIZ" || selectedLesson.lessonType === "VIDEO") && (
                    <a
                      href="/teacher/question_bank"
                      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Ngân hàng câu hỏi <ExternalLink size={12} />
                    </a>
                  )}
                  <button
                    type="button"
                    title="Đóng phần chỉnh sửa"
                    onClick={() => {
                      selectedLessonIdRef.current = null;
                      setSelectedLessonId(null);
                    }}
                    className="rounded-lg border p-2 text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <form onSubmit={saveLesson} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px_78px]">
                  <label className="text-[10px] font-semibold text-slate-600">
                    Tên bài học
                    <input
                      required
                      maxLength={255}
                      value={lessonForm.title}
                      onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })}
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none focus:border-blue-400"
                    />
                  </label>
                  <label className="text-[10px] font-semibold text-slate-600">
                    Loại bài
                    <select
                      value={lessonForm.lessonType}
                      onChange={(event) =>
                        setLessonForm({ ...lessonForm, lessonType: event.target.value as Lesson["lessonType"] })
                      }
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-normal cursor-pointer"
                    >
                      {Object.entries(lessonTypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-[10px] font-semibold text-slate-600">
                    Thứ tự
                    <input
                      required
                      type="number"
                      min="0"
                      value={lessonForm.orderIndex}
                      onChange={(event) => setLessonForm({ ...lessonForm, orderIndex: event.target.value })}
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-2 text-xs font-normal"
                    />
                  </label>
                </div>

                {lessonForm.lessonType === "VIDEO" && (
                  <>
                    <label className="block text-[10px] font-semibold text-slate-600">
                      Đường dẫn video
                      <input
                        type="url"
                        value={lessonForm.videoUrl}
                        onChange={(event) => setLessonForm({ ...lessonForm, videoUrl: event.target.value })}
                        placeholder="https://..."
                        className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-xs font-normal outline-none focus:border-blue-400"
                      />
                    </label>
                    {lessonForm.videoUrl && (
                      <video src={lessonForm.videoUrl} controls className="max-h-64 w-full rounded-xl bg-slate-950" />
                    )}
                  </>
                )}

                <label className="block text-[10px] font-semibold text-slate-600">
                  Nội dung bài học
                  <textarea
                    rows={6}
                    value={lessonForm.contentText}
                    onChange={(event) => setLessonForm({ ...lessonForm, contentText: event.target.value })}
                    placeholder="Nhập hướng dẫn, ghi chú hoặc nội dung bài đọc..."
                    className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-xs font-normal leading-5 outline-none focus:border-blue-400"
                  />
                </label>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lessonForm.isFreePreview}
                        onChange={(event) =>
                          setLessonForm({ ...lessonForm, isFreePreview: event.target.checked })
                        }
                      />{" "}
                      Cho phép học thử
                    </label>
                    {lessonForm.lessonType === "VIDEO" && (
                      <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                        Thời lượng (giây)
                        <input
                          type="number"
                          min="0"
                          value={lessonForm.durationSeconds}
                          onChange={(event) => setLessonForm({ ...lessonForm, durationSeconds: event.target.value })}
                          className="h-8 w-20 rounded-md border px-2 text-xs"
                        />
                      </label>
                    )}
                  </div>
                  <button
                    disabled={busy || videoQuestionsLoading || videoQuestionsLoadError}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={14} /> {videoQuestionsLoading ? "Đang tải câu hỏi..." : "Lưu bài học"}
                  </button>
                </div>
              </form>

              {lessonForm.lessonType === "VIDEO" && (
                <section className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800">Câu hỏi xuất hiện trong video</h3>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Chọn câu hỏi và thời điểm video sẽ tạm dừng để hiển thị câu hỏi cho học viên. Lưu cùng nút “Lưu bài học”.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideoQuestionDrafts((current) => [...current, { ...emptyVideoQuestion }])}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-2 text-[10px] font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer"
                    >
                      <Plus size={13} /> Thêm mốc câu hỏi
                    </button>
                  </div>
                  {videoQuestionDrafts.map((draft, index) => {
                    const usedQuestionIds = new Set(
                      videoQuestionDrafts
                        .filter((_, draftIndex) => draftIndex !== index)
                        .map((item) => item.questionId)
                        .filter((id): id is number => id !== null)
                    );
                    return (
                      <div
                        key={`${selectedLesson.id}-video-question-${index}`}
                        className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_75px_75px_auto]"
                      >
                        <select
                          aria-label={`Câu hỏi tại mốc ${index + 1}`}
                          value={draft.questionId ?? ""}
                          onChange={(event) =>
                            setVideoQuestionDrafts((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, questionId: event.target.value ? Number(event.target.value) : null }
                                  : item
                              )
                            )
                          }
                          className="h-9 min-w-0 rounded-lg border bg-white px-2 text-[10px] cursor-pointer"
                        >
                          <option value="">Chọn câu hỏi</option>
                          {questions
                            .filter((question) => !usedQuestionIds.has(question.id))
                            .map((question) => (
                              <option key={question.id} value={question.id}>
                                {question.questionText}
                              </option>
                            ))}
                        </select>
                        <label className="text-[9px] font-medium text-slate-500">
                          Phút
                          <input
                            aria-label={`Phút tại mốc ${index + 1}`}
                            type="number"
                            min="0"
                            value={draft.minutes}
                            onChange={(event) =>
                              setVideoQuestionDrafts((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, minutes: event.target.value } : item
                                )
                              )
                            }
                            className="mt-1 h-8 w-full rounded-md border px-2 text-xs text-slate-800"
                          />
                        </label>
                        <label className="text-[9px] font-medium text-slate-500">
                          Giây
                          <input
                            aria-label={`Giây tại mốc ${index + 1}`}
                            type="number"
                            min="0"
                            max="59"
                            value={draft.seconds}
                            onChange={(event) =>
                              setVideoQuestionDrafts((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, seconds: event.target.value } : item
                                )
                              )
                            }
                            className="mt-1 h-8 w-full rounded-md border px-2 text-xs text-slate-800"
                          />
                        </label>
                        <button
                          type="button"
                          title="Bỏ mốc câu hỏi"
                          onClick={() =>
                            setVideoQuestionDrafts((current) =>
                              current.filter((_, itemIndex) => itemIndex !== index)
                            )
                          }
                          className="self-end rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                  {videoQuestionsLoading && (
                    <p role="status" className="rounded-lg bg-slate-50 p-3 text-[10px] text-slate-500">
                      Đang tải câu hỏi video đã lưu...
                    </p>
                  )}
                  {videoQuestionsLoadError && (
                    <p role="alert" className="rounded-lg bg-red-50 p-3 text-[10px] text-red-700">
                      Không lưu bài học khi chưa tải được câu hỏi hiện có, để tránh ghi đè dữ liệu. Hãy tải lại trang và thử lại.
                    </p>
                  )}
                  {videoQuestionDrafts.length === 0 && (
                    <p className="rounded-lg bg-slate-50 p-3 text-[10px] text-slate-500">
                      Chưa có câu hỏi tương tác. Tạo câu hỏi trong{" "}
                      <a href="/teacher/question_bank" className="font-semibold text-blue-700 underline">
                        ngân hàng câu hỏi
                      </a>
                      , sau đó thêm mốc video tại đây.
                    </p>
                  )}
                </section>
              )}

              {/* KHỐI CẤU HÌNH QUIZ ĐÃ NÂNG CẤP */}
              {lessonForm.lessonType === "QUIZ" && (
                <form onSubmit={saveQuiz} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <h3 className="font-bold text-slate-800">Cấu hình bài Quiz tổng kết</h3>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Các thông số này sẽ được áp dụng cố định cho học viên khi bắt đầu bài tổng kết.
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Với chế độ chọn thủ công, số câu thi không được vượt quá số câu đã chọn ({quizConfig.questionIds.length}).
                    </p>
                  </div>

                  <label className="block text-[10px] font-semibold text-slate-600">
                    Tên bài quiz
                    <input
                      required
                      value={quizConfig.title}
                      onChange={(event) => setQuizConfig({ ...quizConfig, title: event.target.value })}
                      className="mt-1.5 h-9 w-full rounded-lg border px-3 text-xs font-normal outline-none focus:border-blue-400"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <label className="text-[10px] font-semibold text-slate-600">
                      Thời gian làm bài (phút)
                      <input
                        type="number"
                        min="1"
                        value={quizConfig.timeLimitMinutes}
                        onChange={(event) =>
                          setQuizConfig({ ...quizConfig, timeLimitMinutes: Number(event.target.value) })
                        }
                        className="mt-1.5 h-9 w-full rounded-lg border px-3 text-xs font-normal"
                      />
                    </label>

                    <label className="text-[10px] font-semibold text-slate-600">
                      Điểm đạt (%)
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={quizConfig.passScore}
                        onChange={(event) =>
                          setQuizConfig({ ...quizConfig, passScore: Number(event.target.value) })
                        }
                        className="mt-1.5 h-9 w-full rounded-lg border px-3 text-xs font-normal"
                      />
                    </label>

                    <label className="text-[10px] font-semibold text-slate-600">
                      Số câu hỏi rút ngẫu nhiên
                      <input
                        type="number"
                        min="1"
                        max={
                          quizConfig.selectionMode === "MANUAL"
                            ? quizConfig.questionIds.length || 1
                            : questions.length || 1
                        }
                        value={quizConfig.questionCount || 10}
                        onChange={(event) =>
                          setQuizConfig({ ...quizConfig, questionCount: Number(event.target.value) })
                        }
                        className="mt-1.5 h-9 w-full rounded-lg border px-3 text-xs font-normal"
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-slate-600">Hình thức lấy câu hỏi</p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="selectionMode"
                          checked={quizConfig.selectionMode === "RANDOM"}
                          onChange={() => setQuizConfig({ ...quizConfig, selectionMode: "RANDOM" })}
                        />
                        Rút ngẫu nhiên từ ngân hàng câu hỏi của khóa học
                      </label>
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="selectionMode"
                          checked={quizConfig.selectionMode === "MANUAL"}
                          onChange={() => setQuizConfig({ ...quizConfig, selectionMode: "MANUAL" })}
                        />
                        Chọn thủ công từng câu hỏi
                      </label>
                    </div>
                  </div>

                  {quizConfig.selectionMode === "MANUAL" && (
                    <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
                      {questions.map((question) => (
                        <label
                          key={question.id}
                          className="flex cursor-pointer items-start gap-2 rounded-md p-2 text-[11px] hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={questionIds.has(question.id)}
                            onChange={(event) =>
                              setQuizConfig((current) => ({
                                ...current,
                                questionIds: event.target.checked
                                  ? [...current.questionIds, question.id]
                                  : current.questionIds.filter((id) => id !== question.id),
                              }))
                            }
                          />
                          <span>{question.questionText}</span>
                        </label>
                      ))}
                      {questions.length === 0 && (
                        <p className="p-3 text-center text-[10px] text-slate-500">
                          Chưa có câu hỏi phù hợp trong ngân hàng câu hỏi.
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  >
                    Lưu cấu hình Quiz
                  </button>
                </form>
              )}

              <section className="mt-6 border-t border-slate-100 pt-5">
                <div className="mb-3">
                  <h3 className="font-bold text-slate-800">Tài liệu đính kèm</h3>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Tải tệp lên máy chủ hoặc gắn URL tài liệu cho học viên.
                  </p>
                </div>
                <div className="space-y-2">
                  {selectedLesson.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2">
                      <FileText size={15} className="shrink-0 text-blue-500" />
                      <a
                        href={
                          attachment.fileUrl.startsWith("/")
                            ? `${API_BASE_URL}${attachment.fileUrl}`
                            : attachment.fileUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 flex-1 truncate text-[11px] font-medium text-blue-700 hover:underline"
                      >
                        {attachment.fileName}
                      </a>
                      <span className="text-[9px] text-slate-400">
                        {attachment.fileType} {formatFileSize(attachment.fileSizeBytes)}
                      </span>
                      <button
                        type="button"
                        onClick={() => void deleteAttachment(attachment)}
                        className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                        title="Xóa tài liệu"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {selectedLesson.attachments.length === 0 && (
                    <p className="rounded-lg bg-slate-50 p-3 text-[10px] text-slate-500">Chưa có tài liệu đính kèm.</p>
                  )}
                </div>
                <form
                  onSubmit={addAttachment}
                  className="mt-3 grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-[1fr_120px_auto]"
                >
                  <div className="min-w-0">
                    <input
                      type="file"
                      onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)}
                      className="min-w-0 max-w-full text-[10px]"
                    />
                    <p className="mt-1 truncate text-[9px] text-slate-500">
                      {attachmentFile
                        ? `${attachmentFile.name} · ${formatFileSize(attachmentFile.size)}`
                        : "Chọn tệp để tải lên (tối đa 10 MB)."}
                    </p>
                  </div>
                  <select
                    value={attachmentType}
                    onChange={(event) => setAttachmentType(event.target.value as Attachment["fileType"])}
                    className="h-9 rounded-lg border bg-white px-2 text-[10px] cursor-pointer"
                  >
                    <option value="DOCUMENT">Tài liệu</option>
                    <option value="PDF">PDF</option>
                    <option value="CODE">Mã nguồn</option>
                    <option value="ZIP">ZIP</option>
                  </select>
                  <button
                    type="submit"
                    disabled={busy || !attachmentFile}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-slate-800 px-3 text-[10px] font-semibold text-white disabled:opacity-50 cursor-pointer"
                  >
                    {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Upload size={13} />}{" "}
                    {busy ? "Đang tải..." : "Tải lên"}
                  </button>
                </form>
                <form onSubmit={addAttachment} className="mt-2 grid gap-2 sm:grid-cols-[1fr_minmax(0,1.5fr)_120px_auto]">
                  <input
                    required
                    value={attachmentName}
                    onChange={(event) => setAttachmentName(event.target.value)}
                    placeholder="Tên tài liệu"
                    className="h-9 min-w-0 rounded-lg border px-2.5 text-[10px]"
                  />
                  <input
                    required
                    type="url"
                    value={attachmentUrl}
                    onChange={(event) => setAttachmentUrl(event.target.value)}
                    placeholder="https://đường-dẫn-tài-liệu"
                    className="h-9 min-w-0 rounded-lg border px-2.5 text-[10px]"
                  />
                  <select
                    value={attachmentType}
                    onChange={(event) => setAttachmentType(event.target.value as Attachment["fileType"])}
                    className="h-9 rounded-lg border bg-white px-2 text-[10px] cursor-pointer"
                  >
                    <option value="DOCUMENT">Tài liệu</option>
                    <option value="PDF">PDF</option>
                    <option value="CODE">Mã nguồn</option>
                    <option value="ZIP">ZIP</option>
                  </select>
                  <button
                    disabled={busy}
                    className="h-9 rounded-lg border px-3 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  >
                    Lưu URL
                  </button>
                </form>
              </section>
            </div>
          </div>
        )}

        {/* MODAL THÊM BÀI HỌC MỚI */}
        {newLessonChapterId !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setNewLessonChapterId(null);
            }}
          >
            {newLessonStep === 1 ? (
              <form onSubmit={continueLessonCreation} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[#17305f]">Thông tin bài học</h2>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {chapters.find((chapter) => chapter.id === newLessonChapterId)?.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewLessonChapterId(null)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={17} />
                  </button>
                </div>
                <label className="block text-[10px] font-semibold text-slate-600">
                  Tên bài học
                  <input
                    required
                    maxLength={255}
                    autoFocus
                    value={newLessonTitle}
                    onChange={(event) => setNewLessonTitle(event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border px-3 text-xs font-normal"
                  />
                </label>
                <label className="block text-[10px] font-semibold text-slate-600">
                  Loại bài học
                  <select
                    value={newLessonType}
                    onChange={(event) => setNewLessonType(event.target.value as Lesson["lessonType"])}
                    className="mt-1.5 h-10 w-full rounded-lg border bg-white px-3 text-xs font-normal cursor-pointer"
                  >
                    {Object.entries(lessonTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex justify-end gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={() => setNewLessonChapterId(null)}
                    className="rounded-lg border px-3 py-2 text-[11px] font-semibold text-slate-600 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white cursor-pointer">
                    Tiếp tục
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={createLesson} className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[#17305f]">Chi tiết bài học</h2>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {newLessonTitle} · {lessonTypeLabels[newLessonType]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewLessonChapterId(null)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
                  >
                    <X size={17} />
                  </button>
                </div>
                {newLessonType === "VIDEO" && (
                  <>
                    <label className="block text-[10px] font-semibold text-slate-600">
                      Đường dẫn video
                      <input
                        type="url"
                        value={newLessonDetails.videoUrl}
                        onChange={(event) =>
                          setNewLessonDetails({ ...newLessonDetails, videoUrl: event.target.value })
                        }
                        placeholder="https://..."
                        className="mt-1.5 h-10 w-full rounded-lg border px-3 text-xs font-normal"
                      />
                    </label>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-[10px] font-semibold text-slate-600">
                        Thời lượng (giây)
                        <input
                          type="number"
                          min="0"
                          value={newLessonDetails.durationSeconds}
                          onChange={(event) =>
                            setNewLessonDetails({ ...newLessonDetails, durationSeconds: event.target.value })
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border px-3 text-xs font-normal"
                        />
                      </label>
                      <label className="text-[10px] font-semibold text-slate-600">
                        Thứ tự trong chương
                        <input
                          type="number"
                          min="0"
                          value={newLessonDetails.orderIndex}
                          onChange={(event) =>
                            setNewLessonDetails({ ...newLessonDetails, orderIndex: event.target.value })
                          }
                          className="mt-1.5 h-9 w-full rounded-lg border px-3 text-xs font-normal"
                        />
                      </label>
                    </div>
                  </>
                )}
                <label className="block text-[10px] font-semibold text-slate-600">
                  Nội dung bài học
                  <textarea
                    rows={5}
                    value={newLessonDetails.contentText}
                    onChange={(event) =>
                      setNewLessonDetails({ ...newLessonDetails, contentText: event.target.value })
                    }
                    placeholder="Nhập nội dung hoặc hướng dẫn cho học viên..."
                    className="mt-1.5 w-full rounded-lg border p-3 text-xs font-normal leading-5"
                  />
                </label>
                {newLessonType !== "VIDEO" && (
                  <label className="block text-[10px] font-semibold text-slate-600">
                    Thứ tự trong chương
                    <input
                      type="number"
                      min="0"
                      value={newLessonDetails.orderIndex}
                      onChange={(event) =>
                        setNewLessonDetails({ ...newLessonDetails, orderIndex: event.target.value })
                      }
                      className="mt-1.5 h-9 w-full rounded-lg border px-3 text-xs font-normal"
                    />
                  </label>
                )}
                <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newLessonDetails.isFreePreview}
                    onChange={(event) =>
                      setNewLessonDetails({ ...newLessonDetails, isFreePreview: event.target.checked })
                    }
                  />{" "}
                  Cho phép học thử
                </label>
                {newLessonType === "VIDEO" && (
                  <section className="space-y-3 border-t pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Câu hỏi tương tác theo mốc video</h3>
                        <p className="mt-1 text-[10px] text-slate-500">Video sẽ dừng và hiển thị câu hỏi tại phút:giây đã chọn.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVideoQuestionDrafts((current) => [...current, { ...emptyVideoQuestion }])}
                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-2 text-[10px] font-semibold text-blue-700 hover:bg-blue-50 cursor-pointer"
                      >
                        <Plus size={13} /> Thêm mốc
                      </button>
                    </div>
                    {videoQuestionDrafts.map((draft, index) => {
                      const usedQuestionIds = new Set(
                        videoQuestionDrafts
                          .filter((_, draftIndex) => draftIndex !== index)
                          .map((item) => item.questionId)
                          .filter((id): id is number => id !== null)
                      );
                      return (
                        <div
                          key={`new-video-question-${index}`}
                          className="grid gap-2 rounded-xl border bg-slate-50 p-3 sm:grid-cols-[minmax(0,1fr)_75px_75px_auto]"
                        >
                          <select
                            aria-label={`Câu hỏi tại mốc ${index + 1}`}
                            value={draft.questionId ?? ""}
                            onChange={(event) =>
                              setVideoQuestionDrafts((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, questionId: event.target.value ? Number(event.target.value) : null }
                                    : item
                                )
                              )
                            }
                            className="h-9 min-w-0 rounded-lg border bg-white px-2 text-[10px] cursor-pointer"
                          >
                            <option value="">Chọn câu hỏi</option>
                            {questions
                              .filter((question) => !usedQuestionIds.has(question.id))
                              .map((question) => (
                                <option key={question.id} value={question.id}>
                                  {question.questionText}
                                </option>
                              ))}
                          </select>
                          <label className="text-[9px] font-medium text-slate-500">
                            Phút
                            <input
                              type="number"
                              min="0"
                              value={draft.minutes}
                              onChange={(event) =>
                                setVideoQuestionDrafts((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, minutes: event.target.value } : item
                                  )
                                )
                              }
                              className="mt-1 h-8 w-full rounded-md border px-2 text-xs text-slate-800"
                            />
                          </label>
                          <label className="text-[9px] font-medium text-slate-500">
                            Giây
                            <input
                              type="number"
                              min="0"
                              max="59"
                              value={draft.seconds}
                              onChange={(event) =>
                                setVideoQuestionDrafts((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index ? { ...item, seconds: event.target.value } : item
                                  )
                                )
                              }
                              className="mt-1 h-8 w-full rounded-md border px-2 text-xs text-slate-800"
                            />
                          </label>
                          <button
                            type="button"
                            title="Bỏ mốc câu hỏi"
                            onClick={() =>
                              setVideoQuestionDrafts((current) =>
                                current.filter((_, itemIndex) => itemIndex !== index)
                              )
                            }
                            className="self-end rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                    {questionsLoading && (
                      <p role="status" className="rounded-lg bg-slate-50 p-3 text-[10px] text-slate-500">
                        Đang tải ngân hàng câu hỏi...
                      </p>
                    )}
                    {!questionsLoading && questions.length === 0 && (
                      <p className="rounded-lg bg-amber-50 p-3 text-[10px] text-amber-800">
                        Chưa có câu hỏi trong ngân hàng. Tạo câu hỏi trước tại{" "}
                        <a href="/teacher/question_bank" className="font-semibold underline">
                          Ngân hàng câu hỏi
                        </a>
                        , rồi quay lại thêm mốc video.
                      </p>
                    )}
                  </section>
                )}
                <div className="flex justify-between gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={() => setNewLessonStep(1)}
                    className="rounded-lg border px-3 py-2 text-[11px] font-semibold text-slate-600 cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    disabled={busy}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-50 cursor-pointer"
                  >
                    {busy ? "Đang lưu..." : "Lưu bài học"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}