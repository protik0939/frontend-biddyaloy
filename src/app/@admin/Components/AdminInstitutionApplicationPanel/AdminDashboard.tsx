import {
  Check,
  Clock3,
  GraduationCap,
  Eye,
  EyeOff,
  LayoutDashboard,
  Layers3,
  Loader2,
  Megaphone,
  Menu,
  Pencil,
  Save,
  Settings2,
  ShieldCheck,
  Trash2,
  Workflow,
  X,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ImagebbUploader from "@/Components/ui/ImagebbUploader";
import DepartmentSectionContent from "@/app/@department/Components/Sections/DepartmentSectionContent";
import {
  getDepartmentSidebarItems,
  type DepartmentSection,
} from "@/app/@department/Components/Sections/departmentSections";
import {
  createInstitutionSemester,
  deleteInstitutionSemester,
  getInstitutionAdminDashboardSummary,
  getInstitutionSslCommerzCredentialSettings,
  listInstitutionSemesters,
  upsertInstitutionSslCommerzCredentialSettings,
  updateInstitutionAdminProfile,
  updateInstitutionSemester,
} from "@/services/Admin/adminManagement.service";
import type {
  CreateInstitutionSubAdminPayload,
  InstitutionAdminDashboardSummary,
  InstitutionFacultyOption,
  InstitutionSslCommerzCredentialSettings,
  InstitutionSemester,
  InstitutionSubAdminAccountType,
} from "@/services/Admin/adminManagement.service";
import type { InstitutionApplication, InstitutionType } from "@/services/Admin/institutionApplication.service";
import PostingManagementPanel from "@/Components/PostingManagement/PostingManagementPanel";
import NoticeWorkspace from "@/Components/Notice/NoticeWorkspace";
import RoutineBrowser from "@/Components/Routine/RoutineBrowser";
import SidebarProfileCard from "@/Components/SidebarProfileCard";
import ChangePasswordCard from "@/Components/Auth/ChangePasswordCard";
import { NoticeService } from "@/services/Notice/notice.service";
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
  facultySearchTerm: string;
  onFacultySearchChange: (value: string) => void;
}>;

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function AdminDashboard({
  latest,
  approvedInstitutionType,
  onCreateSubAdmin,
  faculties,
  facultiesLoading,
  facultySearchTerm,
  onFacultySearchChange,
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
  const [loadingDashboardSummary, setLoadingDashboardSummary] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState<InstitutionAdminDashboardSummary | null>(
    null,
  );
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileContactNo, setProfileContactNo] = useState("");
  const [profilePresentAddress, setProfilePresentAddress] = useState("");
  const [profilePermanentAddress, setProfilePermanentAddress] = useState("");
  const [profileBloodGroup, setProfileBloodGroup] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [sslCommerzSettings, setSslCommerzSettings] =
    useState<InstitutionSslCommerzCredentialSettings | null>(null);
  const [loadingSslCommerzSettings, setLoadingSslCommerzSettings] = useState(false);
  const [savingSslCommerzSettings, setSavingSslCommerzSettings] = useState(false);
  const [sslStoreId, setSslStoreId] = useState("");
  const [sslStorePassword, setSslStorePassword] = useState("");
  const [sslBaseUrl, setSslBaseUrl] = useState("");
  const [showSslStoreId, setShowSslStoreId] = useState(false);
  const [showSslStorePassword, setShowSslStorePassword] = useState(false);
  const [showSslBaseUrl, setShowSslBaseUrl] = useState(false);
  const [adminAcademicSection, setAdminAcademicSection] = useState<DepartmentSection>("semesters");
  const [unreadNoticeCount, setUnreadNoticeCount] = useState(0);

  const resolvedInstitutionType =
    (dashboardSummary?.institution?.type as InstitutionType | undefined) ?? approvedInstitutionType;
  const isUniversity = resolvedInstitutionType === "UNIVERSITY";

  const mapAcademicTerms = (value: string) => {
    if (isUniversity) {
      return value;
    }

    return value
      .replaceAll("Department", "Program")
      .replaceAll("department", "program")
      .replaceAll("Semester", "Session")
      .replaceAll("semester", "session")
      .replaceAll("Batch", "Class")
      .replaceAll("batch", "class");
  };

  const syncProfileInputs = (summary: InstitutionAdminDashboardSummary) => {
    setProfileName(summary.user?.name ?? "");
    setProfileImage(summary.user?.image ?? "");
    setProfileContactNo(summary.user?.contactNo ?? "");
    setProfilePresentAddress(summary.user?.presentAddress ?? "");
    setProfilePermanentAddress(summary.user?.permanentAddress ?? "");
    setProfileBloodGroup(summary.user?.bloodGroup ?? "");
    setProfileGender(summary.user?.gender ?? "");
  };

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

  const loadUnreadNoticeCount = async () => {
    try {
      const result = await NoticeService.getUnreadCount();
      setUnreadNoticeCount(result.unreadCount);
    } catch {
      // Keep previous count when unread fetch fails.
    }
  };

  useEffect(() => {
    if (activeSection === "workflow") {
      void reloadSemesters();
    }
  }, [activeSection]);

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      setLoadingDashboardSummary(true);
      try {
        const data = await getInstitutionAdminDashboardSummary();
        if (!cancelled) {
          setDashboardSummary(data);
          syncProfileInputs(data);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load dashboard summary";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingDashboardSummary(false);
        }
      }
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadUnreadNoticeCount();
  }, [activeSection]);

  useEffect(() => {
    if (activeSection !== "settings") {
      return;
    }

    let cancelled = false;

    const loadSslCommerzSettings = async () => {
      setLoadingSslCommerzSettings(true);
      try {
        const data = await getInstitutionSslCommerzCredentialSettings();
        if (!cancelled) {
          setSslCommerzSettings(data);
          setSslBaseUrl(data.baseUrl ?? "");
          setSslStoreId("");
          setSslStorePassword("");
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load SSLCommerz settings";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingSslCommerzSettings(false);
        }
      }
    };

    void loadSslCommerzSettings();

    return () => {
      cancelled = true;
    };
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
      toast.success(mapAcademicTerms("Semester created successfully"));
    } catch (error) {
      const message = error instanceof Error ? error.message : mapAcademicTerms("Failed to create semester");
      toast.error(message);
    } finally {
      setCreatingSemester(false);
    }
  };

  const onSaveProfile = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (profileName.trim().length < 2) {
      toast.warning("Name must be at least 2 characters long");
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await updateInstitutionAdminProfile({
        name: profileName.trim() || undefined,
        image: profileImage.trim() || undefined,
        contactNo: profileContactNo.trim() || undefined,
        presentAddress: profilePresentAddress.trim() || undefined,
        permanentAddress: profilePermanentAddress.trim() || undefined,
        bloodGroup: profileBloodGroup.trim() || undefined,
        gender: profileGender.trim() || undefined,
      });

      setDashboardSummary(updated);
      syncProfileInputs(updated);
      toast.success("Profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
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
      toast.success(mapAcademicTerms("Semester updated successfully"));
    } catch (error) {
      const message = error instanceof Error ? error.message : mapAcademicTerms("Failed to update semester");
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
      toast.success(mapAcademicTerms("Semester deleted successfully"));
    } catch (error) {
      const message = error instanceof Error ? error.message : mapAcademicTerms("Failed to delete semester");
      toast.error(message);
    } finally {
      setDeletingSemesterId("");
    }
  };

  const onSaveSslCommerzSettings = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!sslCommerzSettings?.isConfigured && (!sslStoreId.trim() || !sslStorePassword.trim() || !sslBaseUrl.trim())) {
      toast.warning("Store ID, Store Password and Base URL are required for initial setup");
      return;
    }

    if (
      sslCommerzSettings?.isConfigured &&
      !sslStoreId.trim() &&
      !sslStorePassword.trim() &&
      !sslBaseUrl.trim()
    ) {
      toast.warning("Provide at least one field to update");
      return;
    }

    setSavingSslCommerzSettings(true);
    try {
      const updated = await upsertInstitutionSslCommerzCredentialSettings({
        storeId: sslStoreId.trim() || undefined,
        storePassword: sslStorePassword.trim() || undefined,
        baseUrl: sslBaseUrl.trim() || undefined,
      });

      setSslCommerzSettings(updated);
      setSslStoreId("");
      setSslStorePassword("");
      setSslBaseUrl(updated.baseUrl ?? "");
      toast.success("SSLCommerz settings updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update SSLCommerz settings";
      toast.error(message);
    } finally {
      setSavingSslCommerzSettings(false);
    }
  };

  const actionCards = useMemo(
    () => [
      {
        title: "Academic Workflow",
        description: mapAcademicTerms("Set up semesters, sections, and class-flow configurations."),
        icon: Workflow,
        enabled: true,
      },
      {
        title: isUniversity ? "Department Workspace" : "Program Workspace",
        description: mapAcademicTerms(
          "Manage departments, semesters, batches, sections, teachers, students and courses.",
        ),
        icon: Layers3,
        enabled: true,
      },
      {
        title: "Faculty Accounts",
        description: "Create faculty admin accounts and assign access credentials.",
        icon: GraduationCap,
        enabled: isUniversity,
      },
      {
        title: mapAcademicTerms("Department Accounts"),
        description: mapAcademicTerms("Create department admin accounts for your institution."),
        icon: Layers3,
        enabled: isUniversity,
      },
    ],
    [isUniversity],
  );

  const dashboardMenuItems: {
    key: AdminDashboardSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    enabled: boolean;
  }[] = [
      { key: "overview", label: "Overview", icon: LayoutDashboard, enabled: true },
      { key: "profile", label: "Profile", icon: UserCircle2, enabled: true },
      { key: "notices", label: "Notices", icon: Megaphone, enabled: true },
      { key: "routines", label: "Routines", icon: Clock3, enabled: true },
      { key: "workflow", label: mapAcademicTerms("Academic Workflow"), icon: Workflow, enabled: true },
      {
        key: "academic",
        label: isUniversity ? "Department Workspace" : "Program Workspace",
        icon: Layers3,
        enabled: true,
      },
      {
        key: "faculty",
        label: "Faculties",
        icon: GraduationCap,
        enabled: isUniversity,
      },
      {
        key: "departments",
        label: mapAcademicTerms("Departments"),
        icon: Layers3,
        enabled: isUniversity,
      },
      { key: "posts", label: "Posts", icon: Megaphone, enabled: true },
      { key: "settings", label: "Settings", icon: Settings2, enabled: true },
    ];

  const renderAccountSection = (accountType: InstitutionSubAdminAccountType) => {
    const isFaculty = accountType === "FACULTY";

    return (
      <SubAdminAccountForm
        accountType={accountType}
        disabled={!isUniversity}
        title={
          isFaculty ? "Create Faculty Admin Account" : mapAcademicTerms("Create Department Admin Account")
        }
        description={
          isFaculty
            ? "Create faculty admin credentials and set up faculty details in one step."
            : mapAcademicTerms(
                "Create department admin credentials, then create faculty and department in one step.",
              )
        }
        onSubmit={onCreateSubAdmin}
        facultyOptions={faculties}
        facultyOptionsLoading={facultiesLoading}
        facultySearchTerm={facultySearchTerm}
        onFacultySearchChange={onFacultySearchChange}
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
          className={`absolute left-0 top-0 z-30 flex h-auto flex-col border-r border-border/70 bg-card/95 p-3 shadow-md transition-all duration-300 md:static md:translate-x-0 ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"} ${showSidebar ? "w-64" : "w-16"}`}
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

          <nav className="flex-1 space-y-1.5">
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
                  {item.key === "notices" && unreadNoticeCount > 0 ? (
                    <span className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <SidebarProfileCard
            userName={dashboardSummary?.user?.name}
            userImage={dashboardSummary?.user?.image}
            institutionShortName={dashboardSummary?.institution?.shortName}
            institutionLogo={dashboardSummary?.institution?.institutionLogo ?? latest.institutionLogo}
            expanded={showSidebar}
          />
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
                {formatInstitutionType(
                  (dashboardSummary?.institution?.type as InstitutionType | undefined) ??
                    latest.institutionType,
                )}
              </div>
            </div>
          </header>

          {activeSection === "overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs text-muted-foreground">Institution</p>
                  {loadingDashboardSummary ? (
                    <div className="mt-1 h-5 w-36 animate-pulse rounded bg-muted/60" />
                  ) : (
                    <p className="mt-1 font-semibold">
                      {dashboardSummary?.institution?.name ?? latest.institutionName}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="mt-1 inline-flex items-center gap-2 font-semibold text-emerald-600">
                    <ShieldCheck className="h-4 w-4" /> Approved
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs text-muted-foreground">Total Students</p>
                  {loadingDashboardSummary ? (
                    <div className="mt-1 h-5 w-20 animate-pulse rounded bg-muted/60" />
                  ) : (
                    <p className="mt-1 font-semibold">
                      {new Intl.NumberFormat().format(dashboardSummary?.stats.totalStudents ?? 0)}
                    </p>
                  )}
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
                      if (action.title.includes("Workspace")) {
                        setActiveSection("academic");
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

          {activeSection === "profile" && (
            <div className="space-y-4">
              <article className="rounded-xl border border-border/70 bg-background/70 p-4">
                <h3 className="text-base font-semibold">Profile Preview</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{dashboardSummary?.user?.name ?? "-"}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{dashboardSummary?.user?.email ?? "-"}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-card/80 px-3 py-2 md:col-span-2">
                    <p className="text-xs text-muted-foreground">Institution</p>
                    <p className="font-medium">{dashboardSummary?.institution?.name ?? latest.institutionName}</p>
                  </div>
                </div>
              </article>

              <article className="rounded-xl border border-border/70 bg-background/70 p-4">
                <h3 className="text-base font-semibold">Edit Profile</h3>

                <form className="mt-4 grid gap-3" onSubmit={onSaveProfile}>
                  <ImagebbUploader
                    label="Profile Image"
                    helperText="Square crop (1:1). Optimized around 100KB before upload."
                    value={profileImage}
                    cropRatio={1}
                    compressionSizeKB={100}
                    onChange={(url) => setProfileImage(url)}
                  />

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Full name"
                    />
                    <input
                      value={profileContactNo}
                      onChange={(event) => setProfileContactNo(event.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Contact number"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      value={profilePresentAddress}
                      onChange={(event) => setProfilePresentAddress(event.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Present address"
                    />
                    <input
                      value={profilePermanentAddress}
                      onChange={(event) => setProfilePermanentAddress(event.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Permanent address"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <input
                      value={profileBloodGroup}
                      onChange={(event) => setProfileBloodGroup(event.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Blood group"
                    />
                    <input
                      value={profileGender}
                      onChange={(event) => setProfileGender(event.target.value)}
                      className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                      placeholder="Gender"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Profile
                  </button>
                </form>
              </article>

              <ChangePasswordCard />
            </div>
          )}

          {activeSection === "notices" && (
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <NoticeWorkspace
                canCompose
                isUniversity={isUniversity}
                onUnreadCountChange={setUnreadNoticeCount}
              />
            </div>
          )}

          {activeSection === "routines" && (
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <RoutineBrowser />
            </div>
          )}

          {activeSection === "workflow" && (
            <article className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-4">
              <h3 className="text-base font-semibold">{mapAcademicTerms("Semester Management")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {mapAcademicTerms("Create and review institution-level semesters.")}
              </p>

              <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={onCreateSemester}>
                <label className="block space-y-1 text-sm">
                  <span className="font-medium">{mapAcademicTerms("Semester Name")}</span>
                  <input
                    value={semesterName}
                    onChange={(event) => setSemesterName(event.target.value)}
                    placeholder={mapAcademicTerms("Semester name")}
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
                  {creatingSemester ? "Creating..." : mapAcademicTerms("Create Semester")}
                </button>
              </form>

              {loadingSemesters ? (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mapAcademicTerms("Loading semesters...")}
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
                  <p className="text-sm text-muted-foreground">{mapAcademicTerms("No semesters created yet.")}</p>
                ) : null}
              </div>
            </article>
          )}

          {activeSection === "academic" && (
            <div className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-4">
              <h3 className="text-base font-semibold">
                {isUniversity ? "Department Workspace" : "Program Workspace"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {mapAcademicTerms(
                  "Use one place to manage departments, semesters, batches, sections, courses, teachers, students and applications.",
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {getDepartmentSidebarItems(isUniversity)
                  .filter((item) => item.section !== "overview" && item.section !== "profile")
                  .map((item) => (
                    <button
                      key={item.section}
                      type="button"
                      onClick={() => setAdminAcademicSection(item.section)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                        adminAcademicSection === item.section
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
              <DepartmentSectionContent section={adminAcademicSection} isUniversity={isUniversity} />
            </div>
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
            <div className="space-y-4 rounded-xl border border-border/70 bg-background/70 p-4">
              <h3 className="text-base font-semibold">Admin Settings</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure institution profile preferences and admin-level dashboard settings.
              </p>

              <article className="rounded-xl border border-border/70 bg-card/80 p-4">
                <h4 className="text-sm font-semibold">Institution SSLCommerz Credentials</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  These credentials are stored securely (encrypted + hashed) and used for student fee payments into your institution account.
                </p>

                {loadingSslCommerzSettings ? (
                  <p className="mt-3 text-sm text-muted-foreground">Loading SSLCommerz settings...</p>
                ) : (
                  <form className="mt-4 space-y-3" onSubmit={onSaveSslCommerzSettings}>
                    <label className="block space-y-1 text-sm">
                      <span className="font-medium">SSLCOMMERZ_STORE_ID</span>
                      <div className="flex items-center gap-2">
                        <input
                          type={showSslStoreId ? "text" : "password"}
                          value={sslStoreId}
                          onChange={(event) => setSslStoreId(event.target.value)}
                          placeholder={sslCommerzSettings?.storeIdMasked ?? "Enter store id"}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSslStoreId((prev) => !prev)}
                          className="inline-flex rounded-lg border border-border bg-background p-2 text-muted-foreground hover:text-foreground"
                          aria-label="Toggle store id visibility"
                        >
                          {showSslStoreId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </label>

                    <label className="block space-y-1 text-sm">
                      <span className="font-medium">SSLCOMMERZ_STORE_PASSWORD</span>
                      <div className="flex items-center gap-2">
                        <input
                          type={showSslStorePassword ? "text" : "password"}
                          value={sslStorePassword}
                          onChange={(event) => setSslStorePassword(event.target.value)}
                          placeholder={sslCommerzSettings?.hasStorePassword ? "********" : "Enter store password"}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSslStorePassword((prev) => !prev)}
                          className="inline-flex rounded-lg border border-border bg-background p-2 text-muted-foreground hover:text-foreground"
                          aria-label="Toggle store password visibility"
                        >
                          {showSslStorePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </label>

                    <label className="block space-y-1 text-sm">
                      <span className="font-medium">SSLCOMMERZ_BASE_URL</span>
                      <div className="flex items-center gap-2">
                        <input
                          type={showSslBaseUrl ? "text" : "password"}
                          value={sslBaseUrl}
                          onChange={(event) => setSslBaseUrl(event.target.value)}
                          placeholder="https://sandbox.sslcommerz.com"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSslBaseUrl((prev) => !prev)}
                          className="inline-flex rounded-lg border border-border bg-background p-2 text-muted-foreground hover:text-foreground"
                          aria-label="Toggle base url visibility"
                        >
                          {showSslBaseUrl ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </label>

                    <button
                      type="submit"
                      disabled={savingSslCommerzSettings}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingSslCommerzSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save SSLCommerz Credentials
                    </button>
                  </form>
                )}
              </article>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
