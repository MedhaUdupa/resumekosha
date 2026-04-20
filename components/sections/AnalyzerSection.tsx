"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Zap,
  FileText,
  Send,
  Sparkles,
} from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import type { ATSResult } from "@/lib/types";

export function AnalyzerSection() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [sendingReport, setSendingReport] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [selectedTips, setSelectedTips] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "blindspots" | "trust" | "coach" | "personas" | "email" | "improve"
  >("overview");

  async function analyze() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      if (!resumeFile) {
        throw new Error("Please upload your resume PDF first.");
      }
      const formData = new FormData();
      formData.append("resumeFile", resumeFile);
      formData.append("jobDescription", jobDescription);
      formData.append("targetRole", targetRole);
      formData.append("targetCompany", targetCompany);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setActiveTab("overview");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const copyEmail = () => {
    if (result?.email_marketing.freemium_teaser_copy) {
      navigator.clipboard.writeText(result.email_marketing.freemium_teaser_copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  async function sendReport() {
    if (!result) return;
    setEmailMessage("");
    try {
      setSendingReport(true);
      const res = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo, result }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 503) {
          const subject = encodeURIComponent("ResumeKosha Analysis Report");
          const body = encodeURIComponent(
            `ATS Match: ${result.ats_scoring.overall_semantic_match_score}\n` +
              `Trust Score: ${result.authenticity_index.trust_score}\n` +
              `Role: ${result.analytics_data.inferred_primary_role}\n\n` +
              `Email Teaser:\n${result.email_marketing.freemium_teaser_copy}`
          );
          window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
          setEmailMessage("Opened your email app because SMTP is not configured on server.");
          return;
        }
        throw new Error(data.error || "Could not send report.");
      }
      setEmailMessage("Report sent successfully.");
    } catch (e: any) {
      setEmailMessage(e.message || "Failed to send report.");
    } finally {
      setSendingReport(false);
    }
  }

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "blindspots", label: "Blind Spots" },
    { id: "trust", label: "Trust Score" },
    { id: "coach", label: "AI Coach" },
    { id: "improve", label: "Improve Resume" },
    { id: "personas", label: "Personas" },
    { id: "email", label: "Email Teaser" },
  ] as const;

  const suggestedRoles = result
    ? Array.from(
        new Set([
          ...(result.resume_improvement?.role_suggestions || []),
          result.analytics_data.inferred_primary_role,
          result.analytics_data.categorized_skills.technical_frameworks.some((s) =>
            ["react", "next.js", "typescript"].includes(s.toLowerCase())
          )
            ? "Frontend Engineer"
            : "",
          result.analytics_data.categorized_skills.technical_frameworks.some((s) =>
            ["python", "tensorflow", "pytorch", "scikit-learn"].includes(s.toLowerCase())
          )
            ? "ML / Data Scientist"
            : "",
          result.analytics_data.categorized_skills.tools_and_platforms.some((s) =>
            ["aws", "docker", "kubernetes"].includes(s.toLowerCase())
          )
            ? "Platform Engineer"
            : "",
        ].filter(Boolean))
      )
    : [];

  const improvements = result?.resume_improvement;
  const improvementPool = improvements
    ? [
        ...improvements.impact_enforcer_suggestions,
        ...improvements.skill_gap_suggestions,
        ...improvements.section_balance_suggestions,
        ...improvements.cliche_fluff_flags,
      ]
    : [];

  const toggleTip = (tip: string) => {
    setSelectedTips((prev) => (prev.includes(tip) ? prev.filter((x) => x !== tip) : [...prev, tip]));
  };

  return (
    <section id="analyzer" className="py-32 relative scroll-mt-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
            Resume Analyzer
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            Upload your resume PDF
          </h2>
          <p className="mt-4 text-slate-400">
            We compare it against backend market data and generate a complete ATS analysis.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto mb-8">
          <label className="text-xs uppercase tracking-widest text-slate-500 mb-2 block text-center">
            Resume PDF
          </label>
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-5">
            <Upload className="w-8 h-8 text-indigo-400" />
            <div className="w-full flex items-center gap-5">
              <label className="inline-flex cursor-pointer items-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Choose file
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">
                  {resumeFile ? resumeFile.name : "No file selected"}
                </p>
              </div>
              <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
            </div>
            <p className="text-xs text-slate-500">Upload one PDF file to begin analysis.</p>
          </div>
          <div className="mt-4 grid md:grid-cols-2 gap-3">
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target role (optional) e.g. Frontend Engineer"
              className="w-full bg-[#111118] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
            />
            <input
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="Target company (optional)"
              className="w-full bg-[#111118] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            placeholder="Optional: paste target job description for semantic matching"
            className="mt-3 w-full bg-[#111118] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 resize-none focus:outline-none focus:border-indigo-500/50"
          />
        </div>

        <div className="flex justify-center mb-10">
          <button
            onClick={analyze}
            disabled={loading || !resumeFile}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-semibold text-base transition-all duration-200 glow-indigo"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing your resume...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Analyze Resume
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-8 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden"
            >
              {/* Tab bar */}
              <div className="flex overflow-x-auto border-b border-white/5">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "text-indigo-400 border-indigo-500 bg-indigo-500/5"
                        : "text-slate-500 border-transparent hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-7">
                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <div>
                    <div className="flex flex-wrap gap-10 justify-center mb-8">
                      <ScoreRing
                        score={result.ats_scoring.overall_semantic_match_score}
                        label="ATS Match"
                        color="#6366f1"
                      />
                      <ScoreRing
                        score={result.authenticity_index.trust_score}
                        label="Trust Score"
                        color="#22c55e"
                      />
                      <ScoreRing
                        score={
                          100 -
                          result.ats_scoring.blind_spot_detection.missing_critical_skills
                            .length *
                            10
                        }
                        label="Skill Coverage"
                        color="#f59e0b"
                      />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-[#0a0a0f] rounded-xl p-4">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                          Technical Frameworks
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.analytics_data.categorized_skills.technical_frameworks.map(
                            (s) => (
                              <span
                                key={s}
                                className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full px-3 py-1"
                              >
                                {s}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-xl p-4">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                          Tools & Platforms
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.analytics_data.categorized_skills.tools_and_platforms.map(
                            (s) => (
                              <span
                                key={s}
                                className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full px-3 py-1"
                              >
                                {s}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-xl p-4">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                          Soft & Leadership
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.analytics_data.categorized_skills.soft_leadership.map(
                            (s) => (
                              <span
                                key={s}
                                className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-full px-3 py-1"
                              >
                                {s}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-[#0a0a0f] rounded-xl p-4 flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Inferred Role</span>
                      <span className="text-white font-semibold">
                        {result.analytics_data.inferred_primary_role}
                      </span>
                    </div>
                    {suggestedRoles.length > 0 && (
                      <div className="mt-2 bg-[#0a0a0f] rounded-xl p-4">
                        <div className="text-slate-400 text-sm mb-2">Suggested Roles</div>
                        <div className="flex flex-wrap gap-2">
                          {suggestedRoles.map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => setTargetRole(role)}
                              className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full px-3 py-1"
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-2 bg-[#0a0a0f] rounded-xl p-4 flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Estimated Experience</span>
                      <span className="text-white font-semibold">
                        {result.analytics_data.total_months_experience} months
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Experience is estimated from explicit years and date ranges detected in your resume text.
                    </p>
                  </div>
                )}

                {/* BLIND SPOTS */}
                {activeTab === "blindspots" && (
                  <div>
                    <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                      {result.ats_scoring.blind_spot_detection.market_context_reasoning}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {result.ats_scoring.blind_spot_detection.missing_critical_skills.map(
                        (s) => (
                          <div
                            key={s}
                            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-full px-4 py-2 text-sm"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            {s}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* TRUST */}
                {activeTab === "trust" && (
                  <div>
                    <div className="flex items-center gap-6 mb-6">
                      <ScoreRing
                        score={result.authenticity_index.trust_score}
                        label="Trust Index"
                        color="#22c55e"
                        size={100}
                      />
                      <div>
                        <div className="text-white font-semibold text-lg mb-1">
                          {result.authenticity_index.trust_score >= 85
                            ? "✓ High Authenticity"
                            : result.authenticity_index.trust_score >= 60
                              ? "⚠ Medium Trust"
                              : "✗ Low Trust — Review Needed"}
                        </div>
                        <p className="text-slate-400 text-sm">
                          Based on timeline consistency, metric verifiability, and language analysis.
                        </p>
                      </div>
                    </div>
                    {result.authenticity_index.fluff_flags.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-amber-400 uppercase tracking-widest mb-3">
                          Fluff Flags
                        </div>
                        {result.authenticity_index.fluff_flags.map((f) => (
                          <div
                            key={f}
                            className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 rounded-lg px-4 py-3 mb-2 text-sm text-amber-200"
                          >
                            <span className="text-amber-400 mt-0.5">⚑</span> {f}
                          </div>
                        ))}
                      </div>
                    )}
                    {result.authenticity_index.chronological_discrepancies.length >
                      0 && (
                        <div>
                          <div className="text-xs text-red-400 uppercase tracking-widest mb-3">
                            Chronological Issues
                          </div>
                          {result.authenticity_index.chronological_discrepancies.map(
                            (f) => (
                              <div
                                key={f}
                                className="text-sm text-red-300 bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 mb-2"
                              >
                                {f}
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                )}

                {/* COACH */}
                {activeTab === "coach" && (
                  <div className="space-y-5">
                    {result.interactive_chatbot.weak_bullets_identified.map(
                      (b, i) => (
                        <div
                          key={i}
                          className="bg-[#0a0a0f] rounded-xl p-5 border border-white/5"
                        >
                          <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">
                            Weak Bullet {i + 1}
                          </div>
                          <p className="text-slate-300 text-sm italic mb-4 font-mono leading-relaxed">
                            "{b.original_bullet}"
                          </p>
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                AI
                              </div>
                              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl rounded-tl-none px-4 py-3 text-sm text-indigo-100">
                                {b.probing_question_english}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                                Tip
                              </div>
                              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl rounded-tl-none px-4 py-3 text-sm text-rose-100">
                                Quantify this bullet with metrics (%, users, revenue, time saved) to increase recruiter confidence.
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* IMPROVEMENTS */}
                {activeTab === "improve" && improvements && (
                  <div className="space-y-5">
                    <div className="bg-[#0a0a0f] rounded-xl p-5 border border-white/5">
                      <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Semantic Match Summary</div>
                      <p className="text-slate-300 text-sm leading-relaxed">{improvements.semantic_job_match_summary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-[#0a0a0f] rounded-xl p-5 border border-white/5">
                        <div className="text-xs text-rose-300 uppercase tracking-widest mb-3">Impact Enforcer</div>
                        <div className="space-y-2">
                          {improvements.impact_enforcer_suggestions.map((tip) => (
                            <button
                              key={tip}
                              type="button"
                              onClick={() => toggleTip(tip)}
                              className={`w-full text-left text-sm rounded-lg px-3 py-2 transition-colors ${
                                selectedTips.includes(tip)
                                  ? "bg-rose-500/20 border border-rose-500/40 text-rose-100"
                                  : "bg-[#111118] border border-white/10 text-slate-300 hover:border-rose-500/30"
                              }`}
                            >
                              {tip}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-xl p-5 border border-white/5">
                        <div className="text-xs text-rose-300 uppercase tracking-widest mb-3">Skill Gap Analysis</div>
                        <ul className="space-y-2">
                          {improvements.skill_gap_suggestions.map((tip) => (
                            <li key={tip} className="text-sm text-slate-300 bg-[#111118] border border-white/10 rounded-lg px-3 py-2">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-[#0a0a0f] rounded-xl p-5 border border-white/5">
                        <div className="text-xs text-rose-300 uppercase tracking-widest mb-3">Section Balancing</div>
                        <ul className="space-y-2">
                          {improvements.section_balance_suggestions.map((tip) => (
                            <li key={tip} className="text-sm text-slate-300 bg-[#111118] border border-white/10 rounded-lg px-3 py-2">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-[#0a0a0f] rounded-xl p-5 border border-white/5">
                        <div className="text-xs text-rose-300 uppercase tracking-widest mb-3">Cliche & Fluff Filter</div>
                        <ul className="space-y-2">
                          {improvements.cliche_fluff_flags.map((tip) => (
                            <li key={tip} className="text-sm text-slate-300 bg-[#111118] border border-white/10 rounded-lg px-3 py-2">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-500/30 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3 text-rose-200">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-semibold">Selected Improvements</span>
                      </div>
                      {selectedTips.length ? (
                        <ul className="space-y-2">
                          {selectedTips.map((tip) => (
                            <li key={tip} className="text-sm text-rose-100">- {tip}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-rose-100/80">Click any Impact Enforcer suggestion to add it to your action plan.</p>
                      )}
                    </div>

                    {result.ats_parsing_sandbox && (
                      <div className="bg-[#0a0a0f] rounded-xl p-5 border border-white/5">
                        <div className="text-xs text-rose-300 uppercase tracking-widest mb-3">ATS Parsing Sandbox</div>
                        <p className="text-sm text-slate-300 mb-3">{result.ats_parsing_sandbox.extracted_preview}</p>
                        <div className="flex flex-wrap gap-2">
                          {result.ats_parsing_sandbox.parser_warnings.map((w) => (
                            <span key={w} className="text-xs bg-amber-500/10 text-amber-200 border border-amber-500/30 rounded-full px-3 py-1">
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* PERSONAS */}
                {activeTab === "personas" && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-[#0a0a0f] border border-blue-500/20 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
                          Corporate Formal
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {result.alternate_universe_personas.corporate_formal_summary}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0f] border border-pink-500/20 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-pink-400" />
                        <span className="text-pink-400 text-sm font-semibold uppercase tracking-wider">
                          Startup Creative
                        </span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {result.alternate_universe_personas.startup_creative_summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* EMAIL */}
                {activeTab === "email" && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs text-slate-500 uppercase tracking-widest">
                        Generated Email Teaser
                      </div>
                      <button
                        onClick={copyEmail}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6">
                      <p className="text-white text-base leading-relaxed">
                        {result.email_marketing.freemium_teaser_copy}
                      </p>
                    </div>
                    <div className="mt-5 bg-[#0a0a0f] border border-white/10 rounded-xl p-4">
                      <div className="text-xs text-slate-500 uppercase tracking-widest mb-3">
                        Send full report to email
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="email"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                          placeholder="Enter recipient email"
                          className="flex-1 bg-[#111118] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50"
                        />
                        <button
                          onClick={sendReport}
                          disabled={sendingReport || !emailTo}
                          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          <Send className="w-4 h-4" />
                          {sendingReport ? "Sending..." : "Send report"}
                        </button>
                      </div>
                      {emailMessage && <p className="mt-3 text-xs text-slate-400">{emailMessage}</p>}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
