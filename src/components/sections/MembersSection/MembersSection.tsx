"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  {
    id: 7,
    nickname: "Магнит",
    name: "Константин Васильев",
    image: "/participants/photo.jpg",
    rating: 128,
    battles: 20,
    joinedAt: "2023-04-19",
    role: "battler",
  },
  {
    id: 8,
    nickname: "Оса",
    name: "Наталья Котова",
    image: "/participants/photo.jpg",
    rating: 102,
    battles: 11,
    joinedAt: "2024-01-08",
    role: "battler",
  },
  {
    id: 9,
    nickname: "Байт",
    name: "Роман Гусев",
    image: "/participants/photo.jpg",
    rating: 149,
    battles: 31,
    joinedAt: "2022-08-27",
    role: "judge",
  },
  {
    id: 10,
    nickname: "Lumen",
    name: "Сергей Волков",
    image: "/participants/photo.jpg",
    rating: 121,
    battles: 19,
    joinedAt: "2023-07-15",
    role: "battler",
  },
  {
    id: 11,
    nickname: "Вольт",
    name: "Григорий Михайлов",
    image: "/participants/photo.jpg",
    rating: 133,
    battles: 26,
    joinedAt: "2022-11-30",
    role: "battler",
  },
  {
    id: 12,
    nickname: "Саба",
    name: "Сабина Каримова",
    image: "/participants/photo.jpg",
    rating: 117,
    battles: 17,
    joinedAt: "2023-10-09",
    role: "judge",
  },
  {
    id: 13,
    nickname: "Рубик",
    name: "Матвей Орлов",
    image: "/participants/photo.jpg",
    rating: 108,
    battles: 13,
    joinedAt: "2024-04-12",
    role: "battler",
  },
  {
    id: 14,
    nickname: "Glass",
    name: "Игорь Нестеров",
    image: "/participants/photo.jpg",
    rating: 140,
    battles: 29,
    joinedAt: "2022-05-18",
    role: "judge",
  },
  {
    id: 15,
    nickname: "Киото",
    name: "Рустам Исаев",
    image: "/participants/photo.jpg",
    rating: 126,
    battles: 21,
    joinedAt: "2023-03-03",
    role: "battler",
  },
  {
    id: 16,
    nickname: "Флинт",
    name: "Арсений Лебедев",
    image: "/participants/photo.jpg",
    rating: 104,
    battles: 12,
    joinedAt: "2024-05-05",
    role: "battler",
  },
  {
    id: 17,
    nickname: "Кассета",
    name: "Маргарита Зуева",
    image: "/participants/photo.jpg",
    rating: 112,
    battles: 16,
    joinedAt: "2023-08-21",
    role: "judge",
  },
  {
    id: 18,
    nickname: "Кочевник",
    name: "Данил Чернов",
    image: "/participants/photo.jpg",
    rating: 138,
    battles: 25,
    joinedAt: "2022-09-12",
    role: "battler",
  },
  {
    id: 19,
    nickname: "Мел",
    name: "Елена Галкина",
    image: "/participants/photo.jpg",
    rating: 119,
    battles: 18,
    joinedAt: "2023-12-02",
    role: "judge",
  },
  {
    id: 20,
    nickname: "Клык",
    name: "Антон Еремин",
    image: "/participants/photo.jpg",
    rating: 130,
    battles: 23,
    joinedAt: "2022-07-07",
    role: "battler",
  },
  {
    id: 21,
    nickname: "Основной",
    name: "Павел Рябов",
    image: "/participants/photo.jpg",
    rating: 123,
    battles: 20,
    joinedAt: "2023-01-19",
    role: "judge",
  },
  {
    id: 22,
    nickname: "Радар",
    name: "Станислав Мельников",
    image: "/participants/photo.jpg",
    rating: 136,
    battles: 27,
    joinedAt: "2022-04-10",
    role: "battler",
  },
  {
    id: 23,
    nickname: "Pepper",
    name: "Виктория Осипова",
    image: "/participants/photo.jpg",
    rating: 114,
    battles: 14,
    joinedAt: "2023-09-11",
    role: "battler",
  },
  {
    id: 24,
    nickname: "Duke",
    name: "Армен Манукян",
    image: "/participants/photo.jpg",
    rating: 146,
    battles: 32,
    joinedAt: "2022-03-28",
    role: "judge",
  },
  {
    id: 25,
    nickname: "Янтарь",
    name: "Кира Руднева",
    image: "/participants/photo.jpg",
    rating: 109,
    battles: 11,
    joinedAt: "2024-02-06",
    role: "judge",
  },
  {
    id: 26,
    nickname: "Stream",
    name: "Артур Калинин",
    image: "/participants/photo.jpg",
    rating: 137,
    battles: 28,
    joinedAt: "2022-10-04",
    role: "battler",
  },
  {
    id: 27,
    nickname: "Фир",
    name: "Лев Захаров",
    image: "/participants/photo.jpg",
    rating: 125,
    battles: 22,
    joinedAt: "2023-05-14",
    role: "battler",
  },
  {
    id: 28,
    nickname: "Искра",
    name: "Оксана Денисова",
    image: "/participants/photo.jpg",
    rating: 115,
    battles: 15,
    joinedAt: "2023-07-01",
    role: "judge",
  },
  {
    id: 29,
    nickname: "Bloc",
    name: "Дмитрий Афанасьев",
    image: "/participants/photo.jpg",
    rating: 132,
    battles: 24,
    joinedAt: "2022-06-16",
    role: "battler",
  },
  {
    id: 30,
    nickname: "Swipe",
    name: "Аркадий Потапов",
    image: "/participants/photo.jpg",
    rating: 143,
    battles: 30,
    joinedAt: "2022-02-11",
    role: "judge",
  },
  {
    id: 31,
    nickname: "Шанс",
    name: "Жанна Тихонова",
    image: "/participants/photo.jpg",
    rating: 113,
    battles: 14,
    joinedAt: "2023-11-24",
    role: "battler",
  },
  {
    id: 32,
    nickname: "Плавник",
    name: "Иван Королёв",
    image: "/participants/photo.jpg",
    rating: 127,
    battles: 21,
    joinedAt: "2023-02-18",
    role: "battler",
  },
  {
    id: 33,
    nickname: "Мор",
    name: "Никита Данилов",
    image: "/participants/photo.jpg",
    rating: 134,
    battles: 26,
    joinedAt: "2022-09-02",
    role: "judge",
  },
  {
    id: 34,
    nickname: "Rift",
    name: "Владислав Дроздов",
    image: "/participants/photo.jpg",
    rating: 129,
    battles: 23,
    joinedAt: "2022-12-19",
    role: "battler",
  },
  {
    id: 35,
    nickname: "Сигма",
    name: "Татьяна Фролова",
    image: "/participants/photo.jpg",
    rating: 118,
    battles: 17,
    joinedAt: "2023-08-05",
    role: "judge",
  },
  {
    id: 36,
    nickname: "Core",
    name: "Эдуард Макаров",
    image: "/participants/photo.jpg",
    rating: 141,
    battles: 29,
    joinedAt: "2022-01-22",
    role: "battler",
  },
  {
    id: 37,
    nickname: "Сектор",
    name: "Андрей Крылов",
    image: "/participants/photo.jpg",
    rating: 120,
    battles: 18,
    joinedAt: "2023-04-01",
    role: "battler",
  },
  {
    id: 38,
    nickname: "Mirra",
    name: "Валерия Пономарёва",
    image: "/participants/photo.jpg",
    rating: 116,
    battles: 16,
    joinedAt: "2023-09-29",
    role: "judge",
  },
  {
    id: 39,
    nickname: "Peak",
    name: "Олег Самсонов",
    image: "/participants/photo.jpg",
    rating: 144,
    battles: 31,
    joinedAt: "2021-12-08",
    role: "judge",
  },
  {
    id: 40,
    nickname: "Якорь",
    name: "Георгий Лаптев",
    image: "/participants/photo.jpg",
    rating: 122,
    battles: 19,
    joinedAt: "2023-03-27",
    role: "battler",
  },
  {
    id: 41,
    nickname: "Формат",
    name: "Владимир Игнатьев",
    image: "/participants/photo.jpg",
    rating: 131,
    battles: 25,
    joinedAt: "2022-08-30",
    role: "judge",
  },
  {
    id: 42,
    nickname: "Эхо",
    name: "Марина Корзина",
    image: "/participants/photo.jpg",
    rating: 111,
    battles: 13,
    joinedAt: "2024-01-26",
    role: "battler",
  },
  {
    id: 43,
    nickname: "Grit",
    name: "Пётр Фадеев",
    image: "/participants/photo.jpg",
    rating: 139,
    battles: 27,
    joinedAt: "2022-05-09",
    role: "battler",
  },
  {
    id: 44,
    nickname: "Рифмастер",
    name: "Юлия Соловьёва",
    image: "/participants/photo.jpg",
    rating: 124,
    battles: 18,
    joinedAt: "2023-06-22",
    role: "judge",
  },
  {
    id: 45,
    nickname: "Токий",
    name: "Виктор Белов",
    image: "/participants/photo.jpg",
    rating: 134,
    battles: 26,
    joinedAt: "2022-07-21",
    role: "battler",
  },
];

