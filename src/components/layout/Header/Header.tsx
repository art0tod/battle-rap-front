"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./styles.module.css";

const links = [
  { href: "/", title: "Главная" },
  { href: "/posts", title: "Посты" },
  { href: "/members", title: "Участники" },
  { href: "/judges", title: "Судьи" },
  { href: "/judges-ratings", title: "Рейтинг судей" },
];

export default function Header() {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsBlurred(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={[styles.root, isBlurred ? styles.backdropBlur : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={`${styles.content} content-width`}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Баттлы</span>
        </div>
        <nav className={styles.navBar}>
          <ul className={styles.links}>
            {links.map((link) => (
              <li className={styles.linksItem} key={link.href}>
                <Link className={styles.link} href={link.href}>
                  {link.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link className={styles.cta} href={"/register"}>
            Войти
          </Link>
        </nav>
      </div>
    </header>
  );
}
