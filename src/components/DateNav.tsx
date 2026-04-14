"use client";

import { format, addDays, subDays, parseISO } from "date-fns";
import { formatDateLabel, cn } from "@/lib/utils";

interface DateNavProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  taskCount: number;
  completedCount: number;
}

export default function DateNav({
  selectedDate,
  onDateChange,
  taskCount,
  completedCount,
}: DateNavProps) {
  const date = parseISO(selectedDate);

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            onDateChange(format(subDays(date, 1), "yyyy-MM-dd"))
          }
          className="btn-ghost p-2"
          aria-label="Previous day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div>
          <h2 className="text-xl font-bold text-surface-900">
            {formatDateLabel(selectedDate)}
          </h2>
          <p className="text-xs text-surface-400">
            {format(date, "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        <button
          onClick={() =>
            onDateChange(format(addDays(date, 1), "yyyy-MM-dd"))
          }
          className="btn-ghost p-2"
          aria-label="Next day"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {taskCount > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500"
                style={{
                  width: `${taskCount > 0 ? (completedCount / taskCount) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs font-medium text-surface-500">
              {completedCount}/{taskCount}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
