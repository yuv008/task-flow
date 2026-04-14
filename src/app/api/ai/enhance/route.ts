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
      ? `Task: "${title}"\nCurrent description: "${description}"\n\nImprove this description to be clear, specific, and actionable. Keep it concise (2-3 sentences max). Return only the improved description text, nothing else.`
      : `Task: "${title}"\n\nWrite a clear, specific, and actionable description for this task. Keep it concise (2-3 sentences max). Return only the description text, nothing else.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a productivity assistant that writes clear, specific, and actionable task descriptions. Be concise and practical.",
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