type SortOption = "date" | "rating" | "battles";
type RoleOption = "all" | MemberRole;

const ROLE_OPTIONS: RoleOption[] = ["all", "battler", "judge"];
const SORT_OPTIONS: SortOption[] = ["date", "rating", "battles"];
const PAGE_SIZE = 12;

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

function parsePage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

export default function MembersSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const cardsWrapperRef = useRef<HTMLDivElement | null>(null);

  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") ?? "",
  );
  const [sortBy, setSortBy] = useState<SortOption>(
    () => parseSort(searchParams.get("sort")),
  );
  const [roleFilter, setRoleFilter] = useState<RoleOption>(
    () => parseRole(searchParams.get("role")),
  );
  const [page, setPage] = useState(() => parsePage(searchParams.get("page")));

  const pushQuery = useCallback(
    (
      nextSearch: string,
      nextSort: SortOption,
      nextRole: RoleOption,
      nextPage: number,
    ) => {
      const params = new URLSearchParams();

      if (nextSearch.trim()) {
        params.set("search", nextSearch);
      }

      params.set("sort", nextSort);
      params.set("role", nextRole);
      if (nextPage > 1) {
        params.set("page", String(nextPage));
      }

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [pathname, router],
  );

  useEffect(() => {
    const paramSearch = searchParams.get("search") ?? "";
    setSearchValue((prev) => (prev === paramSearch ? prev : paramSearch));

    const paramSort = parseSort(searchParams.get("sort"));
    setSortBy((prev) => (prev === paramSort ? prev : paramSort));

    const paramRole = parseRole(searchParams.get("role"));
    setRoleFilter((prev) => (prev === paramRole ? prev : paramRole));

    const paramPage = parsePage(searchParams.get("page"));
    setPage((prev) => (prev === paramPage ? prev : paramPage));
  }, [searchParams]);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setSearchValue(nextValue);
      setPage(1);
      pushQuery(nextValue, sortBy, roleFilter, 1);
    },
    [pushQuery, roleFilter, sortBy],
  );

  const handleRoleChange = useCallback(
    (option: RoleOption) => {
      setRoleFilter(option);
      setPage(1);
      pushQuery(searchValue, sortBy, option, 1);
    },
    [pushQuery, searchValue, sortBy],
  );

  const handleSortChange = useCallback(
    (value: SortOption) => {
      setSortBy(value);
      setPage(1);
      pushQuery(searchValue, value, roleFilter, 1);
    },
    [pushQuery, roleFilter, searchValue],
  );

  const filteredMembers = useMemo(() => {
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE)),
    [filteredMembers.length],
  );

  useEffect(() => {
    if (page > totalPages) {
      const nextPage = totalPages;
      setPage(nextPage);
      pushQuery(searchValue, sortBy, roleFilter, nextPage);
    }
  }, [page, totalPages, pushQuery, roleFilter, searchValue, sortBy]);

  const currentPage = Math.min(page, totalPages);
  const visibleMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredMembers.slice(start, start + PAGE_SIZE);
  }, [filteredMembers, currentPage]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (nextPage === page) return;
      if (cardsWrapperRef.current) {
        cardsWrapperRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setPage(nextPage);
      pushQuery(searchValue, sortBy, roleFilter, nextPage);
    },
    [page, pushQuery, roleFilter, searchValue, sortBy],
  );

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }, [totalPages]);

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

      <div className={`${styles.cardsWrapper} content-width`} ref={cardsWrapperRef}>
        <div className={styles.results}>
          {visibleMembers.length === 0 ? (
            <p className={styles.emptyState}>Ничего не найдено</p>
          ) : (
            <ul className={styles.membersList}>
              {visibleMembers.map((member) => (
                <li key={member.id}>
                  <Link
                    className={styles.memberCard}
                    href={`/profile?name=${encodeURIComponent(member.name)}`}
                  >
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
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {filteredMembers.length > 0 ? (
          <div className={styles.pagination}>
            <button
              type="button"
              className={currentPage === 1 ? styles.pageButtonDisabled : styles.pageButton}
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Назад
            </button>
            <ul className={styles.pageList}>
              {pageNumbers.map((pageNumber) => (
                <li key={pageNumber}>
                  <button
                    type="button"
                    className={
                      pageNumber === currentPage
                        ? `${styles.pageButton} ${styles.pageButtonActive}`
                        : styles.pageButton
                    }
                    onClick={() => handlePageChange(pageNumber)}
                    aria-current={pageNumber === currentPage ? "page" : undefined}
                  >
                    {pageNumber}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={currentPage === totalPages ? styles.pageButtonDisabled : styles.pageButton}
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Вперёд
            </button>
          </div>
        ) : null}
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
