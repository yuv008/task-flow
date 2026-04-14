"use client";

import { useState } from "react";
import { cn, priorityColor } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [showMenu, setShowMenu] = useState(false);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || null,
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditTitle(task.title);
      setEditDesc(task.description || "");
      setIsEditing(false);
    }
  };

  // Determine the left border color based on priority and completion state
  const priorityBorderClass = task.completed
    ? "border-l-4 border-surface-200"
    : cn(
        "border-l-4",
        task.priority === "high" && "border-red-400",
        task.priority === "medium" && "border-amber-400",
        task.priority === "low" && "border-blue-400"
      );

  if (isEditing) {
    return (
      <div className={cn("card animate-fade-in p-4", priorityBorderClass)}>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input-field mb-2 font-medium"
          autoFocus
        />
        <textarea
          value={editDesc}
          onChange={(e) => setEditDesc(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a description..."
          className="input-field mb-3 resize-none text-sm"
          rows={2}
        />
        <div className="flex items-center gap-2">
          <select
            value={task.priority}
            onChange={(e) =>
              onUpdate(task.id, {
                priority: e.target.value as Task["priority"],
              })
            }
            className="input-field w-auto text-xs"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="flex-1" />
          <button
            onClick={() => {
              setEditTitle(task.title);
              setEditDesc(task.description || "");
              setIsEditing(false);
            }}
            className="btn-ghost text-xs"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary text-xs py-1.5">
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group card animate-slide-up p-3 transition-all hover:shadow-md",
        priorityBorderClass,
        task.completed && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
            task.completed
              ? "border-emerald-500 bg-emerald-500 animate-check"
              : "border-surface-300 hover:border-brand-400"
          )}
          aria-label={task.completed ? "Mark as pending" : "Mark as complete"}
        >
          {task.completed && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm font-medium transition-all",
                task.completed && "line-through text-surface-400"
              )}
            >
              {task.title}
            </p>
            <span
              className={cn(
                "inline-block h-1.5 w-1.5 rounded-full shrink-0",
                task.priority === "high" && "bg-red-400",
                task.priority === "medium" && "bg-amber-400",
                task.priority === "low" && "bg-blue-400"
              )}
              title={`${task.priority} priority`}
            />
          </div>
          {task.description && (
            <p
              className={cn(
                "mt-0.5 text-xs text-surface-500 line-clamp-2",
                task.completed && "line-through"
              )}
            >
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-surface-400 transition-opacity hover:bg-surface-100 hover:text-surface-600",
              // Always visible on small screens (touch devices), hover-revealed on desktop
              "sm:opacity-0 sm:group-hover:opacity-100",
              // On mobile / touch screens: always visible
              "opacity-100"
            )}
            aria-label="Task options"
            aria-expanded={showMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-8 z-20 w-36 animate-fade-in rounded-lg border bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditing(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-surface-700 hover:bg-surface-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(task.id);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
