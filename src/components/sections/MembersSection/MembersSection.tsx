"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./styles.module.css";

type MemberRole = "battler" | "judge";

type Member = {
  id: number;
  nickname: string;
  name: string;
  image: string;
  rating: number;
  battles: number;
  joinedAt: string;
  role: MemberRole;
};

const members: Member[] = [
  {
    id: 1,
    nickname: "Nova",
    name: "Алексей Немиров",
    image: "/participants/photo.jpg",
    rating: 124,
    battles: 18,
    joinedAt: "2024-02-17",
    role: "battler",
  },
  {
    id: 2,
    nickname: "Гром",
    name: "Максим Литвинов",
    image: "/participants/photo.jpg",
    rating: 131,
    battles: 22,
    joinedAt: "2023-11-03",
    role: "battler",
  },
  {
    id: 3,
    nickname: "Vector",
    name: "Илья Киселёв",
    image: "/participants/photo.jpg",
    rating: 118,
    battles: 15,
    joinedAt: "2023-09-25",
    role: "battler",
  },
  {
    id: 4,
    nickname: "Pulse",
    name: "Егор Савицкий",
    image: "/participants/photo.jpg",
    rating: 142,
    battles: 27,
    joinedAt: "2022-12-14",
    role: "judge",
  },
  {
    id: 5,
    nickname: "Лира",
    name: "Мария Шарапова",
    image: "/participants/photo.jpg",
    rating: 110,
    battles: 9,
    joinedAt: "2024-03-04",
    role: "judge",
  },
  {
    id: 6,
    nickname: "Rez",
    name: "Дмитрий Федоров",
    image: "/participants/photo.jpg",
    rating: 135,
    battles: 24,
    joinedAt: "2023-06-08",
    role: "battler",
  },
];

type SortOption = "date" | "rating" | "battles";
type RoleOption = "all" | MemberRole;

const ROLE_OPTIONS: RoleOption[] = ["all", "battler", "judge"];
const SORT_OPTIONS: SortOption[] = ["date", "rating", "battles"];

const sortLabels: Record<SortOption, string> = {
  date: "Дата регистрации",
  rating: "Рейтинг",
  battles: "Количество баттлов",
};

function parseRole(value: string | null): RoleOption {
  if (value === "battler" || value === "judge") {
    return value;
  }
  return "all";
}

function parseSort(value: string | null): SortOption {
  if (value === "rating" || value === "battles") {
    return value;
  }
  return "date";
}

export default function MembersSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    () => parseSort(searchParams.get("sort")),
  );
  const [roleFilter, setRoleFilter] = useState<RoleOption>(
    () => parseRole(searchParams.get("role")),
  );

  const pushQuery = useCallback(
    (nextSearch: string, nextSort: SortOption, nextRole: RoleOption) => {
      const params = new URLSearchParams();

      if (nextSearch.trim()) {
        params.set("search", nextSearch);
      }

      params.set("sort", nextSort);
      params.set("role", nextRole);

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    const paramSearch = searchParams.get("search") ?? "";
    if (paramSearch !== searchValue) {
      setSearchValue(paramSearch);
    }

    const paramSort = parseSort(searchParams.get("sort"));
    if (paramSort !== sortBy) {
      setSortBy(paramSort);
    }

    const paramRole = parseRole(searchParams.get("role"));
    if (paramRole !== roleFilter) {
      setRoleFilter(paramRole);
    }
  }, [searchParams, searchValue, sortBy, roleFilter]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setSearchValue(nextValue);
      pushQuery(nextValue, sortBy, roleFilter);
    },
    [pushQuery, roleFilter, sortBy],
  );

  const handleRoleChange = useCallback(
    (option: RoleOption) => {
      setRoleFilter(option);
      pushQuery(searchValue, sortBy, option);
    },
    [pushQuery, searchValue, sortBy],
  );

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSortBy(value);
      pushQuery(searchValue, value, roleFilter);
    },
    [pushQuery, roleFilter, searchValue],
  );

  const visibleMembers = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    let filtered = members;

    if (normalizedQuery) {
      filtered = filtered.filter((member) => {
        const lookup = `${member.nickname} ${member.name}`.toLowerCase();
        return lookup.includes(normalizedQuery);
      });
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((member) => member.role === roleFilter);
    }

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        );
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      return b.battles - a.battles;
    });

    return sorted;
  }, [searchValue, sortBy, roleFilter]);

  return (
    <section className={styles.root}>
      <div className={styles.backgroundBlock}>
        <div className={`${styles.content} content-width`}>
          <div className={styles.heading}>
            <h1 className={styles.title}>Участники</h1>
          </div>

          <div className={styles.controls}>
            <label className={styles.searchField}>
              <span className={styles.visuallyHidden}>Поиск по нику</span>
              <input
                className={styles.searchInput}
                placeholder="Найти по нику или имени"
                type="search"
                value={searchValue}
                onChange={handleSearchChange}
              />
            </label>

            <div className={styles.controlGroup}>
              <span className={styles.controlLabel}>Фильтр</span>
              <div className={styles.filterChips}>
                {ROLE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={
                      roleFilter === option
                        ? `${styles.chip} ${styles.chipActive}`
                        : styles.chip
                    }
                    onClick={() => handleRoleChange(option)}
                  >
                    {option === "all"
                      ? "Все"
                      : option === "battler"
                        ? "Баттлеры"
                        : "Судьи"}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.controlGroup}>
              <label className={styles.controlLabel} htmlFor="members-sort">
                Сортировка
              </label>
              <select
                id="members-sort"
                className={styles.sortSelect}
                value={sortBy}
                onChange={(event) =>
                  handleSortChange(event.target.value as SortOption)
                }
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {sortLabels[option]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.cardsWrapper} content-width`}>
        <div className={styles.results}>
          {visibleMembers.length === 0 ? (
            <p className={styles.emptyState}>Ничего не найдено</p>
          ) : (
            <ul className={styles.membersList}>
              {visibleMembers.map((member) => (
                <li key={member.id} className={styles.memberCard}>
                  <div className={styles.memberImageWrapper}>
                    <Image
                      src={member.image}
                      alt={member.nickname}
                      width={240}
                      height={240}
                      className={styles.memberImage}
                    />
                  </div>
                  <div className={styles.memberMeta}>
                    <span className={styles.memberNickname}>
                      {member.nickname}
                    </span>
                    <span className={styles.memberRole}>
                      {member.role === "judge" ? "Судья" : "Баттлер"}
                    </span>
                  </div>
                  <p className={styles.memberName}>{member.name}</p>
                  <div className={styles.memberStats}>
                    <span>Рейтинг {member.rating}</span>
                    <span>Баттлов {member.battles}</span>
                    <span>С {formatDate(member.joinedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
