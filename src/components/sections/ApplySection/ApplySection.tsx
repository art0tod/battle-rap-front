"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthModal, {
  type AuthMode,
} from "@/components/auth/AuthModal/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import ParticipationModal from "@/components/participation/ParticipationModal";
import styles from "./styles.module.css";

export default function ApplySection() {
  const [isParticipationOpen, setIsParticipationOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [shouldOpenAfterAuth, setShouldOpenAfterAuth] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      return;
    }
    if (isAuthModalOpen) {
      setIsAuthModalOpen(false);
    }
    if (shouldOpenAfterAuth) {
      setIsParticipationOpen(true);
      setShouldOpenAfterAuth(false);
    }
  }, [user, isAuthModalOpen, shouldOpenAfterAuth]);

  const handleApplyClick = () => {
    if (!user) {
      setAuthMode("signIn");
      setIsAuthModalOpen(true);
      setShouldOpenAfterAuth(true);
      return;
    }
    setIsParticipationOpen(true);
  };

  const handleCloseParticipation = () => {
    setIsParticipationOpen(false);
    setShouldOpenAfterAuth(false);
  };

  const handleCloseAuth = () => {
    setIsAuthModalOpen(false);
    setShouldOpenAfterAuth(false);
  };

  return (
    <section className={styles.root}>
      <div className={styles.content + " " + "content-width"}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Подай заявку!</h2>
          <h3 className={styles.subtitle}>Хочешь на сцену?</h3>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.primaryAction}
            onClick={handleApplyClick}
            type="button"
          >
            Принять участие
          </button>
          <Link className={styles.secondaryAction} href="/rules">
            Узнать правила
          </Link>
        </div>
      </div>
      <ParticipationModal
        isOpen={isParticipationOpen}
        onClose={handleCloseParticipation}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        mode={authMode}
        onClose={handleCloseAuth}
        onModeChange={setAuthMode}
      />
    </section>
  );
}
