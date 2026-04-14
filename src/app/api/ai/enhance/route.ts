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
      ? `Task: "${title}"\nDescription: "${description}"\n\nImprove this. Return only the result.`
      : `Task: "${title}"\n\nWrite a description. Return only the result.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a productivity assistant. Write task descriptions strictly following these rules:\n" +
            "1. If the task has ONE clear action → write 1 plain sentence. No list.\n" +
            "2. If the task has 2–4 distinct steps → use a numbered list (1. 2. 3.). Each point max 8 words.\n" +
            "3. Add a nested sub-point (e.g. 2a.) ONLY if a step genuinely splits into parts. Never nest otherwise.\n" +
            "4. No padding, no filler words, no repetition.\n" +
            "5. Return only the description — no intro, no label, no explanation.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 100,
      temperature: 0.5,
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
