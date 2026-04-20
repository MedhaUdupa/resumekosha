import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { KaggleResume } from "./types";

let cachedResumes: KaggleResume[] | null = null;

export function loadKaggleResumes(): KaggleResume[] {
  if (cachedResumes) return cachedResumes;

  const csvPath = path.join(process.cwd(), "data", "Resume.csv");

  if (!fs.existsSync(csvPath)) {
    // Return demo data if CSV not found
    return getDemoResumes();
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const records = parse(raw, { columns: true, skip_empty_lines: true });

  cachedResumes = records.map((r: any, i: number) => ({
    id: String(i),
    category: r.Category || r.category || "Unknown",
    resume_text: r.Resume_str || r.resume_text || r.Resume || "",
  }));

  return cachedResumes ?? getDemoResumes();
}

export function getResumesByCategory(category: string): KaggleResume[] {
  return loadKaggleResumes().filter(
    (r) => r.category.toLowerCase() === category.toLowerCase()
  );
}

export function getRandomResumes(n = 5): KaggleResume[] {
  const all = loadKaggleResumes();
  return all.sort(() => Math.random() - 0.5).slice(0, n);
}

export function getCategories(): string[] {
  const all = loadKaggleResumes();
  return [...new Set(all.map((r) => r.category))].sort();
}

function getDemoResumes(): KaggleResume[] {
  return [
    {
      id: "demo_1",
      category: "Data Science",
      resume_text:
        "Experienced Data Scientist with 3 years in ML pipelines. Built recommendation engine using Python, TensorFlow, Scikit-learn. Reduced churn by 18% at startup. Skills: SQL, Tableau, AWS SageMaker.",
    },
    {
      id: "demo_2",
      category: "Web Development",
      resume_text:
        "Full Stack Developer skilled in React, Node.js, PostgreSQL. Built e-commerce platform serving 10k users. Experience with Docker, CI/CD, REST APIs.",
    },
    {
      id: "demo_3",
      category: "HR",
      resume_text:
        "HR Manager with 5 years in talent acquisition. Managed end-to-end recruitment for 200+ roles. Expertise in HRIS systems, onboarding, and employee engagement.",
    },
  ];
}
