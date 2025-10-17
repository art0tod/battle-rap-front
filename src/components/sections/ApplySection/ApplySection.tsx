"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./styles.module.css";
import ParticipationModal from "@/components/participation/ParticipationModal";

export default function ApplySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className={styles.root}>
      <div className={styles.content + " " + "content-width"}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Подай заявку!</h2>
          <h3 className={styles.subtitle}>Хочешь на сцену?</h3>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            onClick={() => setIsModalOpen(true)}
            type="button"
          >
            Принять участие
          </button>
          <Link className={styles.secondaryAction} href="/rules">
            Узнать правила
          </Link>
        </div>
      </div>
      <ParticipationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
