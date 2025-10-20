"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import styles from "./styles.module.css";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/users", label: "Пользователи" },
  { href: "/admin/submissions", label: "Заявки" },
  { href: "/admin/battles", label: "Баттлы" },
  { href: "/admin/media", label: "Медиа" },
];

function isActivePath(currentPath: string, target: string): boolean {
  if (target === "/admin") {
    return currentPath === target;
  }
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, isInitializing } = useAuth();
  const pathname = usePathname();

  if (isInitializing) {
    return (
      <section className={`${styles.stateMessage} content-width`}>
        <h1>Загрузка админ-панели...</h1>
        <p>Пожалуйста, подождите.</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className={`${styles.stateMessage} content-width`}>
        <h1>Требуется авторизация</h1>
        <p>Эта страница доступна только администраторам. Войдите в систему и повторите попытку.</p>
      </section>
    );
  }

  const isAdmin = user.roles.includes("admin");
  if (!isAdmin) {
    return (
      <section className={`${styles.stateMessage} content-width`}>
        <h1>Недостаточно прав</h1>
        <p>У учетной записи {user.displayName} нет прав администратора.</p>
      </section>
    );
  }

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.title}>Админ-панель</h1>
          <p className={styles.subtitle}>Добро пожаловать, {user.displayName}</p>
        </div>
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                styles.navLink,
                isActivePath(pathname, item.href) ? styles.navLinkActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button className={styles.logoutButton} type="button" onClick={logout}>
          Выйти
        </button>
      </aside>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
