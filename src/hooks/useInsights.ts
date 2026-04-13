"use client";

import useSWR from "swr";

type TopicRetention = {
  topicTag: string;
  retentionRate: number;
};

type InsightsData = {
  bestStudyHour: number | null;
  topicRetention: TopicRetention[];
  studyStreak: { thisWeek: number; lastWeek: number };
  dailyVolume: Array<{ date: string; count: number }>;
  totalReviews: number;
};

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((response) => response.json());

export function useInsights() {
  const { data, error, isLoading } = useSWR<InsightsData>("/api/insights", fetcher, {
    revalidateOnFocus: false,
  });

  return {
    data: data ?? null,
    isLoading,
    hasData: (data?.totalReviews ?? 0) > 0,
    error: error ? "Failed to load insights" : null,
  };
}

export function formatHour(hour: number | null): string {
  if (hour === null) return "Not enough data";
  const period = hour < 12 ? "AM" : "PM";
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:00 ${period}`;
}
