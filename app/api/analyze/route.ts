import { NextRequest, NextResponse } from "next/server";
// Import internal entry to avoid pdf-parse debug bootstrap in bundlers.
import pdfParse from "pdf-parse/lib/pdf-parse";
import { loadKaggleResumes } from "@/lib/kaggleLoader";
import { extractKeywords, estimateExperience, truncateResume } from "@/lib/resumeParser";
import type { ATSResult, KaggleResume } from "@/lib/types";

function makeFallbackResult(resumeText: string, benchmarkSkills: string[]): ATSResult {
  const resumeKeywords = new Set(extractKeywords(resumeText));
  const jdKeywords = new Set(benchmarkSkills);
  const missing = [...jdKeywords].filter((k) => !resumeKeywords.has(k)).slice(0, 8);

  const overlap = [...jdKeywords].filter((k) => resumeKeywords.has(k)).length;
  const matchPct =
    jdKeywords.size === 0 ? 62 : Math.max(10, Math.min(98, Math.round((overlap / jdKeywords.size) * 100)));

  const months = estimateExperience(resumeText);

  const technical_frameworks = [...resumeKeywords].filter((k) =>
    ["react", "next", "tensorflow", "pytorch", "scikit-learn", "graphql"].some((x) => k.includes(x))
  );
  const tools_and_platforms = [...resumeKeywords].filter((k) =>
    ["aws", "gcp", "azure", "docker", "kubernetes", "postgresql", "mongodb", "redis", "tableau", "power bi", "git"].some(
      (x) => k.includes(x)
    )
  );
  const soft_leadership = ["communication", "leadership", "collaboration"].filter((k) =>
    resumeText.toLowerCase().includes(k)
  );

  const roleGuess =
    resumeText.toLowerCase().includes("frontend") || resumeText.toLowerCase().includes("react")
      ? "Frontend Engineer"
      : resumeText.toLowerCase().includes("data") || resumeText.toLowerCase().includes("ml")
        ? "Data Scientist"
        : "Software Engineer";

  return {
    analytics_data: {
      inferred_primary_role: roleGuess,
      total_months_experience: months || 24,
      categorized_skills: {
        technical_frameworks: technical_frameworks.length ? technical_frameworks : ["react", "typescript"],
        tools_and_platforms: tools_and_platforms.length ? tools_and_platforms : ["git"],
        soft_leadership: soft_leadership.length ? soft_leadership : ["communication"],
      },
    },
    ats_scoring: {
      overall_semantic_match_score: matchPct,
      blind_spot_detection: {
        missing_critical_skills: missing.length ? missing : ["unit testing", "ci/cd"],
        market_context_reasoning:
          "Demo analysis (no API key configured). Add your GEMINI_API_KEY on the server to enable full semantic scoring and market-context reasoning.",
      },
    },
    authenticity_index: {
      trust_score: 86,
      fluff_flags: ["Consider adding concrete metrics (%, $, time saved) to 1–2 bullets."],
      chronological_discrepancies: [],
    },
    interactive_chatbot: {
      weak_bullets_identified: [
        {
          original_bullet: "Worked on frontend development using React",
          probing_question_english: "What feature did you ship, and how did it impact users or performance (numbers if possible)?",
          probing_question_marathi: "तुम्ही कोणता फीचर बनवला आणि त्याचा युजर्स/परफॉर्मन्सवर काय परिणाम झाला (शक्य असल्यास आकडे द्या)?",
        },
        {
          original_bullet: "Helped improve the website performance",
          probing_question_english: "Which metric improved (LCP, TTI, bundle size) and by how much? What did you change?",
          probing_question_marathi: "कुठला मेट्रिक सुधारला (LCP, TTI, bundle size) आणि किती? तुम्ही नेमकं काय बदललं?",
        },
      ],
    },
    alternate_universe_personas: {
      corporate_formal_summary:
        "Results-driven engineer with experience shipping production features, improving performance, and collaborating cross-functionally to deliver reliable user experiences.",
      startup_creative_summary:
        "Builder-minded engineer who ships fast, sweats UX, and turns fuzzy product ideas into clean, measurable wins.",
    },
    email_marketing: {
      freemium_teaser_copy:
        "Quick heads-up: your resume is strong, but you’re missing 2–3 high-signal skills that appear in similar roles. Want the exact list + bullet rewrites?",
    },
  };
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  let overlap = 0;
  for (const kw of a) if (b.has(kw)) overlap += 1;
  return overlap;
}

