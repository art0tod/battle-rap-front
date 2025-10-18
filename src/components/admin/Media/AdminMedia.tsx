"use client";

import { useCallback, useState } from "react";
import {
  battleRapApi,
  type MediaAssetStatus,
  type PresignUploadResponse,
  type UploadAssetKind,
} from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import { resolveApiErrorMessage } from "../utils";
import styles from "./styles.module.css";

const uploadKinds: UploadAssetKind[] = ["audio", "image"];

interface PresignFormState {
  filename: string;
  mime: string;
  sizeBytes: string;
  type: UploadAssetKind;
}

interface CompleteFormState {
  assetId: string;
  storageKey: string;
  mime: string;
  sizeBytes: string;
  kind: UploadAssetKind;
}

const initialPresignState: PresignFormState = {
  filename: "",
  mime: "",
  sizeBytes: "",
  type: "audio",
};

const initialCompleteState: CompleteFormState = {
  assetId: "",
  storageKey: "",
  mime: "",
  sizeBytes: "",
  kind: "audio",
};

export default function AdminMedia() {
  const { token } = useAuth();
  const [presignForm, setPresignForm] = useState<PresignFormState>(initialPresignState);
  const [completeForm, setCompleteForm] = useState<CompleteFormState>(initialCompleteState);
  const [presignResult, setPresignResult] = useState<PresignUploadResponse | null>(null);
  const [completeResult, setCompleteResult] = useState<MediaAssetStatus | null>(null);
  const [presignError, setPresignError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [isPresigning, setIsPresigning] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handlePresign = useCallback(async () => {
    if (!token) {
      setPresignError("Нет токена авторизации. Перезайдите в аккаунт администратора.");
      return;
    }
    if (!presignForm.filename.trim() || !presignForm.mime.trim() || !presignForm.sizeBytes.trim()) {
      setPresignError("Укажите имя файла, MIME-тип и размер в байтах.");
      return;
    }
    const size = Number(presignForm.sizeBytes);
    if (!Number.isFinite(size) || size <= 0) {
      setPresignError("Размер должен быть положительным числом.");
      return;
    }

    setIsPresigning(true);
    setPresignError(null);
    try {
      const response = await battleRapApi.media.presignUpload(
        {
          filename: presignForm.filename.trim(),
          mime: presignForm.mime.trim(),
          sizeBytes: size,
          type: presignForm.type,
        },
        { token },
      );
      setPresignResult(response);
      setCompleteForm((prev) => ({
        ...prev,
        assetId: response.assetId,
        storageKey: response.storageKey,
        mime: presignForm.mime.trim(),
        sizeBytes: presignForm.sizeBytes.trim(),
        kind: presignForm.type,
      }));
    } catch (cause) {
      setPresignError(resolveApiErrorMessage(cause));
    } finally {
      setIsPresigning(false);
    }
  }, [presignForm, token]);

  const handleComplete = useCallback(async () => {
    if (!token) {
      setCompleteError("Нет токена авторизации. Перезайдите в аккаунт администратора.");
      return;
    }
    if (
      !completeForm.assetId.trim() ||
      !completeForm.storageKey.trim() ||
      !completeForm.mime.trim() ||
      !completeForm.sizeBytes.trim()
    ) {
      setCompleteError("Заполните все поля завершения загрузки.");
      return;
    }
    const size = Number(completeForm.sizeBytes);
    if (!Number.isFinite(size) || size <= 0) {
      setCompleteError("Размер должен быть положительным числом.");
      return;
    }

    setIsCompleting(true);
    setCompleteError(null);
    try {
      const response = await battleRapApi.media.completeUpload(
        {
          assetId: completeForm.assetId.trim(),
          storageKey: completeForm.storageKey.trim(),
          mime: completeForm.mime.trim(),
          sizeBytes: size,
          kind: completeForm.kind,
        },
        { token },
      );
      setCompleteResult(response);
    } catch (cause) {
      setCompleteError(resolveApiErrorMessage(cause));
    } finally {
      setIsCompleting(false);
    }
  }, [completeForm, token]);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Медиафайлы</h2>
          <p className={styles.description}>
            Запрашивайте ссылку для загрузки и подтверждайте завершение —
            все запросы идут через сервер Next.js.
          </p>
        </div>
      </header>

      <div className={styles.form}>
        <h3 className={styles.formTitle}>Запрос пресайн ссылки</h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="presignFilename">
              Имя файла
            </label>
            <input
              id="presignFilename"
              className={styles.input}
              placeholder="demo-track.mp3"
              value={presignForm.filename}
              onChange={(event) =>
                setPresignForm((prev) => ({ ...prev, filename: event.target.value }))
              }
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="presignMime">
              MIME
            </label>
            <input
              id="presignMime"
              className={styles.input}
              placeholder="audio/mpeg"
              value={presignForm.mime}
              onChange={(event) =>
                setPresignForm((prev) => ({ ...prev, mime: event.target.value }))
              }
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="presignSize">
              Размер (байты)
            </label>
            <input
              id="presignSize"
              className={styles.input}
              placeholder="1234567"
              value={presignForm.sizeBytes}
              onChange={(event) =>
                setPresignForm((prev) => ({ ...prev, sizeBytes: event.target.value }))
              }
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="presignType">
              Тип
            </label>
            <select
              id="presignType"
              className={styles.select}
              value={presignForm.type}
              onChange={(event) =>
                setPresignForm((prev) => ({
                  ...prev,
                  type: event.target.value as UploadAssetKind,
                }))
              }
            >
              {uploadKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {translateKind(kind)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.formActions}>
          <button
            className={styles.submitButton}
            disabled={isPresigning}
            onClick={() => {
              void handlePresign();
            }}
            type="button"
          >
            {isPresigning ? "Отправка..." : "Запросить ссылку"}
          </button>
          <button
            className={styles.resetButton}
            disabled={isPresigning}
            onClick={() => {
              setPresignForm(initialPresignState);
              setPresignResult(null);
              setPresignError(null);
            }}
            type="button"
          >
            Сбросить
          </button>
        </div>
        {presignError ? <p className={styles.error}>{presignError}</p> : null}
        {presignResult ? (
          <dl className={styles.resultGrid}>
            <div>
              <dt>Asset ID</dt>
              <dd className={styles.mono}>{presignResult.assetId}</dd>
            </div>
            <div>
              <dt>Storage key</dt>
              <dd className={styles.mono}>{presignResult.storageKey}</dd>
            </div>
            <div>
              <dt>Upload URL</dt>
              <dd className={styles.mono}>{presignResult.uploadUrl}</dd>
            </div>
          </dl>
        ) : null}
      </div>

      <div className={styles.form}>
        <h3 className={styles.formTitle}>Подтверждение загрузки</h3>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="completeAssetId">
              Asset ID
            </label>
            <input
              id="completeAssetId"
              className={styles.input}
              placeholder="uuid"
              value={completeForm.assetId}
              onChange={(event) =>
                setCompleteForm((prev) => ({ ...prev, assetId: event.target.value }))
              }
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="completeStorageKey">
              Storage key
            </label>
            <input
              id="completeStorageKey"
              className={styles.input}
              placeholder="uploads/audio/demo-track.mp3"
              value={completeForm.storageKey}
              onChange={(event) =>
                setCompleteForm((prev) => ({ ...prev, storageKey: event.target.value }))
              }
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="completeMime">
              MIME
            </label>
            <input
              id="completeMime"
              className={styles.input}
              placeholder="audio/mpeg"
              value={completeForm.mime}
              onChange={(event) =>
                setCompleteForm((prev) => ({ ...prev, mime: event.target.value }))
              }
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="completeSize">
              Размер (байты)
            </label>
            <input
              id="completeSize"
              className={styles.input}
              placeholder="1234567"
              value={completeForm.sizeBytes}
              onChange={(event) =>
                setCompleteForm((prev) => ({ ...prev, sizeBytes: event.target.value }))
              }
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="completeKind">
              Тип
            </label>
            <select
              id="completeKind"
              className={styles.select}
              value={completeForm.kind}
              onChange={(event) =>
                setCompleteForm((prev) => ({
                  ...prev,
                  kind: event.target.value as UploadAssetKind,
                }))
              }
            >
              {uploadKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {translateKind(kind)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.formActions}>
          <button
            className={styles.submitButton}
            disabled={isCompleting}
            onClick={() => {
              void handleComplete();
            }}
            type="button"
          >
            {isCompleting ? "Отправка..." : "Подтвердить загрузку"}
          </button>
          <button
            className={styles.resetButton}
            disabled={isCompleting}
            onClick={() => {
              setCompleteForm(initialCompleteState);
              setCompleteResult(null);
              setCompleteError(null);
            }}
            type="button"
          >
            Сбросить
          </button>
        </div>
        {completeError ? <p className={styles.error}>{completeError}</p> : null}
        {completeResult ? (
          <dl className={styles.resultGrid}>
            <div>
              <dt>ID</dt>
              <dd className={styles.mono}>{completeResult.id}</dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd>{completeResult.status}</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </section>
  );
}

function translateKind(kind: UploadAssetKind): string {
  const map: Record<UploadAssetKind, string> = {
    audio: "Аудио",
    image: "Изображение",
  };
  return map[kind];
}
