"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";
import {
  listStudentAdmissionPosts,
  type PublicPostingItem,
} from "@/services/Public/publicPosting.service";

function getInitials(label: string) {
  const words = label.split(" ").filter(Boolean);
  if (words.length === 0) {
    return "IN";
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function StudentApply() {
  const [programs, setPrograms] = useState<PublicPostingItem[]>([]);
  const [activeProgram, setActiveProgram] = useState<PublicPostingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listStudentAdmissionPosts();
        if (!cancelled) {
          setPrograms(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load student admissions");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasPrograms = useMemo(() => programs.length > 0, [programs.length]);

  return (
    <section className="mx-auto w-full max-w-[80%] px-4 py-28 md:px-6">
      <Reveal className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Student admissions
        </p>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Find the right admission opportunity and apply in minutes.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browse verified admission posts, compare requirements, and submit your
          application confidently.
        </p>
      </Reveal>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading admission posts...</p>
      ) : null}

      {error ? (
        <p className="mt-10 text-sm text-destructive">{error}</p>
      ) : null}

      {!loading && !error && !hasPrograms ? (
        <Reveal className="mt-10 rounded-3xl border border-dashed border-border bg-card/70 p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-foreground">No Admission Posts Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Institutions have not published student admission announcements yet. Please check again later.
          </p>
        </Reveal>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program, index) => (
          <Reveal
            key={program.id}
            delayMs={index * 80}
            className="flex h-full flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-1 items-start gap-4">
              {program.institutionLogo ? (
                <img
                  src={program.institutionLogo}
                  alt={`${program.institution} logo`}
                  className="h-14 w-14 rounded-2xl border border-border object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 aspect-square items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(program.institutionShortName ?? program.institution)}
                </div>
              )}
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {program.institution}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {program.location ?? "Location not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {program.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {program.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveProgram(program)}
                className="rounded-full cursor-pointer border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                See more
              </button>
              <button
                type="button"
                className="rounded-full cursor-pointer bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Apply now
              </button>
            </div>
          </Reveal>
        ))}
      </div>

      {activeProgram ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <dialog
            open
            aria-labelledby="program-modal-title"
            className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {activeProgram.institution}
                </p>
                <h2
                  id="program-modal-title"
                  className="mt-2 text-2xl font-semibold text-foreground"
                >
                  {activeProgram.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeProgram.location ?? "Location not specified"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveProgram(null)}
                className="rounded-full cursor-pointer border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p>{activeProgram.summary}</p>
              <ul className="list-disc space-y-2 pl-5">
                {activeProgram.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-full cursor-pointer bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Apply now
              </button>
              <button
                type="button"
                onClick={() => setActiveProgram(null)}
                className="rounded-full cursor-pointer border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                Back to listings
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </section>
  );
}
