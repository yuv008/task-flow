"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import DateNav from "@/components/DateNav";
import TaskItem from "@/components/TaskItem";
import TaskForm from "@/components/TaskForm";
import Stats from "@/components/Stats";
import FilterTabs from "@/components/FilterTabs";
import WordOfDay from "@/components/WordOfDay";
import Toast from "@/components/Toast";
import { getTodayStr } from "@/lib/utils";
import type { Task } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type FilterValue = "all" | "pending" | "done";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "default";
    key: number;
  } | null>(null);
  const [newTaskTrigger, setNewTaskTrigger] = useState(0);

  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  const { data: tasks = [], mutate: mutateTasks } = useSWR<Task[]>(
    isAuthenticated ? `/api/tasks?date=${selectedDate}` : null,
    fetcher,
    { refreshInterval: 30000 }
  );

  const { data: stats, mutate: mutateStats } = useSWR(
    isAuthenticated ? "/api/stats" : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  // Keyboard shortcut: press "n" to open the task form (when no input is focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "n") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || target.isContentEditable) return;
      setNewTaskTrigger((t) => t + 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "default" = "default") => {
      setToast({ message, type, key: Date.now() });
    },
    []
  );

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleCreateTask = useCallback(
    async (data: {
      title: string;
      description?: string;
      priority: string;
      date: string;
    }) => {
      const tempId = `temp-${Date.now()}`;
      const optimisticTask: Task = {
        id: tempId,
        title: data.title,
        description: data.description || null,
        completed: false,
        priority: data.priority as Task["priority"],
        date: data.date,
        order: tasks.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: "",
      };

      mutateTasks([...tasks, optimisticTask], false);

      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          mutateTasks();
          mutateStats();
        }
      } catch {
        mutateTasks();
      }
    },
    [tasks, mutateTasks, mutateStats]
  );

  const handleToggle = useCallback(
    async (id: string, completed: boolean) => {
      mutateTasks(
        tasks.map((t) => (t.id === id ? { ...t, completed } : t)),
        false
      );

      try {
        await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        });
        mutateTasks();
        mutateStats();
      } catch {
        mutateTasks();
      }
    },
    [tasks, mutateTasks, mutateStats]
  );

  const handleUpdate = useCallback(
    async (id: string, data: Partial<Task>) => {
      mutateTasks(
        tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
        false
      );

      try {
        await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        mutateTasks();
      } catch {
        mutateTasks();
      }
    },
    [tasks, mutateTasks]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      mutateTasks(
        tasks.filter((t) => t.id !== id),
        false
      );

      try {
        await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        mutateTasks();
        mutateStats();
        showToast("Task deleted", "default");
      } catch {
        mutateTasks();
      }
    },
    [tasks, mutateTasks, mutateStats, showToast]
  );

  const handleCompleteAll = useCallback(async () => {
    if (pendingTasks.length === 0) return;

    // Optimistically mark all pending as completed
    mutateTasks(
      tasks.map((t) => (t.completed ? t : { ...t, completed: true })),
      false
    );

    try {
      await Promise.all(
        pendingTasks.map((task) =>
          fetch(`/api/tasks/${task.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: true }),
          })
        )
      );
      mutateTasks();
      mutateStats();
      showToast("All tasks completed!", "success");
    } catch {
      mutateTasks();
    }
  }, [pendingTasks, tasks, mutateTasks, mutateStats, showToast]);

  const handleClearDone = useCallback(async () => {
    if (completedTasks.length === 0) return;

    // Optimistically remove completed tasks
    mutateTasks(tasks.filter((t) => !t.completed), false);

    try {
      await Promise.all(
        completedTasks.map((task) =>
          fetch(`/api/tasks/${task.id}`, { method: "DELETE" })
        )
      );
      mutateTasks();
      mutateStats();
      showToast("Cleared completed tasks", "default");
    } catch {
      mutateTasks();
    }
  }, [completedTasks, tasks, mutateTasks, mutateStats, showToast]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-brand-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm text-surface-400 dark:text-surface-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const showPending = filter === "all" || filter === "pending";
  const showCompleted = filter === "all" || filter === "done";
  const showTaskForm = filter !== "done";

  return (
    <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1">
        <Sidebar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          stats={stats}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8">
            <DateNav
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              taskCount={tasks.length}
              completedCount={completedCount}
            />

            <WordOfDay />

            {/* Filter tabs */}
            <FilterTabs
              filter={filter}
              onChange={setFilter}
              counts={{
                all: tasks.length,
                pending: pendingTasks.length,
                done: completedTasks.length,
              }}
            />

            {/* Bulk action row */}
            {(pendingTasks.length > 0 || completedTasks.length > 0) && (
              <div className="mb-4 flex items-center justify-end gap-2">
                {filter !== "done" && pendingTasks.length > 0 && (
                  <button
                    onClick={handleCompleteAll}
                    className="btn-secondary text-xs py-1 px-3"
                  >
                    Complete all
                  </button>
                )}
                {completedTasks.length > 0 && (
                  <button
                    onClick={handleClearDone}
                    className="btn-ghost text-xs py-1 px-3"
                  >
                    Clear done
                  </button>
                )}
              </div>
            )}

            {/* Task list */}
            <div className="space-y-2">
              {showPending &&
                pendingTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}

              {showTaskForm && (
                <TaskForm
                  date={selectedDate}
                  onSubmit={handleCreateTask}
                  openTrigger={newTaskTrigger}
                />
              )}

              {/* Completed section */}
              {showCompleted && completedTasks.length > 0 && (
                <div className="pt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
                    Completed ({completedTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {completedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={handleToggle}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Empty state */}
            {tasks.length === 0 && (
              <div className="mt-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100 dark:bg-surface-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-surface-400 dark:text-surface-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-surface-600 dark:text-surface-400">
                  No tasks for this day
                </h3>
                <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">
                  Click &quot;Add a task&quot; to get started
                </p>
              </div>
            )}

            {/* Stats card */}
            {stats && stats.totalTasks > 0 && (
              <div className="mt-8">
                <Stats data={stats} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
