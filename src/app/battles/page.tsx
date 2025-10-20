"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  battleRapApi,
  type PublicBattle,
  type PublicBattleParticipant,
} from "@/lib/api";
import { getMatchStatusMeta, type MatchStatus } from "@/lib/statuses";
import styles from "./page.module.css";

type BattleSection = "current" | "finished";

interface SectionState {
  battles: PublicBattle[];
  isLoading: boolean;
  error: string | null;
}

const sectionLabels: Record<
  BattleSection,
  { title: string; subtitle: string }
> = {
  current: {
    title: "Идущие баттлы",
    subtitle:
      "Матчи, которые проходят прямо сейчас или ожидают вердиктов судей",
  },
  finished: {
    title: "Завершённые баттлы",
    subtitle: "Матчи с опубликованными результатами и доступными треками",
  },
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatScore(value?: number | null) {
  if (value === null || value === undefined) {
    return "—";
  }
  return value.toFixed(1);
}

const FINISHED_STATUSES = new Set<MatchStatus>(["finished", "tie"]);

function getStatusToneClass(
  tone: ReturnType<typeof getMatchStatusMeta>["tone"],
): string {
  if (tone === "upcoming") {
    return styles.statusUpcoming;
  }
  if (tone === "finished") {
    return styles.statusFinished;
  }
  if (tone === "cancelled") {
    return styles.statusCancelled;
  }
  return styles.statusProgress;
}

function ParticipantCard({
  participant,
  align,
}: {
  participant: PublicBattleParticipant | undefined;
  align: "left" | "right";
}) {
  if (!participant) {
    return (
      <div
        className={`${styles.fighterCard} ${
          align === "right" ? styles.fighterCardRight : ""
        }`}
      >
        <div className={styles.fighterPlaceholder}>Слот участника свободен</div>
      </div>
    );
  }

  const cityLabel = participant.city?.trim()
    ? participant.city
    : "Город неизвестен";
  const ageLabel = participant.age
    ? `${participant.age} лет`
    : "Возраст не указан";
  const trackStatus = participant.track
    ? "Трек загружен"
    : "Трек ещё не загружен";
  const likes =
    participant.track && typeof participant.track.likes === "number"
      ? participant.track.likes
      : 0;
  const audioUrl = participant.track?.audioUrl ?? null;
  const initials =
    participant.displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => token[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "MC";

  return (
    <div
      className={`${styles.fighterCard} ${
        align === "right" ? styles.fighterCardRight : ""
      }`}
    >
      <div className={styles.fighterHeader}>
        {/* <div className={styles.avatarWrapper}>
          
          {participant.avatar?.url ? (
            <Image
              src={participant.avatar.url}
              alt={`Аватар ${participant.displayName}`}
              width={88}
              height={88}
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarFallback}>{initials}</span>
          )}
      
        </div> */}
        <div className={styles.fighterIdentity}>
          <p className={styles.fighterName}>{participant.displayName}</p>
          <p className={styles.fighterMeta}>
            {cityLabel}
            <span className={styles.metaDivider}>·</span>
            {ageLabel}
          </p>
        </div>
      </div>
      <ul className={styles.fighterStats}>
        <li>
          <span className={styles.statLabel}>Лайки</span>
          <span className={styles.statValue}>{likes}</span>
        </li>
        <li>
          <span className={styles.statLabel}>Средний балл</span>
          <span className={styles.statValue}>
            {formatScore(participant.avgTotalScore)}
          </span>
        </li>
        <li>
          <span className={styles.statLabel}>Статус</span>
          <span className={styles.statValue}>{trackStatus}</span>
        </li>
      </ul>
      <div className={styles.fighterActions}>
        {audioUrl ? (
          <a
            className={styles.listenButton}
            href={audioUrl}
            target="_blank"
            rel="noreferrer"
          >
            Слушать
          </a>
        ) : (
          <button
            className={`${styles.listenButton} ${styles.listenButtonDisabled}`}
            disabled
          >
            Трек в пути
          </button>
        )}
      </div>
    </div>
  );
}

export default function PublicBattlesPage() {
  const [current, setCurrent] = useState<SectionState>({
    battles: [],
    isLoading: true,
    error: null,
  });
  const [finished, setFinished] = useState<SectionState>({
    battles: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;

    const load = async (section: BattleSection) => {
      const setState = section === "current" ? setCurrent : setFinished;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await battleRapApi.publicBattles.list({
          status: section,
          limit: section === "current" ? 12 : 24,
        });
        if (isCancelled) {
          return;
        }
        setState({ battles: response.battles, isLoading: false, error: null });
      } catch (error) {
        if (isCancelled) {
          return;
        }
        setState({
          battles: [],
          isLoading: false,
          error: resolveErrorMessage(error),
        });
      }
    };

    void load("current");
    void load("finished");

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <main className={`content-width ${styles.root}`}>
      <section className={styles.header}>
        <h1 className={styles.title}>Баттлы проекта</h1>
        <p className={styles.description}>
          Следите за ключевыми матчами турнира: здесь собраны идущие раунды и
          баттлы, которые уже завершились. Для завершённых матчей доступны
          результаты и усреднённые оценки судей, а после окончания судейства
          можно послушать опубликованные треки участников.
        </p>
      </section>

      <section className={styles.sections}>
        <BattleSectionBlock label="current" state={current} />
        <BattleSectionBlock label="finished" state={finished} />
      </section>
    </main>
  );
}

function BattleSectionBlock({
  label,
  state,
}: {
  label: BattleSection;
  state: SectionState;
}) {
  const section = sectionLabels[label];

  return (
    <div>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <p className={styles.sectionSubtitle}>{section.subtitle}</p>
        </div>
        {state.isLoading ? (
          <span className={styles.loading}>Загружаем…</span>
        ) : null}
      </header>

      {state.error ? (
        <div className={styles.error}>{state.error}</div>
      ) : state.battles.length === 0 && !state.isLoading ? (
        <div className={styles.emptyState}>
          Пока нет баттлов в этой категории. Загляните позже!
        </div>
      ) : (
        <div className={styles.battleGrid}>
          {state.battles.map((battle) => {
            const [left, right] = battle.participants;
            const statusMeta = getMatchStatusMeta(battle.status);
            const toneClass = getStatusToneClass(statusMeta.tone);
            const isFinished = FINISHED_STATUSES.has(battle.status);

            return (
              <article key={battle.id} className={styles.battleCard}>
                <header className={styles.matchTop}>
                  <div className={styles.matchContext}>
                    <span className={styles.tournamentTitle}>
                      {battle.tournament.title}
                    </span>
                    <span className={styles.roundMeta}>
                      Раунд {battle.round.number} · {battle.round.kind}
                    </span>
                  </div>
                  <span className={`${styles.statusBadge} ${toneClass}`}>
                    {statusMeta.label}
                  </span>
                </header>

                <div className={styles.matchBody}>
                  <ParticipantCard participant={left} align="left" />
                  <div className={styles.matchCenter}>
                    <span className={styles.vsLabel}>VS</span>
                    {isFinished ? (
                      <div className={styles.scoreboard}>
                        <span className={styles.scoreValue}>
                          {formatScore(left?.avgTotalScore)}
                        </span>
                        <span className={styles.scoreDivider}>:</span>
                        <span className={styles.scoreValue}>
                          {formatScore(right?.avgTotalScore)}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.centerStatus}>
                        {statusMeta.label}
                      </span>
                    )}
                    <div className={styles.centerMeta}>
                      <span>Старт: {formatDate(battle.startsAt)}</span>
                      {isFinished && battle.endsAt ? (
                        <span>Финиш: {formatDate(battle.endsAt)}</span>
                      ) : null}
                    </div>
                  </div>
                  <ParticipantCard participant={right} align="right" />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Не удалось загрузить список баттлов.";
}
