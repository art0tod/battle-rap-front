import { ApiError } from "@/lib/api";

export function resolveApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Не удалось выполнить запрос. Попробуйте снова.";
}
