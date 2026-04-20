"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Student Free",
    price: "₹0",
    period: "forever",
    desc: "For students exploring the platform",
    features: [
      "3 resume analyses/month",
      "ATS score + blind spots preview",
      "Basic skill categorization",
      "Email teaser generation",
    ],
    cta: "Get started free",
    featured: false,
  },
  {
    name: "Student Pro",
    price: "₹299",
    period: "/month",
    desc: "For serious job seekers",
    features: [
      "Unlimited analyses",
      "Full 6-stage pipeline",
      "AI chatbot coaching (EN + Marathi)",
      "Alternate universe personas",
      "Tableau-ready JSON export",
      "Email teaser engine",
    ],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Recruiter B2B",
    price: "₹4,999",
    period: "/month",
    desc: "For hiring teams and TPOs",
    features: [
      "Bulk resume processing",
      "Candidate trust dashboard",
      "ATS integration API",
      "Custom JD benchmarking",
      "Team collaboration tools",
      "Priority support",
    ],
    cta: "Contact sales",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 bg-[#0d0d15] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-bold text-white">Simple, honest pricing</h2>
          <p className="mt-3 text-slate-400">Built for students and recruiters alike.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-7 relative ${
                p.featured
                  ? "bg-indigo-600/10 border-2 border-indigo-500/50 glow-indigo"
                  : "bg-[#111118] border border-white/5"
              }`}
            >
              {p.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <div className="text-slate-400 text-sm font-medium mb-1">{p.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{p.price}</span>
                  <span className="text-slate-500 text-sm">{p.period}</span>
                </div>
                <p className="text-slate-500 text-sm mt-1">{p.desc}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  p.featured
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "border border-white/10 hover:border-white/20 text-slate-300 hover:text-white"
                }`}
              >
                {p.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
