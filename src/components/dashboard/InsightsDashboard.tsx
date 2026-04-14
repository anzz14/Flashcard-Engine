"use client";

import { motion } from "framer-motion";
import { Badge, getTopicColor } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { formatHour, useInsights } from "@/hooks/useInsights";

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-white">
            {label}
          </p>
          {sub ? <p className="truncate text-[10px] text-white">{sub}</p> : null}
        </div>
        <p className="shrink-0 text-lg font-bold leading-none text-[#ff6a3d]">
          {value}
        </p>
      </div>
    </Card>
  );
}

export default function InsightsDashboard() {
  const { data, isLoading, hasData, error } = useInsights();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-white">
        <Spinner size="sm" /> Loading insights...
      </div>
    );
  }

  if (error || !hasData || !data) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-white">Complete a few study sessions to unlock your insights.</p>
      </Card>
    );
  }

  const maxCount = Math.max(...data.dailyVolume.map((day) => day.count), 10);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[#ff6a3d]">Study Insights</h2>

      <div className="grid grid-cols-4 gap-2 overflow-x-auto">
        <StatCard label="Total Reviews" value={String(data.totalReviews)} sub="Last 30 days" />
        <StatCard
          label="Best Study Time"
          value={formatHour(data.bestStudyHour)}
          sub="When you recall best"
        />
        <StatCard
          label="Days this week"
          value={String(data.studyStreak.thisWeek)}
          sub={`${data.studyStreak.lastWeek} days last week`}
        />
        <StatCard label="Topics tracked" value={String(data.topicRetention.length)} sub="With retention data" />
      </div>

      {data.dailyVolume.length > 0 ? (
        <Card className="p-5">
          <p className="mb-4 text-sm font-semibold text-[#ff6a3d]">Daily Review Volume</p>
          <div className="flex items-end gap-1.5">
            {data.dailyVolume.map((day, index) => {
              const heightPercent = Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 0);
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-[#ff6a3d]">{day.count}</span>
                  <div className="flex h-24 w-full items-end justify-center">
                    <motion.div
                      className="w-2 rounded-t-sm bg-[#ff6a3d]"
                      style={{ height: `${heightPercent}%`, transformOrigin: "bottom" }}
                      initial={{ scaleY: 0.15 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      title={`${day.date}: ${day.count} reviews`}
                    />
                  </div>
                  <span className="text-[10px] text-white">
                    {day.date}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {data.topicRetention.length > 0 ? (
        <Card className="p-5">
          <p className="mb-4 text-sm font-semibold text-[#ff6a3d]">Topic Retention — hardest first</p>
          <div className="space-y-3">
            {data.topicRetention.map((topic) => (
              <div key={topic.topicTag} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge label={topic.topicTag} color={getTopicColor(topic.topicTag)} />
                  </div>
                  <span className="text-sm font-semibold text-[#fffff]">{topic.retentionRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full border-1 border-[#ff6a3d] bg-transparent">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      topic.retentionRate < 40
                        ? "bg-red-400"
                        : topic.retentionRate < 70
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                    }`}
                    style={{ width: `${topic.retentionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
