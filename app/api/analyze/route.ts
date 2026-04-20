import { NextRequest, NextResponse } from "next/server";
// Import internal entry to avoid pdf-parse debug bootstrap in bundlers.
import pdfParse from "pdf-parse/lib/pdf-parse";
import { loadKaggleResumes } from "@/lib/kaggleLoader";
import { extractKeywords, estimateExperience, truncateResume } from "@/lib/resumeParser";
import type { ATSResult, KaggleResume } from "@/lib/types";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

type AnalyzeInput = {
  resumeText: string;
  jobDescription: string;
  targetRole?: string;
  targetCompany?: string;
};

function normalizeExperienceMonths(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.max(0, Math.round(parsed));
  if (rounded > 600) return fallback;
  return rounded;
}

function uniqueTop(values: string[], limit = 4): string[] {
  return Array.from(
    new Set(
      values
        .map((v) => v.trim())
        .filter(Boolean)
    )
  ).slice(0, limit);
}

function extractResumeBullets(resumeText: string): string[] {
  return resumeText
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(
      (line) =>
        line.length > 24 &&
        (/^[\-\u2022*]/.test(line) ||
          /^(built|developed|designed|implemented|created|led|managed|improved|worked|helped)\b/i.test(
            line
          ))
    )
    .map((line) => line.replace(/^[\-\u2022*]\s*/, ""))
    .slice(0, 8);
}

function buildWeakBullets(resumeText: string) {
  const weakVerb = /(worked on|helped|responsible for|involved in|participated in)/i;
  const hasMetric = /(\d+%|\d+\s*(users?|ms|s|sec|seconds?|minutes?|hours?|days?|months?|years?)|\$\d+)/i;
  const candidates = extractResumeBullets(resumeText).filter(
    (line) => weakVerb.test(line) || !hasMetric.test(line)
  );

  const picked = candidates.slice(0, 3);
  if (picked.length === 0) {
    return [
      {
        original_bullet: "Built and shipped project features using modern development tools.",
        probing_question_english:
          "Which feature did you own, what stack did you use, and what measurable result did it produce?",
      },
    ];
  }

  return picked.map((bullet) => ({
    original_bullet: bullet,
    probing_question_english:
      "Can you add one metric (%, users, time saved, latency, revenue) and one clear ownership detail to this bullet?",
  }));
}

function inferRoleSuggestions(resumeText: string, primaryRole: string): string[] {
  const lower = resumeText.toLowerCase();
  const roles = [primaryRole];
  if (/(react|next|frontend|ui)/.test(lower)) roles.push("Frontend Engineer");
  if (/(node|api|backend|microservice)/.test(lower)) roles.push("Backend Engineer");
  if (/(cyber|security|siem|phish|threat)/.test(lower)) roles.push("Cybersecurity Analyst");
  if (/(ml|tensorflow|pytorch|data|analytics)/.test(lower)) roles.push("Data Scientist");
  roles.push("Software Engineer");
  return uniqueTop(roles, 4);
}

