"use client";

import { Loader2, Plus, SearchX, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  listStudentAdmissionPosts,
  type PublicPostingItem,
} from "@/services/Public/publicPosting.service";
import {
  type StudentAcademicRecord,
  type StudentAdmissionApplication,
  type StudentApplicationProfile,
  StudentPortalService,
} from "@/services/Student/studentPortal.service";

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

interface StudentApplicationGateProps {
  existingApplications: StudentAdmissionApplication[];
  applicationProfile: StudentApplicationProfile | null;
  onApplied?: () => Promise<void> | void;
  onProfileUpdated?: () => Promise<void> | void;
}

const academicRecordSchema = z.object({
  examName: z.string().trim().min(2, "Exam name is required"),
  institute: z.string().trim().min(2, "Institute is required"),
  result: z.string().trim().min(1, "Result is required"),
  year: z
    .number({ message: "Year is required" })
    .int("Year must be an integer")
    .min(1950, "Year must be between 1950 and 2100")
    .max(2100, "Year must be between 1950 and 2100"),
});

const studentApplicationProfileSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(2, "Headline must be at least 2 characters")
    .max(180, "Headline must be at most 180 characters"),
  about: z
    .string()
    .trim()
    .min(20, "About must be at least 20 characters")
    .max(5000, "About must be at most 5000 characters"),
  documentUrls: z
    .array(z.url("Document URL must be valid"))
    .min(1, "Add at least one document URL"),
  academicRecords: z.array(academicRecordSchema).min(1, "Add at least one academic record"),
});

const EXAM_NAME_OPTIONS = ["SSC", "HSC", "O Level", "A Level", "Diploma", "Bachelor", "Masters"];
const RESULT_OPTIONS = ["A+", "A", "A-", "B", "B-", "C", "PASS"];

