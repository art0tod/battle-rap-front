import Link from "next/link";
import styles from "./styles.module.css";

export default function HeroSection() {
  const marqueeText =
    "БАТТЛ • ПРОЕКТ • ХИП-ХОП.РУ • НОВЫЕ ИМЕНА • СТАРИЧКИ • РИФМЫ • ПАНЧЛАЙНЫ • БАТТЛ • ПРОЕКТ • ХИП-ХОП.РУ • НОВЫЕ ИМЕНА • СТАРИЧКИ • РИФМЫ • БАТТЛ • ПРОЕКТ • ХИП-ХОП.РУ • НОВЫЕ ИМЕНА •";

  return (
    <section className={styles.root}>
      <div className={styles.content + " " + "content-width"}>
        <Link href={"/participate "} className={styles.participate}>
          Принять участие
        </Link>
        <div className={styles.heading}>
          <h1 className={styles.title}>Battle hip-hop.ru</h1>
          <h2 className={styles.subTitle}>Независимый</h2>
        </div>
      </div>
      <div className={styles.marquee}>
        <div className={styles.marqueeTrack}>
          <span>{marqueeText}</span>
          <span aria-hidden="true">{marqueeText}</span>
        </div>
      </div>
    </section>
  );
}
