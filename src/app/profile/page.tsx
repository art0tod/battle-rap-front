import type { Metadata } from "next";
import ProfileSection from "@/components/sections/ProfileSection/ProfileSection";

export const metadata: Metadata = {
  title: "Профиль | Battle hip-hop.ru",
  description: "Личная страница участника проекта Battle hip-hop.ru.",
};

export default function ProfilePage() {
  return (
    <main>
      <ProfileSection />
    </main>
  );
}
