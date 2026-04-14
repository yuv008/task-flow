import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const userId = session.user.id;

  const where: any = { userId };

  if (date) {
    where.date = date;
  } else if (from && to) {
    where.date = { gte: from, lte: to };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, priority, date } = await req.json();
    const userId = session.user.id;

    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.task.aggregate({
      where: { userId, date },
      _max: { order: true },
    });

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || "medium",
        date,
        order: (maxOrder._max.order ?? -1) + 1,
        userId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
