"use client";

import {
  FormEvent,
  useEffect,
  useState,
  useMemo,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import styles from "./styles.module.css";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";

export type AuthMode = "signIn" | "signUp";

export interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}

const modeLabels: Record<AuthMode, string> = {
  signIn: "Вход",
  signUp: "Регистрация",
};

export default function AuthModal({
  isOpen,
  mode,
  onClose,
  onModeChange,
}: AuthModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, register, isProcessing } = useAuth();

  const submitLabel = useMemo(() => modeLabels[mode], [mode]);

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
  }, [mode, isOpen]);

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

  if (!isMounted || !isOpen) {
    return null;
  }

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setFormError("Введите почту и пароль.");
      return;
    }

    if (mode === "signUp") {
      const displayName = String(formData.get("displayName") ?? "").trim();
      const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

      if (!displayName) {
        setFormError("Укажите отображаемое имя.");
        return;
      }

      if (password !== passwordConfirmation) {
        setFormError("Пароли не совпадают.");
        return;
      }

      try {
        await register({ email, password, displayName });
        event.currentTarget.reset();
        onClose();
        return;
      } catch (error) {
        if (error instanceof Error) {
          setFormError(error.message);
          return;
        }
        setFormError("Не удалось завершить регистрацию. Попробуйте позже.");
        return;
      }
    }

    try {
      await login({ email, password });
      event.currentTarget.reset();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
        return;
      }
      setFormError("Не удалось войти. Попробуйте позже.");
    }
  };

  return createPortal(
    <div
      className={styles.backdrop}
      data-component="auth-modal-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <section
        className={styles.modal}
        aria-labelledby="auth-modal-title"
        aria-modal="true"
        role="dialog"
      >
        <header>
          <h2 id="auth-modal-title">{modeLabels[mode]}</h2>
          <button
            aria-label="Закрыть окно авторизации"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>

        <div>
          <nav aria-label="Переключение форм">
            {(
              Object.entries(modeLabels) as Array<[AuthMode, string]>
            ).map(([currentMode, label]) => (
              <button
                aria-pressed={mode === currentMode}
                key={currentMode}
                onClick={() => onModeChange(currentMode)}
                type="button"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>{modeLabels[mode]}</legend>

            <label>
              Электронная почта
              <input autoComplete="email" name="email" required type="email" />
            </label>

            {mode === "signUp" ? (
              <label>
                Отображаемое имя
                <input name="displayName" required type="text" />
              </label>
            ) : null}

            <label>
              Пароль
              <input
                autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                name="password"
                required
                type="password"
              />
            </label>

            {mode === "signUp" ? (
              <label>
                Повторите пароль
                <input
                  autoComplete="new-password"
                  name="passwordConfirmation"
                  required
                  type="password"
                />
              </label>
            ) : null}
          </fieldset>

          {formError ? <p role="alert">{formError}</p> : null}

          <footer>
            <button disabled={isProcessing} type="submit">
              {isProcessing ? "Загрузка..." : submitLabel}
            </button>
          </footer>
        </form>
      </section>
    </div>,
    document.body,
  );
}
