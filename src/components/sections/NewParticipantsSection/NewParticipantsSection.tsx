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
  const isAutoScrollingRef = useRef(false);
  const releaseAutoScrollTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const resumeAutoScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

     const releaseAutoScrollFlag = () => {
       if (releaseAutoScrollTimeoutRef.current) {
         clearTimeout(releaseAutoScrollTimeoutRef.current);
       }
       releaseAutoScrollTimeoutRef.current = setTimeout(() => {
         isAutoScrollingRef.current = false;
       }, 650);
     };

    const scrollToIndex = (index: number) => {
      if (!carouselRef.current) return;
      const item = carouselRef.current.children.item(index) as HTMLElement | null;
      if (!item) return;

      carouselRef.current.scrollTo({
        left: item.offsetLeft,
        behavior: "smooth",
      });
    };

    const animateToIndex = (index: number) => {
      isAutoScrollingRef.current = true;
      scrollToIndex(index);
      releaseAutoScrollFlag();
    };

    const updateActiveIndexFromScroll = () => {
      if (!carouselRef.current) return;
      const el = carouselRef.current;
      const center = el.scrollLeft + el.clientWidth / 2;
      let closestIndex = activeIndexRef.current;
      let minDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < el.children.length; i += 1) {
        const child = el.children.item(i) as HTMLElement | null;
        if (!child) continue;
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const distance = Math.abs(childCenter - center);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      activeIndexRef.current = closestIndex;
    };

    const startAutoScroll = () => {
      if (autoScrollIntervalRef.current) return;
      animateToIndex(activeIndexRef.current);

      autoScrollIntervalRef.current = setInterval(() => {
        if (!carouselRef.current) return;
        const totalItems = carouselRef.current.children.length;
        if (totalItems === 0) return;

        activeIndexRef.current = (activeIndexRef.current + 1) % totalItems;
        animateToIndex(activeIndexRef.current);
      }, 4000);
    };

    const stopAutoScroll = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      if (releaseAutoScrollTimeoutRef.current) {
        clearTimeout(releaseAutoScrollTimeoutRef.current);
        releaseAutoScrollTimeoutRef.current = null;
      }
      if (resumeAutoScrollTimeoutRef.current) {
        clearTimeout(resumeAutoScrollTimeoutRef.current);
        resumeAutoScrollTimeoutRef.current = null;
      }
      isAutoScrollingRef.current = false;
    };

    const requestResumeAutoScroll = () => {
      if (resumeAutoScrollTimeoutRef.current) {
        clearTimeout(resumeAutoScrollTimeoutRef.current);
      }
      resumeAutoScrollTimeoutRef.current = setTimeout(() => {
        resumeAutoScrollTimeoutRef.current = null;
        updateActiveIndexFromScroll();
        startAutoScroll();
      }, 250);
    };

    const handlePointerEnter = () => {
      if (resumeAutoScrollTimeoutRef.current) {
        clearTimeout(resumeAutoScrollTimeoutRef.current);
        resumeAutoScrollTimeoutRef.current = null;
      }
      stopAutoScroll();
    };

    const handlePointerLeave = () => {
      requestResumeAutoScroll();
    };

    const handleScroll = () => {
      if (isAutoScrollingRef.current) return;
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      scrollRafRef.current = window.requestAnimationFrame(() => {
        updateActiveIndexFromScroll();
      });
    };

    const handleTouchStart = () => {
      stopAutoScroll();
    };

    const handleTouchEnd = () => {
      requestResumeAutoScroll();
    };

    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointerleave", handlePointerLeave);
    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("touchcancel", handleTouchEnd);

    startAutoScroll();

    return () => {
      stopAutoScroll();
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
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
