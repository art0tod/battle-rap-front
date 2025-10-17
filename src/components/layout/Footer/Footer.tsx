"use client";

import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import Link from "next/link";
import AuthModal, { type AuthMode } from "@/components/auth/AuthModal/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";

const socialLinks = [
  { href: "https://vk.com", title: "VK", iconSrc: "/vk.svg" },
  { href: "https://t.me", title: "Telegram", iconSrc: "/tg.svg" },
];

const siteLinks = [  
  { href: "/#posts-section", title: "Посты" },
  { href: "/members", title: "Участники" },
  { href: "/judges", title: "Судьи" },
  { href: "/#judges-rating-section", title: "Рейтинг судей" }
]

export default function Footer() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const { user } = useAuth();

  useEffect(() => {
    if (user && isAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
  }, [user, isAuthModalOpen]);

  return <footer id="site-footer" className={styles.root + " " + "content-width"}>
    <div className={styles.footer__container}>
      <div className={styles.wrapper}>
        <div className={styles.footer__titleContainer}>
          <h3 className={styles.footer__subtitle}>НЕЗАВИСИМЫЙ</h3>
          <h2 className={styles.footer__title}>BATTLE HIP-HOP.RU</h2>
          <p className={styles.footer__paragraph}>Онлайн-арена хип-хоп баттлов с участием артистов, судей и и фанатов под эгидой хип хоп ру.</p>
        </div>
        <div className={styles.footer__navContainer}>
          <ul className={styles.siteLinks}>
          {siteLinks.map((link) => (
                <li className={styles.siteLinksItem} key={link.href}>
                  <Link className={styles.siteLink} href={link.href}>
                    {link.title}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
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
      </div>
      <div className={styles.footer__copyrightContainer}>
          <ul className={styles.contactsIconsList}>
          {socialLinks.map((link) => (
            <li key={link.title} className={styles.contactsIcon}>
              <Link
                className={styles.contactsLink}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                <span
                  aria-hidden="true"
                  className={styles.contactsIconImage}
                  style={{ backgroundImage: `url(${link.iconSrc})` }}
                />
                <span className={styles.visuallyHidden}>{link.title}</span>
              </Link>
            </li>
          ))}
          </ul>
          <p className={styles.footer__copyright}>© 2025 HipHop.ru. Все права защищены.</p>
      </div>
    </div>
    <AuthModal
      isOpen={isAuthModalOpen}
      mode={authMode}
      onClose={() => setIsAuthModalOpen(false)}
      onModeChange={setAuthMode}
    />
  </footer>;
}
