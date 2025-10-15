import { mkdir } from "node:fs/promises";

const dirsToEnsure = [
  ".next",
  ".next/static",
  ".next/static/development",
];

async function ensureDirectories() {
  for (const dir of dirsToEnsure) {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "EEXIST"
      ) {
        continue;
      }
      console.warn(`Не удалось создать каталог ${dir}:`, error);
    }
  }
}

ensureDirectories().catch((error) => {
  console.error("Ошибка подготовки окружения Next.js:", error);
  process.exitCode = 1;
});
