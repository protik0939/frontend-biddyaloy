"use client";

import {
  Bell,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  LineChart,
  Menu,
  School,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import LogoutButton from "@/Components/LogoutButton";
import SidebarProfileCard from "@/Components/SidebarProfileCard";
import ThemeToggle from "@/Components/ThemeToggle";
import UserIdentityBadge from "@/Components/UserIdentityBadge";
import { getSuperAdminDashboardSummary } from "@/services/Admin/institutionApplication.service";

import SuperAdminSectionContent from "../Sections/SuperAdminSectionContent";
import {
  type SuperAdminSection,
  superAdminSidebarItems,
} from "../Sections/superAdminSections";

import QuickActionCard from "./QuickActionCard";
import StatCard, { type StatItem } from "./StatCard";

const quickActions = [
  {
    title: "Institution Management",
    description: "Add and manage schools, colleges, and universities.",
    Icon: School,
  },
  {
    title: "User Administration",
    description: "Assign roles and handle admin-level permissions.",
    Icon: ShieldCheck,
  },
  {
    title: "Teacher Oversight",
    description: "Track teacher onboarding, attendance, and profiles.",
    Icon: BriefcaseBusiness,
  },
  {
    title: "Analytics Center",
    description: "Review reports and performance indicators.",
    Icon: LineChart,
  },
];

const announcements = [
  "Semester registration window closes in 4 days.",
  "12 newly approved institutions pending final onboarding.",
  "System audit completed successfully for this week.",
];

const overviewStatConfig: Array<{
  key: "totalInstitutions" | "totalStudents" | "totalTeachers" | "totalStaffAccounts";
  label: string;
  Icon: StatItem["Icon"];
  change: "weeklyGrowthPercentage" | null;
}> = [
  {
    key: "totalInstitutions",
    label: "Total Institutions",
    change: "weeklyGrowthPercentage",
    Icon: Building2,
  },
  {
    key: "totalStudents",
    label: "Total Students",
    change: null,
    Icon: Users,
  },
  {
    key: "totalTeachers",
    label: "Total Teachers",
    change: null,
    Icon: GraduationCap,
  },
  {
    key: "totalStaffAccounts",
    label: "Total Staff Accounts",
    change: null,
    Icon: UserCheck,
  },
];

interface SuperAdminHomeProps {
  section: SuperAdminSection;
}

export default function SuperAdminHome({ section }: Readonly<SuperAdminHomeProps>) {
  const pathname = usePathname();
  const isOverview = section === "overview";
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof getSuperAdminDashboardSummary>
  > | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      setLoadingSummary(true);
      try {
        const data = await getSuperAdminDashboardSummary();
        if (!cancelled) {
          setSummary(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load dashboard summary";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingSummary(false);
        }
      }
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const overviewStats = useMemo<StatItem[]>(() => {
    const numberFormatter = new Intl.NumberFormat();
    const stats = summary?.stats;
    const typeBreakdown = stats?.institutionTypeBreakdown ?? {};

    return overviewStatConfig.map((item) => {
      const rawValue = stats?.[item.key] ?? 0;
      const changeValue =
        item.change === "weeklyGrowthPercentage"
          ? `${stats?.weeklyGrowthPercentage ?? 0}%`
          : "";

      const subStats =
        item.key === "totalInstitutions"
          ? Object.entries(typeBreakdown).map(([label, value]) => ({
              label,
              value: numberFormatter.format(value),
            }))
          : undefined;

      return {
        label: item.label,
        value: numberFormatter.format(rawValue),
        change: changeValue,
        Icon: item.Icon,
        subStats,
      };
    });
  }, [summary]);

  return (
    <section className="relative min-h-screen bg-background lg:h-screen lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      </div>

      {showMobileSidebar && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setShowMobileSidebar(false)}
          className="fixed cursor-pointer inset-0 z-30 bg-black/45 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <div className="relative mx-auto flex w-full gap-4 px-4 py-6 sm:px-6 sm:py-8 ml-0 sm:ml-8 lg:h-full lg:px-8">
        <aside
          className={`fixed left-4 top-6 z-40 flex h-[calc(100vh-3rem)] flex-col overflow-y-auto rounded-3xl border border-border/70 bg-card/95 p-3 shadow-lg backdrop-blur-md transition-all duration-300 lg:left-8 lg:top-8 lg:h-[calc(100vh-4rem)] ${showMobileSidebar ? "translate-x-0 opacity-100" : "-translate-x-[115%] opacity-0"
            } lg:translate-x-0 lg:opacity-100 ${showSidebar ? "w-64" : "w-16.5"}`}
        >
          <div className={`mb-3 flex items-center ${showSidebar ? "justify-between" : "justify-center"}`}>
            <div className={`overflow-hidden transition-all duration-300 ${showSidebar ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
              <p className="truncate px-2 text-sm font-semibold text-primary">Dashboard Menu</p>
            </div>
            <button
              type="button"
              aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
              onClick={() => setShowSidebar((prev) => !prev)}
              className="hidden cursor-pointer rounded-xl border border-border bg-background p-2 text-muted-foreground transition hover:text-foreground lg:inline-flex"
            >
              {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setShowMobileSidebar(false)}
              className="inline-flex cursor-pointer rounded-xl border border-border bg-background p-2 text-muted-foreground transition hover:text-foreground lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1.5">
            {superAdminSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setShowMobileSidebar(false)}
                  className={`group cursor-pointer flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <item.Icon className="h-4 w-4 shrink-0" />
                  <span
                    className={`origin-left whitespace-nowrap transition-all duration-300 ${showSidebar ? "scale-100 opacity-100" : "scale-95 opacity-0 lg:hidden"
                      }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <SidebarProfileCard
            userName={summary?.user?.name}
            userImage={summary?.user?.image}
            institutionShortName="Biddyaloy"
            institutionLogo="/logo/Bidyaloylogo.svg"
            expanded={showSidebar}
          />
        </aside>

        <div
          className={`min-w-0 flex-1 overflow-visible pr-0 transition-all duration-300 ease-out lg:overflow-y-auto lg:pr-2 ${showSidebar ? "lg:ml-64 lg:translate-x-0" : "lg:ml-16.5 lg:translate-x-1"}`}
        >
          <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-md sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowMobileSidebar(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold"
                >
                  <Menu className="h-4 w-4" />
                  Menu
                </button>
              </div>
              <p className="text-sm font-medium text-primary">Superadmin Control Center</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Biddyaloy Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                A complete overview of institutions, teachers, and students across the system.
              </p>
            </div>
            <div className="flex flex-row justify-center gap-3">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </header>

          <div
            className={`grid grid-rows-[1fr] opacity-100 transition-all duration-300 ease-out ${showSidebar ? "lg:scale-100" : "lg:scale-[0.995]"}`}
          >
            <div className="overflow-hidden">
              <div className="space-y-6 pb-3">
                {isOverview && (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {loadingSummary
                        ? Array.from({ length: 4 }).map((_, index) => (
                            <article
                              key={`superadmin-stats-skeleton-${index + 1}`}
                              className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm"
                            >
                              <div className="mb-3 h-4 w-28 animate-pulse rounded bg-muted/60" />
                              <div className="h-8 w-24 animate-pulse rounded bg-muted/60" />
                              <div className="mt-3 h-3 w-20 animate-pulse rounded bg-muted/60" />
                            </article>
                          ))
                        : overviewStats.map((item) => <StatCard key={item.label} item={item} />)}
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-sm lg:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                          <Bell className="h-4 w-4 text-primary" />
                          <h2 className="text-base font-semibold sm:text-lg">Recent Highlights</h2>
                        </div>
                        <ul className="space-y-3">
                          {announcements.map((item) => (
                            <li
                              key={item}
                              className="rounded-lg border border-border/70 bg-background/60 p-3 text-sm text-muted-foreground"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </article>

                      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-sm">
                        <h2 className="text-base font-semibold sm:text-lg">System Snapshot</h2>
                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2">
                            <span className="text-muted-foreground">Active Sessions</span>
                            {loadingSummary ? (
                              <span className="h-5 w-16 animate-pulse rounded bg-muted/60" />
                            ) : (
                              <span className="font-semibold">
                                {new Intl.NumberFormat().format(summary?.stats.activeSessions ?? 0)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2">
                            <span className="text-muted-foreground">Pending Requests</span>
                            {loadingSummary ? (
                              <span className="h-5 w-16 animate-pulse rounded bg-muted/60" />
                            ) : (
                              <span className="font-semibold">
                                {new Intl.NumberFormat().format(summary?.stats.pendingApplications ?? 0)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2">
                            <span className="text-muted-foreground">Approved Today</span>
                            {loadingSummary ? (
                              <span className="h-5 w-16 animate-pulse rounded bg-muted/60" />
                            ) : (
                              <span className="font-semibold">
                                {new Intl.NumberFormat().format(summary?.stats.approvedToday ?? 0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {quickActions.map((action) => (
                        <QuickActionCard
                          key={action.title}
                          title={action.title}
                          description={action.description}
                          Icon={action.Icon}
                        />
                      ))}
                    </div>
                  </>
                )}

                <SuperAdminSectionContent section={section} summary={summary} loading={loadingSummary} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
