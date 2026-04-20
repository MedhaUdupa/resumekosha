"use client";
import { motion } from "framer-motion";
import {
  Brain,
  Target,
  ShieldCheck,
  MessageSquare,
  User2,
  Mail,
} from "lucide-react";

const FEATURES = [
  {
    icon: Target,
    title: "Semantic ATS Scoring",
    desc: "Goes beyond keyword matching. Understands context, synonyms, and industry nuance to give a true job-fit score.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    score: "Stage 1",
  },
  {
    icon: Brain,
    title: "Blind Spot Detection",
    desc: "Compares your skills against real market JDs retrieved from a vector database of 2,400+ resumes. No more guessing.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    score: "Stage 2",
  },
  {
    icon: ShieldCheck,
    title: "Authenticity Trust Score",
    desc: "Flags AI-generated buzzword salads, impossible timelines, and hyper-inflated impact metrics. 0–100 trust index.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    score: "Stage 3",
  },
  {
    icon: MessageSquare,
    title: "AI Coaching Chatbot",
    desc: "Identifies weak resume bullets and asks targeted, interactive questions in English to extract real metrics.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    score: "Stage 4",
  },
  {
    icon: User2,
    title: "Alternate Universe Profiles",
    desc: "Generates a corporate-formal profile AND a startup-creative profile from the same experience set.",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    score: "Stage 5",
  },
  {
    icon: Mail,
    title: "PLG Email Teaser Engine",
    desc: "Auto-generates urgency-driven email copy revealing your biggest blind spot to drive freemium → paid conversion.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    score: "Stage 6",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
            6-Stage Pipeline
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            Not just a keyword scanner.
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
            A full intelligence layer between your resume and your dream job.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="group relative bg-[#111118] border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center ${f.bg}`}
                  >
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <span className="text-xs text-slate-600 font-mono">
                    {f.score}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
