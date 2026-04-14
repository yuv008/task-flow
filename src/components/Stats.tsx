"use client";

import { format } from "date-fns";

interface StatsProps {
  data: {
    currentStreak: number;
    longestStreak: number;
    totalTasks: number;
    totalCompleted: number;
    completionRate: number;
    last7Days: {
      date: string;
      total: number;
      completed: number;
      percentage: number;
    }[];
  } | null;
}

export default function Stats({ data }: StatsProps) {
  if (!data) return null;

  const maxTotal = Math.max(...data.last7Days.map((d) => d.total), 1);

  return (
    <div className="card animate-fade-in p-5">
      <h3 className="mb-4 text-sm font-semibold text-surface-900">
        Last 7 days
      </h3>

      <div className="flex items-end gap-1.5">
        {data.last7Days.map((day) => (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
            {/* Percentage label above bar — hidden when no tasks */}
            <div className="flex h-5 items-end justify-center">
              {day.total > 0 && (
                <span className="text-[9px] font-medium leading-none text-surface-400">
                  {day.percentage === 100 ? (
                    <span className="text-emerald-500" title="All done!">✓</span>
                  ) : (
                    `${day.percentage}%`
                  )}
                </span>
              )}
            </div>

            {/* Bar area */}
            <div className="relative flex h-28 w-full items-end justify-center">
              {/* Background bar (total) */}
              <div
                className="absolute bottom-0 w-full rounded-t-md bg-surface-100 transition-all"
                style={{ height: `${(day.total / maxTotal) * 100}%` }}
              />
              {/* Foreground bar (completed) */}
              <div
                className="absolute bottom-0 w-full rounded-t-md bg-brand-400 transition-all"
                style={{
                  height: `${(day.completed / maxTotal) * 100}%`,
                }}
              />
            </div>

            <span className="text-[10px] text-surface-400">
              {format(new Date(day.date + "T12:00:00"), "EEE")}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
        <div className="text-center">
          <div className="text-lg font-bold text-surface-900">
            {data.completionRate}%
          </div>
          <div className="text-xs text-surface-400">Rate</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-brand-600">
            {data.currentStreak}
          </div>
          <div className="text-xs text-surface-400">Streak</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-600">
            {data.longestStreak}
          </div>
          <div className="text-xs text-surface-400">Best</div>
        </div>
      </div>
    </div>
  );
}
