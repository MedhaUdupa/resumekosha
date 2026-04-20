import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold">ResumeKosha</span>
        </div>
        <p className="text-slate-600 text-sm">
          Built with Gemini AI · Kaggle Resume Dataset · Next.js 14
        </p>
        <div className="flex gap-6 text-sm text-slate-600">
          <a href="#" className="hover:text-slate-400 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-400 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-slate-400 transition-colors">
            API Docs
          </a>
        </div>
      </div>
    </footer>
  );
}
