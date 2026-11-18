"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CheckCircle2, Play, RotateCcw } from "lucide-react";

type Environment = "web" | "java" | "python" | "cpp" | "csharp";
type WebFile = "html" | "css" | "javascript";

const templates: Record<Environment, Record<string, string>> = {
  web: {
    html: '<h1>Chào mừng đến với EduFlow</h1>\n<p>Chỉnh sửa HTML, CSS hoặc JavaScript để xem kết quả.</p>\n<button id="hello">Bấm thử</button>',
    css: "body { font-family: sans-serif; padding: 24px; color: #17305f; }\nh1 { color: #2563eb; }\nbutton { padding: 8px 12px; }",
    javascript: "document.querySelector('#hello').addEventListener('click', () => {\n  alert('Xin chào từ JavaScript!');\n});",
  },
  java: {
    "Main.java": 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello EduFlow!");\n    }\n}',
  },
  python: { "main.py": 'print("Hello EduFlow!")' },
  cpp: {
    "main.cpp": '#include <iostream>\n\nint main() {\n    std::cout << "Hello EduFlow!" << std::endl;\n    return 0;\n}',
  },
  csharp: {
    "Program.cs": 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello EduFlow!");\n    }\n}',
  },
};

const environments: { id: Environment; label: string }[] = [
  { id: "web", label: "Web (HTML/CSS/JS)" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
];

const webFiles: { id: WebFile; name: string }[] = [
  { id: "html", name: "index.html" },
  { id: "css", name: "style.css" },
  { id: "javascript", name: "script.js" },
];

const runtimeConfig: Record<Exclude<Environment, "web">, { languageId: number; version: string; file: string }> = {
  java: { languageId: 91, version: "JDK 17.0.6", file: "Main.java" },
  python: { languageId: 100, version: "Python 3.12.5", file: "main.py" },
  cpp: { languageId: 105, version: "GCC 14.1.0", file: "main.cpp" },
  csharp: { languageId: 51, version: "Mono 6.6.0.161", file: "Program.cs" },
};

type Judge0Response = {
  status?: { id?: number; description?: string };
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
};

export default function CodePracticeWorkspace({
  onRunSuccess,
}: {
  onRunSuccess?: () => void;
}) {
  const [environment, setEnvironment] = useState<Environment>("web");
  const [activeWebFile, setActiveWebFile] = useState<WebFile>("html");
  const [code, setCode] = useState<Record<string, string>>({ ...templates.web });
  const [previewCode, setPreviewCode] = useState("");
  const [terminal, setTerminal] = useState<{ text: string; isError: boolean } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [previewRunId, setPreviewRunId] = useState(0);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  const previewRunIdRef = useRef(0);
  const onRunSuccessRef = useRef(onRunSuccess);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  onRunSuccessRef.current = onRunSuccess;

  useEffect(() => {
    const handlePreviewResult = (event: MessageEvent) => {
      if (
        event.source !== previewFrameRef.current?.contentWindow ||
        typeof event.data !== "object" ||
        event.data === null ||
        event.data.type !== "eduflow-preview-result" ||
        event.data.runId !== previewRunIdRef.current
      ) {
        return;
      }

      const succeeded = event.data.success === true;
      const message =
        typeof event.data.message === "string"
          ? event.data.message
          : succeeded
            ? "Chương trình Web chạy thành công."
            : "Chương trình Web gặp lỗi khi chạy.";
      setTerminal({ text: message, isError: !succeeded });
      if (succeeded) reportSuccessfulRun();
    };

    window.addEventListener("message", handlePreviewResult);
    return () => window.removeEventListener("message", handlePreviewResult);
  }, []);

  useEffect(
    () => () => {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    },
    [],
  );

  const reportSuccessfulRun = () => {
    if (!onRunSuccessRef.current) return;
    onRunSuccessRef.current();
    setIsCelebrating(true);
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    celebrationTimerRef.current = setTimeout(() => {
      setIsCelebrating(false);
      celebrationTimerRef.current = null;
    }, 1800);
  };

  const createWebPreview = (runId: number) => {
    const script = (code.javascript ?? templates.web.javascript).replace(
      /<\/script/gi,
      "<\\/script",
    );
    return `<!doctype html><html><head><meta charset="utf-8"><style>${code.css ?? templates.web.css}</style></head><body>${code.html ?? templates.web.html}<script>(function(){var failed=false;function report(success,message){parent.postMessage({type:"eduflow-preview-result",runId:${runId},success:success,message:message},"*")}addEventListener("error",function(event){failed=true;report(false,event.message||"Lỗi JavaScript khi chạy.")});addEventListener("unhandledrejection",function(event){failed=true;report(false,String(event.reason||"Lỗi JavaScript khi chạy."))});try{(new Function(${JSON.stringify(script)}))()}catch(error){failed=true;report(false,error instanceof Error?error.message:"Lỗi JavaScript khi chạy.")}document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){if(!failed)report(true,"Chương trình Web chạy thành công.")},0)})})()</script></body></html>`;
  };

  const activeFile = environment === "web"
    ? webFiles.find((file) => file.id === activeWebFile)!
    : { id: runtimeConfig[environment].file, name: runtimeConfig[environment].file };
  const activeCode = code[activeFile.id] ?? templates[environment][activeFile.id] ?? "";

  const switchEnvironment = (next: Environment) => {
    setEnvironment(next);
    setTerminal(null);
    setCode((current) => {
      const nextCode = { ...current };
      for (const [fileName, template] of Object.entries(templates[next])) {
        if (!(fileName in nextCode)) nextCode[fileName] = template;
      }
      return nextCode;
    });
  };

  const resetCode = () => {
    setCode((current) => ({ ...current, ...templates[environment] }));
    setTerminal(null);
    if (environment === "web") setPreviewCode("");
  };

  const runCode = async () => {
    if (isRunning) return;
    if (environment === "web") {
      const runId = previewRunIdRef.current + 1;
      previewRunIdRef.current = runId;
      setPreviewRunId(runId);
      setTerminal({ text: "Đang chạy chương trình Web...", isError: false });
      setPreviewCode(createWebPreview(runId));
      return;
    }

    const runtime = runtimeConfig[environment];
    setIsRunning(true);
    setTerminal(null);
    try {
      const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          source_code: activeCode,
          language_id: runtime.languageId,
          stdin: "",
          cpu_time_limit: 5,
          wall_time_limit: 8,
        }),
      });
      const result = await response.json() as Judge0Response;
      if (!response.ok) throw new Error(result.message || `Dịch vụ chạy code trả về lỗi HTTP ${response.status}.`);

      const output = [result.stdout, result.compile_output, result.stderr, result.message]
        .filter((part): part is string => Boolean(part?.trim()))
        .join("\n")
        .trim();
      const failed = result.status?.id !== 3;
      setTerminal({
        text: output || (failed
          ? `Code chạy thất bại${result.status?.description ? ` (${result.status.description})` : ""}.`
          : "Chương trình chạy thành công (không có output)."),
        isError: failed,
      });
      if (!failed) reportSuccessfulRun();
    } catch (error) {
      const message = error instanceof DOMException && error.name === "TimeoutError"
        ? "Đã dừng yêu cầu vì quá thời gian 8 giây."
        : error instanceof Error ? error.message : "Không thể kết nối dịch vụ chạy code.";
      setTerminal({ text: message, isError: true });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section className="relative flex min-h-130 min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
      {isCelebrating && (
        <div
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
          role="status"
          aria-live="polite"
        >
          <div className="absolute left-1/2 top-1/3 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
            <CheckCircle2 className="size-5" />
            Chạy thành công!
          </div>
          {Array.from({ length: 28 }, (_, index) => {
            const style = {
              "--confetti-x": `${((index * 47) % 320) - 160}px`,
              "--confetti-y": `${90 + ((index * 29) % 190)}px`,
              "--confetti-rotation": `${index * 97}deg`,
              left: `${8 + ((index * 37) % 84)}%`,
              backgroundColor: [
                "#34d399",
                "#fbbf24",
                "#60a5fa",
                "#f472b6",
                "#a78bfa",
              ][index % 5],
              animationDelay: `${(index % 7) * 35}ms`,
            } as CSSProperties;
            return (
              <span
                key={index}
                className="code-confetti absolute top-1/4 size-2 rounded-sm"
                style={style}
              />
            );
          })}
        </div>
      )}
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900 p-3">
        <label className="sr-only" htmlFor="code-environment">Môi trường lập trình</label>
        <select
          id="code-environment"
          value={environment}
          onChange={(event) => switchEnvironment(event.target.value as Environment)}
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
        >
          {environments.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <button type="button" onClick={resetCode} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold hover:bg-slate-800">
          <RotateCcw className="size-3.5" /> Reset
        </button>
        <button
          type="button"
          onClick={() => void runCode()}
          disabled={isRunning}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold hover:bg-emerald-500 disabled:opacity-60"
        >
          <Play className="size-3.5" /> {isRunning ? "Đang chạy..." : "Chạy Code"}
        </button>
      </header>
      {onRunSuccess && (
        <p className="border-b border-emerald-900/60 bg-emerald-950/40 px-3 py-2 text-[10px] text-emerald-200">
          Chạy chương trình không lỗi sẽ tự động đánh dấu bài học hoàn thành.
        </p>
      )}

      {environment === "web" && (
        <nav className="flex border-b border-slate-800 bg-slate-900/60" aria-label="Tệp Web cố định">
          {webFiles.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => setActiveWebFile(file.id)}
              className={`px-3 py-2 text-xs font-mono ${activeWebFile === file.id ? "border-b-2 border-blue-500 text-blue-300" : "text-slate-400 hover:text-white"}`}
            >
              {file.name}
            </button>
          ))}
        </nav>
      )}

      <div className="min-h-65 flex-1 p-3">
        <textarea
          aria-label={`Soạn thảo ${activeFile.name}`}
          spellCheck={false}
          value={activeCode}
          onChange={(event) => setCode((current) => ({ ...current, [activeFile.id]: event.target.value }))}
          onKeyDown={(event) => {
            if (event.ctrlKey && event.key === "Enter") {
              event.preventDefault();
              void runCode();
            }
          }}
          className="h-65 w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs leading-6 text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="min-h-47.5 border-t border-slate-800 bg-black p-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {environment === "web" ? "Web Preview" : `Console · ${runtimeConfig[environment].version}`} <span className="ml-2 font-normal normal-case">Ctrl + Enter để chạy</span>
        </div>
        {environment === "web" ? (
          previewCode ? (
            <iframe
              key={previewRunId}
              ref={previewFrameRef}
              title="Xem trước mã Web"
              sandbox="allow-scripts allow-forms allow-modals"
              srcDoc={previewCode}
              className="h-42.5 w-full rounded-lg bg-white"
            />
          ) : (
            <div className="flex h-42.5 items-center justify-center rounded-lg border border-dashed border-slate-800 text-xs text-slate-500">
              Nhấn “Chạy Code” để xem giao diện Web
            </div>
          )
        ) : (
          <pre aria-live="polite" className={`h-42.5 overflow-auto whitespace-pre-wrap rounded-lg bg-[#080b10] p-3 font-mono text-xs leading-5 ${terminal?.isError ? "text-red-400" : "text-emerald-300"}`}>
            {isRunning ? "Đang biên dịch và chạy..." : terminal?.text ?? "Output sẽ hiển thị tại đây."}
          </pre>
        )}
      </div>
      {environment !== "web" && (
        <p className="border-t border-slate-800 px-3 py-2 text-[10px] text-slate-500">
          Mã nguồn được gửi tới Judge0 CE để thực thi. Mỗi lần chạy giới hạn tối đa 8 giây.
        </p>
      )}
    </section>
  );
}
