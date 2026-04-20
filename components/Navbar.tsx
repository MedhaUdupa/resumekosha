"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Analyzer", href: "#analyzer" },
  { label: "How it works", href: "#howitworks" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">ResumeKosha</span>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="#analyzer"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-medium transition-colors"
          >
            Analyze now
          </a>
        </div>

        {/* Mobile */}
        <button className="md:hidden text-slate-400" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#111118] border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white text-sm py-1"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#analyzer"
            onClick={() => setOpen(false)}
            className="bg-indigo-600 text-white py-2 rounded-lg text-sm mt-2 text-center"
          >
            Analyze now
          </a>
        </div>
      )}
    </motion.nav>
  );
}
