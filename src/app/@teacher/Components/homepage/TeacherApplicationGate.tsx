"use client";

import { Loader2, Plus, SearchX, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  listTeacherJobPosts,
  type PublicPostingItem,
} from "@/services/Public/publicPosting.service";
import {
  type TeacherApplicationProfile,
  type TeacherAcademicRecord,
  type TeacherExperienceRecord,
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
  applicationProfile: TeacherApplicationProfile | null;
  onApplied?: () => Promise<void> | void;
  onProfileUpdated?: () => Promise<void> | void;
}

const academicRecordSchema = z.object({
  degree: z.string().trim().min(2, "Degree is required"),
  institute: z.string().trim().min(2, "Institute is required"),
  result: z.string().trim().min(1, "Result is required"),
  year: z
    .number({ message: "Year is required" })
    .int("Year must be an integer")
    .min(1950, "Year must be between 1950 and 2100")
    .max(2100, "Year must be between 1950 and 2100"),
});

const experienceRecordSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  organization: z.string().trim().min(2, "Organization is required"),
  startDate: z.string().trim().min(1, "Start date is required"),
  endDate: z.string().trim().optional(),
  responsibilities: z.string().trim().max(2000, "Responsibilities must be at most 2000 characters").optional(),
});

const applicationProfileSchema = z.object({
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
  resumeUrl: z.url("Resume URL must be valid"),
  portfolioUrl: z.url("Portfolio URL must be valid").optional().or(z.literal("")),
  skills: z.array(z.string().trim().min(1)).min(1, "At least one skill is required"),
  certifications: z.array(z.string().trim().min(1)).optional(),
  academicRecords: z.array(academicRecordSchema).min(1, "Add at least one academic record"),
  experiences: z.array(experienceRecordSchema).min(1, "Add at least one experience record"),
});

