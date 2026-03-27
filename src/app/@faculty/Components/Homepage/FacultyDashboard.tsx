"use client";

import {
  Bell,
  Building2,
  GraduationCap,
  Menu,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import LogoutButton from "@/Components/LogoutButton";
import ThemeToggle from "@/Components/ThemeToggle";
import FacultySectionContent from "@/app/@faculty/Components/Sections/FacultySectionContent";

import { facultySidebarItems, type FacultySection } from "../Sections/facultySections";

const overviewStats = [
  { label: "Total Departments", value: "12", Icon: Building2 },
  { label: "Total Teachers", value: "148", Icon: GraduationCap },
  { label: "Total Students", value: "3,892", Icon: Users },
  { label: "Department Accounts", value: "24", Icon: UserCheck },
];

const updates = [
  "Registration schedule for summer term is now active.",
  "Two departments are pending final setup and account mapping.",
  "Faculty profile information sync completed successfully.",
];

interface FacultyDashboardProps {
  section: FacultySection;
}

export default function FacultyDashboard({ section }: Readonly<FacultyDashboardProps>) {
  const pathname = usePathname();
  const isOverview = section === "overview";
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
          className="fixed inset-0 z-30 cursor-pointer bg-black/45 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <div className="relative mx-auto flex w-full gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:h-full lg:px-8">
        <aside
          className={`fixed left-4 top-6 z-40 h-[calc(100vh-3rem)] overflow-y-auto rounded-3xl border border-border/70 bg-card/95 p-3 shadow-lg backdrop-blur-md transition-all duration-300 lg:left-8 lg:top-8 lg:h-[calc(100vh-4rem)] ${showMobileSidebar ? "translate-x-0 opacity-100" : "-translate-x-[115%] opacity-0"} lg:translate-x-0 lg:opacity-100 ${showSidebar ? "w-64" : "w-16.5"}`}
        >
          <div className={`mb-3 flex items-center ${showSidebar ? "justify-between" : "justify-center"}`}>
            <div
              className={`overflow-hidden transition-all duration-300 ${showSidebar ? "w-auto opacity-100" : "w-0 opacity-0"}`}
            >
              <p className="truncate px-2 text-sm font-semibold text-primary">Faculty Menu</p>
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

          <nav className="space-y-1.5">
            {facultySidebarItems.map((item) => {
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
                </Link>
              );
            })}
          </nav>
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
              <p className="text-sm font-medium text-primary">Faculty Control Center</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Faculty Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Manage faculty profile, departments, and department admin accounts.
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
                          <h2 className="text-base font-semibold sm:text-lg">Faculty Updates</h2>
                        </div>
                        <ul className="space-y-3">
                          {updates.map((item) => (
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
                        <h2 className="text-base font-semibold sm:text-lg">Snapshot</h2>
                        <div className="mt-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2">
                            <span className="text-muted-foreground">Departments</span>
                            <span className="font-semibold">18</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2">
                            <span className="text-muted-foreground">Active Courses</span>
                            <span className="font-semibold">74</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-background/70 px-3 py-2">
                            <span className="text-muted-foreground">Support Tickets</span>
                            <span className="font-semibold">11</span>
                          </div>
                        </div>
                      </article>
                    </div>

                    <article className="grid grid-cols-1 gap-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm md:grid-cols-3">
                      <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                        <p className="text-sm font-medium">Profile Management</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Keep faculty name and profile information updated.
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                        <p className="text-sm font-medium">Department Setup</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Create and organize departments under this faculty.
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                        <p className="text-sm font-medium">Access Delegation</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Create department admin accounts for operations.
                        </p>
                      </div>
                    </article>
                  </>
                )}

                <FacultySectionContent section={section} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
