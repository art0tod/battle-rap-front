import HeroSection from "@/components/sections/HeroSection/HeroSection";
import AboutSection from "@/components/sections/AboutSection/AboutSection";
import NewParticipantsSection from "@/components/sections/NewParticipantsSection/NewParticipantsSection";
import BattleRatingSection from "@/components/sections/BattleRatingSection/BattleRatingSection";
import PostsSection from "@/components/sections/PostsSection/PostsSection";
import ApplySection from "@/components/sections/ApplySection/ApplySection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <HeroSection />
      <AboutSection />
      <NewParticipantsSection />
      <BattleRatingSection />
      <PostsSection />
      <ApplySection />
    </main>
  );
}
