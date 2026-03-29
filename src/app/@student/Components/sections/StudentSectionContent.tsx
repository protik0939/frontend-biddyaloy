"use client";

import { Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ImagebbUploader from "@/Components/ui/ImagebbUploader";
import SearchableSelect from "@/Components/ui/SearchableSelect";

import {
  ApiRequestError,
  type StudentClassworkType,
  type StudentFeeOverview,
  type StudentPortalProfileResponse,
  type StudentRegisteredCourse,
  type StudentResultResponse,
  type StudentSubmission,
  type StudentTimelineItem,
  StudentPortalService,
} from "@/services/Student/studentPortal.service";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

import { classworkTypeLabel, type StudentSection } from "./studentSections";

interface StudentSectionContentProps {
  section: StudentSection;
}

type StudentFeePaymentFieldErrors = {
  semesterId?: string;
  paymentMode?: string;
  monthsCount?: string;
  form?: string;
};

const SUBMISSION_TYPES = new Set<StudentClassworkType>(["TASK", "ASSIGNMENT", "QUIZ"]);

const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const formatSemester = (item: { name: string; startDate: string; endDate: string }) => {
  const start = new Date(item.startDate);
  const end = new Date(item.endDate);
  return `${item.name} (${start.toLocaleDateString("en-US", { month: "short", year: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", year: "numeric" })})`;
};

const formatAmount = (value: number, currency = "BDT") =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

export default function StudentSectionContent({ section }: Readonly<StudentSectionContentProps>) {
  const [loadingPageData, setLoadingPageData] = useState(false);

  const [profileState, setProfileState] = useState<StudentPortalProfileResponse | null>(null);
  const [timelineItems, setTimelineItems] = useState<StudentTimelineItem[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<StudentRegisteredCourse[]>([]);
  const [resultState, setResultState] = useState<StudentResultResponse | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [feeStatus, setFeeStatus] = useState<StudentFeeOverview | null>(null);

  const [timelineSemesterId, setTimelineSemesterId] = useState("");
  const [timelineType, setTimelineType] = useState<"ALL" | StudentClassworkType>("ALL");
  const [timelineSearch, setTimelineSearch] = useState("");
  const [coursesSemesterId, setCoursesSemesterId] = useState("");
  const [coursesSearch, setCoursesSearch] = useState("");
  const [resultsSemesterId, setResultsSemesterId] = useState("");
  const [submissionsSemesterId, setSubmissionsSemesterId] = useState("");
  const [submissionsSearch, setSubmissionsSearch] = useState("");

  const debouncedTimelineSearch = useDebouncedValue(timelineSearch, 1000);
  const debouncedCoursesSearch = useDebouncedValue(coursesSearch, 1000);
  const debouncedSubmissionsSearch = useDebouncedValue(submissionsSearch, 1000);

  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [submissionClassworkId, setSubmissionClassworkId] = useState("");
  const [submissionResponseText, setSubmissionResponseText] = useState("");
  const [submissionAttachmentUrl, setSubmissionAttachmentUrl] = useState("");
  const [submissionAttachmentName, setSubmissionAttachmentName] = useState("");
  const [creatingSubmission, setCreatingSubmission] = useState(false);

  const [editingSubmissionId, setEditingSubmissionId] = useState("");
  const [editingResponseText, setEditingResponseText] = useState("");
  const [editingAttachmentUrl, setEditingAttachmentUrl] = useState("");
  const [editingAttachmentName, setEditingAttachmentName] = useState("");
  const [savingSubmissionId, setSavingSubmissionId] = useState("");
  const [deletingSubmissionId, setDeletingSubmissionId] = useState("");

  const [selectedFeeSemesterId, setSelectedFeeSemesterId] = useState("");
  const [feePaymentMode, setFeePaymentMode] = useState<"MONTHLY" | "FULL">("MONTHLY");
  const [monthsCount, setMonthsCount] = useState("1");
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [feePaymentErrors, setFeePaymentErrors] = useState<StudentFeePaymentFieldErrors>({});

  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileContactNo, setProfileContactNo] = useState("");
  const [profilePresentAddress, setProfilePresentAddress] = useState("");
  const [profilePermanentAddress, setProfilePermanentAddress] = useState("");
  const [profileBloodGroup, setProfileBloodGroup] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const syncProfileInputs = useCallback((profile: StudentPortalProfileResponse) => {
    setProfileName(profile.user.name ?? "");
    setProfileImage(profile.user.image ?? "");
    setProfileBio(profile.profile?.bio ?? "");
    setProfileContactNo(profile.user.contactNo ?? "");
    setProfilePresentAddress(profile.user.presentAddress ?? "");
    setProfilePermanentAddress(profile.user.permanentAddress ?? "");
    setProfileBloodGroup(profile.user.bloodGroup ?? "");
    setProfileGender(profile.user.gender ?? "");
  }, []);

  const loadTimeline = useCallback(async () => {
    setLoadingTimeline(true);
    try {
      const data = await StudentPortalService.listTimeline({
        semesterId: timelineSemesterId || undefined,
        type: timelineType === "ALL" ? undefined : timelineType,
        search: debouncedTimelineSearch || undefined,
      });
      setTimelineItems(data);

      if (!submissionClassworkId && data[0]) {
        const eligible = data.find((item) => SUBMISSION_TYPES.has(item.type));
        if (eligible) {
          setSubmissionClassworkId(eligible.id);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load timeline";
      toast.error(message);
      setTimelineItems([]);
    } finally {
      setLoadingTimeline(false);
    }
  }, [debouncedTimelineSearch, submissionClassworkId, timelineSemesterId, timelineType]);

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      const data = await StudentPortalService.listRegisteredCourses({
        semesterId: coursesSemesterId || undefined,
        search: debouncedCoursesSearch || undefined,
      });
      setRegisteredCourses(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load registered courses";
      toast.error(message);
      setRegisteredCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [coursesSemesterId, debouncedCoursesSearch]);

  const loadResults = useCallback(async () => {
    if (!resultsSemesterId) {
      setResultState(null);
      return;
    }

    setLoadingResults(true);
    try {
      const data = await StudentPortalService.listResults({ semesterId: resultsSemesterId });
      setResultState(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load results";
      toast.error(message);
      setResultState(null);
    } finally {
      setLoadingResults(false);
    }
  }, [resultsSemesterId]);

  const loadSubmissions = useCallback(async () => {
    setLoadingSubmissions(true);
    try {
      const data = await StudentPortalService.listSubmissions({
        semesterId: submissionsSemesterId || undefined,
        search: debouncedSubmissionsSearch || undefined,
      });
      setSubmissions(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load submissions";
      toast.error(message);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [debouncedSubmissionsSearch, submissionsSemesterId]);

  const loadFeeStatus = useCallback(async () => {
    try {
      const data = await StudentPortalService.getFeeStatus();
      setFeeStatus(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load fee status";
      toast.error(message);
      setFeeStatus(null);
    }
  }, []);

  useEffect(() => {
    if (section !== "fees" || globalThis.window === undefined) {
      return;
    }

    const params = new URLSearchParams(globalThis.window.location.search);
    const paymentStatus = params.get("paymentStatus");

    if (!paymentStatus) {
      return;
    }

    if (paymentStatus === "success") {
      toast.success("Payment completed successfully");
    } else if (paymentStatus === "failed") {
      toast.error("Payment failed. Please try again.");
    } else if (paymentStatus === "cancelled") {
      toast.warning("Payment was cancelled");
    }

    params.delete("paymentStatus");
    params.delete("tranId");

    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${globalThis.window.location.pathname}?${nextQuery}`
      : globalThis.window.location.pathname;
    globalThis.window.history.replaceState({}, "", nextUrl);

    void loadFeeStatus();
  }, [loadFeeStatus, section]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      setLoadingPageData(true);
      try {
        const [profile, timeline, courses, submissionRows, fee] = await Promise.all([
          StudentPortalService.getProfileOverview(),
          StudentPortalService.listTimeline(),
          StudentPortalService.listRegisteredCourses(),
          StudentPortalService.listSubmissions(),
          StudentPortalService.getFeeStatus(),
        ]);

        if (cancelled) {
          return;
        }

        setProfileState(profile);
        syncProfileInputs(profile);

        setTimelineItems(timeline);
        setRegisteredCourses(courses);
        setSubmissions(submissionRows);
        setFeeStatus(fee);

        const semesterId = courses[0]?.semester.id ?? "";
        if (!resultsSemesterId) {
          setResultsSemesterId(semesterId);
        }

        const eligible = timeline.find((item) => SUBMISSION_TYPES.has(item.type));
        if (!submissionClassworkId && eligible) {
          setSubmissionClassworkId(eligible.id);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to load student dashboard";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoadingPageData(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [resultsSemesterId, submissionClassworkId, syncProfileInputs]);

  useEffect(() => {
    if (section === "overview") {
      void loadTimeline();
      return;
    }

    if (section === "registeredCourses") {
      void loadCourses();
      return;
    }

    if (section === "results") {
      void loadResults();
      return;
    }

    if (section === "submissions") {
      void loadTimeline();
      void loadSubmissions();
      return;
    }

    if (section === "fees") {
      void loadFeeStatus();
    }
  }, [
    loadCourses,
    loadFeeStatus,
    loadResults,
    loadSubmissions,
    loadTimeline,
    section,
  ]);

  const semesterOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; startDate: string; endDate: string }>();

    for (const row of registeredCourses) {
      map.set(row.semester.id, row.semester);
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
  }, [registeredCourses]);

  const submissionClassworkOptions = useMemo(
    () => timelineItems.filter((item) => SUBMISSION_TYPES.has(item.type)),
    [timelineItems],
  );

  const overviewStats = useMemo(
    () => [
      {
        label: "Registered Courses",
        value: profileState?.stats.totalRegisteredCourses ?? 0,
      },
      {
        label: "Upcoming Timeline",
        value: profileState?.stats.pendingTimelineItems ?? 0,
      },
      {
        label: "Submissions",
        value: submissions.length,
      },
    ],
    [profileState?.stats.pendingTimelineItems, profileState?.stats.totalRegisteredCourses, submissions.length],
  );

  const upcomingTimeline = useMemo(() => {
    return [...timelineItems]
      .filter((item) => item.dueAt)
      .sort((a, b) => new Date(a.dueAt ?? 0).getTime() - new Date(b.dueAt ?? 0).getTime())
      .slice(0, 6);
  }, [timelineItems]);

  const canCreateSubmission =
    submissionClassworkId.trim().length > 0 &&
    (submissionResponseText.trim().length > 0 || submissionAttachmentUrl.trim().length > 0);

  const feeItemOptions = useMemo(
    () =>
      (feeStatus?.feeItems ?? []).map((item) => ({
        value: item.semester.id,
        label: `${item.semester.name} (${formatAmount(item.dueAmount, item.currency)} due)`,
      })),
    [feeStatus?.feeItems],
  );

  const selectedFeeItem = useMemo(
    () => feeStatus?.feeItems.find((item) => item.semester.id === selectedFeeSemesterId) ?? null,
    [feeStatus?.feeItems, selectedFeeSemesterId],
  );

  useEffect(() => {
    if (!selectedFeeSemesterId && feeStatus?.feeItems[0]) {
      setSelectedFeeSemesterId(feeStatus.feeItems[0].semester.id);
    }
  }, [feeStatus?.feeItems, selectedFeeSemesterId]);

  const canInitiatePayment =
    Boolean(selectedFeeItem) &&
    selectedFeeItem.dueAmount > 0 &&
    (feePaymentMode === "FULL" || Number(monthsCount) > 0);

  const handleInitiateFeePayment = async () => {
    setFeePaymentErrors({});

    if (!selectedFeeItem) {
      setFeePaymentErrors({ semesterId: "Select a semester/session fee first" });
      return;
    }

    if (feePaymentMode === "MONTHLY" && Number(monthsCount) < 1) {
      setFeePaymentErrors({ monthsCount: "Months count must be at least 1" });
      return;
    }

    setInitiatingPayment(true);
    try {
      const response = await StudentPortalService.initiateFeePayment({
        semesterId: selectedFeeItem.semester.id,
        paymentMode: feePaymentMode,
        monthsCount: feePaymentMode === "MONTHLY" ? Number(monthsCount) : undefined,
      });

      globalThis.window.location.href = response.paymentUrl;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        const fieldErrors: StudentFeePaymentFieldErrors = {};

        for (const issue of error.fieldErrors) {
          if (issue.path === "body.semesterId") {
            fieldErrors.semesterId = issue.message;
          } else if (issue.path === "body.paymentMode") {
            fieldErrors.paymentMode = issue.message;
          } else if (issue.path === "body.monthsCount") {
            fieldErrors.monthsCount = issue.message;
          }
        }

        if (!fieldErrors.semesterId && !fieldErrors.paymentMode && !fieldErrors.monthsCount) {
          fieldErrors.form = error.message;
        }

        setFeePaymentErrors(fieldErrors);
      }

      const message = error instanceof Error ? error.message : "Failed to initiate fee payment";
      toast.error(message);
    } finally {
      setInitiatingPayment(false);
    }
  };

  const handleCreateSubmission = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateSubmission) {
      toast.warning("Please select a classwork and provide response text or attachment URL");
      return;
    }

    setCreatingSubmission(true);
    try {
      await StudentPortalService.createSubmission({
        classworkId: submissionClassworkId,
        responseText: submissionResponseText || undefined,
        attachmentUrl: submissionAttachmentUrl || undefined,
        attachmentName: submissionAttachmentName || undefined,
      });

      toast.success("Submission created successfully");
      setSubmissionResponseText("");
      setSubmissionAttachmentUrl("");
      setSubmissionAttachmentName("");
      await loadSubmissions();
      await loadTimeline();
      if (resultsSemesterId) {
        await loadResults();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create submission";
      toast.error(message);
    } finally {
      setCreatingSubmission(false);
    }
  };

  const startEditSubmission = (item: StudentSubmission) => {
    setEditingSubmissionId(item.id);
    setEditingResponseText(item.responseText ?? "");
    setEditingAttachmentUrl(item.attachmentUrl ?? "");
    setEditingAttachmentName(item.attachmentName ?? "");
  };

  const handleUpdateSubmission = async (submissionId: string) => {
    if (editingResponseText.trim().length === 0 && editingAttachmentUrl.trim().length === 0) {
      toast.warning("Provide response text or attachment URL");
      return;
    }

    setSavingSubmissionId(submissionId);
    try {
      await StudentPortalService.updateSubmission(submissionId, {
        responseText: editingResponseText || undefined,
        attachmentUrl: editingAttachmentUrl || undefined,
        attachmentName: editingAttachmentName || undefined,
      });
      toast.success("Submission updated successfully");
      setEditingSubmissionId("");
      await loadSubmissions();
      await loadTimeline();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update submission";
      toast.error(message);
    } finally {
      setSavingSubmissionId("");
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    setDeletingSubmissionId(submissionId);
    try {
      await StudentPortalService.deleteSubmission(submissionId);
      toast.success("Submission deleted successfully");
      if (editingSubmissionId === submissionId) {
        setEditingSubmissionId("");
      }
      await loadSubmissions();
      await loadTimeline();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete submission";
      toast.error(message);
    } finally {
      setDeletingSubmissionId("");
    }
  };

  const handleSaveProfile = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSavingProfile(true);
    try {
      const data = await StudentPortalService.updateProfile({
        name: profileName || undefined,
        image: profileImage || undefined,
        bio: profileBio || undefined,
        contactNo: profileContactNo || undefined,
        presentAddress: profilePresentAddress || undefined,
        permanentAddress: profilePermanentAddress || undefined,
        bloodGroup: profileBloodGroup || undefined,
        gender: profileGender || undefined,
      });

      setProfileState(data);
      syncProfileInputs(data);
      toast.success("Profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loadingPageData) {
    return (
      <section className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading student portal...
        </div>
      </section>
    );
  }

  if (section === "overview") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {overviewStats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold">{item.value}</p>
            </article>
          ))}
        </div>

        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold sm:text-lg">Academic Timeline</h2>
            <div className="flex flex-wrap items-center gap-2">
              <SearchableSelect
                value={timelineSemesterId}
                onChange={setTimelineSemesterId}
                options={[
                  { value: "", label: "All semesters" },
                  ...semesterOptions.map((item) => ({ value: item.id, label: formatSemester(item) })),
                ]}
                placeholder="All semesters"
                searchPlaceholder="Search semester..."
                emptyText="No semester found"
                searchValue={timelineSearch}
                onSearchValueChange={setTimelineSearch}
                className="min-w-55"
              />
              <SearchableSelect
                value={timelineType}
                onChange={(nextValue) => setTimelineType(nextValue as "ALL" | StudentClassworkType)}
                options={[
                  { value: "ALL", label: "All types" },
                  { value: "TASK", label: "Task" },
                  { value: "ASSIGNMENT", label: "Assignment" },
                  { value: "QUIZ", label: "Quiz" },
                  { value: "NOTICE", label: "Notice" },
                ]}
                placeholder="All types"
                searchPlaceholder="Search type..."
                emptyText="No type found"
                className="min-w-45"
              />
            </div>
          </div>

          {loadingTimeline ? (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading timeline...
            </div>
          ) : upcomingTimeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming timeline items found.</p>
          ) : (
            <div className="space-y-3">
              {upcomingTimeline.map((item) => (
                <article key={item.id} className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {classworkTypeLabel[item.type] ?? item.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.section.name} • {item.courses.map((course) => course.courseCode).join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Due: {item.dueAt ? formatDateTime(item.dueAt) : "No deadline"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </article>
      </div>
    );
  }

  if (section === "registeredCourses") {
    return (
      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold sm:text-lg">Registered Courses</h2>
          <div className="flex flex-wrap items-center gap-2">
            <SearchableSelect
              value={coursesSemesterId}
              onChange={setCoursesSemesterId}
              options={[
                { value: "", label: "All semesters" },
                ...semesterOptions.map((item) => ({ value: item.id, label: formatSemester(item) })),
              ]}
              placeholder="All semesters"
              searchPlaceholder="Search semester/course..."
              emptyText="No semester found"
              searchValue={coursesSearch}
              onSearchValueChange={setCoursesSearch}
              className="min-w-60"
            />
          </div>
        </div>

        {loadingCourses ? (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading courses...
          </div>
        ) : registeredCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No course registration found.</p>
        ) : (
          <div className="space-y-3">
            {registeredCourses.map((item) => (
              <article key={item.id} className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {item.course.courseCode} • {item.course.courseTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Semester: {item.semester.name} • Section: {item.section.name}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                    {item.course.credits ?? 0} credits
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Teacher: {item.teacherProfile.user.name} ({item.teacherProfile.teacherInitial})
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Registered on {formatDate(item.registrationDate)}</p>
              </article>
            ))}
          </div>
        )}
      </article>
    );
  }

  if (section === "results") {
    return (
      <div className="space-y-4">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold sm:text-lg">Semester Results & Attendance</h2>
            <SearchableSelect
              value={resultsSemesterId}
              onChange={setResultsSemesterId}
              options={[
                { value: "", label: "Select semester" },
                ...semesterOptions.map((item) => ({ value: item.id, label: formatSemester(item) })),
              ]}
              placeholder="Select semester"
              searchPlaceholder="Search semester..."
              emptyText="No semester found"
              className="min-w-60"
            />
          </div>

          {loadingResults ? (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading results...
            </div>
          ) : !resultsSemesterId ? (
            <p className="mt-4 text-sm text-muted-foreground">Select a semester to view results.</p>
          ) : !resultState || resultState.items.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No results found for the selected semester.</p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <article className="rounded-xl border border-border/70 bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">Total Courses</p>
                  <p className="text-xl font-semibold">{resultState.summary.totalCourses}</p>
                </article>
                <article className="rounded-xl border border-border/70 bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">Average Attendance</p>
                  <p className="text-xl font-semibold">{resultState.summary.averageAttendancePercentage}%</p>
                </article>
                <article className="rounded-xl border border-border/70 bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">Average Result</p>
                  <p className="text-xl font-semibold">{resultState.summary.averageResult}/100</p>
                </article>
              </div>

              <div className="mt-4 space-y-3">
                {resultState.items.map((item) => (
                  <article key={item.courseRegistrationId} className="rounded-xl border border-border/70 bg-background/60 p-4">
                    <p className="text-sm font-semibold">
                      {item.course.courseCode} • {item.course.courseTitle}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Teacher: {item.teacher.user.name} ({item.teacher.teacherInitial})
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                        <p className="text-xs text-muted-foreground">Attendance</p>
                        <p className="text-sm font-semibold">
                          {item.attendance.percentage}% ({item.attendance.presentClasses}/{item.attendance.totalClasses})
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                        <p className="text-xs text-muted-foreground">Total Mark</p>
                        <p className="text-sm font-semibold">{item.totalMark}/{item.maxTotal}</p>
                      </div>
                      <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-sm font-semibold">{item.totalMark >= 40 ? "Pass" : "Needs Improvement"}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </article>
      </div>
    );
  }

  if (section === "submissions") {
    return (
      <div className="space-y-4">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">Submit Assignment / Task / Quiz</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your response text and optional attachment URL for classworks.
          </p>

          <form className="mt-4 grid gap-3" onSubmit={handleCreateSubmission}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SearchableSelect
                value={submissionsSemesterId}
                onChange={setSubmissionsSemesterId}
                options={[
                  { value: "", label: "All semesters" },
                  ...semesterOptions.map((item) => ({ value: item.id, label: formatSemester(item) })),
                ]}
                placeholder="All semesters"
                searchPlaceholder="Search semester..."
                emptyText="No semester found"
                className="text-sm"
              />

              <SearchableSelect
                value={submissionClassworkId}
                onChange={setSubmissionClassworkId}
                options={[
                  { value: "", label: "Select classwork" },
                  ...submissionClassworkOptions.map((item) => ({
                    value: item.id,
                    label: `${classworkTypeLabel[item.type]} • ${item.title} (${item.section.name})`,
                  })),
                ]}
                placeholder="Select classwork"
                searchPlaceholder="Search classwork..."
                emptyText="No classwork found"
                searchValue={submissionsSearch}
                onSearchValueChange={setSubmissionsSearch}
                className="md:col-span-2 text-sm"
              />
            </div>

            <textarea
              value={submissionResponseText}
              onChange={(event) => setSubmissionResponseText(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Write your answer or summary"
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={submissionAttachmentUrl}
                onChange={(event) => setSubmissionAttachmentUrl(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Attachment URL (optional)"
              />
              <input
                value={submissionAttachmentName}
                onChange={(event) => setSubmissionAttachmentName(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Attachment Name (optional)"
              />
            </div>

            <div className="text-xs text-muted-foreground">
              Requirement: provide response text or a valid attachment URL.
            </div>

            <button
              type="submit"
              disabled={creatingSubmission || !canCreateSubmission}
              className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingSubmission ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create Submission
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">My Submissions</h2>

          {loadingSubmissions ? (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No submission found yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {submissions.map((item) => {
                const isEditing = editingSubmissionId === item.id;

                return (
                  <article key={item.id} className="rounded-xl border border-border/70 bg-background/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          {classworkTypeLabel[item.classwork.type]} • {item.classwork.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.classwork.section.name} • {item.classwork.section.semester.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Submitted: {formatDateTime(item.submittedAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isEditing ? (
                          <button
                            type="button"
                            onClick={() => startEditSubmission(item)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setEditingSubmissionId("")}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => void handleDeleteSubmission(item.id)}
                          disabled={deletingSubmissionId === item.id}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingSubmissionId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                          Delete
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-3 grid gap-3">
                        <textarea
                          value={editingResponseText}
                          onChange={(event) => setEditingResponseText(event.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                          placeholder="Update response text"
                        />
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <input
                            value={editingAttachmentUrl}
                            onChange={(event) => setEditingAttachmentUrl(event.target.value)}
                            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            placeholder="Attachment URL"
                          />
                          <input
                            value={editingAttachmentName}
                            onChange={(event) => setEditingAttachmentName(event.target.value)}
                            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                            placeholder="Attachment Name"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleUpdateSubmission(item.id)}
                          disabled={savingSubmissionId === item.id}
                          className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingSubmissionId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save Changes
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2 text-sm">
                        <p className="text-muted-foreground">{item.responseText ?? "No text response"}</p>
                        {item.attachmentUrl ? (
                          <a
                            href={item.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-xs font-medium text-primary hover:underline"
                          >
                            {item.attachmentName || "View attachment"}
                          </a>
                        ) : null}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </div>
    );
  }

  if (section === "fees") {
    return (
      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-base font-semibold sm:text-lg">Fee Payment</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pay semester/session fees securely via SSLCommerz. You can pay monthly installments or full due.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs text-muted-foreground">Overall Summary</p>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                Configured:{" "}
                <span className="font-semibold">{formatAmount(feeStatus?.summary.totalConfiguredAmount ?? 0)}</span>
              </p>
              <p>
                Paid:{" "}
                <span className="font-semibold text-emerald-600">{formatAmount(feeStatus?.summary.totalPaidAmount ?? 0)}</span>
              </p>
              <p>
                Due:{" "}
                <span className="font-semibold text-amber-600">{formatAmount(feeStatus?.summary.totalDueAmount ?? 0)}</span>
              </p>
            </div>
          </article>

          <article className="rounded-xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs text-muted-foreground">Create Payment</p>
            <div className="mt-2 space-y-3">
              {feePaymentErrors.form ? (
                <p className="text-sm text-destructive">{feePaymentErrors.form}</p>
              ) : null}
              <SearchableSelect
                value={selectedFeeSemesterId}
                onChange={(value) => {
                  setSelectedFeeSemesterId(value);
                  setFeePaymentErrors((current) => ({ ...current, semesterId: undefined }));
                }}
                options={feeItemOptions}
                placeholder="Select semester/session"
                searchPlaceholder="Search semester..."
                emptyText="No configured fee found"
                className={`text-sm ${feePaymentErrors.semesterId ? "border-destructive" : ""}`}
              />
              {feePaymentErrors.semesterId ? (
                <p className="text-xs text-destructive">{feePaymentErrors.semesterId}</p>
              ) : null}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SearchableSelect
                  value={feePaymentMode}
                  onChange={(value) => {
                    setFeePaymentMode(value as "MONTHLY" | "FULL");
                    setFeePaymentErrors((current) => ({
                      ...current,
                      paymentMode: undefined,
                      monthsCount: undefined,
                    }));
                  }}
                  options={[
                    { value: "MONTHLY", label: "Monthly" },
                    { value: "FULL", label: "Full Due" },
                  ]}
                  placeholder="Select mode"
                  searchPlaceholder="Search mode..."
                  emptyText="No mode found"
                  className={`text-sm ${feePaymentErrors.paymentMode ? "border-destructive" : ""}`}
                />
                <input
                  type="number"
                  min={1}
                  value={monthsCount}
                  onChange={(event) => {
                    setMonthsCount(event.target.value);
                    setFeePaymentErrors((current) => ({ ...current, monthsCount: undefined }));
                  }}
                  disabled={feePaymentMode !== "MONTHLY"}
                  aria-invalid={Boolean(feePaymentErrors.monthsCount)}
                  className={`rounded-xl border bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 ${
                    feePaymentErrors.monthsCount ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Months (1/2/3...)"
                />
                {feePaymentErrors.paymentMode ? (
                  <p className="text-xs text-destructive">{feePaymentErrors.paymentMode}</p>
                ) : null}
                {feePaymentErrors.monthsCount ? (
                  <p className="text-xs text-destructive">{feePaymentErrors.monthsCount}</p>
                ) : null}
              </div>

              {selectedFeeItem ? (
                <div className="rounded-lg border border-border/70 bg-card/80 px-3 py-2 text-xs text-muted-foreground">
                  <p>Total: {formatAmount(selectedFeeItem.totalFeeAmount, selectedFeeItem.currency)}</p>
                  <p>Monthly: {formatAmount(selectedFeeItem.monthlyFeeAmount, selectedFeeItem.currency)}</p>
                  <p>Paid: {formatAmount(selectedFeeItem.paidAmount, selectedFeeItem.currency)}</p>
                  <p className="font-medium text-foreground">
                    Due: {formatAmount(selectedFeeItem.dueAmount, selectedFeeItem.currency)}
                  </p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void handleInitiateFeePayment()}
                disabled={initiatingPayment || !canInitiatePayment}
                className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {initiatingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Pay with SSLCommerz
              </button>
            </div>
          </article>
        </div>

        <article className="mt-4 rounded-xl border border-border/70 bg-background/60 p-4">
          <h3 className="text-sm font-semibold">Payment History</h3>
          {feeStatus?.paymentHistory.length ? (
            <div className="mt-3 space-y-2">
              {feeStatus.paymentHistory.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/70 bg-background px-3 py-2 text-sm">
                  <p className="font-medium">{item.semester.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.paymentMode} • {item.monthsCovered} month(s) • {formatAmount(item.amount, item.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tran ID: {item.tranId} • {item.paidAt ? formatDateTime(item.paidAt) : formatDateTime(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No payment history found yet.</p>
          )}
        </article>
      </article>
    );
  }

  if (section === "profile") {
    return (
      <div className="space-y-4">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">Profile Preview</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Student Name</p>
              <p className="font-medium">{profileState?.user.name ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{profileState?.user.email ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Student ID</p>
              <p className="font-medium">{profileState?.profile?.studentsId ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 md:col-span-2">
              <p className="text-xs text-muted-foreground">Institution</p>
              <p className="font-medium">{profileState?.profile?.institution?.name ?? "-"}</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">Edit Profile</h2>

          <form className="mt-4 grid gap-3" onSubmit={handleSaveProfile}>
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

            <textarea
              value={profileBio}
              onChange={(event) => setProfileBio(event.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Short bio"
            />

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
              className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Profile
            </button>
          </form>
        </article>
      </div>
    );
  }

  return null;
}
