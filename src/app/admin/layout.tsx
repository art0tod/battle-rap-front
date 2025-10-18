import type { ReactNode } from "react";
import AdminLayout from "@/components/admin/AdminLayout/AdminLayout";

export default function AdminPagesLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
