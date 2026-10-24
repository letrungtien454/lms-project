"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Search,
  Filter,
  ShieldAlert,
  Info,
  AlertTriangle,
  UserCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  RefreshCw,
} from "lucide-react";

type LogEntry = {
  id: number;
  actorName: string;
  actorRole: "ADMIN" | "TEACHER" | "STUDENT" | "SYSTEM";
  action: string;
  target: string;
  ipAddress: string;
  level: "INFO" | "WARNING" | "ERROR";
  createdAt: string;
};

export default function AdminLogsPage() {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Dữ liệu mẫu chuẩn hóa để hiển thị giao diện Nhật ký thực tế
  const [logs] = useState<LogEntry[]>([
    {
      id: 1,
      actorName: "Nguyễn Văn Nam",
      actorRole: "ADMIN",
      action: "Khóa tài khoản người dùng",
      target: "User #102 (tran.a@example.com)",
      ipAddress: "113.161.42.12",
      level: "WARNING",
      createdAt: "2026-10-24T18:30:00Z",
    },
    {
      id: 2,
      actorName: "Phạm Quốc Bảo",
      actorRole: "TEACHER",
      action: "Tạo khóa học mới",
      target: "Khóa học: React & Next.js Pro",
      ipAddress: "14.232.110.85",
      level: "INFO",
      createdAt: "2026-10-24T16:15:00Z",
    },
    {
      id: 3,
      actorName: "Hệ thống AI",
      actorRole: "SYSTEM",
      action: "Tạo vector nhúng khóa học",
      target: "CourseDocumentVector #88",
      ipAddress: "127.0.0.1",
      level: "INFO",
      createdAt: "2026-10-24T14:00:00Z",
    },
    {
      id: 4,
      actorName: "Trần Thị Bình",
      actorRole: "ADMIN",
      action: "Xóa đánh giá vi phạm",
      target: "Review #45 (Học viên chửi thề)",
      ipAddress: "113.161.42.12",
      level: "ERROR",
      createdAt: "2026-10-24T11:20:00Z",
    },
    {
      id: 5,
      actorName: "Lê Văn Đạt",
      actorRole: "TEACHER",
      action: "Cập nhật bài học",
      target: "Lesson #301 - Rest API với Spring Boot",
      ipAddress: "27.72.95.14",
      level: "INFO",
      createdAt: "2026-10-23T20:10:00Z",
    },
  ]);

  // Logic lọc và tìm kiếm Nhật ký
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesQuery =
        log.actorName.toLowerCase().includes(query.toLowerCase()) ||
        log.action.toLowerCase().includes(query.toLowerCase()) ||
        log.target.toLowerCase().includes(query.toLowerCase());

      const matchesLevel =
        levelFilter === "ALL" || log.level === levelFilter;

      return matchesQuery && matchesLevel;
    });
  }, [logs, query, levelFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* --- 1. HEADER CHÍNH --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
              Nhật ký hệ thống
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Theo dõi lịch sử hoạt động, tác vụ quản trị và nhật ký truy cập trên EduFlow.
            </p>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="size-3.5" /> Làm mới
          </button>
        </div>

        {/* --- 2. THẺ THỐNG KÊ LOGS --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Tổng ghi nhận</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">{logs.length} sự kiện</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shrink-0">
              <AlertTriangle className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Cảnh báo (Warning)</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">
                {logs.filter((l) => l.level === "WARNING").length}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shrink-0">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Thao tác nhạy cảm (Error)</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">
                {logs.filter((l) => l.level === "ERROR").length}
              </h3>
            </div>
          </div>
        </div>

        {/* --- 3. BẢNG DANH SÁCH NHẬT KÝ --- */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-4">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tìm theo người thực hiện, hành động..."
                className="w-full rounded-2xl border border-slate-200/80 bg-white pl-10 pr-4 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500"
              />
            </div>

            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-blue-500"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="INFO">Thông tin (Info)</option>
              <option value="WARNING">Cảnh báo (Warning)</option>
              <option value="ERROR">Mức độ cao (Error)</option>
            </select>
          </div>

          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full min-w-[800px] text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3 w-12 text-center">#</th>
                  <th className="pb-3 pl-2">Thực hiện bởi</th>
                  <th className="pb-3">Hành động</th>
                  <th className="pb-3">Đối tượng tác động</th>
                  <th className="pb-3">Địa chỉ IP</th>
                  <th className="pb-3">Mức độ</th>
                  <th className="pb-3 text-right pr-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                      Không tìm thấy nhật ký phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, index) => {
                    const stt = (currentPage - 1) * pageSize + index + 1;

                    return (
                      <tr key={log.id} className="group hover:bg-slate-50/60 transition">
                        <td className="py-3.5 pl-3 text-center font-bold text-slate-400">
                          {stt}
                        </td>

                        <td className="py-3.5 pl-2 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-600">
                              {log.actorName.charAt(0)}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800">{log.actorName}</p>
                              <span className="text-[9px] text-slate-400 font-semibold">{log.actorRole}</span>
                            </div>
                          </div>
                        </td>

                        <td className="text-slate-700 font-semibold">
                          {log.action}
                        </td>

                        <td className="text-slate-500 font-medium">
                          {log.target}
                        </td>

                        <td className="text-slate-400 font-mono text-[11px]">
                          {log.ipAddress}
                        </td>

                        <td>
                          {log.level === "INFO" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                              <Info className="size-3" /> Info
                            </span>
                          )}
                          {log.level === "WARNING" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
                              <AlertTriangle className="size-3" /> Warning
                            </span>
                          )}
                          {log.level === "ERROR" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-600">
                              <ShieldAlert className="size-3" /> Error
                            </span>
                          )}
                        </td>

                        <td className="text-right pr-3 text-slate-400 font-medium">
                          {new Date(log.createdAt).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold text-slate-400">
              Hiển thị {paginatedLogs.length} trên tổng số {filteredLogs.length} nhật ký
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>

              <span className="text-xs font-bold text-slate-600 px-2">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}