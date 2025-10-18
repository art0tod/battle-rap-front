"use client";

import { useCallback, useEffect, useState } from "react";
import { battleRapApi } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import { resolveApiErrorMessage } from "../utils";
import styles from "./styles.module.css";

interface AdminMetrics {
  totalUsers: number;
  submittedSubmissions: number;
  approvedSubmissions: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!token) {
      setError("Нет токена авторизации. Перезайдите в аккаунт администратора.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [users, submitted, approved] = await Promise.all([
        battleRapApi.admin.listUsers({ limit: 1 }, { token }),
        battleRapApi.moderator.listSubmissions({ status: "submitted", limit: 1 }, { token }),
        battleRapApi.moderator.listSubmissions({ status: "approved", limit: 1 }, { token }),
      ]);
      setMetrics({
        totalUsers: users.total,
        submittedSubmissions: submitted.total,
        approvedSubmissions: approved.total,
      });
      setUpdatedAt(new Date());
    } catch (cause) {
      setError(resolveApiErrorMessage(cause));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Общая статистика</h2>
          <p className={styles.description}>
            Ключевые показатели активности платформы.
          </p>
        </div>
        <div className={styles.controls}>
          {updatedAt ? (
            <span className={styles.timestamp}>
              Обновлено: {updatedAt.toLocaleString("ru-RU")}
            </span>
          ) : null}
          <button
            className={styles.refreshButton}
            disabled={isLoading}
            onClick={() => {
              void loadDashboard();
            }}
            type="button"
          >
            {isLoading ? "Обновление..." : "Обновить"}
          </button>
        </div>
      </header>
      {error ? (
        <div className={styles.errorBox}>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => {
              void loadDashboard();
            }}
            type="button"
          >
            Повторить
          </button>
        </div>
      ) : null}
      <div className={styles.statGrid}>
        {isLoading && !metrics ? (
          <div className={styles.placeholder}>Загрузка статистики...</div>
        ) : null}
        {metrics
          ? Object.entries(metrics).map(([key, value]) => (
              <article className={styles.statCard} key={key}>
                <h3 className={styles.statLabel}>{translateMetricKey(key)}</h3>
                <p className={styles.statValue}>{value}</p>
              </article>
            ))
          : null}
      </div>
    </section>
  );
}

function translateMetricKey(key: string): string {
  const dictionary: Record<string, string> = {
    totalUsers: "Пользователей",
    submittedSubmissions: "Ожидают модерации",
    approvedSubmissions: "Одобрено",
  };
  return dictionary[key] ?? key;
}
