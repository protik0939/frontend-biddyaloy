"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  DepartmentManagementService,
  type AccountStatus,
  type Course,
  type CourseRegistration,
  type Section,
  type Semester,
  type Student,
  type Teacher,
} from "@/services/Department/departmentManagement.service";
import PostingManagementPanel from "@/Components/PostingManagement/PostingManagementPanel";

import { type DepartmentSection } from "./departmentSections";

interface DepartmentSectionContentProps {
  section: DepartmentSection;
}

const formatDateDDMMYYYY = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const STATUS_OPTIONS: AccountStatus[] = ["PENDING", "ACTIVE", "DEACTIVATED", "BANNED"];

export default function DepartmentSectionContent({
  section,
}: Readonly<DepartmentSectionContentProps>) {
  const [loadingPageData, setLoadingPageData] = useState(false);

  const [profileFullName, setProfileFullName] = useState("");
  const [profileShortName, setProfileShortName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semesterName, setSemesterName] = useState("");
  const [semesterStartDate, setSemesterStartDate] = useState("");
  const [semesterEndDate, setSemesterEndDate] = useState("");
  const [creatingSemester, setCreatingSemester] = useState(false);

  const [sections, setSections] = useState<Section[]>([]);
  const [sectionName, setSectionName] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [sectionSemesterId, setSectionSemesterId] = useState("");
  const [sectionCapacity, setSectionCapacity] = useState("");
  const [creatingSection, setCreatingSection] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCredits, setCourseCredits] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState("");
  const [editingCourseCode, setEditingCourseCode] = useState("");
  const [editingCourseTitle, setEditingCourseTitle] = useState("");
  const [editingCourseDescription, setEditingCourseDescription] = useState("");
  const [editingCourseCredits, setEditingCourseCredits] = useState("");
  const [updatingCourseId, setUpdatingCourseId] = useState("");
  const [deletingCourseId, setDeletingCourseId] = useState("");

  const [courseRegistrations, setCourseRegistrations] = useState<CourseRegistration[]>([]);
  const [registrationSemesterId, setRegistrationSemesterId] = useState("");
  const [registrationSectionId, setRegistrationSectionId] = useState("");
  const [registrationCourseId, setRegistrationCourseId] = useState("");
  const [registrationTeacherProfileId, setRegistrationTeacherProfileId] = useState("");
  const [registrationStudentProfileId, setRegistrationStudentProfileId] = useState("");
  const [creatingRegistration, setCreatingRegistration] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherName, setTeacherName] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherInitial, setTeacherInitial] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teacherDesignation, setTeacherDesignation] = useState("");
  const [creatingTeacher, setCreatingTeacher] = useState(false);
  const [updatingTeacherId, setUpdatingTeacherId] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentInitial, setStudentInitial] = useState("");
  const [studentId, setStudentId] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState("");

  const canCreateSemester =
    semesterName.trim().length >= 2 &&
    Boolean(semesterStartDate) &&
    Boolean(semesterEndDate);

  const canCreateSection = useMemo(() => {
    return sectionName.trim().length >= 1 && sectionSemesterId.trim().length > 0;
  }, [sectionName, sectionSemesterId]);

  const canCreateCourse = useMemo(() => {
    if (courseCode.trim().length < 2 || courseTitle.trim().length < 2) {
      return false;
    }

    if (!courseCredits.trim()) {
      return true;
    }

    const numericCredits = Number(courseCredits);
    return Number.isInteger(numericCredits) && numericCredits > 0 && numericCredits <= 500;
  }, [courseCode, courseCredits, courseTitle]);

  const canCreateTeacher = useMemo(() => {
    return (
      teacherName.trim().length >= 2 &&
      teacherEmail.includes("@") &&
      teacherPassword.length >= 8 &&
      teacherInitial.trim().length >= 2 &&
      teacherId.trim().length >= 2 &&
      teacherDesignation.trim().length >= 2
    );
  }, [
    teacherDesignation,
    teacherEmail,
    teacherId,
    teacherInitial,
    teacherName,
    teacherPassword,
  ]);

  const canCreateStudent = useMemo(() => {
    return (
      studentName.trim().length >= 2 &&
      studentEmail.includes("@") &&
      studentPassword.length >= 8 &&
      studentInitial.trim().length >= 2 &&
      studentId.trim().length >= 2
    );
  }, [studentEmail, studentId, studentInitial, studentName, studentPassword]);

  const filteredSectionsForRegistration = useMemo(() => {
    if (!registrationSemesterId) {
      return sections;
    }

    return sections.filter((item) => item.semesterId === registrationSemesterId);
  }, [registrationSemesterId, sections]);

  const canCreateCourseRegistration = useMemo(() => {
    return (
      Boolean(registrationSemesterId) &&
      Boolean(registrationSectionId) &&
      Boolean(registrationCourseId) &&
      Boolean(registrationTeacherProfileId) &&
      Boolean(registrationStudentProfileId)
    );
  }, [
    registrationCourseId,
    registrationSectionId,
    registrationSemesterId,
    registrationStudentProfileId,
    registrationTeacherProfileId,
  ]);

  const reloadSemesters = async () => {
    const data = await DepartmentManagementService.listSemesters();
    setSemesters(data);
    if (!sectionSemesterId && data.length > 0) {
      setSectionSemesterId(data[0].id);
    }
    if (!registrationSemesterId && data.length > 0) {
      setRegistrationSemesterId(data[0].id);
    }
  };

  const reloadSections = async () => {
    const data = await DepartmentManagementService.listSections();
    setSections(data);
  };

  const reloadCourses = async () => {
    const data = await DepartmentManagementService.listCourses();
    setCourses(data);
  };

  const reloadCourseRegistrations = async () => {
    const data = await DepartmentManagementService.listCourseRegistrations();
    setCourseRegistrations(data);
  };

  const reloadTeachers = async () => {
    const data = await DepartmentManagementService.listTeachers();
    setTeachers(data);
  };

  const reloadStudents = async () => {
    const data = await DepartmentManagementService.listStudents();
    setStudents(data);
  };

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      if (section === "overview") {
        return;
      }

      setLoadingPageData(true);
      try {
        if (section === "profile") {
          const profile = await DepartmentManagementService.getProfile();
          if (cancelled) {
            return;
          }

          setProfileFullName(profile.fullName ?? "");
          setProfileShortName(profile.shortName ?? "");
          setProfileDescription(profile.description ?? "");
        }

        if (section === "semesters") {
          await reloadSemesters();
        }

        if (section === "sections") {
          await Promise.all([reloadSemesters(), reloadSections()]);
        }

        if (section === "courses") {
          await reloadCourses();
        }

        if (section === "teachers") {
          await reloadTeachers();
        }

        if (section === "students") {
          await reloadStudents();
        }

        if (section === "courseRegistrations") {
          await Promise.all([
            reloadSemesters(),
            reloadSections(),
            reloadCourses(),
            reloadTeachers(),
            reloadStudents(),
            reloadCourseRegistrations(),
          ]);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message = error instanceof Error ? error.message : "Failed to load page data";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setLoadingPageData(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
    // We intentionally reload when section changes; reload helpers are local wrappers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  useEffect(() => {
    if (!registrationTeacherProfileId && teachers.length > 0) {
      setRegistrationTeacherProfileId(teachers[0].id);
    }
  }, [registrationTeacherProfileId, teachers]);

  useEffect(() => {
    if (!registrationStudentProfileId && students.length > 0) {
      setRegistrationStudentProfileId(students[0].id);
    }
  }, [registrationStudentProfileId, students]);

  useEffect(() => {
    if (filteredSectionsForRegistration.length === 0) {
      if (registrationSectionId) {
        setRegistrationSectionId("");
      }
      return;
    }

    const selectedExists = filteredSectionsForRegistration.some(
      (item) => item.id === registrationSectionId,
    );
    if (!selectedExists) {
      setRegistrationSectionId(filteredSectionsForRegistration[0].id);
    }
  }, [filteredSectionsForRegistration, registrationSectionId]);

  useEffect(() => {
    if (courses.length === 0) {
      if (registrationCourseId) {
        setRegistrationCourseId("");
      }
      return;
    }

    const selectedExists = courses.some((item) => item.id === registrationCourseId);
    if (!selectedExists) {
      setRegistrationCourseId(courses[0].id);
    }
  }, [courses, registrationCourseId]);

  const onUpdateProfile = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (profileFullName.trim().length < 2) {
      toast.warning("Department full name is required");
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await DepartmentManagementService.updateProfile({
        fullName: profileFullName.trim(),
        shortName: profileShortName.trim() || undefined,
        description: profileDescription.trim() || undefined,
      });

      setProfileFullName(updated.fullName ?? "");
      setProfileShortName(updated.shortName ?? "");
      setProfileDescription(updated.description ?? "");
      toast.success("Department profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update department profile";
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const onCreateSemester = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateSemester) {
      toast.warning("Provide semester name, start date and end date");
      return;
    }

    setCreatingSemester(true);
    try {
      await DepartmentManagementService.createSemester({
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

  const onCreateSection = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!sectionName.trim()) {
      toast.warning("Provide section name");
      return;
    }

    if (!sectionSemesterId.trim()) {
      toast.warning("Select a semester");
      return;
    }

    setCreatingSection(true);
    try {
      await DepartmentManagementService.createSection({
        name: sectionName.trim(),
        semesterId: sectionSemesterId,
        description: sectionDescription.trim() || undefined,
        sectionCapacity: sectionCapacity.trim() ? Number(sectionCapacity) : undefined,
      });

      setSectionName("");
      setSectionDescription("");
      setSectionCapacity("");
      await reloadSections();
      toast.success("Section created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create section";
      toast.error(message);
    } finally {
      setCreatingSection(false);
    }
  };

  const onCreateCourse = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateCourse) {
      toast.warning("Provide valid course code, title and optional credits");
      return;
    }

    setCreatingCourse(true);
    try {
      await DepartmentManagementService.createCourse({
        courseCode: courseCode.trim(),
        courseTitle: courseTitle.trim(),
        credits: courseCredits.trim() ? Number(courseCredits) : undefined,
        description: courseDescription.trim() || undefined,
      });

      setCourseCode("");
      setCourseTitle("");
      setCourseDescription("");
      setCourseCredits("");
      await reloadCourses();
      toast.success("Course created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create course";
      toast.error(message);
    } finally {
      setCreatingCourse(false);
    }
  };

  const onStartCourseEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setEditingCourseCode(course.courseCode);
    setEditingCourseTitle(course.courseTitle);
    setEditingCourseDescription(course.description ?? "");
    setEditingCourseCredits(course.credits?.toString() ?? "");
  };

  const onCancelCourseEdit = () => {
    setEditingCourseId("");
    setEditingCourseCode("");
    setEditingCourseTitle("");
    setEditingCourseDescription("");
    setEditingCourseCredits("");
  };

  const onUpdateCourse = async (courseId: string) => {
    if (editingCourseCode.trim().length < 2 || editingCourseTitle.trim().length < 2) {
      toast.warning("Course code and title are required");
      return;
    }

    if (editingCourseCredits.trim()) {
      const numericCredits = Number(editingCourseCredits);
      if (!Number.isInteger(numericCredits) || numericCredits <= 0 || numericCredits > 500) {
        toast.warning("Credits must be an integer between 1 and 500");
        return;
      }
    }

    setUpdatingCourseId(courseId);
    try {
      await DepartmentManagementService.updateCourse(courseId, {
        courseCode: editingCourseCode.trim(),
        courseTitle: editingCourseTitle.trim(),
        credits: editingCourseCredits.trim() ? Number(editingCourseCredits) : undefined,
        description: editingCourseDescription.trim() || undefined,
      });
      await reloadCourses();
      onCancelCourseEdit();
      toast.success("Course updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update course";
      toast.error(message);
    } finally {
      setUpdatingCourseId("");
    }
  };

  const onDeleteCourse = async (courseId: string) => {
    setDeletingCourseId(courseId);
    try {
      await DepartmentManagementService.deleteCourse(courseId);
      await reloadCourses();
      if (editingCourseId === courseId) {
        onCancelCourseEdit();
      }
      toast.success("Course deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete course";
      toast.error(message);
    } finally {
      setDeletingCourseId("");
    }
  };

  const onCreateTeacher = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateTeacher) {
      toast.warning("Provide complete teacher account details");
      return;
    }

    setCreatingTeacher(true);
    try {
      await DepartmentManagementService.createTeacher({
        name: teacherName.trim(),
        email: teacherEmail.trim(),
        password: teacherPassword,
        teacherInitial: teacherInitial.trim(),
        teachersId: teacherId.trim(),
        designation: teacherDesignation.trim(),
      });

      setTeacherName("");
      setTeacherEmail("");
      setTeacherPassword("");
      setTeacherInitial("");
      setTeacherId("");
      setTeacherDesignation("");
      await reloadTeachers();
      toast.success("Teacher account created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create teacher";
      toast.error(message);
    } finally {
      setCreatingTeacher(false);
    }
  };

  const updateTeacherStatus = async (teacherProfileId: string, nextStatus: AccountStatus) => {
    setUpdatingTeacherId(teacherProfileId);
    try {
      await DepartmentManagementService.updateTeacherStatus(teacherProfileId, nextStatus);
      await reloadTeachers();
      toast.success(`Teacher status updated to ${nextStatus}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update teacher status";
      toast.error(message);
    } finally {
      setUpdatingTeacherId("");
    }
  };

  const onCreateStudent = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateStudent) {
      toast.warning("Provide complete student account details");
      return;
    }

    setCreatingStudent(true);
    try {
      await DepartmentManagementService.createStudent({
        name: studentName.trim(),
        email: studentEmail.trim(),
        password: studentPassword,
        studentInitial: studentInitial.trim(),
        studentsId: studentId.trim(),
      });

      setStudentName("");
      setStudentEmail("");
      setStudentPassword("");
      setStudentInitial("");
      setStudentId("");
      await reloadStudents();
      toast.success("Student account created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create student";
      toast.error(message);
    } finally {
      setCreatingStudent(false);
    }
  };

  const updateStudentStatus = async (studentProfileId: string, nextStatus: AccountStatus) => {
    setUpdatingStudentId(studentProfileId);
    try {
      await DepartmentManagementService.updateStudentStatus(studentProfileId, nextStatus);
      await reloadStudents();
      toast.success(`Student status updated to ${nextStatus}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update student status";
      toast.error(message);
    } finally {
      setUpdatingStudentId("");
    }
  };

  const onCreateCourseRegistration = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateCourseRegistration) {
      toast.warning("Select semester, section, program, course, teacher and student");
      return;
    }

    setCreatingRegistration(true);
    try {
      await DepartmentManagementService.createCourseRegistration({
        courseId: registrationCourseId,
        studentProfileId: registrationStudentProfileId,
        teacherProfileId: registrationTeacherProfileId,
        sectionId: registrationSectionId,
        semesterId: registrationSemesterId,
      });

      await reloadCourseRegistrations();
      toast.success("Course registration created successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create course registration";
      toast.error(message);
    } finally {
      setCreatingRegistration(false);
    }
  };

  const formatSeasonYear = (item: { name: string; startDate: string; endDate: string }) => {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);

    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    if (startYear === endYear) {
      return `${item.name} ${startYear}`;
    } else {
      return `${item.name} ${startYear}-${String(endYear).slice(-2)}`;
    }
  };

  if (section === "overview") {
    return null;
  }

  const loadingIndicator = loadingPageData ? (
    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading data...
    </div>
  ) : null;

  if (section === "profile") {
    return (
      <article className="rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Department Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update department name and display metadata.
        </p>

        <form className="mt-4 space-y-4" onSubmit={onUpdateProfile}>
          {loadingIndicator}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="department-full-name">
                Full Name
              </label>
              <input
                id="department-full-name"
                value={profileFullName}
                onChange={(event) => setProfileFullName(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="department-short-name">
                Short Name
              </label>
              <input
                id="department-short-name"
                value={profileShortName}
                onChange={(event) => setProfileShortName(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="department-description">
              Description
            </label>
            <textarea
              id="department-description"
              rows={4}
              value={profileDescription}
              onChange={(event) => setProfileDescription(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      </article>
    );
  }

  if (section === "semesters") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Semester Management</h2>
        {loadingIndicator}

        <form className="grid grid-cols-1 gap-3 md:grid-cols-4" onSubmit={onCreateSemester}>
          <input
            value={semesterName}
            onChange={(event) => setSemesterName(event.target.value)}
            placeholder="Semester name"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={semesterStartDate}
            onChange={(event) => setSemesterStartDate(event.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={semesterEndDate}
            onChange={(event) => setSemesterEndDate(event.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={creatingSemester}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {creatingSemester ? "Creating..." : "Create Semester"}
          </button>
        </form>

        <div className="space-y-2">
          {semesters.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
              <p className="font-medium">{item.name}</p>
              <p className="text-muted-foreground">
                {formatDateDDMMYYYY(item.startDate)} - {formatDateDDMMYYYY(item.endDate)}
              </p>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section === "sections") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Section Management</h2>
        {loadingIndicator}

        <form className="space-y-3" onSubmit={onCreateSection}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={sectionName}
              onChange={(event) => setSectionName(event.target.value)}
              placeholder="Section name"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={sectionSemesterId}
              onChange={(event) => setSectionSemesterId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select semester</option>
              {semesters.map((item) => (
                <option key={item.id} value={item.id}>
                  {formatSeasonYear(item)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={sectionCapacity}
              onChange={(event) => setSectionCapacity(event.target.value)}
              placeholder="Capacity (optional)"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={sectionDescription}
              onChange={(event) => setSectionDescription(event.target.value)}
              placeholder="Description (optional)"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={creatingSection || !canCreateSection}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {creatingSection ? "Creating..." : "Create Section"}
          </button>
        </form>

        <div className="space-y-2">
          {sections.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
              <p className="font-medium">{item.name}</p>
              <p className="text-muted-foreground">
                Semester: {item.semester?.name ?? "-"} | Capacity: {item.sectionCapacity ?? "-"}
              </p>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section === "courses") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Course Management</h2>
        {loadingIndicator}

        <form className="space-y-3" onSubmit={onCreateCourse}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={courseCode}
              onChange={(event) => setCourseCode(event.target.value)}
              placeholder="Course code"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={courseTitle}
              onChange={(event) => setCourseTitle(event.target.value)}
              placeholder="Course title"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="number"
              min={1}
              max={500}
              value={courseCredits}
              onChange={(event) => setCourseCredits(event.target.value)}
              placeholder="Course credit (optional)"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <input
            value={courseDescription}
            onChange={(event) => setCourseDescription(event.target.value)}
            placeholder="Description (optional)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={creatingCourse}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {creatingCourse ? "Creating..." : "Create Course"}
          </button>
        </form>

        <div className="space-y-2">
          {courses.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
              {editingCourseId === item.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input
                      value={editingCourseCode}
                      onChange={(event) => setEditingCourseCode(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                      placeholder="Course code"
                    />
                    <input
                      value={editingCourseTitle}
                      onChange={(event) => setEditingCourseTitle(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                      placeholder="Course title"
                    />
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={editingCourseCredits}
                      onChange={(event) => setEditingCourseCredits(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                      placeholder="Credits"
                    />
                  </div>
                  <input
                    value={editingCourseDescription}
                    onChange={(event) => setEditingCourseDescription(event.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-2 py-1"
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onUpdateCourse(item.id)}
                      disabled={updatingCourseId === item.id}
                      className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {updatingCourseId === item.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelCourseEdit}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium">
                    {item.courseCode} - {item.courseTitle}
                  </p>
                  <p className="text-muted-foreground">
                    Credits: {item.credits ?? "-"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onStartCourseEdit(item)}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDeleteCourse(item.id)}
                      disabled={deletingCourseId === item.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 disabled:opacity-60"
                    >
                      {deletingCourseId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section === "courseRegistrations") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Course Registration</h2>
        <p className="text-sm text-muted-foreground">
          Register a student into a course for a semester and section using linked academic data.
        </p>
        {loadingIndicator}

        <form className="space-y-3" onSubmit={onCreateCourseRegistration}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <select
              value={registrationSemesterId}
              onChange={(event) => setRegistrationSemesterId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select semester</option>
              {semesters.map((item) => (
                <option key={item.id} value={item.id}>
                  {formatSeasonYear(item)}
                </option>
              ))}
            </select>

            <select
              value={registrationSectionId}
              onChange={(event) => setRegistrationSectionId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select section</option>
              {filteredSectionsForRegistration.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={registrationCourseId}
              onChange={(event) => setRegistrationCourseId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select course</option>
              {courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.courseCode} - {item.courseTitle}
                </option>
              ))}
            </select>

            <select
              value={registrationTeacherProfileId}
              onChange={(event) => setRegistrationTeacherProfileId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select teacher</option>
              {teachers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.user.name} ({item.teacherInitial})
                </option>
              ))}
            </select>

            <select
              value={registrationStudentProfileId}
              onChange={(event) => setRegistrationStudentProfileId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select student</option>
              {students.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.user.name} ({item.studentsId})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={creatingRegistration || !canCreateCourseRegistration}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {creatingRegistration ? "Registering..." : "Register Course"}
          </button>
        </form>

        <div className="space-y-2">
          {courseRegistrations.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
              <p className="font-medium">
                {item.course.courseCode} - {item.course.courseTitle}
              </p>
              <p className="text-muted-foreground">
                Student: {item.studentProfile.user.name} ({item.studentProfile.studentsId}) | Teacher: {" "}
                {item.teacherProfile.user.name} ({item.teacherProfile.teacherInitial})
              </p>
              <p className="text-muted-foreground">
                Program: {item.program.title} | Section: {item.section.name} | Semester:{" "}
                {formatSeasonYear(item.semester)}
              </p>
              <p className="text-muted-foreground">
                Registered: {formatDateDDMMYYYY(item.registrationDate)}
              </p>
            </div>
          ))}
          {courseRegistrations.length === 0 && !loadingPageData ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              No course registrations found.
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  if (section === "teachers") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Teacher Management</h2>
        {loadingIndicator}

        <form className="space-y-3" onSubmit={onCreateTeacher}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={teacherName}
              onChange={(event) => setTeacherName(event.target.value)}
              placeholder="Full name"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="email"
              value={teacherEmail}
              onChange={(event) => setTeacherEmail(event.target.value)}
              placeholder="Email"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={teacherPassword}
              onChange={(event) => setTeacherPassword(event.target.value)}
              placeholder="Password"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={teacherInitial}
              onChange={(event) => setTeacherInitial(event.target.value)}
              placeholder="Teacher initial"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={teacherId}
              onChange={(event) => setTeacherId(event.target.value)}
              placeholder="Teacher ID"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={teacherDesignation}
              onChange={(event) => setTeacherDesignation(event.target.value)}
              placeholder="Designation"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={creatingTeacher}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {creatingTeacher ? "Creating..." : "Create Teacher"}
          </button>
        </form>

        <div className="space-y-2">
          {teachers.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
              <p className="font-medium">{item.user.name}</p>
              <p className="text-muted-foreground">
                {item.user.email} | {item.designation} | Status: {item.user.accountStatus}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => void updateTeacherStatus(item.id, status)}
                    disabled={updatingTeacherId === item.id}
                    className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium disabled:opacity-60"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section === "posts") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Posting Management</h2>
        <p className="text-sm text-muted-foreground">
          Create teacher job and student admission posts for your department.
        </p>
        <PostingManagementPanel scope="DEPARTMENT" />
      </article>
    );
  }

  if (section !== "students") {
    return null;
  }

  return (
    <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Student Management</h2>
      {loadingIndicator}

      <form className="space-y-3" onSubmit={onCreateStudent}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            placeholder="Full name"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={studentEmail}
            onChange={(event) => setStudentEmail(event.target.value)}
            placeholder="Email"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={studentPassword}
            onChange={(event) => setStudentPassword(event.target.value)}
            placeholder="Password"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={studentInitial}
            onChange={(event) => setStudentInitial(event.target.value)}
            placeholder="Student initial"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            placeholder="Student ID"
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={creatingStudent}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {creatingStudent ? "Creating..." : "Create Student"}
        </button>
      </form>

      <div className="space-y-2">
        {students.map((item) => (
          <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
            <p className="font-medium">{item.user.name}</p>
            <p className="text-muted-foreground">
              {item.user.email} | Status: {item.user.accountStatus}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => void updateStudentStatus(item.id, status)}
                  disabled={updatingStudentId === item.id}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium disabled:opacity-60"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
