import { format, isToday, isYesterday, isTomorrow, parseISO } from "date-fns";

export function formatDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "EEEE, MMM d");
}

export function getTodayStr(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function priorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "text-red-500";
    case "medium":
      return "text-amber-500";
    case "low":
      return "text-blue-400";
    default:
      return "text-surface-400";
  }
}

export function priorityBg(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-50 border-red-200";
    case "medium":
      return "bg-amber-50 border-amber-200";
    case "low":
      return "bg-blue-50 border-blue-200";
    default:
      return "bg-surface-50 border-surface-200";
  }
}
