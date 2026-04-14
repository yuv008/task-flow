import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, subDays } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get all tasks for this user
  const allTasks = await prisma.task.findMany({
    where: { userId },
    select: { date: true, completed: true },
    orderBy: { date: "desc" },
  });

  const totalTasks = allTasks.length;
  const totalCompleted = allTasks.filter((t) => t.completed).length;

  // Group by date to calculate streaks
  const dateMap = new Map<string, { total: number; completed: number }>();
  for (const task of allTasks) {
    const entry = dateMap.get(task.date) || { total: 0, completed: 0 };
    entry.total++;
    if (task.completed) entry.completed++;
    dateMap.set(task.date, entry);
  }

  // Calculate current streak (consecutive days where all tasks were completed)
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    const dayData = dateMap.get(dateStr);

    if (dayData && dayData.total > 0 && dayData.completed === dayData.total) {
      tempStreak++;
      if (i <= currentStreak) {
        currentStreak = tempStreak;
      }
    } else if (dayData && dayData.total > 0) {
      // Had tasks but didn't complete all
      if (i === 0) {
        // Today isn't complete yet, that's okay — check from yesterday
        continue;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
      if (i > 0 && currentStreak === 0) break;
    } else {
      // No tasks this day — skip for streak purposes
      continue;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Last 7 days completion data
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = format(subDays(today, i), "yyyy-MM-dd");
    const dayData = dateMap.get(dateStr);
    last7Days.push({
      date: dateStr,
      total: dayData?.total || 0,
      completed: dayData?.completed || 0,
      percentage:
        dayData && dayData.total > 0
          ? Math.round((dayData.completed / dayData.total) * 100)
          : 0,
    });
  }

  return NextResponse.json({
    currentStreak,
    longestStreak,
    totalTasks,
    totalCompleted,
    completionRate:
      totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
    last7Days,
  });
}
