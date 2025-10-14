"use client";

import { useEffect, useRef } from "react";
import styles from "./styles.module.css";

const participants = [
  {
    name: "Nova",
    tag: "Северная школа",
    image: "/participants/photo.png",
  },
  {
    name: "Гром",
    tag: "Улица",
    image: "/participants/photo.png",
  },
  {
    name: "Вектор",
    tag: "Новая волна",
    image: "/participants/photo.png",
  },
  {
    name: "Резонанс",
    tag: "Эксперимент",
    image: "/participants/photo.png",
  },
  {
    name: "Факел",
    tag: "Юг",
    image: "/participants/photo.png",
  },
  {
    name: "Дым",
    tag: "Подполье",
    image: "/participants/photo.png",
  },
];

export default function NewParticipantsSection() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const autoScrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollToIndex = (index: number) => {
      if (!carouselRef.current) return;
      const item = carouselRef.current.children.item(index) as HTMLElement | null;
      if (!item) return;

      carouselRef.current.scrollTo({
        left: item.offsetLeft,
        behavior: "smooth",
      });
    };

    const startAutoScroll = () => {
      if (autoScrollIntervalRef.current) return;
      scrollToIndex(activeIndexRef.current);

      autoScrollIntervalRef.current = setInterval(() => {
        if (!carouselRef.current) return;
        const totalItems = carouselRef.current.children.length;
        if (totalItems === 0) return;

        activeIndexRef.current = (activeIndexRef.current + 1) % totalItems;
        scrollToIndex(activeIndexRef.current);
      }, 4000);
    };

    const stopAutoScroll = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };

    const handleMouseEnter = () => {
      stopAutoScroll();
    };

    const handleMouseLeave = () => {
      startAutoScroll();
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    startAutoScroll();

    return () => {
      stopAutoScroll();
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section className={styles.root}>
      <div className={styles.content + " " + "content-width"}>
        <div className={styles.titleRow}>
          <span className={styles.titleLine} aria-hidden="true" />
          <h2 className={styles.title}>
            <span className={styles.titleText}>НОВЫЕ УЧАСТНИКИ</span>
          </h2>
          <span className={styles.titleLine} aria-hidden="true" />
        </div>
        <div className={styles.carousel} ref={carouselRef}>
          {participants.map((participant) => (
            <article
              className={styles.card}
              key={participant.name}
              style={{ backgroundImage: `url(${participant.image})` }}
            >
              <span className={styles.cardTag}>{participant.tag}</span>
              <h3 className={styles.cardName}>{participant.name}</h3>
              <button className={styles.cardButton}>Бросить вызов</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
