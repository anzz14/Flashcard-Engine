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
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <Card className="space-y-1 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-3xl font-bold text-slate-900 ${accent ?? ""}`}>{value}</p>
      {sub ? <p className="text-xs text-slate-500">{sub}</p> : null}
    </Card>
  );
}

export default function InsightsDashboard() {
  const { data, isLoading, hasData, error } = useInsights();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
        <Spinner size="sm" /> Loading insights...
      </div>
    );
  }

  if (error || !hasData || !data) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-slate-500">Complete a few study sessions to unlock your insights.</p>
      </Card>
    );
  }

  const maxCount = Math.max(...data.dailyVolume.map((day) => day.count), 10);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Study Insights</h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Reviews" value={String(data.totalReviews)} sub="Last 30 days" />
        <StatCard
          label="Best Study Time"
          value={formatHour(data.bestStudyHour)}
          sub="When you recall best"
          accent="text-indigo-600"
        />
        <StatCard
          label="Days this week"
          value={String(data.studyStreak.thisWeek)}
          sub={`${data.studyStreak.lastWeek} days last week`}
          accent={data.studyStreak.thisWeek >= data.studyStreak.lastWeek ? "text-emerald-600" : "text-orange-600"}
        />
        <StatCard label="Topics tracked" value={String(data.topicRetention.length)} sub="With retention data" />
      </div>

      {data.dailyVolume.length > 0 ? (
        <Card className="p-5">
          <p className="mb-4 text-sm font-semibold text-slate-700">Daily Review Volume</p>
          <div className="flex items-end gap-1.5">
            {data.dailyVolume.map((day, index) => {
              const heightPercent = Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 0);
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-slate-500">{day.count}</span>
                  <div className="flex h-24 w-full items-end justify-center">
                    <motion.div
                      className="w-2 rounded-t-sm bg-indigo-400"
                      style={{ height: `${heightPercent}%`, transformOrigin: "bottom" }}
                      initial={{ scaleY: 0.15 }}
                      whileInView={{ scaleY: 1 }}
                      viewport={{ once: true, amount: 0.1 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      title={`${day.date}: ${day.count} reviews`}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">
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
          <p className="mb-4 text-sm font-semibold text-slate-700">Topic Retention — hardest first</p>
          <div className="space-y-3">
            {data.topicRetention.map((topic) => (
              <div key={topic.topicTag} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge label={topic.topicTag} color={getTopicColor(topic.topicTag)} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{topic.retentionRate}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
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
