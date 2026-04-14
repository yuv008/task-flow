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
      ? `Task: "${title}"\nCurrent description: "${description}"\n\nImprove this description:\n1. Make it clear and specific\n2. Make it actionable\n3. Keep it concise (2–3 sentences max)\n\nReturn only the improved description text.`
      : `Task: "${title}"\n\nWrite a description for this task:\n1. Clear and specific\n2. Actionable (start with a verb)\n3. Concise (2–3 sentences max)\n\nReturn only the description text.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a productivity assistant. Your job:\n1. Write task descriptions that are:\n   - Clear and specific\n   - Actionable (starts with a verb)\n   - Concise (2–3 sentences max)\n2. Return only the description text — no explanations, no labels.",
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
