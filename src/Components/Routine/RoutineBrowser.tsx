"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import SearchableSelect from "@/Components/ui/SearchableSelect";
import type { DepartmentRoutine } from "@/services/Department/departmentManagement.service";
import { RoutineService } from "@/services/Routine/routine.service";

export default function RoutineBrowser() {
  const [loading, setLoading] = useState(false);
  const [routines, setRoutines] = useState<DepartmentRoutine[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [teacherInitial, setTeacherInitial] = useState("");
  const [search, setSearch] = useState("");

  const loadRoutines = async (query?: {
    sectionId?: string;
    semesterId?: string;
    teacherInitial?: string;
    search?: string;
  }) => {
    setLoading(true);
    try {
      const data = await RoutineService.listRoutines(query);
      setRoutines(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load routines";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRoutines();
  }, []);

  const sectionOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const item of routines) {
      map.set(item.courseRegistration.section.id, item.courseRegistration.section.name);
    }

    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [routines]);

  const semesterOptions = useMemo(() => {
    const map = new Map<string, string>();

    for (const item of routines) {
      map.set(item.courseRegistration.semester.id, item.courseRegistration.semester.name);
    }

    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [routines]);

  const onApplyFilters = async () => {
    await loadRoutines({
      sectionId: sectionId || undefined,
      semesterId: semesterId || undefined,
      teacherInitial: teacherInitial || undefined,
      search: search || undefined,
    });
  };

  let routineContent: ReactNode;
  if (loading) {
    routineContent = (
      <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading routines...
      </p>
    );
  } else if (routines.length === 0) {
    routineContent = (
      <p className="text-sm text-muted-foreground">No routines found for the selected filters.</p>
    );
  } else {
    routineContent = (
      <div className="space-y-3">
        {routines.map((item) => (
          <article key={item.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
            <p className="text-sm font-semibold">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.courseRegistration.section.name} • {item.courseRegistration.course.courseCode} • {item.courseRegistration.teacherProfile.teacherInitial}
            </p>
            <p className="text-xs text-muted-foreground">Semester: {item.courseRegistration.semester.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.classRoom.roomNo} ({item.classRoom.floor}) • {item.schedule.startTime} - {item.schedule.endTime}
            </p>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <article className="rounded-xl border border-border/70 bg-background/70 p-4">
        <h2 className="text-base font-semibold">Routine Explorer</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View class routines by semester, section, and teacher initial.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          <SearchableSelect
            value={semesterId}
            onChange={setSemesterId}
            options={semesterOptions}
            placeholder="Select semester"
            searchPlaceholder="Search semester"
            emptyText="No semester found"
          />

          <SearchableSelect
            value={sectionId}
            onChange={setSectionId}
            options={sectionOptions}
            placeholder="Select section"
            searchPlaceholder="Search section"
            emptyText="No section found"
          />

          <input
            value={teacherInitial}
            onChange={(event) => setTeacherInitial(event.target.value)}
            placeholder="Teacher initial"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search routine"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/30 focus:ring"
          />

          <button
            type="button"
            onClick={() => void onApplyFilters()}
            className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      </article>

      <article className="rounded-xl border border-border/70 bg-background/70 p-4">
        {routineContent}
      </article>
    </div>
  );
}
