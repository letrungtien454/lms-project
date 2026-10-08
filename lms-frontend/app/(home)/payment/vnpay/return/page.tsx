"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";

type PaymentStatus = {
  orderId: number;
  courseId: number;
  status: "PENDING" | "PAID" | "FAILED";
};

function VnpayReturnStatus() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const checkPayment = async () => {
      if (!orderId || !/^\d+$/.test(orderId)) {
        setError("Không tìm thấy mã giao dịch hợp lệ.");
        setIsChecking(false);
        return;
      }

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Vui lòng đăng nhập lại để kiểm tra trạng thái thanh toán.");
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      setError("");
      for (let attempt = 0; attempt < 15; attempt += 1) {
        try {
          const response = await fetch(`http://localhost:8080/api/payments/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message || "Không thể kiểm tra giao dịch.");
          if (cancelled) return;

          setPayment(result);
          if (result.status !== "PENDING") {
            setIsChecking(false);
            return;
          }
        } catch (requestError) {
          if (!cancelled) {
            setError(requestError instanceof Error ? requestError.message : "Không thể kết nối máy chủ.");
            setIsChecking(false);
          }
          return;
        }

        if (attempt < 14) await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!cancelled) setIsChecking(false);
    };

    void checkPayment();
    return () => {
      cancelled = true;
    };
  }, [orderId, retry]);

  const isPaid = payment?.status === "PAID";
  const isFailed = payment?.status === "FAILED";
  const isInvalidOrderId = !orderId || !/^\d+$/.test(orderId);
  const hasError = Boolean(error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
        {isChecking ? (
          <Loader2 className="mx-auto size-12 animate-spin text-blue-600" />
        ) : isPaid ? (
          <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        ) : isFailed || (hasError && isInvalidOrderId) ? (
          <XCircle className="mx-auto size-12 text-red-500" />
        ) : (
          <RefreshCw className="mx-auto size-12 text-amber-500" />
        )}

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          {isChecking
            ? "Đang xác nhận thanh toán"
            : isPaid
              ? "Thanh toán thành công"
              : isFailed
                ? "Thanh toán không thành công"
                : hasError && isInvalidOrderId
                  ? "Không thể xác nhận giao dịch"
                : "Đang chờ xác nhận"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {error || (isPaid
            ? "Giao dịch đã được VNPay xác nhận. Bạn có thể bắt đầu học ngay."
            : isFailed
              ? "Giao dịch bị từ chối hoặc đã bị hủy. Bạn có thể quay lại khóa học để thử lại."
              : "VNPay đã chuyển bạn về EduFlow. Hệ thống đang chờ thông báo xác nhận giao dịch an toàn từ VNPay.")}
        </p>

        {payment && (
          <p className="mt-3 text-xs text-slate-400">Mã giao dịch: {payment.orderId}</p>
        )}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {isPaid && payment && (
            <a
              href={`/learning/${payment.courseId}`}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Vào học
            </a>
          )}
          {!isChecking && !isPaid && !isFailed && !isInvalidOrderId && (
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Kiểm tra lại
            </button>
          )}
          <a
            href="/courses"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Danh sách khóa học
          </a>
        </div>
      </section>
    </main>
  );
}

export default function VnpayReturnPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="size-10 animate-spin text-blue-600" /></main>}>
      <VnpayReturnStatus />
    </Suspense>
  );
}
