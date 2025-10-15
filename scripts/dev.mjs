import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const dirsToEnsure = [
  ".next",
  ".next/static",
  ".next/static/development",
];

let isEnsuring = false;

async function ensureDirectories() {
  if (isEnsuring) {
    return;
  }
  isEnsuring = true;

  try {
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
  } finally {
    isEnsuring = false;
  }
}

await ensureDirectories();

const intervalId = setInterval(() => {
  ensureDirectories().catch((error) => {
    console.warn("Ошибка при повторном создании директорий .next:", error);
  });
}, 1500);

const devProcess = spawn("next", ["dev", "--turbopack"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

const cleanupAndExit = (code) => {
  clearInterval(intervalId);
  process.exit(code ?? 0);
};

devProcess.on("exit", (code) => {
  cleanupAndExit(code);
});

devProcess.on("error", (error) => {
  console.error("Не удалось запустить next dev:", error);
  cleanupAndExit(1);
});

process.on("SIGINT", () => {
  devProcess.kill("SIGINT");
});

process.on("SIGTERM", () => {
  devProcess.kill("SIGTERM");
});

process.on("exit", () => {
  clearInterval(intervalId);
});
