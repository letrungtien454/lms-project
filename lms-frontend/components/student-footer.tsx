"use client";

import { GraduationCap } from "lucide-react";

// Icon chuẩn X (Twitter mới)
function XIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Icon chuẩn Facebook
function FacebookIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// Icon chuẩn LinkedIn
function LinkedInIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export function StudentFooter({
  variant = "courses",
}: {
  variant?: "courses" | "learning";
}) {
  const learning = variant === "learning";

  return (
    <footer
      className={`${learning ? "" : "mt-16 "}bg-[#102653] text-blue-100`}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <a
            href="/dashboard"
            className="flex items-center gap-2.5"
            aria-label="EduFlow trang chủ"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-950/30">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              EduFlow
            </span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-6 text-blue-200/70">
            {learning
              ? "Cách tốt hơn để học tập, thực hành và phát triển các kỹ năng giúp bạn tiến xa hơn trong tương lai."
              : "Giải pháp học lập trình và phát triển kỹ năng công nghệ hiệu quả."}
          </p>
          
          {/* Cụm Icon Mạng xã hội đã cập nhật Icon chuẩn */}
          <div className="mt-5 flex gap-2">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="rounded-lg bg-white/10 p-2.5 transition-colors hover:bg-white/20 hover:text-white"
            >
              <XIcon className="size-4" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="rounded-lg bg-white/10 p-2.5 transition-colors hover:bg-white/20 hover:text-white"
            >
              <FacebookIcon className="size-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-lg bg-white/10 p-2.5 transition-colors hover:bg-white/20 hover:text-white"
            >
              <LinkedInIcon className="size-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Nền tảng</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
            <a href="/courses" className="hover:text-white">
              {learning ? "Tìm kiếm khóa học" : "Duyệt khóa học"}
            </a>
            <a href="/courses#filters" className="hover:text-white">
              Danh mục
            </a>
            <a
              href={learning ? "/dashboard#ai-tutor" : "#"}
              className="hover:text-white"
            >
              {learning ? "Gia sư AI" : "Trợ lý AI"}
            </a>
            {learning && (
              <a href="/dashboard#about" className="hover:text-white">
                Giới thiệu EduFlow
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">
            {learning ? "Các chủ đề phổ biến" : "Chủ đề hot"}
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
            <a href="/courses" className="hover:text-white">
              {learning ? "Lập trình" : "Lập trình Web"}
            </a>
            <a href="/courses" className="hover:text-white">
              Phát triển web
            </a>
            <a href="/courses" className="hover:text-white">
              Khoa học dữ liệu
            </a>
            {learning && (
              <a href="/courses" className="hover:text-white">
                Trí tuệ nhân tạo &amp; Học máy
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white">Hỗ trợ</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-blue-200/70">
            <a
              href="mailto:support@eduflow.com"
              className="hover:text-white"
            >
              {learning ? "Trung tâm trợ giúp" : "Trung tâm hỗ trợ"}
            </a>
            {learning && (
              <a
                href="mailto:support@eduflow.com"
                className="hover:text-white"
              >
                Liên hệ với chúng tôi
              </a>
            )}
            <a href="/privacy" className="hover:text-white">
              Chính sách bảo mật
            </a>
            <a href="/terms" className="hover:text-white">
              Điều khoản sử dụng
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-blue-200/50 lg:px-8">
        © 2026 EduFlow.{" "}
        {learning
          ? "Học thông minh hơn, phát triển nhanh hơn."
          : "Learn smarter, grow faster."}
      </div>
    </footer>
  );
}