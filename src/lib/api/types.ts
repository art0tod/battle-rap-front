export type UserRole = "admin" | "moderator" | "judge" | "artist" | "user";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistProfile {
  userId: string;
  avatarKey?: string | null;
  bio?: string | null;
  socials?: Record<string, string>;
}

export interface User extends BaseEntity {
  email: string;
  displayName: string;
  roles: UserRole[];
  artistProfile?: ArtistProfile | null;
}

export type TournamentStatus = "draft" | "active" | "finished";

export interface Tournament extends BaseEntity {
  title: string;
  status: TournamentStatus;
  maxBracketSize: 128 | 256;
  startsAt?: string | null;
  endsAt?: string | null;
  coverKey?: string | null;
  description?: string | null;
}

export type RoundKind = "qualifier1" | "qualifier2" | "bracket";
export type RoundScoring = "pass_fail" | "points" | "rubric";
export type RoundStatus = TournamentStatus;

export interface Round extends BaseEntity {
  tournamentId: string;
  kind: RoundKind;
  number: number;
  scoring: RoundScoring;
  status: RoundStatus;
  rubricKeys?: string[];
}

export interface EvaluationCriterion {
  key: string;
  label: string;
  maxScore?: number;
  description?: string;
}

export interface TournamentParticipant extends BaseEntity {
  tournamentId: string;
  userId: string;
  seed?: number | null;
}

export interface TournamentJudge extends BaseEntity {
  tournamentId: string;
  userId: string;
}

export type SubmissionStatus = "draft" | "submitted" | "locked" | "disqualified";

export interface Submission extends BaseEntity {
  roundId: string;
  participantId: string;
  audioId: string;
  lyrics?: string | null;
  status: SubmissionStatus;
}

export interface Match extends BaseEntity {
  roundId: string;
  startsAt?: string | null;
  locked?: boolean;
  status?: "scheduled" | "completed" | "in_progress";
}

export interface MatchParticipant extends BaseEntity {
  matchId: string;
  participantId: string;
  seed?: number | null;
}

export interface Track extends BaseEntity {
  matchId: string;
  participantId: string;
  audioId: string;
  lyrics?: string | null;
}

export type MediaKind = "audio" | "video" | "image" | "document";

export interface MediaAsset extends BaseEntity {
  kind: MediaKind;
  storageKey: string;
  mime: string;
  sizeBytes: number;
  durationSec?: number | null;
}

export interface SubmissionEvaluation extends BaseEntity {
  submissionId: string;
  judgeId: string;
  pass?: boolean;
  score?: number | null;
  comment?: string | null;
}

export interface MatchEvaluation extends BaseEntity {
  matchId: string;
  judgeId: string;
  rubric?: Record<string, number>;
  comment?: string | null;
}

export interface DashboardStats {
  totalUsers: number;
  activeTournaments: number;
  submissions: number;
  judges: number;
  [key: string]: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
