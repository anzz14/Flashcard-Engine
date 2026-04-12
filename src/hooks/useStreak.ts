"use client";

import useSWR from "swr";

type StreakApiResponse = {
  streakCurrent: number;
  streakLongest: number;
  lastStudiedAt?: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useStreak() {
  const { data, error } = useSWR<StreakApiResponse>("/api/user/streak", fetcher);

  return {
    streakCurrent: data?.streakCurrent ?? 0,
    streakLongest: data?.streakLongest ?? 0,
    isLoading: !data && !error,
  };
}
