import type { Metadata } from "next";
import MembersSection from "@/components/sections/MembersSection/MembersSection";

export const metadata: Metadata = {
  title: "Участники | Battle hip-hop.ru",
  description: "Страница списка участников проекта Battle hip-hop.ru.",
};

export default function MembersPage() {
  return (
    <main>
      <MembersSection />
    </main>
  );
}
