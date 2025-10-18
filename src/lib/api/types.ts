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
