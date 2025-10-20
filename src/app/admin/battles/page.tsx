import type { Metadata } from "next";
import AdminBattles from "@/components/admin/Battles/AdminBattles";

export const metadata: Metadata = {
  title: "Баттлы | Админ-панель",
  description: "Управление баттлами проекта Battle hip-hop.ru.",
};

export default function AdminBattlesPage() {
  return (
    <main className="content-width">
      <AdminBattles />
    </main>
  );
}
