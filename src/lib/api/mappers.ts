import type {
  AdminUser,
  AdminUserList,
  AuthSession,
  AuthUser,
  MediaAssetStatus,
  ModerationSubmission,
  ModerationSubmissionList,
  PresignUploadResponse,
  RefreshTokens,
  UserProfile,
  UserRole,
  UserRolesState,
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

function castUserRole(role: string): UserRole {
  return role as UserRole;
}

function mapAuthUser(payload: ApiAuthUser): AuthUser {
  return {
    id: payload.id,
    email: payload.email,
    displayName: payload.display_name,
    roles: payload.roles.map(castUserRole),
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
    roles: payload.roles.map(castUserRole),
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

export function mapAdminUser(payload: ApiAdminUser): AdminUser {
  return {
    id: payload.id,
    email: payload.email,
    displayName: payload.display_name,
    roles: payload.roles.map(castUserRole),
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
    roles: payload.roles.map(castUserRole),
  };
}
