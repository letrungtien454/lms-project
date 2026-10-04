"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";

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
  answers: QuizAnswerResult[];
};
type AnswerSaveResponse = { submitted: boolean; result: QuizResult | null };
type Availability = { chapterId: number | string; availableQuestionCount: number };
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
  const token = localStorage.getItem("accessToken");
  const response = await fetch(url, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(10000),
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: ["Bearer", token].join(" ") } : {}),
      ...init.headers,
    },
  });
  const payload = await response.json().catch(() => null) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.message || `Yêu cầu thất bại (HTTP ${response.status}).`);
  }
  return payload as T;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function ChapterSummaryQuiz({
  chapterId,
  chapterTitle,
}: {
  chapterId: number | string;
  chapterTitle?: string;
}) {
  const [availableCount, setAvailableCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
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

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    void apiRequest<Availability>(`${API_URL}/api/chapters/${chapterId}/summary-quiz/attempts/availability`)
      .then((data) => {
        if (cancelled) return;
        setAvailableCount(data.availableQuestionCount);
        setQuestionCount(Math.min(10, data.availableQuestionCount));
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Không tải được ngân hàng câu hỏi.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [chapterId]);

  const startAttempt = async () => {
    if (questionCount < 1 || questionCount > availableCount) return;
    setIsLoading(true);
    setError("");
    try {
      const nextAttempt = await apiRequest<QuizAttempt>(
        `${API_URL}/api/chapters/${chapterId}/summary-quiz/attempts`,
        {
          method: "POST",
          body: JSON.stringify({ questionCount, timeLimitMinutes }),
        },
      );
      setAttempt(nextAttempt);
      setAnswers({});
      setResult(null);
      setCurrentIndex(0);
      autoSubmitStarted.current = false;
      const deadlineSeconds = Math.max(0, Math.ceil((Date.parse(nextAttempt.expiresAt) - Date.now()) / 1000));
      setSecondsLeft(deadlineSeconds || nextAttempt.timeLimitMinutes * 60);
      attemptStartedAt.current = Date.parse(nextAttempt.startedAt);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể tạo đề kiểm tra.");
    } finally {
      setIsLoading(false);
    }
  };

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
        },
      );
      setResult(submitted);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể nộp bài kiểm tra.");
    } finally {
      setIsSubmitting(false);
    }
  };
  submitRef.current = submitAttempt;

  const saveAnswer = (questionId: number | string, selectedOption: string) => {
    if (!attempt) return;
    const key = String(questionId);
    let pending: Promise<void>;
    const previousSave = answerSaves.current.get(key) ?? Promise.resolve();
    pending = previousSave.catch(() => {}).then(() => apiRequest<AnswerSaveResponse>(
      `${API_URL}/api/chapters/${chapterId}/summary-quiz/attempts/${attempt.attemptId}/answers/${questionId}`,
      { method: "PUT", body: JSON.stringify({ selectedOption }) },
    )).then((response) => {
      if (response.submitted && response.result) {
        autoSubmitStarted.current = true;
        setResult(response.result);
      }
    }).catch((requestError: unknown) => {
      setError(requestError instanceof Error ? requestError.message : "Không thể lưu câu trả lời.");
    }).finally(() => {
      if (answerSaves.current.get(key) === pending) answerSaves.current.delete(key);
    });
    answerSaves.current.set(key, pending);
  };

  const chooseAnswer = (questionId: number | string, selectedOption: string) => {
    setAnswers((previous) => ({ ...previous, [String(questionId)]: selectedOption }));
    saveAnswer(questionId, selectedOption);
  };

  useEffect(() => {
    if (!attempt || result || isSubmitting) return;
    if (secondsLeft <= 0) {
      if (!autoSubmitStarted.current) {
        autoSubmitStarted.current = true;
        void submitRef.current();
      }
      return;
    }
    const timer = window.setTimeout(() => setSecondsLeft((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [attempt, result, secondsLeft, isSubmitting]);

  const currentQuestion = attempt?.questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[String(currentQuestion.id)] : undefined;

  if (!attempt) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">?</span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Kiểm tra kiến thức{chapterTitle ? ` · ${chapterTitle}` : ""}</h2>
            <p className="mt-1 text-sm text-slate-500">Chọn số câu và thời gian làm bài trước khi bắt đầu.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-slate-500"><Loader2 className="size-4 animate-spin" /> Đang tải câu hỏi...</div>
        ) : availableCount === 0 ? (
          <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Chương này chưa có câu hỏi trong ngân hàng của các bài học.</p>
        ) : (
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Số câu hỏi (tối đa {availableCount})
              <input
                type="number"
                min={1}
                max={availableCount}
                value={questionCount}
                onChange={(event) => setQuestionCount(Math.min(availableCount, Math.max(1, Number(event.target.value) || 1)))}
                className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-blue-500"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Thời gian làm bài
              <select value={timeLimitMinutes} onChange={(event) => setTimeLimitMinutes(Number(event.target.value))} className="h-11 rounded-xl border border-slate-200 bg-white px-3 outline-none focus:border-blue-500">
                {[10, 15, 20, 30, 45, 60].map((minutes) => <option key={minutes} value={minutes}>{minutes} phút</option>)}
              </select>
            </label>
          </div>
        )}

        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button
          type="button"
          disabled={isLoading || availableCount === 0 || questionCount < 1 || questionCount > availableCount}
          onClick={() => void startAttempt()}
          className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Bắt đầu làm bài
        </button>
        <p className="mt-3 text-xs text-slate-400">Câu hỏi được chọn ngẫu nhiên từ ngân hàng của các bài học trong chương.</p>
      </section>
    );
  }

  if (result) {
    return (
      <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">Kết quả bài kiểm tra</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Tổng số câu", result.totalQuestions],
            ["Số câu đúng", result.correctCount],
            ["Số câu sai", result.incorrectCount],
            ["Điểm", `${result.score}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500">Thời gian làm bài: {formatTime(result.elapsedSeconds)}</p>
        {result.autoSubmitted && <p className="mt-2 text-xs font-semibold text-amber-700">Bài làm đã được nộp tự động khi hết giờ.</p>}
        <div className="mt-6 space-y-4">
          {result.answers.map((answer, index) => {
            const question = attempt.questions.find((item) => String(item.id) === String(answer.questionId));
            const correctOption = question?.options.find((option) => option.id === answer.correctOption);
            const selectedOption = question?.options.find((option) => option.id === answer.selectedOption);
            const correct = answer.correct;
            return (
              <article key={answer.questionId} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-2">
                  {correct ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900">Câu {index + 1}. {answer.questionText}</h3>
                    <p className="mt-2 text-xs text-slate-600">Bạn chọn: {selectedOption?.text ?? "Chưa trả lời"}</p>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">Đáp án đúng: {correctOption?.text ?? answer?.correctOption}</p>
                    {answer?.explanation && <p className="mt-2 text-xs leading-5 text-slate-500">{answer.explanation}</p>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <button type="button" onClick={() => { setAttempt(null); setResult(null); setError(""); }} className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Làm đề mới
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Kiểm tra kiến thức{chapterTitle ? ` · ${chapterTitle}` : ""}</h2>
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${secondsLeft <= 60 ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
          <Clock3 className="size-4" /> {formatTime(secondsLeft)}
        </div>
      </header>

      <nav className="mt-5 flex flex-wrap gap-2" aria-label="Điều hướng câu hỏi">
        {attempt.questions.map((question, index) => {
          const isAnswered = Boolean(answers[String(question.id)]);
          return (
            <button
              key={question.id}
              type="button"
              aria-label={`Đi tới câu ${index + 1}${isAnswered ? ", đã trả lời" : ", chưa trả lời"}`}
              aria-current={currentIndex === index ? "step" : undefined}
              onClick={() => setCurrentIndex(index)}
              className={`flex size-9 items-center justify-center rounded-lg border text-xs font-bold ${currentIndex === index ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-200"} ${isAnswered ? "bg-slate-200 text-slate-700" : "bg-white text-slate-600"}`}
            >
              {index + 1}
            </button>
          );
        })}
      </nav>

      {currentQuestion && (
        <div className="mt-6 rounded-xl border border-slate-200 p-4 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Câu {currentIndex + 1} / {attempt.questions.length}</p>
          <h3 className="mt-3 text-base font-semibold leading-7 text-slate-900">{currentQuestion.questionText}</h3>
          <div className="mt-5 space-y-2">
            {currentQuestion.options.map((option) => (
              <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${currentAnswer === option.id ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}>
                <input type="radio" name={`question-${currentQuestion.id}`} checked={currentAnswer === option.id} onChange={() => chooseAnswer(currentQuestion.id, option.id)} className="mt-0.5 accent-blue-600" />
                <span className="text-slate-700">{option.text}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button type="button" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-40">
          ← Câu trước
        </button>
        {currentIndex < attempt.questions.length - 1 && secondsLeft > 0 ? (
          <button type="button" onClick={() => setCurrentIndex((index) => index + 1)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Câu tiếp →</button>
        ) : (
          <button type="button" disabled={isSubmitting} onClick={() => void submitAttempt()} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
            {isSubmitting ? "Đang nộp bài..." : "Nộp bài"}
          </button>
        )}
      </footer>
    </section>
  );
}