export default function StudentApplicationGate({
  existingApplications,
  applicationProfile,
  onApplied,
  onProfileUpdated,
}: Readonly<StudentApplicationGateProps>) {
  const [postings, setPostings] = useState<PublicPostingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingPostingId, setApplyingPostingId] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [coverLetter, setCoverLetter] = useState<Record<string, string>>({});
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [documentUrlsInput, setDocumentUrlsInput] = useState("");
  const [academicRecords, setAcademicRecords] = useState<StudentAcademicRecord[]>([
    { examName: "", institute: "", result: "", year: new Date().getFullYear() },
  ]);

  const appliedPostingIds = useMemo(
    () => new Set(existingApplications.map((item) => item.posting.id)),
    [existingApplications],
  );

  useEffect(() => {
    setHeadline(applicationProfile?.headline ?? "");
    setAbout(applicationProfile?.about ?? "");
    setDocumentUrlsInput((applicationProfile?.documentUrls ?? []).join(", "));
    setAcademicRecords(
      applicationProfile?.academicRecords?.length
        ? applicationProfile.academicRecords
        : [{ examName: "", institute: "", result: "", year: new Date().getFullYear() }],
    );
  }, [applicationProfile]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listStudentAdmissionPosts();
        if (!cancelled) {
          setPostings(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load admission openings");
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

  const parseCsvField = (raw: string) =>
    raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const getError = (path: string) => fieldErrors[path];
  const getFirstError = (paths: string[]) => paths.map((path) => getError(path)).find(Boolean);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 71 }, (_, index) => currentYear - index);
  }, []);

  const addAcademicRecord = () => {
    setAcademicRecords((prev) => [
      ...prev,
      { examName: "", institute: "", result: "", year: new Date().getFullYear() },
    ]);
  };

  const updateAcademicRecord = (
    index: number,
    field: keyof StudentAcademicRecord,
    value: string | number,
  ) => {
    setAcademicRecords((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeAcademicRecord = (index: number) => {
    setAcademicRecords((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const saveApplicationProfile = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    setSavingProfile(true);
    setFieldErrors({});
    try {
      const draftPayload = {
        headline: headline.trim(),
        about: about.trim(),
        documentUrls: parseCsvField(documentUrlsInput),
        academicRecords: academicRecords.map((item) => ({
          examName: item.examName.trim(),
          institute: item.institute.trim(),
          result: item.result.trim(),
          year: Number(item.year),
        })),
      };

      const validation = studentApplicationProfileSchema.safeParse(draftPayload);
      if (!validation.success) {
        const nextErrors: Record<string, string> = {};
        for (const issue of validation.error.issues) {
          const key = issue.path.join(".") || "form";
          if (!nextErrors[key]) {
            nextErrors[key] = issue.message;
          }
        }

        setFieldErrors(nextErrors);
        throw new Error("Please fix the highlighted fields.");
      }

      if (applicationProfile) {
        await StudentPortalService.updateApplicationProfile(validation.data);
      } else {
        await StudentPortalService.createApplicationProfile(validation.data);
      }

      toast.success("Application profile saved");
      if (onProfileUpdated) {
        await onProfileUpdated();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const removeApplicationProfile = async () => {
    setDeletingProfile(true);
    try {
      await StudentPortalService.deleteApplicationProfile();
      toast.success("Application profile deleted");
      if (onProfileUpdated) {
        await onProfileUpdated();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete profile";
      toast.error(message);
    } finally {
      setDeletingProfile(false);
    }
  };

  const handleApply = async (postingId: string) => {
    setApplyingPostingId(postingId);
    try {
      await StudentPortalService.applyToAdmissionPosting(postingId, {
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
  const canApply = Boolean(applicationProfile?.isComplete);

  const getStatusClassName = (status: StudentAdmissionApplication["status"]) => {
    if (status === "APPROVED") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "REJECTED") {
      return "bg-rose-100 text-rose-700";
    }

    if (status === "SHORTLISTED") {
      return "bg-sky-100 text-sky-700";
    }

    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-5">
      <article className="rounded-3xl border border-border/70 bg-card/85 p-6 shadow-sm backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Student onboarding</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Apply to a school/college to unlock your portal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete your profile with required documents and academic records, then apply to an admission opening.
        </p>
        <p className="mt-2 text-xs font-semibold text-primary">
          Profile status: {applicationProfile?.isComplete ? "Complete" : "Incomplete"}
        </p>
      </article>

      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-base font-semibold sm:text-lg">Application Profile (Required Before Apply)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Add your academic background and document links (mark sheets, certificates, ID proofs, etc.).
        </p>

        <form className="mt-4 space-y-3" onSubmit={saveApplicationProfile}>
          {getError("form") ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {getError("form")}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium">Headline</p>
              <p className="text-[11px] text-muted-foreground">Requirement: 2-180 characters</p>
              <input
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="I am a motivated applicant for..."
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              {getError("headline") ? <p className="text-xs text-destructive">{getError("headline")}</p> : null}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium">Document URLs</p>
              <p className="text-[11px] text-muted-foreground">Requirement: at least one valid URL, comma separated</p>
              <input
                value={documentUrlsInput}
                onChange={(event) => setDocumentUrlsInput(event.target.value)}
                placeholder="https://.../transcript.pdf, https://.../certificate.pdf"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              {getFirstError(["documentUrls", "documentUrls.0"]) ? (
                <p className="text-xs text-destructive">{getFirstError(["documentUrls", "documentUrls.0"])}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium">About</p>
            <p className="text-[11px] text-muted-foreground">Requirement: minimum 20 characters</p>
            <textarea
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              placeholder="Describe your academic background and admission goals"
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            {getError("about") ? <p className="text-xs text-destructive">{getError("about")}</p> : null}
          </div>

          <div className="space-y-2 rounded-xl border border-border/70 bg-background/50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">Academic Records</p>
              <button
                type="button"
                onClick={addAcademicRecord}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Row
              </button>
            </div>

            {academicRecords.map((record, index) => (
              <div key={`${index}-${record.examName}`} className="rounded-lg border border-border/70 bg-card p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Record #{index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeAcademicRecord(index)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Exam Name (dropdown)</p>
                    <select
                      value={record.examName}
                      onChange={(event) => updateAcademicRecord(index, "examName", event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select exam</option>
                      {EXAM_NAME_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                      {record.examName && !EXAM_NAME_OPTIONS.includes(record.examName) ? (
                        <option value={record.examName}>{record.examName}</option>
                      ) : null}
                    </select>
                    {getError(`academicRecords.${index}.examName`) ? (
                      <p className="text-xs text-destructive">{getError(`academicRecords.${index}.examName`)}</p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Institute (minimum 2 characters)</p>
                    <input
                      value={record.institute}
                      onChange={(event) => updateAcademicRecord(index, "institute", event.target.value)}
                      placeholder="Institute"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    {getError(`academicRecords.${index}.institute`) ? (
                      <p className="text-xs text-destructive">{getError(`academicRecords.${index}.institute`)}</p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Result (dropdown)</p>
                    <select
                      value={record.result}
                      onChange={(event) => updateAcademicRecord(index, "result", event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select result</option>
                      {RESULT_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                      {record.result && !RESULT_OPTIONS.includes(record.result) ? (
                        <option value={record.result}>{record.result}</option>
                      ) : null}
                    </select>
                    {getError(`academicRecords.${index}.result`) ? (
                      <p className="text-xs text-destructive">{getError(`academicRecords.${index}.result`)}</p>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Passing Year (1950-2100)</p>
                    <select
                      value={String(record.year)}
                      onChange={(event) => updateAcademicRecord(index, "year", Number(event.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select year</option>
                      {yearOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {getError(`academicRecords.${index}.year`) ? (
                      <p className="text-xs text-destructive">{getError(`academicRecords.${index}.year`)}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {getError("academicRecords") ? (
              <p className="text-xs text-destructive">{getError("academicRecords")}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {applicationProfile ? "Update Profile" : "Save Profile"}
            </button>

            {applicationProfile ? (
              <button
                type="button"
                disabled={deletingProfile}
                onClick={() => void removeApplicationProfile()}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deletingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete Profile
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-base font-semibold sm:text-lg">Available Admission Openings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Apply to one or more institutions after your profile becomes complete.
        </p>

        {loading ? (
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading admission posts...
          </div>
        ) : null}

        {!loading && error ? (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {!loading && !error && !hasPostings ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-background/60 p-6 text-center">
            <SearchX className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No admission openings are available right now.</p>
          </div>
        ) : null}

        {!loading && !error && hasPostings ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {postings.map((post) => {
              const alreadyApplied = appliedPostingIds.has(post.id);
              const isApplying = applyingPostingId === post.id;

              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-start gap-3">
                    {post.institutionLogo ? (
                      <Image
                        src={post.institutionLogo}
                        alt={post.institution}
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(post.institution)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold">{post.title}</h3>
                      <p className="truncate text-xs text-muted-foreground">{post.institution}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {post.departmentName ?? "General"}
                        {post.location ? ` • ${post.location}` : ""}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{post.summary}</p>

                  <textarea
                    value={coverLetter[post.id] ?? ""}
                    onChange={(event) =>
                      setCoverLetter((prev) => ({
                        ...prev,
                        [post.id]: event.target.value,
                      }))
                    }
                    placeholder="Optional cover letter"
                    rows={3}
                    className="mt-3 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  />

                  <button
                    type="button"
                    disabled={!canApply || alreadyApplied || isApplying}
                    onClick={() => void handleApply(post.id)}
                    className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {alreadyApplied ? "Already Applied" : "Apply"}
                  </button>

                  {canApply ? null : (
                    <p className="mt-2 text-xs text-amber-600">
                      Complete your profile and add required documents before applying.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        ) : null}
      </article>

      {existingApplications.length > 0 ? (
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">My Applications</h2>
          <div className="mt-4 grid gap-3">
            {existingApplications.map((application) => (
              <div
                key={application.id}
                className="rounded-lg border border-border/70 bg-background/60 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{application.posting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {application.institution?.name ?? "Institution"} • Applied on {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClassName(application.status)}`}>
                    {application.status}
                  </span>
                </div>
                {application.institutionResponse ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Response: {application.institutionResponse}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </div>
  );
}
