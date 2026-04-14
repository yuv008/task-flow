export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  date: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  date: string;
}

export interface DayStats {
  date: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  totalTasks: number;
}
