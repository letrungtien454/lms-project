"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getAccessToken } from "@/lib/auth-session";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
  Award,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  CheckSquare,
} from "lucide-react";

type QuizOption = { id: string; text: string };
type QuizQuestion = { id: number | string; questionText: string; options: QuizOption[] };

type QuizAttempt = {
  attemptId: number | string;
  chapterId: number | string;
  questionCount: number;
  timeLimitMinutes: number;
  startedAt: string;
  expiresAt: string;
  questions: QuizQuestion[];
};

type QuizAnswerResult = {
  questionId: number | string;
  questionText: string;
  selectedOption: string | null;
  correctOption: string;
  explanation?: string | null;
  correct: boolean;
};

type QuizResult = {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  score: number | string;
  elapsedSeconds: number;
  autoSubmitted: boolean;
  passScore: number;
  passed: boolean;
  answers: QuizAnswerResult[];
};

type AnswerSaveResponse = { submitted: boolean; result: QuizResult | null };
type Availability = {
  chapterId: number | string;
  availableQuestionCount: number;
  questionCount: number;
  timeLimitMinutes: number;
  passScore: number;
};

type AttemptStatus = {
  attemptId: number | string;
  submitted: boolean;
  expiresAt: string;
  questions: QuizQuestion[];
  savedAnswers: { questionId: number | string; selectedOption: string }[];
  result: QuizResult | null;
};

const API_URL = "http://localhost:8080";

