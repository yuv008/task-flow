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
import { getTodayStr } from "@/lib/utils";
import type { Task } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  const {
    data: tasks = [],
    mutate: mutateTasks,
  } = useSWR<Task[]>(
    isAuthenticated ? `/api/tasks?date=${selectedDate}` : null,
    fetcher,
    { refreshInterval: 30000 } // Poll every 30s for near real-time sync
  );

  const { data: stats, mutate: mutateStats } = useSWR(
    isAuthenticated ? "/api/stats" : null,
    fetcher,
    { refreshInterval: 60000 }
  );

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleCreateTask = useCallback(
    async (data: { title: string; description?: string; priority: string; date: string }) => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticTask: Task = {
        id: tempId,
        title: data.title,
        description: data.description || null,
        completed: false,
        priority: data.priority as any,
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
      // Optimistic update
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
      } catch {
        mutateTasks();
      }
    },
    [tasks, mutateTasks, mutateStats]
  );

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
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
          <span className="text-sm text-surface-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
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

            {/* Task list */}
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}

              <TaskForm date={selectedDate} onSubmit={handleCreateTask} />

              {/* Completed section */}
              {completedTasks.length > 0 && (
                <div className="pt-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-surface-400">
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
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-100">
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
                    className="text-surface-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-surface-600">
                  No tasks for this day
                </h3>
                <p className="mt-1 text-xs text-surface-400">
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
    </div>
  );
}
