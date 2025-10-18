"use client";

import { useCallback, useState } from "react";
import { battleRapApi, type ModerationSubmission } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import { resolveApiErrorMessage } from "../utils";
import styles from "./styles.module.css";

export default function AdminSubmissions() {
  const { token } = useAuth();
  const [submissionId, setSubmissionId] = useState("");
  const [submission, setSubmission] = useState<ModerationSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSubmission = useCallback(async () => {
    if (!token) {
      setError("Нет токена авторизации. Перезайдите в аккаунт администратора.");
      return;
    }
    if (!submissionId.trim()) {
      setError("Укажите идентификатор заявки.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await battleRapApi.moderator.getSubmission(submissionId.trim(), { token });
      setSubmission(response);
    } catch (cause) {
      setSubmission(null);
      setError(resolveApiErrorMessage(cause));
    } finally {
      setIsLoading(false);
    }
  }, [submissionId, token]);

  const publishSubmission = useCallback(async () => {
    if (!token) {
      setError("Нет токена авторизации. Перезайдите в аккаунт администратора.");
      return;
    }
    if (!submissionId.trim()) {
      setError("Укажите идентификатор заявки.");
      return;
    }

    setIsPublishing(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await battleRapApi.moderator.publishSubmission(submissionId.trim(), { token });
      setSuccessMessage("Заявка опубликована.");
      await loadSubmission();
    } catch (cause) {
      setError(resolveApiErrorMessage(cause));
    } finally {
      setIsPublishing(false);
    }
  }, [loadSubmission, submissionId, token]);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Заявки на модерации</h2>
          <p className={styles.description}>
            Получайте информацию о заявке и отправляйте команду публикации через сервер.
          </p>
        </div>
      </header>
      <div className={styles.form}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="submissionId">
            ID заявки
          </label>
          <input
            id="submissionId"
            className={styles.input}
            placeholder="Например, 7a9c2..."
            value={submissionId}
            onChange={(event) => setSubmissionId(event.target.value)}
          />
        </div>
        <div className={styles.formActions}>
          <button
            className={styles.submitButton}
            disabled={isLoading}
            onClick={() => {
              void loadSubmission();
            }}
            type="button"
          >
            {isLoading ? "Загрузка..." : "Загрузить заявку"}
          </button>
          <button
            className={styles.submitButton}
            disabled={isPublishing || !submission}
            onClick={() => {
              void publishSubmission();
            }}
            type="button"
          >
            {isPublishing ? "Отправка..." : "Опубликовать"}
          </button>
          <button
            className={styles.resetButton}
            disabled={isLoading || isPublishing}
            onClick={() => {
              setSubmissionId("");
              setSubmission(null);
              setError(null);
              setSuccessMessage(null);
            }}
            type="button"
          >
            Сбросить
          </button>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        {successMessage ? <p className={styles.success}>{successMessage}</p> : null}
      </div>
      {submission ? (
        <div className={styles.result}>
          <h3 className={styles.resultTitle}>Данные заявки</h3>
          <dl className={styles.resultGrid}>
            <div>
              <dt>ID</dt>
              <dd className={styles.mono}>{submission.id}</dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd>{translateSubmissionStatus(submission.status)}</dd>
            </div>
            <div>
              <dt>Отправлено</dt>
              <dd>{submission.submittedAt ? formatDate(submission.submittedAt) : "—"}</dd>
            </div>
            <div>
              <dt>Обновлено</dt>
              <dd>{formatDate(submission.updatedAt)}</dd>
            </div>
            <div>
              <dt>Раунд</dt>
              <dd>
                <div className={styles.mono}>{submission.round.id}</div>
                <div>
                  {submission.round.tournamentTitle} · №{submission.round.number} ({submission.round.kind})
                </div>
              </dd>
            </div>
            <div>
              <dt>Исполнитель</dt>
              <dd>
                <div>{submission.artist.displayName}</div>
                <div className={styles.mono}>{submission.artist.email}</div>
                <div className={styles.mono}>{submission.artist.id}</div>
              </dd>
            </div>
            <div>
              <dt>Аудио</dt>
              <dd>
                <div className={styles.mono}>{submission.audio.id}</div>
                <div>{submission.audio.mime}</div>
                <div>{submission.audio.status}</div>
                {submission.audio.url ? <div className={styles.mono}>{submission.audio.url}</div> : null}
              </dd>
            </div>
          </dl>
          {submission.lyrics ? (
            <div className={styles.lyricsBlock}>
              <h4>Текст</h4>
              <pre>{submission.lyrics}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function translateSubmissionStatus(status: string): string {
  const map: Record<string, string> = {
    submitted: "Отправлено",
    approved: "Одобрено",
    published: "Опубликовано",
    rejected: "Отклонено",
  };
  return map[status] ?? status;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString("ru-RU");
}
