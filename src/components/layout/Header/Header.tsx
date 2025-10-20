"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./styles.module.css";
import AuthModal, {
  type AuthMode,
} from "@/components/auth/AuthModal/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";

const links = [
  { href: "/", title: "Баттлы" },
  { href: "/#posts-section", title: "Посты" },
  { href: "/members", title: "Участники" },
  { href: "/members?role=judge", title: "Судьи" },
  { href: "/battles", title: "Обзор раундов" },
  { href: "/judge", title: "Судейство" },
  { href: "/#judges-rating-section", title: "Рейтинг судей" },
];

export default function Header() {
  const [isBlurred, setIsBlurred] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const { user } = useAuth();

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

  useEffect(() => {
    if (user && isAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
  }, [user, isAuthModalOpen]);

  return (
    <header
      className={[styles.root, isBlurred ? styles.backdropBlur : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={`${styles.content} content-width`}>
        <div className={styles.logo}>
          <Link className={styles.logoLink} href={"/"}>
            <span className={styles.logoText}>Главная</span>
          </Link>
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
          {user ? (
            <Link
              className={styles.cta}
              href={user.roles.includes("admin") ? "/admin" : "/profile"}
            >
              {user.displayName}
            </Link>
          ) : (
            <Link
              className={styles.cta}
              href={"/profile"}
              onClick={(event) => {
                event.preventDefault();
                setAuthMode("signIn");
                setIsAuthModalOpen(true);
              }}
            >
              Войти
            </Link>
          )}
        </nav>
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onModeChange={setAuthMode}
      />
    </header>
  );
}
