import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { ATSResult } from "@/lib/types";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildReportHtml(result: ATSResult) {
  return `
    <h2>ResumeKosha Analysis Report</h2>
    <p><strong>Role:</strong> ${result.analytics_data.inferred_primary_role}</p>
    <p><strong>Experience:</strong> ${result.analytics_data.total_months_experience} months</p>
    <p><strong>ATS Match:</strong> ${result.ats_scoring.overall_semantic_match_score}</p>
    <p><strong>Trust Score:</strong> ${result.authenticity_index.trust_score}</p>
    <p><strong>Missing Skills:</strong> ${result.ats_scoring.blind_spot_detection.missing_critical_skills.join(", ") || "None"}</p>
    <p><strong>Market Context:</strong> ${result.ats_scoring.blind_spot_detection.market_context_reasoning}</p>
    <hr />
    <p><strong>Corporate Summary:</strong> ${result.alternate_universe_personas.corporate_formal_summary}</p>
    <p><strong>Startup Summary:</strong> ${result.alternate_universe_personas.startup_creative_summary}</p>
    <hr />
    <p><strong>Email Teaser:</strong> ${result.email_marketing.freemium_teaser_copy}</p>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers.get("x-forwarded-for"));
    if (!checkRateLimit(`email:${ip}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const to = String(body?.to || "").trim();
    const result = body?.result as ATSResult | undefined;

    if (!EMAIL_REGEX.test(to)) {
      return NextResponse.json({ error: "Please enter a valid recipient email." }, { status: 400 });
    }
    if (!result?.analytics_data || !result?.ats_scoring) {
      return NextResponse.json({ error: "Missing report data." }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.REPORT_FROM_EMAIL || user;

    if (!host || !user || !pass || !from) {
      return NextResponse.json(
        { error: "Email service is not configured yet (missing SMTP env vars)." },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to,
      subject: "Your ResumeKosha Analysis Report",
      html: buildReportHtml(result),
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to send email report." }, { status: 500 });
  }
}
