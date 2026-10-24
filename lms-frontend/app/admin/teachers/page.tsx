import { redirect } from "next/navigation";

export default function AdminTeachersPage() {
  redirect("/admin/users?role=TEACHER");
}
