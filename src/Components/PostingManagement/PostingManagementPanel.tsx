"use client";

import { Loader2, Megaphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createStudentAdmissionPost,
  createTeacherJobPost,
  getPostingOptions,
  type PostingScope,
} from "@/services/Posting/postingManagement.service";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import SearchableSelect from "@/Components/ui/SearchableSelect";

type Props = Readonly<{
  scope: PostingScope;
}>;

function splitDetails(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function PostingManagementPanel({ scope }: Props) {
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [facultyId, setFacultyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [facultySearch, setFacultySearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const debouncedFacultySearch = useDebouncedValue(facultySearch, 1000);
  const debouncedDepartmentSearch = useDebouncedValue(departmentSearch, 1000);

  const [faculties, setFaculties] = useState<Array<{ id: string; fullName: string }>>([]);
  const [departments, setDepartments] = useState<
    Array<{ id: string; fullName: string; facultyId: string | null }>
  >([]);

  const [teacherTitle, setTeacherTitle] = useState("");
  const [teacherLocation, setTeacherLocation] = useState("");
  const [teacherSummary, setTeacherSummary] = useState("");
  const [teacherDetails, setTeacherDetails] = useState("");
  const [creatingTeacherPost, setCreatingTeacherPost] = useState(false);

  const [studentTitle, setStudentTitle] = useState("");
  const [studentLocation, setStudentLocation] = useState("");
  const [studentSummary, setStudentSummary] = useState("");
  const [studentDetails, setStudentDetails] = useState("");
  const [creatingStudentPost, setCreatingStudentPost] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const options = await getPostingOptions(
          [debouncedFacultySearch, debouncedDepartmentSearch].filter(Boolean).join(" "),
        );
        if (cancelled) {
          return;
        }

        setFaculties(options.faculties);
        setDepartments(options.departments);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load posting options";
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [debouncedDepartmentSearch, debouncedFacultySearch]);

  const filteredDepartments = useMemo(() => {
    if (scope !== "INSTITUTION") {
      return departments;
    }

    if (!facultyId) {
      return [];
    }

    return departments.filter((item) => item.facultyId === facultyId);
  }, [departments, facultyId, scope]);

  useEffect(() => {
    if (scope === "INSTITUTION") {
      if (!facultyId && faculties.length > 0) {
        setFacultyId(faculties[0].id);
      }
      return;
    }

    setFacultyId("");
  }, [faculties, facultyId, scope]);

  useEffect(() => {
    if (scope === "DEPARTMENT") {
      return;
    }

    if (!departmentId && filteredDepartments.length > 0) {
      setDepartmentId(filteredDepartments[0].id);
    }
  }, [departmentId, filteredDepartments, scope]);

  useEffect(() => {
    if (scope === "INSTITUTION" && departmentId) {
      const exists = filteredDepartments.some((item) => item.id === departmentId);
      if (!exists) {
        setDepartmentId(filteredDepartments[0]?.id ?? "");
      }
    }
  }, [departmentId, filteredDepartments, scope]);

  const hasHierarchySelection = useMemo(() => {
    if (scope === "INSTITUTION") {
      return Boolean(facultyId && departmentId);
    }

    if (scope === "FACULTY") {
      return Boolean(departmentId);
    }

    return true;
  }, [departmentId, facultyId, scope]);

  const canCreateTeacherPost =
    teacherTitle.trim().length >= 2 && teacherSummary.trim().length >= 10 && hasHierarchySelection;

  const canCreateStudentPost =
    studentTitle.trim().length >= 2 && studentSummary.trim().length >= 10 && hasHierarchySelection;

  const buildScopePayload = () => {
    if (scope === "INSTITUTION") {
      return {
        facultyId,
        departmentId,
      };
    }

    if (scope === "FACULTY") {
      return {
        departmentId,
      };
    }

    return {};
  };

  const onCreateTeacherPost = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateTeacherPost) {
      toast.warning("Fill all required teacher job post fields");
      return;
    }

    setCreatingTeacherPost(true);
    try {
      await createTeacherJobPost({
        ...buildScopePayload(),
        title: teacherTitle.trim(),
        location: teacherLocation.trim() || undefined,
        summary: teacherSummary.trim(),
        details: splitDetails(teacherDetails),
      });

      setTeacherTitle("");
      setTeacherLocation("");
      setTeacherSummary("");
      setTeacherDetails("");
      toast.success("Teacher job post created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create teacher job post";
      toast.error(message);
    } finally {
      setCreatingTeacherPost(false);
    }
  };

  const onCreateStudentPost = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateStudentPost) {
      toast.warning("Fill all required student admission post fields");
      return;
    }

    setCreatingStudentPost(true);
    try {
      await createStudentAdmissionPost({
        ...buildScopePayload(),
        title: studentTitle.trim(),
        location: studentLocation.trim() || undefined,
        summary: studentSummary.trim(),
        details: splitDetails(studentDetails),
      });

      setStudentTitle("");
      setStudentLocation("");
      setStudentSummary("");
      setStudentDetails("");
      toast.success("Student admission post created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create student admission post";
      toast.error(message);
    } finally {
      setCreatingStudentPost(false);
    }
  };

  return (
    <div className="space-y-4">
      <article className="rounded-xl border border-border/70 bg-background/70 p-4">
        <h3 className="text-base font-semibold">Posting Scope</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose faculty and department scope for this posting.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {scope === "INSTITUTION" && (
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Faculty</span>
              <SearchableSelect
                value={facultyId}
                onChange={setFacultyId}
                options={faculties.map((item) => ({ value: item.id, label: item.fullName }))}
                placeholder={loadingOptions ? "Loading..." : "Select faculty"}
                searchPlaceholder="Search faculty..."
                emptyText="No faculty found"
                searchValue={facultySearch}
                onSearchValueChange={setFacultySearch}
                disabled={loadingOptions || faculties.length === 0}
              />
            </label>
          )}

          {scope !== "DEPARTMENT" && (
            <label className="block space-y-1 text-sm">
              <span className="font-medium">Department</span>
              <SearchableSelect
                value={departmentId}
                onChange={setDepartmentId}
                options={filteredDepartments.map((item) => ({ value: item.id, label: item.fullName }))}
                placeholder={loadingOptions ? "Loading..." : "Select department"}
                searchPlaceholder="Search department..."
                emptyText="No department found"
                searchValue={departmentSearch}
                onSearchValueChange={setDepartmentSearch}
                disabled={loadingOptions || filteredDepartments.length === 0}
              />
            </label>
          )}

        </div>
      </article>

      <article className="rounded-xl border border-border/70 bg-background/70 p-4">
        <h3 className="text-base font-semibold">Teacher Job Post</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish a hiring post for teachers.
        </p>

        <form className="mt-4 space-y-3" onSubmit={onCreateTeacherPost}>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Post Title</span>
            <input
              value={teacherTitle}
              onChange={(event) => setTeacherTitle(event.target.value)}
              placeholder="Senior Mathematics Teacher"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Location (optional)</span>
            <input
              value={teacherLocation}
              onChange={(event) => setTeacherLocation(event.target.value)}
              placeholder="Dhaka, Bangladesh"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Summary</span>
            <textarea
              value={teacherSummary}
              onChange={(event) => setTeacherSummary(event.target.value)}
              rows={3}
              placeholder="Short summary for applicants"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Details (one line per point)</span>
            <textarea
              value={teacherDetails}
              onChange={(event) => setTeacherDetails(event.target.value)}
              rows={4}
              placeholder={"Full-time role\n5+ years experience\nStrong communication"}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <button
            type="submit"
            disabled={creatingTeacherPost || !canCreateTeacherPost}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creatingTeacherPost ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
            Post Teacher Job
          </button>
        </form>
      </article>

      <article className="rounded-xl border border-border/70 bg-background/70 p-4">
        <h3 className="text-base font-semibold">Student Admission Post</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish an admission opening for students.
        </p>

        <form className="mt-4 space-y-3" onSubmit={onCreateStudentPost}>
          <label className="block space-y-1 text-sm">
            <span className="font-medium">Post Title</span>
            <input
              value={studentTitle}
              onChange={(event) => setStudentTitle(event.target.value)}
              placeholder="BSc in CSE Admission Open"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Location (optional)</span>
            <input
              value={studentLocation}
              onChange={(event) => setStudentLocation(event.target.value)}
              placeholder="Chattogram, Bangladesh"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Summary</span>
            <textarea
              value={studentSummary}
              onChange={(event) => setStudentSummary(event.target.value)}
              rows={3}
              placeholder="Short admission summary"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <label className="block space-y-1 text-sm">
            <span className="font-medium">Details (one line per point)</span>
            <textarea
              value={studentDetails}
              onChange={(event) => setStudentDetails(event.target.value)}
              rows={4}
              placeholder={"Entrance exam required\nScholarship available\nApply before deadline"}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 outline-none ring-primary/30 focus:ring"
            />
          </label>

          <button
            type="submit"
            disabled={creatingStudentPost || !canCreateStudentPost}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creatingStudentPost ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
            Post Student Admission
          </button>
        </form>
      </article>
    </div>
  );
}
