import { getSuccessfulResumeSamples } from "@/lib/kaggleLoader";
import { truncateResume } from "@/lib/resumeParser";

export function SuccessSamplesSection() {
  const samples = getSuccessfulResumeSamples(6);

  return (
    <section id="samples" className="py-28 bg-[#0d0d15] scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">
            Resume Samples
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold text-white">
            Successful resume examples
          </h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Curated from your backend dataset to show high-signal resume style and impact-focused writing.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {samples.map((sample) => (
            <article
              key={sample.id}
              className="bg-[#111118] border border-white/5 rounded-2xl p-5 h-full"
            >
              <div className="text-xs inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 mb-3">
                {sample.category}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {truncateResume(sample.resume_text, 460)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
