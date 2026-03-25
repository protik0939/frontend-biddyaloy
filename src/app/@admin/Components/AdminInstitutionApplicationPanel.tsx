"use client";

import {
  BookOpenText,
  Building2,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  Loader2,
  Menu,
  Send,
  Settings2,
  ShieldCheck,
  Workflow,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createInstitutionApplication,
  getMyInstitutionApplications,
  type CreateInstitutionApplicationPayload,
  type InstitutionApplication,
  type InstitutionType,
} from "@/services/Admin/institutionApplication.service";
import ThemeToggle from "@/Components/ThemeToggle";
import ImagebbUploader from "@/Components/ui/ImagebbUploader";

type AdminDashboardSection =
  | "overview"
  | "programs"
  | "workflow"
  | "faculty"
  | "departments"
  | "settings";

const institutionTypes: InstitutionType[] = [
  "SCHOOL",
  "COLLEGE",
  "UNIVERSITY",
  "TRAINING_CENTER",
  "OTHER",
];

function emptyForm(): CreateInstitutionApplicationPayload {
  return {
    institutionName: "",
    shortName: "",
    institutionType: "SCHOOL",
    description: "",
    institutionLogo: "",
  };
}

function formatInstitutionType(type: InstitutionType) {
  return type
    .split("_")
    .map((entry) => `${entry.charAt(0)}${entry.slice(1).toLowerCase()}`)
    .join(" ");
}

