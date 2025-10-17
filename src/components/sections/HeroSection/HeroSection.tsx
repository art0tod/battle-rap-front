"use client";

import { useState } from "react";
import styles from "./styles.module.css";
import ParticipationModal from "@/components/participation/ParticipationModal";

export default function HeroSection() {
  const marqueeText =
    "БАТТЛ • ПРОЕКТ • ХИП-ХОП.РУ • НОВЫЕ ИМЕНА • СТАРИЧКИ • РИФМЫ • ПАНЧЛАЙНЫ • БАТТЛ • ПРОЕКТ • ХИП-ХОП.РУ • НОВЫЕ ИМЕНА • СТАРИЧКИ • РИФМЫ • БАТТЛ • ПРОЕКТ • ХИП-ХОП.РУ • НОВЫЕ ИМЕНА •";
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="hero-section" className={styles.root}>
      <div className={styles.content + " " + "content-width"}>
        <button
          className={styles.participate}
          onClick={() => setIsModalOpen(true)}
          type="button"
        >
          Принять участие
        </button>
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
      <ParticipationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
