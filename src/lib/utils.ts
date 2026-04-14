import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const inputDate = typeof date === "string" ? new Date(date) : new Date(date);
  const target = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  );

  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diffMs = todayMidnight.getTime() - target.getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(diffMs / dayMs);

  if (diffDays === 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function daysFromNow(n: number): Date {
  const base = new Date();
  const result = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  result.setDate(result.getDate() + n);
  return result;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }

  return str.slice(0, maxLength - 3) + "...";
}

export function pluralize(
  n: number,
  singular: string,
  plural?: string
): string {
  const word = n === 1 ? singular : (plural ?? `${singular}s`);
  return `${n} ${word}`;
}

export function getMasteryColor(masteryPercent: number): string {
  if (masteryPercent <= 25) {
    return "bg-rose-200";
  }

  if (masteryPercent <= 50) {
    return "bg-orange-200";
  }

  if (masteryPercent <= 75) {
    return "bg-amber-200";
  }

  return "bg-emerald-200";
}
