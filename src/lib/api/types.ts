import type { MatchStatus, RoundStatus } from "@/lib/statuses";

export type UserRole = "admin" | "moderator" | "judge" | "artist" | "listener" | "user";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
}

export interface ProfileViewerContext {
  isSelf: boolean;
  canEdit: boolean;
  canModerate: boolean;
  canViewPrivate: boolean;
}

export interface ProfileAvatar {
  key: string;
  url: string;
}

export interface PublicParticipant {
  id: string;
  displayName: string;
  roles: UserRole[];
  fullName?: string | null;
  city?: string | null;
  joinedAt: string;
  avatar?: ProfileAvatar | null;
  avgTotalScore?: number | null;
  totalWins: number;
}

export interface PublicParticipantsList {
  data: PublicParticipant[];
  page: number;
  limit: number;
  total: number;
}

export interface UserProfile {
  id: string;
  displayName: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  viewerContext: ProfileViewerContext;
  avatar?: ProfileAvatar | null;
  bio?: string | null;
  city?: string | null;
  email?: string | null;
  age?: number | null;
  vkId?: string | null;
  fullName?: string | null;
  socials?: Record<string, unknown> | null;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshTokens {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface AdminUserList {
  data: AdminUser[];
  page: number;
  limit: number;
  total: number;
}

export interface AdminBattleParticipant {
  participantId: string;
  userId: string;
  displayName: string;
  seed?: number | null;
  city?: string | null;
  age?: number | null;
  avatar?: ProfileAvatar | null;
}

export interface AdminBattleRoundInfo {
  id: string;
  number: number;
  kind: string;
  status: RoundStatus;
  scoring: string;
  strategy: string;
}

export interface AdminBattleTournamentInfo {
  id: string;
  title: string;
}

export interface AdminBattle {
  id: string;
  roundId: string;
  startsAt?: string | null;
  endsAt?: string | null;
  status: MatchStatus;
  winnerMatchTrackId?: string | null;
  round: AdminBattleRoundInfo;
  tournament: AdminBattleTournamentInfo;
  participants: AdminBattleParticipant[];
}

export interface AdminBattleList {
  data: AdminBattle[];
  page: number;
  limit: number;
  total: number;
}

export type UploadAssetKind = "audio" | "image";

export interface PresignUploadPayload {
  filename: string;
  mime: string;
  sizeBytes: number;
  type: UploadAssetKind;
}

export interface PresignUploadResponse {
  assetId: string;
  storageKey: string;
  uploadUrl: string;
  headers: Record<string, string>;
}

export interface CompleteUploadPayload {
  assetId: string;
  storageKey: string;
  mime: string;
  sizeBytes: number;
  kind: UploadAssetKind;
}

export interface MediaAssetStatus {
  id: string;
  status: string;
}

export type ApplicationStatus = "submitted" | "approved" | "rejected";

export interface ParticipationApplication {
  id: string;
  status: ApplicationStatus;
  city?: string | null;
  age?: number | null;
  vkId?: string | null;
  fullName?: string | null;
  beatAuthor?: string | null;
  audioId?: string | null;
  lyrics?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string | null;
  rejectReason?: string | null;
  roundId?: string | null;
  moderatorId?: string | null;
}

export interface SubmitApplicationPayload {
  city?: string;
  age?: number;
  vkId?: string;
  fullName?: string;
  beatAuthor?: string;
  audioId?: string;
  lyrics?: string;
}

export interface SubmitApplicationResult {
  id: string;
  status: ApplicationStatus;
}

export interface ModerationSubmission {
  id: string;
  status: string;
  submittedAt?: string | null;
  updatedAt: string;
  lyrics?: string | null;
  round: {
    id: string;
    number: number;
    kind: string;
    tournamentId: string;
    tournamentTitle: string;
  };
  artist: {
    id: string;
    displayName: string;
    email: string;
  };
  audio: {
    id: string;
    mime: string;
    status: string;
    url?: string | null;
  };
}

export interface ModerationSubmissionList {
  data: ModerationSubmission[];
  page: number;
  limit: number;
  total: number;
}

export type RoleChangeOperation = "grant" | "revoke";

export interface RoleChangePayload {
  op: RoleChangeOperation;
  role: Exclude<UserRole, "user">;
}

export interface UserRolesState {
  userId: string;
  roles: UserRole[];
}

export type JudgeAssignmentStatus = "assigned" | "completed" | "skipped";

export interface JudgeAssignment {
  id: string;
  matchId: string;
  status: JudgeAssignmentStatus;
  assignedAt?: string | null;
  roundId: string;
  startsAt?: string | null;
  matchStatus: MatchStatus;
  roundKind?: string;
  roundNumber?: number;
  roundScoring?: string;
  roundStatus?: RoundStatus;
  roundStrategy?: string | null;
  judgingDeadlineAt?: string | null;
}

export interface JudgeAssignmentStatusPayload {
  status: Exclude<JudgeAssignmentStatus, "assigned">;
}

export interface JudgeScorePayload {
  rubric?: Record<string, number>;
  score?: number;
  pass?: boolean;
  comment?: string;
}

export interface JudgeRubricCriterion {
  key: string;
  name: string;
  weight?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
  position?: number | null;
}

export interface JudgeBattleTrack {
  id: string;
  audioKey?: string | null;
  audioUrl?: string | null;
  mime?: string | null;
  durationSec?: number | null;
  submittedAt?: string | null;
  lyrics?: string | null;
}

export interface JudgeBattleParticipant {
  participantId: string;
  userId: string;
  displayName: string;
  seed?: number | null;
  avgTotalScore?: number | null;
  track?: JudgeBattleTrack | null;
}

export interface JudgeBattleRoundSummary {
  id: string;
  kind: string;
  number: number;
  scoring: string;
  status: RoundStatus;
  strategy: string;
  judgingDeadlineAt?: string | null;
}

export interface JudgeBattleMatchSummary {
  id: string;
  roundId: string;
  status: MatchStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  winnerMatchTrackId?: string | null;
  round: JudgeBattleRoundSummary;
}

export interface JudgeBattleEvaluation {
  pass?: boolean | null;
  score?: number | null;
  rubric?: Record<string, number> | null;
  totalScore?: number | null;
  comment?: string | null;
}

export interface JudgeBattleDetails {
  match: JudgeBattleMatchSummary;
  participants: JudgeBattleParticipant[];
  rubric: JudgeRubricCriterion[];
  evaluation?: JudgeBattleEvaluation | null;
}

export interface RoundSummary {
  id: string;
  tournamentId: string;
  kind: string;
  number: number;
  scoring: "pass_fail" | "points" | "rubric";
  status: RoundStatus;
  startsAt?: string | null;
  submissionDeadlineAt?: string | null;
  judgingDeadlineAt?: string | null;
  strategy?: string | null;
}

export interface RoundOverviewSubmission {
  submissionId: string;
  participantId: string;
  userId: string;
  displayName: string;
  status: string;
  submittedAt?: string | null;
  lyrics?: string | null;
  passCount: number;
  failCount: number;
  judgeCount: number;
  totalScore: number;
  avgScore?: number | null;
  totalReviews: number;
  audio: {
    key: string;
    url: string;
    mime?: string | null;
    durationSec?: number | null;
  };
  avatar?: {
    key: string;
    url: string;
  } | null;
}

export interface RoundOverviewMatchParticipant {
  participantId: string;
  userId: string;
  displayName: string;
  seed?: number | null;
  avgTotalScore?: number | null;
  track?: JudgeBattleTrack | null;
}

export interface RoundOverviewMatch {
  id: string;
  status: MatchStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  winnerMatchTrackId?: string | null;
  participants: RoundOverviewMatchParticipant[];
}

export interface RoundOverviewSummary {
  totalSubmissions?: number | null;
  totalMatches?: number | null;
  totalTracks?: number | null;
  totalReviews?: number | null;
  mode: "pass_fail" | "points" | "rubric";
}

export interface RoundOverview {
  round: RoundSummary;
  mode: "pass_fail" | "points" | "rubric";
  summary: RoundOverviewSummary;
  submissions?: RoundOverviewSubmission[];
  matches?: RoundOverviewMatch[];
  rubric?: JudgeRubricCriterion[] | null;
}

export type PublicBattleStatusFilter = "current" | "finished";

export interface PublicBattleTrack {
  id: string;
  audioKey?: string | null;
  audioUrl?: string | null;
  mime?: string | null;
  durationSec?: number | null;
  submittedAt?: string | null;
  lyrics?: string | null;
  likes?: number | null;
}

export interface PublicBattleParticipant {
  participantId: string;
  userId: string;
  displayName: string;
  city?: string | null;
  age?: number | null;
  avatar?: ProfileAvatar | null;
  seed?: number | null;
  avgTotalScore?: number | null;
  track?: PublicBattleTrack | null;
}

export interface PublicBattleRoundInfo {
  id: string;
  number: number;
  kind: string;
  status: RoundStatus;
  scoring: string;
  strategy: string;
  judgingDeadlineAt?: string | null;
}

export interface PublicBattleTournamentInfo {
  id: string;
  title: string;
}

export interface PublicBattle {
  id: string;
  status: MatchStatus;
  startsAt?: string | null;
  endsAt?: string | null;
  winnerMatchTrackId?: string | null;
  round: PublicBattleRoundInfo;
  tournament: PublicBattleTournamentInfo;
  participants: PublicBattleParticipant[];
}

export interface PublicBattleList {
  battles: PublicBattle[];
}
