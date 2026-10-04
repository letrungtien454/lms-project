"use client";

import { useState } from "react";
import { Play, RotateCcw } from "lucide-react";

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

export default function CodePracticeWorkspace() {
  const [environment, setEnvironment] = useState<Environment>("web");
  const [activeWebFile, setActiveWebFile] = useState<WebFile>("html");
  const [code, setCode] = useState<Record<string, string>>({ ...templates.web });
  const [previewCode, setPreviewCode] = useState("");
  const [terminal, setTerminal] = useState<{ text: string; isError: boolean } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

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
      setPreviewCode(`<!doctype html><html><head><meta charset="utf-8"><style>${code.css ?? templates.web.css}</style></head><body>${code.html ?? templates.web.html}<script>${(code.javascript ?? templates.web.javascript).replace(/<\/script/gi, "<\\/script")}</script></body></html>`);
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
      const failed = result.status?.id !== 3 || Boolean(result.compile_output || result.stderr);
      setTerminal({
        text: output || (failed
          ? `Code chạy thất bại${result.status?.description ? ` (${result.status.description})` : ""}.`
          : "Chương trình chạy thành công (không có output)."),
        isError: failed,
      });
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
    <section className="flex min-h-[520px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-2xl">
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

      <div className="min-h-[260px] flex-1 p-3">
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
          className="h-[260px] w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs leading-6 text-slate-100 outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="min-h-[190px] border-t border-slate-800 bg-black p-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {environment === "web" ? "Web Preview" : `Console · ${runtimeConfig[environment].version}`} <span className="ml-2 font-normal normal-case">Ctrl + Enter để chạy</span>
        </div>
        {environment === "web" ? (
          previewCode ? (
            <iframe
              title="Xem trước mã Web"
              sandbox="allow-scripts allow-forms allow-modals"
              srcDoc={previewCode}
              className="h-[170px] w-full rounded-lg bg-white"
            />
          ) : (
            <div className="flex h-[170px] items-center justify-center rounded-lg border border-dashed border-slate-800 text-xs text-slate-500">
              Nhấn “Chạy Code” để xem giao diện Web
            </div>
          )
        ) : (
          <pre aria-live="polite" className={`h-[170px] overflow-auto whitespace-pre-wrap rounded-lg bg-[#080b10] p-3 font-mono text-xs leading-5 ${terminal?.isError ? "text-red-400" : "text-emerald-300"}`}>
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
