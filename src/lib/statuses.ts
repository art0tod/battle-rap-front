export const TOURNAMENT_STATUSES = [
  "draft",
  "registration",
  "ongoing",
  "completed",
  "archived",
] as const;
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const ROUND_STATUSES = ["draft", "submission", "judging", "finished"] as const;
export type RoundStatus = (typeof ROUND_STATUSES)[number];
export const DEFAULT_ROUND_STATUS: RoundStatus = "draft";

export function isRoundStatus(value: unknown): value is RoundStatus {
  return typeof value === "string" && ROUND_STATUSES.includes(value as RoundStatus);
}

export const MATCH_STATUSES = [
  "scheduled",
  "submission",
  "judging",
  "finished",
  "tie",
  "cancelled",
] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export const DEFAULT_MATCH_STATUS: MatchStatus = "scheduled";

export function isMatchStatus(value: unknown): value is MatchStatus {
  return typeof value === "string" && MATCH_STATUSES.includes(value as MatchStatus);
}

type MatchStatusTone = "upcoming" | "progress" | "finished" | "cancelled";

export const MATCH_STATUS_META: Record<
  MatchStatus,
  {
    label: string;
    tone: MatchStatusTone;
  }
> = {
  scheduled: { label: "Запланирован", tone: "upcoming" },
  submission: { label: "Приём треков", tone: "upcoming" },
  judging: { label: "На судействе", tone: "progress" },
  finished: { label: "Завершён", tone: "finished" },
  tie: { label: "Завершён (ничья)", tone: "finished" },
  cancelled: { label: "Отменён", tone: "cancelled" },
};

export function getMatchStatusMeta(status: string): {
  label: string;
  tone: MatchStatusTone;
} {
  if (isMatchStatus(status)) {
    return MATCH_STATUS_META[status];
  }
  return { label: "Статус уточняется", tone: "progress" };
}
