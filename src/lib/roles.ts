import type { UserRole } from "./api/types";

const ROLE_ORDER: UserRole[] = [
  "admin",
  "moderator",
  "judge",
  "artist",
  "listener",
  "user",
];

const ROLE_PRIORITY = ROLE_ORDER.reduce<Record<UserRole, number>>(
  (accumulator, role, index) => {
    accumulator[role] = index;
    return accumulator;
  },
  {} as Record<UserRole, number>
);

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && value in ROLE_PRIORITY;

export function normalizeUserRoles(
  roles: Iterable<unknown> | undefined | null
): UserRole[] {
  if (!roles) {
    return [];
  }
  const unique = new Set<UserRole>();
  for (const role of roles) {
    if (isUserRole(role)) {
      unique.add(role);
    }
  }
  return Array.from(unique).sort(
    (a, b) => ROLE_PRIORITY[a] - ROLE_PRIORITY[b]
  );
}

export const roleOrder = [...ROLE_ORDER];
