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
      {/* Mobile overlay — covers full screen including header */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          // Mobile: full-height drawer from top, above everything
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          // Desktop: static in the flex layout, no shadow
          "lg:static lg:inset-y-auto lg:z-auto lg:w-64 lg:shadow-none lg:translate-x-0 lg:border-r",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile header row with close button */}
        <div className="flex items-center justify-between border-b px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-surface-900">TaskFlow</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 hover:text-surface-600"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(100%-3.25rem)] flex-col p-4 overflow-y-auto scrollbar-thin lg:h-full">
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
