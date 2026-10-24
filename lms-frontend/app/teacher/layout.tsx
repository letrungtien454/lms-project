import { RoleGuard } from "@/components/role-guard";
import { WorkspaceShell } from "@/components/workspace-shell";

export default function TeacherLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RoleGuard requiredRole="TEACHER">
    <WorkspaceShell role="TEACHER">{children}</WorkspaceShell>
  </RoleGuard>;
}
