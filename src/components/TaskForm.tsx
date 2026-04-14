"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface TaskFormProps {
  date: string;
  onSubmit: (data: {
    title: string;
    description?: string;
    priority: string;
    date: string;
  }) => void;
  /** Increment this value to programmatically open the form (e.g., keyboard shortcut). */
  openTrigger?: number;
}

export default function TaskForm({ date, onSubmit, openTrigger }: TaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [enhancing, setEnhancing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEnhance = useCallback(async () => {
    if (!title.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) setDescription(data.description);
      }
    } finally {
      setEnhancing(false);
    }
  }, [title, description, enhancing]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Open the form whenever openTrigger is incremented externally
  useEffect(() => {
    if (openTrigger && openTrigger > 0) {
      setIsOpen(true);
    }
  }, [openTrigger]);

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
        className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-600 p-3 text-sm text-surface-400 dark:text-surface-500 transition-colors hover:border-brand-300 hover:text-brand-600"
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
          aria-hidden="true"
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
        className="w-full border-0 bg-transparent text-sm font-medium text-surface-900 dark:text-surface-50 placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-0"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a description (optional)"
        className="mt-2 w-full resize-none border-0 bg-transparent text-xs text-surface-600 dark:text-surface-400 placeholder:text-surface-400 dark:placeholder:text-surface-500 focus:outline-none focus:ring-0"
        rows={2}
      />
      {title.trim() && (
        <button
          type="button"
          onClick={handleEnhance}
          disabled={enhancing}
          className="mt-1 flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:opacity-50"
        >
          {enhancing ? (
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <span>✨</span>
          )}
          {enhancing ? "Enhancing…" : "Enhance with AI"}
        </button>
      )}
      <div className="mt-3 flex items-center justify-between border-t dark:border-surface-700 pt-3">
        <div className="flex items-center gap-1">
          {(["low", "medium", "high"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                priority === p
                  ? p === "high"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    : p === "medium"
                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "text-surface-400 dark:text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
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
