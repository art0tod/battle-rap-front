import { normalizeUserRoles } from "@/lib/roles";
import {
  DEFAULT_MATCH_STATUS,
  DEFAULT_ROUND_STATUS,
  isMatchStatus,
  isRoundStatus,
} from "@/lib/statuses";
import type {
  ApplicationStatus,
  AdminUser,
  AdminUserList,
  AdminBattle,
  AdminBattleList,
  AdminBattleParticipant,
  AuthSession,
  AuthUser,
  MediaAssetStatus,
  ModerationSubmission,
  ModerationSubmissionList,
  ParticipationApplication,
  PresignUploadResponse,
  PublicParticipant,
  PublicParticipantsList,
  RefreshTokens,
  SubmitApplicationResult,
  UserProfile,
  UserRolesState,
  JudgeAssignment,
  JudgeAssignmentStatus,
  JudgeBattleDetails,
  JudgeRubricCriterion,
  RoundOverview,
  PublicBattleList,
  PublicBattle,
  PublicBattleParticipant,
  PublicBattleTrack,
} from "./types";

export interface ApiAuthUser {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
}

export interface ApiAuthSession {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: ApiAuthUser;
}

export interface ApiRefreshTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface ApiProfileViewerContext {
  is_self: boolean;
  can_edit: boolean;
  can_moderate: boolean;
  can_view_private: boolean;
}

interface ApiProfileAvatar {
  key: string;
  url: string;
}

export interface ApiProfileView {
  id: string;
  display_name: string;
  roles: string[];
  created_at: string;
  updated_at: string;
  viewer_context: ApiProfileViewerContext;
  avatar?: ApiProfileAvatar | null;
  bio?: string | null;
  city?: string | null;
  email?: string | null;
  age?: number | null;
  vk_id?: string | null;
  full_name?: string | null;
  socials?: Record<string, unknown> | null;
}

export interface ApiPublicParticipant {
  id: string;
  display_name: string;
  roles: string[];
  full_name?: string | null;
  city?: string | null;
  joined_at: string;
  avatar?: ApiProfileAvatar | null;
  avg_total_score?: number | null;
  total_wins: number;
}

