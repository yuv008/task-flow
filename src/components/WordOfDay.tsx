"use client";

import { useState, useEffect } from "react";

interface WordData {
  word: string;
  pos: string;
  meaning: string;
  sentence: string;
  date: string;
}

const CACHE_KEY = "word_of_day";

function getLocalDate(): string {
  return new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local timezone
}

function getCached(): WordData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: WordData = JSON.parse(raw);
    return data.date === getLocalDate() ? data : null;
  } catch {
    return null;
  }
}

function setCache(data: WordData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export default function WordOfDay() {
  const [open, setOpen] = useState(true);
  const [word, setWord] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setWord(cached);
      setLoading(false);
      return;
    }

    fetch(`/api/word-of-day?date=${getLocalDate()}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: WordData) => {
        setCache(data);
        setWord(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mb-3 rounded-lg bg-surface-100 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
        aria-expanded={open}
      >
        <span className="text-sm" aria-hidden="true">📖</span>
        <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide">
          Word of the Day
        </span>
        {word && (
          <span className="ml-auto text-xs font-semibold text-surface-700 dark:text-surface-200">
            {word.word}
          </span>
        )}
        <span className="text-xs text-surface-400 dark:text-surface-500 ml-1">
          {open ? "↑" : "↓"}
        </span>
      </button>

      {open && (
        <div className="px-3 pb-2.5 pt-0">
          {loading && (
            <p className="text-xs text-surface-400 dark:text-surface-500 animate-pulse">
              Fetching word…
            </p>
          )}
          {error && (
            <p className="text-xs text-surface-400 dark:text-surface-500">
              Could not load word of the day.
            </p>
          )}
          {word && !loading && (
            <div className="space-y-1">
              <p className="text-xs text-surface-600 dark:text-surface-300">
                <span className="italic text-surface-400 dark:text-surface-500 mr-1">
                  {word.pos}
                </span>
                {word.meaning}
              </p>
              <p className="text-xs text-surface-400 dark:text-surface-500 italic">
                &ldquo;{word.sentence}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
