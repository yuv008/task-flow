"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  type: "success" | "error" | "default";
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        className={cn(
          "pointer-events-auto animate-slide-from-bottom flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg",
          type === "success" && "bg-emerald-600",
          type === "error" && "bg-red-600",
          type === "default" && "bg-surface-900"
        )}
        role="status"
        aria-live="polite"
      >
        {type === "success" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {type === "error" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className="ml-1 rounded-full p-0.5 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Dismiss notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
