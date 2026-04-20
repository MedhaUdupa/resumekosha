"use client";
import { motion } from "framer-motion";
import { Code2, KeyRound, Database, Sparkles } from "lucide-react";

const ITEMS = [
  {
    icon: KeyRound,
    title: "Add your API key",
    desc: "Set ANTHROPIC_API_KEY on the server for full Claude analysis. Without it, the app runs a high-quality demo analysis so the UI still works.",
  },
  {
    icon: Database,
    title: "Optional Kaggle dataset",
    desc: "Drop Resume.csv into /data/Resume.csv to enrich market context sampling. The app also works without it.",
  },
  {
    icon: Sparkles,
    title: "Analyzer output schema",
    desc: "The API returns strict JSON matching the ATSResult type (scores, blind spots, trust index, coaching prompts, personas, and email teaser).",
  },
  {
    icon: Code2,
    title: "Deploy anywhere",
    desc: "Works on Vercel with App Router + serverless API route. Add env vars and you’re live.",
  },
];

export function DocsSection() {
  return (
    <section id="docs" className="py-32 relative scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
            Docs
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            Everything you need to run it
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Quick setup notes so every button works locally and in production.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#111118] border border-white/5 rounded-2xl p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <it.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-white font-semibold mb-1">{it.title}</div>
                  <p className="text-slate-400 text-sm leading-relaxed">{it.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
