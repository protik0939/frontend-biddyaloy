"use client";

import { Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import SearchableSelect from "@/Components/ui/SearchableSelect";
import {
  type Classroom,
  type CourseRegistration,
  type DepartmentRoutine,
  type DepartmentSchedule,
  DepartmentManagementService,
  type Semester,
  type SlotStatus,
} from "@/services/Department/departmentManagement.service";

type RoutineWorkspaceSection = "schedules" | "classrooms" | "routines";

interface DepartmentRoutineWorkspaceProps {
  section: RoutineWorkspaceSection;
}

const formatTimeRange = (startTime: string, endTime: string) => `${startTime} - ${endTime}`;

const buildUniqueRoutineCourseOptions = (courseRegistrations: CourseRegistration[]) => {
  const uniqueMap = new Map<string, { value: string; label: string }>();

  for (const item of courseRegistrations) {
    const key = [
      item.section.id,
      item.semester.id,
      item.course.courseCode,
      item.teacherProfile.teacherInitial,
    ].join("|");

    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, {
        value: item.id,
        label: `${item.section.name}.${item.teacherProfile.teacherInitial}.${item.course.courseCode}`,
      });
    }
  }

  return Array.from(uniqueMap.values());
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function DepartmentRoutineWorkspace({ section }: Readonly<DepartmentRoutineWorkspaceProps>) {
  const [loading, setLoading] = useState(false);

  const [schedules, setSchedules] = useState<DepartmentSchedule[]>([]);
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [scheduleSemesterId, setScheduleSemesterId] = useState("");
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleEndTime, setScheduleEndTime] = useState("");
  const [scheduleStatus, setScheduleStatus] = useState<SlotStatus>("CLASS_SLOT");
  const [creatingSchedule, setCreatingSchedule] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState("");
  const [editingScheduleName, setEditingScheduleName] = useState("");
  const [editingScheduleDescription, setEditingScheduleDescription] = useState("");
  const [editingScheduleSemesterId, setEditingScheduleSemesterId] = useState("");
  const [editingScheduleStartTime, setEditingScheduleStartTime] = useState("");
  const [editingScheduleEndTime, setEditingScheduleEndTime] = useState("");
  const [editingScheduleStatus, setEditingScheduleStatus] = useState<SlotStatus>("CLASS_SLOT");
  const [savingScheduleId, setSavingScheduleId] = useState("");
  const [deletingScheduleId, setDeletingScheduleId] = useState("");

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classroomSearch, setClassroomSearch] = useState("");
  const [classroomName, setClassroomName] = useState("");
  const [classroomRoomNo, setClassroomRoomNo] = useState("");
  const [classroomFloor, setClassroomFloor] = useState("");
  const [classroomCapacity, setClassroomCapacity] = useState("");
  const [classroomType, setClassroomType] = useState<Classroom["roomType"]>("LECTURE");
  const [creatingClassroom, setCreatingClassroom] = useState(false);
  const [editingClassroomId, setEditingClassroomId] = useState("");
  const [editingClassroomName, setEditingClassroomName] = useState("");
  const [editingClassroomRoomNo, setEditingClassroomRoomNo] = useState("");
  const [editingClassroomFloor, setEditingClassroomFloor] = useState("");
  const [editingClassroomCapacity, setEditingClassroomCapacity] = useState("");
  const [editingClassroomType, setEditingClassroomType] = useState<Classroom["roomType"]>("LECTURE");
  const [savingClassroomId, setSavingClassroomId] = useState("");
  const [deletingClassroomId, setDeletingClassroomId] = useState("");

  const [routines, setRoutines] = useState<DepartmentRoutine[]>([]);
  const [routineSearch, setRoutineSearch] = useState("");
  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [routineVersion, setRoutineVersion] = useState("");
  const [routineSemesterId, setRoutineSemesterId] = useState("");
  const [routineScheduleId, setRoutineScheduleId] = useState("");
  const [routineClassroomId, setRoutineClassroomId] = useState("");
  const [routineCourseRegistrationId, setRoutineCourseRegistrationId] = useState("");
  const [creatingRoutine, setCreatingRoutine] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState("");
  const [editingRoutineName, setEditingRoutineName] = useState("");
  const [editingRoutineDescription, setEditingRoutineDescription] = useState("");
  const [editingRoutineVersion, setEditingRoutineVersion] = useState("");
  const [editingRoutineScheduleId, setEditingRoutineScheduleId] = useState("");
  const [editingRoutineClassroomId, setEditingRoutineClassroomId] = useState("");
  const [editingRoutineCourseRegistrationId, setEditingRoutineCourseRegistrationId] = useState("");
  const [savingRoutineId, setSavingRoutineId] = useState("");
  const [deletingRoutineId, setDeletingRoutineId] = useState("");

  const [courseRegistrations, setCourseRegistrations] = useState<CourseRegistration[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const canCreateSchedule =
    scheduleName.trim().length >= 2 &&
    Boolean(scheduleSemesterId) &&
    Boolean(scheduleStartTime) &&
    Boolean(scheduleEndTime) &&
    scheduleEndTime > scheduleStartTime;

  const canCreateClassroom =
    classroomRoomNo.trim().length > 0 &&
    classroomFloor.trim().length > 0 &&
    Number(classroomCapacity) > 0;

  const canCreateRoutine =
    routineName.trim().length >= 2 &&
    Boolean(routineScheduleId) &&
    Boolean(routineClassroomId) &&
    Boolean(routineCourseRegistrationId);

  const reloadSchedules = async (search?: string, semesterId?: string) => {
    const data = await DepartmentManagementService.listSchedules(
      search?.trim() || undefined,
      semesterId?.trim() || undefined,
    );
    setSchedules(data);
    if (!routineScheduleId && data[0]) {
      setRoutineScheduleId(data[0].id);
    }
  };

  const reloadSemesters = async () => {
    const data = await DepartmentManagementService.listSemesters();
    setSemesters(data);
    if (!scheduleSemesterId && data[0]) {
      setScheduleSemesterId(data[0].id);
    }
    if (!routineSemesterId && data[0]) {
      setRoutineSemesterId(data[0].id);
    }
  };

  const reloadClassrooms = async (search?: string) => {
    const data = await DepartmentManagementService.listClassrooms(search?.trim() || undefined);
    setClassrooms(data);
    if (!routineClassroomId && data[0]) {
      setRoutineClassroomId(data[0].id);
    }
  };

  const reloadCourseRegistrations = async (semesterId?: string) => {
    const data = await DepartmentManagementService.listCourseRegistrations(undefined, semesterId);
    setCourseRegistrations(data);
    if ((!routineCourseRegistrationId || !data.some((item) => item.id === routineCourseRegistrationId)) && data[0]) {
      setRoutineCourseRegistrationId(data[0].id);
    }
  };

  const reloadRoutines = async (search?: string, semesterId?: string) => {
    const data = await DepartmentManagementService.listRoutines(search?.trim() || undefined, semesterId);
    setRoutines(data);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        if (section === "schedules") {
          await Promise.all([reloadSemesters(), reloadSchedules(scheduleSearch, scheduleSemesterId)]);
        }

        if (section === "classrooms") {
          await reloadClassrooms(classroomSearch);
        }

        if (section === "routines") {
          await Promise.all([
            reloadSemesters(),
            reloadSchedules(undefined, routineSemesterId),
            reloadClassrooms(),
            reloadCourseRegistrations(routineSemesterId),
            reloadRoutines(routineSearch, routineSemesterId),
          ]);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load routine workspace";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
    // We intentionally depend on section and search inputs to refresh list views.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    if (section !== "routines" || !routineSemesterId) {
      return;
    }

    setRoutineScheduleId("");
    setRoutineCourseRegistrationId("");

    void Promise.all([
      reloadSchedules(undefined, routineSemesterId),
      reloadCourseRegistrations(routineSemesterId),
      reloadRoutines(routineSearch, routineSemesterId),
    ]);
    // Semester switch should refresh routine-related data immediately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineSemesterId, section]);

  const scheduleStatusOptions = useMemo(
    () => [
      { value: "CLASS_SLOT", label: "Class Slot" },
      { value: "BREAK_SLOT", label: "Break Slot" },
    ],
    [],
  );

  const classroomTypeOptions = useMemo(
    () => [
      "LAB",
      "LECTURE",
      "SEMINAR",
      "LIBRARY",
      "TEACHER_ROOM",
      "STUDENT_LOUNGE",
      "ADMIN_OFFICE",
    ],
    [],
  );

  const routineScheduleOptions = useMemo(
    () =>
      schedules.map((item) => ({
        value: item.id,
        label: `${item.name} (${item.semester?.name ?? "No semester"} • ${formatTimeRange(item.startTime, item.endTime)})`,
      })),
    [schedules],
  );

  const routineClassroomOptions = useMemo(
    () =>
      classrooms.map((item) => ({
        value: item.id,
        label: [item.roomNo, "•", item.floor, item.name ? "(" + item.name + ")" : ""].filter(Boolean).join(" "),
      })),
    [classrooms],
  );

  const routineCourseOptions = useMemo(
    () => buildUniqueRoutineCourseOptions(courseRegistrations),
    [courseRegistrations],
  );

  const onCreateSchedule = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateSchedule) {
      toast.warning("Provide valid class slot details");
      return;
    }

    setCreatingSchedule(true);
    try {
      await DepartmentManagementService.createSchedule({
        name: scheduleName.trim(),
        description: scheduleDescription.trim() || undefined,
        semesterId: scheduleSemesterId,
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        status: scheduleStatus,
      });

      toast.success("Class slot created successfully");
      setScheduleName("");
      setScheduleDescription("");
      setScheduleStartTime("");
      setScheduleEndTime("");
      setScheduleStatus("CLASS_SLOT");
      await reloadSchedules(scheduleSearch, scheduleSemesterId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create class slot";
      toast.error(message);
    } finally {
      setCreatingSchedule(false);
    }
  };

  const startScheduleEdit = (item: DepartmentSchedule) => {
    setEditingScheduleId(item.id);
    setEditingScheduleName(item.name);
    setEditingScheduleDescription(item.description ?? "");
    setEditingScheduleSemesterId(item.semesterId ?? "");
    setEditingScheduleStartTime(item.startTime);
    setEditingScheduleEndTime(item.endTime);
    setEditingScheduleStatus(item.status);
  };

  const resetScheduleEdit = () => {
    setEditingScheduleId("");
    setEditingScheduleName("");
    setEditingScheduleDescription("");
    setEditingScheduleSemesterId("");
    setEditingScheduleStartTime("");
    setEditingScheduleEndTime("");
    setEditingScheduleStatus("CLASS_SLOT");
  };

  const onUpdateSchedule = async (scheduleId: string) => {
    if (editingScheduleName.trim().length < 2) {
      toast.warning("Class slot name must be at least 2 characters");
      return;
    }

    if (!editingScheduleSemesterId) {
      toast.warning("Semester is required for class slot");
      return;
    }

    if (editingScheduleEndTime <= editingScheduleStartTime) {
      toast.warning("End time must be later than start time");
      return;
    }

    setSavingScheduleId(scheduleId);
    try {
      await DepartmentManagementService.updateSchedule(scheduleId, {
        name: editingScheduleName.trim(),
        description: editingScheduleDescription.trim() || undefined,
        semesterId: editingScheduleSemesterId,
        startTime: editingScheduleStartTime,
        endTime: editingScheduleEndTime,
        status: editingScheduleStatus,
      });

      toast.success("Class slot updated successfully");
      resetScheduleEdit();
      await reloadSchedules(scheduleSearch, scheduleSemesterId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update class slot";
      toast.error(message);
    } finally {
      setSavingScheduleId("");
    }
  };

  const onDeleteSchedule = async (scheduleId: string) => {
    setDeletingScheduleId(scheduleId);
    try {
      await DepartmentManagementService.deleteSchedule(scheduleId);
      toast.success("Class slot deleted successfully");
      if (editingScheduleId === scheduleId) {
        resetScheduleEdit();
      }
      await reloadSchedules(scheduleSearch, scheduleSemesterId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete class slot";
      toast.error(message);
    } finally {
      setDeletingScheduleId("");
    }
  };

  const onCreateClassroom = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateClassroom) {
      toast.warning("Provide valid room details");
      return;
    }

    setCreatingClassroom(true);
    try {
      await DepartmentManagementService.createClassroom({
        name: classroomName.trim() || undefined,
        roomNo: classroomRoomNo.trim(),
        floor: classroomFloor.trim(),
        capacity: Number(classroomCapacity),
        roomType: classroomType,
      });

      toast.success("Room created successfully");
      setClassroomName("");
      setClassroomRoomNo("");
      setClassroomFloor("");
      setClassroomCapacity("");
      setClassroomType("LECTURE");
      await reloadClassrooms(classroomSearch);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create room";
      toast.error(message);
    } finally {
      setCreatingClassroom(false);
    }
  };

  const startClassroomEdit = (item: Classroom) => {
    setEditingClassroomId(item.id);
    setEditingClassroomName(item.name ?? "");
    setEditingClassroomRoomNo(item.roomNo);
    setEditingClassroomFloor(item.floor);
    setEditingClassroomCapacity(String(item.capacity));
    setEditingClassroomType(item.roomType);
  };

  const resetClassroomEdit = () => {
    setEditingClassroomId("");
    setEditingClassroomName("");
    setEditingClassroomRoomNo("");
    setEditingClassroomFloor("");
    setEditingClassroomCapacity("");
    setEditingClassroomType("LECTURE");
  };

  const onUpdateClassroom = async (classroomId: string) => {
    if (!editingClassroomRoomNo.trim() || !editingClassroomFloor.trim()) {
      toast.warning("Room number and floor are required");
      return;
    }

    const capacity = Number(editingClassroomCapacity);
    if (!Number.isFinite(capacity) || capacity <= 0) {
      toast.warning("Capacity must be greater than 0");
      return;
    }

    setSavingClassroomId(classroomId);
    try {
      await DepartmentManagementService.updateClassroom(classroomId, {
        name: editingClassroomName.trim() || undefined,
        roomNo: editingClassroomRoomNo.trim(),
        floor: editingClassroomFloor.trim(),
        capacity,
        roomType: editingClassroomType,
      });

      toast.success("Room updated successfully");
      resetClassroomEdit();
      await reloadClassrooms(classroomSearch);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update room";
      toast.error(message);
    } finally {
      setSavingClassroomId("");
    }
  };

  const onDeleteClassroom = async (classroomId: string) => {
    setDeletingClassroomId(classroomId);
    try {
      await DepartmentManagementService.deleteClassroom(classroomId);
      toast.success("Room deleted successfully");
      if (editingClassroomId === classroomId) {
        resetClassroomEdit();
      }
      await reloadClassrooms(classroomSearch);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete room";
      toast.error(message);
    } finally {
      setDeletingClassroomId("");
    }
  };

  const onCreateRoutine = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateRoutine) {
      toast.warning("Provide routine name, class slot, room and course registration");
      return;
    }

    setCreatingRoutine(true);
    try {
      await DepartmentManagementService.createRoutine({
        name: routineName.trim(),
        description: routineDescription.trim() || undefined,
        version: routineVersion.trim() || undefined,
        scheduleId: routineScheduleId,
        classRoomId: routineClassroomId,
        courseRegistrationId: routineCourseRegistrationId,
      });

      toast.success("Routine created successfully");
      setRoutineName("");
      setRoutineDescription("");
      setRoutineVersion("");
      await reloadRoutines(routineSearch, routineSemesterId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create routine";
      toast.error(message);
    } finally {
      setCreatingRoutine(false);
    }
  };

  const startRoutineEdit = (item: DepartmentRoutine) => {
    setEditingRoutineId(item.id);
    setEditingRoutineName(item.name);
    setEditingRoutineDescription(item.description ?? "");
    setEditingRoutineVersion(item.version ?? "");
    setEditingRoutineScheduleId(item.scheduleId);
    setEditingRoutineClassroomId(item.classRoomId);
    setEditingRoutineCourseRegistrationId(item.courseRegistrationId);
  };

  const resetRoutineEdit = () => {
    setEditingRoutineId("");
    setEditingRoutineName("");
    setEditingRoutineDescription("");
    setEditingRoutineVersion("");
    setEditingRoutineScheduleId("");
    setEditingRoutineClassroomId("");
    setEditingRoutineCourseRegistrationId("");
  };

  const onUpdateRoutine = async (routineId: string) => {
    if (editingRoutineName.trim().length < 2) {
      toast.warning("Routine name must be at least 2 characters");
      return;
    }

    if (!editingRoutineScheduleId || !editingRoutineClassroomId || !editingRoutineCourseRegistrationId) {
      toast.warning("Select class slot, room and course registration");
      return;
    }

    setSavingRoutineId(routineId);
    try {
      await DepartmentManagementService.updateRoutine(routineId, {
        name: editingRoutineName.trim(),
        description: editingRoutineDescription.trim() || undefined,
        version: editingRoutineVersion.trim() || undefined,
        scheduleId: editingRoutineScheduleId,
        classRoomId: editingRoutineClassroomId,
        courseRegistrationId: editingRoutineCourseRegistrationId,
      });

      toast.success("Routine updated successfully");
      resetRoutineEdit();
      await reloadRoutines(routineSearch, routineSemesterId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update routine";
      toast.error(message);
    } finally {
      setSavingRoutineId("");
    }
  };

  const onDeleteRoutine = async (routineId: string) => {
    setDeletingRoutineId(routineId);
    try {
      await DepartmentManagementService.deleteRoutine(routineId);
      toast.success("Routine deleted successfully");
      if (editingRoutineId === routineId) {
        resetRoutineEdit();
      }
      await reloadRoutines(routineSearch, routineSemesterId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete routine";
      toast.error(message);
    } finally {
      setDeletingRoutineId("");
    }
  };

  if (loading) {
    return (
      <article className="rounded-xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading workspace...
        </span>
      </article>
    );
  }

  if (section === "schedules") {
    return (
      <div className="space-y-4">
        <article className="rounded-xl border border-border/70 bg-background/70 p-4">
          <h2 className="text-base font-semibold">Create Class Slot</h2>
          <p className="mt-1 text-sm text-muted-foreground">Set start and end times for routine slots.</p>

          <form className="mt-4 space-y-3" onSubmit={onCreateSchedule}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block space-y-1 text-sm" htmlFor="schedule-name">
                <span className="font-medium">Name</span>
                <input
                  id="schedule-name"
                  value={scheduleName}
                  onChange={(event) => setScheduleName(event.target.value)}
                  placeholder="Morning Slot"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
              </label>
              <label className="block space-y-1 text-sm" htmlFor="schedule-semester">
                <span className="font-medium">Semester</span>
                <select
                  id="schedule-semester"
                  value={scheduleSemesterId}
                  onChange={(event) => setScheduleSemesterId(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                >
                  <option value="">Select semester</option>
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block space-y-1 text-sm" htmlFor="schedule-status">
                <span className="font-medium">Slot Type</span>
                <select
                  id="schedule-status"
                  value={scheduleStatus}
                  onChange={(event) => setScheduleStatus(event.target.value as SlotStatus)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                >
                  {scheduleStatusOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-1 text-sm" htmlFor="schedule-description">
              <span className="font-medium">Description (optional)</span>
              <input
                id="schedule-description"
                value={scheduleDescription}
                onChange={(event) => setScheduleDescription(event.target.value)}
                placeholder="Optional slot details"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block space-y-1 text-sm" htmlFor="schedule-start-time">
                <span className="font-medium">Start Time</span>
                <input
                  id="schedule-start-time"
                  type="time"
                  value={scheduleStartTime}
                  onChange={(event) => setScheduleStartTime(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
              </label>
              <label className="block space-y-1 text-sm" htmlFor="schedule-end-time">
                <span className="font-medium">End Time</span>
                <input
                  id="schedule-end-time"
                  type="time"
                  value={scheduleEndTime}
                  onChange={(event) => setScheduleEndTime(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={creatingSchedule || !canCreateSchedule}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingSchedule ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Class Slot
            </button>
          </form>
        </article>

        <article className="rounded-xl border border-border/70 bg-background/70 p-4">
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-base font-semibold">Class Slots</h2>
            <div className="flex w-full gap-2 md:w-auto">
              <select
                value={scheduleSemesterId}
                onChange={(event) => {
                  const nextSemesterId = event.target.value;
                  setScheduleSemesterId(nextSemesterId);
                  void reloadSchedules(scheduleSearch, nextSemesterId);
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring md:w-56"
              >
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
              <input
                value={scheduleSearch}
                onChange={(event) => setScheduleSearch(event.target.value)}
                placeholder="Search slots"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring md:w-64"
              />
              <button
                type="button"
                onClick={() => void reloadSchedules(scheduleSearch, scheduleSemesterId)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium"
              >
                Search
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {schedules.map((item) => {
              const isEditing = editingScheduleId === item.id;
              return (
                <article key={item.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          value={editingScheduleName}
                          onChange={(event) => setEditingScheduleName(event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        />
                        <select
                          value={editingScheduleSemesterId}
                          onChange={(event) => setEditingScheduleSemesterId(event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        >
                          <option value="">Select semester</option>
                          {semesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>
                              {semester.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <select
                          value={editingScheduleStatus}
                          onChange={(event) => setEditingScheduleStatus(event.target.value as SlotStatus)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        >
                          {scheduleStatusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <input
                        value={editingScheduleDescription}
                        onChange={(event) => setEditingScheduleDescription(event.target.value)}
                        placeholder="Description"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                      />

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          type="time"
                          value={editingScheduleStartTime}
                          onChange={(event) => setEditingScheduleStartTime(event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        />
                        <input
                          type="time"
                          value={editingScheduleEndTime}
                          onChange={(event) => setEditingScheduleEndTime(event.target.value)}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={savingScheduleId === item.id}
                          onClick={() => void onUpdateSchedule(item.id)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingScheduleId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={resetScheduleEdit}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Semester: {item.semester?.name ?? "N/A"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeRange(item.startTime, item.endTime)}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.status === "CLASS_SLOT" ? "Class Slot" : "Break Slot"}</p>
                        {item.description ? <p className="mt-1 text-xs text-muted-foreground">{item.description}</p> : null}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startScheduleEdit(item)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingScheduleId === item.id}
                          onClick={() => void onDeleteSchedule(item.id)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingScheduleId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {schedules.length === 0 ? <p className="text-sm text-muted-foreground">No class slots found.</p> : null}
          </div>
        </article>
      </div>
    );
  }

  if (section === "classrooms") {
    return (
      <div className="space-y-4">
        <article className="rounded-xl border border-border/70 bg-background/70 p-4">
          <h2 className="text-base font-semibold">Create Room</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create classrooms that can be assigned to routines.</p>

          <form className="mt-4 space-y-3" onSubmit={onCreateClassroom}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block space-y-1 text-sm" htmlFor="classroom-name">
                <span className="font-medium">Room Name (optional)</span>
                <input
                  id="classroom-name"
                  value={classroomName}
                  onChange={(event) => setClassroomName(event.target.value)}
                  placeholder="Chemistry Lab"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
              </label>

              <label className="block space-y-1 text-sm" htmlFor="classroom-type">
                <span className="font-medium">Room Type</span>
                <select
                  id="classroom-type"
                  value={classroomType}
                  onChange={(event) => setClassroomType(event.target.value as Classroom["roomType"])}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                >
                  {classroomTypeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="block space-y-1 text-sm" htmlFor="classroom-room-no">
                <span className="font-medium">Room No</span>
                <input
                  id="classroom-room-no"
                  value={classroomRoomNo}
                  onChange={(event) => setClassroomRoomNo(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
              </label>

              <label className="block space-y-1 text-sm" htmlFor="classroom-floor">
                <span className="font-medium">Floor</span>
                <input
                  id="classroom-floor"
                  value={classroomFloor}
                  onChange={(event) => setClassroomFloor(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
              </label>

              <label className="block space-y-1 text-sm" htmlFor="classroom-capacity">
                <span className="font-medium">Capacity</span>
                <input
                  id="classroom-capacity"
                  type="number"
                  min={1}
                  value={classroomCapacity}
                  onChange={(event) => setClassroomCapacity(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={creatingClassroom || !canCreateClassroom}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingClassroom ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Room
            </button>
          </form>
        </article>

        <article className="rounded-xl border border-border/70 bg-background/70 p-4">
          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-base font-semibold">Rooms</h2>
            <div className="flex w-full gap-2 md:w-auto">
              <input
                value={classroomSearch}
                onChange={(event) => setClassroomSearch(event.target.value)}
                placeholder="Search rooms"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring md:w-64"
              />
              <button
                type="button"
                onClick={() => void reloadClassrooms(classroomSearch)}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium"
              >
                Search
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {classrooms.map((item) => {
              const isEditing = editingClassroomId === item.id;
              return (
                <article key={item.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                          value={editingClassroomName}
                          onChange={(event) => setEditingClassroomName(event.target.value)}
                          placeholder="Room Name"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        />
                        <select
                          value={editingClassroomType}
                          onChange={(event) => setEditingClassroomType(event.target.value as Classroom["roomType"])}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        >
                          {classroomTypeOptions.map((value) => (
                            <option key={value} value={value}>
                              {value.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <input
                          value={editingClassroomRoomNo}
                          onChange={(event) => setEditingClassroomRoomNo(event.target.value)}
                          placeholder="Room No"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        />
                        <input
                          value={editingClassroomFloor}
                          onChange={(event) => setEditingClassroomFloor(event.target.value)}
                          placeholder="Floor"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        />
                        <input
                          type="number"
                          min={1}
                          value={editingClassroomCapacity}
                          onChange={(event) => setEditingClassroomCapacity(event.target.value)}
                          placeholder="Capacity"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={savingClassroomId === item.id}
                          onClick={() => void onUpdateClassroom(item.id)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingClassroomId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={resetClassroomEdit}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {item.roomNo} • {item.floor}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.name ? `${item.name} • ` : ""}
                          {item.roomType.replaceAll("_", " ")} • Capacity {item.capacity}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startClassroomEdit(item)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingClassroomId === item.id}
                          onClick={() => void onDeleteClassroom(item.id)}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingClassroomId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}

            {classrooms.length === 0 ? <p className="text-sm text-muted-foreground">No rooms found.</p> : null}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <article className="rounded-xl border border-border/70 bg-background/70 p-4">
        <h2 className="text-base font-semibold">Create Routine</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign class slots and rooms to section course registrations.
        </p>

        <form className="mt-4 space-y-3" onSubmit={onCreateRoutine}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block space-y-1 text-sm" htmlFor="routine-name">
              <span className="font-medium">Routine Name</span>
              <input
                id="routine-name"
                value={routineName}
                onChange={(event) => setRoutineName(event.target.value)}
                placeholder="CSE-101 Section A"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              />
            </label>

            <label className="block space-y-1 text-sm" htmlFor="routine-version">
              <span className="font-medium">Version (optional)</span>
              <input
                id="routine-version"
                value={routineVersion}
                onChange={(event) => setRoutineVersion(event.target.value)}
                placeholder="v1"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              />
            </label>

            <label className="block space-y-1 text-sm" htmlFor="routine-semester">
              <span className="font-medium">Semester</span>
              <select
                id="routine-semester"
                value={routineSemesterId}
                onChange={(event) => setRoutineSemesterId(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
              >
                <option value="">Select semester</option>
                {semesters.map((semester) => (
                  <option key={semester.id} value={semester.id}>
                    {semester.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1 text-sm" htmlFor="routine-description">
            <span className="font-medium">Description (optional)</span>
            <input
              id="routine-description"
              value={routineDescription}
              onChange={(event) => setRoutineDescription(event.target.value)}
              placeholder="Additional details"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Class Slot</p>
              <SearchableSelect
                value={routineScheduleId}
                onChange={setRoutineScheduleId}
                options={routineScheduleOptions}
                placeholder="Select slot"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Room</p>
              <SearchableSelect
                value={routineClassroomId}
                onChange={setRoutineClassroomId}
                options={routineClassroomOptions}
                placeholder="Select room"
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Course Registration</p>
              <SearchableSelect
                value={routineCourseRegistrationId}
                onChange={setRoutineCourseRegistrationId}
                options={routineCourseOptions}
                placeholder="Select registration"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={creatingRoutine || !canCreateRoutine}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creatingRoutine ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Routine
          </button>
        </form>
      </article>

      <article className="rounded-xl border border-border/70 bg-background/70 p-4">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-base font-semibold">Routine List</h2>
          <div className="flex w-full gap-2 md:w-auto">
            <select
              value={routineSemesterId}
              onChange={(event) => setRoutineSemesterId(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring md:w-56"
            >
              <option value="">Select semester</option>
              {semesters.map((semester) => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>
            <input
              value={routineSearch}
              onChange={(event) => setRoutineSearch(event.target.value)}
              placeholder="Search by section, teacher, room"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring md:w-72"
            />
            <button
              type="button"
              onClick={() => void reloadRoutines(routineSearch, routineSemesterId)}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium"
            >
              Search
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {routines.map((item) => {
            const isEditing = editingRoutineId === item.id;
            return (
              <article key={item.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input
                        value={editingRoutineName}
                        onChange={(event) => setEditingRoutineName(event.target.value)}
                        placeholder="Routine name"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                      />
                      <input
                        value={editingRoutineVersion}
                        onChange={(event) => setEditingRoutineVersion(event.target.value)}
                        placeholder="Version"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                      />
                    </div>

                    <input
                      value={editingRoutineDescription}
                      onChange={(event) => setEditingRoutineDescription(event.target.value)}
                      placeholder="Description"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Class Slot</p>
                        <SearchableSelect
                          value={editingRoutineScheduleId}
                          onChange={setEditingRoutineScheduleId}
                          options={routineScheduleOptions}
                          placeholder="Select slot"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Room</p>
                        <SearchableSelect
                          value={editingRoutineClassroomId}
                          onChange={setEditingRoutineClassroomId}
                          options={routineClassroomOptions}
                          placeholder="Select room"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Course Registration</p>
                        <SearchableSelect
                          value={editingRoutineCourseRegistrationId}
                          onChange={setEditingRoutineCourseRegistrationId}
                          options={routineCourseOptions}
                          placeholder="Select registration"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={savingRoutineId === item.id}
                        onClick={() => void onUpdateRoutine(item.id)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingRoutineId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={resetRoutineEdit}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.courseRegistration.section.name} • {item.courseRegistration.course.courseCode} • {item.courseRegistration.teacherProfile.teacherInitial}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.schedule.name} ({formatTimeRange(item.schedule.startTime, item.schedule.endTime)})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Room {item.classRoom.roomNo} • {item.classRoom.floor}
                        {item.classRoom.name ? ` • ${item.classRoom.name}` : ""}
                      </p>
                      {item.description ? <p className="mt-1 text-xs text-muted-foreground">{item.description}</p> : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startRoutineEdit(item)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deletingRoutineId === item.id}
                        onClick={() => void onDeleteRoutine(item.id)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingRoutineId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {routines.length === 0 ? <p className="text-sm text-muted-foreground">No routines found.</p> : null}
        </div>
      </article>
    </div>
  );
}
