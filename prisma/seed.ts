import bcrypt from "bcryptjs";
import { format, subDays } from "date-fns";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@taskflow.local" },
    update: {
      name: "Demo User",
      password: hashedPassword,
    },
    create: {
      name: "Demo User",
      email: "demo@taskflow.local",
      password: hashedPassword,
    },
  });

  const seedDays = Array.from({ length: 4 }, (_, index) =>
    format(subDays(new Date(), index), "yyyy-MM-dd")
  );

  for (let index = 0; index < seedDays.length; index++) {
    const date = seedDays[index];
    const titles = [
      "Review priorities",
      "Ship one focused task",
      "Clean up follow-ups",
    ];

    for (let taskIndex = 0; taskIndex < titles.length; taskIndex++) {
      const title = titles[taskIndex];
      await prisma.task.upsert({
        where: {
          id: `${date}-${taskIndex}`,
        },
        update: {
          title,
          date,
          completed: index > 0 ? taskIndex !== 1 : taskIndex === 0,
          priority: taskIndex === 0 ? "high" : taskIndex === 1 ? "medium" : "low",
          order: taskIndex,
          description:
            taskIndex === 0
              ? "A seeded example task so the dashboard is not empty."
              : null,
          userId: user.id,
        },
        create: {
          id: `${date}-${taskIndex}`,
          title,
          date,
          completed: index > 0 ? taskIndex !== 1 : taskIndex === 0,
          priority: taskIndex === 0 ? "high" : taskIndex === 1 ? "medium" : "low",
          order: taskIndex,
          description:
            taskIndex === 0
              ? "A seeded example task so the dashboard is not empty."
              : null,
          userId: user.id,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
