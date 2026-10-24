"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type Review = { id: number; studentName: string; courseTitle: string; rating: number | null; comment: string | null; createdAt: string };

export default function TeacherReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reply, setReply] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  async function load() {
    try { setReviews(await apiRequest<Review[]>("/api/teacher/reviews")); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Không tải được đánh giá."); }
  }
  useEffect(() => { void load(); }, []);

  async function sendReply(event: FormEvent<HTMLFormElement>, reviewId: number) {
    event.preventDefault();
    try {
      await apiRequest(`/api/reviews/${reviewId}/replies`, { method: "POST", body: JSON.stringify({ comment: reply[reviewId] }) });
      setReply({ ...reply, [reviewId]: "" });
      setNotice("Đã gửi phản hồi.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không gửi được phản hồi."); }
  }

  return <main className="min-h-screen bg-[#f6f9fd] p-4 text-slate-800 sm:p-8"><div className="mx-auto max-w-5xl">
    <p className="text-sm text-slate-500">Giảng viên / Đánh giá</p><h1 className="mt-1 text-2xl font-bold text-[#17305f]">Đánh giá khóa học</h1>
    {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}{notice && <p role="status" className="mt-3 text-sm text-emerald-700">{notice}</p>}
    <section className="mt-6 space-y-4">{reviews.map((review) => <article key={review.id} className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap justify-between gap-2"><div><h2 className="font-semibold">{review.studentName}</h2><p className="mt-1 text-xs text-slate-500">{review.courseTitle} · {new Date(review.createdAt).toLocaleDateString("vi-VN")}</p></div><span className="text-amber-600">★ {review.rating ?? "—"}/5</span></div>
      <p className="mt-4 whitespace-pre-wrap text-sm">{review.comment || "Không có nội dung."}</p>
      <form onSubmit={(event) => void sendReply(event, review.id)} className="mt-4 flex flex-col gap-2 sm:flex-row"><input required maxLength={5000} placeholder="Viết phản hồi..." value={reply[review.id] ?? ""} onChange={(event) => setReply({ ...reply, [review.id]: event.target.value })} className="flex-1 rounded-lg border px-3 py-2 text-sm" /><button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">Trả lời</button></form>
    </article>)}{reviews.length === 0 && <p className="rounded-2xl border bg-white p-8 text-center text-slate-500">Chưa có đánh giá.</p>}</section>
  </div></main>;
}
