"use client";

import { Loader2, Megaphone, Pencil, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createStudentAdmissionPost,
  createTeacherJobPost,
  deleteStudentAdmissionPost,
  deleteTeacherJobPost,
  getPostingOptions,
  listManagedStudentPosts,
  listManagedTeacherPosts,
  type ManagedPostingItem,
  type PostingScope,
  updateStudentAdmissionPost,
  updateTeacherJobPost,
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
  const [teacherPosts, setTeacherPosts] = useState<ManagedPostingItem[]>([]);
  const [editingTeacherPostId, setEditingTeacherPostId] = useState("");
  const [editingTeacherTitle, setEditingTeacherTitle] = useState("");
  const [editingTeacherLocation, setEditingTeacherLocation] = useState("");
  const [editingTeacherSummary, setEditingTeacherSummary] = useState("");
  const [editingTeacherDetails, setEditingTeacherDetails] = useState("");
  const [savingTeacherPostId, setSavingTeacherPostId] = useState("");
  const [deletingTeacherPostId, setDeletingTeacherPostId] = useState("");

  const [studentTitle, setStudentTitle] = useState("");
  const [studentLocation, setStudentLocation] = useState("");
  const [studentSummary, setStudentSummary] = useState("");
  const [studentDetails, setStudentDetails] = useState("");
  const [creatingStudentPost, setCreatingStudentPost] = useState(false);
  const [studentPosts, setStudentPosts] = useState<ManagedPostingItem[]>([]);
  const [editingStudentPostId, setEditingStudentPostId] = useState("");
  const [editingStudentTitle, setEditingStudentTitle] = useState("");
  const [editingStudentLocation, setEditingStudentLocation] = useState("");
  const [editingStudentSummary, setEditingStudentSummary] = useState("");
  const [editingStudentDetails, setEditingStudentDetails] = useState("");
  const [savingStudentPostId, setSavingStudentPostId] = useState("");
  const [deletingStudentPostId, setDeletingStudentPostId] = useState("");

  const reloadManagedPosts = async () => {
    const [teacherData, studentData] = await Promise.all([
      listManagedTeacherPosts(),
      listManagedStudentPosts(),
    ]);

    setTeacherPosts(teacherData);
    setStudentPosts(studentData);
  };

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

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [teacherData, studentData] = await Promise.all([
          listManagedTeacherPosts(),
          listManagedStudentPosts(),
        ]);

        if (cancelled) {
          return;
        }

        setTeacherPosts(teacherData);
        setStudentPosts(studentData);
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Failed to load posts";
          toast.error(message);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

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
      await reloadManagedPosts();
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
      await reloadManagedPosts();
      toast.success("Student admission post created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create student admission post";
      toast.error(message);
    } finally {
      setCreatingStudentPost(false);
    }
  };

  const startTeacherPostEdit = (item: ManagedPostingItem) => {
    setEditingTeacherPostId(item.id);
    setEditingTeacherTitle(item.title);
    setEditingTeacherLocation(item.location ?? "");
    setEditingTeacherSummary(item.summary);
    setEditingTeacherDetails(item.details.join("\n"));
  };

  const cancelTeacherPostEdit = () => {
    setEditingTeacherPostId("");
    setEditingTeacherTitle("");
    setEditingTeacherLocation("");
    setEditingTeacherSummary("");
    setEditingTeacherDetails("");
  };

  const saveTeacherPostEdit = async (postingId: string) => {
    if (editingTeacherTitle.trim().length < 2 || editingTeacherSummary.trim().length < 10) {
      toast.warning("Teacher post title and summary are required");
      return;
    }

    setSavingTeacherPostId(postingId);
    try {
      await updateTeacherJobPost(postingId, {
        title: editingTeacherTitle.trim(),
        location: editingTeacherLocation.trim() || undefined,
        summary: editingTeacherSummary.trim(),
        details: splitDetails(editingTeacherDetails),
      });
      await reloadManagedPosts();
      cancelTeacherPostEdit();
      toast.success("Teacher job post updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update teacher job post";
      toast.error(message);
    } finally {
      setSavingTeacherPostId("");
    }
  };

  const onDeleteTeacherPost = async (postingId: string) => {
    setDeletingTeacherPostId(postingId);
    try {
      await deleteTeacherJobPost(postingId);
      await reloadManagedPosts();
      if (editingTeacherPostId === postingId) {
        cancelTeacherPostEdit();
      }
      toast.success("Teacher job post deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete teacher job post";
      toast.error(message);
    } finally {
      setDeletingTeacherPostId("");
    }
  };

  const startStudentPostEdit = (item: ManagedPostingItem) => {
    setEditingStudentPostId(item.id);
    setEditingStudentTitle(item.title);
    setEditingStudentLocation(item.location ?? "");
    setEditingStudentSummary(item.summary);
    setEditingStudentDetails(item.details.join("\n"));
  };

  const cancelStudentPostEdit = () => {
    setEditingStudentPostId("");
    setEditingStudentTitle("");
    setEditingStudentLocation("");
    setEditingStudentSummary("");
    setEditingStudentDetails("");
  };

  const saveStudentPostEdit = async (postingId: string) => {
    if (editingStudentTitle.trim().length < 2 || editingStudentSummary.trim().length < 10) {
      toast.warning("Student post title and summary are required");
      return;
    }

    setSavingStudentPostId(postingId);
    try {
      await updateStudentAdmissionPost(postingId, {
        title: editingStudentTitle.trim(),
        location: editingStudentLocation.trim() || undefined,
        summary: editingStudentSummary.trim(),
        details: splitDetails(editingStudentDetails),
      });
      await reloadManagedPosts();
      cancelStudentPostEdit();
      toast.success("Student admission post updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update student admission post";
      toast.error(message);
    } finally {
      setSavingStudentPostId("");
    }
  };

  const onDeleteStudentPost = async (postingId: string) => {
    setDeletingStudentPostId(postingId);
    try {
      await deleteStudentAdmissionPost(postingId);
      await reloadManagedPosts();
      if (editingStudentPostId === postingId) {
        cancelStudentPostEdit();
      }
      toast.success("Student admission post deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete student admission post";
      toast.error(message);
    } finally {
      setDeletingStudentPostId("");
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

        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-semibold">Existing Teacher Job Posts</h4>
          {teacherPosts.map((item) => {
            const isEditing = editingTeacherPostId === item.id;
            return (
              <article key={item.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={editingTeacherTitle}
                      onChange={(event) => setEditingTeacherTitle(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={editingTeacherLocation}
                      onChange={(event) => setEditingTeacherLocation(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={editingTeacherSummary}
                      onChange={(event) => setEditingTeacherSummary(event.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={editingTeacherDetails}
                      onChange={(event) => setEditingTeacherDetails(event.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void saveTeacherPostEdit(item.id)}
                        disabled={savingTeacherPostId === item.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                      >
                        {savingTeacherPostId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelTeacherPostEdit}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.summary}</p>
                      <p className="text-xs text-muted-foreground">{item.departmentName ?? "Department not set"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startTeacherPostEdit(item)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteTeacherPost(item.id)}
                        disabled={deletingTeacherPostId === item.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive"
                      >
                        {deletingTeacherPostId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          {teacherPosts.length === 0 ? <p className="text-sm text-muted-foreground">No teacher posts found.</p> : null}
        </div>
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

        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-semibold">Existing Student Admission Posts</h4>
          {studentPosts.map((item) => {
            const isEditing = editingStudentPostId === item.id;
            return (
              <article key={item.id} className="rounded-lg border border-border/70 bg-background/60 p-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      value={editingStudentTitle}
                      onChange={(event) => setEditingStudentTitle(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <input
                      value={editingStudentLocation}
                      onChange={(event) => setEditingStudentLocation(event.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={editingStudentSummary}
                      onChange={(event) => setEditingStudentSummary(event.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <textarea
                      value={editingStudentDetails}
                      onChange={(event) => setEditingStudentDetails(event.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void saveStudentPostEdit(item.id)}
                        disabled={savingStudentPostId === item.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                      >
                        {savingStudentPostId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelStudentPostEdit}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.summary}</p>
                      <p className="text-xs text-muted-foreground">{item.departmentName ?? "Department not set"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startStudentPostEdit(item)}
                        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDeleteStudentPost(item.id)}
                        disabled={deletingStudentPostId === item.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 px-3 py-2 text-xs font-medium text-destructive"
                      >
                        {deletingStudentPostId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          {studentPosts.length === 0 ? <p className="text-sm text-muted-foreground">No student posts found.</p> : null}
        </div>
      </article>
    </div>
  );
}
