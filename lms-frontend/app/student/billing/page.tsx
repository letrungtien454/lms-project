"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ShoppingCart,
  Wallet,
} from "lucide-react";

// Import 3 Component dùng chung
import { StudentHeader } from "@/components/student-header";
import { StudentSidebar } from "@/components/student-sidebar";
import { useStudentSidebarState } from "@/components/student-sidebar-state";
import { StudentFooter } from "@/components/student-footer";
import {
  type CatalogCourse,
  formatStudentDate,
  STUDENT_API_URL,
  studentApi,
  type StudentPayment,
  type StudentUser,
} from "@/lib/student-api";

export default function BillingHistoryPage() {
  const router = useRouter();
  const { collapsed, setCollapsed } = useStudentSidebarState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [dbCourses, setDbCourses] = useState<CatalogCourse[]>([]);
  const [transactions, setTransactions] = useState<StudentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Phân trang & Tìm kiếm
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Kiểm tra auth
  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      setIsLoggedIn(true);
      fetch(`${STUDENT_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Không thể tải hồ sơ học viên (HTTP ${res.status}).`);
          return res.json();
        })
        .then((data) => {
          if (data) setUser(data);
        })
        .catch((error: unknown) => {
          setLoadError(error instanceof Error ? error.message : "Không thể tải hồ sơ học viên.");
        });
    }
  }, []);

  // Lấy danh sách khóa học hệ thống
  useEffect(() => {
    fetch(`${STUDENT_API_URL}/api/courses`)
      .then((res) => {
        if (!res.ok) throw new Error(`Không thể tải danh sách khóa học (HTTP ${res.status}).`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setDbCourses(data);
      })
      .catch((error: unknown) => {
        setLoadError(error instanceof Error ? error.message : "Không thể tải danh sách khóa học.");
      });
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace(`/auth?returnUrl=${encodeURIComponent("/student/billing")}`);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoggedIn(true);
    studentApi<StudentPayment[]>("/api/students/me/payments")
      .then((data) => {
        if (!cancelled) setTransactions(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Không thể tải lịch sử thanh toán.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    setUser(null);
    router.push("/auth");
  };

  // Tính toán số liệu tổng quan
  const stats = useMemo(() => {
    const paidTransactions = transactions.filter((item) => item.status === "PAID");
    const totalAmount = paidTransactions.reduce((acc, item) => acc + item.amount, 0);
    const methods = paidTransactions.reduce<Record<string, number>>((counts, item) => {
      counts[item.method] = (counts[item.method] ?? 0) + 1;
      return counts;
    }, {});
    const primaryMethod = Object.entries(methods).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    return {
      totalAmount,
      totalCount: paidTransactions.length,
      primaryMethod,
    };
  }, [transactions]);

  const filteredTransactions = transactions;

  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const visibleTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f8fbff] text-slate-900">
      {/* 1. HEADER DÙNG CHUNG */}
      <StudentHeader
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isLoggedIn={isLoggedIn}
        user={user}
        courses={dbCourses}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* 2. SIDEBAR DÙNG CHUNG */}
        {isLoggedIn && (
          <StudentSidebar
            collapsed={collapsed}
            activeTab="Lịch sử thanh toán"
          />
        )}

        {/* 3. MAIN CONTENT VÀ FOOTER TRONG CÙNG KHUNG CHO CO GIÃN CHUẨN */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isLoggedIn ? (collapsed ? "md:ml-19" : "md:ml-64") : "ml-0"
          }`}
        >
          <div className="mx-auto max-w-7xl p-5 lg:p-8 space-y-6">
            {/* TIÊU ĐỀ TRANG */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
                Lịch sử thanh toán
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Xem lại các giao dịch và hóa đơn của bạn
              </p>
            </div>

            {/* 3 THẺ THỐNG KÊ TỔNG QUAN */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Thẻ 1: Tổng chi tiêu */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Wallet className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Tổng chi tiêu</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-800">
                    {new Intl.NumberFormat("vi-VN").format(stats.totalAmount)}đ
                  </p>
                </div>
              </div>

              {/* Thẻ 2: Giao dịch */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                  <ShoppingCart className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Giao dịch</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-800">
                    {stats.totalCount} lần
                  </p>
                </div>
              </div>

              {/* Thẻ 3: Phương thức ưa thích */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <CreditCard className="size-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Phương thức</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-800">
                    {stats.primaryMethod}
                  </p>
                </div>
              </div>
            </div>

            {/* BẢNG DỮ LIỆU GIAO DỊCH */}
            {loadError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {loadError}
              </p>
            )}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  {/* Header Bảng */}
                  <thead className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-bold">
                    <tr>
                      <th className="px-6 py-4">Mã giao dịch</th>
                      <th className="px-6 py-4">Khóa học</th>
                      <th className="px-6 py-4">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                          Số tiền <span>v</span>
                        </div>
                      </th>
                      <th className="px-6 py-4">Phương thức</th>
                      <th className="px-6 py-4">
                        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                          Thời gian <span>v</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center">Trạng thái</th>
                    </tr>
                  </thead>

                  {/* Body Bảng */}
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          Đang tải giao dịch...
                        </td>
                      </tr>
                    ) : filteredTransactions.length > 0 ? (
                      visibleTransactions.map((item) => (
                        <tr
                          key={item.orderId}
                          className="transition hover:bg-blue-50/40"
                        >
                          {/* Mã giao dịch */}
                          <td className="px-6 py-4 font-bold text-blue-600">
                            {item.transactionCode}
                          </td>

                          {/* Tên khóa học */}
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {item.courseTitle}
                          </td>

                          {/* Số tiền */}
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {new Intl.NumberFormat("vi-VN").format(item.amount)}đ
                          </td>

                          {/* Phương thức */}
                          <td className="px-6 py-4 text-slate-600 font-semibold">
                            {item.method}
                          </td>

                          {/* Thời gian */}
                          <td className="px-6 py-4 text-slate-500">
                            {formatStudentDate(item.paidAt ?? item.createdAt)}
                          </td>

                          {/* Trạng thái */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold border ${
                              item.status === "PAID"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : item.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : "bg-rose-50 text-rose-600 border-rose-100"
                            }`}>
                              • {item.status === "PAID" ? "Thành công" : item.status === "PENDING" ? "Đang xử lý" : "Thất bại"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-slate-400 font-semibold"
                        >
                          Chưa có giao dịch thanh toán nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* BỘ PHÂN TRANG (PAGINATION) */}
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <span className="text-xs text-slate-500">{filteredTransactions.length} giao dịch</span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="px-2 text-xs font-semibold text-slate-600">{currentPage} / {pageCount}</span>
                  <button
                    disabled={currentPage >= pageCount}
                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                    className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. FOOTER DÙNG CHUNG (CO GIÃN CHUẨN) */}
          <StudentFooter variant="learning" />
        </main>
      </div>
    </div>
  );
}