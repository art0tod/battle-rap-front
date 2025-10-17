import Image from "next/image";
import styles from "./styles.module.css";

export default function ProfileSection() {
  const profile = {
    firstName: "Алексей",
    lastName: "Немиров",
    alias: " Nova",
    rating: 124,
    city: "Москва",
    age: 27,
    image: "/participants/photo.jpg",
  };

  return (
    <section className={styles.root}>
      <div className={`${styles.content} content-width`}>
        <div className={styles.heading}>
          <h1 className={styles.title}>Профиль</h1>
        </div>
        <div className={styles.profileRow}>
          <div className={styles.profileMain}>
            <div className={styles.avatarWrapper}>
              <Image
                src={profile.image}
                alt={`${profile.firstName} ${profile.lastName}`}
                width={96}
                height={96}
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.profileDetails}>
              <p className={styles.profileName}>
                {profile.firstName} {profile.lastName}
              </p>
              <div className={styles.profileMeta}>
                <span className={styles.profileAlias}>{profile.alias}</span>
                <span className={styles.profileRating}>
                  Рейтинг {profile.rating}
                </span>
                <div className={styles.additional}>
                  <span className={styles.profileCity}>{profile.city}</span>
                  <span aria-hidden="true" className={styles.profileDivider}>
                    ·
                  </span>
                  <span className={styles.profileAge}>{profile.age} лет</span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.profileActions}>
            <button type="button" className={styles.secondaryAction}>
              Подписаться
            </button>
            <button type="button" className={styles.primaryAction}>
              Бросить вызов
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
