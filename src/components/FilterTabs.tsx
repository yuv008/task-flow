"use client";

import { cn } from "@/lib/utils";

type FilterValue = "all" | "pending" | "done";

interface FilterTabsProps {
  filter: FilterValue;
  onChange: (f: FilterValue) => void;
  counts: {
    all: number;
    pending: number;
    done: number;
  };
}

const TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "done", label: "Done" },
];

export default function FilterTabs({ filter, onChange, counts }: FilterTabsProps) {
  return (
    <div className="mb-4 flex items-center gap-1.5" role="tablist" aria-label="Task filter">
      {TABS.map((tab) => {
        const isActive = filter === tab.value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-600 text-white shadow-sm"
                : "text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                isActive
                  ? "bg-white/25 text-white"
                  : "bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400"
              )}
            >
              {counts[tab.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
