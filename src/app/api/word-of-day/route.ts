import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use the date as a seed hint so the word feels consistent per day
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a vocabulary assistant. Return a single English word of the day as JSON with these fields:\n" +
            "- word: the word (string)\n" +
            "- pos: part of speech abbreviated (e.g. n., v., adj., adv.)\n" +
            "- meaning: a clear, concise definition in one sentence\n" +
            "- sentence: a natural example sentence using the word\n\n" +
            "Rules:\n" +
            "1. Pick a word that a confident English speaker would actually use in daily conversation or writing. Avoid words that are too basic (e.g. happy, run, fast) AND avoid rare or literary words no one uses casually (e.g. mellifluous, pusillanimous). Aim for the sweet spot: words like 'candid', 'deliberate', 'subtle', 'compelling', 'resilient', 'articulate', 'concise', 'pragmatic', 'nuanced'.\n" +
            "2. Return ONLY valid JSON — no explanation, no markdown, no extra text",
        },
        {
          role: "user",
          content: `Today's date is ${today}. Pick a suitable word of the day.`,
        },
      ],
      max_tokens: 120,
      temperature: 1,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(raw);

    if (!parsed.word || !parsed.pos || !parsed.meaning || !parsed.sentence) {
      throw new Error("Invalid response shape");
    }

    return NextResponse.json({ ...parsed, date: today });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch word of the day" },
      { status: 500 }
    );
  }
}
