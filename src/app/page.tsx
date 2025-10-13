import HeroSection from "@/components/sections/HeroSection/HeroSection";
import styles from "./page.module.css";
import AboutSection from "@/components/sections/AboutSection/AboutSection";

export default function Home() {
  return (
    <main className={styles.page}>
      <HeroSection />
      <AboutSection />
    </main>
  );
}
