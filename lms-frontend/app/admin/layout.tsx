import { RoleGuard } from "@/components/role-guard";
import { WorkspaceShell } from "@/components/workspace-shell";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RoleGuard requiredRole="ADMIN">
    <WorkspaceShell role="ADMIN">{children}</WorkspaceShell>
  </RoleGuard>;
}
