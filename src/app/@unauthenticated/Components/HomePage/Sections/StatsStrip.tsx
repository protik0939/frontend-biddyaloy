"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";

const stats = [
  { label: "Institutions onboarded", value: 120, suffix: "+" },
  { label: "Portal applications", value: 2400, format: "compact" as const },
  { label: "Avg. approval time", value: 6, suffix: " hrs" },
  { label: "Operational coverage", value: 98, suffix: "%" },
];

const formatCompact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const formatDefault = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
});

export default function StatsStrip() {
  const [values, setValues] = useState<number[]>(() => stats.map(() => 0));
  const hasAnimated = useRef(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || hasAnimated.current) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const startAnimation = () => {
      if (hasAnimated.current) {
        return;
      }

      hasAnimated.current = true;

      if (prefersReducedMotion) {
        setValues(stats.map((stat) => stat.value));
        return;
      }

      const durationMs = 1200;
      const startTime = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        setValues(stats.map((stat) => Math.round(stat.value * eased)));

        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          startAnimation();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-10">
      <div className="mx-auto w-full lg:max-w-[80%] px-4 md:px-6">
        <Reveal>
          <div
            ref={sectionRef}
            className="grid gap-4 rounded-3xl border border-border bg-card px-6 py-8 shadow-sm md:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold text-foreground">
                  {stat.format === "compact"
                    ? formatCompact.format(values[index] ?? 0)
                    : formatDefault.format(values[index] ?? 0)}
                  {stat.suffix ?? ""}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
