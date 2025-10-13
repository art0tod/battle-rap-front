import HeroSection from "@/components/sections/HeroSection/HeroSection";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <HeroSection />
    </main>
  );
}
