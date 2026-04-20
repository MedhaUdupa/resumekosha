"use client";
import { useEffect, useState } from "react";

export function Typewriter({ texts, speed = 60 }: { texts: string[]; speed?: number }) {
  const [mounted, setMounted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const current = texts[idx];
    if (!deleting && displayed.length < current.length) {
      const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), speed);
      return () => clearTimeout(t);
    }
    if (!deleting && displayed.length === current.length) {
      const t = setTimeout(() => setDeleting(true), 2000);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length > 0) {
      const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), speed / 2);
      return () => clearTimeout(t);
    }
    if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % texts.length);
    }
  }, [displayed, deleting, idx, texts, speed, mounted]);

  if (!mounted) return <span className="text-indigo-400">ATS-Optimized.</span>;

  return (
    <span>
      {displayed}
      <span className="animate-pulse text-indigo-400">|</span>
    </span>
  );
}
