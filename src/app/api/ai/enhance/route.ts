import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const prompt = description?.trim()
      ? `Task: "${title}"\nCurrent description: "${description}"\n\nRewrite this as a numbered list of clear, actionable steps. Use nested points (e.g. 1a, 1b) only if a step has sub-parts. Return only the formatted description, nothing else.`
      : `Task: "${title}"\n\nWrite a description as a numbered list of clear, actionable steps. Use nested points (e.g. 1a, 1b) only if a step has sub-parts. Return only the formatted description, nothing else.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a productivity assistant. Format task descriptions as numbered steps.\n" +
            "Rules:\n" +
            "1. Each step must start with a number (e.g. 1., 2., 3.)\n" +
            "2. Add nested sub-points (e.g. 1a., 1b.) only when a step has distinct parts\n" +
            "3. Keep each point short and actionable — start with a verb\n" +
            "4. Return only the formatted list — no intro, no explanation, no extra text",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const enhanced = completion.choices[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ description: enhanced });
  } catch {
    return NextResponse.json(
      { error: "Failed to enhance description" },
      { status: 500 }
    );
  }
}