function buildResumeImprovement(
  resumeText: string,
  missingSkills: string[],
  roleGuess: string,
  jobDescription?: string,
  targetRole?: string,
  targetCompany?: string
): NonNullable<ATSResult["resume_improvement"]> {
  const bullets = extractResumeBullets(resumeText);
  const weakBullets = buildWeakBullets(resumeText).map((x) => x.original_bullet);
  const lower = resumeText.toLowerCase();
  const headingOrder = {
    education: lower.indexOf("education"),
    experience: lower.indexOf("experience"),
    projects: lower.indexOf("projects"),
    skills: lower.indexOf("skills"),
  };

  const impactEnforcer = uniqueTop(
    [
      ...weakBullets.slice(0, 2).map(
        (b) => `Rewrite this weak bullet with action + metric + impact: "${truncateResume(b, 110)}".`
      ),
      "Add measurable outcomes to each core project bullet (% improvement, users impacted, time saved, or risk reduced).",
      bullets.length
        ? `Prioritize your strongest project impact line near the top: "${truncateResume(bullets[0], 100)}".`
        : "Add 2-3 bullets per project that show ownership, tech stack, and quantifiable impact.",
    ],
    4
  );

  const sectionBalance = uniqueTop(
    [
      headingOrder.projects !== -1 &&
      headingOrder.education !== -1 &&
      headingOrder.projects > headingOrder.education
        ? "Move Projects above Education so recruiters see technical impact earlier."
        : "",
      headingOrder.experience === -1
        ? "Add an Experience section with date ranges for internships, freelancing, or major team roles."
        : "Ensure each Experience entry has start-end dates and 2-3 quantified bullets.",
      "Keep Education concise (degree, college, CGPA) and allocate more space to project outcomes.",
    ],
    3
  );

  const fluffMatches = [
    "hard-working",
    "team player",
    "detail-oriented",
    "passionate",
    "quick learner",
  ].filter((term) => lower.includes(term));

  const fluffFlags = uniqueTop(
    fluffMatches.length
      ? fluffMatches.map((term) => `Replace "${term}" with proof (achievement, metric, or ownership).`)
      : ["Replace subjective claims with verifiable outcomes and concrete scope."],
    3
  );

  return {
    semantic_job_match_summary: targetRole || jobDescription
      ? `Your resume is evaluated for ${targetRole || roleGuess}${targetCompany ? ` at ${targetCompany}` : ""}. Align top bullets to role responsibilities and required tools from the target opening.`
      : `Your resume is benchmarked against similar ${roleGuess} profiles from backend data. Add a target role/company for sharper matching.`,
    impact_enforcer_suggestions: impactEnforcer,
    skill_gap_suggestions: missingSkills.length
      ? uniqueTop(
          missingSkills
            .slice(0, 5)
            .map((skill) => `Add proof of ${skill} through a project bullet, coursework, or certifications section.`),
          4
        )
      : ["Your core skills align well; add one advanced tool/project outcome to stand out further."],
    section_balance_suggestions: sectionBalance,
    cliche_fluff_flags: fluffFlags,
    role_suggestions: inferRoleSuggestions(resumeText, roleGuess),
  };
}

function mergeResumeImprovement(
  fromModel: ATSResult["resume_improvement"] | undefined,
  deterministic: NonNullable<ATSResult["resume_improvement"]>
): NonNullable<ATSResult["resume_improvement"]> {
  if (!fromModel) return deterministic;
  return {
    semantic_job_match_summary:
      fromModel.semantic_job_match_summary?.trim() || deterministic.semantic_job_match_summary,
    impact_enforcer_suggestions: uniqueTop(
      [...(fromModel.impact_enforcer_suggestions || []), ...deterministic.impact_enforcer_suggestions],
      5
    ),
    skill_gap_suggestions: uniqueTop(
      [...(fromModel.skill_gap_suggestions || []), ...deterministic.skill_gap_suggestions],
      5
    ),
    section_balance_suggestions: uniqueTop(
      [...(fromModel.section_balance_suggestions || []), ...deterministic.section_balance_suggestions],
      4
    ),
    cliche_fluff_flags: uniqueTop(
      [...(fromModel.cliche_fluff_flags || []), ...deterministic.cliche_fluff_flags],
      4
    ),
    role_suggestions: uniqueTop([...(fromModel.role_suggestions || []), ...deterministic.role_suggestions], 5),
  };
}

