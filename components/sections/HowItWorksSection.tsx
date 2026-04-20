"use client";
import { motion } from "framer-motion";
import { FileText, Database, Brain, BarChart3 } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    title: "Paste your resume",
    desc: "Raw text or upload. We strip formatting noise and extract structured data.",
    num: "01",
  },
  {
    icon: Database,
    title: "RAG market context",
    desc: "Your skills are benchmarked against 2,400+ Kaggle resumes via vector similarity.",
    num: "02",
  },
  {
    icon: Brain,
    title: "Claude AI analysis",
    desc: "6-stage pipeline runs in parallel: ATS scoring, blind spots, trust index, coaching.",
    num: "03",
  },
  {
    icon: BarChart3,
    title: "Dashboard results",
    desc: "Structured JSON powers Tableau-ready analytics, email teasers, and chatbot flows.",
    num: "04",
  },
];

export function HowItWorksSection() {
  return (
    <section id="howitworks" className="py-32 bg-[#0d0d15] relative scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
            Pipeline
          </span>
          <h2 className="mt-3 text-4xl font-bold text-white">
            How the engine works
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-9 left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-5 relative z-10">
                <s.icon className="w-7 h-7 text-indigo-400" />
              </div>
              <div className="text-xs font-mono text-indigo-500 mb-2">
                {s.num}
              </div>
              <h3 className="text-white font-semibold mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
