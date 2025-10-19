"use client";

import { useEffect, useState } from "react";
import AuthModal, {
  type AuthMode,
} from "@/components/auth/AuthModal/AuthModal";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import ParticipationModal from "@/components/participation/ParticipationModal";
import styles from "./styles.module.css";

export default function HeroSection() {
  const marqueeText =
    "БАТТЛ • ПРОЕКТ • ХИП-ХОП.РУ • НОВЫЕ ИМЕНА • СТАРИЧКИ • РИФМЫ • ПАНЧЛАЙНЫ • БАТТЛ • ПРОЕКТ • ХИП-ХОП.РУ • НОВЫЕ ИМЕНА • СТАРИЧКИ • РИФМЫ • БАТТЛ • ПРОЕКТ • ХИП-ХОП.РУ • НОВЫЕ ИМЕНА •";
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

  const handleParticipationClick = () => {
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
    <section id="hero-section" className={styles.root}>
      <div className={styles.content + " " + "content-width"}>
        <button
          className={styles.participate}
          onClick={handleParticipationClick}
          type="button"
        >
          Принять участие
        </button>
        <div className={styles.heading}>
          <h1 className={styles.title}>Battle hip-hop.ru</h1>
          <h2 className={styles.subTitle}>Независимый</h2>
        </div>
      </div>
      <div className={styles.marquee}>
        <div className={styles.marqueeTrack}>
          <span>{marqueeText}</span>
          <span aria-hidden="true">{marqueeText}</span>
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
