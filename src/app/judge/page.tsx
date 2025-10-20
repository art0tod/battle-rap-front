"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ApiError, battleRapApi } from "@/lib/api";
import type {
  JudgeAssignment,
  JudgeAssignmentStatus,
  JudgeAssignmentStatusPayload,
  JudgeBattleDetails,
  JudgeRubricCriterion,
  JudgeScorePayload,
} from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import styles from "./page.module.css";

type RubricState = Record<string, number>;

const STATUS_STYLES: Record<JudgeAssignmentStatus, { label: string; className: string }> = {
  assigned: { label: "Назначен", className: styles.badgeAssigned },
  completed: { label: "Готово", className: styles.badgeCompleted },
  skipped: { label: "Пропущен", className: styles.badgeSkipped },
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function initializeRubricScores(rubric: JudgeRubricCriterion[], source?: RubricState | null) {
  const nextState: RubricState = {};
  rubric.forEach((criterion) => {
    const key = criterion.key;
    if (source && source[key] !== undefined) {
      nextState[key] = source[key];
    }
  });
  return nextState;
}

function resolveApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "Доступ разрешён только судьям.";
    }
    return error.message || "Не удалось выполнить запрос. Попробуйте позже.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Не удалось выполнить запрос. Попробуйте позже.";
}

