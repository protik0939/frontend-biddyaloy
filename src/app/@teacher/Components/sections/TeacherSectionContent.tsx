"use client";

import { Loader2, Trash2, Pencil, Save, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  type AttendanceStatus,
  type TeacherMarkUpsertPayload,
  type TeacherAssignedSection,
  type TeacherAttendanceResponse,
  type TeacherClasswork,
  type TeacherClassworkType,
  type TeacherSectionMarkRow,
  TeacherPortalService,
} from "@/services/Teacher/teacherPortal.service";

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

export default function TeacherSectionContent({ section }: Readonly<TeacherSectionContentProps>) {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<TeacherAssignedSection[]>([]);

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

  const reloadSections = useCallback(async () => {
    const data = await TeacherPortalService.listSectionsWithStudents();
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
  }, [attendanceSectionId, classworkSectionId, marksSectionId]);

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
  }, [reloadSections]);

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
        ...(prev[courseRegistrationId] ?? {}),
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

  if (!hasSections) {
    return (
      <article className="rounded-2xl border border-dashed border-border bg-card/80 p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold">No assigned sections yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Once your institution assigns course registrations to your profile, your section workspace will appear here.
        </p>
      </article>
    );
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
              <select
                value={classworkSectionId}
                onChange={(event) => setClassworkSectionId(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                {sections.map((item) => (
                  <option key={item.section.id} value={item.section.id}>
                    {item.section.name} - {formatSeasonYear(item.section.semester)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Type</span>
              <select
                value={classworkType}
                onChange={(event) => setClassworkType(event.target.value as TeacherClassworkType)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                {CLASSWORK_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {classworkTypeLabel[item]}
                  </option>
                ))}
              </select>
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
                          <select
                            value={editingClassworkType}
                            onChange={(event) => setEditingClassworkType(event.target.value as TeacherClassworkType)}
                            className="w-full rounded-lg border border-border bg-background px-3 py-2"
                          >
                            {CLASSWORK_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {classworkTypeLabel[type]}
                              </option>
                            ))}
                          </select>
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
              <select
                value={attendanceSectionId}
                onChange={(event) => setAttendanceSectionId(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                {sections.map((item) => (
                  <option key={item.section.id} value={item.section.id}>
                    {item.section.name} - {formatSeasonYear(item.section.semester)}
                  </option>
                ))}
              </select>
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
                        <select
                          value={attendanceStatusMap[item.courseRegistrationId] ?? "ABSENT"}
                          onChange={(event) =>
                            setAttendanceStatusMap((prev) => ({
                              ...prev,
                              [item.courseRegistrationId]: event.target.value as AttendanceStatus,
                            }))
                          }
                          className="rounded-lg border border-border bg-background px-2 py-1"
                        >
                          <option value="PRESENT">Present</option>
                          <option value="ABSENT">Absent</option>
                        </select>
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
              <select
                value={marksSectionId}
                onChange={(event) => setMarksSectionId(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                {sections.map((item) => (
                  <option key={item.section.id} value={item.section.id}>
                    {item.section.name} - {formatSeasonYear(item.section.semester)}
                  </option>
                ))}
              </select>
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
