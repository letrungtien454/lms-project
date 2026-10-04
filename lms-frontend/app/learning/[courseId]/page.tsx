"use client";

import useSWR from "swr";
import CompactCodePracticeWorkspace from "@/components/code-practice-workspace";
import ChapterSummaryQuiz from "@/components/chapter-summary-quiz";
import Hls from "hls.js";
import { useState, useRef, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import YouTube from "react-youtube";
import {
  Award,
  ArrowLeft,
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronUp,
  Code2,
  GraduationCap,
  Home,
  LogOut,
  Moon,
  PanelLeft,
  Pause,
  Search,
  Sun,
  Target,
  UserRound,
  Video,
  X,
  Menu,
  MessageCircle,
  Lock,
  Bot,
  Send,
  Maximize2,
  Minimize2,
  FileText,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Play,
  RotateCcw,
  ThumbsUp,
  Layout,
  Globe2,
  Users
} from "lucide-react";

type ApiLesson = {
  id: string | number;
  name: string;
  chapterId?: string | number;
  content?: string | null;
  videoUrl?: string | null;
  isPreview?: boolean | null;
  orderIndex?: number | null;
  durationSeconds?: number | null;
  lessonType?: "VIDEO" | "ARTICLE" | "DOCUMENT" | "CODE_PRACTICE" | "DOCUMENT_AND_CODING" | "QUIZ" | string;
};

type ApiAttachment = {
  id: string | number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSizeBytes?: number | null;
};

type ApiChapter = {
  id: string | number;
  title: string;
  orderIndex?: number | null;
  lessons?: ApiLesson[] | null;
};

type LessonProgress = {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  lastPlaybackTime: number;
};

type QuizOption = { id: string; text: string };
type QuizQuestion = {
  id: string | number;
  questionText: string;
  options: QuizOption[];
};

type ApiQuiz = {
  id: string | number;
  title: string;
  timeLimitMinutes: number;
  passScore: number;
  questions: QuizQuestion[];
};

type VideoInteractiveQuestion = QuizQuestion & {
  videoTimestamp: number;
  answeredCorrectly: boolean;
};

type InteractiveAnswerFeedback = {
  correct: boolean;
  correctOption?: string | null;
  explanation?: string | null;
};

type QuizResult = {
  quizId: string | number;
  score: number;
  passed: boolean;
  answers: { questionId: string | number; selectedOption: string | null; correctOption: string; explanation?: string }[];
};

type ApiCourse = {
  id: string | number;
  title?: string;
  description?: string;
  chapters?: ApiChapter[] | null;
};

const fetcher = (url: string) => {
  const headers = new Headers();
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(url, { headers }).then((response) => {
    if (!response.ok) throw new Error("Không thể tải thông tin khóa học và bài học");
    return response.json() as Promise<ApiCourse>;
  });
};

function extractYouTubeId(url?: string | null): string | null {
  if (!url) return null;
  if (/^[\w-]{11}$/.test(url)) return url;
  try {
    const parsed = new URL(url, "http://localhost:8080");
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    if (["youtube.com", "www.youtube.com", "m.youtube.com"].includes(parsed.hostname)) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const embedMatch = parsed.pathname.match(/^\/embed\/([\w-]{11})$/);
      if (embedMatch) return embedMatch[1];
    }
  } catch {}
  return null;
}

function getSafeAttachmentUrl(fileUrl: string): string | null {
  if (!fileUrl.trim()) return null;
  try {
    const parsedUrl = new URL(fileUrl, "http://localhost:8080");
    return parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:"
      ? parsedUrl.toString()
      : null;
  } catch {
    return null;
  }
}

function getFirstNameInitial(fullName?: string, username?: string): string {
  const name = fullName || username;
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
        <GraduationCap className="size-5" />
      </span>
      <span className="text-xl font-bold tracking-tight text-[#17305f]">
        EduFlow
      </span>
    </a>
  );
}

