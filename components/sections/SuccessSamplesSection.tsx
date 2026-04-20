import { getSuccessfulResumeSamples } from "@/lib/kaggleLoader";
import { truncateResume } from "@/lib/resumeParser";

export function SuccessSamplesSection() {
  const samples = getSuccessfulResumeSamples(6);
  const fallbackSamples = [
    {
      id: "sample_1",
      category: "Frontend",
      resume_text:
        "Built a React + Next.js dashboard used by 30k monthly users; improved Lighthouse performance from 62 to 91 and reduced page load by 41%. Led migration to TypeScript and introduced CI checks that cut production bugs by 28%.",
    },
    {
      id: "sample_2",
      category: "Data Science",
      resume_text:
        "Developed churn prediction models in Python that increased retention campaigns ROI by 22%. Automated ETL with Airflow and reduced weekly reporting time from 7 hours to 40 minutes.",
    },
    {
      id: "sample_3",
      category: "Backend",
      resume_text:
        "Designed microservices in Node.js and PostgreSQL handling 1.5M+ API calls/day. Reduced p95 latency by 37% through query optimization, caching, and observability-driven tuning.",
    },
  ];
  const visibleSamples = samples.length > 0 ? samples : fallbackSamples;

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
          {visibleSamples.map((sample) => (
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