async function apiRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const response = await fetch(url, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(10000),
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: ["Bearer", token].join(" ") } : {}),
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.message || `Yêu cầu thất bại (HTTP ${response.status}).`);
  }
  return payload as T;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function ChapterSummaryQuiz({
  chapterId,
  lessonId,
  chapterTitle,
  onPassed,
}: {
  chapterId: number | string;
  lessonId: number | string;
  chapterTitle?: string;
  onPassed: () => void;
}) {
  const [availableCount, setAvailableCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [passScore, setPassScore] = useState(80);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const attemptStartedAt = useRef<number>(0);
  const autoSubmitStarted = useRef(false);
  const submitRef = useRef<() => Promise<void>>(async () => {});
  const answerSaves = useRef(new Map<string, Promise<void>>());

  // 1. TẢI DỮ LIỆU CÂU HỎI & PHỤC HỒI LƯỢT LÀM DANG DỞ KHI F5 TRANG
  const initializeQuiz = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      // 1.1 Kiểm tra lượt làm bài chưa nộp dang dở (Active Attempt)
      const activeAttemptStatus = await apiRequest<AttemptStatus | null>(
        `${API_URL}/api/chapters/${chapterId}/summary-quiz/attempts/active?lessonId=${lessonId}`
      );

      if (activeAttemptStatus && !activeAttemptStatus.submitted && activeAttemptStatus.questions.length > 0) {
        // Phục hồi lượt làm cũ
        const expiresAtDate = Date.parse(activeAttemptStatus.expiresAt);
        const remainingSecs = Math.max(0, Math.ceil((expiresAtDate - Date.now()) / 1000));

        if (remainingSecs > 0) {
          const restoredAnswers: Record<string, string> = {};
          activeAttemptStatus.savedAnswers?.forEach((ans) => {
            restoredAnswers[String(ans.questionId)] = ans.selectedOption;
          });

          setAttempt({
            attemptId: activeAttemptStatus.attemptId,
            chapterId,
            questionCount: activeAttemptStatus.questions.length,
            timeLimitMinutes: Math.ceil(remainingSecs / 60),
            startedAt: new Date().toISOString(),
            expiresAt: activeAttemptStatus.expiresAt,
            questions: activeAttemptStatus.questions,
          });
          setAnswers(restoredAnswers);
          setSecondsLeft(remainingSecs);
          setIsLoading(false);
          return;
        }
      }

      // 1.2 Nếu không có lượt dang dở, lấy số lượng câu hỏi có sẵn
      const availability = await apiRequest<Availability>(
        `${API_URL}/api/chapters/${chapterId}/summary-quiz/attempts/availability?lessonId=${lessonId}`
      );
      setAvailableCount(availability.availableQuestionCount);
      setQuestionCount(availability.questionCount);
      setTimeLimitMinutes(availability.timeLimitMinutes);
      setPassScore(availability.passScore);
    } catch (reqErr) {
      setError(reqErr instanceof Error ? reqErr.message : "Không thể tải ngân hàng câu hỏi.");
    } finally {
      setIsLoading(false);
    }
  }, [chapterId, lessonId]);

  useEffect(() => {
    void initializeQuiz();
  }, [initializeQuiz]);

  // 2. BẮT ĐẦU TẠO ĐỀ KIỂM TRA MỚI
  const startAttempt = async () => {
    if (questionCount < 1 || questionCount > availableCount) {
      setError("Số câu hỏi đã cấu hình vượt quá ngân hàng hiện có. Hãy báo giảng viên kiểm tra cấu hình.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const nextAttempt = await apiRequest<QuizAttempt>(
        `${API_URL}/api/chapters/${chapterId}/summary-quiz/attempts`,
        {
          method: "POST",
          body: JSON.stringify({ lessonId }),
        }
      );
      setAttempt(nextAttempt);
      setAnswers({});
      setResult(null);
      setCurrentIndex(0);
      autoSubmitStarted.current = false;
      const deadlineSeconds = Math.max(
        0,
        Math.ceil((Date.parse(nextAttempt.expiresAt) - Date.now()) / 1000)
      );
      setSecondsLeft(deadlineSeconds || nextAttempt.timeLimitMinutes * 60);
      attemptStartedAt.current = Date.parse(nextAttempt.startedAt);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể tạo đề kiểm tra.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. NỘP BÀI KIỂM TRA
  const submitAttempt = async () => {
    if (!attempt || isSubmitting || result) return;
    setIsSubmitting(true);
    setError("");
    try {
      await Promise.all(answerSaves.current.values());
      const submitted = await apiRequest<QuizResult>(
        `${API_URL}/api/chapters/${chapterId}/summary-quiz/attempts/${attempt.attemptId}/submit`,
        {
          method: "POST",
          body: JSON.stringify({ answers }),
        }
      );
      setResult(submitted);
      if (submitted.passed) onPassed();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể nộp bài kiểm tra.");
    } finally {
      setIsSubmitting(false);
    }
  };
  submitRef.current = submitAttempt;

  // 4. LƯU CÂU TRẢ LỜI LÊN SERVER (AUTO-SAVE)
  const saveAnswer = (questionId: number | string, selectedOption: string) => {
    if (!attempt) return;
    const key = String(questionId);
    let pending: Promise<void>;
    const previousSave = answerSaves.current.get(key) ?? Promise.resolve();

    pending = previousSave
      .catch(() => {})
      .then(() =>
        apiRequest<AnswerSaveResponse>(
          `${API_URL}/api/chapters/${chapterId}/summary-quiz/attempts/${attempt.attemptId}/answers/${questionId}`,
          { method: "PUT", body: JSON.stringify({ selectedOption }) }
        )
      )
      .then((response) => {
        if (response.submitted && response.result) {
          autoSubmitStarted.current = true;
          setResult(response.result);
          if (response.result.passed) onPassed();
        }
      })
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Không thể lưu câu trả lời.");
      })
      .finally(() => {
        if (answerSaves.current.get(key) === pending) answerSaves.current.delete(key);
      });

    answerSaves.current.set(key, pending);
  };

  const chooseAnswer = (questionId: number | string, selectedOption: string) => {
    setAnswers((previous) => ({ ...previous, [String(questionId)]: selectedOption }));
    saveAnswer(questionId, selectedOption);
  };

  // 5. ĐỒNG HỒ ĐẾM NGƯỢC VÀ TỰ ĐỘNG NỘP
  useEffect(() => {
    if (!attempt || result || isSubmitting) return;
    if (secondsLeft <= 0) {
      if (!autoSubmitStarted.current) {
        autoSubmitStarted.current = true;
        void submitRef.current();
      }
      return;
    }
    const timer = window.setTimeout(
      () => setSecondsLeft((remaining) => Math.max(0, remaining - 1)),
      1000
    );
    return () => window.clearTimeout(timer);
  }, [attempt, result, secondsLeft, isSubmitting]);

  const currentQuestion = attempt?.questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[String(currentQuestion.id)] : undefined;

  // ==================== SCREEN 1: MÀN HÌNH CHUẨN BỊ (SETUP) ====================
  if (!attempt) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
            <Award className="size-8" />
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
            Bài kiểm tra tổng kết
          </span>
          <h2 className="mt-2 text-xl font-black text-[#17305f]">
            {chapterTitle || "Tổng kết chương học"}
          </h2>
          <p className="mt-1.5 max-w-md text-xs text-slate-500">
            Đánh giá mức độ hiểu bài của bạn bằng các câu hỏi và thời gian do giảng viên cấu hình cho bài kiểm tra này.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-xs font-semibold text-slate-400">
            <Loader2 className="size-5 animate-spin text-blue-600" /> Đang kiểm tra ngân hàng câu hỏi...
          </div>
        ) : availableCount === 0 ? (
          <div className="my-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-800">
            <AlertCircle className="size-5 shrink-0 text-amber-600" />
            <span>Bài kiểm tra này hiện chưa có câu hỏi trắc nghiệm phù hợp.</span>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Khối hiển thị 4 chỉ số tổng quan */}
            <div className="grid grid-cols-2 gap-3 border-y border-slate-100 py-4 text-left sm:grid-cols-4">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="size-5 shrink-0 text-blue-500" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Số câu hỏi</p>
                  <p className="text-xs font-black text-slate-800">{questionCount} câu</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-l border-slate-100 sm:pl-3">
                <Clock3 className="size-5 shrink-0 text-amber-500" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Thời gian</p>
                  <p className="text-xs font-black text-slate-800">{timeLimitMinutes} phút</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-l border-slate-100 pl-3">
                <Award className="size-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Điểm đạt</p>
                  <p className="text-xs font-black text-slate-800">{passScore}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 border-l border-slate-100 pl-3">
                <CheckSquare className="size-5 shrink-0 text-purple-500" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Hình thức</p>
                  <p className="text-xs font-black text-slate-800">Trắc nghiệm</p>
                </div>
              </div>
            </div>

            
            {questionCount > availableCount && (
              <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Cấu hình hiện yêu cầu {questionCount} câu nhưng ngân hàng chỉ có {availableCount} câu. Vui lòng báo giảng viên cập nhật cấu hình.
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              disabled={isLoading || availableCount === 0 || questionCount > availableCount}
              onClick={() => void startAttempt()}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="size-4" /> Bắt đầu làm bài
            </button>
          </div>
        )}
      </section>
    );
  }

  // ==================== SCREEN 2: MÀN HÌNH KẾT QUẢ (RESULT) ====================
  if (result) {
    const isPassed = result.passed;

    return (
      <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8 space-y-6">
        <div className="text-center max-w-md mx-auto space-y-3">
          <div
            className={`mx-auto flex size-16 items-center justify-center rounded-full ${
              isPassed ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
            }`}
          >
            {isPassed ? <CheckCircle2 className="size-8" /> : <AlertCircle className="size-8" />}
          </div>
          <h2 className="text-lg font-black text-slate-900">
            {isPassed ? "Chúc mừng! Bạn đã hoàn thành xuất sắc" : "Chưa đạt yêu cầu tối thiểu"}
          </h2>
          <p className="text-xs text-slate-500">
            Thời gian hoàn thành: <strong>{formatTime(result.elapsedSeconds)}</strong>
            <span className="block">
              Điểm đạt yêu cầu: <strong>{result.passScore}%</strong>
            </span>
            {result.autoSubmitted && (
              <span className="block text-amber-600 font-semibold mt-1">
                (Đã tự động nộp khi hết giờ)
              </span>
            )}
          </p>
        </div>

        {/* Bảng 4 ô thống kê kết quả */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Tổng số câu", result.totalQuestions, "bg-slate-50 text-slate-800"],
            ["Số câu đúng", result.correctCount, "bg-emerald-50 text-emerald-700"],
            ["Số câu sai", result.incorrectCount, "bg-rose-50 text-rose-700"],
            ["Điểm số", `${result.score}%`, isPassed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"],
          ].map(([label, val, style]) => (
            <div key={String(label)} className={`rounded-2xl p-4 text-center ${style}`}>
              <p className="text-[10px] font-semibold text-slate-400 uppercase">{label}</p>
              <p className="mt-1 text-xl font-black">{val}</p>
            </div>
          ))}
        </div>

        {/* Xem lại chi tiết từng đáp án */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Chi tiết đáp án & Giải thích
          </h3>

          <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
            {result.answers.map((ans, idx) => {
              const q = attempt.questions.find((item) => String(item.id) === String(ans.questionId));
              const correctOpt = q?.options.find((o) => o.id === ans.correctOption);
              const selectedOpt = q?.options.find((o) => o.id === ans.selectedOption);

              return (
                <article
                  key={ans.questionId}
                  className={`rounded-2xl border p-4 text-xs space-y-2 ${
                    ans.correct ? "border-emerald-200 bg-emerald-50/30" : "border-rose-200 bg-rose-50/30"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {ans.correct ? (
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-slate-900">
                        Câu {idx + 1}: {ans.questionText}
                      </p>
                      <p className="text-slate-600">
                        Bạn chọn:{" "}
                        <span className={ans.correct ? "font-bold text-emerald-700" : "font-bold text-rose-600"}>
                          {selectedOpt ? `${selectedOpt.id}. ${selectedOpt.text}` : "Bỏ trống"}
                        </span>
                      </p>
                      {!ans.correct && (
                        <p className="font-bold text-emerald-700">
                          Đáp án đúng: {correctOpt ? `${correctOpt.id}. ${correctOpt.text}` : ans.correctOption}
                        </p>
                      )}
                      {ans.explanation && (
                        <p className="mt-1 text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
                          💡 <strong>Giải thích:</strong> {ans.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setAttempt(null);
            setResult(null);
            setError("");
            void initializeQuiz();
          }}
          className="flex items-center justify-center gap-2 w-full rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <RotateCcw className="size-4" /> {isPassed ? "Làm đề khác" : "Làm lại bài kiểm tra"}
        </button>
      </section>
    );
  }

  // ==================== SCREEN 3: MÀN HÌNH LÀM BÀI (DOING QUIZ) ====================
  return (
    <section className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8 space-y-5">
      {/* Header & Đồng hồ đếm ngược */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Đang làm bài
          </span>
          <h2 className="text-sm font-bold text-slate-900 mt-1">
            {chapterTitle || "Bài kiểm tra tổng kết"}
          </h2>
        </div>

        <div
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold ${
            secondsLeft <= 60
              ? "bg-rose-50 text-rose-600 animate-pulse border border-rose-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          <Clock3 className="size-4" />
          <span>{formatTime(secondsLeft)}</span>
        </div>
      </div>

      {/* Thanh danh sách nút câu hỏi (Question Navigation Grid) */}
      <nav className="flex flex-wrap gap-1.5" aria-label="Điều hướng câu hỏi">
        {attempt.questions.map((q, idx) => {
          const isAns = Boolean(answers[String(q.id)]);
          const isCurrent = currentIndex === idx;

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`flex size-8 items-center justify-center rounded-xl text-xs font-bold transition cursor-pointer ${
                isCurrent
                  ? "bg-blue-600 text-white shadow-xs"
                  : isAns
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </nav>

      {/* Khung nội dung câu hỏi hiện tại */}
      {currentQuestion && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-blue-600">
              Câu {currentIndex + 1} / {attempt.questions.length}
            </span>
          </div>

          <h3 className="text-sm font-bold text-slate-900 leading-relaxed">
            {currentQuestion.questionText}
          </h3>

          <div className="space-y-2 pt-1">
            {currentQuestion.options.map((opt) => {
              const isSelected = currentAnswer === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => chooseAnswer(currentQuestion.id, opt.id)}
                  className={`flex w-full items-center gap-3 p-3.5 rounded-xl border text-xs font-semibold text-left transition cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 text-blue-700 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100/60"
                  }`}
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {/* Footer Nút bấm điều hướng */}
      <footer className="flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((idx) => idx - 1)}
          className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft className="size-4" /> Câu trước
        </button>

        {currentIndex < attempt.questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((idx) => idx + 1)}
            className="flex items-center gap-1 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
          >
            Câu tiếp <ChevronRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void submitAttempt()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Đang nộp bài..." : "Nộp bài kiểm tra"}
          </button>
        )}
      </footer>
    </section>
  );
}