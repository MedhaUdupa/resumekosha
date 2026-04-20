export function extractKeywords(text: string): string[] {
  const techKeywords = [
    "python","javascript","typescript","react","node","sql","aws","gcp","azure",
    "docker","kubernetes","tensorflow","pytorch","scikit-learn","pandas","numpy",
    "machine learning","deep learning","nlp","api","rest","graphql","postgresql",
    "mongodb","redis","spark","hadoop","tableau","power bi","figma","git",
  ];
  const lower = text.toLowerCase();
  return techKeywords.filter((kw) => lower.includes(kw));
}

export function estimateExperience(text: string): number {
  const yearMatches = text.match(/(\d+)\s*\+?\s*years?\s*of\s*experience/gi) || [];
  if (yearMatches.length > 0) {
    const nums = yearMatches.map((m) => parseInt(m.match(/\d+/)?.[0] || "0"));
    return Math.max(...nums) * 12;
  }
  // Count date ranges like "2020 - 2022"
  const dateRanges = text.match(/20\d\d\s*[-–]\s*20\d\d/g) || [];
  return dateRanges.length * 12;
}

export function truncateResume(text: string, maxChars = 3000): string {
  return text.length > maxChars ? text.slice(0, maxChars) + "..." : text;
}
