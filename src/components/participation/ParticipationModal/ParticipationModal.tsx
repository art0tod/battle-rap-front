"use client";

import {
  FormEvent,
  JSX,
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
  { name: "email", placeholder: "Почта", autoComplete: "email", type: "email" },
  {
    name: "password",
    placeholder: "Пароль",
    autoComplete: "new-password",
    type: "password",
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
  "email",
  "password",
] as const;

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
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              Загрузить трек
            </button>

            <input
              className={[modalStyles.input, styles.beatAuthorInline].join(" ")}
              name="beatAuthor"
              placeholder="Автор бита"
              type="text"
            />
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

          <label className={styles.termsRow}>
            <input
              className={styles.checkbox}
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
