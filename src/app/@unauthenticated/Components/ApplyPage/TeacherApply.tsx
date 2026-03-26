"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import Reveal from "@/app/@unauthenticated/Components/HomePage/Sections/Reveal";
import {
  listTeacherJobPosts,
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

export default function TeacherApply() {
  const [postings, setPostings] = useState<PublicPostingItem[]>([]);
  const [activePosting, setActivePosting] = useState<PublicPostingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listTeacherJobPosts();
        if (!cancelled) {
          setPostings(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load teacher postings");
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

  const hasPostings = useMemo(() => postings.length > 0, [postings.length]);

  return (
    <section className="mx-auto w-full max-w-[80%] px-4 py-28 md:px-6">
      <Reveal className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Teacher openings
        </p>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">
          Apply to verified institutions hiring now.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Review curated roles, get a quick summary, and open full details before
          you apply.
        </p>
      </Reveal>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading teacher postings...</p>
      ) : null}

      {error ? (
        <p className="mt-10 text-sm text-destructive">{error}</p>
      ) : null}

      {!loading && !error && !hasPostings ? (
        <Reveal className="mt-10 rounded-3xl border border-dashed border-border bg-card/70 p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-foreground">No Teacher Openings Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Verified institutions have not published teacher jobs yet. Check back soon for new openings.
          </p>
        </Reveal>
      ) : null}

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {postings.map((posting, index) => (
          <Reveal
            key={posting.id}
            delayMs={index * 80}
            className="flex h-full flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-1 items-start gap-4">
              {posting.institutionLogo ? (
                <img
                  src={posting.institutionLogo}
                  alt={`${posting.institution} logo`}
                  className="h-14 w-14 rounded-2xl border border-border object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 aspect-square items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(posting.institutionShortName ?? posting.institution)}
                </div>
              )}
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {posting.institution}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {posting.location ?? "Location not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {posting.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {posting.summary}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActivePosting(posting)}
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

      {activePosting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <dialog
            open
            aria-labelledby="job-modal-title"
            className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {activePosting.institution}
                </p>
                <h2
                  id="job-modal-title"
                  className="mt-2 text-2xl font-semibold text-foreground"
                >
                  {activePosting.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activePosting.location ?? "Location not specified"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActivePosting(null)}
                className="rounded-full cursor-pointer border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              <p>{activePosting.summary}</p>
              <ul className="list-disc space-y-2 pl-5">
                {activePosting.details.map((detail) => (
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
                onClick={() => setActivePosting(null)}
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
