import {
  Check,
  BookOpenText,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  Loader2,
  Megaphone,
  Menu,
  Pencil,
  Settings2,
  ShieldCheck,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createInstitutionSemester,
  deleteInstitutionSemester,
  listInstitutionSemesters,
  updateInstitutionSemester,
} from "@/services/Admin/adminManagement.service";
import type {
  CreateInstitutionSubAdminPayload,
  InstitutionFacultyOption,
  InstitutionSemester,
  InstitutionSubAdminAccountType,
} from "@/services/Admin/adminManagement.service";
import type { InstitutionApplication, InstitutionType } from "@/services/Admin/institutionApplication.service";
import PostingManagementPanel from "@/Components/PostingManagement/PostingManagementPanel";
import SubAdminAccountForm from "./SubAdminAccountForm";
import type { AdminDashboardSection } from "./types";
import { formatDateDDMMYYYY, formatInstitutionType } from "./utils";
import { toast } from "sonner";

const toDateInputValue = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (value: Date, days: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

const toInputDateFromISO = (value: string) => value.slice(0, 10);

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
  const [semesters, setSemesters] = useState<InstitutionSemester[]>([]);
  const [semesterName, setSemesterName] = useState("");
  const [semesterStartDate, setSemesterStartDate] = useState("");
  const [semesterEndDate, setSemesterEndDate] = useState("");
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [creatingSemester, setCreatingSemester] = useState(false);
  const [editingSemesterId, setEditingSemesterId] = useState("");
  const [editSemesterName, setEditSemesterName] = useState("");
  const [editSemesterStartDate, setEditSemesterStartDate] = useState("");
  const [editSemesterEndDate, setEditSemesterEndDate] = useState("");
  const [savingSemesterId, setSavingSemesterId] = useState("");
  const [deletingSemesterId, setDeletingSemesterId] = useState("");

  const canCreateSemester =
    semesterName.trim().length >= 2 && Boolean(semesterStartDate) && Boolean(semesterEndDate);

  const minStartDate = useMemo(() => toDateInputValue(addDays(new Date(), 1)), []);
  const minEndDate = semesterStartDate
    ? toDateInputValue(addDays(new Date(semesterStartDate), 1))
    : minStartDate;
  const minEditStartDate = minStartDate;
  const minEditEndDate = editSemesterStartDate
    ? toDateInputValue(addDays(new Date(editSemesterStartDate), 1))
    : minEditStartDate;

  const reloadSemesters = async () => {
    setLoadingSemesters(true);
    try {
      const data = await listInstitutionSemesters();
      setSemesters(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load semesters";
      toast.error(message);
    } finally {
      setLoadingSemesters(false);
    }
  };

  useEffect(() => {
    if (activeSection === "workflow") {
      void reloadSemesters();
    }
  }, [activeSection]);

  const onCreateSemester = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateSemester) {
      toast.warning("Provide semester name, start date and end date");
      return;
    }

    if (semesterStartDate <= toDateInputValue(new Date())) {
      toast.warning("Start date must be after today");
      return;
    }

    if (semesterEndDate <= semesterStartDate) {
      toast.warning("End date must be later than start date");
      return;
    }

    setCreatingSemester(true);
    try {
      await createInstitutionSemester({
        name: semesterName.trim(),
        startDate: new Date(semesterStartDate).toISOString(),
        endDate: new Date(semesterEndDate).toISOString(),
      });

      setSemesterName("");
      setSemesterStartDate("");
      setSemesterEndDate("");
      await reloadSemesters();
      toast.success("Semester created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create semester";
      toast.error(message);
    } finally {
      setCreatingSemester(false);
    }
  };

  const onStartEditSemester = (semester: InstitutionSemester) => {
    setEditingSemesterId(semester.id);
    setEditSemesterName(semester.name);
    setEditSemesterStartDate(toInputDateFromISO(semester.startDate));
    setEditSemesterEndDate(toInputDateFromISO(semester.endDate));
  };

  const onCancelEditSemester = () => {
    setEditingSemesterId("");
    setEditSemesterName("");
    setEditSemesterStartDate("");
    setEditSemesterEndDate("");
  };

  const onSaveSemester = async (semesterId: string) => {
    if (editSemesterName.trim().length < 2 || !editSemesterStartDate || !editSemesterEndDate) {
      toast.warning("Provide semester name, start date and end date");
      return;
    }

    if (editSemesterStartDate <= toDateInputValue(new Date())) {
      toast.warning("Start date must be after today");
      return;
    }

    if (editSemesterEndDate <= editSemesterStartDate) {
      toast.warning("End date must be later than start date");
      return;
    }

    setSavingSemesterId(semesterId);
    try {
      await updateInstitutionSemester(semesterId, {
        name: editSemesterName.trim(),
        startDate: new Date(editSemesterStartDate).toISOString(),
        endDate: new Date(editSemesterEndDate).toISOString(),
      });

      onCancelEditSemester();
      await reloadSemesters();
      toast.success("Semester updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update semester";
      toast.error(message);
    } finally {
      setSavingSemesterId("");
    }
  };

  const onDeleteSemester = async (semesterId: string) => {
    setDeletingSemesterId(semesterId);
    try {
      await deleteInstitutionSemester(semesterId);
      if (editingSemesterId === semesterId) {
        onCancelEditSemester();
      }
      await reloadSemesters();
      toast.success("Semester deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete semester";
      toast.error(message);
    } finally {
      setDeletingSemesterId("");
    }
  };

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
      { key: "posts", label: "Posts", icon: Megaphone, enabled: true },
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
                  <p className="mt-1 font-semibold">{formatDateDDMMYYYY(latest.createdAt)}</p>
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
            <article className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-4">
              <h3 className="text-base font-semibold">Semester Management</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create and review institution-level semesters.
              </p>

              <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={onCreateSemester}>
                <label className="block space-y-1 text-sm">
                  <span className="font-medium">Semester Name</span>
                  <input
                    value={semesterName}
                    onChange={(event) => setSemesterName(event.target.value)}
                    placeholder="Semester name"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>

                <label className="block space-y-1 text-sm">
                  <span className="font-medium">Start Date</span>
                  <input
                    type="date"
                    value={semesterStartDate}
                    onChange={(event) => setSemesterStartDate(event.target.value)}
                    min={minStartDate}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>

                <label className="block space-y-1 text-sm">
                  <span className="font-medium">End Date</span>
                  <input
                    type="date"
                    value={semesterEndDate}
                    onChange={(event) => setSemesterEndDate(event.target.value)}
                    min={minEndDate}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>

                <button
                  type="submit"
                  disabled={creatingSemester || !canCreateSemester}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 md:mt-6"
                >
                  {creatingSemester ? "Creating..." : "Create Semester"}
                </button>
              </form>

              {loadingSemesters ? (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading semesters...
                </div>
              ) : null}

              <div className="space-y-2">
                {semesters.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-sm"
                  >
                    {editingSemesterId === item.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <input
                            value={editSemesterName}
                            onChange={(event) => setEditSemesterName(event.target.value)}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          />
                          <input
                            type="date"
                            value={editSemesterStartDate}
                            onChange={(event) => setEditSemesterStartDate(event.target.value)}
                            min={minEditStartDate}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          />
                          <input
                            type="date"
                            value={editSemesterEndDate}
                            onChange={(event) => setEditSemesterEndDate(event.target.value)}
                            min={minEditEndDate}
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void onSaveSemester(item.id)}
                            disabled={savingSemesterId === item.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                          >
                            <Check className="h-3.5 w-3.5" />
                            {savingSemesterId === item.id ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={onCancelEditSemester}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground">
                            {formatDateDDMMYYYY(item.startDate)} - {formatDateDDMMYYYY(item.endDate)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onStartEditSemester(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDeleteSemester(item.id)}
                            disabled={deletingSemesterId === item.id}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingSemesterId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {!loadingSemesters && semesters.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No semesters created yet.</p>
                ) : null}
              </div>
            </article>
          )}

          {activeSection === "faculty" && renderAccountSection("FACULTY")}

          {activeSection === "departments" && renderAccountSection("DEPARTMENT")}

          {activeSection === "posts" && (
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <h3 className="text-base font-semibold">Posting Management</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create teacher job and student admission posts for public listing.
              </p>
              <div className="mt-4">
                <PostingManagementPanel scope="INSTITUTION" />
              </div>
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
  );
}
