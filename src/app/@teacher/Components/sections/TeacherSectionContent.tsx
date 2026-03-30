"use client";

import { Loader2, Trash2, Pencil, Save, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import NoticeWorkspace from "@/Components/Notice/NoticeWorkspace";
import RoutineBrowser from "@/Components/Routine/RoutineBrowser";
import ChangePasswordCard from "@/Components/Auth/ChangePasswordCard";
import ImagebbUploader from "@/Components/ui/ImagebbUploader";
import SearchableSelect from "@/Components/ui/SearchableSelect";

import {
  type AttendanceStatus,
  type TeacherAcademicRecord,
  type TeacherApplicationProfile,
  type TeacherMarkUpsertPayload,
  type TeacherPortalProfileResponse,
  type TeacherProfileUpdatePayload,
  type TeacherAssignedSection,
  type TeacherAttendanceResponse,
  type TeacherClasswork,
  type TeacherClassworkType,
  type TeacherExperienceRecord,
  type TeacherSectionMarkRow,
  TeacherPortalService,
} from "@/services/Teacher/teacherPortal.service";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

import { classworkTypeLabel, type TeacherSection } from "./teacherSections";

interface TeacherSectionContentProps {
  section: TeacherSection;
}

const CLASSWORK_TYPES: TeacherClassworkType[] = ["TASK", "ASSIGNMENT", "QUIZ", "NOTICE"];

const LAB_MARK_FIELDS: Array<{ key: keyof TeacherMarkUpsertPayload; label: string; max: number }> = [
  { key: "labReport", label: "Lab Report", max: 15 },
  { key: "labTask", label: "Lab Task", max: 10 },
  { key: "project", label: "Project", max: 15 },
  { key: "projectReport", label: "Project Report", max: 10 },
  { key: "presentation", label: "Presentation", max: 10 },
  { key: "labEvaluation", label: "Lab Evaluation", max: 20 },
  { key: "viva", label: "Viva", max: 10 },
];

const THEORY_MARK_FIELDS: Array<{ key: keyof TeacherMarkUpsertPayload; label: string; max: number }> = [
  { key: "quiz1", label: "Quiz 1", max: 15 },
  { key: "quiz2", label: "Quiz 2", max: 15 },
  { key: "quiz3", label: "Quiz 3", max: 15 },
  { key: "presentation", label: "Presentation", max: 8 },
  { key: "assignment", label: "Assignment", max: 5 },
  { key: "midterm", label: "Midterm", max: 25 },
  { key: "finalExam", label: "Final Exam", max: 40 },
];

const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const formatSeasonYear = (item: { name: string; startDate: string; endDate: string }) => {
  const startMonth = new Date(item.startDate).toLocaleString("en-US", { month: "short" });
  const endMonth = new Date(item.endDate).toLocaleString("en-US", { month: "short" });
  const startYear = new Date(item.startDate).getFullYear();
  const endYear = new Date(item.endDate).getFullYear();
  return `${item.name} (${startMonth} ${startYear} - ${endMonth} ${endYear})`;
};

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

const createFormRowId = () => Math.random().toString(36).slice(2, 10);

type TeacherAcademicRecordForm = TeacherAcademicRecord & { uid: string };
type TeacherExperienceRecordForm = TeacherExperienceRecord & { uid: string };

export default function TeacherSectionContent({ section }: Readonly<TeacherSectionContentProps>) {
  const [loading, setLoading] = useState(false);
  const [profileState, setProfileState] = useState<TeacherPortalProfileResponse | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileDesignation, setProfileDesignation] = useState("");
  const [profileContactNo, setProfileContactNo] = useState("");
  const [profilePresentAddress, setProfilePresentAddress] = useState("");
  const [profilePermanentAddress, setProfilePermanentAddress] = useState("");
  const [profileBloodGroup, setProfileBloodGroup] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [applicationProfile, setApplicationProfile] = useState<TeacherApplicationProfile | null>(null);
  const [applicationHeadline, setApplicationHeadline] = useState("");
  const [applicationAbout, setApplicationAbout] = useState("");
  const [applicationResumeUrl, setApplicationResumeUrl] = useState("");
  const [applicationPortfolioUrl, setApplicationPortfolioUrl] = useState("");
  const [applicationSkillsInput, setApplicationSkillsInput] = useState("");
  const [applicationCertificationsInput, setApplicationCertificationsInput] = useState("");
  const [applicationAcademicRecords, setApplicationAcademicRecords] = useState<TeacherAcademicRecordForm[]>([
    { uid: createFormRowId(), degree: "", institute: "", result: "", year: new Date().getFullYear() },
  ]);
  const [applicationExperiences, setApplicationExperiences] = useState<TeacherExperienceRecordForm[]>([
    { uid: createFormRowId(), title: "", organization: "", startDate: "", endDate: "", responsibilities: "" },
  ]);
  const [savingApplicationProfile, setSavingApplicationProfile] = useState(false);
  const [deletingApplicationProfile, setDeletingApplicationProfile] = useState(false);
  const [sections, setSections] = useState<TeacherAssignedSection[]>([]);
  const [sectionSearch, setSectionSearch] = useState("");
  const debouncedSectionSearch = useDebouncedValue(sectionSearch, 1000);

  const [classworks, setClassworks] = useState<TeacherClasswork[]>([]);
  const [classworkSectionId, setClassworkSectionId] = useState("");
  const [classworkType, setClassworkType] = useState<TeacherClassworkType>("TASK");
  const [classworkTitle, setClassworkTitle] = useState("");
  const [classworkContent, setClassworkContent] = useState("");
  const [classworkDueAt, setClassworkDueAt] = useState("");
  const [creatingClasswork, setCreatingClasswork] = useState(false);
  const [editingClassworkId, setEditingClassworkId] = useState("");
  const [editingClassworkType, setEditingClassworkType] = useState<TeacherClassworkType>("TASK");
  const [editingClassworkTitle, setEditingClassworkTitle] = useState("");
  const [editingClassworkContent, setEditingClassworkContent] = useState("");
  const [editingClassworkDueAt, setEditingClassworkDueAt] = useState("");
  const [updatingClassworkId, setUpdatingClassworkId] = useState("");
  const [deletingClassworkId, setDeletingClassworkId] = useState("");

  const [attendanceSectionId, setAttendanceSectionId] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(toDateInputValue(new Date()));
  const [attendanceData, setAttendanceData] = useState<TeacherAttendanceResponse | null>(null);
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const [marksSectionId, setMarksSectionId] = useState("");
  const [marksRows, setMarksRows] = useState<TeacherSectionMarkRow[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [savingMarkForId, setSavingMarkForId] = useState("");
  const [markDrafts, setMarkDrafts] = useState<Record<string, Record<string, string>>>({});

  const hasSections = sections.length > 0;

  const parseCsvValues = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const syncProfileInputs = useCallback((profile: TeacherPortalProfileResponse) => {
    setProfileName(profile.user.name ?? "");
    setProfileImage(profile.user.image ?? "");
    setProfileBio(profile.profile?.bio ?? "");
    setProfileDesignation(profile.profile?.designation ?? "");
    setProfileContactNo(profile.user.contactNo ?? "");
    setProfilePresentAddress(profile.user.presentAddress ?? "");
    setProfilePermanentAddress(profile.user.permanentAddress ?? "");
    setProfileBloodGroup(profile.user.bloodGroup ?? "");
    setProfileGender(profile.user.gender ?? "");
    setApplicationProfile(profile.applicationProfile ?? null);
    setApplicationHeadline(profile.applicationProfile?.headline ?? "");
    setApplicationAbout(profile.applicationProfile?.about ?? "");
    setApplicationResumeUrl(profile.applicationProfile?.resumeUrl ?? "");
    setApplicationPortfolioUrl(profile.applicationProfile?.portfolioUrl ?? "");
    setApplicationSkillsInput((profile.applicationProfile?.skills ?? []).join(", "));
    setApplicationCertificationsInput((profile.applicationProfile?.certifications ?? []).join(", "));
    setApplicationAcademicRecords(
      profile.applicationProfile?.academicRecords?.length
        ? profile.applicationProfile.academicRecords.map((item) => ({ ...item, uid: createFormRowId() }))
        : [{ uid: createFormRowId(), degree: "", institute: "", result: "", year: new Date().getFullYear() }],
    );
    setApplicationExperiences(
      profile.applicationProfile?.experiences?.length
        ? profile.applicationProfile.experiences.map((item) => ({
            uid: createFormRowId(),
            ...item,
            startDate: item.startDate ? item.startDate.slice(0, 10) : "",
            endDate: item.endDate ? item.endDate.slice(0, 10) : "",
          }))
        : [{ uid: createFormRowId(), title: "", organization: "", startDate: "", endDate: "", responsibilities: "" }],
    );
  }, []);

  const loadProfile = useCallback(async () => {
    const data = await TeacherPortalService.getProfileOverview();
    setProfileState(data);
    syncProfileInputs(data);
  }, [syncProfileInputs]);

  const reloadSections = useCallback(async () => {
    const data = await TeacherPortalService.listSectionsWithStudents(debouncedSectionSearch);
    setSections(data);
    if (!classworkSectionId && data[0]) {
      setClassworkSectionId(data[0].section.id);
    }
    if (!attendanceSectionId && data[0]) {
      setAttendanceSectionId(data[0].section.id);
    }
    if (!marksSectionId && data[0]) {
      setMarksSectionId(data[0].section.id);
    }
  }, [attendanceSectionId, classworkSectionId, debouncedSectionSearch, marksSectionId]);

  const reloadClassworks = async (sectionId?: string) => {
    const data = await TeacherPortalService.listClassworks(
      sectionId ? { sectionId } : undefined,
    );
    setClassworks(data);
  };

  const loadAttendance = async (targetSectionId: string, targetDate: string) => {
    if (!targetSectionId || !targetDate) {
      return;
    }

    setLoadingAttendance(true);
    try {
      const isoDate = new Date(`${targetDate}T00:00:00.000Z`).toISOString();
      const data = await TeacherPortalService.getAttendance(targetSectionId, isoDate);
      setAttendanceData(data);
      setAttendanceStatusMap(
        data.items.reduce<Record<string, AttendanceStatus>>((acc, item) => {
          acc[item.courseRegistrationId] = item.status;
          return acc;
        }, {}),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load attendance";
      toast.error(message);
      setAttendanceData(null);
      setAttendanceStatusMap({});
    } finally {
      setLoadingAttendance(false);
    }
  };

  const buildDraftFromRow = useCallback((row: TeacherSectionMarkRow) => {
    const fields = row.isLabCourse ? LAB_MARK_FIELDS : THEORY_MARK_FIELDS;
    const next: Record<string, string> = {};

    for (const field of fields) {
      const value = row.marks?.[field.key];
      next[field.key] = typeof value === "number" ? String(value) : "";
    }

    return next;
  }, []);

  const loadMarks = useCallback(async (targetSectionId: string) => {
    if (!targetSectionId) {
      return;
    }

    setLoadingMarks(true);
    try {
      const data = await TeacherPortalService.listMarks(targetSectionId);
      setMarksRows(data);

      const draftMap = data.reduce<Record<string, Record<string, string>>>((acc, row) => {
        acc[row.courseRegistrationId] = buildDraftFromRow(row);
        return acc;
      }, {});

      setMarkDrafts(draftMap);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load marks";
      toast.error(message);
      setMarksRows([]);
      setMarkDrafts({});
    } finally {
      setLoadingMarks(false);
    }
  }, [buildDraftFromRow]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        await loadProfile();
        await reloadSections();
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error instanceof Error ? error.message : "Failed to load data";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [loadProfile, reloadSections]);

  useEffect(() => {
    if (loading) {
      return;
    }

    void reloadSections();
  }, [debouncedSectionSearch, loading, reloadSections]);

  const handleSaveProfile = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (profileName.trim().length < 2) {
      toast.warning("Name must be at least 2 characters long");
      return;
    }

    const payload: TeacherProfileUpdatePayload = {
      name: profileName.trim() || undefined,
      image: profileImage.trim() || undefined,
      bio: profileBio.trim() || undefined,
      designation: profileDesignation.trim() || undefined,
      contactNo: profileContactNo.trim() || undefined,
      presentAddress: profilePresentAddress.trim() || undefined,
      permanentAddress: profilePermanentAddress.trim() || undefined,
      bloodGroup: profileBloodGroup.trim() || undefined,
      gender: profileGender.trim() || undefined,
    };

    setSavingProfile(true);
    try {
      const updated = await TeacherPortalService.updateProfile(payload);
      setProfileState(updated);
      syncProfileInputs(updated);
      toast.success("Profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const addApplicationAcademicRecord = () => {
    setApplicationAcademicRecords((prev) => [
      ...prev,
      { uid: createFormRowId(), degree: "", institute: "", result: "", year: new Date().getFullYear() },
    ]);
  };

  const removeApplicationAcademicRecord = (uid: string) => {
    setApplicationAcademicRecords((prev) => (prev.length > 1 ? prev.filter((item) => item.uid !== uid) : prev));
  };

  const updateApplicationAcademicRecord = (
    uid: string,
    field: keyof TeacherAcademicRecord,
    value: string | number,
  ) => {
    setApplicationAcademicRecords((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, [field]: value } : item)),
    );
  };

  const addApplicationExperience = () => {
    setApplicationExperiences((prev) => [
      ...prev,
      { uid: createFormRowId(), title: "", organization: "", startDate: "", endDate: "", responsibilities: "" },
    ]);
  };

  const removeApplicationExperience = (uid: string) => {
    setApplicationExperiences((prev) => (prev.length > 1 ? prev.filter((item) => item.uid !== uid) : prev));
  };

  const updateApplicationExperience = (
    uid: string,
    field: keyof TeacherExperienceRecord,
    value: string,
  ) => {
    setApplicationExperiences((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, [field]: value } : item)),
    );
  };

  const saveApplicationProfile = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalized = {
      headline: applicationHeadline.trim(),
      about: applicationAbout.trim(),
      resumeUrl: applicationResumeUrl.trim(),
      portfolioUrl: applicationPortfolioUrl.trim() || undefined,
      skills: parseCsvValues(applicationSkillsInput),
      certifications: parseCsvValues(applicationCertificationsInput),
      academicRecords: applicationAcademicRecords.map((item) => ({
        degree: item.degree.trim(),
        institute: item.institute.trim(),
        result: item.result.trim(),
        year: Number(item.year),
      })),
      experiences: applicationExperiences.map((item) => ({
        title: item.title.trim(),
        organization: item.organization.trim(),
        startDate: item.startDate.trim(),
        endDate: item.endDate?.trim() || undefined,
        responsibilities: item.responsibilities?.trim() || undefined,
      })),
    };

    if (normalized.headline.length < 2 || normalized.about.length < 20 || !normalized.resumeUrl) {
      toast.warning("Headline, about, and resume URL are required");
      return;
    }

    if (normalized.skills.length === 0) {
      toast.warning("At least one skill is required");
      return;
    }

    if (normalized.academicRecords.some((item) => !item.degree || !item.institute || !item.result || !item.year)) {
      toast.warning("Complete all academic record fields");
      return;
    }

    if (normalized.experiences.some((item) => !item.title || !item.organization || !item.startDate)) {
      toast.warning("Complete required experience fields");
      return;
    }

    setSavingApplicationProfile(true);
    try {
      if (applicationProfile) {
        await TeacherPortalService.updateApplicationProfile(normalized);
      } else {
        await TeacherPortalService.createApplicationProfile(normalized);
      }
      await loadProfile();
      toast.success("Application profile saved successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save application profile";
      toast.error(message);
    } finally {
      setSavingApplicationProfile(false);
    }
  };

  const removeApplicationProfile = async () => {
    setDeletingApplicationProfile(true);
    try {
      await TeacherPortalService.deleteApplicationProfile();
      await loadProfile();
      toast.success("Application profile deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete application profile";
      toast.error(message);
    } finally {
      setDeletingApplicationProfile(false);
    }
  };

  useEffect(() => {
    if (section !== "attendance") {
      return;
    }

    if (!attendanceSectionId || !attendanceDate) {
      return;
    }

    void loadAttendance(attendanceSectionId, attendanceDate);
  }, [attendanceDate, attendanceSectionId, section]);

  useEffect(() => {
    if (section !== "classworks") {
      return;
    }

    if (!classworkSectionId) {
      return;
    }

    void reloadClassworks(classworkSectionId);
  }, [classworkSectionId, section]);

  useEffect(() => {
    if (section !== "marks") {
      return;
    }

    if (!marksSectionId) {
      return;
    }

    void loadMarks(marksSectionId);
  }, [loadMarks, marksSectionId, section]);

  const totalStudents = useMemo(
    () => sections.reduce((count, item) => count + item.students.length, 0),
    [sections],
  );

  const canCreateClasswork = classworkTitle.trim().length >= 2 && Boolean(classworkSectionId);

  const handleCreateClasswork = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateClasswork) {
      toast.warning("Please provide title and section");
      return;
    }

    setCreatingClasswork(true);
    try {
      await TeacherPortalService.createClasswork({
        sectionId: classworkSectionId,
        type: classworkType,
        title: classworkTitle,
        content: classworkContent || undefined,
        dueAt: classworkDueAt ? new Date(classworkDueAt).toISOString() : undefined,
      });

      toast.success("Classwork created successfully");
      setClassworkTitle("");
      setClassworkContent("");
      setClassworkDueAt("");
      await reloadClassworks(classworkSectionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create classwork";
      toast.error(message);
    } finally {
      setCreatingClasswork(false);
    }
  };

  const startEditClasswork = (item: TeacherClasswork) => {
    setEditingClassworkId(item.id);
    setEditingClassworkType(item.type);
    setEditingClassworkTitle(item.title);
    setEditingClassworkContent(item.content ?? "");
    setEditingClassworkDueAt(item.dueAt ? item.dueAt.slice(0, 10) : "");
  };

  const resetEditClasswork = () => {
    setEditingClassworkId("");
    setEditingClassworkType("TASK");
    setEditingClassworkTitle("");
    setEditingClassworkContent("");
    setEditingClassworkDueAt("");
  };

  const handleUpdateClasswork = async (classworkId: string) => {
    if (editingClassworkTitle.trim().length < 2) {
      toast.warning("Please provide a valid classwork title");
      return;
    }

    setUpdatingClassworkId(classworkId);
    try {
      await TeacherPortalService.updateClasswork(classworkId, {
        type: editingClassworkType,
        title: editingClassworkTitle,
        content: editingClassworkContent,
        dueAt: editingClassworkDueAt
          ? new Date(editingClassworkDueAt).toISOString()
          : undefined,
      });

      toast.success("Classwork updated successfully");
      resetEditClasswork();
      await reloadClassworks(classworkSectionId || undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update classwork";
      toast.error(message);
    } finally {
      setUpdatingClassworkId("");
    }
  };

  const handleDeleteClasswork = async (classworkId: string) => {
    setDeletingClassworkId(classworkId);
    try {
      await TeacherPortalService.deleteClasswork(classworkId);
      toast.success("Classwork deleted successfully");
      if (editingClassworkId === classworkId) {
        resetEditClasswork();
      }
      await reloadClassworks(classworkSectionId || undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete classwork";
      toast.error(message);
    } finally {
      setDeletingClassworkId("");
    }
  };

  const handleSubmitAttendance = async () => {
    if (!attendanceSectionId) {
      toast.warning("Please select a section");
      return;
    }

    const items = Object.entries(attendanceStatusMap).map(([courseRegistrationId, status]) => ({
      courseRegistrationId,
      status,
    }));

    if (items.length === 0) {
      toast.warning("No attendance rows found to submit");
      return;
    }

    setSavingAttendance(true);
    try {
      const data = await TeacherPortalService.submitAttendance({
        sectionId: attendanceSectionId,
        date: new Date(`${attendanceDate}T00:00:00.000Z`).toISOString(),
        items,
      });

      setAttendanceData(data);
      setAttendanceStatusMap(
        data.items.reduce<Record<string, AttendanceStatus>>((acc, item) => {
          acc[item.courseRegistrationId] = item.status;
          return acc;
        }, {}),
      );

      toast.success("Attendance submitted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit attendance";
      toast.error(message);
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleMarkDraftChange = (
    courseRegistrationId: string,
    key: keyof TeacherMarkUpsertPayload,
    value: string,
  ) => {
    setMarkDrafts((prev) => ({
      ...prev,
      [courseRegistrationId]: {
        ...prev[courseRegistrationId],
        [key]: value,
      },
    }));
  };

  const handleSaveMarks = async (row: TeacherSectionMarkRow) => {
    const draft = markDrafts[row.courseRegistrationId] ?? {};
    const schemaFields = row.isLabCourse ? LAB_MARK_FIELDS : THEORY_MARK_FIELDS;
    const payload: TeacherMarkUpsertPayload = {};

    for (const field of schemaFields) {
      const raw = draft[field.key];
      if (typeof raw !== "string" || raw.trim() === "") {
        continue;
      }

      const parsed = Number(raw);
      if (Number.isNaN(parsed)) {
        toast.warning(`${field.label} must be a valid number`);
        return;
      }

      if (parsed < 0) {
        toast.warning(`${field.label} cannot be negative`);
        return;
      }

      if (parsed > field.max) {
        toast.warning(`${field.label} cannot be greater than ${field.max}`);
        return;
      }

      payload[field.key] = parsed;
    }

    if (Object.keys(payload).length === 0) {
      toast.warning("Enter at least one mark before saving");
      return;
    }

    setSavingMarkForId(row.courseRegistrationId);
    try {
      const updated = await TeacherPortalService.upsertMark(row.courseRegistrationId, payload);

      setMarksRows((prev) =>
        prev.map((item) =>
          item.courseRegistrationId === row.courseRegistrationId ? updated : item,
        ),
      );

      setMarkDrafts((prev) => ({
        ...prev,
        [row.courseRegistrationId]: buildDraftFromRow(updated),
      }));

      toast.success("Marks saved successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save marks";
      toast.error(message);
    } finally {
      setSavingMarkForId("");
    }
  };

  if (loading) {
    return (
      <article className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Loading teacher workspace...</p>
      </article>
    );
  }

  if (!hasSections && section !== "profile" && section !== "notices") {
    return (
      <article className="rounded-2xl border border-dashed border-border bg-card/80 p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No assigned sections yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Once your institution assigns course registrations to your profile, your section workspace will appear here.
        </p>
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
              <p className="text-xs text-muted-foreground">Teacher Name</p>
              <p className="font-medium">{profileState?.user.name ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{profileState?.user.email ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Teacher Initial</p>
              <p className="font-medium">{profileState?.profile?.teacherInitial ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2">
              <p className="text-xs text-muted-foreground">Teacher ID</p>
              <p className="font-medium">{profileState?.profile?.teachersId ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 md:col-span-2">
              <p className="text-xs text-muted-foreground">Institution</p>
              <p className="font-medium">{profileState?.profile?.institution.name ?? "-"}</p>
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

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={profileDesignation}
                onChange={(event) => setProfileDesignation(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Designation"
              />
              <input
                value={profileBloodGroup}
                onChange={(event) => setProfileBloodGroup(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Blood group"
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

            <input
              value={profileGender}
              onChange={(event) => setProfileGender(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Gender"
            />

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

        <ChangePasswordCard />

        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold sm:text-lg">Application Profile (For Institution Apply)</h2>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${applicationProfile?.isComplete ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {applicationProfile?.isComplete ? "Complete" : "Incomplete"}
            </span>
          </div>

          <form className="mt-4 grid gap-3" onSubmit={saveApplicationProfile}>
            <input
              value={applicationHeadline}
              onChange={(event) => setApplicationHeadline(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Headline"
            />

            <textarea
              value={applicationAbout}
              onChange={(event) => setApplicationAbout(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="About"
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={applicationResumeUrl}
                onChange={(event) => setApplicationResumeUrl(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Resume URL"
              />
              <input
                value={applicationPortfolioUrl}
                onChange={(event) => setApplicationPortfolioUrl(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Portfolio URL (optional)"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={applicationSkillsInput}
                onChange={(event) => setApplicationSkillsInput(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Skills (comma separated)"
              />
              <input
                value={applicationCertificationsInput}
                onChange={(event) => setApplicationCertificationsInput(event.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
                placeholder="Certifications (comma separated, optional)"
              />
            </div>

            <div className="space-y-2 rounded-xl border border-border/70 bg-background/50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Academic Records</p>
                <button
                  type="button"
                  onClick={addApplicationAcademicRecord}
                  className="rounded-lg border border-border px-2 py-1 text-xs"
                >
                  Add
                </button>
              </div>
              {applicationAcademicRecords.map((record) => (
                <div key={record.uid} className="grid grid-cols-1 gap-2 md:grid-cols-4">
                  <input
                    value={record.degree}
                    onChange={(event) => updateApplicationAcademicRecord(record.uid, "degree", event.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    placeholder="Degree"
                  />
                  <input
                    value={record.institute}
                    onChange={(event) => updateApplicationAcademicRecord(record.uid, "institute", event.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    placeholder="Institute"
                  />
                  <input
                    value={record.result}
                    onChange={(event) => updateApplicationAcademicRecord(record.uid, "result", event.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    placeholder="Result"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={record.year}
                      onChange={(event) => updateApplicationAcademicRecord(record.uid, "year", Number(event.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                      placeholder="Year"
                    />
                    <button
                      type="button"
                      onClick={() => removeApplicationAcademicRecord(record.uid)}
                      className="rounded-lg border border-destructive/40 px-2 py-1 text-xs text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 rounded-xl border border-border/70 bg-background/50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Experience Records</p>
                <button
                  type="button"
                  onClick={addApplicationExperience}
                  className="rounded-lg border border-border px-2 py-1 text-xs"
                >
                  Add
                </button>
              </div>
              {applicationExperiences.map((item) => (
                <div key={item.uid} className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input
                    value={item.title}
                    onChange={(event) => updateApplicationExperience(item.uid, "title", event.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    placeholder="Title"
                  />
                  <input
                    value={item.organization}
                    onChange={(event) => updateApplicationExperience(item.uid, "organization", event.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    placeholder="Organization"
                  />
                  <input
                    type="date"
                    value={item.startDate}
                    onChange={(event) => updateApplicationExperience(item.uid, "startDate", event.target.value)}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={item.endDate ?? ""}
                      onChange={(event) => updateApplicationExperience(item.uid, "endDate", event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => removeApplicationExperience(item.uid)}
                      className="rounded-lg border border-destructive/40 px-2 py-1 text-xs text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={item.responsibilities ?? ""}
                    onChange={(event) => updateApplicationExperience(item.uid, "responsibilities", event.target.value)}
                    rows={2}
                    className="md:col-span-2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                    placeholder="Responsibilities (optional)"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={savingApplicationProfile}
                className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingApplicationProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {applicationProfile ? "Update Application Profile" : "Create Application Profile"}
              </button>
              {applicationProfile ? (
                <button
                  type="button"
                  onClick={() => void removeApplicationProfile()}
                  disabled={deletingApplicationProfile}
                  className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-destructive/40 px-4 py-2 text-sm font-semibold text-destructive disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingApplicationProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Delete Application Profile
                </button>
              ) : null}
            </div>
          </form>
        </article>
      </div>
    );
  }

  if (section === "notices") {
    return <NoticeWorkspace canCompose={false} />;
  }

  if (section === "routines") {
    return <RoutineBrowser />;
  }

  if (section === "sections") {
    return (
      <div className="space-y-4">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">Assigned Sections</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {sections.length} sections with {totalStudents} enrolled students.
          </p>
        </article>

        {sections.map((item) => (
          <article key={item.section.id} className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Section {item.section.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatSeasonYear(item.section.semester)}
                  {item.section.batch ? ` • Batch ${item.section.batch.name}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {item.students.length} Students
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-left text-muted-foreground">
                    <th className="px-2 py-2 font-medium">Student</th>
                    <th className="px-2 py-2 font-medium">Student ID</th>
                    <th className="px-2 py-2 font-medium">Course</th>
                    <th className="px-2 py-2 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {item.students.map((entry) => (
                    <tr key={entry.courseRegistrationId} className="border-b border-border/40 last:border-0">
                      <td className="px-2 py-2 font-medium">{entry.studentProfile.user.name}</td>
                      <td className="px-2 py-2">{entry.studentProfile.studentsId}</td>
                      <td className="px-2 py-2">
                        {entry.course.courseCode} - {entry.course.courseTitle}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">{entry.studentProfile.user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (section === "classworks") {
    return (
      <div className="space-y-4">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">Create Task, Assignment, Quiz or Notice</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleCreateClasswork}>
            <label className="space-y-1 text-sm">
              <span className="font-medium">Section</span>
              <SearchableSelect
                value={classworkSectionId}
                onChange={setClassworkSectionId}
                options={sections.map((item) => ({
                  value: item.section.id,
                  label: `${item.section.name} - ${formatSeasonYear(item.section.semester)}`,
                }))}
                placeholder="Select section"
                searchPlaceholder="Search section..."
                emptyText="No section found"
                searchValue={sectionSearch}
                onSearchValueChange={setSectionSearch}
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Type</span>
              <SearchableSelect
                value={classworkType}
                onChange={(nextValue) => setClassworkType(nextValue as TeacherClassworkType)}
                options={CLASSWORK_TYPES.map((item) => ({ value: item, label: classworkTypeLabel[item] }))}
                placeholder="Select type"
                searchPlaceholder="Search type..."
                emptyText="No type found"
              />
            </label>

            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-medium">Title</span>
              <input
                type="text"
                value={classworkTitle}
                onChange={(event) => setClassworkTitle(event.target.value)}
                placeholder="Example: Quiz on Chapter 4"
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </label>

            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-medium">Description (optional)</span>
              <textarea
                value={classworkContent}
                onChange={(event) => setClassworkContent(event.target.value)}
                rows={3}
                placeholder="Share instructions or notes"
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Due Date (optional)</span>
              <input
                type="date"
                value={classworkDueAt}
                onChange={(event) => setClassworkDueAt(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creatingClasswork || !canCreateClasswork}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {creatingClasswork ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Publish
              </button>
            </div>
          </form>
        </article>

        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">Published Items</h2>
          <div className="mt-4 space-y-3">
            {classworks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items published for this section yet.</p>
            ) : (
              classworks.map((item) => {
                const isEditing = editingClassworkId === item.id;
                const isUpdating = updatingClassworkId === item.id;
                const isDeleting = deletingClassworkId === item.id;

                return (
                  <article key={item.id} className="rounded-xl border border-border/70 bg-background/70 p-4">
                    {isEditing ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                          <span className="font-medium">Type</span>
                          <SearchableSelect
                            value={editingClassworkType}
                            onChange={(nextValue) => setEditingClassworkType(nextValue as TeacherClassworkType)}
                            options={CLASSWORK_TYPES.map((type) => ({ value: type, label: classworkTypeLabel[type] }))}
                            placeholder="Select type"
                            searchPlaceholder="Search type..."
                            emptyText="No type found"
                          />
                        </label>

                        <label className="space-y-1 text-sm">
                          <span className="font-medium">Due Date</span>
                          <input
                            type="date"
                            value={editingClassworkDueAt}
                            onChange={(event) => setEditingClassworkDueAt(event.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2"
                          />
                        </label>

                        <label className="space-y-1 text-sm md:col-span-2">
                          <span className="font-medium">Title</span>
                          <input
                            type="text"
                            value={editingClassworkTitle}
                            onChange={(event) => setEditingClassworkTitle(event.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2"
                          />
                        </label>

                        <label className="space-y-1 text-sm md:col-span-2">
                          <span className="font-medium">Description</span>
                          <textarea
                            value={editingClassworkContent}
                            onChange={(event) => setEditingClassworkContent(event.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2"
                          />
                        </label>

                        <div className="flex gap-2 md:col-span-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => void handleUpdateClasswork(item.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                          >
                            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={resetEditClasswork}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                              {classworkTypeLabel[item.type]}
                            </p>
                            <h3 className="mt-1 text-base font-semibold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">Section {item.section.name}</p>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditClasswork(item)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => void handleDeleteClasswork(item.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-destructive/50 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-60"
                            >
                              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                              Delete
                            </button>
                          </div>
                        </div>

                        {item.content ? (
                          <p className="mt-2 text-sm text-muted-foreground">{item.content}</p>
                        ) : null}
                        <p className="mt-2 text-xs text-muted-foreground">
                          Published: {formatDate(item.createdAt)}
                          {item.dueAt ? ` • Due: ${formatDate(item.dueAt)}` : ""}
                        </p>
                      </>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </article>
      </div>
    );
  }

  if (section === "attendance") {
    return (
      <div className="space-y-4">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">Daily Attendance</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="space-y-1 text-sm md:col-span-2">
              <span className="font-medium">Section</span>
              <SearchableSelect
                value={attendanceSectionId}
                onChange={setAttendanceSectionId}
                options={sections.map((item) => ({
                  value: item.section.id,
                  label: `${item.section.name} - ${formatSeasonYear(item.section.semester)}`,
                }))}
                placeholder="Select section"
                searchPlaceholder="Search section..."
                emptyText="No section found"
                searchValue={sectionSearch}
                onSearchValueChange={setSectionSearch}
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Date</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(event) => setAttendanceDate(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </label>
          </div>
        </article>

        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold">Attendance Sheet</h3>
            <button
              type="button"
              onClick={() => void handleSubmitAttendance()}
              disabled={savingAttendance || loadingAttendance || !attendanceData}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {savingAttendance ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save Attendance
            </button>
          </div>

          {loadingAttendance ? (
            <p className="text-sm text-muted-foreground">Loading attendance sheet...</p>
          ) : null}

          {!loadingAttendance && !attendanceData ? (
            <p className="text-sm text-muted-foreground">No attendance data available for selected filters.</p>
          ) : null}

          {attendanceData ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/70 text-left text-muted-foreground">
                    <th className="px-2 py-2 font-medium">Student</th>
                    <th className="px-2 py-2 font-medium">Course</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.items.map((item) => (
                    <tr key={item.courseRegistrationId} className="border-b border-border/40 last:border-0">
                      <td className="px-2 py-2">
                        <p className="font-medium">{item.studentProfile.user.name}</p>
                        <p className="text-xs text-muted-foreground">{item.studentProfile.studentsId}</p>
                      </td>
                      <td className="px-2 py-2">
                        {item.course.courseCode} - {item.course.courseTitle}
                      </td>
                      <td className="px-2 py-2">
                        <SearchableSelect
                          value={attendanceStatusMap[item.courseRegistrationId] ?? "ABSENT"}
                          onChange={(nextValue) =>
                            setAttendanceStatusMap((prev) => ({
                              ...prev,
                              [item.courseRegistrationId]: nextValue as AttendanceStatus,
                            }))
                          }
                          options={[
                            { value: "PRESENT", label: "Present" },
                            { value: "ABSENT", label: "Absent" },
                          ]}
                          placeholder="Select status"
                          searchPlaceholder="Search status..."
                          emptyText="No status found"
                          className="min-w-36"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </article>
      </div>
    );
  }

  if (section === "marks") {
    return (
      <div className="space-y-4">
        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-base font-semibold sm:text-lg">Marks Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Attendance marks are auto-calculated from submitted attendance records.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Section</span>
              <SearchableSelect
                value={marksSectionId}
                onChange={setMarksSectionId}
                options={sections.map((item) => ({
                  value: item.section.id,
                  label: `${item.section.name} - ${formatSeasonYear(item.section.semester)}`,
                }))}
                placeholder="Select section"
                searchPlaceholder="Search section..."
                emptyText="No section found"
                searchValue={sectionSearch}
                onSearchValueChange={setSectionSearch}
              />
            </label>

            <article className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              <p>Lab distribution: attendance max 10, total 100.</p>
              <p>Non-lab distribution: attendance max 7 and quizzes counted by average.</p>
            </article>
          </div>
        </article>

        <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          {loadingMarks ? <p className="text-sm text-muted-foreground">Loading marks sheet...</p> : null}

          {!loadingMarks && marksRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No marks rows found for selected section.</p>
          ) : null}

          {!loadingMarks && marksRows.length > 0 ? (
            <div className="space-y-3">
              {marksRows.map((row) => {
                const fields = row.isLabCourse ? LAB_MARK_FIELDS : THEORY_MARK_FIELDS;
                const rowDraft = markDrafts[row.courseRegistrationId] ?? {};
                const isSaving = savingMarkForId === row.courseRegistrationId;

                return (
                  <article key={row.courseRegistrationId} className="rounded-xl border border-border/70 bg-background/70 p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{row.studentProfile.user.name}</p>
                        <p className="text-xs text-muted-foreground">{row.studentProfile.studentsId}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {row.course.courseCode} - {row.course.courseTitle}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {row.isLabCourse ? "Lab" : "Non-Lab"}
                      </span>
                    </div>

                    <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-5">
                      {fields.map((field) => (
                        <label key={field.key} className="space-y-1 text-xs">
                          <span className="font-medium text-foreground">
                            {field.label} (max {field.max})
                          </span>
                          <input
                            type="number"
                            min={0}
                            max={field.max}
                            step="0.01"
                            value={rowDraft[field.key] ?? ""}
                            onChange={(event) =>
                              handleMarkDraftChange(row.courseRegistrationId, field.key, event.target.value)
                            }
                            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-3 grid gap-2 rounded-lg border border-border/60 bg-card/70 p-3 text-xs text-muted-foreground md:grid-cols-4">
                      <p>
                        Attendance: {row.attendance.presentClasses}/{row.attendance.totalClasses} ({row.attendance.percentage}%)
                      </p>
                      <p>
                        Attendance Mark: {row.attendance.mark}/{row.attendance.max}
                      </p>
                      <p>
                        Quiz Average: {row.quizAverage ?? 0}
                      </p>
                      <p className="font-semibold text-foreground">
                        Total: {row.totalMark}/{row.maxTotal}
                      </p>
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => void handleSaveMarks(row)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Save Marks
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </article>
      </div>
    );
  }

  return null;
}
