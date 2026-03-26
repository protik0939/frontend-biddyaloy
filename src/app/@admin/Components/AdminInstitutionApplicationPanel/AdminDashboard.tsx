import {
  BookOpenText,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  Menu,
  Settings2,
  ShieldCheck,
  Workflow,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  CreateInstitutionSubAdminPayload,
  InstitutionFacultyOption,
  InstitutionSubAdminAccountType,
} from "@/services/Admin/adminManagement.service";
import type { InstitutionApplication, InstitutionType } from "@/services/Admin/institutionApplication.service";
import SubAdminAccountForm from "./SubAdminAccountForm";
import type { AdminDashboardSection } from "./types";
import { formatInstitutionType } from "./utils";

type Props = Readonly<{
  latest: InstitutionApplication;
  approvedInstitutionType?: InstitutionType;
  onCreateSubAdmin: (payload: CreateInstitutionSubAdminPayload) => Promise<void>;
  faculties: InstitutionFacultyOption[];
  facultiesLoading: boolean;
}>;

export default function AdminDashboard({
  latest,
  approvedInstitutionType,
  onCreateSubAdmin,
  faculties,
  facultiesLoading,
}: Props) {
  const [activeSection, setActiveSection] = useState<AdminDashboardSection>("overview");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const actionCards = useMemo(
    () => [
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
        title: "Faculty Accounts",
        description: "Create faculty admin accounts and assign access credentials.",
        icon: GraduationCap,
        enabled: approvedInstitutionType === "UNIVERSITY",
      },
      {
        title: "Department Accounts",
        description: "Create department admin accounts for your institution.",
        icon: Layers3,
        enabled: approvedInstitutionType === "UNIVERSITY",
      },
    ],
    [approvedInstitutionType],
  );

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

  const renderAccountSection = (accountType: InstitutionSubAdminAccountType) => {
    const isFaculty = accountType === "FACULTY";

    return (
      <SubAdminAccountForm
        accountType={accountType}
        disabled={approvedInstitutionType !== "UNIVERSITY"}
        title={isFaculty ? "Create Faculty Admin Account" : "Create Department Admin Account"}
        description={
          isFaculty
            ? "Create faculty admin credentials and set up faculty details in one step."
            : "Create department admin credentials, then create faculty and department in one step."
        }
        onSubmit={onCreateSubAdmin}
        facultyOptions={faculties}
        facultyOptionsLoading={facultiesLoading}
      />
    );
  };

  return (
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

      <div className="relative flex">
        <aside
          className={`absolute left-0 top-0 z-30 h-auto border-r border-border/70 bg-card/95 p-3 shadow-md transition-all duration-300 md:static md:translate-x-0 ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"} ${showSidebar ? "w-64" : "w-16"}`}
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
                  className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${isActive
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
                    onClick={() => {
                      if (action.title.includes("Faculty")) {
                        setActiveSection("faculty");
                      }
                      if (action.title.includes("Department")) {
                        setActiveSection("departments");
                      }
                    }}
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

          {activeSection === "faculty" && renderAccountSection("FACULTY")}

          {activeSection === "departments" && renderAccountSection("DEPARTMENT")}

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
  );
}
