import {
  BellDot,
  BookOpen,
  Building2,
  FileText,
  GraduationCap,
  LineChart,
  School,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { type ComponentType } from "react";
import type { SuperAdminDashboardSummary } from "@/services/Admin/institutionApplication.service";

import ApplicationsReviewPanel from "./ApplicationsReviewPanel";

import { type SuperAdminSection } from "./superAdminSections";

interface SuperAdminSectionContentProps {
  section: SuperAdminSection;
  summary?: SuperAdminDashboardSummary | null;
  loading?: boolean;
}

const sectionContentMap: Record<
  SuperAdminSection,
  {
    title: string;
    description: string;
    Icon: ComponentType<{ className?: string }>;
    metrics: { label: string; value: string }[];
  }
> = {
  overview: {
    title: "System Overview",
    description: "Live health and growth insights across the full Biddyaloy platform.",
    Icon: LineChart,
    metrics: [
      { label: "Uptime", value: "99.98%" },
      { label: "New Signups", value: "1,124" },
      { label: "Weekly Growth", value: "+4.2%" },
    ],
  },
  institutions: {
    title: "Institution Operations",
    description: "Track onboarding, verification, and profile completion of institutions.",
    Icon: Building2,
    metrics: [
      { label: "Pending Verifications", value: "12" },
      { label: "Active Campuses", value: "142" },
      { label: "New This Month", value: "9" },
    ],
  },
  students: {
    title: "Student Analytics",
    description: "Review enrollment movement, activity trends, and support queues.",
    Icon: Users,
    metrics: [
      { label: "Active Students", value: "128,450" },
      { label: "New Admissions", value: "3,284" },
      { label: "At Risk", value: "412" },
    ],
  },
  teachers: {
    title: "Teacher Monitoring",
    description: "Analyze teacher distribution, approvals, and profile completeness.",
    Icon: GraduationCap,
    metrics: [
      { label: "Active Teachers", value: "8,450" },
      { label: "Pending Approval", value: "57" },
      { label: "Verified Profiles", value: "7,962" },
    ],
  },
  admins: {
    title: "Admin Governance",
    description: "Supervise role assignments, privileged access, and policy compliance.",
    Icon: ShieldCheck,
    metrics: [
      { label: "Active Admins", value: "366" },
      { label: "Role Changes", value: "28" },
      { label: "Audit Flags", value: "3" },
    ],
  },
  reports: {
    title: "Reports Center",
    description: "Centralized performance snapshots for academic and system outcomes.",
    Icon: FileText,
    metrics: [
      { label: "Generated Today", value: "46" },
      { label: "Scheduled", value: "14" },
      { label: "Failures", value: "0" },
    ],
  },
  applications: {
    title: "Application Queue",
    description: "Monitor institution and teacher application workflows in real-time.",
    Icon: BellDot,
    metrics: [
      { label: "Pending Review", value: "73" },
      { label: "Approved Today", value: "21" },
      { label: "Rejected", value: "4" },
    ],
  },
  settings: {
    title: "Global Settings",
    description: "Configure defaults, policies, feature flags, and academic preferences.",
    Icon: Settings,
    metrics: [
      { label: "Feature Flags", value: "18" },
      { label: "Policy Updates", value: "7" },
      { label: "Sync Status", value: "Healthy" },
    ],
  },
};

export default function SuperAdminSectionContent({
  section,
  summary,
  loading = false,
}: Readonly<SuperAdminSectionContentProps>) {
  const content = sectionContentMap[section];
  const showApplicationReviewPanel = section === "applications";
  const stats = summary?.stats;
  const numberFormatter = new Intl.NumberFormat();

  const dynamicMetrics: Partial<Record<SuperAdminSection, { label: string; value: string }[]>> = {
    overview: [
      { label: "Active Sessions", value: numberFormatter.format(stats?.activeSessions ?? 0) },
      { label: "New Signups", value: numberFormatter.format(stats?.newSignupsLast7Days ?? 0) },
      { label: "Weekly Growth", value: `${stats?.weeklyGrowthPercentage ?? 0}%` },
    ],
    institutions: [
      {
        label: "Pending Verifications",
        value: numberFormatter.format(stats?.pendingInstitutionVerifications ?? 0),
      },
      { label: "Active Campuses", value: numberFormatter.format(stats?.totalInstitutions ?? 0) },
      {
        label: "New This Month",
        value: numberFormatter.format(stats?.newInstitutionsThisMonth ?? 0),
      },
    ],
    students: [
      { label: "Active Students", value: numberFormatter.format(stats?.totalStudents ?? 0) },
      {
        label: "New Admissions",
        value: numberFormatter.format(stats?.newAdmissionsThisMonth ?? 0),
      },
      {
        label: "Pending Applications",
        value: numberFormatter.format(stats?.pendingApplications ?? 0),
      },
    ],
    teachers: [
      { label: "Active Teachers", value: numberFormatter.format(stats?.totalTeachers ?? 0) },
      {
        label: "Pending Approval",
        value: numberFormatter.format(stats?.pendingTeacherApprovals ?? 0),
      },
      {
        label: "Verified Profiles",
        value: numberFormatter.format(stats?.verifiedTeacherProfiles ?? 0),
      },
    ],
    admins: [
      { label: "Active Admins", value: numberFormatter.format(stats?.totalStaffAccounts ?? 0) },
      {
        label: "Pending Requests",
        value: numberFormatter.format(stats?.pendingApplications ?? 0),
      },
      {
        label: "Rejected Applications",
        value: numberFormatter.format(stats?.rejectedApplications ?? 0),
      },
    ],
    reports: [
      {
        label: "Generated This Month",
        value: numberFormatter.format(stats?.newInstitutionsThisMonth ?? 0),
      },
      { label: "Approved Today", value: numberFormatter.format(stats?.approvedToday ?? 0) },
      { label: "Active Sessions", value: numberFormatter.format(stats?.activeSessions ?? 0) },
    ],
    applications: [
      { label: "Pending Review", value: numberFormatter.format(stats?.pendingApplications ?? 0) },
      { label: "Approved Today", value: numberFormatter.format(stats?.approvedToday ?? 0) },
      {
        label: "Rejected",
        value: numberFormatter.format(stats?.rejectedApplications ?? 0),
      },
    ],
    settings: [
      {
        label: "Institutions",
        value: numberFormatter.format(stats?.totalInstitutions ?? 0),
      },
      {
        label: "Staff Accounts",
        value: numberFormatter.format(stats?.totalStaffAccounts ?? 0),
      },
      { label: "Sync Status", value: "Healthy" },
    ],
  };

  const metrics = dynamicMetrics[section] ?? content.metrics;

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex items-start gap-3">
          <span className="rounded-xl bg-primary/15 p-2 text-primary">
            <content.Icon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">{content.title}</h2>
            <p className="text-sm text-muted-foreground">{content.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-border/70 bg-background/70 p-3"
            >
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              {loading ? (
                <div className="mt-1 h-6 w-20 animate-pulse rounded bg-muted/60" />
              ) : (
                <p className="mt-1 text-lg font-semibold">{metric.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <School className="h-4 w-4 text-primary" />
              Operational Focus
            </div>
            Keep this section aligned with current academic cycle targets and team workloads.
          </div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
            <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              Recommended Action
            </div>
            Review top anomalies weekly and auto-assign unresolved items to responsible admins.
          </div>
        </div>
      </article>

      {showApplicationReviewPanel ? <ApplicationsReviewPanel /> : null}
    </div>
  );
}
