"use client";

import { format, subDays, addDays } from "date-fns";
import { cn, formatDateLabel } from "@/lib/utils";
import type { StreakInfo } from "@/types";

interface SidebarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  stats: StreakInfo | null;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({
  selectedDate,
  onDateSelect,
  stats,
  open,
  onClose,
}: SidebarProps) {
  const today = new Date();
  const dates: string[] = [];

  // Show 3 days before and 3 days after today
  for (let i = -7; i <= 3; i++) {
    const d = i < 0 ? subDays(today, -i) : i > 0 ? addDays(today, i) : today;
    dates.push(format(d, "yyyy-MM-dd"));
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] w-64 border-r bg-white transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col p-4 overflow-y-auto scrollbar-thin">
          {/* Stats */}
          {stats && (
            <div className="mb-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-400">
                Overview
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-brand-50 p-3">
                  <div className="text-2xl font-bold text-brand-700">
                    {stats.currentStreak}
                  </div>
                  <div className="text-xs text-brand-600">Day streak</div>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <div className="text-2xl font-bold text-emerald-700">
                    {stats.totalCompleted}
                  </div>
                  <div className="text-xs text-emerald-600">Completed</div>
                </div>
              </div>
              {stats.totalTasks > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-surface-500">
                    <span>All-time progress</span>
                    <span>
                      {Math.round(
                        (stats.totalCompleted / stats.totalTasks) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-100">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-500"
                      style={{
                        width: `${(stats.totalCompleted / stats.totalTasks) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date navigation */}
          <div className="space-y-1">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
              Days
            </h3>
            {dates.map((dateStr) => {
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === format(today, "yyyy-MM-dd");
              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    onDateSelect(dateStr);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    isSelected
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-surface-600 hover:bg-surface-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold",
                      isSelected
                        ? "bg-brand-600 text-white"
                        : isToday
                          ? "bg-surface-900 text-white"
                          : "bg-surface-100 text-surface-600"
                    )}
                  >
                    {format(
                      new Date(dateStr + "T12:00:00"),
                      "d"
                    )}
                  </span>
                  <div>
                    <div className={cn(isSelected ? "font-medium" : "")}>
                      {formatDateLabel(dateStr)}
                    </div>
                    <div className="text-xs text-surface-400">
                      {format(new Date(dateStr + "T12:00:00"), "EEEE")}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
