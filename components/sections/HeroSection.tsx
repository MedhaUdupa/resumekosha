"use client";
import { motion } from "framer-motion";
import { ArrowRight, Shield, TrendingUp } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Typewriter } from "@/components/ui/typewriter";

const DASHBOARD_PREVIEW = `
  <div style="font-family:system-ui;background:#0a0a0f;height:100%;padding:20px;color:white;overflow:hidden">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <div style="font-weight:700;font-size:16px;color:#818cfb">ResumeKosha Dashboard</div>
      <div style="display:flex;gap:8px">
        <div style="width:10px;height:10px;border-radius:50%;background:#ef4444"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:#f59e0b"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:#22c55e"></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:16px">
      ${[["ATS Score","87","#6366f1"],["Trust Index","94","#22c55e"],["Blind Spots","3","#f59e0b"],["Match %","72%","#818cfb"]]
        .map(([l,v,c])=>`<div style="background:#111118;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px">
          <div style="font-size:11px;color:#64748b;margin-bottom:6px">${l}</div>
          <div style="font-size:22px;font-weight:700;color:${c}">${v}</div>
        </div>`).join("")}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:#111118;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px">
        <div style="font-size:12px;font-weight:600;margin-bottom:12px;color:#94a3b8">Skill Match Radar</div>
        ${["Python","React","AWS","SQL","Docker"].map((s,i)=>`
          <div style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:3px">
              <span>${s}</span><span>${[90,78,65,88,55][i]}%</span>
            </div>
            <div style="background:#1e1e2e;border-radius:4px;height:5px;overflow:hidden">
              <div style="height:100%;width:${[90,78,65,88,55][i]}%;background:linear-gradient(90deg,#6366f1,#a78bfa);border-radius:4px"></div>
            </div>
          </div>`).join("")}
      </div>
      <div style="background:#111118;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px">
        <div style="font-size:12px;font-weight:600;margin-bottom:12px;color:#94a3b8">Missing Skills</div>
        ${["Kubernetes","Terraform","MLflow","LangChain","FastAPI"].map(s=>`
          <div style="display:inline-flex;align-items:center;gap:4px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:20px;padding:3px 10px;font-size:11px;color:#fca5a5;margin:3px">
            <span style="color:#ef4444">⚠</span> ${s}
          </div>`).join("")}
      </div>
    </div>
  </div>
`;

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] pt-28 md:pt-32 bg-grid-pattern bg-grid overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10 min-h-[72vh] flex flex-col justify-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-4 text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]"
        >
          <span className="text-white">Your Resume,</span>
          <br />
          <span className="gradient-text glow-text">
            <Typewriter
              texts={["ATS-Optimized.", "Blind-Spot Free.", "Market-Ready.", "Trust-Scored."]}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-10 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Semantic ATS matching, trust scoring, blind spot detection, and AI career coaching — trained on
          2,400+ real resumes from the Kaggle dataset.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#analyzer"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 glow-indigo"
          >
            Analyze My Resume
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#features"
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-medium text-base transition-all duration-200"
          >
            See How It Works
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-slate-500"
        >
          {[
            [Shield, "Trust Scored"],
            [TrendingUp, "Market Benchmarked"],
            [Shield, "Data-Driven Insights"],
          ].map(([Icon, label]: any) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-indigo-400" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll animation with dashboard preview */}
      <ContainerScroll
        titleComponent={
          <p className="text-slate-500 text-sm uppercase tracking-widest mb-4">
            Live Analysis Dashboard
          </p>
        }
      >
        <iframe
          srcDoc={DASHBOARD_PREVIEW}
          className="w-full h-full rounded-xl border-0"
          title="Dashboard Preview"
        />
      </ContainerScroll>
    </section>
  );
}
