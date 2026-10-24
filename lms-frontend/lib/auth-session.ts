export type AuthRole = "STUDENT" | "TEACHER" | "ADMIN";

export function getAccessToken(): string | null {
  return typeof window === "undefined" ? null : window.sessionStorage.getItem("accessToken");
}

export function saveAuthSession(token: string, role: AuthRole, fullName: string): void {
  window.sessionStorage.setItem("accessToken", token);
  window.sessionStorage.setItem("userRole", role);
  window.sessionStorage.setItem("userName", fullName);
  clearLegacyAuthSession();
}

export function getSessionUserName(): string | null {
  return typeof window === "undefined" ? null : window.sessionStorage.getItem("userName");
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("accessToken");
  window.sessionStorage.removeItem("userRole");
  window.sessionStorage.removeItem("userName");
  clearLegacyAuthSession();
}

function clearLegacyAuthSession(): void {
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("userRole");
  window.localStorage.removeItem("userName");
}
