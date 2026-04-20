"use client";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "CS Graduate, Pune",
    text: "The Marathi chatbot coaching was amazing — I actually understood what I was missing. Got interviews at 3 startups after fixing my resume.",
    avatar: "PS",
    color: "bg-indigo-600",
  },
  {
    name: "Arjun Mehta",
    role: "Data Scientist, Bangalore",
    text: "The blind spot detection flagged that I was missing MLflow and Kubernetes. Added them to my profile. Next week — ₹18L offer.",
    avatar: "AM",
    color: "bg-emerald-600",
  },
  {
    name: "Sarah Kim",
    role: "Recruiter, TechCorp",
    text: "We use the B2B dashboard to shortlist 200+ candidates a week. The trust score saves us hours screening AI-inflated resumes.",
    avatar: "SK",
    color: "bg-pink-600",
  },
  {
    name: "Rohan Desai",
    role: "Final Year Student, BITS",
    text: "The 'Alternate Universe Persona' feature is insane. Corporate version got me a banking interview, startup version landed me a seed-stage role.",
    avatar: "RD",
    color: "bg-amber-600",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-32 scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-4xl font-bold text-white">What people are saying</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111118] border border-white/5 rounded-2xl p-5"
            >
              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