function makeFallbackResult(
  resumeText: string,
  benchmarkSkills: string[],
  jobDescription?: string,
  targetRole?: string,
  targetCompany?: string
): ATSResult {
  const resumeKeywords = new Set(extractKeywords(resumeText));
  const jdKeywords = new Set(
    jobDescription?.trim() ? extractKeywords(jobDescription) : benchmarkSkills
  );
  const missing = [...jdKeywords].filter((k) => !resumeKeywords.has(k)).slice(0, 8);

  const overlap = [...jdKeywords].filter((k) => resumeKeywords.has(k)).length;
  const matchPct =
    jdKeywords.size === 0 ? 62 : Math.max(10, Math.min(98, Math.round((overlap / jdKeywords.size) * 100)));

  const months = normalizeExperienceMonths(estimateExperience(resumeText), 0);

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
    targetRole?.trim() ||
    (resumeText.toLowerCase().includes("frontend") || resumeText.toLowerCase().includes("react")
      ? "Frontend Engineer"
      : resumeText.toLowerCase().includes("data") || resumeText.toLowerCase().includes("ml")
        ? "Data Scientist"
        : "Software Engineer");

  const topTech = [...resumeKeywords].slice(0, 5);
  const topTools = [...benchmarkSkills].filter((s) => !topTech.includes(s)).slice(0, 5);
  const dynamicImprovement = buildResumeImprovement(
    resumeText,
    missing,
    roleGuess,
    jobDescription,
    targetRole,
    targetCompany
  );
  const dynamicWeakBullets = buildWeakBullets(resumeText);

  return {
    analytics_data: {
      inferred_primary_role: roleGuess,
      total_months_experience: months,
      categorized_skills: {
        technical_frameworks: technical_frameworks.length ? technical_frameworks : (topTech.length ? topTech : ["react", "typescript", "next.js"]),
        tools_and_platforms: tools_and_platforms.length ? tools_and_platforms : (topTools.length ? topTools : ["git", "docker", "aws"]),
        soft_leadership: soft_leadership.length ? soft_leadership : ["communication"],
      },
    },
    ats_scoring: {
      overall_semantic_match_score: matchPct,
      blind_spot_detection: {
        missing_critical_skills: missing.length ? missing : ["unit testing", "ci/cd"],
        market_context_reasoning: targetCompany
          ? `Analysis benchmarked for ${targetRole || "the target role"} at ${targetCompany} using similar profiles from the backend dataset.`
          : "Analysis benchmarked using similar profiles from the backend dataset.",
      },
    },
    authenticity_index: {
      trust_score: 86,
      fluff_flags: ["Consider adding concrete metrics (%, $, time saved) to 1–2 bullets."],
      chronological_discrepancies: [],
    },
    interactive_chatbot: {
      weak_bullets_identified: dynamicWeakBullets,
    },
    resume_improvement: dynamicImprovement,
    ats_parsing_sandbox: {
      extracted_preview: truncateResume(resumeText.replace(/\s+/g, " "), 380),
      parser_warnings: [
        "Avoid multi-column PDFs if ATS parsing quality drops.",
        "Use clear section headings: Summary, Experience, Projects, Skills, Education.",
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
    if (file.type !== "application/pdf") throw new Error("Only PDF files are allowed.");
    if (file.size > 5 * 1024 * 1024) throw new Error("PDF is too large. Max size is 5MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(bytes);
    const text = parsed.text?.trim();
    if (!text) throw new Error("Could not extract text from uploaded PDF.");
    const targetRole = String(formData.get("targetRole") || "").trim();
    const targetCompany = String(formData.get("targetCompany") || "").trim();
    const jobDescription = String(formData.get("jobDescription") || "").trim();
    return JSON.stringify({
      resumeText: text.replace(/\0/g, "").slice(0, 20000),
      jobDescription,
      targetRole,
      targetCompany,
    } satisfies AnalyzeInput);
  }

  const body = await req.json();
  const resumeText = body?.resumeText?.trim();
  if (!resumeText) throw new Error("Missing resume text.");
  const jobDescription = String(body?.jobDescription || "").trim();
  return JSON.stringify({
    resumeText: resumeText.replace(/\0/g, "").slice(0, 20000),
    targetRole: String(body?.targetRole || "").trim(),
    targetCompany: String(body?.targetCompany || "").trim(),
    jobDescription,
  } satisfies AnalyzeInput);
}

async function generateWithGemini(apiKey: string, prompt: string): Promise<string | null> {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        }
      ).finally(() => clearTimeout(timeout));

      if (!res.ok) {
        const txt = await res.text();
        console.error(`Gemini model ${model} failed:`, txt);
        continue;
      }

      const payload = await res.json();
      const raw =
        payload?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text || "")
          .join("\n")
          .trim() || "";
      if (raw) return raw;
    } catch (err) {
      console.error(`Gemini model ${model} request failed:`, err);
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers.get("x-forwarded-for"));
    if (!checkRateLimit(`analyze:${ip}`, 20, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const parsed = JSON.parse(await readResumeText(req)) as AnalyzeInput;
    const resumeText = parsed.resumeText;
    const jobDescription = parsed.jobDescription;
    const targetRole = parsed.targetRole;
    const targetCompany = parsed.targetCompany;
    if (!jobDescription?.trim()) {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    const benchmarkResumes = pickBenchmarkResumes(resumeText, 6);
    const benchmarkSkills = Array.from(
      new Set(benchmarkResumes.flatMap((r) => extractKeywords(truncateResume(r.resume_text, 2000))))
    );

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        makeFallbackResult(resumeText, benchmarkSkills, jobDescription, targetRole, targetCompany)
      );
    }

    const marketContext = benchmarkResumes
      .map((r) => `[${r.category}]: ${truncateResume(r.resume_text, 400)}`)
      .join("\n\n---\n\n");
    const inferredMonths = normalizeExperienceMonths(estimateExperience(resumeText), 0);
    const benchmarkSkillText = benchmarkSkills.slice(0, 20).join(", ");
    const deterministicImprovement = buildResumeImprovement(
      resumeText,
      benchmarkSkills.filter((k) => !extractKeywords(resumeText).includes(k)).slice(0, 8),
      targetRole || "Software Engineer",
      jobDescription,
      targetRole,
      targetCompany
    );
    const deterministicWeakBullets = buildWeakBullets(resumeText);

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
        "probing_question_english": "string"
      }
    ]
  },
  "resume_improvement": {
    "semantic_job_match_summary": "string",
    "impact_enforcer_suggestions": ["string"],
    "skill_gap_suggestions": ["string"],
    "section_balance_suggestions": ["string"],
    "cliche_fluff_flags": ["string"],
    "role_suggestions": ["string"]
  },
  "ats_parsing_sandbox": {
    "extracted_preview": "string",
    "parser_warnings": ["string"]
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
<target_role>${targetRole || "Not provided by user"}</target_role>
<target_company>${targetCompany || "Not provided by user"}</target_company>
<target_job_description>${truncateResume(jobDescription || "", 1500)}</target_job_description>

<market_rag_context>
${marketContext}
</market_rag_context>

Run all 6 analysis stages and return the JSON result only.`;

    const raw = await generateWithGemini(apiKey, prompt);
    if (!raw) {
      return NextResponse.json(
        makeFallbackResult(resumeText, benchmarkSkills, jobDescription, targetRole, targetCompany)
      );
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        makeFallbackResult(resumeText, benchmarkSkills, jobDescription, targetRole, targetCompany)
      );
    }

    const result = JSON.parse(jsonMatch[0]) as ATSResult;
    return NextResponse.json({
      ...result,
      resume_improvement: mergeResumeImprovement(result.resume_improvement, deterministicImprovement),
      interactive_chatbot: {
        weak_bullets_identified:
          result.interactive_chatbot?.weak_bullets_identified?.length
            ? result.interactive_chatbot.weak_bullets_identified
            : deterministicWeakBullets,
      },
      ats_parsing_sandbox: result.ats_parsing_sandbox || {
        extracted_preview: truncateResume(resumeText.replace(/\s+/g, " "), 380),
        parser_warnings: ["Keep formatting ATS-friendly with simple headings and one-column layout."],
      },
      analytics_data: {
        ...result.analytics_data,
        total_months_experience: normalizeExperienceMonths(
          result.analytics_data?.total_months_experience,
          inferredMonths
        ),
        categorized_skills: {
          technical_frameworks:
            result.analytics_data?.categorized_skills?.technical_frameworks?.length
              ? result.analytics_data.categorized_skills.technical_frameworks
              : benchmarkSkills.slice(0, 4),
          tools_and_platforms:
            result.analytics_data?.categorized_skills?.tools_and_platforms?.length
              ? result.analytics_data.categorized_skills.tools_and_platforms
              : benchmarkSkills.slice(4, 8),
          soft_leadership:
            result.analytics_data?.categorized_skills?.soft_leadership?.length
              ? result.analytics_data.categorized_skills.soft_leadership
              : ["communication", "collaboration"],
        },
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
