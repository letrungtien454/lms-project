"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  MessageSquare,
  MessageCircle,
  Search,
  Trash2,
  Loader2,
  Clock,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type Review = {
  id: number;
  studentName: string;
  courseTitle: string;
  courseId?: number;
  rating: number | null;
  comment: string | null;
  createdAt: string;
};

type Comment = {
  id: number;
  userName: string;
  lessonId: number;
  lessonTitle: string;
  courseTitle?: string;
  content: string;
  createdAt: string;
};

function getVietnameseInitial(fullName: string): string {
  if (!fullName || !fullName.trim()) return "U";
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[parts.length - 1];
  return firstName.charAt(0).toUpperCase();
}

export default function AdminModerationPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<"REVIEWS" | "COMMENTS">("REVIEWS");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  async function load() {
    setLoading(true);
    try {
      const [reviewData, commentData] = await Promise.all([
        apiRequest<Review[]>("/api/admin/moderation/reviews"),
        apiRequest<Comment[]>("/api/admin/moderation/lesson-comments"),
      ]);
      setReviews(reviewData || []);
      setComments(commentData || []);
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Không tải được nội dung kiểm duyệt."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(path: string, id: number, label: string) {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${label} này không?`)) return;
    setDeletingId(id);
    setError("");
    try {
      await apiRequest(`/api/admin/${path}/${id}`, { method: "DELETE" });
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : `Không xóa được ${label}.`
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Lọc danh sách Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch =
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.comment && r.comment.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRating =
        ratingFilter === "ALL" ||
        (r.rating !== null && String(r.rating) === ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchQuery, ratingFilter]);

  // Lọc danh sách Comments
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      return (
        c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [comments, searchQuery]);

  // Pagination Logic
  const activeList = activeTab === "REVIEWS" ? filteredReviews : filteredComments;
  const totalPages = Math.max(1, Math.ceil(activeList.length / pageSize));
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedComments = filteredComments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="min-h-screen bg-[#f4f7fc] p-4 font-sans text-slate-800 sm:p-6 lg:p-8 antialiased">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* --- 1. HEADER CHÍNH --- */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17305f]">
              Đánh giá & Bình luận
            </h1>
            <p className="mt-1 text-xs font-medium text-slate-400">
              Kiểm duyệt và loại bỏ các nội dung vi phạm tiêu chuẩn cộng đồng trên EduFlow.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {error}
          </p>
        )}

        {/* --- 2. THẺ THỐNG KÊ --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shrink-0">
              <Star className="size-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Đánh giá khóa học</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">
                {reviews.length} <span className="text-xs font-normal text-slate-400">lượt</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-slate-100">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shrink-0">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Bình luận bài học</p>
              <h3 className="text-xl font-extrabold text-[#17305f] mt-0.5">
                {comments.length} <span className="text-xs font-normal text-slate-400">bình luận</span>
              </h3>
            </div>
          </div>
        </div>

        {/* --- 3. BẢNG NỘI DUNG & TABS --- */}
        <div className="rounded-3xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-slate-100 space-y-5">
          
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center rounded-2xl bg-slate-100/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("REVIEWS");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "REVIEWS"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Star className="size-3.5" />
                <span>Đánh giá</span>
                <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-[10px] text-slate-600">
                  {reviews.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("COMMENTS");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                  activeTab === "COMMENTS"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MessageCircle className="size-3.5" />
                <span>Bình luận bài học</span>
                <span className="rounded-full bg-slate-200/60 px-2 py-0.5 text-[10px] text-slate-600">
                  {comments.length}
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex-1 min-w-50 max-w-xs">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Tìm nội dung, tên, khóa học..."
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </div>

              {activeTab === "REVIEWS" && (
                <select
                  value={ratingFilter}
                  onChange={(e) => {
                    setRatingFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-2xl border border-slate-200/80 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-blue-500"
                >
                  <option value="ALL">Tất cả số sao</option>
                  <option value="5">5 sao ★★★★★</option>
                  <option value="4">4 sao ★★★★☆</option>
                  <option value="3">3 sao ★★★☆☆</option>
                  <option value="2">2 sao ★★☆☆☆</option>
                  <option value="1">1 sao ★☆☆☆☆</option>
                </select>
              )}
            </div>
          </div>

          {/* TAB 1: DANH SÁCH ĐÁNH GIÁ (REVIEWS) */}
          {activeTab === "REVIEWS" && (
            <div className="space-y-3 min-h-75">
              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <span className="text-xs font-medium">Đang tải danh sách đánh giá...</span>
                </div>
              ) : paginatedReviews.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-xs">
                  Không tìm thấy đánh giá nào phù hợp.
                </div>
              ) : (
                paginatedReviews.map((review) => {
                  const initial = getVietnameseInitial(review.studentName);
                  const isDeleting = deletingId === review.id;

                  return (
                    <article
                      key={review.id}
                      className="group rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-slate-200/80 hover:shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shrink-0 shadow-2xs">
                            {initial}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-xs">{review.studentName}</h4>
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                                <BookOpen className="size-3" /> {review.courseTitle}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="size-3" />
                              {new Date(review.createdAt).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-600">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span>{review.rating ? `${review.rating}.0` : "—"}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100/80">
                        {review.comment || <span className="italic text-slate-400">Không có nội dung nhận xét.</span>}
                      </p>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => void remove("moderation/reviews", review.id, "đánh giá")}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          <span>Xóa đánh giá</span>
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: DANH SÁCH BÌNH LUẬN (COMMENTS) */}
          {activeTab === "COMMENTS" && (
            <div className="space-y-3 min-h-75">
              {loading ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="size-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <span className="text-xs font-medium">Đang tải danh sách bình luận...</span>
                </div>
              ) : paginatedComments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic text-xs">
                  Không tìm thấy bình luận bài học nào.
                </div>
              ) : (
                paginatedComments.map((comment) => {
                  const initial = getVietnameseInitial(comment.userName);
                  const isDeleting = deletingId === comment.id;

                  return (
                    <article
                      key={comment.id}
                      className="group rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-slate-200/80 hover:shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-indigo-600 text-xs font-bold text-white shrink-0 shadow-2xs">
                            {initial}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-xs">{comment.userName}</h4>
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                                <Layers className="size-3" /> {comment.lessonTitle}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="size-3" />
                              {new Date(comment.createdAt).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100/80">
                        {comment.content}
                      </p>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => void remove("moderation/lesson-comments", comment.id, "bình luận")}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          <span>Xóa bình luận</span>
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="text-[11px] font-semibold text-slate-400">
              Hiển thị {activeList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, activeList.length)} trong {activeList.length}{" "}
              {activeTab === "REVIEWS" ? "đánh giá" : "bình luận"}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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