export default function TeacherApplicationGate({
  existingApplications,
  applicationProfile,
  onApplied,
  onProfileUpdated,
}: Readonly<TeacherApplicationGateProps>) {
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
  const [resumeUrl, setResumeUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [certificationsInput, setCertificationsInput] = useState("");
  const [academicRecords, setAcademicRecords] = useState<TeacherAcademicRecord[]>([
    { degree: "", institute: "", result: "", year: new Date().getFullYear() },
  ]);
  const [experiences, setExperiences] = useState<
    Array<{
      title: string;
      organization: string;
      startDate: string;
      endDate: string;
      responsibilities: string;
    }>
  >([{ title: "", organization: "", startDate: "", endDate: "", responsibilities: "" }]);

  const DEGREE_OPTIONS = [
    "SSC",
    "HSC",
    "Diploma",
    "Bachelor",
    "Masters",
    "MPhil",
    "PhD",
    "Other",
  ];

  const appliedPostingIds = useMemo(
    () => new Set(existingApplications.map((item) => item.posting.id)),
    [existingApplications],
  );

  useEffect(() => {
    setHeadline(applicationProfile?.headline ?? "");
    setAbout(applicationProfile?.about ?? "");
    setResumeUrl(applicationProfile?.resumeUrl ?? "");
    setPortfolioUrl(applicationProfile?.portfolioUrl ?? "");
    setSkillsInput((applicationProfile?.skills ?? []).join(", "));
    setCertificationsInput((applicationProfile?.certifications ?? []).join(", "));
    setAcademicRecords(
      applicationProfile?.academicRecords?.length
        ? applicationProfile.academicRecords
        : [{ degree: "", institute: "", result: "", year: new Date().getFullYear() }],
    );
    setExperiences(
      applicationProfile?.experiences?.length
        ? applicationProfile.experiences.map((item) => ({
            title: item.title,
            organization: item.organization,
            startDate: item.startDate ? item.startDate.slice(0, 10) : "",
            endDate: item.endDate ? item.endDate.slice(0, 10) : "",
            responsibilities: item.responsibilities ?? "",
          }))
        : [{ title: "", organization: "", startDate: "", endDate: "", responsibilities: "" }],
    );
  }, [applicationProfile]);

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

  const parseCsvField = (raw: string) =>
    raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const getError = (path: string) => fieldErrors[path];

  const addAcademicRecord = () => {
    setAcademicRecords((prev) => [
      ...prev,
      { degree: "", institute: "", result: "", year: new Date().getFullYear() },
    ]);
  };

  const updateAcademicRecord = (
    index: number,
    field: keyof TeacherAcademicRecord,
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

  const addExperience = () => {
    setExperiences((prev) => [
      ...prev,
      { title: "", organization: "", startDate: "", endDate: "", responsibilities: "" },
    ]);
  };

  const updateExperience = (
    index: number,
    field: "title" | "organization" | "startDate" | "endDate" | "responsibilities",
    value: string,
  ) => {
    setExperiences((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeExperience = (index: number) => {
    setExperiences((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const saveApplicationProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSavingProfile(true);
    setFieldErrors({});
    try {
      const draftPayload = {
        headline: headline.trim(),
        about: about.trim(),
        resumeUrl: resumeUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
        skills: parseCsvField(skillsInput),
        certifications: parseCsvField(certificationsInput),
        academicRecords: academicRecords.map((item) => ({
          degree: item.degree.trim(),
          institute: item.institute.trim(),
          result: item.result.trim(),
          year: Number(item.year),
        })),
        experiences: experiences.map((item) => ({
          title: item.title.trim(),
          organization: item.organization.trim(),
          startDate: item.startDate.trim(),
          endDate: item.endDate.trim(),
          responsibilities: item.responsibilities.trim(),
        })),
      };

      const validation = applicationProfileSchema.safeParse(draftPayload);
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

      const payload = {
        headline: validation.data.headline,
        about: validation.data.about,
        resumeUrl: validation.data.resumeUrl,
        portfolioUrl: validation.data.portfolioUrl || undefined,
        skills: validation.data.skills,
        certifications: validation.data.certifications,
        academicRecords: validation.data.academicRecords,
        experiences: validation.data.experiences.map((item) => ({
          ...item,
          startDate: new Date(`${item.startDate}T00:00:00.000Z`).toISOString(),
          endDate: item.endDate ? new Date(`${item.endDate}T00:00:00.000Z`).toISOString() : undefined,
        })),
      };

      if (applicationProfile) {
        await TeacherPortalService.updateApplicationProfile(payload);
      } else {
        await TeacherPortalService.createApplicationProfile(payload);
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
      await TeacherPortalService.deleteApplicationProfile();
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
  const canApply = Boolean(applicationProfile?.isComplete);

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
        <p className="mt-2 text-xs font-semibold text-primary">
          Profile status: {applicationProfile?.isComplete ? "Complete" : "Incomplete"}
        </p>
      </article>

      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-base font-semibold sm:text-lg">Application Profile (Required Before Apply)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Add your academic and experience records from structured fields.
        </p>

        <form className="mt-4 space-y-3" onSubmit={saveApplicationProfile}>
          {getError("form") ? (
            <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {getError("form")}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium">Professional Headline</p>
              <p className="text-[11px] text-muted-foreground">Requirement: 2-180 characters</p>
              <input
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="Professional headline"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              {getError("headline") ? (
                <p className="text-xs text-destructive">{getError("headline")}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium">Resume URL</p>
              <p className="text-[11px] text-muted-foreground">Requirement: valid URL</p>
              <input
                value={resumeUrl}
                onChange={(event) => setResumeUrl(event.target.value)}
                placeholder="Resume URL"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              {getError("resumeUrl") ? (
                <p className="text-xs text-destructive">{getError("resumeUrl")}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium">Portfolio URL</p>
            <p className="text-[11px] text-muted-foreground">Requirement: optional, but must be valid URL if given</p>
            <input
              value={portfolioUrl}
              onChange={(event) => setPortfolioUrl(event.target.value)}
              placeholder="Portfolio URL (optional)"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            {getError("portfolioUrl") ? (
              <p className="text-xs text-destructive">{getError("portfolioUrl")}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium">About</p>
            <p className="text-[11px] text-muted-foreground">Requirement: minimum 20 characters</p>
            <textarea
              value={about}
              onChange={(event) => setAbout(event.target.value)}
              rows={4}
              placeholder="About your teaching profile"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            {getError("about") ? (
              <p className="text-xs text-destructive">{getError("about")}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium">Skills</p>
              <p className="text-[11px] text-muted-foreground">Requirement: at least 1 skill (comma separated)</p>
              <input
                value={skillsInput}
                onChange={(event) => setSkillsInput(event.target.value)}
                placeholder="Skills (comma separated)"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              {getError("skills") ? (
                <p className="text-xs text-destructive">{getError("skills")}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium">Certifications</p>
              <p className="text-[11px] text-muted-foreground">Requirement: optional (comma separated)</p>
              <input
                value={certificationsInput}
                onChange={(event) => setCertificationsInput(event.target.value)}
                placeholder="Certifications (comma separated)"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Academic Records</p>
              <button
                type="button"
                onClick={addAcademicRecord}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            {getError("academicRecords") ? (
              <p className="text-xs text-destructive">{getError("academicRecords")}</p>
            ) : null}
            {academicRecords.map((item, index) => (
              <div key={`academic-${index}`} className="grid grid-cols-1 gap-2 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground">Degree (required)</p>
                  <select
                    value={item.degree}
                    onChange={(event) => updateAcademicRecord(index, "degree", event.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select degree</option>
                    {DEGREE_OPTIONS.map((degree) => (
                      <option key={degree} value={degree}>
                        {degree}
                      </option>
                    ))}
                  </select>
                  {getError(`academicRecords.${index}.degree`) ? (
                    <p className="text-xs text-destructive">{getError(`academicRecords.${index}.degree`)}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground">Institute (required)</p>
                  <input
                    value={item.institute}
                    onChange={(event) => updateAcademicRecord(index, "institute", event.target.value)}
                    placeholder="Institute"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  {getError(`academicRecords.${index}.institute`) ? (
                    <p className="text-xs text-destructive">{getError(`academicRecords.${index}.institute`)}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground">Result (required)</p>
                  <input
                    value={item.result}
                    onChange={(event) => updateAcademicRecord(index, "result", event.target.value)}
                    placeholder="Result (CGPA/Division)"
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  {getError(`academicRecords.${index}.result`) ? (
                    <p className="text-xs text-destructive">{getError(`academicRecords.${index}.result`)}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground">Year (1950-2100)</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.year}
                      onChange={(event) =>
                        updateAcademicRecord(index, "year", Number(event.target.value))
                      }
                      min={1950}
                      max={2100}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeAcademicRecord(index)}
                      className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-destructive"
                      aria-label="Remove academic record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {getError(`academicRecords.${index}.year`) ? (
                    <p className="text-xs text-destructive">{getError(`academicRecords.${index}.year`)}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Experience Records</p>
              <button
                type="button"
                onClick={addExperience}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            {getError("experiences") ? (
              <p className="text-xs text-destructive">{getError("experiences")}</p>
            ) : null}
            {experiences.map((item, index) => (
              <div key={`experience-${index}`} className="space-y-2 rounded-lg border border-border/70 bg-background/70 p-3">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Position title (required)</p>
                    <input
                      value={item.title}
                      onChange={(event) => updateExperience(index, "title", event.target.value)}
                      placeholder="Position title"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    {getError(`experiences.${index}.title`) ? (
                      <p className="text-xs text-destructive">{getError(`experiences.${index}.title`)}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Organization (required)</p>
                    <input
                      value={item.organization}
                      onChange={(event) => updateExperience(index, "organization", event.target.value)}
                      placeholder="Organization"
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    {getError(`experiences.${index}.organization`) ? (
                      <p className="text-xs text-destructive">{getError(`experiences.${index}.organization`)}</p>
                    ) : null}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">Start date (required)</p>
                    <input
                      type="date"
                      value={item.startDate}
                      onChange={(event) => updateExperience(index, "startDate", event.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    {getError(`experiences.${index}.startDate`) ? (
                      <p className="text-xs text-destructive">{getError(`experiences.${index}.startDate`)}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] text-muted-foreground">End date (optional)</p>
                    <input
                      type="date"
                      value={item.endDate}
                      onChange={(event) => updateExperience(index, "endDate", event.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExperience(index)}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground">Responsibilities (optional, max 2000 characters)</p>
                  <textarea
                    value={item.responsibilities}
                    onChange={(event) =>
                      updateExperience(index, "responsibilities", event.target.value)
                    }
                    rows={2}
                    placeholder="Responsibilities (optional)"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  {getError(`experiences.${index}.responsibilities`) ? (
                    <p className="text-xs text-destructive">{getError(`experiences.${index}.responsibilities`)}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {applicationProfile ? "Update Profile" : "Create Profile"}
            </button>

            {applicationProfile ? (
              <button
                type="button"
                disabled={deletingProfile}
                onClick={() => void removeApplicationProfile()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-2 text-sm font-semibold text-destructive disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Delete Profile
              </button>
            ) : null}
          </div>
        </form>
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
                disabled={alreadyApplied || isApplying || !canApply}
                onClick={() => void handleApply(posting.id)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {alreadyApplied ? "Applied" : "Apply now"}
              </button>
              {!canApply ? (
                <p className="text-xs text-amber-700">
                  Complete and save your application profile first.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
