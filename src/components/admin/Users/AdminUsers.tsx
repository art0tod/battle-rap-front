"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { battleRapApi, type AdminUser, type UserRole } from "@/lib/api";
import { normalizeUserRoles, roleOrder } from "@/lib/roles";
import { useAuth } from "@/components/auth/AuthProvider/AuthProvider";
import { resolveApiErrorMessage } from "../utils";
import styles from "./styles.module.css";

type ManagedRole = Exclude<UserRole, "user">;

const ROLE_OPTIONS: Array<{ value: ManagedRole | ""; label: string }> = [
  { value: "", label: "Без роли" },
  { value: "listener", label: translateRole("listener") },
  { value: "artist", label: translateRole("artist") },
  { value: "judge", label: translateRole("judge") },
  { value: "moderator", label: translateRole("moderator") },
  { value: "admin", label: translateRole("admin") },
];

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [pendingRoleUpdates, setPendingRoleUpdates] = useState<
    Record<string, boolean>
  >({});

  const loadUsers = useCallback(async () => {
    if (!token) {
      setError("Нет токена авторизации. Перезайдите в аккаунт администратора.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await battleRapApi.admin.listUsers(undefined, { token });
      setUsers(response.data.map(normalizeUserRecord));
    } catch (cause) {
      setError(resolveApiErrorMessage(cause));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleRoleChange = useCallback(
    async (userId: string, nextRole: ManagedRole | "") => {
      if (!token) {
        setError(
          "Нет токена авторизации. Перезайдите в аккаунт администратора."
        );
        return;
      }
      const targetUser = users.find((candidate) => candidate.id === userId);
      if (!targetUser) {
        setError("Не удалось найти пользователя для обновления роли.");
        return;
      }
      const currentRole = getPrimaryRole(targetUser.roles);
      const normalizedNextRole = nextRole === "" ? null : nextRole;
      if (currentRole === normalizedNextRole) {
        return;
      }
      setPendingRoleUpdates((prev) => ({ ...prev, [userId]: true }));
      setError(null);
      try {
        const applyRoles = (roles: UserRole[]) => {
          const normalized = normalizeRolesInput(roles);
          setUsers((prev) =>
            prev.map((user) =>
              user.id === userId ? { ...user, roles: normalized } : user
            )
          );
          return normalized;
        };

        if (!normalizedNextRole) {
          if (currentRole) {
            const revokeResponse = await battleRapApi.admin.setUserRole(
              userId,
              { op: "revoke", role: currentRole },
              { token }
            );
            applyRoles(revokeResponse.roles);
          }
        } else {
          if (currentRole && currentRole !== normalizedNextRole) {
            const revokeResponse = await battleRapApi.admin.setUserRole(
              userId,
              { op: "revoke", role: currentRole },
              { token }
            );
            applyRoles(revokeResponse.roles);
          }
          const grantResponse = await battleRapApi.admin.setUserRole(
            userId,
            { op: "grant", role: normalizedNextRole },
            { token }
          );
          applyRoles(grantResponse.roles);
        }
      } catch (cause) {
        setError(resolveApiErrorMessage(cause));
      } finally {
        setPendingRoleUpdates((prev) => {
          const { [userId]: _unused, ...rest } = prev;
          return rest;
        });
      }
    },
    [token, users]
  );

  const visibleUsers = useMemo(() => {
    if (!filter.trim()) {
      return users;
    }
    const lower = filter.trim().toLowerCase();
    return users.filter((user) => {
      const haystack = `${user.displayName} ${user.email} ${user.roles.join(
        " "
      )}`.toLowerCase();
      return haystack.includes(lower);
    });
  }, [filter, users]);

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Пользователи</h2>
          <p className={styles.description}>
            Управляйте доступом и отслеживайте роли участников.
          </p>
        </div>
        <div className={styles.actions}>
          <input
            className={styles.searchInput}
            placeholder="Поиск по имени, почте или роли"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            type="search"
          />
          <button
            className={styles.refreshButton}
            disabled={isLoading}
            onClick={() => {
              void loadUsers();
            }}
            type="button"
          >
            {isLoading ? "Обновление..." : "Обновить"}
          </button>
        </div>
      </header>
      {error ? (
        <div className={styles.errorBox}>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => {
              void loadUsers();
            }}
            type="button"
          >
            Повторить
          </button>
        </div>
      ) : null}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Роли</th>
              <th>Создан</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && users.length === 0 ? (
              <tr>
                <td className={styles.emptyCell} colSpan={4}>
                  Загрузка пользователей...
                </td>
              </tr>
            ) : null}
            {!isLoading && visibleUsers.length === 0 ? (
              <tr>
                <td className={styles.emptyCell} colSpan={4}>
                  Ничего не найдено.
                </td>
              </tr>
            ) : null}
            {visibleUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.primaryCell}>{user.displayName}</div>
                  <div className={styles.metaCell}>
                    ID: <span className={styles.mono}>{user.id}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <select
                    className={styles.roleSelect}
                    disabled={Boolean(pendingRoleUpdates[user.id])}
                    onChange={(event) => {
                      const selected = event.target.value as ManagedRole | "";
                      void handleRoleChange(user.id, selected);
                    }}
                    value={getPrimaryRole(user.roles) ?? ""}
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value || "none"} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleString("ru-RU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function normalizeRolesInput(
  roles:
    | UserRole[]
    | string
    | string[]
    | Record<string, unknown>
    | null
    | undefined
): UserRole[] {
  if (!roles) {
    return [];
  }

  const collect = (): Iterable<unknown> => {
    if (Array.isArray(roles)) {
      return roles;
    }
    if (typeof roles === "string") {
      return roles
        .split(/[,\s]+/)
        .map((role) => role.trim())
        .filter(Boolean);
    }
    if (typeof roles === "object") {
      return Object.entries(roles)
        .filter(([, value]) => Boolean(value))
        .map(([role]) => role.trim());
    }
    return [];
  };

  return normalizeUserRoles(collect());
}

function getPrimaryRole(roles: UserRole[]): ManagedRole | null {
  const manageableRoles = roles.filter(
    (role): role is ManagedRole => role !== "user"
  );
  if (manageableRoles.length === 0) {
    return null;
  }
  const order = roleOrder.filter(
    (candidate): candidate is ManagedRole => candidate !== "user"
  );
  const sorted = manageableRoles.sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  );
  return sorted[0] ?? null;
}

function translateRole(role: string): string {
  const dictionary: Record<string, string> = {
    admin: "Администратор",
    moderator: "Модератор",
    judge: "Судья",
    artist: "Исполнитель",
    listener: "Слушатель",
    user: "Пользователь",
  };
  return dictionary[role] ?? role;
}

function normalizeUserRecord(user: AdminUser): AdminUser {
  return {
    ...user,
    roles: normalizeRolesInput(user.roles),
  };
}
