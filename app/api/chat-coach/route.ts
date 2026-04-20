import { NextRequest, NextResponse } from "next/server";
import type { ATSResult } from "@/lib/types";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

type Message = { role: "user" | "assistant"; content: string };

function fallbackReply(question: string, result?: ATSResult): string {
  const q = question.toLowerCase();
  if (q.includes("blind spot") || q.includes("missing")) {
    const missing = result?.ats_scoring.blind_spot_detection.missing_critical_skills || [];
    return missing.length
      ? `Your biggest gaps are: ${missing.slice(0, 4).join(", ")}. Add proof of these in projects and skills.`
      : "Your resume is broadly aligned. Next improvement is to add stronger quantified outcomes.";
  }
  if (q.includes("experience")) {
    return "Estimated experience is derived from explicit years/date ranges in your resume text. Add exact role dates to improve confidence.";
  }
  if (q.includes("improve") || q.includes("better")) {
    return "Focus on impact bullets: action + tool + metric + business outcome. Replace vague lines with quantified achievements.";
  }
  return "I can help rewrite bullets, explain blind spots, and prioritize improvements. Ask me about one section or bullet at a time.";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers.get("x-forwarded-for"));
    if (!checkRateLimit(`chat:${ip}`, 40, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const question = String(body?.question || "").trim();
    const history = (body?.history || []) as Message[];
    const result = body?.result as ATSResult | undefined;

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ answer: fallbackReply(question, result) });
    }

    const context = result
      ? JSON.stringify(
          {
            role: result.analytics_data.inferred_primary_role,
            estimated_experience_months: result.analytics_data.total_months_experience,
            skills: result.analytics_data.categorized_skills,
            blind_spots: result.ats_scoring.blind_spot_detection,
            trust_score: result.authenticity_index.trust_score,
            improvements: result.resume_improvement,
          },
          null,
          2
        )
      : "{}";

    const conversation = history
      .slice(-8)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const prompt = `You are ResumeKosha AI Coach.
Rules:
- Reply only in English.
- Be concise and actionable.
- If user asks for resume rewrites, give improved bullet examples.
- Prioritize quantified impact and ATS relevance.

Analysis context:
${context}

Conversation:
${conversation}
USER: ${question}
ASSISTANT:`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ answer: fallbackReply(question, result) });
    }

    const payload = await res.json();
    const answer =
      payload?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("\n")
        .trim() || fallbackReply(question, result);

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ answer: "I hit a temporary issue. Please ask again in a moment." });
  }
}
