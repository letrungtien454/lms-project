"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, apiRequest } from "@/lib/api";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";

type Role = "STUDENT" | "TEACHER" | "ADMIN";
type CurrentUser = { role: Role };

const roleHome: Record<Role, string> = {
  STUDENT: "/dashboard",
  TEACHER: "/teacher/dashboard",
  ADMIN: "/admin/dashboard",
};

export function RoleGuard({
  requiredRole,
  children,
}: {
  requiredRole: Exclude<Role, "STUDENT">;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const token = getAccessToken();
    if (!token) {
      router.replace(`/auth?returnUrl=${encodeURIComponent(pathname)}`);
      return () => {
        active = false;
      };
    }

    apiRequest<CurrentUser>("/api/users/me")
      .then((user) => {
        if (!active) return;
        if (user.role !== requiredRole) {
          router.replace(roleHome[user.role] ?? "/dashboard");
          return;
        }
        setAuthorized(true);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof ApiError && cause.status === 401) {
          clearAuthSession();
          router.replace(`/auth?returnUrl=${encodeURIComponent(pathname)}`);
          return;
        }
        setError(cause instanceof Error ? cause.message : "Không thể xác minh quyền truy cập.");
      });

    return () => {
      active = false;
    };
  }, [pathname, requiredRole, router]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="font-semibold text-red-700">{error}</p>
          <button className="mt-3 text-blue-700 underline" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      </main>
    );
  }
  if (!authorized) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Đang xác minh quyền truy cập...</div>;
  }
  return children;
}
