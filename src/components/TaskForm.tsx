"use client";

import { useState, useRef, useEffect } from "react";

interface TaskFormProps {
  date: string;
  onSubmit: (data: {
    title: string;
    description?: string;
    priority: string;
    date: string;
  }) => void;
}

export default function TaskForm({ date, onSubmit }: TaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      date,
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setTitle("");
      setDescription("");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-surface-200 p-3 text-sm text-surface-400 transition-colors hover:border-brand-300 hover:text-brand-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add a task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="card animate-slide-up p-4"
    >
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        className="w-full border-0 bg-transparent text-sm font-medium text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-0"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description (optional)"
        className="mt-2 w-full resize-none border-0 bg-transparent text-xs text-surface-600 placeholder:text-surface-400 focus:outline-none focus:ring-0"
        rows={2}
      />
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-1">
          {(["low", "medium", "high"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                priority === p
                  ? p === "high"
                    ? "bg-red-100 text-red-700"
                    : p === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  : "text-surface-400 hover:bg-surface-100"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTitle("");
              setDescription("");
            }}
            className="btn-ghost text-xs py-1.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className="btn-primary text-xs py-1.5"
          >
            Add task
          </button>
        </div>
      </div>
    </form>
  );
}
