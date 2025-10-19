"use client";

import {
  ChangeEvent,
  FormEvent,
  JSX,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { battleRapApi, type SubmitApplicationPayload } from "@/lib/api";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import modalStyles from "@/components/auth/AuthModal/styles.module.css";
import styles from "./styles.module.css";

export interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const submitLabel = "Отправить заявку";

const inputFields = [
  { name: "fullName", placeholder: "ФИО", autoComplete: "name", type: "text" },
  {
    name: "nickname",
    placeholder: "Никнейм",
    autoComplete: "nickname",
    type: "text",
  },
  {
    name: "city",
    placeholder: "Город",
    autoComplete: "address-level2",
    type: "text",
  },
  {
    name: "vkId",
    placeholder: "VK ID",
    autoComplete: "username",
    type: "text",
  },
  {
    name: "age",
    placeholder: "Возраст",
    autoComplete: "off",
    type: "number",
    min: 0,
  },
] as const;

type ParticipationField = (typeof inputFields)[number];
type FieldName = ParticipationField["name"];

const fieldOrder: FieldName[] = [
  "fullName",
  "nickname",
  "city",
  "age",
  "vkId",
] as const;

type UploadStatus = "idle" | "uploading" | "uploaded";

function resolveApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Не удалось выполнить запрос. Попробуйте снова.";
}

