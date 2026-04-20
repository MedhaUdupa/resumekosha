export function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="text-white font-bold text-sm">ResumeKosha</span>
        <p className="text-slate-600 text-xs">Powered by Gemini AI </p>
        <div className="flex gap-5 text-xs text-slate-600">
          <a href="#features" className="hover:text-slate-400 transition-colors">Features</a>
          <a href="#analyzer" className="hover:text-slate-400 transition-colors">Analyzer</a>
          <a href="#howitworks" className="hover:text-slate-400 transition-colors">How it works</a>
        </div>
      </div>
    </footer>
  );
}