export interface ApiPublicParticipantsResponse {
  data: ApiPublicParticipant[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiPublicBattleTrack {
  id: string;
  audio_key?: string | null;
  audio_url?: string | null;
  mime?: string | null;
  duration_sec?: number | null;
  submitted_at?: string | null;
  lyrics?: string | null;
  likes?: number | null;
}

export interface ApiPublicBattleParticipant {
  participant_id: string;
  user_id: string;
  display_name: string;
  seed?: number | null;
  city?: string | null;
  age?: number | null;
  avatar?: {
    key: string;
    url: string | null;
  } | null;
  avg_total_score?: number | null;
  track?: ApiPublicBattleTrack | null;
}

export interface ApiPublicBattle {
  id: string;
  status: string;
  starts_at?: string | null;
  ends_at?: string | null;
  winner_match_track_id?: string | null;
  round: {
    id: string;
    number: number;
    kind: string;
    status: string;
    scoring: string;
    strategy: string;
    judging_deadline_at?: string | null;
  };
  tournament: {
    id: string;
    title: string;
  };
  participants: ApiPublicBattleParticipant[];
}

export interface ApiPublicBattleListResponse {
  battles: ApiPublicBattle[];
}

export interface ApiAdminUser {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
}

export interface ApiAdminUserListResponse {
  data: ApiAdminUser[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiAdminBattleParticipant {
  participant_id: string;
  user_id: string;
  display_name: string;
  seed?: number | null;
  city?: string | null;
  age?: number | null;
  avatar?: {
    key: string;
    url?: string | null;
  } | null;
}

export interface ApiAdminBattle {
  id: string;
  round_id: string;
  starts_at?: string | null;
  ends_at?: string | null;
  status: string;
  winner_match_track_id?: string | null;
  round: {
    id: string;
    number: number;
    kind: string;
    status: string;
    scoring: string;
    strategy: string;
  };
  tournament: {
    id: string;
    title: string;
  };
  participants: ApiAdminBattleParticipant[];
}

export interface ApiAdminBattleListResponse {
  data: ApiAdminBattle[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiPresignResponse {
  assetId: string;
  storageKey: string;
  uploadUrl: string;
  headers: Record<string, string>;
}

export interface ApiMediaAssetStatus {
  id: string;
  status: string;
}

export interface ApiModerationSubmission {
  id: string;
  status: string;
  submitted_at?: string | null;
  updated_at: string;
  lyrics?: string | null;
  round: {
    id: string;
    number: number;
    kind: string;
    tournament_id: string;
    tournament_title: string;
  };
  artist: {
    id: string;
    display_name: string;
    email: string;
  };
  audio: {
    id: string;
    mime: string;
    status: string;
    url?: string | null;
  };
}

export interface ApiModerationSubmissionListResponse {
  data: ApiModerationSubmission[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiUserRolesState {
  user_id: string;
  roles: string[];
}

export interface ApiParticipationApplication {
  id: string;
  status: string;
  city?: string | null;
  age?: number | null;
  vk_id?: string | null;
  full_name?: string | null;
  beat_author?: string | null;
  audio_id?: string | null;
  lyrics?: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;
  reject_reason?: string | null;
  round_id?: string | null;
  moderator_id?: string | null;
}

export interface ApiSubmitApplicationResult {
  id: string;
  status: string;
}

export interface ApiJudgeAssignment {
  id: string;
  match_id: string;
  status: string;
  assigned_at?: string | null;
  round_id: string;
  starts_at?: string | null;
  match_status: string;
  round_kind?: string;
  round_number?: number;
  round_scoring?: string;
  round_status?: string;
  round_strategy?: string | null;
  judging_deadline_at?: string | null;
}

export interface ApiJudgeBattleDetails {
  match: {
    id: string;
    round_id: string;
    status: string;
    starts_at?: string | null;
    ends_at?: string | null;
    winner_match_track_id?: string | null;
    round: {
      id: string;
      kind: string;
      number: number;
      scoring: string;
      status: string;
      strategy: string;
      judging_deadline_at?: string | null;
    };
  };
  participants: Array<{
    participant_id: string;
    user_id: string;
    display_name: string;
    seed?: number | null;
    avg_total_score?: number | null;
    track?: {
      id: string;
      audio_key?: string | null;
      audio_url?: string | null;
      mime?: string | null;
      duration_sec?: number | null;
      submitted_at?: string | null;
      lyrics?: string | null;
    } | null;
  }>;
  rubric: Array<{
    key: string;
    name: string;
    weight?: number | null;
    min_value?: number | null;
    max_value?: number | null;
    position?: number | null;
  }>;
  evaluation?: {
    pass?: boolean | null;
    score?: number | null;
    rubric?: Record<string, number> | null;
    total_score?: number | null;
    comment?: string | null;
  } | null;
}

export interface ApiRoundOverview {
  round: {
    id: string;
    tournament_id: string;
    kind: string;
    number: number;
    scoring: "pass_fail" | "points" | "rubric";
    status: string;
    starts_at?: string | null;
    submission_deadline_at?: string | null;
    judging_deadline_at?: string | null;
    strategy?: string | null;
  };
  mode: "pass_fail" | "points" | "rubric";
  summary: {
    total_submissions?: number | null;
    total_matches?: number | null;
    total_tracks?: number | null;
    total_reviews?: number | null;
    mode: "pass_fail" | "points" | "rubric";
  };
  submissions?: Array<{
    submission_id: string;
    participant_id: string;
    user_id: string;
    display_name: string;
    status: string;
    submitted_at?: string | null;
    lyrics?: string | null;
    pass_count: number;
    fail_count: number;
    judge_count: number;
    total_score: number;
    avg_score?: number | null;
    total_reviews: number;
    audio: {
      key: string;
      url: string;
      mime?: string | null;
      duration_sec?: number | null;
    };
    avatar?: {
      key: string;
      url: string;
    } | null;
  }>;
  matches?: Array<{
    id: string;
    status: string;
    starts_at?: string | null;
    ends_at?: string | null;
    winner_match_track_id?: string | null;
    participants: Array<{
      participant_id: string;
      user_id: string;
      display_name: string;
      seed?: number | null;
      avg_total_score?: number | null;
      track?: {
        id: string;
        audio_key?: string | null;
        audio_url?: string | null;
        mime?: string | null;
        duration_sec?: number | null;
        submitted_at?: string | null;
        lyrics?: string | null;
      } | null;
    }>;
  }>;
  rubric?: Array<{
    key: string;
    name: string;
    weight?: number | null;
    min_value?: number | null;
    max_value?: number | null;
    position?: number | null;
  }> | null;
}

function mapAuthUser(payload: ApiAuthUser): AuthUser {
  return {
    id: payload.id,
    email: payload.email,
    displayName: payload.display_name,
    roles: normalizeUserRoles(payload.roles),
  };
}

export function mapAuthSession(payload: ApiAuthSession): AuthSession {
  return {
    accessToken: payload.access_token,
    tokenType: payload.token_type,
    expiresIn: payload.expires_in,
    user: mapAuthUser(payload.user),
  };
}

export function mapRefreshTokens(payload: ApiRefreshTokens): RefreshTokens {
  return {
    accessToken: payload.access_token,
    tokenType: payload.token_type,
    expiresIn: payload.expires_in,
  };
}

export function mapProfileView(payload: ApiProfileView): UserProfile {
  return {
    id: payload.id,
    displayName: payload.display_name,
    roles: normalizeUserRoles(payload.roles),
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    viewerContext: {
      isSelf: payload.viewer_context.is_self,
      canEdit: payload.viewer_context.can_edit,
      canModerate: payload.viewer_context.can_moderate,
      canViewPrivate: payload.viewer_context.can_view_private,
    },
    avatar: payload.avatar ?? null,
    bio: payload.bio ?? null,
    city: payload.city ?? null,
    email: payload.email ?? null,
    age: payload.age ?? null,
    vkId: payload.vk_id ?? null,
    fullName: payload.full_name ?? null,
    socials: payload.socials ?? null,
  };
}

export function mapPublicParticipant(payload: ApiPublicParticipant): PublicParticipant {
  return {
    id: payload.id,
    displayName: payload.display_name,
    roles: normalizeUserRoles(payload.roles),
    fullName: payload.full_name ?? null,
    city: payload.city ?? null,
    joinedAt: payload.joined_at,
    avatar: payload.avatar ?? null,
    avgTotalScore: payload.avg_total_score ?? null,
    totalWins: payload.total_wins,
  };
}

export function mapPublicParticipantsResponse(
  payload: ApiPublicParticipantsResponse,
): PublicParticipantsList {
  return {
    data: payload.data.map(mapPublicParticipant),
    page: payload.page,
    limit: payload.limit,
    total: payload.total,
  };
}

function mapPublicBattleTrack(payload: ApiPublicBattleTrack | null | undefined): PublicBattleTrack | null {
  if (!payload) {
    return null;
  }
  return {
    id: payload.id,
    audioKey: payload.audio_key ?? null,
    audioUrl: payload.audio_url ?? null,
    mime: payload.mime ?? null,
    durationSec:
      payload.duration_sec !== null && payload.duration_sec !== undefined
        ? Number(payload.duration_sec)
        : null,
    submittedAt: payload.submitted_at ?? null,
    lyrics: payload.lyrics ?? null,
    likes:
      payload.likes !== null && payload.likes !== undefined
        ? Number(payload.likes)
        : null,
  };
}

function mapPublicBattleParticipant(payload: ApiPublicBattleParticipant): PublicBattleParticipant {
  return {
    participantId: payload.participant_id,
    userId: payload.user_id,
    displayName: payload.display_name,
    seed: payload.seed ?? null,
    city: payload.city ?? null,
    age: payload.age ?? null,
    avatar: payload.avatar
      ? {
          key: payload.avatar.key,
          url: payload.avatar.url ?? null,
        }
      : null,
    avgTotalScore:
      payload.avg_total_score !== null && payload.avg_total_score !== undefined
        ? Number(payload.avg_total_score)
        : null,
    track: mapPublicBattleTrack(payload.track),
  };
}

export function mapPublicBattle(payload: ApiPublicBattle): PublicBattle {
  const status = isMatchStatus(payload.status) ? payload.status : DEFAULT_MATCH_STATUS;
  const roundStatus = isRoundStatus(payload.round.status) ? payload.round.status : DEFAULT_ROUND_STATUS;
  return {
    id: payload.id,
    status,
    startsAt: payload.starts_at ?? null,
    endsAt: payload.ends_at ?? null,
    winnerMatchTrackId: payload.winner_match_track_id ?? null,
    round: {
      id: payload.round.id,
      number: payload.round.number,
      kind: payload.round.kind,
      status: roundStatus,
      scoring: payload.round.scoring,
      strategy: payload.round.strategy,
      judgingDeadlineAt: payload.round.judging_deadline_at ?? null,
    },
    tournament: {
      id: payload.tournament.id,
      title: payload.tournament.title,
    },
    participants: payload.participants.map(mapPublicBattleParticipant),
  };
}

export function mapPublicBattleList(payload: ApiPublicBattleListResponse): PublicBattleList {
  return {
    battles: payload.battles.map(mapPublicBattle),
  };
}

export function mapAdminUser(payload: ApiAdminUser): AdminUser {
  return {
    id: payload.id,
    email: payload.email,
    displayName: payload.display_name,
    roles: normalizeUserRoles(payload.roles),
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    lastLoginAt: payload.last_login_at ?? null,
  };
}

export function mapAdminUserList(payload: ApiAdminUserListResponse): AdminUserList {
  return {
    data: payload.data.map(mapAdminUser),
    page: payload.page,
    limit: payload.limit,
    total: payload.total,
  };
}

function mapAdminBattleParticipant(payload: ApiAdminBattleParticipant): AdminBattleParticipant {
  return {
    participantId: payload.participant_id,
    userId: payload.user_id,
    displayName: payload.display_name,
    seed: payload.seed ?? null,
    city: payload.city ?? null,
    age: payload.age ?? null,
    avatar: payload.avatar
      ? {
          key: payload.avatar.key,
          url: payload.avatar.url ?? null,
        }
      : null,
  };
}

export function mapAdminBattle(payload: ApiAdminBattle): AdminBattle {
  const status = isMatchStatus(payload.status) ? payload.status : DEFAULT_MATCH_STATUS;
  const roundStatus = isRoundStatus(payload.round.status) ? payload.round.status : DEFAULT_ROUND_STATUS;
  return {
    id: payload.id,
    roundId: payload.round_id,
    startsAt: payload.starts_at ?? null,
    endsAt: payload.ends_at ?? null,
    status,
    winnerMatchTrackId: payload.winner_match_track_id ?? null,
    round: {
      id: payload.round.id,
      number: payload.round.number,
      kind: payload.round.kind,
      status: roundStatus,
      scoring: payload.round.scoring,
      strategy: payload.round.strategy,
    },
    tournament: {
      id: payload.tournament.id,
      title: payload.tournament.title,
    },
    participants: payload.participants.map(mapAdminBattleParticipant),
  };
}

export function mapAdminBattleList(payload: ApiAdminBattleListResponse): AdminBattleList {
  return {
    data: payload.data.map(mapAdminBattle),
    page: payload.page,
    limit: payload.limit,
    total: payload.total,
  };
}

export function mapPresignResponse(payload: ApiPresignResponse): PresignUploadResponse {
  return {
    assetId: payload.assetId,
    storageKey: payload.storageKey,
    uploadUrl: payload.uploadUrl,
    headers: payload.headers,
  };
}

export function mapMediaAssetStatus(payload: ApiMediaAssetStatus): MediaAssetStatus {
  return {
    id: payload.id,
    status: payload.status,
  };
}

function mapModerationSubmission(payload: ApiModerationSubmission): ModerationSubmission {
  return {
    id: payload.id,
    status: payload.status,
    submittedAt: payload.submitted_at ?? null,
    updatedAt: payload.updated_at,
    lyrics: payload.lyrics ?? null,
    round: {
      id: payload.round.id,
      number: payload.round.number,
      kind: payload.round.kind,
      tournamentId: payload.round.tournament_id,
      tournamentTitle: payload.round.tournament_title,
    },
    artist: {
      id: payload.artist.id,
      displayName: payload.artist.display_name,
      email: payload.artist.email,
    },
    audio: {
      id: payload.audio.id,
      mime: payload.audio.mime,
      status: payload.audio.status,
      url: payload.audio.url ?? null,
    },
  };
}

export function mapModerationSubmissionList(
  payload: ApiModerationSubmissionListResponse,
): ModerationSubmissionList {
  return {
    data: payload.data.map(mapModerationSubmission),
    page: payload.page,
    limit: payload.limit,
    total: payload.total,
  };
}

export function mapModerationSubmissionDetail(
  payload: ApiModerationSubmission,
): ModerationSubmission {
  return mapModerationSubmission(payload);
}

export function mapUserRolesState(payload: ApiUserRolesState): UserRolesState {
  return {
    userId: payload.user_id,
    roles: normalizeUserRoles(payload.roles),
  };
}

function mapApplicationStatus(value: string): ApplicationStatus {
  switch (value) {
    case "submitted":
    case "approved":
    case "rejected":
      return value;
    default:
      return "submitted";
  }
}

export function mapParticipationApplication(
  payload: ApiParticipationApplication,
): ParticipationApplication {
  return {
    id: payload.id,
    status: mapApplicationStatus(payload.status),
    city: payload.city ?? null,
    age: payload.age ?? null,
    vkId: payload.vk_id ?? null,
    fullName: payload.full_name ?? null,
    beatAuthor: payload.beat_author ?? null,
    audioId: payload.audio_id ?? null,
    lyrics: payload.lyrics ?? null,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    reviewedAt: payload.reviewed_at ?? null,
    rejectReason: payload.reject_reason ?? null,
    roundId: payload.round_id ?? null,
    moderatorId: payload.moderator_id ?? null,
  };
}

export function mapSubmitApplicationResult(
  payload: ApiSubmitApplicationResult,
): SubmitApplicationResult {
  return {
    id: payload.id,
    status: mapApplicationStatus(payload.status),
  };
}

export function mapJudgeAssignment(payload: ApiJudgeAssignment): JudgeAssignment {
  const matchStatus = isMatchStatus(payload.match_status)
    ? payload.match_status
    : DEFAULT_MATCH_STATUS;
  const roundStatus =
    payload.round_status && isRoundStatus(payload.round_status)
      ? payload.round_status
      : undefined;
  return {
    id: payload.id,
    matchId: payload.match_id,
    status: payload.status as JudgeAssignmentStatus,
    assignedAt: payload.assigned_at ?? null,
    roundId: payload.round_id,
    startsAt: payload.starts_at ?? null,
    matchStatus,
    roundKind: payload.round_kind,
    roundNumber: payload.round_number,
    roundScoring: payload.round_scoring,
    roundStatus,
    roundStrategy: payload.round_strategy ?? null,
    judgingDeadlineAt: payload.judging_deadline_at ?? null,
  };
}

export function mapJudgeBattleDetails(payload: ApiJudgeBattleDetails): JudgeBattleDetails {
  const matchStatus = isMatchStatus(payload.match.status)
    ? payload.match.status
    : DEFAULT_MATCH_STATUS;
  const roundStatus = isRoundStatus(payload.match.round.status)
    ? payload.match.round.status
    : DEFAULT_ROUND_STATUS;
  return {
    match: {
      id: payload.match.id,
      roundId: payload.match.round_id,
      status: matchStatus,
      startsAt: payload.match.starts_at ?? null,
      endsAt: payload.match.ends_at ?? null,
      winnerMatchTrackId: payload.match.winner_match_track_id ?? null,
      round: {
        id: payload.match.round.id,
        kind: payload.match.round.kind,
        number: payload.match.round.number,
        scoring: payload.match.round.scoring,
        status: roundStatus,
        strategy: payload.match.round.strategy,
        judgingDeadlineAt: payload.match.round.judging_deadline_at ?? null,
      },
    },
    participants: payload.participants.map((participant) => ({
      participantId: participant.participant_id,
      userId: participant.user_id,
      displayName: participant.display_name,
      seed: participant.seed ?? null,
      avgTotalScore:
        participant.avg_total_score !== undefined && participant.avg_total_score !== null
          ? Number(participant.avg_total_score)
          : null,
      track: participant.track
        ? {
            id: participant.track.id,
            audioKey: participant.track.audio_key ?? null,
            audioUrl: participant.track.audio_url ?? null,
            mime: participant.track.mime ?? null,
            durationSec:
              participant.track.duration_sec !== undefined && participant.track.duration_sec !== null
                ? Number(participant.track.duration_sec)
                : null,
            submittedAt: participant.track.submitted_at ?? null,
            lyrics: participant.track.lyrics ?? null,
          }
        : null,
    })),
    rubric: payload.rubric.map((criterion): JudgeRubricCriterion => ({
      key: criterion.key,
      name: criterion.name,
      weight: criterion.weight ?? null,
      minValue: criterion.min_value ?? null,
      maxValue: criterion.max_value ?? null,
      position: criterion.position ?? null,
    })),
    evaluation: payload.evaluation
      ? {
          pass: payload.evaluation.pass ?? null,
          score: payload.evaluation.score ?? null,
          rubric: payload.evaluation.rubric ?? null,
          totalScore: payload.evaluation.total_score ?? null,
          comment: payload.evaluation.comment ?? null,
        }
      : null,
  };
}

export function mapRoundOverview(payload: ApiRoundOverview): RoundOverview {
  const roundStatus = isRoundStatus(payload.round.status)
    ? payload.round.status
    : DEFAULT_ROUND_STATUS;
  return {
    round: {
      id: payload.round.id,
      tournamentId: payload.round.tournament_id,
      kind: payload.round.kind,
      number: payload.round.number,
      scoring: payload.round.scoring,
      status: roundStatus,
      startsAt: payload.round.starts_at ?? null,
      submissionDeadlineAt: payload.round.submission_deadline_at ?? null,
      judgingDeadlineAt: payload.round.judging_deadline_at ?? null,
      strategy: payload.round.strategy ?? null,
    },
    mode: payload.mode,
    summary: {
      totalSubmissions: payload.summary.total_submissions ?? null,
      totalMatches: payload.summary.total_matches ?? null,
      totalTracks: payload.summary.total_tracks ?? null,
      totalReviews: payload.summary.total_reviews ?? null,
      mode: payload.summary.mode,
    },
    submissions: payload.submissions?.map((submission) => ({
      submissionId: submission.submission_id,
      participantId: submission.participant_id,
      userId: submission.user_id,
      displayName: submission.display_name,
      status: submission.status,
      submittedAt: submission.submitted_at ?? null,
      lyrics: submission.lyrics ?? null,
      passCount: submission.pass_count,
      failCount: submission.fail_count,
      judgeCount: submission.judge_count,
      totalScore: submission.total_score,
      avgScore:
        submission.avg_score !== undefined && submission.avg_score !== null
          ? Number(submission.avg_score)
          : null,
      totalReviews: submission.total_reviews,
      audio: {
        key: submission.audio.key,
        url: submission.audio.url,
        mime: submission.audio.mime ?? null,
        durationSec:
          submission.audio.duration_sec !== undefined && submission.audio.duration_sec !== null
            ? Number(submission.audio.duration_sec)
            : null,
      },
      avatar: submission.avatar
        ? {
            key: submission.avatar.key,
            url: submission.avatar.url,
          }
        : null,
    })),
    matches: payload.matches?.map((match) => {
      const matchStatus = isMatchStatus(match.status) ? match.status : DEFAULT_MATCH_STATUS;
      return {
        id: match.id,
        status: matchStatus,
        startsAt: match.starts_at ?? null,
        endsAt: match.ends_at ?? null,
        winnerMatchTrackId: match.winner_match_track_id ?? null,
        participants: match.participants.map((participant) => ({
          participantId: participant.participant_id,
          userId: participant.user_id,
          displayName: participant.display_name,
          seed: participant.seed ?? null,
          avgTotalScore:
            participant.avg_total_score !== undefined && participant.avg_total_score !== null
              ? Number(participant.avg_total_score)
              : null,
          track: participant.track
            ? {
                id: participant.track.id,
                audioKey: participant.track.audio_key ?? null,
                audioUrl: participant.track.audio_url ?? null,
                mime: participant.track.mime ?? null,
                durationSec:
                  participant.track.duration_sec !== undefined &&
                  participant.track.duration_sec !== null
                    ? Number(participant.track.duration_sec)
                    : null,
                submittedAt: participant.track.submitted_at ?? null,
                lyrics: participant.track.lyrics ?? null,
              }
            : null,
        })),
      };
    }),
    rubric: payload.rubric?.map((criterion): JudgeRubricCriterion => ({
      key: criterion.key,
      name: criterion.name,
      weight: criterion.weight ?? null,
      minValue: criterion.min_value ?? null,
      maxValue: criterion.max_value ?? null,
      position: criterion.position ?? null,
    })) ?? null,
  };
}