export default function ParticipationModal({
  isOpen,
  onClose,
}: ParticipationModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const originalOverflow = useRef<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFormError(null);
      setSelectedAudio(null);
      setUploadStatus("idle");
      setUploadError(null);
      setUploadedAssetId(null);
      setIsSubmitting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setFormError(null);
    setUploadError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    originalOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow.current;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      if (shouldRender) {
        setIsClosing(true);
        const timeoutId = window.setTimeout(() => {
          setShouldRender(false);
          setIsClosing(false);
        }, 200);

        return () => {
          window.clearTimeout(timeoutId);
        };
      }
      return;
    }

    setShouldRender(true);
    setIsClosing(false);

    return () => {};
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedAudio(file);
    setUploadStatus("idle");
    setUploadError(null);
    setUploadedAssetId(null);
  };

  const handleClearFile = () => {
    setSelectedAudio(null);
    setUploadStatus("idle");
    setUploadError(null);
    setUploadedAssetId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadAudio = async (file: File): Promise<string> => {
    if (!token) {
      throw new Error("Авторизуйтесь, чтобы отправить заявку.");
    }
    const mime =
      file.type && file.type.trim().length > 0 ? file.type : "audio/mpeg";
    setUploadError(null);
    setUploadStatus("uploading");

    try {
      const presign = await battleRapApi.media.presignUpload(
        {
          filename: file.name,
          mime,
          sizeBytes: file.size,
          type: "audio",
        },
        { token }
      );

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: presign.headers,
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Не удалось загрузить аудиофайл.");
      }

      const completion = await battleRapApi.media.completeUpload(
        {
          assetId: presign.assetId,
          storageKey: presign.storageKey,
          mime,
          sizeBytes: file.size,
          kind: "audio",
        },
        { token }
      );

      const resolvedId = completion.id ?? presign.assetId;
      setUploadStatus("uploaded");
      setUploadedAssetId(resolvedId);
      return resolvedId;
    } catch (error) {
      setUploadStatus("idle");
      setUploadedAssetId(null);
      const message = resolveApiErrorMessage(error);
      setUploadError(message);
      throw new Error(message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const termsAccepted = formData.get("termsAcceptance");

    if (!termsAccepted) {
      setFormError("Подтвердите согласие с условиями.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    const fullNameRaw = formData.get("fullName");
    const cityRaw = formData.get("city");
    const ageRaw = formData.get("age");
    const vkIdRaw = formData.get("vkId");
    const beatAuthorRaw = formData.get("beatAuthor");

    const payload: SubmitApplicationPayload = {};
    if (typeof fullNameRaw === "string" && fullNameRaw.trim()) {
      payload.fullName = fullNameRaw.trim();
    }
    if (typeof cityRaw === "string" && cityRaw.trim()) {
      payload.city = cityRaw.trim();
    }
    if (typeof vkIdRaw === "string" && vkIdRaw.trim()) {
      payload.vkId = vkIdRaw.trim();
    }
    if (typeof beatAuthorRaw === "string" && beatAuthorRaw.trim()) {
      payload.beatAuthor = beatAuthorRaw.trim();
    }
    if (typeof ageRaw === "string" && ageRaw.trim()) {
      const parsedAge = Number(ageRaw);
      if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
        setFormError("Укажите корректный возраст.");
        return;
      }
      payload.age = parsedAge;
    }

    if (!token) {
      setFormError("Авторизуйтесь, чтобы отправить заявку.");
      return;
    }

    setFormError(null);
    setUploadError(null);
    setIsSubmitting(true);

    try {
      let audioId: string | undefined;
      if (selectedAudio) {
        if (uploadStatus === "uploaded" && uploadedAssetId) {
          audioId = uploadedAssetId;
        } else {
          audioId = await uploadAudio(selectedAudio);
        }
      }

      const submissionPayload: SubmitApplicationPayload = {
        ...payload,
        audioId,
      };

      await battleRapApi.artist.submitApplication(submissionPayload, { token });
      event.currentTarget.reset();
      handleClearFile();
      onClose();
    } catch (error) {
      setFormError(resolveApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formIsProcessing = isSubmitting || uploadStatus === "uploading";

  const renderInputField = (
    field: ParticipationField | undefined,
    extraClassName?: string,
    keyOverride?: string
  ) => {
    if (!field) {
      return null;
    }

    return (
      <input
        key={keyOverride ?? field.name}
        autoComplete={field.autoComplete}
        className={[modalStyles.input, extraClassName ?? ""]
          .filter(Boolean)
          .join(" ")}
        name={field.name}
        placeholder={field.placeholder}
        required
        disabled={formIsProcessing}
        type={field.type}
        {...("min" in field ? { min: field.min } : {})}
      />
    );
  };

  const formFields = fieldOrder.reduce<JSX.Element[]>((elements, fieldName) => {
    if (fieldName === "city") {
      const cityField = inputFields.find((field) => field.name === "city");
      const ageField = inputFields.find((field) => field.name === "age");

      elements.push(
        <div className={styles.inlineFieldRow} key="city-age-row">
          {renderInputField(cityField, styles.inlineInput, "city")}
          {renderInputField(ageField, styles.inlineInput, "age")}
        </div>
      );

      return elements;
    }

    if (fieldName === "age") {
      return elements;
    }

    const field = inputFields.find(
      (currentField) => currentField.name === fieldName
    );
    const renderedField = renderInputField(field);

    if (renderedField) {
      elements.push(renderedField);
    }

    return elements;
  }, []);

  const modalClassNames = useMemo(() => {
    return [
      modalStyles.modal,
      isClosing ? modalStyles.modalClosing : "",
      styles.modalContent,
    ]
      .filter(Boolean)
      .join(" ");
  }, [isClosing]);

  if (!isMounted || !shouldRender) {
    return null;
  }

  return createPortal(
    <div
      className={[
        modalStyles.backdrop,
        isClosing ? modalStyles.backdropClosing : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-component="participation-modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <section
        aria-labelledby="participation-modal-title"
        aria-modal="true"
        className={modalClassNames}
        role="dialog"
      >
        <header className={styles.header}>
          <h2 className={styles.title} id="participation-modal-title">
            Заявка на участие
          </h2>
          <button
            aria-label="Закрыть окно заявки"
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset className={modalStyles.fieldset}>{formFields}</fieldset>

          <div className={styles.inlineButtons}>
            <button
              className={styles.whiteButton}
              disabled={formIsProcessing}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              {selectedAudio ? "Сменить трек" : "Загрузить трек"}
            </button>

            <input
              className={[modalStyles.input, styles.beatAuthorInline].join(" ")}
              disabled={formIsProcessing}
              name="beatAuthor"
              placeholder="Автор бита"
              type="text"
            />
          </div>

          <input
            accept="audio/*"
            className={styles.fileInput}
            disabled={formIsProcessing}
            onChange={handleFileSelect}
            ref={fileInputRef}
            type="file"
          />

          {selectedAudio ? (
            <div className={styles.fileInfoRow}>
              <span className={styles.fileName}>{selectedAudio.name}</span>
              <span className={styles.fileStatus}>
                {uploadStatus === "uploading"
                  ? "Загрузка..."
                  : uploadStatus === "uploaded"
                  ? "Файл загружен"
                  : `${(selectedAudio.size / (1024 * 1024)).toFixed(1)} МБ`}
              </span>
              <button
                className={styles.removeFileButton}
                disabled={formIsProcessing}
                onClick={handleClearFile}
                type="button"
              >
                Удалить
              </button>
            </div>
          ) : null}

          {uploadError ? (
            <p className={styles.formError} aria-live="assertive">
              {uploadError}
            </p>
          ) : null}

          <label className={styles.termsRow}>
            <input
              className={styles.checkbox}
              disabled={formIsProcessing}
              name="termsAcceptance"
              required
              type="checkbox"
            />
            <span className={styles.termsText}>
              Согласен с{" "}
              <a className={modalStyles.registerLink} href="/terms">
                условиями
              </a>
            </span>
          </label>

          {formError ? (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          ) : null}

          <div className={styles.actions}>
            <button
              className={styles.submitButton}
              disabled={formIsProcessing}
              type="submit"
            >
              {formIsProcessing ? "Отправка..." : submitLabel}
            </button>
            <button
              className={styles.secondaryButton}
              onClick={onClose}
              type="button"
            >
              Отмена
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
  );
}
