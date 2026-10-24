"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";

type TeacherRequest = {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote: string | null;
};

type User = { role: "STUDENT" | "TEACHER" | "ADMIN" };

export default function TeacherApplicationPage() {
  const router = useRouter();
  const [request, setRequest] = useState<TeacherRequest | null>(null);
  const [form, setForm] = useState({ bio: "", experience: "", cvUrl: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/auth?returnUrl=%2Fteacher-application");
      return;
    }
    Promise.all([
      apiRequest<User>("/api/users/me"),
      apiRequest<TeacherRequest | undefined>("/api/teacher-requests/me"),
    ])
      .then(([user, application]) => {
        if (user.role === "TEACHER") {
          router.replace("/teacher/dashboard");
          return;
        }
        if (user.role === "ADMIN") {
          router.replace("/admin/dashboard");
          return;
        }
        setRequest(application ?? null);
      })
      .catch((cause: unknown) => {
        if (cause instanceof ApiError && cause.status === 401) {
          clearAuthSession();
          router.replace("/auth?returnUrl=%2Fteacher-application");
          return;
        }
        setError(cause instanceof Error ? cause.message : "Không tải được thông tin đăng ký.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const result = await apiRequest<TeacherRequest>("/api/teacher-requests", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setRequest(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không gửi được yêu cầu.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <main className="p-8 text-center">Đang tải...</main>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-800">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <a className="text-sm font-semibold text-blue-700" href="/dashboard">← Quay lại Dashboard</a>
        <h1 className="mt-5 text-2xl font-bold text-[#17305f]">Đăng ký làm giảng viên</h1>
        <p className="mt-2 text-sm text-slate-600">Gửi thông tin kinh nghiệm để quản trị viên xét duyệt quyền giảng viên.</p>
        {request?.status === "PENDING" ? (
          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Yêu cầu của bạn đang chờ xét duyệt.</div>
        ) : request?.status === "APPROVED" ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">Yêu cầu đã được duyệt. <a className="font-semibold underline" href="/teacher/dashboard">Mở trang giảng viên</a></div>
        ) : (
          <>
            {request?.status === "REJECTED" && (
              <div className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-900">
                Yêu cầu trước đã bị từ chối.{request.adminNote ? ` Ghi chú: ${request.adminNote}` : ""} Bạn có thể gửi lại.
              </div>
            )}
            <form className="mt-6 space-y-4" onSubmit={submit}>
              <label className="block text-sm font-medium">Giới thiệu bản thân
                <textarea required maxLength={5000} className="mt-1 min-h-28 w-full rounded-lg border p-3" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
              </label>
              <label className="block text-sm font-medium">Kinh nghiệm giảng dạy
                <textarea required maxLength={5000} className="mt-1 min-h-28 w-full rounded-lg border p-3" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} />
              </label>
              <label className="block text-sm font-medium">Liên kết CV/chứng chỉ (nếu có)
                <input type="url" maxLength={2000} className="mt-1 w-full rounded-lg border p-3" value={form.cvUrl} onChange={(event) => setForm({ ...form, cvUrl: event.target.value })} />
              </label>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button disabled={submitting} className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-60">
                {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
