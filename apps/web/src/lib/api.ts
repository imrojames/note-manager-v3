import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000';

/** Shared axios instance — sends the auth cookie with every request. */
export const api = axios.create({
  baseURL,
  withCredentials: true,
});

/** Extract a human-friendly message from an API error. */
export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: { message?: string } } | undefined;
    return data?.error?.message ?? err.message ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
}
