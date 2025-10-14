import Link from "next/link";
import styles from "./styles.module.css";

export default function ApplySection() {
  return (
    <section className={styles.root}>
      <div className={styles.content + " " + "content-width"}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Подай заявку!</h2>
          <h3 className={styles.subtitle}>Хочешь на сцену?</h3>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} href="/participate">
            Принять участие
          </Link>
          <Link className={styles.secondaryAction} href="/rules">
            Узнать правила
          </Link>
        </div>
      </div>
    </section>
  );
}
