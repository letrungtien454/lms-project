import { getAccessToken } from "@/lib/auth-session";
import { API_BASE_URL } from "@/lib/api";

export const STUDENT_API_URL = API_BASE_URL;

export type StudentUser = {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: string;
};

export type EnrolledCourse = {
  id: number;
  title: string;
  instructorName: string;
  categoryName: string;
  thumbnailUrl?: string | null;
  enrolledAt?: string | null;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
};

export type StudentPayment = {
  orderId: number;
  transactionCode: string;
  courseId: number;
  courseTitle: string;
  amount: number;
  method: string;
  status: "PENDING" | "PAID" | "FAILED" | string;
  createdAt: string;
  paidAt?: string | null;
};

export type StudentNotification = {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  senderName: string;
};

export type StudentNotificationPage = {
  content: StudentNotification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type CatalogCourse = {
  id: number;
  title: string;
  description?: string;
  price: number;
  level: string;
  thumbnailUrl?: string | null;
  instructorName?: string | null;
  categoryName?: string | null;
  averageRating?: number | null;
  reviewCount: number;
  studentCount: number;
  totalDurationSeconds: number;
};

export async function studentApi<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  if (!token) throw new Error("Vui lòng đăng nhập để xem dữ liệu học viên.");

  const response = await fetch(`${STUDENT_API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message || `Yêu cầu thất bại (HTTP ${response.status}).`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function formatStudentDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export function formatCourseDuration(seconds?: number | null): string | null {
  const totalMinutes = Math.floor(Math.max(0, seconds ?? 0) / 60);
  if (totalMinutes === 0) return null;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} phút`;
  return minutes === 0 ? `${hours} giờ` : `${hours} giờ ${minutes} phút`;
}

export function timeAgo(value?: string | null): string {
  if (!value) return "—";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "—";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60_000));
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatStudentDate(value);
}