export default function AdminInstitutionApplicationPanel() {
  const [applications, setApplications] = useState<InstitutionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateInstitutionApplicationPayload>(emptyForm());
  const [activeSection, setActiveSection] = useState<AdminDashboardSection>("overview");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showApprovedBanner, setShowApprovedBanner] = useState(true);

  const latest = applications[0];
  const isApproved = latest?.status === "APPROVED";
  const approvedInstitutionType = latest?.institutionType;

  const canSubmit = useMemo(() => {
    return (
      form.institutionName.trim().length >= 2 &&
      (!form.shortName || form.shortName.trim().length >= 2)
    );
  }, [form]);

  const loadMyApplications = async () => {
    setLoading(true);
    try {
      const result = await getMyInstitutionApplications();
      setApplications(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch your applications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMyApplications();
  }, []);

  useEffect(() => {
    if (!isApproved || !latest?.id) {
      setShowApprovedBanner(true);
      return;
    }

    const storageKey = `admin-approved-banner-dismissed:${latest.id}`;
    try {
      const isDismissed = globalThis.localStorage.getItem(storageKey) === "1";
      setShowApprovedBanner(!isDismissed);
    } catch {
      setShowApprovedBanner(true);
    }
  }, [isApproved, latest?.id]);

  const dismissApprovedBanner = () => {
    if (!latest?.id) {
      setShowApprovedBanner(false);
      return;
    }

    const storageKey = `admin-approved-banner-dismissed:${latest.id}`;
    try {
      globalThis.localStorage.setItem(storageKey, "1");
    } catch {
      // no-op if storage is blocked
    }
    setShowApprovedBanner(false);
  };

  const handleApply = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.warning("Please fill in institution name and a valid short name");
      return;
    }

    setSubmitting(true);
    try {
      await createInstitutionApplication({
        institutionName: form.institutionName.trim(),
        shortName: form.shortName?.trim() || undefined,
        description: form.description?.trim() || undefined,
        institutionType: form.institutionType,
        institutionLogo: form.institutionLogo?.trim() || undefined,
      });
      toast.success("Application submitted successfully");
      setForm(emptyForm());
      await loadMyApplications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit application";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-96 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-6 right-2 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm rounded-2xl border border-border/70 bg-background/70 p-6 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-base font-semibold">Preparing your admin workspace</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Fetching institution application status...
          </p>

          <div className="mt-4 space-y-2">
            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-2 w-2/3 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  const actionCards = [
    {
      title: "Program Management",
      description: "Create and manage institutional programs and curriculum structures.",
      icon: BookOpenText,
      enabled: true,
    },
    {
      title: "Academic Workflow",
      description: "Set up semesters, sections, and class-flow configurations.",
      icon: Workflow,
      enabled: true,
    },
    {
      title: "Faculty Management",
      description: "Create faculties for university-level institutional structure.",
      icon: GraduationCap,
      enabled: approvedInstitutionType === "UNIVERSITY",
    },
    {
      title: "Department Management",
      description: "Manage departments and map them with programs and administration.",
      icon: Layers3,
      enabled: approvedInstitutionType === "UNIVERSITY",
    },
  ];

  const dashboardMenuItems: {
    key: AdminDashboardSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    enabled: boolean;
  }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard, enabled: true },
    { key: "programs", label: "Programs", icon: BookOpenText, enabled: true },
    { key: "workflow", label: "Academic Workflow", icon: Workflow, enabled: true },
    {
      key: "faculty",
      label: "Faculties",
      icon: GraduationCap,
      enabled: approvedInstitutionType === "UNIVERSITY",
    },
    {
      key: "departments",
      label: "Departments",
      icon: Layers3,
      enabled: approvedInstitutionType === "UNIVERSITY",
    },
    { key: "settings", label: "Settings", icon: Settings2, enabled: true },
  ];

  return (
    <section className="relative space-y-5 overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm sm:p-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-primary">Admin Workflow</p>
        <h1 className="mt-1 text-xl font-semibold sm:text-2xl">Institution Application</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit your institution request for superadmin review. Status updates are shown below.
        </p>
      </header>

      {latest?.status === "PENDING" && (
        <article className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <Clock3 className="h-4 w-4" />
            <p className="text-sm font-semibold">Your application is under review</p>
          </div>
          <p className="text-sm text-amber-900/90 dark:text-amber-200/90">
            Institution: {latest.institutionName} ({formatInstitutionType(latest.institutionType)})
          </p>
          <p className="mt-1 text-xs text-amber-900/80 dark:text-amber-100/80">
            Submitted on {new Date(latest.createdAt).toLocaleString()}
          </p>
        </article>
      )}

      {isApproved && (
        <>
          {showApprovedBanner && (
            <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className="text-sm font-semibold">Application approved</p>
                </div>
                <button
                  type="button"
                  onClick={dismissApprovedBanner}
                  aria-label="Dismiss approved application banner"
                  className="inline-flex cursor-pointer rounded-md border border-emerald-500/30 bg-background/60 p-1 text-emerald-800 transition hover:bg-background dark:text-emerald-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-emerald-900/90 dark:text-emerald-200/90">
                Your institution has been created and linked to your admin profile.
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">Institution</p>
                  <p className="font-semibold">{latest.institutionName}</p>
                </div>
                <div className="rounded-lg bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold">{formatInstitutionType(latest.institutionType)}</p>
                </div>
              </div>
            </article>
          )}

          <article className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm backdrop-blur-sm">
            {showMobileSidebar && (
              <button
                type="button"
                aria-label="Close menu overlay"
                onClick={() => setShowMobileSidebar(false)}
                className="fixed inset-0 z-20 bg-black/40 md:hidden"
              />
            )}

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 top-8 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
            </div>

            <div className="relative flex min-h-135">
              <aside
                className={`absolute left-0 top-0 z-30 h-full border-r border-border/70 bg-card/95 p-3 shadow-md transition-all duration-300 md:static md:translate-x-0 ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"} ${showSidebar ? "w-64" : "w-16"}`}
              >
                <div className={`mb-3 flex items-center ${showSidebar ? "justify-between" : "justify-center"}`}>
                  <span
                    className={`text-sm font-semibold text-primary transition-all duration-300 ${showSidebar ? "opacity-100" : "hidden"}`}
                  >
                    Admin Menu
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSidebar((prev) => !prev)}
                      className="hidden cursor-pointer rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground md:inline-flex"
                    >
                      {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMobileSidebar(false)}
                      className="inline-flex cursor-pointer rounded-lg border border-border bg-background p-1.5 text-muted-foreground hover:text-foreground md:hidden"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <nav className="space-y-1.5">
                  {dashboardMenuItems.map((item) => {
                    const isActive = activeSection === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        disabled={!item.enabled}
                        onClick={() => {
                          setActiveSection(item.key);
                          setShowMobileSidebar(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          } disabled:cursor-not-allowed disabled:opacity-45`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className={`${showSidebar ? "inline" : "hidden"}`}>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>

              <div className="min-w-0 flex-1 p-4 sm:p-5">
                <header className="mb-4 flex flex-col gap-3 rounded-xl border border-border/70 bg-background/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowMobileSidebar(true)}
                      className="mb-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold md:hidden"
                    >
                      <Menu className="h-3.5 w-3.5" /> Menu
                    </button>
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">Admin Control Center</p>
                    <h2 className="mt-1 text-lg font-semibold sm:text-xl">Institution Dashboard</h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-lg border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {formatInstitutionType(latest.institutionType)}
                    </div>
                    <ThemeToggle />
                  </div>
                </header>

                {activeSection === "overview" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                        <p className="text-xs text-muted-foreground">Institution</p>
                        <p className="mt-1 font-semibold">{latest.institutionName}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="mt-1 inline-flex items-center gap-2 font-semibold text-emerald-600">
                          <ShieldCheck className="h-4 w-4" /> Approved
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                        <p className="text-xs text-muted-foreground">Created At</p>
                        <p className="mt-1 font-semibold">{new Date(latest.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {actionCards.map((action) => (
                        <button
                          key={action.title}
                          type="button"
                          disabled={!action.enabled}
                          className="group rounded-2xl border border-border/70 bg-card/95 p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <span className="rounded-xl bg-primary/15 p-2 text-primary">
                              <action.icon className="h-5 w-5" />
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${action.enabled
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                                }`}
                            >
                              {action.enabled ? "Available" : "University only"}
                            </span>
                          </div>
                          <h3 className="mt-4 text-base font-semibold">{action.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "programs" && (
                  <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                    <h3 className="text-base font-semibold">Programs</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Program creation and management UI will be wired to API in the next step.
                    </p>
                  </div>
                )}

                {activeSection === "workflow" && (
                  <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                    <h3 className="text-base font-semibold">Academic Workflow</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Configure semesters, sections, and scheduling workflow from this module.
                    </p>
                  </div>
                )}

                {activeSection === "faculty" && (
                  <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                    <h3 className="text-base font-semibold">Faculties</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Faculty management is enabled for university institutions.
                    </p>
                  </div>
                )}

                {activeSection === "departments" && (
                  <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                    <h3 className="text-base font-semibold">Departments</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Department setup and linking tools will appear in this section.
                    </p>
                  </div>
                )}

                {activeSection === "settings" && (
                  <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                    <h3 className="text-base font-semibold">Admin Settings</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Configure institution profile preferences and admin-level dashboard settings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </article>
        </>
      )}

      {latest?.status === "REJECTED" && (
        <article className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-rose-800 dark:text-rose-300">
            <XCircle className="h-4 w-4" />
            <p className="text-sm font-semibold">Latest application was rejected</p>
          </div>
          <p className="text-sm text-rose-900/90 dark:text-rose-200/90">
            Reason: {latest.rejectionReason ?? "No reason provided"}
          </p>
          <p className="mt-1 text-xs text-rose-900/80 dark:text-rose-100/80">
            You can revise details and reapply below.
          </p>
        </article>
      )}

      {(!latest || latest.status === "REJECTED") && (
        <form onSubmit={handleApply} className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-4">
          <h2 className="text-base font-semibold">
            {latest?.status === "REJECTED" ? "Reapply" : "Submit New Application"}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Institution Name</span>
              <input
                value={form.institutionName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, institutionName: event.target.value }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                placeholder="Dhaka Model College"
                required
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Short Name</span>
              <input
                value={form.shortName}
                onChange={(event) => setForm((prev) => ({ ...prev, shortName: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                placeholder="DMC"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Institution Type</span>
              <select
                value={form.institutionType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    institutionType: event.target.value as InstitutionType,
                  }))
                }
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              >
                {institutionTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatInstitutionType(type)}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-1 text-sm sm:col-span-2">
              <ImagebbUploader
                label="Institution logo (optional)"
                helperText="Crop to square and upload to ImageBB"
                value={form.institutionLogo}
                imageSizeMB={6}
                compressionSizeKB={250}
                cropRatio={1}
                onChange={(uploadedUrl) =>
                  setForm((prev) => ({ ...prev, institutionLogo: uploadedUrl }))
                }
              />
            </div>
          </div>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Description (optional)</span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              placeholder="Brief introduction about the institution"
            />
          </label>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      )}

      <section className="rounded-xl border border-border/70 bg-background/70 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Application History</h2>
        </div>

        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications submitted yet.</p>
        ) : (
          <div className="space-y-2">
            {applications.map((application) => (
              <div key={application.id} className="rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{application.institutionName}</p>
                  <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs">
                    {application.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatInstitutionType(application.institutionType)} - {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