function LessonContent({ content }: { content?: string | null }) {
  const [copiedBlock, setCopiedBlock] = useState<number | null>(null);
  const [copyError, setCopyError] = useState("");
  if (!content?.trim()) {
    return <p className="text-sm italic text-slate-400">Bài học này chưa có nội dung tài liệu.</p>;
  }

  const blocks = content.split(/(```[\s\S]*?```)/g);
  const copyCode = async (code: string, index: number) => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(code);
      setCopiedBlock(index);
      window.setTimeout(() => setCopiedBlock(null), 1500);
    } catch {
      setCopyError("Không thể sao chép mã. Hãy chọn và sao chép thủ công.");
    }
  };

  return (
    <div className="space-y-4 text-sm leading-7 text-slate-700">
      {blocks.map((block, index) => {
        if (!block.startsWith("```")) {
          return block.trim() ? (
            <p key={index} className="whitespace-pre-wrap">{block.trim()}</p>
          ) : null;
        }
        const code = block.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, "");
        const language = block.match(/^```([^\n]*)/)?.[1]?.trim() || "code";
        return (
          <section key={index} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{language}</span>
              <button type="button" onClick={() => void copyCode(code, index)} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
                {copiedBlock === index ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copiedBlock === index ? "Đã sao chép" : "Sao chép mã"}
              </button>
            </header>
            <pre className="overflow-x-auto p-4 text-xs leading-6 text-emerald-200"><code>{code}</code></pre>
          </section>
        );
      })}
      {copyError && <p role="alert" className="text-xs text-red-600">{copyError}</p>}
    </div>
  );
}

function LessonAttachments({
  attachments,
  error,
  onUploaded,
}: {
  attachments: ApiAttachment[];
  error: string;
  onUploaded: (attachment: ApiAttachment, openPdf: boolean) => void;
}) {
  if (attachments.length === 0) {
    return <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">Chưa có tài liệu hoặc source code đính kèm.</p>;
  }

  return (
    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
        <Download className="size-3.5 text-blue-600" /> Tài liệu và mã nguồn bài học
      </span>
      <div className="grid gap-2 sm:grid-cols-2">
        {attachments.map((attachment) => {
          const safeUrl = getSafeAttachmentUrl(attachment.fileUrl);
          if (!safeUrl) return <p key={attachment.id} role="alert" className="text-xs text-red-600">Liên kết tệp “{attachment.fileName}” không hợp lệ.</p>;
          const isPdf = /\.pdf$/i.test(attachment.fileName) || attachment.fileType.toUpperCase() === "PDF";
          const isSource = /\.zip$/i.test(attachment.fileName) || ["ZIP", "CODE"].includes(attachment.fileType.toUpperCase());
          const isUploaded = new URL(safeUrl).pathname.includes("/uploads/");
          const className = "flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs font-semibold text-blue-700 transition hover:bg-blue-50";
          const label = isPdf ? "Mở PDF" : isSource ? "Tải source code" : "Tải tệp";
          const content = (
            <>
              <span className="flex min-w-0 items-center gap-2 truncate"><FileText className="size-4 shrink-0 text-blue-600" /><span className="truncate">{attachment.fileName}</span></span>
              <span className="shrink-0 rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] uppercase text-slate-500">{label}</span>
            </>
          );
          return isUploaded ? (
            <button key={attachment.id} type="button" onClick={() => onUploaded(attachment, isPdf)} className={className}>{content}</button>
          ) : (
            <a key={attachment.id} href={safeUrl} target={isPdf ? "_blank" : undefined} rel={isPdf ? "noreferrer" : undefined} download={isPdf ? undefined : attachment.fileName} className={className}>{content}</a>
          );
        })}
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}

function Header({
  collapsed,
  onToggle,
  isLoggedIn,
  user,
  onLogout,
  authHref,
}: {
  collapsed: boolean;
  onToggle: () => void;
  isLoggedIn: boolean;
  user: any;
  onLogout: () => void;
  authHref: string;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-17.5 max-w-7xl items-center justify-between gap-6 px-5 lg:px-8">
        <div className="flex items-center gap-2 shrink-0">
          <Logo />
          {isLoggedIn && (
            <button
              onClick={onToggle}
              aria-label={collapsed ? "Mở thanh bên không gian làm việc" : "Thu gọn thanh bên không gian làm việc"}
              className="ml-1 rounded-xl p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
            >
              <PanelLeft className="size-5" />
            </button>
          )}
        </div>

        <nav className="hidden items-center gap-6 lg:flex shrink-0">
          <a className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition" href="/">Trang chủ</a>
          <a className="text-xs font-bold text-blue-600" href="/courses">Khóa học</a>
          <a className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition" href="/courses#filters">Danh mục</a>
        </nav>

        <div className="hidden max-w-sm flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              className="h-9.5 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              placeholder="Tìm khóa học, bài giảng..."
            />
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex shrink-0">
          {isLoggedIn ? (
            <div className="relative flex items-center gap-2 pl-2" ref={dropdownRef}>
              <button className="rounded-xl p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer">
                <Bell className="size-4" />
              </button>

              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl bg-slate-50 p-1.5 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-sm">
                  {getFirstNameInitial(user?.fullName, user?.username)}
                </div>
                <span className="text-xs font-bold text-slate-700 max-w-32.5 truncate">
                  {user?.fullName || user?.username || "Học viên"}
                </span>
                <ChevronDown className="size-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-60 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/60 z-50">
                  <div className="border-b border-slate-100 px-3 py-2.5 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || user?.username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || "student@eduflow.com"}</p>
                  </div>
                  <div className="flex flex-col gap-0.5 text-xs text-slate-600 font-medium">
                    <button onClick={() => router.push("/student/dashboard")} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left cursor-pointer">
                      <UserRound className="size-4 text-slate-400" /> Hồ sơ của tôi
                    </button>
                    <button onClick={() => router.push("/student/certificates")} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-blue-50 hover:text-blue-600 transition text-left cursor-pointer">
                      <Award className="size-4 text-slate-400" /> Chứng chỉ của tôi
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-red-600 hover:bg-red-50 transition text-left font-semibold cursor-pointer">
                      <LogOut className="size-4 text-red-500" /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">
              <a href={authHref} className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:bg-blue-50 transition">Đăng ký</a>
              <a href={authHref} className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700 transition">Đăng nhập</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function WorkspaceSidebar({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const items = [
    ["Trang cá nhân", UserRound, "/student/dashboard"],
    ["Lộ trình học", Target, "/student/roadmap"],
    ["Khóa học của tôi", GraduationCap, "/student/my-courses"],
    ["Code Day", Code2, "/student/code-day"],
    ["Luyện phỏng vấn", MessageCircle, "/student/interview"],
    ["Tiến độ học tập", Award, "/student/progress"],
  ] as const;

  return (
    <aside
      className={`fixed left-0 top-17.5 z-40 hidden h-[calc(100vh-70px)] shrink-0 overflow-y-auto border-r border-slate-200/80 bg-white/95 px-3 py-5 shadow-sm backdrop-blur-xl transition-all duration-300 md:block ${
        collapsed ? "w-19" : "w-64"
      }`}
      aria-label="Không gian làm việc"
    >
      <p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 ${collapsed ? "sr-only" : ""}`}>
        Không gian làm việc
      </p>
      <nav className="flex flex-col gap-1.5">
        {items.map(([label, Icon, path]) => {
          return (
            <button
              key={label}
              type="button"
              title={collapsed ? label : undefined}
              onClick={() => router.push(path)}
              className={`group relative flex w-full shrink-0 items-center rounded-xl py-3 text-sm font-semibold transition ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } text-slate-500 hover:bg-slate-50 hover:text-blue-600`}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100/80 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600">
                <Icon className="size-4 shrink-0" />
              </span>
              <span className={collapsed ? "sr-only" : "truncate"}>{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// Component Thực hành Code song song (Split Screen Workspace)
function LegacyCodePracticeWorkspace() {
  const [activeTab, setActiveTab] = useState<"html" | "css" | "javascript" | "java">("html");
  const [htmlCode, setHtmlCode] = useState(
    "<h1>Chào mừng đến với EduFlow</h1>\n<p>Chỉnh sửa HTML, CSS hoặc JavaScript để xem kết quả.</p>\n<button id=\"hello\">Bấm thử</button>"
  );
  const [cssCode, setCssCode] = useState("body { font-family: sans-serif; padding: 24px; color: #17305f; }\nh1 { color: #2563eb; }\nbutton { padding: 8px 12px; }");
  const [javascriptCode, setJavascriptCode] = useState("document.querySelector('#hello').addEventListener('click', () => {\n  alert('Xin chào từ JavaScript!');\n});");
  const [javaCode, setJavaCode] = useState("public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, EduFlow!\");\n    }\n}");
  const activeCode = { html: htmlCode, css: cssCode, javascript: javascriptCode, java: javaCode }[activeTab];
  const setActiveCode = {
    html: setHtmlCode,
    css: setCssCode,
    javascript: setJavascriptCode,
    java: setJavaCode,
  }[activeTab];
  const combinedCode = `<!doctype html><html><head><meta charset="utf-8"><style>${cssCode}</style></head><body>${htmlCode}<script>${javascriptCode.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
  const isJava = activeTab === "java";

  const downloadJavaFile = () => {
    const file = new Blob([javaCode], { type: "text/x-java-source;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Main.java";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-3">
        <div className="flex flex-wrap">
          {(["html", "css", "javascript", "java"] as const).map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => setActiveTab(language)}
              className={`px-3 py-2.5 text-[11px] font-bold transition ${
                activeTab === language
                  ? "border-b-2 border-blue-500 bg-slate-950 text-blue-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {language === "javascript" ? "JavaScript" : language.toUpperCase()}
            </button>
          ))}
        </div>
        {isJava ? (
          <button
            type="button"
            onClick={downloadJavaFile}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-blue-500"
          >
            <Download className="size-3.5" /> Tải Main.java
          </button>
        ) : (
          <span className="px-1 text-[10px] font-mono uppercase text-emerald-400">Xem trước trực tiếp</span>
        )}
      </div>

      <div className="min-h-[240px] flex-1 p-3">
        <div className="mb-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>{isJava ? "Main.java" : `index.${activeTab === "javascript" ? "js" : activeTab}`}</span>
          <span>UTF-8</span>
        </div>
        <textarea
          aria-label={`Trình soạn thảo ${activeTab}`}
          spellCheck={false}
          value={activeCode}
          onChange={(event) => setActiveCode(event.target.value)}
          className="h-[250px] w-full resize-y rounded-lg bg-slate-950 p-3 font-mono text-xs leading-6 text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
          placeholder={`Nhập mã ${activeTab}...`}
        />
      </div>

      {isJava ? (
        <div className="border-t border-amber-900/60 bg-amber-950/40 px-4 py-3 text-[11px] leading-5 text-amber-200">
          Bạn có thể soạn và tải xuống mã Java. Chạy Java trực tiếp cần môi trường JDK an toàn trên máy chủ; tính năng này chưa được bật.
        </div>
      ) : (
        <div className="h-56 border-t border-slate-800 bg-white">
          <div className="flex h-8 items-center gap-2 border-b border-slate-200 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Play className="size-3 text-emerald-600" /> Kết quả chạy thử
          </div>
          <iframe
            title="Xem trước HTML, CSS và JavaScript"
            srcDoc={combinedCode}
            sandbox="allow-scripts"
            className="h-[calc(100%-2rem)] w-full border-none"
          />
        </div>
      )}
    </div>
  );
}

type LessonComment = {
  id: number;
  parentCommentId: number | null;
  authorName: string;
  content: string;
  createdAt: string;
  helpfulCount: number;
  helpfulByCurrentUser: boolean;
};

function LessonDiscussion({ lessonId, isLoggedIn, authHref }: { lessonId: string; isLoggedIn: boolean; authHref: string }) {
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    const token = localStorage.getItem("accessToken");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    setIsLoading(true);
    setError("");

    fetch(`http://localhost:8080/api/lessons/${lessonId}/comments`, { headers })
      .then(async (response) => {
        if (!response.ok) throw new Error("Không thể tải câu hỏi và thảo luận của bài học.");
        return response.json() as Promise<LessonComment[]>;
      })
      .then((data) => {
        if (isCurrent) setComments(data);
      })
      .catch((loadError: Error) => {
        if (isCurrent) setError(loadError.message || "Không thể tải thảo luận.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [lessonId, reloadKey]);

  const submitComment = async (parentCommentId: number | null) => {
    const content = (parentCommentId === null ? draft : replyDraft).trim();
    if (!content || isSubmitting) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Vui lòng đăng nhập để gửi câu hỏi hoặc trả lời.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:8080/api/lessons/${lessonId}/comments`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ parentCommentId, content }),
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Không thể gửi bình luận. Vui lòng thử lại.");
      }
      setDraft("");
      setReplyDraft("");
      setReplyTo(null);
      setReloadKey((key) => key + 1);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi bình luận.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
  };

  const rootComments = comments.filter((comment) => comment.parentCommentId === null);

  const toggleHelpful = async (comment: LessonComment) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Vui lòng đăng nhập để đánh dấu bình luận hữu ích.");
      return;
    }

    const wasHelpful = comment.helpfulByCurrentUser;
    setComments((current) => current.map((entry) =>
      entry.id === comment.id
        ? {
            ...entry,
            helpfulByCurrentUser: !wasHelpful,
            helpfulCount: Math.max(0, entry.helpfulCount + (wasHelpful ? -1 : 1)),
          }
        : entry
    ));
    try {
      const response = await fetch(
        `http://localhost:8080/api/lessons/${lessonId}/comments/${comment.id}/helpful`,
        {
          method: wasHelpful ? "DELETE" : "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Không thể cập nhật lượt hữu ích.");
    } catch (voteError) {
      setComments((current) => current.map((entry) =>
        entry.id === comment.id
          ? {
              ...entry,
              helpfulByCurrentUser: wasHelpful,
              helpfulCount: Math.max(0, entry.helpfulCount + (wasHelpful ? 1 : -1)),
            }
          : entry
      ));
      setError(voteError instanceof Error ? voteError.message : "Không thể cập nhật lượt hữu ích.");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-blue-600" />
            <h2 className="text-base font-extrabold text-slate-900">Hỏi đáp & bình luận</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">Trao đổi câu hỏi về bài học với giảng viên và các học viên khác.</p>
        </div>
        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">{rootComments.length} câu hỏi</span>
      </div>

      {isLoggedIn ? (
        <div className="space-y-2">
          <label htmlFor="lesson-question" className="text-xs font-bold text-slate-700">Đặt câu hỏi</label>
          <textarea
            id="lesson-question"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={2000}
            placeholder="Bạn chưa hiểu phần nào? Hãy mô tả cụ thể để mọi người hỗ trợ..."
            className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] text-slate-400">{draft.length}/2000</span>
            <button
              type="button"
              disabled={!draft.trim() || isSubmitting}
              onClick={() => void submitComment(null)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-3.5" /> {isSubmitting ? "Đang gửi..." : "Gửi câu hỏi"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-slate-700">
          Đăng nhập để đặt câu hỏi hoặc tham gia trả lời.
          <a href={authHref} className="ml-1 font-bold text-blue-700 hover:underline">Đăng nhập</a>
        </div>
      )}

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

      <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
        {isLoading ? (
          <p className="text-xs text-slate-500">Đang tải thảo luận...</p>
        ) : rootComments.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-5 text-center text-xs text-slate-500">Chưa có câu hỏi nào. Hãy là người đầu tiên bắt đầu trao đổi!</p>
        ) : rootComments.map((comment) => {
          const replies = comments.filter((entry) => entry.parentCommentId === comment.id);
          return (
            <article key={comment.id} className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-blue-700">
                  {getFirstNameInitial(comment.authorName)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xs font-bold text-slate-800">{comment.authorName}</span>
                    <time className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-700">{comment.content}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      onClick={() => void toggleHelpful(comment)}
                      aria-pressed={comment.helpfulByCurrentUser}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold transition ${
                        comment.helpfulByCurrentUser ? "text-blue-700" : "text-slate-500 hover:text-blue-600"
                      }`}
                    >
                      <ThumbsUp className="size-3.5" />
                      Hữu ích{comment.helpfulCount > 0 ? ` · ${comment.helpfulCount}` : ""}
                    </button>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(replyTo === comment.id ? null : comment.id);
                          setReplyDraft("");
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        {replyTo === comment.id ? "Hủy trả lời" : "Trả lời"}
                      </button>
                    )}
                  </div>
                  {replyTo === comment.id && (
                    <div className="mt-3 flex flex-col items-end gap-2">
                      <textarea
                        aria-label={`Trả lời ${comment.authorName}`}
                        value={replyDraft}
                        onChange={(event) => setReplyDraft(event.target.value)}
                        maxLength={2000}
                        placeholder="Viết câu trả lời..."
                        className="min-h-20 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-blue-300 focus:bg-white"
                      />
                      <button
                        type="button"
                        disabled={!replyDraft.trim() || isSubmitting}
                        onClick={() => void submitComment(comment.id)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold text-white hover:bg-slate-700 disabled:opacity-50"
                      >
                        Gửi trả lời
                      </button>
                    </div>
                  )}
                  {replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l-2 border-blue-100 pl-3">
                      {replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                            {getFirstNameInitial(reply.authorName)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="text-[11px] font-bold text-slate-800">{reply.authorName}</span>
                              <time className="text-[10px] text-slate-400">{formatDate(reply.createdAt)}</time>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">{reply.content}</p>
                            <button
                              type="button"
                              onClick={() => void toggleHelpful(reply)}
                              aria-pressed={reply.helpfulByCurrentUser}
                              className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold transition ${
                                reply.helpfulByCurrentUser ? "text-blue-700" : "text-slate-500 hover:text-blue-600"
                              }`}
                            >
                              <ThumbsUp className="size-3.5" />
                              Hữu ích{reply.helpfulCount > 0 ? ` · ${reply.helpfulCount}` : ""}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LockModal({
  isOpen,
  onClose,
  onRegister,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => void;
  error?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Lock className="size-7" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-slate-900">Bài học này đã bị khóa!</h3>
        <p className="mt-2 text-xs leading-relaxed text-slate-600">
          Bạn đã xem hết danh sách bài học thử. Vui lòng Bắt đầu / Đăng ký khóa học để mở khóa trọn bộ bài giảng.
        </p>
        {error && <p role="alert" className="mt-3 text-xs font-semibold text-red-600">{error}</p>}
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer">
            Xem lại bài trước
          </button>
          <button onClick={onRegister} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 cursor-pointer">
            Đăng ký học ngay
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedLesson = searchParams.get("lesson");
  const authReturnUrl = `/learning/${courseId}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const authHref = `/auth?returnUrl=${encodeURIComponent(authReturnUrl)}`;

  const { data: course, error: courseError } = useSWR<ApiCourse>(
    courseId ? `http://localhost:8080/api/courses/${courseId}` : null,
    fetcher
  );

  const [collapsed, setCollapsed] = useState(false);
  const [isLearningPathOpen, setIsLearningPathOpen] = useState(true);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeLesson, setActiveLesson] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const lessonProgressRef = useRef<Record<string, LessonProgress>>({});
  const [attachments, setAttachments] = useState<ApiAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // States quản lý Đóng/Mở tính năng mới
  const [isDocsOpen, setIsDocsOpen] = useState(false); // Collapsible Tài liệu
  const [isCodeWorkspaceOpen, setIsCodeWorkspaceOpen] = useState(false); // Split screen Code
  const [activeInteractiveQuestion, setActiveInteractiveQuestion] = useState<VideoInteractiveQuestion | null>(null);
  const [reviewInteractiveQuestion, setReviewInteractiveQuestion] = useState<VideoInteractiveQuestion | null>(null);
  const [interactiveQuestions, setInteractiveQuestions] = useState<VideoInteractiveQuestion[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [interactiveAnswerError, setInteractiveAnswerError] = useState("");
  const [interactiveAnswerFeedback, setInteractiveAnswerFeedback] = useState<InteractiveAnswerFeedback | null>(null);
  const [isSubmittingInteractiveAnswer, setIsSubmittingInteractiveAnswer] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isPlayerFullscreen, setIsPlayerFullscreen] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState<string[]>([]);

  const [aiMessages, setAiMessages] = useState<{ sender: "ai" | "user"; text: string }[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    setAiMessages([]);
    setAiInput("");
  }, [activeLesson]);

  const playerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerShellRef = useRef<HTMLDivElement | null>(null);
  const progressIntervalRef = useRef<any>(null);
  const youtubeSeekMonitorRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const quizRef = useRef<ApiQuiz | null>(null);
  const interactiveQuestionsRef = useRef<VideoInteractiveQuestion[]>([]);
  const interactiveQuestionsLoadedRef = useRef(false);
  const isReviewModeRef = useRef(false);
  const answeredInteractiveQuestionIdsRef = useRef<Set<string>>(new Set());
  const activeInteractiveQuestionRef = useRef<VideoInteractiveQuestion | null>(null);
  const lastAcceptedPlaybackTimeRef = useRef(0);
  const lastYoutubeSampledAtRef = useRef(0);
  const correctedVideoSeekRef = useRef<number | null>(null);
  const lastProgressSaveAtRef = useRef(0);
  const completedLessonIdsRef = useRef<Set<string>>(new Set());

  const chapters = [...(course?.chapters ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  const lessons = chapters.flatMap((chapter, chapterIndex) =>
    [...(chapter.lessons ?? [])]
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map((lesson, lessonIndex) => ({
        ...lesson,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterNumber: chapterIndex + 1,
        lessonNumber: `${chapterIndex + 1}.${lessonIndex + 1}`,
      }))
  );

  const activeLessonData = lessons.find((lesson) => String(lesson.id) === activeLesson);
  const activeLessonIndex = lessons.findIndex((lesson) => String(lesson.id) === activeLesson);
  const activeLessonType = activeLessonData?.lessonType ?? "VIDEO";
  const isVideoLesson = activeLessonType === "VIDEO";
  const isQuizLesson = activeLessonType === "QUIZ";
  const isDocumentLesson = ["ARTICLE", "DOCUMENT", "CODE_PRACTICE", "DOCUMENT_AND_CODING"].includes(activeLessonType);
  const hasIntegratedCodeWorkspace = ["CODE_PRACTICE", "DOCUMENT_AND_CODING"].includes(activeLessonType);
  const shouldShowCodeWorkspace = hasIntegratedCodeWorkspace || (isCodeWorkspaceOpen && (isVideoLesson || activeLessonType === "ARTICLE"));
  const youtubeId = extractYouTubeId(activeLessonData?.videoUrl);
  const mp4Url = youtubeId ? null : getSafeAttachmentUrl(activeLessonData?.videoUrl ?? "");

  useEffect(() => {
    setIsDocsOpen(false);
    setIsCodeWorkspaceOpen(["CODE_PRACTICE", "DOCUMENT_AND_CODING"].includes(activeLessonData?.lessonType ?? ""));
  }, [activeLessonData?.id, activeLessonData?.lessonType]);

  useEffect(() => {
    if (!course || lessons.length === 0) return;
    const matchingLesson = lessons.find((l) => String(l.id) === requestedLesson && (l.isPreview || isEnrolled));
    const currentLesson = lessons.find((l) => String(l.id) === activeLesson);
    const accessible = currentLesson && (currentLesson.isPreview || isEnrolled) ? currentLesson : undefined;
    const nextLesson = matchingLesson ?? accessible ?? lessons.find((l) => l.isPreview) ?? lessons[0];

    if (nextLesson && String(nextLesson.id) !== activeLesson) {
      setActiveLesson(String(nextLesson.id));
    }
  }, [course, requestedLesson, activeLesson, lessons, isEnrolled]);

  // Tải Tài liệu & Quiz
  useEffect(() => {
    if (!activeLessonData) return;
    const controller = new AbortController();
    const token = localStorage.getItem("accessToken");
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    setAttachments([]);

    fetch(`http://localhost:8080/api/lessons/${activeLessonData.id}/attachments`, { headers, signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setAttachments(data))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setAttachments([]);
          console.error("Không thể tải tài liệu bài học.", error);
        }
      });

    quizRef.current = null;
    setQuizResult(null);
    setInteractiveQuestions([]);
    interactiveQuestionsRef.current = [];
    interactiveQuestionsLoadedRef.current = false;
    setIsReviewMode(false);
    isReviewModeRef.current = false;
    setActiveInteractiveQuestion(null);
    setReviewInteractiveQuestion(null);
    activeInteractiveQuestionRef.current = null;
    setInteractiveAnswerFeedback(null);
    setInteractiveAnswerError("");
    if (activeLessonType !== "VIDEO") {
      return () => controller.abort();
    }

    fetch(`http://localhost:8080/api/lessons/${activeLessonData.id}/quiz`, { headers, signal: controller.signal })
      .then((res) => (res.ok && res.status !== 204 ? res.json() : null))
      .then((data) => {
        quizRef.current = data;
      })
      .catch(() => {
        quizRef.current = null;
      });

    fetch(`http://localhost:8080/api/lessons/${activeLessonData.id}/interactive-questions`, {
      headers,
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || controller.signal.aborted) return;
        const questions = Array.isArray(data.questions) ? data.questions : [];
        interactiveQuestionsRef.current = questions;
        interactiveQuestionsLoadedRef.current = true;
        isReviewModeRef.current = Boolean(data.reviewMode);
        answeredInteractiveQuestionIdsRef.current = new Set(
          questions.filter((question: VideoInteractiveQuestion) => question.answeredCorrectly)
            .map((question: VideoInteractiveQuestion) => String(question.id))
        );
        setInteractiveQuestions(questions);
        setIsReviewMode(Boolean(data.reviewMode));
        const savedTime = lessonProgressRef.current[String(activeLessonData.id)]?.lastPlaybackTime ?? 0;
        const nextUnanswered = questions.find((question: VideoInteractiveQuestion) =>
          !question.answeredCorrectly
        );
        const restoredTime = data.reviewMode || !nextUnanswered
          ? savedTime
          : Math.min(savedTime, nextUnanswered.videoTimestamp);
        lastAcceptedPlaybackTimeRef.current = restoredTime;
        if (youtubeId && playerRef.current && restoredTime > 0) {
          playerRef.current.seekTo(restoredTime, true);
        } else if (videoRef.current && restoredTime > 0) {
          videoRef.current.currentTime = restoredTime;
        }
        if (youtubeId && playerRef.current) {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration() || activeLessonData.durationSeconds || 0;
          handleVideoTimeUpdate(currentTime, duration);
        } else if (videoRef.current) {
          handleVideoTimeUpdate(videoRef.current.currentTime, videoRef.current.duration);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          interactiveQuestionsLoadedRef.current = true;
          console.error("Không thể tải câu hỏi tương tác của video.", error);
        }
      });

    return () => controller.abort();
  }, [activeLessonData?.id, activeLessonType]);

  useEffect(() => {
    answeredInteractiveQuestionIdsRef.current = new Set();
    activeInteractiveQuestionRef.current = null;
    lastAcceptedPlaybackTimeRef.current = 0;
    correctedVideoSeekRef.current = null;
    lastProgressSaveAtRef.current = 0;
    setVideoDuration(activeLessonData?.durationSeconds ?? 0);
    setVideoCurrentTime(0);
    setIsVideoPlaying(false);
    setIsVideoReady(!youtubeId && !mp4Url);
    setActiveInteractiveQuestion(null);
    setReviewInteractiveQuestion(null);
    setInteractiveAnswerFeedback(null);
    setInteractiveAnswerError("");
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (youtubeSeekMonitorRef.current) {
      clearInterval(youtubeSeekMonitorRef.current);
      youtubeSeekMonitorRef.current = null;
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (youtubeSeekMonitorRef.current) {
        clearInterval(youtubeSeekMonitorRef.current);
        youtubeSeekMonitorRef.current = null;
      }
    };
  }, [activeLessonData?.id, youtubeId, mp4Url]);

  // Lưu Tiến Độ API
  const persistProgress = async (completed: boolean, playbackTime = 0) => {
    if (!activeLessonData) return;
    if (completed) completedLessonIdsRef.current.add(String(activeLessonData.id));
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const knownDuration = activeLessonData.durationSeconds ?? 0;
      const safePlaybackTime = knownDuration > 0 ? Math.min(playbackTime, knownDuration) : playbackTime;
      const res = await fetch(`http://localhost:8080/api/lessons/${activeLessonData.id}/progress`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ lastPlaybackTime: Math.floor(safePlaybackTime), completed }),
      });
      if (res.ok) {
        const data = await res.json();
        const updatedProgress = {
          ...lessonProgressRef.current,
          [String(activeLessonData.id)]: {
            status: data.status,
            lastPlaybackTime: data.lastPlaybackTime,
          },
        };
        lessonProgressRef.current = updatedProgress;
        setLessonProgress(updatedProgress);
      }
    } catch {}
  };

  const handleVideoTimeUpdate = (currentTime: number, duration = activeLessonData?.durationSeconds ?? 0) => {
    const currentLessonId = activeLessonData ? String(activeLessonData.id) : "";
    setVideoCurrentTime((previous) => Math.abs(previous - currentTime) >= 0.25 ? currentTime : previous);
    if (duration > 0) setVideoDuration((previous) => previous === duration ? previous : duration);
    if (activeInteractiveQuestionRef.current) return;

    if (interactiveQuestionsLoadedRef.current && !isReviewModeRef.current) {
      const pendingQuestion = interactiveQuestionsRef.current.find(
        (question) => !answeredInteractiveQuestionIdsRef.current.has(String(question.id))
      );
      if (pendingQuestion && currentTime >= pendingQuestion.videoTimestamp) {
        activeInteractiveQuestionRef.current = pendingQuestion;
        playerRef.current?.pauseVideo();
        videoRef.current?.pause();
        if (currentTime > pendingQuestion.videoTimestamp + 0.25) {
          if (playerRef.current) playerRef.current.seekTo(pendingQuestion.videoTimestamp, true);
          if (videoRef.current) videoRef.current.currentTime = pendingQuestion.videoTimestamp;
        }
        lastAcceptedPlaybackTimeRef.current = pendingQuestion.videoTimestamp;
        setActiveInteractiveQuestion(pendingQuestion);
        return;
      }
    }
    lastAcceptedPlaybackTimeRef.current = currentTime;
    lastAcceptedPlaybackTimeRef.current = currentTime;
    const isComplete = duration > 0 && currentTime / duration >= 0.8;
    if (isComplete && currentLessonId && !completedLessonIdsRef.current.has(currentLessonId)) {
      completedLessonIdsRef.current.add(currentLessonId);
      void persistProgress(true, currentTime);
    } else if (!isComplete && Math.abs(currentTime - lastProgressSaveAtRef.current) >= 5) {
      lastProgressSaveAtRef.current = currentTime;
      void persistProgress(false, currentTime);
    }
  };

  const getForwardSeekLimit = () => {
    if (!interactiveQuestionsLoadedRef.current || isReviewModeRef.current) return Number.POSITIVE_INFINITY;
    const nextQuestion = interactiveQuestionsRef.current.find(
      (question) => !answeredInteractiveQuestionIdsRef.current.has(String(question.id))
    );
    return nextQuestion?.videoTimestamp ?? Number.POSITIVE_INFINITY;
  };

  const handleMp4Seeking = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (correctedVideoSeekRef.current !== null) return;
    const video = event.currentTarget;
    const seekLimit = getForwardSeekLimit();
    if (video.currentTime <= seekLimit + 0.25) return;

    const safeTime = Math.min(lastAcceptedPlaybackTimeRef.current, seekLimit);
    correctedVideoSeekRef.current = safeTime;
    video.currentTime = safeTime;
  };

  const handleMp4Seeked = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (correctedVideoSeekRef.current !== null) {
      lastAcceptedPlaybackTimeRef.current = Math.min(
        video.currentTime,
        correctedVideoSeekRef.current
      );
      correctedVideoSeekRef.current = null;
      return;
    }
    lastAcceptedPlaybackTimeRef.current = video.currentTime;
    handleVideoTimeUpdate(video.currentTime, video.duration);
  };

  const seekVideoTo = (requestedTime: number) => {
    const seekLimit = getForwardSeekLimit();
    const targetTime = Math.max(0, Math.min(requestedTime, videoDuration, seekLimit));
    lastAcceptedPlaybackTimeRef.current = targetTime;
    setVideoCurrentTime(targetTime);
    if (youtubeId) playerRef.current?.seekTo(targetTime, true);
    else if (videoRef.current) videoRef.current.currentTime = targetTime;
  };

  const toggleVideoPlayback = () => {
    if (isVideoPlaying) {
      if (youtubeId) playerRef.current?.pauseVideo();
      else videoRef.current?.pause();
      setIsVideoPlaying(false);
      return;
    }
    if (youtubeId) playerRef.current?.playVideo();
    else void videoRef.current?.play();
    setIsVideoPlaying(true);
  };

  const formatVideoTime = (time: number) => {
    const totalSeconds = Math.max(0, Math.floor(time));
    return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
  };

  const togglePlayerFullscreen = async () => {
    const playerShell = playerShellRef.current;
    if (!playerShell) return;

    if (document.fullscreenElement === playerShell) {
      await document.exitFullscreen();
    } else if (!document.fullscreenElement) {
      await playerShell.requestFullscreen();
    }
  };

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsPlayerFullscreen(document.fullscreenElement === playerShellRef.current);
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const handleInteractiveAnswer = async (selectedOption: string) => {
    const question = activeInteractiveQuestionRef.current;
    if (!question || !activeLessonData || interactiveAnswerFeedback?.correct) return;
    setInteractiveAnswerError("");
    setInteractiveAnswerFeedback(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setInteractiveAnswerError("Vui lòng đăng nhập để lưu câu trả lời và tiếp tục bài học.");
      return;
    }

    setIsSubmittingInteractiveAnswer(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/lessons/${activeLessonData.id}/interactive-questions/${question.id}/answer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ selectedOption }),
        }
      );
      if (!response.ok) {
        throw new Error(`Không thể lưu câu trả lời (HTTP ${response.status}).`);
      }
      const result: InteractiveAnswerFeedback = await response.json();
      if (!result.correct) {
        setInteractiveAnswerFeedback(result);
        return;
      }

      setInteractiveQuestions((current) => current.map((item) =>
        String(item.id) === String(question.id) ? { ...item, answeredCorrectly: true } : item
      ));
      interactiveQuestionsRef.current = interactiveQuestionsRef.current.map((item) =>
        String(item.id) === String(question.id) ? { ...item, answeredCorrectly: true } : item
      );
      setInteractiveAnswerFeedback(result);
    } catch (error) {
      setInteractiveAnswerError(error instanceof Error ? error.message : "Không thể lưu câu trả lời.");
    } finally {
      setIsSubmittingInteractiveAnswer(false);
    }
  };

  const continueAfterInteractiveQuestion = () => {
    const question = activeInteractiveQuestionRef.current;
    if (!question || !interactiveAnswerFeedback?.correct) return;
    answeredInteractiveQuestionIdsRef.current.add(String(question.id));
    activeInteractiveQuestionRef.current = null;
    setActiveInteractiveQuestion(null);
    setInteractiveAnswerFeedback(null);
    if (youtubeId) playerRef.current?.playVideo();
    else void videoRef.current?.play();
  };

  const openInteractiveQuestionReview = (question: VideoInteractiveQuestion) => {
    setReviewInteractiveQuestion(question);
    if (youtubeId) {
      playerRef.current?.pauseVideo();
      playerRef.current?.seekTo(question.videoTimestamp, true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = question.videoTimestamp;
    }
  };

  const closeInteractiveQuestionReview = () => {
    setReviewInteractiveQuestion(null);
    if (youtubeId) playerRef.current?.playVideo();
    else void videoRef.current?.play();
  };

  // YouTube Ready & Interactive Video Quiz Listener
  const handleYouTubeReady = (event: any) => {
    playerRef.current = event.target;
    setIsVideoReady(true);
    setVideoDuration(event.target.getDuration() || activeLessonData?.durationSeconds || 0);
    const savedTime = lessonProgressRef.current[activeLesson]?.lastPlaybackTime || 0;
    const restoreTime = interactiveQuestionsLoadedRef.current
      ? Math.min(savedTime, getForwardSeekLimit())
      : 0;
    lastAcceptedPlaybackTimeRef.current = restoreTime;
    if (restoreTime > 0) event.target.seekTo(restoreTime, true);
    lastYoutubeSampledAtRef.current = Date.now();
    if (youtubeSeekMonitorRef.current) clearInterval(youtubeSeekMonitorRef.current);
    youtubeSeekMonitorRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const playerState = player.getPlayerState();
      setIsVideoPlaying(playerState === 1);
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration() || activeLessonData?.durationSeconds || 0;
      if (duration > 0) setVideoDuration((current) => current === duration ? current : duration);

      const now = Date.now();
      const elapsedSeconds = lastYoutubeSampledAtRef.current > 0
        ? (now - lastYoutubeSampledAtRef.current) / 1000
        : 0.25;
      const allowedNaturalAdvance = Math.max(1.5, elapsedSeconds * 1.75 + 0.75);
      const isForwardSeek = currentTime - lastAcceptedPlaybackTimeRef.current > allowedNaturalAdvance;
      const seekLimit = getForwardSeekLimit();
      lastYoutubeSampledAtRef.current = now;

      if (isForwardSeek && currentTime > seekLimit + 0.25) {
        const safeTime = Math.min(lastAcceptedPlaybackTimeRef.current, seekLimit);
        player.seekTo(safeTime, true);
        handleVideoTimeUpdate(safeTime, duration);
        return;
      }
      handleVideoTimeUpdate(currentTime, duration);
    }, 250);
  };

  const handleYouTubeStateChange = (event: any) => {
    setIsVideoPlaying(event.data === 1);
    if (event.data === 0 && playerRef.current) {
      void persistProgress(true, playerRef.current.getCurrentTime());
    } else if (event.data === 2 && playerRef.current) {
      void persistProgress(false, playerRef.current.getCurrentTime());
    }
  };

  const handleSendAiQuestion = async () => {
    if (!aiInput.trim() || isAiLoading || !activeLessonData) return;
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(authHref);
      return;
    }

    const question = aiInput.trim();
    const lessonId = activeLessonData.id;
    setAiMessages((prev) => [...prev, { sender: "user", text: question }]);
    setAiInput("");
    setIsAiLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question, courseId, lessonId }),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const providerError = typeof errorBody?.detail === "string"
          ? errorBody.detail
          : typeof errorBody?.message === "string"
            ? errorBody.message
            : "";
        throw new Error(providerError || `AI Tutor không thể trả lời (HTTP ${res.status}).`);
      }
      const data = await res.json();
      if (String(lessonId) === activeLesson) {
        setAiMessages((prev) => [...prev, { sender: "ai", text: data.answer || "Không có câu trả lời." }]);
      }
    } catch (error) {
      if (String(lessonId) === activeLesson) {
        setAiMessages((prev) => [...prev, {
          sender: "ai",
          text: error instanceof Error && error.message.startsWith("AI Tutor")
            ? error.message
            : "Không thể kết nối tới AI Tutor. Vui lòng thử lại sau.",
        }]);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      fetch("http://localhost:8080/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setUser(data))
        .catch(() => {});

      fetch(`http://localhost:8080/api/enrollments/check/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => (res.ok ? res.json() : { isEnrolled: false }))
        .then((data) => setIsEnrolled(Boolean(data.isEnrolled)))
        .catch(() => setIsEnrolled(false));

      fetch(`http://localhost:8080/api/courses/${courseId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (!Array.isArray(data)) return;
          const progressByLesson: Record<string, LessonProgress> = {};
          for (const progress of data) {
            progressByLesson[String(progress.lessonId)] = {
              status: progress.status,
              lastPlaybackTime: progress.lastPlaybackTime ?? 0,
            };
            if (progress.status === "COMPLETED") {
              completedLessonIdsRef.current.add(String(progress.lessonId));
            }
          }
          lessonProgressRef.current = progressByLesson;
          setLessonProgress(progressByLesson);
        })
        .catch(() => {});
    }
  }, [courseId]);

  const handleSelectLesson = (lesson: ApiLesson) => {
    if (lesson.isPreview || isEnrolled) {
      if (String(lesson.id) !== activeLesson) {
        setIsVideoReady(false);
        playerRef.current = null;
      }
      setActiveLesson(String(lesson.id));
      router.replace(`/learning/${courseId}?lesson=${lesson.id}`, { scroll: false });
    } else {
      setLockModalOpen(true);
    }
  };

  const handleUploadedAttachment = async (attachment: ApiAttachment, isPdf: boolean) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAttachmentError("Vui lòng đăng nhập để mở hoặc tải tài liệu của khóa học.");
      return;
    }

    const previewWindow = isPdf ? window.open("about:blank", "_blank") : null;
    setAttachmentError("");

    try {
      const response = await fetch(
        `http://localhost:8080/api/lessons/${activeLessonData?.id}/attachments/${attachment.id}/download${isPdf ? "?inline=true" : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const reason = await response.text();
        throw new Error(response.status === 401
          ? "Phiên đăng nhập đã hết hạn. Đăng nhập lại rồi thử tải tệp."
          : reason || `Không thể tải tệp (HTTP ${response.status}).`);
      }

      const fileBlob = await response.blob();
      const objectUrl = URL.createObjectURL(fileBlob);
      if (isPdf) {
        if (!previewWindow) {
          URL.revokeObjectURL(objectUrl);
          throw new Error("Trình duyệt đã chặn cửa sổ PDF. Hãy cho phép cửa sổ bật lên rồi thử lại.");
        }
        previewWindow.location.href = objectUrl;
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      } else {
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = attachment.fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      }
    } catch (error) {
      previewWindow?.close();
      setAttachmentError(error instanceof Error ? error.message : "Không thể mở hoặc tải tệp.");
    }
  };

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-clip bg-[#f8fbff] text-slate-900">
      <Header
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
        authHref={authHref}
        onLogout={() => { localStorage.removeItem("accessToken"); setIsLoggedIn(false); }}
      />
      {isLoggedIn && <WorkspaceSidebar collapsed={collapsed} />}

      <main className={`w-full min-w-0 flex-1 transition-all duration-300 ${isLoggedIn ? (collapsed ? "md:pl-19" : "md:pl-64") : ""}`}>
        <div className="mx-auto w-full min-w-0 max-w-7xl px-5 py-6 lg:px-8">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <nav aria-label="Đường dẫn" className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <Home className="size-3.5 text-blue-600" />
              <a href="/" className="transition hover:text-blue-600">EduFlow</a>
              <span aria-hidden="true">/</span>
              <a href="/courses" className="transition hover:text-blue-600">Khóa học</a>
              <span aria-hidden="true">/</span>
              <a href={`/courses/${courseId}`} className="max-w-56 truncate transition hover:text-blue-600">
                {course?.title || "Chi tiết khóa học"}
              </a>
              {activeLessonData && (
                <>
                  <span aria-hidden="true">/</span>
                  <a href={`/courses/${courseId}#curriculum`} className="max-w-44 truncate transition hover:text-blue-600">
                    {activeLessonData.chapterTitle}
                  </a>
                  <span aria-hidden="true">/</span>
                  <span aria-current="page" className="max-w-56 truncate font-bold text-slate-800">
                    {activeLessonData.lessonNumber} {activeLessonData.name}
                  </span>
                </>
              )}
            </nav>
            <button
              type="button"
              aria-expanded={isLearningPathOpen}
              onClick={() => setIsLearningPathOpen((open) => !open)}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-xs transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <PanelLeft className="size-4" />
              {isLearningPathOpen ? "Ẩn lộ trình" : "Mở lộ trình"}
            </button>
          </div>

          <div className={`grid gap-6 ${isLearningPathOpen ? "lg:grid-cols-[288px_minmax(0,1fr)]" : "grid-cols-1"}`}>
            {isLearningPathOpen && <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]">
                <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">Lộ trình học</p>
                      <h2 className="mt-1 line-clamp-2 text-sm font-extrabold text-slate-900">{course?.title || "Danh sách bài học"}</h2>
                    </div>
                    <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
                      {lessons.length} bài
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                      <span>Tiến độ khóa học</span>
                      <span>{lessons.length ? Math.round((lessons.filter((lesson) => lessonProgress[String(lesson.id)]?.status === "COMPLETED").length / lessons.length) * 100) : 0}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-blue-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${lessons.length ? (lessons.filter((lesson) => lessonProgress[String(lesson.id)]?.status === "COMPLETED").length / lessons.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-13rem)] space-y-3 overflow-y-auto p-3">
                  {chapters.map((chapter, chapterIndex) => {
                    const chapterLessons = [...(chapter.lessons ?? [])].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
                    const isChapterCollapsed = collapsedChapters.includes(String(chapter.id));
                    const chapterCompleted = chapterLessons.filter((lesson) => lessonProgress[String(lesson.id)]?.status === "COMPLETED").length;
                    return (
                      <section key={chapter.id} className="overflow-hidden rounded-xl border border-slate-100">
                        <button
                          type="button"
                          aria-expanded={!isChapterCollapsed}
                          onClick={() => setCollapsedChapters((previous) =>
                            isChapterCollapsed
                              ? previous.filter((id) => id !== String(chapter.id))
                              : [...previous, String(chapter.id)]
                          )}
                          className="flex w-full items-center justify-between gap-2 bg-slate-50/80 px-3 py-2.5 text-left hover:bg-blue-50/70"
                        >
                          <span className="flex min-w-0 items-start gap-2">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-extrabold text-blue-600 shadow-sm">{chapterIndex + 1}</span>
                            <span className="min-w-0">
                              <span className="block line-clamp-2 text-[11px] font-bold leading-4 text-slate-700">{chapter.title}</span>
                              <span className="mt-0.5 block text-[10px] font-medium text-slate-400">{chapterCompleted}/{chapterLessons.length} bài hoàn thành</span>
                            </span>
                          </span>
                          {isChapterCollapsed ? <ChevronDown className="size-4 shrink-0 text-slate-400" /> : <ChevronUp className="size-4 shrink-0 text-slate-400" />}
                        </button>
                        {!isChapterCollapsed && (
                          <div className="space-y-1 p-1.5">
                            {chapterLessons.map((lesson, lessonIndex) => {
                              const isActive = activeLesson === String(lesson.id);
                              const isCompleted = lessonProgress[String(lesson.id)]?.status === "COMPLETED";
                              const lessonNumber = `${chapterIndex + 1}.${lessonIndex + 1}`;
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleSelectLesson(lesson)}
                                  aria-current={isActive ? "page" : undefined}
                                  className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2.5 text-left transition ${
                                    isActive ? "bg-blue-600 text-white shadow-sm shadow-blue-200" : "text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className={`w-8 shrink-0 text-[10px] font-extrabold tabular-nums ${isActive ? "text-blue-100" : "text-slate-400"}`}>
                                    {lessonNumber}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block line-clamp-2 text-[11px] font-semibold leading-4">{lesson.name}</span>
                                  </span>
                                  {isCompleted ? (
                                    <CheckCircle2 className={`size-3.5 shrink-0 ${isActive ? "text-white" : "text-emerald-500"}`} />
                                  ) : !lesson.isPreview && !isEnrolled ? (
                                    <Lock className={`size-3 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                                  ) : (
                                    lesson.lessonType === "QUIZ" ? (
                                      <HelpCircle className={`size-3.5 shrink-0 ${isActive ? "text-white" : "text-blue-500"}`} />
                                    ) : ["ARTICLE", "DOCUMENT", "CODE_PRACTICE", "DOCUMENT_AND_CODING"].includes(lesson.lessonType ?? "") ? (
                                      <FileText className={`size-3.5 shrink-0 ${isActive ? "text-white" : "text-blue-500"}`} />
                                    ) : (
                                      <Video className={`size-3.5 shrink-0 ${isActive ? "text-white" : "text-blue-500"}`} />
                                    )
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    );
                  })}
                  {chapters.length === 0 && (
                    <p className="rounded-xl bg-slate-50 px-3 py-4 text-xs text-slate-500">Chưa có nội dung bài học.</p>
                  )}
                </div>
              </aside>}

            {/* Khối Nội Dung Bài Học (Tương Tác Đỉnh Cao) */}
            <div className="flex flex-col gap-6 min-w-0">
              
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                    {activeLessonData ? `Chương ${activeLessonData.chapterNumber} · Bài ${activeLessonData.lessonNumber}` : "EduFlow · Lớp học"}
                  </p>
                  <h1 className="text-lg font-black leading-tight text-[#17305f] sm:text-xl">
                    {activeLessonData?.name || "Chọn bài học để bắt đầu"}
                  </h1>
                </div>
                {activeLessonData && (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
                    {lessonProgress[String(activeLessonData.id)]?.status === "COMPLETED" ? "Đã hoàn thành" : "Đang học"}
                  </span>
                )}
              </div>

              {/* Bố cục Linh hoạt: Nếu mở Code Workspace thì chia 2 cột */}
              {isQuizLesson && activeLessonData?.chapterId ? (
                <ChapterSummaryQuiz
                  key={activeLessonData.id}
                  chapterId={activeLessonData.chapterId}
                  chapterTitle={activeLessonData.chapterTitle}
                />
              ) : (
              <div className={`grid min-w-0 gap-6 transition-all ${shouldShowCodeWorkspace ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

                {/* BÊN TRÁI: PLAYER HOẶC TÀI LIỆU THEO LOẠI BÀI HỌC */}
                <div className="flex flex-col gap-4">
                  {isVideoLesson ? (
                    <>
                  <div
                    ref={playerShellRef}
                    className={isPlayerFullscreen
                      ? "fixed inset-0 z-[100] flex flex-col justify-center gap-4 overflow-auto bg-black p-4"
                      : "flex flex-col gap-4"}
                  >

                  {/* Khung Video & Popup Interactive Quiz */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md flex items-center justify-center">
                    {youtubeId ? (
                      <YouTube
                        key={youtubeId}
                        videoId={youtubeId}
                        className="size-full"
                        iframeClassName="size-full"
                        onReady={handleYouTubeReady}
                        onError={() => setIsVideoReady(true)}
                        onStateChange={handleYouTubeStateChange}
                        opts={{ playerVars: { autoplay: 0, modestbranding: 1, controls: 0, disablekb: 1 } }}
                      />
                    ) : mp4Url ? (
                      <video
                        ref={videoRef}
                        src={mp4Url}
                        playsInline
                        className="size-full object-contain"
                        onLoadedData={() => setIsVideoReady(true)}
                        onLoadedMetadata={(event) => {
                          setIsVideoReady(true);
                          setVideoDuration(event.currentTarget.duration);
                          const savedTime = lessonProgressRef.current[activeLesson]?.lastPlaybackTime || 0;
                          const restoreTime = interactiveQuestionsLoadedRef.current
                            ? Math.min(savedTime, getForwardSeekLimit())
                            : 0;
                          lastAcceptedPlaybackTimeRef.current = restoreTime;
                          if (restoreTime > 0 && restoreTime < event.currentTarget.duration) {
                            event.currentTarget.currentTime = restoreTime;
                          }
                        }}
                        onTimeUpdate={(event) => handleVideoTimeUpdate(event.currentTarget.currentTime, event.currentTarget.duration)}
                        onPlay={() => setIsVideoPlaying(true)}
                        onSeeking={handleMp4Seeking}
                        onSeeked={handleMp4Seeked}
                        onPause={(event) => {
                          setIsVideoPlaying(false);
                          void persistProgress(false, event.currentTarget.currentTime);
                        }}
                        onEnded={(event) => {
                          setIsVideoPlaying(false);
                          void persistProgress(true, event.currentTarget.duration);
                        }}
                      />
                    ) : (
                      <p className="text-xs text-white/70">Bài học này chưa có video.</p>
                    )}

                    {!isVideoReady && (youtubeId || mp4Url) && (
                      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-950/85 text-white transition-opacity duration-300" role="status" aria-live="polite">
                        <span className="size-8 animate-spin rounded-full border-2 border-white/25 border-t-blue-400" />
                        <span className="text-xs font-semibold">Đang chuyển bài học...</span>
                      </div>
                    )}

                    {isReviewMode && videoDuration > 0 && interactiveQuestions.length > 0 && (
                      <div className="pointer-events-none absolute inset-x-4 bottom-3 z-20 h-7">
                        {interactiveQuestions.map((question) => (
                          <button
                            key={question.id}
                            type="button"
                            title={question.answeredCorrectly ? "Bạn đã trả lời đúng câu hỏi này ở lần học trước" : undefined}
                            aria-label={`Đến câu hỏi tại phút ${Math.floor(question.videoTimestamp / 60)} giây ${question.videoTimestamp % 60}`}
                            onClick={() => openInteractiveQuestionReview(question)}
                            className="pointer-events-auto absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-amber-400 shadow [cursor:pointer]"
                            style={{ left: `${Math.min(100, Math.max(0, question.videoTimestamp / videoDuration * 100))}%` }}
                          />
                        ))}
                      </div>
                    )}

                    {reviewInteractiveQuestion && (
                      <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 p-6 text-white backdrop-blur-sm animate-in fade-in">
                        <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 text-left shadow-2xl">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                              Xem lại câu hỏi · {formatVideoTime(reviewInteractiveQuestion.videoTimestamp)}
                            </span>
                            <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                              Đã trả lời đúng
                            </span>
                          </div>
                          <h3 className="mb-4 text-sm font-bold">{reviewInteractiveQuestion.questionText}</h3>
                          <div className="space-y-2">
                            {reviewInteractiveQuestion.options.map((option) => (
                              <div
                                key={option.id}
                                className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs font-semibold"
                              >
                                <span className="mr-2 text-blue-300">{option.id}.</span>
                                {option.text}
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={closeInteractiveQuestionReview}
                            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
                          >
                            Đóng và tiếp tục xem
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {activeInteractiveQuestion && (
                    <section
                      aria-labelledby="video-question-title"
                      className="w-full rounded-2xl border border-amber-200 bg-white p-4 shadow-md animate-in fade-in sm:p-6"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Câu hỏi kiểm tra nhanh trong video
                      </p>
                      <h3 id="video-question-title" className="mt-2 text-sm font-bold leading-6 text-slate-900">
                        {activeInteractiveQuestion.questionText}
                      </h3>
                      <div className="mt-4 grid gap-2">
                        {activeInteractiveQuestion.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={isSubmittingInteractiveAnswer}
                            onClick={() => void handleInteractiveAnswer(opt.id)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                      {interactiveAnswerFeedback && (
                        <div className={`mt-3 rounded-xl border p-3 text-xs leading-relaxed ${interactiveAnswerFeedback.correct ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`} role="status">
                          <p className="font-bold">{interactiveAnswerFeedback.correct ? "Chính xác!" : "Chưa chính xác. Hãy thử lại."}</p>
                          {interactiveAnswerFeedback.explanation && <p className="mt-1">{interactiveAnswerFeedback.explanation}</p>}
                          {interactiveAnswerFeedback.correct && (
                            <button
                              type="button"
                              onClick={continueAfterInteractiveQuestion}
                              className="mt-3 rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700"
                            >
                              Tiếp tục video
                            </button>
                          )}
                        </div>
                      )}
                      {interactiveAnswerError && <p role="alert" className="mt-3 text-xs text-red-600">{interactiveAnswerError}</p>}
                    </section>
                  )}

                  {(youtubeId || mp4Url) && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-xs">
                      <button
                        type="button"
                        onClick={toggleVideoPlayback}
                        disabled={!isVideoReady || Boolean(activeInteractiveQuestion) || Boolean(reviewInteractiveQuestion)}
                        aria-label={isVideoPlaying ? "Tạm dừng video" : "Phát video"}
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isVideoPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                      </button>
                      <span className="w-11 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
                        {formatVideoTime(videoCurrentTime)}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(
                          0,
                          Number.isFinite(getForwardSeekLimit())
                            ? Math.min(videoDuration, getForwardSeekLimit())
                            : videoDuration
                        )}
                        step={0.25}
                        value={Math.min(videoCurrentTime, Math.max(
                          0,
                          Number.isFinite(getForwardSeekLimit())
                            ? Math.min(videoDuration, getForwardSeekLimit())
                            : videoDuration
                        ))}
                        onChange={(event) => seekVideoTo(Number(event.currentTarget.value))}
                        disabled={!isVideoReady || !videoDuration || Boolean(activeInteractiveQuestion) || Boolean(reviewInteractiveQuestion)}
                        aria-label="Tua video trong phạm vi đã mở khóa"
                        className="h-2 min-w-0 flex-1 cursor-pointer accent-blue-600 disabled:cursor-not-allowed"
                      />
                      <span className="w-11 shrink-0 text-[11px] tabular-nums text-slate-500">
                        {formatVideoTime(videoDuration)}
                      </span>
                      <button
                        type="button"
                        onClick={() => void togglePlayerFullscreen()}
                        aria-label={isPlayerFullscreen ? "Thoát toàn màn hình" : "Xem video toàn màn hình"}
                        title={isPlayerFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-blue-700"
                      >
                        {isPlayerFullscreen
                          ? <Minimize2 className="size-4" />
                          : <Maximize2 className="size-4" />}
                      </button>
                    </div>
                  )}
                  </div>

                  {/* ACTION BAR: ĐÓNG/MỞ TÀI LIỆU & BẬT WORKSPACE CODE */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
                    <button
                      onClick={() => setIsDocsOpen(!isDocsOpen)}
                      className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:text-blue-600 px-4 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      <FileText className="size-4 text-blue-600" />
                      <span>{isDocsOpen ? "Ẩn Tài liệu & Source Code" : "Xem Tài liệu & Source Code đính kèm"}</span>
                      {isDocsOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </button>

                    <button
                      onClick={() => setIsCodeWorkspaceOpen(!isCodeWorkspaceOpen)}
                      className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition cursor-pointer ${
                        isCodeWorkspaceOpen
                          ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-200"
                          : "bg-slate-900 text-white border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      <Code2 className="size-4" />
                      <span>{isCodeWorkspaceOpen ? "Đóng Khung Code" : "Mở Code Sandbox song song"}</span>
                    </button>
                  </div>

                  {/* COLLAPSIBLE ACCORDION: TÀI LIỆU VÀ SOURCE CODE */}
                  {isDocsOpen && (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col gap-4 animate-in fade-in duration-200">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="size-4 text-blue-600" /> Tóm tắt bài học & File đính kèm
                      </h3>

                      <LessonContent content={activeLessonData?.content} />
                      <LessonAttachments attachments={attachments} error={attachmentError} onUploaded={(attachment, openPdf) => void handleUploadedAttachment(attachment, openPdf)} />
                    </div>
                  )}
                  </>
                  ) : isDocumentLesson ? (
                    <section className="flex min-w-0 flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                      <header className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="size-5 text-blue-600" />
                          <h2 className="text-sm font-bold text-slate-900">
                            {activeLessonType === "DOCUMENT_AND_CODING" ? "Tài liệu và thực hành" : activeLessonType === "CODE_PRACTICE" ? "Bài thực hành" : "Tài liệu bài học"}
                          </h2>
                        </div>
                        {activeLessonType === "ARTICLE" && (
                          <button
                            type="button"
                            onClick={() => setIsCodeWorkspaceOpen((open) => !open)}
                            aria-pressed={isCodeWorkspaceOpen}
                            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                          >
                            <Code2 className="size-4" /> {isCodeWorkspaceOpen ? "Đóng Sandbox" : "Mở Code Sandbox"}
                          </button>
                        )}
                      </header>
                      <LessonContent content={activeLessonData?.content} />
                      <LessonAttachments attachments={attachments} error={attachmentError} onUploaded={(attachment, openPdf) => void handleUploadedAttachment(attachment, openPdf)} />
                    </section>
                  ) : (
                    <p className="rounded-xl bg-amber-50 p-5 text-sm text-amber-800">Loại nội dung bài học chưa được hỗ trợ: {activeLessonType}</p>
                  )}
                </div>

                {/* BÊN PHẢI: WORKSPACE CODE SONG SONG (NẾU MỞ) */}
                {shouldShowCodeWorkspace && (
                  <div className="animate-in slide-in-from-right-5 duration-200">
                    <CompactCodePracticeWorkspace key={activeLessonData!.id} />
                  </div>
                )}

              </div>
              )}

              {/* Điều hướng Chuyển bài */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <button
                  disabled={activeLessonIndex <= 0}
                  onClick={() => handleSelectLesson(lessons[activeLessonIndex - 1])}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ArrowLeft className="size-4" /> Bài trước
                </button>

                <button
                  disabled={activeLessonIndex >= lessons.length - 1}
                  onClick={() => handleSelectLesson(lessons[activeLessonIndex + 1])}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40 cursor-pointer"
                >
                  Bài tiếp <ArrowRight className="size-4" />
                </button>
              </div>

              {activeLessonData && (
                <LessonDiscussion lessonId={String(activeLessonData.id)} isLoggedIn={isLoggedIn} authHref={authHref} />
              )}

            </div>
          </div>
        </div>

        {/* Cửa Sổ Chat AI Tutor Nổi */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {aiOpen && (
            <div className="mb-3 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col h-112.5 animate-in fade-in">
              <div className="flex items-center justify-between bg-blue-600 p-3.5 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <Bot className="size-5 text-amber-300" />
                  <span className="text-xs font-bold">AI Tutor - {activeLessonData?.name || "EduFlow"}</span>
                </div>
                <button onClick={() => setAiOpen(false)} className="rounded-lg p-1 hover:bg-blue-700 cursor-pointer">
                  <X className="size-4" />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto text-xs space-y-3 bg-slate-50">
                {aiMessages.length === 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-800">
                      Xin chào! Mình là AI Tutor
                      {activeLessonData?.name ? ` của bài "${activeLessonData.name}"` : ""}. Mình sẽ ưu tiên
                      nội dung bài học đã lưu trong hệ thống. Nếu bài chưa có giáo trình hoặc câu hỏi nằm ngoài
                      nội dung đó, mình sẽ trả lời bằng kiến thức chung và nói rõ với bạn.
                    </div>
                  </div>
                )}
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl p-3 text-xs leading-relaxed ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-800 border border-slate-200"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start" role="status" aria-live="polite">
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
                      <span className="flex gap-1" aria-hidden="true">
                        <span className="size-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-blue-500" />
                      </span>
                      AI Tutor đang suy nghĩ...
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-100 bg-white flex gap-2 shrink-0">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendAiQuestion()}
                  placeholder="Hỏi AI về bài học này..."
                  className="flex-1 h-9 rounded-xl border border-slate-200 px-3 text-xs outline-none bg-slate-50 focus:bg-white"
                />
                <button onClick={handleSendAiQuestion} className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 cursor-pointer">
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => setAiOpen(!aiOpen)}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-xl hover:bg-blue-700 transition cursor-pointer"
          >
            <Bot className="size-5 text-amber-300" />
            <span>{aiOpen ? "Đóng AI Tutor" : "Hỏi AI Tutor"}</span>
          </button>
        </div>

        <LockModal isOpen={lockModalOpen} onClose={() => setLockModalOpen(false)} onRegister={() => {}} />
      <footer className="bg-[#102653] text-blue-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-6 text-blue-200/70">
              A better way to learn, practice, and grow the skills that move your future forward.
            </p>
            <div className="mt-5 flex gap-2">
              <a href="https://twitter.com" aria-label="Twitter" className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                <Globe2 className="size-4" />
              </a>
              <a href="https://facebook.com" aria-label="Facebook" className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                <MessageCircle className="size-4" />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="rounded-lg bg-white/10 p-2 hover:bg-white/20">
                <Users className="size-4" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Platform</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
              <a href="/#courses" className="hover:text-white">Browse courses</a>
              <a href="/courses#filters" className="hover:text-white">Categories</a>
              <a href="/#ai-tutor" className="hover:text-white">AI Tutor</a>
              <a href="/#about" className="hover:text-white">About EduFlow</a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Popular topics</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
              <a href="/courses" className="hover:text-white">Programming</a>
              <a href="/courses" className="hover:text-white">Web Development</a>
              <a href="/courses" className="hover:text-white">Data Science</a>
              <a href="/courses" className="hover:text-white">AI & Machine Learning</a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Support</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
              <a href="mailto:support@eduflow.com" className="hover:text-white">Help center</a>
              <a href="mailto:support@eduflow.com" className="hover:text-white">Contact us</a>
              <a href="/privacy" className="hover:text-white">Privacy policy</a>
              <a href="/terms" className="hover:text-white">Terms of use</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-blue-200/50 lg:px-8">
          © 2026 EduFlow. Learn smarter, grow faster.
        </div>
      </footer>
      </main>
    </div>
  );
}