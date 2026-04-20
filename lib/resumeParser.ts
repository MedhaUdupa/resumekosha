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

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

type MonthRange = { start: number; end: number };

function toMonthIndex(year: number, month: number): number {
  return year * 12 + month;
}

function parseMonthToken(token: string | undefined): number | null {
  if (!token) return null;
  const normalized = token.trim().toLowerCase().replace(".", "");
  if (normalized in MONTH_INDEX) return MONTH_INDEX[normalized];
  const numeric = Number.parseInt(normalized, 10);
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) return numeric - 1;
  return null;
}

function mergeRanges(ranges: MonthRange[]): MonthRange[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: MonthRange[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i += 1) {
    const last = merged[merged.length - 1];
    const current = sorted[i];
    if (current.start <= last.end + 1) {
      last.end = Math.max(last.end, current.end);
    } else {
      merged.push(current);
    }
  }
  return merged;
}

export function estimateExperience(text: string): number {
  const normalized = text.replace(/\u2013|\u2014/g, "-");
  const yearMatches = normalized.match(/(\d+)\s*\+?\s*years?\s*(of)?\s*experience/gi) || [];
  if (yearMatches.length > 0) {
    const nums = yearMatches.map((m) => Number.parseInt(m.match(/\d+/)?.[0] || "0", 10));
    const years = Math.max(...nums);
    if (Number.isFinite(years) && years > 0 && years <= 50) return years * 12;
  }

  const now = new Date();
  const nowMonthIndex = toMonthIndex(now.getFullYear(), now.getMonth());
  const ranges: MonthRange[] = [];

  // Examples: Jan 2020 - Mar 2022, 06/2021 - Present, 2020 - 2022, 2021 - Current
  const dateRangePattern =
    /\b(?:(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december|\d{1,2})[\/\-\s]*)?(20\d{2})\s*-\s*(?:(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december|\d{1,2})[\/\-\s]*)?(20\d{2}|present|current|now)\b/gi;

  let match: RegExpExecArray | null = dateRangePattern.exec(normalized);
  while (match) {
    const startMonthToken = match[1];
    const startYear = Number.parseInt(match[2], 10);
    const endMonthToken = match[3];
    const endYearOrToken = match[4].toLowerCase();

    const startMonth = parseMonthToken(startMonthToken) ?? 0;
    const endMonth =
      endYearOrToken === "present" || endYearOrToken === "current" || endYearOrToken === "now"
        ? now.getMonth()
        : parseMonthToken(endMonthToken) ?? 11;
    const endYear =
      endYearOrToken === "present" || endYearOrToken === "current" || endYearOrToken === "now"
        ? now.getFullYear()
        : Number.parseInt(endYearOrToken, 10);

    const start = toMonthIndex(startYear, startMonth);
    const end = Math.min(toMonthIndex(endYear, endMonth), nowMonthIndex);
    if (start <= end) ranges.push({ start, end });

    match = dateRangePattern.exec(normalized);
  }

  const merged = mergeRanges(ranges);
  const totalMonths = merged.reduce((sum, r) => sum + (r.end - r.start + 1), 0);
  if (!Number.isFinite(totalMonths) || totalMonths < 0 || totalMonths > 600) return 0;
  return totalMonths;
}

export function truncateResume(text: string, maxChars = 3000): string {
  return text.length > maxChars ? text.slice(0, maxChars) + "..." : text;
}