function pickBenchmarkResumes(resumeText: string, n = 6): KaggleResume[] {
  const all = loadKaggleResumes();
  const resumeKw = new Set(extractKeywords(resumeText));
  return all
    .map((r) => {
      const sample = truncateResume(r.resume_text, 1200);
      return {
        resume: r,
        score: overlapScore(resumeKw, new Set(extractKeywords(sample))),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.resume);
}

async function readResumeText(req: NextRequest): Promise<string> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("resumeFile");
    if (!(file instanceof File)) throw new Error("Missing resume PDF upload.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(bytes);
    const text = parsed.text?.trim();
    if (!text) throw new Error("Could not extract text from uploaded PDF.");
    return text;
  }

  const body = await req.json();
  const resumeText = body?.resumeText?.trim();
  if (!resumeText) throw new Error("Missing resume text.");
  return resumeText;
}

export async function POST(req: NextRequest) {
  try {
    const resumeText = await readResumeText(req);

    const benchmarkResumes = pickBenchmarkResumes(resumeText, 6);
    const benchmarkSkills = Array.from(
      new Set(benchmarkResumes.flatMap((r) => extractKeywords(truncateResume(r.resume_text, 2000))))
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(makeFallbackResult(resumeText, benchmarkSkills));
    }

    const marketContext = benchmarkResumes
      .map((r) => `[${r.category}]: ${truncateResume(r.resume_text, 400)}`)
      .join("\n\n---\n\n");
    const inferredMonths = estimateExperience(resumeText) || 24;
    const benchmarkSkillText = benchmarkSkills.slice(0, 20).join(", ");

    const systemPrompt = `You are an elite ATS system and career coach.
Compare the candidate resume against backend benchmark data from similar resumes.
Return ONLY valid JSON — no markdown, no explanation, no backticks.
Return exactly this schema:
{
  "analytics_data": {
    "inferred_primary_role": "string",
    "total_months_experience": number,
    "categorized_skills": {
      "technical_frameworks": ["string"],
      "tools_and_platforms": ["string"],
      "soft_leadership": ["string"]
    }
  },
  "ats_scoring": {
    "overall_semantic_match_score": number,
    "blind_spot_detection": {
      "missing_critical_skills": ["string"],
      "market_context_reasoning": "string"
    }
  },
  "authenticity_index": {
    "trust_score": number,
    "fluff_flags": ["string"],
    "chronological_discrepancies": ["string"]
  },
  "interactive_chatbot": {
    "weak_bullets_identified": [
      {
        "original_bullet": "string",
        "probing_question_english": "string",
        "probing_question_marathi": "string"
      }
    ]
  },
  "alternate_universe_personas": {
    "corporate_formal_summary": "string",
    "startup_creative_summary": "string"
  },
  "email_marketing": {
    "freemium_teaser_copy": "string"
  }
}`;

    const prompt = `${systemPrompt}

<resume_text>
${truncateResume(resumeText, 3000)}
</resume_text>

<experience_hint_months>${inferredMonths}</experience_hint_months>
<benchmark_skill_pool>${benchmarkSkillText}</benchmark_skill_pool>

<market_rag_context>
${marketContext}
</market_rag_context>

Run all 6 analysis stages and return the JSON result only.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error("Gemini API error, serving fallback:", errText);
      return NextResponse.json(makeFallbackResult(resumeText, benchmarkSkills));
    }

    const payload = await geminiResponse.json();
    const raw =
      payload?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text || "")
        .join("\n")
        .trim() || "";

    if (!raw) {
      return NextResponse.json(makeFallbackResult(resumeText, benchmarkSkills));
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(makeFallbackResult(resumeText, benchmarkSkills));
    }

    const result = JSON.parse(jsonMatch[0]) as ATSResult;
    return NextResponse.json({
      ...result,
      analytics_data: {
        ...result.analytics_data,
        total_months_experience:
          result.analytics_data?.total_months_experience || inferredMonths,
      },
    });
  } catch (err: any) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Analysis failed",
      },
      { status: 500 }
    );
  }
}
