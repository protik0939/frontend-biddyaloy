"use client";

import { Bell, BookOpen, Menu, SquareStack, ClipboardList, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import LogoutButton from "@/Components/LogoutButton";
import SidebarProfileCard from "@/Components/SidebarProfileCard";
import ThemeToggle from "@/Components/ThemeToggle";
import {
  type TeacherPortalProfileResponse,
  TeacherPortalService,
} from "@/services/Teacher/teacherPortal.service";
import { NoticeService } from "@/services/Notice/notice.service";

import TeacherApplicationGate from "./TeacherApplicationGate";
import TeacherSectionContent from "../sections/TeacherSectionContent";
import { teacherSidebarItems, type TeacherSection } from "../sections/teacherSections";

let teacherProfileCache: TeacherPortalProfileResponse | null = null;

interface TeacherDashboardProps {
  section: TeacherSection;
}

export default function TeacherDashboard({ section }: Readonly<TeacherDashboardProps>) {
  const pathname = usePathname();
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(!teacherProfileCache);
  const [showFullscreenLoader, setShowFullscreenLoader] = useState(false);
  const [profileState, setProfileState] = useState<TeacherPortalProfileResponse | null>(teacherProfileCache);
  const [unreadNoticeCount, setUnreadNoticeCount] = useState(0);

  const loadUnreadNoticeCount = async () => {
    try {
      const result = await NoticeService.getUnreadCount();
      setUnreadNoticeCount(result.unreadCount);
    } catch {
      // Keep previous count when unread fetch fails.
    }
  };

  const reloadProfile = async () => {
    const data = await TeacherPortalService.getProfileOverview();
    teacherProfileCache = data;
    setProfileState(data);
  };

  useEffect(() => {
    let cancelled = false;
    let shouldShowFullscreenLoader = false;

    const load = async () => {
      if (!teacherProfileCache && globalThis.window !== undefined) {
        const loaderSeen = globalThis.sessionStorage.getItem("teacher:fullscreen-loader-seen");
        shouldShowFullscreenLoader = loaderSeen !== "1";
      }

      if (!cancelled && !teacherProfileCache) {
        setShowFullscreenLoader(shouldShowFullscreenLoader);
      }

      if (!teacherProfileCache) {
        setLoadingProfile(true);
      }

      try {
        const data = await TeacherPortalService.getProfileOverview();
        if (!cancelled) {
          teacherProfileCache = data;
          setProfileState(data);

          if (shouldShowFullscreenLoader && globalThis.window !== undefined) {
            globalThis.sessionStorage.setItem("teacher:fullscreen-loader-seen", "1");
          }
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to load teacher profile";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
          setShowFullscreenLoader(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadUnreadNoticeCount();

    if (pathname === "/notices") {
      const timer = globalThis.setTimeout(() => {
        void loadUnreadNoticeCount();
      }, 800);

      return () => {
        globalThis.clearTimeout(timer);
      };
    }

    return undefined;
  }, [pathname]);

  const isOverview = section === "overview";

  const overviewStats = useMemo(
    () => [
      { label: "Sections", value: profileState?.hasInstitution ? "Assigned" : "Locked", Icon: SquareStack },
      { label: "Attendance", value: profileState?.hasInstitution ? "Daily" : "Locked", Icon: ClipboardList },
      { label: "Classworks", value: profileState?.hasInstitution ? "Active" : "Locked", Icon: BookOpen },
      {
        label: "Applications",
        value: String(profileState?.applications.length ?? 0),
        Icon: Bell,
      },
    ],
    [profileState?.applications.length, profileState?.hasInstitution],
  );

  const updateNotes = [
    "Create tasks, assignments, quizzes, and notices from one workspace.",
    "Take section-wise attendance for a selected date and update instantly.",
    "Track approved and pending institution applications in the same portal.",
  ];

  if (loadingProfile) {
    if (!showFullscreenLoader) {
      return (
        <section className="relative min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/90 px-4 py-2 text-sm text-muted-foreground shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading teacher workspace...
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="relative flex min-h-screen items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        </div>

        <article className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/70 bg-card/90 p-0 shadow-sm">
          <div className="h-1.5 w-full animate-pulse bg-linear-to-r from-primary/20 via-primary/80 to-primary/20" />
          <div className="p-6 sm:p-7">
            <div className="flex items-center gap-4">
              <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="absolute inline-flex h-12 w-12 animate-ping rounded-full border border-primary/20" />
              </div>

              <div>
                <p className="text-base font-semibold tracking-tight">Loading, Please Wait!</p>
                <p className="mt-1 text-sm text-muted-foreground">Checking your institution assignment...</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    );
  }

  if (!profileState) {
    return null;
  }

  if (!profileState?.hasInstitution) {
    return (
      <section className="relative min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl space-y-5">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/70 bg-card/85 p-5 shadow-sm backdrop-blur-md">
            <div>
              <p className="text-sm font-medium text-primary">Teacher Portal</p>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Welcome, {profileState?.user.name}</h1>
              <p className="text-sm text-muted-foreground">Apply to an institution to start teaching workflows.</p>
            </div>
            <div className="flex gap-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </header>

          <TeacherApplicationGate
            existingApplications={profileState?.applications ?? []}
            applicationProfile={profileState.applicationProfile}
            onApplied={reloadProfile}
            onProfileUpdated={reloadProfile}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-background lg:h-screen lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
      </div>

      {showMobileSidebar ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setShowMobileSidebar(false)}
          className="fixed inset-0 z-30 cursor-pointer bg-black/45 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <div className="relative mx-auto flex w-full gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:h-full lg:px-8">
        <aside
          className={`fixed left-4 top-6 z-40 flex h-[calc(100vh-3rem)] flex-col overflow-y-auto rounded-3xl border border-border/70 bg-card/95 p-3 shadow-lg backdrop-blur-md transition-all duration-300 lg:left-8 lg:top-8 lg:h-[calc(100vh-4rem)] ${showMobileSidebar ? "translate-x-0 opacity-100" : "-translate-x-[115%] opacity-0"} lg:translate-x-0 lg:opacity-100 ${showSidebar ? "w-64" : "w-16.5"}`}
        >
          <div className={`mb-3 flex items-center ${showSidebar ? "justify-between" : "justify-center"}`}>
            <div
              className={`overflow-hidden transition-all duration-300 ${showSidebar ? "w-auto opacity-100" : "w-0 opacity-0"}`}
            >
              <p className="truncate px-2 text-sm font-semibold text-primary">Teacher Menu</p>
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
            {teacherSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setShowMobileSidebar(false)}
                  className={`group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  <item.Icon className="h-4 w-4 shrink-0" />
                  <span
                    className={`origin-left whitespace-nowrap transition-all duration-300 ${showSidebar ? "scale-100 opacity-100" : "scale-95 opacity-0 lg:hidden"}`}
                  >
                    {item.label}
                  </span>
                  {item.section === "notices" && unreadNoticeCount > 0 ? (
                    <span className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <SidebarProfileCard
            userName={profileState?.user?.name}
            userImage={profileState?.user?.image}
            institutionShortName={profileState?.profile?.institution?.shortName}
            institutionLogo={profileState?.profile?.institution?.institutionLogo}
            expanded={showSidebar}
          />
        </aside>

        <div
          className={`min-w-0 flex-1 overflow-visible pr-0 transition-all duration-300 ease-out lg:overflow-y-auto lg:pl-4 ${showSidebar ? "lg:ml-64 lg:translate-x-0" : "lg:ml-16.5 lg:translate-x-1"}`}
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
              <p className="text-sm font-medium text-primary">Teacher Control Center</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Teacher Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                {profileState?.profile?.institution?.name ?? "Institution"} • {profileState?.profile?.department?.fullName ?? "Department"}
              </p>
            </div>
            <div className="flex flex-row justify-center gap-3">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </header>

          <div className={`space-y-6 pb-3 transition-all duration-300 ease-out ${showSidebar ? "lg:scale-100" : "lg:scale-[0.995]"}`}>
            {isOverview ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {overviewStats.map((item) => (
                    <article
                      key={item.label}
                      className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <item.Icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                    </article>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm lg:col-span-2">
                    <div className="mb-4 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <h2 className="text-base font-semibold sm:text-lg">Teacher Updates</h2>
                    </div>
                    <ul className="space-y-3">
                      {updateNotes.map((item) => (
                        <li
                          key={item}
                          className="rounded-lg border border-border/70 bg-background/60 p-3 text-sm text-muted-foreground"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
                    <h2 className="text-base font-semibold sm:text-lg">Profile Snapshot</h2>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2">
                        <span className="text-muted-foreground">Teacher ID</span>
                        <span className="font-semibold">{profileState?.profile?.teachersId}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2">
                        <span className="text-muted-foreground">Initial</span>
                        <span className="font-semibold">{profileState?.profile?.teacherInitial}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2">
                        <span className="text-muted-foreground">Designation</span>
                        <span className="font-semibold">{profileState?.profile?.designation}</span>
                      </div>
                    </div>
                  </article>
                </div>

                <article className="grid grid-cols-1 gap-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm md:grid-cols-3">
                  <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                    <p className="text-sm font-medium">Section Visibility</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Check each section and student under your assigned classes.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                    <p className="text-sm font-medium">Assessment Publishing</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Publish tasks, assignments, quizzes, and notices quickly.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                    <p className="text-sm font-medium">Attendance Workflow</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Submit daily attendance section-wise with a single save action.
                    </p>
                  </div>
                </article>
              </>
            ) : null}

            <TeacherSectionContent section={section} />
          </div>
        </div>
      </div>
    </section>
  );
}
