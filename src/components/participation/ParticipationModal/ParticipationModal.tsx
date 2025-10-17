"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import modalStyles from "@/components/auth/AuthModal/styles.module.css";
import styles from "./styles.module.css";

export interface ParticipationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const submitLabel = "Отправить заявку";

const inputFields = [
  { name: "fullName", placeholder: "ФИО", autoComplete: "name", type: "text" },
  { name: "nickname", placeholder: "Никнейм", autoComplete: "nickname", type: "text" },
  { name: "city", placeholder: "Город", autoComplete: "address-level2", type: "text" },
  { name: "contacts", placeholder: "Контакты", autoComplete: "tel", type: "text" },
  { name: "email", placeholder: "Почта", autoComplete: "email", type: "email" },
  {
    name: "password",
    placeholder: "Пароль",
    autoComplete: "new-password",
    type: "password",
  },
  { name: "age", placeholder: "Возраст", autoComplete: "off", type: "number", min: 0 },
] as const;

export default function ParticipationModal({ isOpen, onClose }: ParticipationModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const originalOverflow = useRef<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);

    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFormError(null);
      return;
    }
    setFormError(null);
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const termsAccepted = formData.get("termsAcceptance");

    if (!termsAccepted) {
      setFormError("Подтвердите согласие с условиями.");
      return;
    }

    setFormError(null);
    event.currentTarget.reset();
    onClose();
  };

  const formIsProcessing = false;

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
      className={[modalStyles.backdrop, isClosing ? modalStyles.backdropClosing : ""]
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
          <fieldset className={modalStyles.fieldset}>
            {inputFields.map((field) => (
              <input
                key={field.name}
                autoComplete={field.autoComplete}
                className={modalStyles.input}
                name={field.name}
                placeholder={field.placeholder}
                required
                type={field.type}
                {...("min" in field ? { min: field.min } : {})}
              />
            ))}
          </fieldset>

          <div className={styles.inlineButtons}>
            <button
              className={styles.whiteButton}
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Загрузить трек
            </button>
          </div>

          <input
            accept="audio/*"
            className={styles.fileInput}
            onChange={() => {
              /* placeholder for file selection */
            }}
            ref={fileInputRef}
            type="file"
          />

          <input
            className={[modalStyles.input, styles.beatAuthorInput].join(" ")}
            name="beatAuthor"
            placeholder="Автор бита"
            type="text"
          />

          <label className={styles.termsRow}>
            <input className={styles.checkbox} name="termsAcceptance" required type="checkbox" />
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
            <button className={styles.submitButton} disabled={formIsProcessing} type="submit">
              {formIsProcessing ? "Отправка..." : submitLabel}
            </button>
            <button className={styles.secondaryButton} onClick={onClose} type="button">
              Отмена
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}
