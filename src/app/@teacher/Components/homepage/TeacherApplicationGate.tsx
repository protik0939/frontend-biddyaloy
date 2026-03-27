"use client";

import { Loader2, SearchX } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  listTeacherJobPosts,
  type PublicPostingItem,
} from "@/services/Public/publicPosting.service";
import {
  type TeacherJobApplication,
  TeacherPortalService,
} from "@/services/Teacher/teacherPortal.service";

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

interface TeacherApplicationGateProps {
  existingApplications: TeacherJobApplication[];
  onApplied?: () => Promise<void> | void;
}

export default function TeacherApplicationGate({
  existingApplications,
  onApplied,
}: Readonly<TeacherApplicationGateProps>) {
  const [postings, setPostings] = useState<PublicPostingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingPostingId, setApplyingPostingId] = useState("");
  const [coverLetter, setCoverLetter] = useState<Record<string, string>>({});

  const appliedPostingIds = useMemo(
    () => new Set(existingApplications.map((item) => item.posting.id)),
    [existingApplications],
  );

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
          setError(err instanceof Error ? err.message : "Failed to load teacher openings");
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

  const handleApply = async (postingId: string) => {
    setApplyingPostingId(postingId);
    try {
      await TeacherPortalService.applyToTeacherPosting(postingId, {
        coverLetter: coverLetter[postingId] || undefined,
      });
      toast.success("Application submitted successfully");
      if (onApplied) {
        await onApplied();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to apply";
      toast.error(message);
    } finally {
      setApplyingPostingId("");
    }
  };

  const hasPostings = postings.length > 0;

  const getStatusClassName = (status: TeacherJobApplication["status"]) => {
    if (status === "APPROVED") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "REJECTED") {
      return "bg-rose-100 text-rose-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-5">
      <article className="rounded-3xl border border-border/70 bg-card/85 p-6 shadow-sm backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Teacher onboarding</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Apply to an institution to unlock your portal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account is ready. Once an institution approves your proposal, your full teacher dashboard will appear automatically.
        </p>
      </article>

      {existingApplications.length > 0 ? (
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">Your Recent Applications</h2>
          <div className="mt-4 grid gap-3">
            {existingApplications.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{item.posting.title}</p>
                    <p className="text-xs text-muted-foreground">{item.institution.name}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>
                {item.institutionResponse ? (
                  <p className="mt-2 text-xs text-muted-foreground">Response: {item.institutionResponse}</p>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {loading ? (
        <article className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Loading teacher openings...</p>
        </article>
      ) : null}

      {error ? (
        <article className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 shadow-sm">
          <p className="text-sm text-destructive">{error}</p>
        </article>
      ) : null}

      {!loading && !error && !hasPostings ? (
        <article className="rounded-3xl border border-dashed border-border bg-card/70 p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-xl font-semibold">No Teacher Openings Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Institutions have not published teacher postings right now. Please check again later.
          </p>
        </article>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {postings.map((posting) => {
          const alreadyApplied = appliedPostingIds.has(posting.id);
          const isApplying = applyingPostingId === posting.id;

          return (
            <article key={posting.id} className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3">
                {posting.institutionLogo ? (
                  <Image
                    src={posting.institutionLogo}
                    alt={`${posting.institution} logo`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                    {getInitials(posting.institutionShortName ?? posting.institution)}
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold">{posting.institution}</p>
                  <p className="text-xs text-muted-foreground">{posting.location ?? "Location not specified"}</p>
                  <p className="mt-1 text-sm font-medium">{posting.title}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{posting.summary}</p>

              <label className="mt-auto space-y-1 text-xs">
                <span className="font-medium text-muted-foreground">Cover letter (optional)</span>
                <textarea
                  value={coverLetter[posting.id] ?? ""}
                  onChange={(event) =>
                    setCoverLetter((prev) => ({
                      ...prev,
                      [posting.id]: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="Why are you a fit for this role?"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  disabled={alreadyApplied || isApplying}
                />
              </label>

              <button
                type="button"
                disabled={alreadyApplied || isApplying}
                onClick={() => void handleApply(posting.id)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {alreadyApplied ? "Applied" : "Apply now"}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
