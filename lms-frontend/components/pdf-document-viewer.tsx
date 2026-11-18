"use client";

import { useEffect, useRef, useState } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import { Download, Loader2 } from "lucide-react";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfDocumentViewer({
  source,
  fileName,
  onRead,
  onDownload,
}: {
  source: string;
  fileName: string;
  onRead: () => void;
  onDownload: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);
  const hasReadRef = useRef(false);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [error, setError] = useState("");

  function checkReadDepth() {
    const container = containerRef.current;
    if (!container || hasReadRef.current) return;
    const depth =
      (container.scrollTop + container.clientHeight) / container.scrollHeight;
    if (depth >= 0.85) {
      hasReadRef.current = true;
      onRead();
    }
  }

  useEffect(() => {
    let cancelled = false;
    const loadingTask = getDocument(source);
    setDocument(null);
    setPageCount(0);
    setError("");
    hasReadRef.current = false;

    loadingTask.promise
      .then((loadedDocument) => {
        if (cancelled) {
          void loadedDocument.destroy();
          return;
        }
        setDocument(loadedDocument);
        setPageCount(loadedDocument.numPages);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể mở tài liệu PDF.",
          );
        }
      });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [source]);

  useEffect(() => {
    if (!document || pageCount === 0) return;
    let cancelled = false;

    const renderPages = async () => {
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const canvas = canvasRefs.current[pageNumber - 1];
        if (!canvas) continue;

        const page = await document.getPage(pageNumber);
        if (cancelled) return;
        const baseViewport = page.getViewport({ scale: 1 });
        const width = Math.max(240, (containerRef.current?.clientWidth ?? 800) - 32);
        const scale = Math.min(width / baseViewport.width, 1.5);
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Không thể tạo vùng hiển thị PDF.");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = `${Math.ceil(viewport.width)}px`;
        canvas.style.height = `${Math.ceil(viewport.height)}px`;
        await page.render({ canvasContext: context, viewport }).promise;
        if (cancelled) return;
      }
      window.requestAnimationFrame(checkReadDepth);
    };

    void renderPages().catch((renderError: unknown) => {
      if (!cancelled) {
        setError(
          renderError instanceof Error
            ? renderError.message
            : "Không thể hiển thị tài liệu PDF.",
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [document, pageCount]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <p className="min-w-0 truncate text-xs font-semibold text-slate-700">
          {fileName}
        </p>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
        >
          <Download className="size-3.5" />
          Tải PDF
        </button>
      </header>

      <div
        ref={containerRef}
        onScroll={checkReadDepth}
        className="max-h-[70vh] overflow-auto bg-slate-200 p-4"
        aria-label={`Trình đọc PDF ${fileName}`}
      >
        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
            {error}
          </p>
        ) : pageCount === 0 ? (
          <p role="status" className="flex items-center justify-center gap-2 py-8 text-xs text-slate-600">
            <Loader2 className="size-4 animate-spin" />
            Đang tải tài liệu PDF...
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: pageCount }, (_, index) => (
              <canvas
                key={index}
                ref={(canvas) => {
                  canvasRefs.current[index] = canvas;
                }}
                aria-label={`Trang ${index + 1}`}
                className="max-w-full bg-white shadow-sm"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