export default function JudgeDashboardPage() {
  const { token, user } = useAuth();
  const isAuthenticated = Boolean(token);
  const isJudge = useMemo(() => Boolean(user?.roles.includes("judge")), [user]);

  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [battleDetails, setBattleDetails] = useState<JudgeBattleDetails | null>(null);
  const [battleError, setBattleError] = useState<string | null>(null);
  const [isLoadingBattle, setIsLoadingBattle] = useState(false);

  const [score, setScore] = useState<number | undefined>(undefined);
  const [passDecision, setPassDecision] = useState<boolean | undefined>(undefined);
  const [rubricScores, setRubricScores] = useState<RubricState>({});
  const [comment, setComment] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const selectedAssignment = useMemo(
    () => assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null,
    [assignments, selectedAssignmentId],
  );

  const loadAssignments = useCallback(async () => {
    if (!token) {
      setAssignments([]);
      setSelectedAssignmentId(null);
      setAssignmentsError(null);
      return;
    }
    if (!isJudge) {
      setAssignments([]);
      setSelectedAssignmentId(null);
      setAssignmentsError("Доступ разрешён только судьям.");
      return;
    }
    setIsLoadingAssignments(true);
    setAssignmentsError(null);
    try {
      const list = await battleRapApi.judge.listAssignments({ token });
      setAssignments(list);
      if (selectedAssignmentId && !list.some((item) => item.id === selectedAssignmentId)) {
        setSelectedAssignmentId(list[0]?.id ?? null);
      } else if (!selectedAssignmentId && list.length > 0) {
        setSelectedAssignmentId(list[0].id);
      }
    } catch (error) {
      setAssignmentsError(resolveApiErrorMessage(error));
    } finally {
      setIsLoadingAssignments(false);
    }
  }, [token, isJudge, selectedAssignmentId]);

  const loadBattleDetails = useCallback(
    async (assignment: JudgeAssignment | null) => {
      if (!assignment || !token || !isJudge) {
        setBattleDetails(null);
        if (!token || !isJudge) {
          setBattleError(null);
        }
        return;
      }
      setIsLoadingBattle(true);
      setBattleError(null);
      try {
        const details = await battleRapApi.judge.getBattleDetails(assignment.matchId, { token });
        setBattleDetails(details);
        setScore(details.evaluation?.score ?? undefined);
        setPassDecision(
          details.evaluation?.pass === null || details.evaluation?.pass === undefined
            ? undefined
            : Boolean(details.evaluation.pass),
        );
        setRubricScores(initializeRubricScores(details.rubric, details.evaluation?.rubric ?? null));
        setComment(details.evaluation?.comment ?? "");
      } catch (error) {
        setBattleDetails(null);
        setBattleError(resolveApiErrorMessage(error));
      } finally {
        setIsLoadingBattle(false);
      }
    },
    [token, isJudge],
  );

  useEffect(() => {
    if (!token) {
      setAssignments([]);
      setSelectedAssignmentId(null);
      setAssignmentsError(null);
      return;
    }
    void loadAssignments();
  }, [token, loadAssignments]);

  useEffect(() => {
    if (!selectedAssignment) {
      setBattleDetails(null);
      setBattleError(null);
      return;
    }
    void loadBattleDetails(selectedAssignment);
  }, [selectedAssignment, loadBattleDetails]);

  const requestRandomAssignment = useCallback(async () => {
    if (!token) {
      setActionMessage("Требуется авторизация.");
      return;
    }
    if (!isJudge) {
      setActionMessage("Доступно только судьям.");
      return;
    }
    setActionMessage(null);
    try {
      const result = await battleRapApi.judge.requestRandomAssignment({ token });
      if (!result) {
        setActionMessage("Нет баттлов, доступных для назначения.");
      } else {
        await loadAssignments();
        setSelectedAssignmentId(result.id);
        setActionMessage("Назначен новый баттл. Удачной оценки!");
      }
    } catch (error) {
      setActionMessage(resolveApiErrorMessage(error));
    }
  }, [token, isJudge, loadAssignments]);

  const updateAssignmentStatus = useCallback(
    async (status: JudgeAssignmentStatusPayload["status"]) => {
      if (!token) {
        setActionMessage("Требуется авторизация.");
        return;
      }
      if (!isJudge) {
        setActionMessage("Доступно только судьям.");
        return;
      }
      if (!selectedAssignment) {
        setActionMessage("Нужно выбрать баттл.");
        return;
      }
      setActionMessage(null);
      try {
        await battleRapApi.judge.updateAssignmentStatus(
          selectedAssignment.id,
          { status },
          { token },
        );
        await loadAssignments();
        setActionMessage(
          status === "completed"
            ? "Баттл отмечен как завершённый."
            : "Баттл пропущен. Можно запросить следующий.",
        );
      } catch (error) {
        setActionMessage(resolveApiErrorMessage(error));
      }
    },
    [selectedAssignment, token, isJudge, loadAssignments],
  );

  const handleSubmitEvaluation = useCallback(async () => {
    if (!token) {
      setActionMessage("Требуется авторизация.");
      return;
    }
    if (!isJudge) {
      setActionMessage("Доступно только судьям.");
      return;
    }
    if (!selectedAssignment) {
      setActionMessage("Требуется выбрать баттл.");
      return;
    }
    if (
      score === undefined &&
      passDecision === undefined &&
      Object.keys(rubricScores).length === 0 &&
      comment.trim().length === 0
    ) {
      setActionMessage("Нужно заполнить хотя бы одно поле оценки.");
      return;
    }
    setActionMessage(null);
    try {
      const payload: JudgeScorePayload = {
        score,
        pass: passDecision,
        rubric: Object.keys(rubricScores).length > 0 ? rubricScores : undefined,
        comment: comment.trim() || undefined,
      };
      await battleRapApi.judge.submitBattleScore(selectedAssignment.matchId, payload, { token });
      setActionMessage("Оценка сохранена.");
    } catch (error) {
      setActionMessage(resolveApiErrorMessage(error));
    }
  }, [token, isJudge, selectedAssignment, score, passDecision, rubricScores, comment]);

  const handleRubricChange = useCallback((key: string, value: number) => {
    setRubricScores((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  if (!isAuthenticated) {
    return (
      <main className={`content-width ${styles.fallback}`}>
        <section className={styles.fallbackCard}>
          <h1 className={styles.introTitle}>Судейская панель</h1>
          <p className={styles.fallbackText}>
            Чтобы открыть панель, войдите под аккаунтом судьи. Используйте кнопку «Войти» в верхнем
            меню — после авторизации здесь появятся назначения и материалы для оценки.
          </p>
        </section>
      </main>
    );
  }

  if (!isJudge) {
    return (
      <main className={`content-width ${styles.fallback}`}>
        <section className={styles.fallbackCard}>
          <h1 className={styles.introTitle}>Судейская панель</h1>
          <p className={styles.fallbackText}>
            Ваш аккаунт авторизован, но роль судьи ещё не выдана. Попросите модератора или
            администратора добавить вас в состав судей — после обновления страницы панель станет
            доступна.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={`content-width ${styles.root}`}>
      <section className={styles.intro}>
        <div>
          <h1 className={styles.introTitle}>Судейская панель</h1>
          <p className={styles.introDescription}>
            Привет{user ? `, ${user.displayName}` : ""}! Здесь можно запросить новый баттл, увидеть
            материалы участников и выставить оценку по критериям раунда. Следите за дедлайном, чтобы
            ваши вердикты попали в итоговый протокол.
          </p>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => {
              void requestRandomAssignment();
            }}
          >
            Получить баттл
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            disabled={isLoadingAssignments}
            onClick={() => {
              void loadAssignments();
            }}
          >
            Обновить список
          </button>
          {selectedAssignment ? (
            <>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => {
                  void updateAssignmentStatus("skipped");
                }}
              >
                Пропустить
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={() => {
                  void updateAssignmentStatus("completed");
                }}
              >
                Завершено
              </button>
            </>
          ) : null}
        </div>
        {actionMessage ? <p className={styles.actionMessage}>{actionMessage}</p> : null}
      </section>

      <div className={styles.layout}>
        <section className={styles.panel}>
          <header className={styles.panelHeader}>
            <h2 className={styles.sectionTitle}>Мои назначения</h2>
            {isLoadingAssignments ? <span className={styles.loading}>Обновляем…</span> : null}
          </header>
          {assignmentsError ? (
            <p className={styles.errorMessage}>{assignmentsError}</p>
          ) : assignments.length === 0 ? (
            <p className={styles.empty}>Нет активных назначений. Запросите новый баттл.</p>
          ) : (
            <ul className={styles.assignmentList}>
              {assignments.map((assignment) => {
                const statusMeta = STATUS_STYLES[assignment.status];
                const isActive = assignment.id === selectedAssignmentId;
                return (
                  <li key={assignment.id}>
                    <button
                      type="button"
                      className={`${styles.assignmentItem}${isActive ? ` ${styles.assignmentItemActive}` : ""}`}
                      onClick={() => {
                        setSelectedAssignmentId(assignment.id);
                      }}
                    >
                      <div className={styles.assignmentHeading}>
                        <span>Матч {assignment.matchId.slice(0, 8)}</span>
                        <span className={`${styles.badge} ${statusMeta.className}`}>{statusMeta.label}</span>
                      </div>
                      <div className={styles.assignmentMeta}>
                        <span>Раунд {assignment.roundNumber ?? "?"}</span>
                        {assignment.roundKind ? <span>{assignment.roundKind}</span> : null}
                        {assignment.roundStrategy ? <span>{assignment.roundStrategy}</span> : null}
                      </div>
                      <div className={styles.assignmentMeta}>
                        <span>
                          <strong>Старт:</strong> {formatDateTime(assignment.startsAt)}
                        </span>
                        <span>
                          <strong>Судейство до:</strong> {formatDateTime(assignment.judgingDeadlineAt)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Детали баттла</h2>
              {battleDetails ? (
                <p className={styles.mutedSmall}>
                  Раунд {battleDetails.match.round.number} • {battleDetails.match.round.kind}
                </p>
              ) : null}
            </div>
            {isLoadingBattle && selectedAssignment ? <span className={styles.loading}>Загружаем…</span> : null}
          </header>

          {battleError ? (
            <p className={styles.errorMessage}>{battleError}</p>
          ) : !selectedAssignment ? (
            <p className={styles.empty}>Выберите баттл, чтобы увидеть подробности.</p>
          ) : !battleDetails ? (
            <p className={styles.empty}>Нет данных для выбранного баттла.</p>
          ) : (
            <>
              <div className={styles.timeline}>
                <span>
                  <strong>Статус матча:</strong> {battleDetails.match.status}
                </span>
                <span>
                  <strong>Старт:</strong> {formatDateTime(battleDetails.match.startsAt)}
                </span>
                <span>
                  <strong>Дедлайн судейства:</strong> {formatDateTime(battleDetails.match.round.judgingDeadlineAt)}
                </span>
                <span>
                  <strong>Система оценивания:</strong> {battleDetails.match.round.scoring}
                </span>
                {battleDetails.match.round.strategy ? (
                  <span>
                    <strong>Стратегия:</strong> {battleDetails.match.round.strategy}
                  </span>
                ) : null}
              </div>

              <div>
                <h3 className={styles.subSectionTitle}>Участники</h3>
                <div className={styles.participants}>
                  {battleDetails.participants.map((participant) => (
                    <article key={participant.participantId} className={styles.participantCard}>
                      <div className={styles.participantHeader}>
                        <strong>{participant.displayName}</strong>
                        {participant.seed !== null && participant.seed !== undefined ? (
                          <span className={styles.mutedSmall}>Посев {participant.seed}</span>
                        ) : null}
                      </div>
                      <div className={styles.participantMeta}>
                        <span>
                          Средний балл:{" "}
                          {participant.avgTotalScore !== null && participant.avgTotalScore !== undefined
                            ? participant.avgTotalScore.toFixed(1)
                            : "—"}
                        </span>
                      </div>
                      {participant.track ? (
                        <>
                          {participant.track.audioUrl ? (
                            <audio controls className={styles.audioPlayer} src={participant.track.audioUrl}>
                              Ваш браузер не поддерживает воспроизведение аудио.
                            </audio>
                          ) : (
                            <p className={styles.mutedSmall}>Аудио недоступно.</p>
                          )}
                          {participant.track.lyrics ? (
                            <div className={styles.lyrics}>{participant.track.lyrics}</div>
                          ) : null}
                        </>
                      ) : (
                        <p className={styles.mutedSmall}>Трек ещё не загружен.</p>
                      )}
                    </article>
                  ))}
                </div>
              </div>

              <div className={styles.formSection}>
                <h3 className={styles.subSectionTitle}>Выставить оценку</h3>
                <div className={styles.formGrid}>
                  <label className={styles.label}>
                    <span>Баллы (0-100)</span>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      max={100}
                      value={score ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        setScore(value === "" ? undefined : Number(value));
                      }}
                    />
                  </label>
                  <label className={styles.label}>
                    <span>Прошёл дальше</span>
                    <select
                      className={styles.select}
                      value={passDecision === undefined ? "" : passDecision ? "true" : "false"}
                      onChange={(event) => {
                        const value = event.target.value;
                        setPassDecision(value === "" ? undefined : value === "true");
                      }}
                    >
                      <option value="">Не указано</option>
                      <option value="true">Да</option>
                      <option value="false">Нет</option>
                    </select>
                  </label>
                  {battleDetails.rubric.length > 0 ? (
                    <div>
                      <p className={styles.mutedSmall}>Критерии</p>
                      <div className={styles.rubricGrid}>
                        {battleDetails.rubric.map((criterion) => (
                          <label key={criterion.key} className={styles.label}>
                            <span>
                              {criterion.name}
                              {criterion.maxValue ? ` (0–${criterion.maxValue})` : ""}
                            </span>
                            <input
                              className={styles.input}
                              type="number"
                              min={criterion.minValue ?? 0}
                              max={criterion.maxValue ?? undefined}
                              value={rubricScores[criterion.key] ?? ""}
                              onChange={(event) => {
                                const value = event.target.value;
                                if (value === "") {
                                  setRubricScores((prev) => {
                                    const { [criterion.key]: _removed, ...rest } = prev;
                                    return rest;
                                  });
                                } else {
                                  handleRubricChange(criterion.key, Number(value));
                                }
                              }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <label className={styles.label}>
                    <span>Комментарий</span>
                    <textarea
                      className={styles.textarea}
                      rows={4}
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      placeholder="Расскажите об аргументации оценки..."
                    />
                  </label>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    onClick={() => {
                      void handleSubmitEvaluation();
                    }}
                  >
                    Сохранить оценку
                  </button>
                </div>
                {battleDetails.match.round.judgingDeadlineAt ? (
                  <p className={styles.footerNote}>
                    Помните: после {formatDateTime(battleDetails.match.round.judgingDeadlineAt)} судейство закрывается
                    автоматически.
                  </p>
                ) : null}
              </div>
            </>
          )}
        </section>
      </div>
      <p className={styles.footerNote}>
        Нужна помощь? Напишите модераторам или загляните в{" "}
        <Link href="/admin">админ-панель</Link> для уточнения назначений.
      </p>
    </main>
  );
}
