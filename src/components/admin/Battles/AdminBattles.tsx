"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  battleRapApi,
  type AdminBattle,
  type AdminBattleParticipantInput,
  type CreateAdminBattlePayload,
  type UpdateAdminBattlePayload,
} from "@/lib/api";
import {
  DEFAULT_MATCH_STATUS,
  MATCH_STATUSES,
  getMatchStatusMeta,
  type MatchStatus,
} from "@/lib/statuses";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import { resolveApiErrorMessage } from "../utils";
import styles from "./styles.module.css";

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatParticipantsSummary(participants: AdminBattle["participants"]) {
  if (!participants.length) {
    return "Участники не назначены";
  }
  return participants
    .map((participant) => {
      const base = participant.displayName;
      const seed = participant.seed !== null && participant.seed !== undefined ? `#${participant.seed}` : null;
      return seed ? `${base} (${seed})` : base;
    })
    .join(", ");
}

function toInputDateValue(value?: string | null) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const iso = date.toISOString();
  return iso.slice(0, 16);
}

function fromInputDateValue(value: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

interface BattleEditorProps {
  mode: "create" | "edit";
  initialBattle?: AdminBattle;
  onSubmit: (payload: CreateAdminBattlePayload | UpdateAdminBattlePayload) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface ParticipantDraft {
  participantId: string;
  seed: string;
}

function createDefaultParticipantDraft(): ParticipantDraft {
  return { participantId: "", seed: "" };
}

function BattleEditor({ mode, initialBattle, onSubmit, onCancel, isSubmitting }: BattleEditorProps) {
  const [roundId, setRoundId] = useState(() => initialBattle?.roundId ?? "");
  const [status, setStatus] = useState<MatchStatus>(
    () => initialBattle?.status ?? DEFAULT_MATCH_STATUS,
  );
  const [startsAt, setStartsAt] = useState(() => toInputDateValue(initialBattle?.startsAt));
  const [endsAt, setEndsAt] = useState(() => toInputDateValue(initialBattle?.endsAt));
  const [participants, setParticipants] = useState<ParticipantDraft[]>(() => {
    if (initialBattle) {
      return initialBattle.participants.map((participant) => ({
        participantId: participant.participantId,
        seed: participant.seed !== null && participant.seed !== undefined ? String(participant.seed) : "",
      }));
    }
    return [createDefaultParticipantDraft(), createDefaultParticipantDraft()];
  });
  const [formError, setFormError] = useState<string | null>(null);

  const title = mode === "create" ? "Создать баттл" : "Редактировать баттл";
  const submitLabel = mode === "create" ? "Создать баттл" : "Сохранить изменения";

  const handleParticipantChange = useCallback(
    (index: number, field: keyof ParticipantDraft, value: string) => {
      setParticipants((prev) =>
        prev.map((entry, entryIndex) =>
          entryIndex === index
            ? {
                ...entry,
                [field]: value,
              }
            : entry,
        ),
      );
    },
    [],
  );

  const handleAddParticipant = useCallback(() => {
    setParticipants((prev) => [...prev, createDefaultParticipantDraft()]);
  }, []);

  const handleRemoveParticipant = useCallback((index: number) => {
    setParticipants((prev) => prev.filter((_, entryIndex) => entryIndex !== index));
  }, []);

  const prepareParticipants = useCallback((): AdminBattleParticipantInput[] | null => {
    const normalized: AdminBattleParticipantInput[] = [];
    for (const entry of participants) {
      if (!entry.participantId.trim()) {
        continue;
      }
      const participantId = entry.participantId.trim();
      if (normalized.some((candidate) => candidate.participantId === participantId)) {
        setFormError("Участники должны быть уникальными.");
        return null;
      }
      let seed: number | null = null;
      if (entry.seed.trim()) {
        const parsed = Number(entry.seed.trim());
        if (!Number.isFinite(parsed) || parsed < 0) {
          setFormError("Номер посева должен быть неотрицательным числом.");
          return null;
        }
        seed = parsed;
      }
      normalized.push({ participantId, seed });
    }
    if (normalized.length < 2) {
      setFormError("Укажите минимум двух участников баттла.");
      return null;
    }
    return normalized;
  }, [participants]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormError(null);

      const trimmedRoundId = roundId.trim();

      if (!trimmedRoundId) {
        setFormError("Укажите идентификатор раунда.");
        return;
      }

      const normalizedParticipants = prepareParticipants();
      if (!normalizedParticipants) {
        return;
      }

      const payloadBase = {
        roundId: trimmedRoundId,
        status,
        startsAt: fromInputDateValue(startsAt),
        endsAt: fromInputDateValue(endsAt),
        participants: normalizedParticipants,
      };

      try {
        if (mode === "create") {
          await onSubmit(payloadBase as CreateAdminBattlePayload);
        } else {
          await onSubmit(payloadBase as UpdateAdminBattlePayload);
        }
      } catch (error) {
        setFormError(error instanceof Error ? error.message : String(error));
      }
    },
    [mode, roundId, status, startsAt, endsAt, prepareParticipants, onSubmit],
  );

  return (
    <section className={styles.editor}>
      <header className={styles.editorHeader}>
        <div>
          <h3 className={styles.editorTitle}>{title}</h3>
          <p className={styles.editorSubtitle}>
            Заполните идентификатор раунда, временные метки и участников турнира. Идентификаторы участников
            должны соответствовать участникам выбранного турнира.
          </p>
        </div>
        <button className={styles.cancelButton} type="button" onClick={onCancel} disabled={isSubmitting}>
          Отменить
        </button>
      </header>

      <form className={styles.editorForm} onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>ID раунда</span>
            <input
              className={styles.fieldInput}
              type="text"
              value={roundId}
              onChange={(event) => setRoundId(event.target.value)}
              placeholder="UUID раунда"
              required={mode === "create"}
              disabled={isSubmitting}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Статус</span>
            <select
              className={styles.fieldInput}
              value={status}
              onChange={(event) => setStatus(event.target.value as MatchStatus)}
              disabled={isSubmitting}
            >
              {MATCH_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {getMatchStatusMeta(option).label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Начало</span>
            <input
              className={styles.fieldInput}
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Окончание</span>
            <input
              className={styles.fieldInput}
              type="datetime-local"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
        </div>

        <div className={styles.participantsSection}>
          <div className={styles.participantsHeader}>
            <span className={styles.participantsTitle}>Участники</span>
            <button
              className={styles.addParticipantButton}
              type="button"
              onClick={handleAddParticipant}
              disabled={isSubmitting}
            >
              Добавить участника
            </button>
          </div>
          <div className={styles.participantsList}>
            {participants.map((participant, index) => (
              <div key={index} className={styles.participantRow}>
                <input
                  className={styles.participantInput}
                  type="text"
                  placeholder="ID участника турнира"
                  value={participant.participantId}
                  onChange={(event) =>
                    handleParticipantChange(index, "participantId", event.target.value)
                  }
                  disabled={isSubmitting}
                />
                <input
                  className={styles.participantSeedInput}
                  type="number"
                  min={0}
                  placeholder="Посев"
                  value={participant.seed}
                  onChange={(event) => handleParticipantChange(index, "seed", event.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  className={styles.removeParticipantButton}
                  type="button"
                  onClick={() => handleRemoveParticipant(index)}
                  disabled={isSubmitting || participants.length <= 2}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        </div>

        {formError ? <p className={styles.formError}>{formError}</p> : null}

        <div className={styles.submitRow}>
          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Сохраняем..." : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function AdminBattles() {
  const { token } = useAuth();
  const [battles, setBattles] = useState<AdminBattle[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<{
    status: MatchStatus | "";
    roundId: string;
    tournamentId: string;
  }>({ status: "", roundId: "", tournamentId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBattle, setEditingBattle] = useState<AdminBattle | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingDeletionId, setPendingDeletionId] = useState<string | null>(null);

  const normalizedFilters = useMemo(() => {
    const status = filters.status || undefined;
    const trimmedRound = filters.roundId.trim();
    const trimmedTournament = filters.tournamentId.trim();
    return {
      status,
      roundId: trimmedRound || undefined,
      tournamentId: trimmedTournament || undefined,
    };
  }, [filters]);

  const loadBattles = useCallback(async () => {
    if (!token) {
      setError("Нет токена авторизации. Перезайдите в аккаунт администратора.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await battleRapApi.adminBattles.list(
        {
          ...normalizedFilters,
          page,
          limit,
        },
        { token },
      );
      setBattles(response.data);
      setTotal(response.total);
      setPage(response.page);
      setLimit(response.limit);
    } catch (cause) {
      setError(resolveApiErrorMessage(cause));
    } finally {
      setIsLoading(false);
    }
  }, [token, normalizedFilters, page, limit]);

  useEffect(() => {
    void loadBattles();
  }, [loadBattles]);

  const handleApplyFilters = useCallback(() => {
    setPage(1);
  }, [loadBattles]);

  const handleResetFilters = useCallback(() => {
    setFilters({ status: "", roundId: "", tournamentId: "" });
    setPage(1);
    setMessage(null);
    setError(null);
  }, [loadBattles]);

  const handleCreateSubmit = useCallback(
    async (payload: CreateAdminBattlePayload) => {
      if (!token) {
        throw new Error("Нет токена авторизации. Перезайдите в аккаунт администратора.");
      }
      setIsCreating(true);
      setMessage(null);
      try {
        await battleRapApi.adminBattles.create(payload, { token });
        setIsCreateOpen(false);
        setMessage("Баттл создан.");
        await loadBattles();
      } catch (cause) {
        throw new Error(resolveApiErrorMessage(cause));
      } finally {
        setIsCreating(false);
      }
    },
    [token, loadBattles],
  );

  const handleUpdateSubmit = useCallback(
    async (payload: UpdateAdminBattlePayload) => {
      if (!token || !editingBattle) {
        throw new Error("Не удалось определить текущий баттл или токен авторизации.");
      }
      setIsUpdating(true);
      setMessage(null);
      try {
        await battleRapApi.adminBattles.update(editingBattle.id, payload, { token });
        setEditingBattle(null);
        setMessage("Изменения сохранены.");
        await loadBattles();
      } catch (cause) {
        throw new Error(resolveApiErrorMessage(cause));
      } finally {
        setIsUpdating(false);
      }
    },
    [token, editingBattle, loadBattles],
  );

  const handleDelete = useCallback(
    async (battle: AdminBattle) => {
      if (!token) {
        setError("Нет токена авторизации. Перезайдите в аккаунт администратора.");
        return;
      }
      if (!window.confirm(`Удалить баттл ${battle.id}? Действие нельзя отменить.`)) {
        return;
      }
      setPendingDeletionId(battle.id);
      setMessage(null);
      setError(null);
      try {
        await battleRapApi.adminBattles.remove(battle.id, { token });
        setMessage("Баттл удалён.");
        if (editingBattle?.id === battle.id) {
          setEditingBattle(null);
        }
        await loadBattles();
      } catch (cause) {
        setError(resolveApiErrorMessage(cause));
      } finally {
        setPendingDeletionId(null);
      }
    },
    [token, loadBattles, editingBattle],
  );

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Баттлы</h2>
          <p className={styles.description}>
            Управляйте матчами турниров: создавайте новые баттлы, обновляйте состав участников, статусы и сроки.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.refreshButton}
            type="button"
            disabled={isLoading}
            onClick={() => void loadBattles()}
          >
            {isLoading ? "Обновление..." : "Обновить"}
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => {
              setEditingBattle(null);
              setIsCreateOpen(true);
              setMessage(null);
              setError(null);
            }}
          >
            Создать баттл
          </button>
        </div>
      </header>

      <div className={styles.filters}>
        <select
          className={styles.filterInput}
          value={filters.status}
          onChange={(event) =>
            setFilters((prev) => ({ ...prev, status: event.target.value as MatchStatus | "" }))
          }
        >
          <option value="">Любой статус</option>
          {MATCH_STATUSES.map((option) => (
            <option key={option} value={option}>
              {getMatchStatusMeta(option).label}
            </option>
          ))}
        </select>
        <input
          className={styles.filterInput}
          type="text"
          placeholder="ID раунда"
          value={filters.roundId}
          onChange={(event) => setFilters((prev) => ({ ...prev, roundId: event.target.value }))}
        />
        <input
          className={styles.filterInput}
          type="text"
          placeholder="ID турнира"
          value={filters.tournamentId}
          onChange={(event) => setFilters((prev) => ({ ...prev, tournamentId: event.target.value }))}
        />
        <button className={styles.filterButton} type="button" onClick={handleApplyFilters}>
          Применить
        </button>
        <button className={styles.secondaryButton} type="button" onClick={handleResetFilters}>
          Сбросить
        </button>
      </div>

      {message ? <div className={styles.successMessage}>{message}</div> : null}

      {error ? (
        <div className={styles.errorBox}>
          <span>{error}</span>
          <button className={styles.retryButton} type="button" onClick={() => void loadBattles()}>
            Повторить
          </button>
        </div>
      ) : null}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Статус</th>
              <th>Раунд</th>
              <th>Турнир</th>
              <th>Начало</th>
              <th>Окончание</th>
              <th>Участники</th>
              <th aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {battles.length === 0 ? (
              <tr>
                <td className={styles.emptyCell} colSpan={8}>
                  {isLoading ? "Загружаем список баттлов..." : "Баттлы не найдены."}
                </td>
              </tr>
            ) : (
              battles.map((battle) => {
                const statusMeta = getMatchStatusMeta(battle.status);
                return (
                  <tr key={battle.id}>
                    <td className={styles.mono}>{battle.id}</td>
                    <td>
                      <div className={styles.primaryCell}>{statusMeta.label}</div>
                      <div className={styles.metaCell}>{battle.status}</div>
                    </td>
                  <td>
                    <div className={styles.primaryCell}>
                      Раунд {battle.round.number} · {battle.round.kind}
                    </div>
                    <div className={styles.metaCell}>{battle.roundId}</div>
                  </td>
                  <td>
                    <div className={styles.primaryCell}>{battle.tournament.title}</div>
                    <div className={styles.metaCell}>{battle.tournament.id}</div>
                  </td>
                  <td>{formatDateTime(battle.startsAt)}</td>
                  <td>{formatDateTime(battle.endsAt)}</td>
                  <td>{formatParticipantsSummary(battle.participants)}</td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.actionButton}
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setEditingBattle(battle);
                        setMessage(null);
                        setError(null);
                      }}
                    >
                      Редактировать
                    </button>
                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() => void handleDelete(battle)}
                      disabled={pendingDeletionId === battle.id}
                    >
                      {pendingDeletionId === battle.id ? "Удаляем..." : "Удалить"}
                    </button>
                  </td>
                </tr>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span>
          Страница {page} из {totalPages}
        </span>
      </div>

      {isCreateOpen ? (
        <BattleEditor
          mode="create"
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={isCreating}
        />
      ) : null}

      {editingBattle ? (
        <BattleEditor
          mode="edit"
          initialBattle={editingBattle}
          onSubmit={handleUpdateSubmit}
          onCancel={() => setEditingBattle(null)}
          isSubmitting={isUpdating}
        />
      ) : null}
    </section>
  );
}
