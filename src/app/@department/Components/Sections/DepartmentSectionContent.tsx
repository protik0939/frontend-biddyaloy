"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import {
  type DepartmentTeacherJobApplication,
  type DepartmentStudentAdmissionApplication,
  type Batch,
  DepartmentManagementService,
  type AccountStatus,
  type Course,
  type CourseRegistration,
  type SectionCourseTeacherAssignment,
  type Section,
  type Semester,
  type Student,
  type StudentAdmissionApplicationStatus,
  type TeacherJobApplicationStatus,
  type Teacher,
} from "@/services/Department/departmentManagement.service";
import ImagebbUploader from "@/Components/ui/ImagebbUploader";
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
const TEACHER_APPLICATION_FILTER_OPTIONS: Array<TeacherJobApplicationStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "SHORTLISTED",
  "APPROVED",
  "REJECTED",
];
const STUDENT_APPLICATION_FILTER_OPTIONS: Array<StudentAdmissionApplicationStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "SHORTLISTED",
  "APPROVED",
  "REJECTED",
];

export default function DepartmentSectionContent({
  section,
}: Readonly<DepartmentSectionContentProps>) {
  const [loadingPageData, setLoadingPageData] = useState(false);

  const [profileFullName, setProfileFullName] = useState("");
  const [profileShortName, setProfileShortName] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileContactNo, setProfileContactNo] = useState("");
  const [profilePresentAddress, setProfilePresentAddress] = useState("");
  const [profilePermanentAddress, setProfilePermanentAddress] = useState("");
  const [profileBloodGroup, setProfileBloodGroup] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semesterName, setSemesterName] = useState("");
  const [semesterStartDate, setSemesterStartDate] = useState("");
  const [semesterEndDate, setSemesterEndDate] = useState("");
  const [creatingSemester, setCreatingSemester] = useState(false);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchName, setBatchName] = useState("");
  const [batchDescription, setBatchDescription] = useState("");
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState("");
  const [editingBatchName, setEditingBatchName] = useState("");
  const [editingBatchDescription, setEditingBatchDescription] = useState("");
  const [updatingBatchId, setUpdatingBatchId] = useState("");
  const [deletingBatchId, setDeletingBatchId] = useState("");

  const [sections, setSections] = useState<Section[]>([]);
  const [sectionName, setSectionName] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [sectionSemesterId, setSectionSemesterId] = useState("");
  const [sectionBatchId, setSectionBatchId] = useState("");
  const [sectionCapacity, setSectionCapacity] = useState("");
  const [creatingSection, setCreatingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState("");
  const [editingSectionName, setEditingSectionName] = useState("");
  const [editingSectionSemesterId, setEditingSectionSemesterId] = useState("");
  const [editingSectionBatchId, setEditingSectionBatchId] = useState("");
  const [editingSectionCapacity, setEditingSectionCapacity] = useState("");
  const [editingSectionDescription, setEditingSectionDescription] = useState("");
  const [updatingSectionId, setUpdatingSectionId] = useState("");
  const [deletingSectionId, setDeletingSectionId] = useState("");

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
  const [courseTeacherAssignments, setCourseTeacherAssignments] = useState<
    SectionCourseTeacherAssignment[]
  >([]);
  const [assignmentSemesterId, setAssignmentSemesterId] = useState("");
  const [assignmentBatchId, setAssignmentBatchId] = useState("");
  const [assignmentSectionId, setAssignmentSectionId] = useState("");
  const [assignmentCourseId, setAssignmentCourseId] = useState("");
  const [assignmentTeacherProfileId, setAssignmentTeacherProfileId] = useState("");
  const [savingTeacherAssignment, setSavingTeacherAssignment] = useState(false);
  const [registrationSemesterId, setRegistrationSemesterId] = useState("");
  const [registrationBatchId, setRegistrationBatchId] = useState("");
  const [registrationSectionId, setRegistrationSectionId] = useState("");
  const [registrationCourseId, setRegistrationCourseId] = useState("");
  const [registrationStudentProfileId, setRegistrationStudentProfileId] = useState("");
  const [creatingRegistration, setCreatingRegistration] = useState(false);
  const [editingCourseRegistrationId, setEditingCourseRegistrationId] = useState("");
  const [editingRegistrationSemesterId, setEditingRegistrationSemesterId] = useState("");
  const [editingRegistrationBatchId, setEditingRegistrationBatchId] = useState("");
  const [editingRegistrationSectionId, setEditingRegistrationSectionId] = useState("");
  const [editingRegistrationCourseId, setEditingRegistrationCourseId] = useState("");
  const [editingRegistrationStudentProfileId, setEditingRegistrationStudentProfileId] = useState("");
  const [updatingCourseRegistrationId, setUpdatingCourseRegistrationId] = useState("");
  const [deletingCourseRegistrationId, setDeletingCourseRegistrationId] = useState("");

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
  const [studentId, setStudentId] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState("");

  const [teacherApplications, setTeacherApplications] = useState<DepartmentTeacherJobApplication[]>([]);
  const [teacherApplicationFilter, setTeacherApplicationFilter] = useState<
    TeacherJobApplicationStatus | "ALL"
  >("ALL");
  const [activeTeacherApplication, setActiveTeacherApplication] =
    useState<DepartmentTeacherJobApplication | null>(null);
  const [reviewingTeacherApplication, setReviewingTeacherApplication] = useState(false);
  const [reviewResponseMessage, setReviewResponseMessage] = useState("");
  const [reviewRejectionReason, setReviewRejectionReason] = useState("");
  const [reviewTeacherInitial, setReviewTeacherInitial] = useState("");
  const [reviewTeacherId, setReviewTeacherId] = useState("");
  const [reviewTeacherDesignation, setReviewTeacherDesignation] = useState("");
  const [reviewTeacherBio, setReviewTeacherBio] = useState("");

  const [studentApplications, setStudentApplications] = useState<
    DepartmentStudentAdmissionApplication[]
  >([]);
  const [studentApplicationFilter, setStudentApplicationFilter] = useState<
    StudentAdmissionApplicationStatus | "ALL"
  >("ALL");
  const [activeStudentApplication, setActiveStudentApplication] =
    useState<DepartmentStudentAdmissionApplication | null>(null);
  const [reviewingStudentApplication, setReviewingStudentApplication] = useState(false);
  const [reviewStudentResponseMessage, setReviewStudentResponseMessage] = useState("");
  const [reviewStudentRejectionReason, setReviewStudentRejectionReason] = useState("");
  const [reviewStudentId, setReviewStudentId] = useState("");
  const [reviewStudentBio, setReviewStudentBio] = useState("");

  const [portalReady, setPortalReady] = useState(false);

  const canCreateSemester =
    semesterName.trim().length >= 2 &&
    Boolean(semesterStartDate) &&
    Boolean(semesterEndDate);

  const canCreateBatch = useMemo(() => batchName.trim().length >= 1, [batchName]);

  const canCreateSection = useMemo(() => {
    return (
      sectionName.trim().length >= 1 &&
      sectionSemesterId.trim().length > 0 &&
      sectionBatchId.trim().length > 0
    );
  }, [sectionBatchId, sectionName, sectionSemesterId]);

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
      studentId.trim().length >= 2
    );
  }, [studentEmail, studentId, studentName, studentPassword]);

  const filteredSectionsForRegistration = useMemo(() => {
    if (!registrationSemesterId && !registrationBatchId) {
      return sections;
    }

    return sections.filter(
      (item) =>
        (!registrationSemesterId || item.semesterId === registrationSemesterId) &&
        (!registrationBatchId || item.batchId === registrationBatchId),
    );
  }, [registrationBatchId, registrationSemesterId, sections]);

  const filteredSectionsForTeacherAssignment = useMemo(() => {
    if (!assignmentSemesterId && !assignmentBatchId) {
      return sections;
    }

    return sections.filter(
      (item) =>
        (!assignmentSemesterId || item.semesterId === assignmentSemesterId) &&
        (!assignmentBatchId || item.batchId === assignmentBatchId),
    );
  }, [assignmentBatchId, assignmentSemesterId, sections]);

  const canAssignTeacherToCourseSection = useMemo(() => {
    return (
      Boolean(assignmentSemesterId) &&
      Boolean(assignmentBatchId) &&
      Boolean(assignmentSectionId) &&
      Boolean(assignmentCourseId) &&
      Boolean(assignmentTeacherProfileId)
    );
  }, [
    assignmentBatchId,
    assignmentCourseId,
    assignmentSectionId,
    assignmentSemesterId,
    assignmentTeacherProfileId,
  ]);

  const canCreateCourseRegistration = useMemo(() => {
    return (
      Boolean(registrationSemesterId) &&
      Boolean(registrationBatchId) &&
      Boolean(registrationSectionId) &&
      Boolean(registrationCourseId) &&
      Boolean(registrationStudentProfileId)
    );
  }, [
    registrationBatchId,
    registrationCourseId,
    registrationSectionId,
    registrationSemesterId,
    registrationStudentProfileId,
  ]);

  const filteredSectionsForEditingRegistration = useMemo(() => {
    if (!editingRegistrationSemesterId && !editingRegistrationBatchId) {
      return sections;
    }

    return sections.filter(
      (item) =>
        (!editingRegistrationSemesterId || item.semesterId === editingRegistrationSemesterId) &&
        (!editingRegistrationBatchId || item.batchId === editingRegistrationBatchId),
    );
  }, [editingRegistrationBatchId, editingRegistrationSemesterId, sections]);

  const canUpdateCourseRegistration = useMemo(() => {
    return (
      Boolean(editingRegistrationSemesterId) &&
      Boolean(editingRegistrationBatchId) &&
      Boolean(editingRegistrationSectionId) &&
      Boolean(editingRegistrationCourseId) &&
      Boolean(editingRegistrationStudentProfileId)
    );
  }, [
    editingRegistrationBatchId,
    editingRegistrationCourseId,
    editingRegistrationSectionId,
    editingRegistrationSemesterId,
    editingRegistrationStudentProfileId,
  ]);

  const reloadSemesters = async () => {
    const data = await DepartmentManagementService.listSemesters();
    setSemesters(data);
    if (!sectionSemesterId && data.length > 0) {
      setSectionSemesterId(data[0].id);
    }
    if (!assignmentSemesterId && data.length > 0) {
      setAssignmentSemesterId(data[0].id);
    }
    if (!registrationSemesterId && data.length > 0) {
      setRegistrationSemesterId(data[0].id);
    }
  };

  const reloadBatches = async () => {
    const data = await DepartmentManagementService.listBatches();
    setBatches(data);
    if (!sectionBatchId && data.length > 0) {
      setSectionBatchId(data[0].id);
    }
    if (!assignmentBatchId && data.length > 0) {
      setAssignmentBatchId(data[0].id);
    }
    if (!registrationBatchId && data.length > 0) {
      setRegistrationBatchId(data[0].id);
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

  const reloadCourseTeacherAssignments = async () => {
    const data = await DepartmentManagementService.listSectionCourseTeacherAssignments();
    setCourseTeacherAssignments(data);
  };

  const reloadTeachers = async () => {
    const data = await DepartmentManagementService.listTeachers();
    setTeachers(data);
  };

  const reloadStudents = async () => {
    const data = await DepartmentManagementService.listStudents();
    setStudents(data);
  };

  const reloadTeacherApplications = async (status?: TeacherJobApplicationStatus) => {
    const data = await DepartmentManagementService.listTeacherApplications(status);
    setTeacherApplications(data);
  };

  const reloadStudentApplications = async (status?: StudentAdmissionApplicationStatus) => {
    const data = await DepartmentManagementService.listStudentApplications(status);
    setStudentApplications(data);
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
          setProfileName(profile.user?.name ?? "");
          setProfileImage(profile.user?.image ?? "");
          setProfileContactNo(profile.user?.contactNo ?? "");
          setProfilePresentAddress(profile.user?.presentAddress ?? "");
          setProfilePermanentAddress(profile.user?.permanentAddress ?? "");
          setProfileBloodGroup(profile.user?.bloodGroup ?? "");
          setProfileGender(profile.user?.gender ?? "");
        }

        if (section === "semesters") {
          await reloadSemesters();
        }

        if (section === "batches") {
          await reloadBatches();
        }

        if (section === "sections") {
          await Promise.all([reloadSemesters(), reloadBatches(), reloadSections()]);
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

        if (section === "teacherApplications") {
          await Promise.all([
            reloadTeachers(),
            reloadTeacherApplications(
              teacherApplicationFilter === "ALL" ? undefined : teacherApplicationFilter,
            ),
          ]);
        }

        if (section === "studentApplications") {
          await Promise.all([
            reloadStudents(),
            reloadStudentApplications(
              studentApplicationFilter === "ALL" ? undefined : studentApplicationFilter,
            ),
          ]);
        }

        if (section === "courseTeacherAssignments") {
          await Promise.all([
            reloadSemesters(),
            reloadBatches(),
            reloadSections(),
            reloadCourses(),
            reloadTeachers(),
            reloadCourseTeacherAssignments(),
          ]);
        }

        if (section === "courseRegistrations") {
          await Promise.all([
            reloadSemesters(),
            reloadBatches(),
            reloadSections(),
            reloadCourses(),
            reloadStudents(),
            reloadCourseTeacherAssignments(),
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
  }, [section, teacherApplicationFilter, studentApplicationFilter]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!sectionBatchId && batches.length > 0) {
      setSectionBatchId(batches[0].id);
    }
  }, [batches, sectionBatchId]);

  useEffect(() => {
    if (!assignmentBatchId && batches.length > 0) {
      setAssignmentBatchId(batches[0].id);
    }
  }, [assignmentBatchId, batches]);

  useEffect(() => {
    if (!registrationBatchId && batches.length > 0) {
      setRegistrationBatchId(batches[0].id);
    }
  }, [batches, registrationBatchId]);

  useEffect(() => {
    if (!assignmentTeacherProfileId && teachers.length > 0) {
      setAssignmentTeacherProfileId(teachers[0].id);
    }
  }, [assignmentTeacherProfileId, teachers]);

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
    if (filteredSectionsForTeacherAssignment.length === 0) {
      if (assignmentSectionId) {
        setAssignmentSectionId("");
      }
      return;
    }

    const selectedExists = filteredSectionsForTeacherAssignment.some(
      (item) => item.id === assignmentSectionId,
    );

    if (!selectedExists) {
      setAssignmentSectionId(filteredSectionsForTeacherAssignment[0].id);
    }
  }, [assignmentSectionId, filteredSectionsForTeacherAssignment]);

  useEffect(() => {
    if (!editingCourseRegistrationId) {
      return;
    }

    if (!editingRegistrationBatchId && batches.length > 0) {
      setEditingRegistrationBatchId(batches[0].id);
    }
  }, [batches, editingCourseRegistrationId, editingRegistrationBatchId]);

  useEffect(() => {
    if (!editingCourseRegistrationId) {
      return;
    }

    if (filteredSectionsForEditingRegistration.length === 0) {
      if (editingRegistrationSectionId) {
        setEditingRegistrationSectionId("");
      }
      return;
    }

    const selectedExists = filteredSectionsForEditingRegistration.some(
      (item) => item.id === editingRegistrationSectionId,
    );
    if (!selectedExists) {
      setEditingRegistrationSectionId(filteredSectionsForEditingRegistration[0].id);
    }
  }, [
    editingCourseRegistrationId,
    editingRegistrationBatchId,
    editingRegistrationSectionId,
    filteredSectionsForEditingRegistration,
  ]);

  useEffect(() => {
    if (courses.length === 0) {
      if (assignmentCourseId) {
        setAssignmentCourseId("");
      }
      return;
    }

    const selectedExists = courses.some((item) => item.id === assignmentCourseId);
    if (!selectedExists) {
      setAssignmentCourseId(courses[0].id);
    }
  }, [assignmentCourseId, courses]);

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
        name: profileName.trim() || undefined,
        image: profileImage.trim() || undefined,
        contactNo: profileContactNo.trim() || undefined,
        presentAddress: profilePresentAddress.trim() || undefined,
        permanentAddress: profilePermanentAddress.trim() || undefined,
        bloodGroup: profileBloodGroup.trim() || undefined,
        gender: profileGender.trim() || undefined,
      });

      setProfileFullName(updated.fullName ?? "");
      setProfileShortName(updated.shortName ?? "");
      setProfileDescription(updated.description ?? "");
      setProfileName(updated.user?.name ?? profileName);
      setProfileImage(updated.user?.image ?? profileImage);
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

  const onCreateBatch = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateBatch) {
      toast.warning("Provide batch name");
      return;
    }

    setCreatingBatch(true);
    try {
      await DepartmentManagementService.createBatch({
        name: batchName.trim(),
        description: batchDescription.trim() || undefined,
      });

      setBatchName("");
      setBatchDescription("");
      await reloadBatches();
      toast.success("Batch created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create batch";
      toast.error(message);
    } finally {
      setCreatingBatch(false);
    }
  };

  const onStartBatchEdit = (batch: Batch) => {
    setEditingBatchId(batch.id);
    setEditingBatchName(batch.name);
    setEditingBatchDescription(batch.description ?? "");
  };

  const onCancelBatchEdit = () => {
    setEditingBatchId("");
    setEditingBatchName("");
    setEditingBatchDescription("");
  };

  const onUpdateBatch = async (batchId: string) => {
    if (!editingBatchName.trim()) {
      toast.warning("Provide batch name");
      return;
    }

    setUpdatingBatchId(batchId);
    try {
      await DepartmentManagementService.updateBatch(batchId, {
        name: editingBatchName.trim(),
        description: editingBatchDescription.trim() || undefined,
      });
      await reloadBatches();
      onCancelBatchEdit();
      toast.success("Batch updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update batch";
      toast.error(message);
    } finally {
      setUpdatingBatchId("");
    }
  };

  const onDeleteBatch = async (batchId: string) => {
    setDeletingBatchId(batchId);
    try {
      await DepartmentManagementService.deleteBatch(batchId);
      await reloadBatches();
      if (editingBatchId === batchId) {
        onCancelBatchEdit();
      }
      toast.success("Batch deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete batch";
      toast.error(message);
    } finally {
      setDeletingBatchId("");
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

    if (!sectionBatchId.trim()) {
      toast.warning("Select a batch");
      return;
    }

    setCreatingSection(true);
    try {
      await DepartmentManagementService.createSection({
        name: sectionName.trim(),
        semesterId: sectionSemesterId,
        batchId: sectionBatchId,
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

  const onStartSectionEdit = (item: Section) => {
    setEditingSectionId(item.id);
    setEditingSectionName(item.name);
    setEditingSectionSemesterId(item.semesterId);
    setEditingSectionBatchId(item.batchId ?? "");
    setEditingSectionCapacity(item.sectionCapacity?.toString() ?? "");
    setEditingSectionDescription(item.description ?? "");
  };

  const onCancelSectionEdit = () => {
    setEditingSectionId("");
    setEditingSectionName("");
    setEditingSectionSemesterId("");
    setEditingSectionBatchId("");
    setEditingSectionCapacity("");
    setEditingSectionDescription("");
  };

  const onUpdateSection = async (sectionId: string) => {
    if (!editingSectionName.trim()) {
      toast.warning("Provide section name");
      return;
    }

    if (!editingSectionSemesterId.trim()) {
      toast.warning("Select a semester");
      return;
    }

    if (!editingSectionBatchId.trim()) {
      toast.warning("Select a batch");
      return;
    }

    if (editingSectionCapacity.trim()) {
      const numericCapacity = Number(editingSectionCapacity);
      if (!Number.isInteger(numericCapacity) || numericCapacity <= 0 || numericCapacity > 500) {
        toast.warning("Capacity must be an integer between 1 and 500");
        return;
      }
    }

    setUpdatingSectionId(sectionId);
    try {
      await DepartmentManagementService.updateSection(sectionId, {
        name: editingSectionName.trim(),
        semesterId: editingSectionSemesterId,
        batchId: editingSectionBatchId,
        sectionCapacity: editingSectionCapacity.trim() ? Number(editingSectionCapacity) : undefined,
        description: editingSectionDescription.trim() || undefined,
      });
      await reloadSections();
      onCancelSectionEdit();
      toast.success("Section updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update section";
      toast.error(message);
    } finally {
      setUpdatingSectionId("");
    }
  };

  const onDeleteSection = async (sectionId: string) => {
    setDeletingSectionId(sectionId);
    try {
      await DepartmentManagementService.deleteSection(sectionId);
      await reloadSections();
      if (editingSectionId === sectionId) {
        onCancelSectionEdit();
      }
      toast.success("Section deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete section";
      toast.error(message);
    } finally {
      setDeletingSectionId("");
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
        studentsId: studentId.trim(),
      });

      setStudentName("");
      setStudentEmail("");
      setStudentPassword("");
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

  const openTeacherApplicationModal = (item: DepartmentTeacherJobApplication) => {
    setActiveTeacherApplication(item);
    setReviewResponseMessage(item.institutionResponse ?? "");
    setReviewRejectionReason("");

    const existingProfile = teachers.find((teacher) => teacher.user.id === item.teacherUser.id);
    setReviewTeacherInitial(existingProfile?.teacherInitial ?? "");
    setReviewTeacherId(existingProfile?.teachersId ?? "");
    setReviewTeacherDesignation(existingProfile?.designation ?? "Lecturer");
    setReviewTeacherBio(existingProfile?.bio ?? "");
  };

  const closeTeacherApplicationModal = () => {
    setActiveTeacherApplication(null);
    setReviewResponseMessage("");
    setReviewRejectionReason("");
    setReviewTeacherInitial("");
    setReviewTeacherId("");
    setReviewTeacherDesignation("");
    setReviewTeacherBio("");
  };

  const reviewTeacherApplication = async (
    status: Extract<TeacherJobApplicationStatus, "SHORTLISTED" | "APPROVED" | "REJECTED">,
  ) => {
    if (!activeTeacherApplication) {
      return;
    }

    if (status === "REJECTED" && !reviewRejectionReason.trim()) {
      toast.warning("Rejection reason is required");
      return;
    }

    if (status === "APPROVED") {
      if (
        reviewTeacherInitial.trim().length < 2 ||
        reviewTeacherId.trim().length < 2 ||
        reviewTeacherDesignation.trim().length < 2
      ) {
        toast.warning("Teacher initial, teacher ID and designation are required for approval");
        return;
      }
    }

    setReviewingTeacherApplication(true);
    try {
      await DepartmentManagementService.reviewTeacherApplication(activeTeacherApplication.id, {
        status,
        responseMessage: reviewResponseMessage.trim() || undefined,
        rejectionReason:
          status === "REJECTED" ? reviewRejectionReason.trim() || undefined : undefined,
        teacherInitial: status === "APPROVED" ? reviewTeacherInitial.trim() : undefined,
        teachersId: status === "APPROVED" ? reviewTeacherId.trim() : undefined,
        designation: status === "APPROVED" ? reviewTeacherDesignation.trim() : undefined,
        bio: status === "APPROVED" ? reviewTeacherBio.trim() || undefined : undefined,
        departmentId: activeTeacherApplication.department?.id ?? undefined,
      });

      await Promise.all([
        reloadTeacherApplications(teacherApplicationFilter === "ALL" ? undefined : teacherApplicationFilter),
        reloadTeachers(),
      ]);
      let successMessage = "Application rejected successfully";
      if (status === "SHORTLISTED") {
        successMessage = "Application shortlisted successfully";
      } else if (status === "APPROVED") {
        successMessage = "Application accepted successfully";
      }

      toast.success(successMessage);
      closeTeacherApplicationModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to review application";
      toast.error(message);
    } finally {
      setReviewingTeacherApplication(false);
    }
  };

  const teacherApplicationStatusClasses = (status: TeacherJobApplicationStatus) => {
    if (status === "APPROVED") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (status === "REJECTED") {
      return "bg-rose-100 text-rose-700";
    }

    if (status === "SHORTLISTED") {
      return "bg-amber-100 text-amber-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const openStudentApplicationModal = (item: DepartmentStudentAdmissionApplication) => {
    setActiveStudentApplication(item);
    setReviewStudentResponseMessage(item.institutionResponse ?? "");
    setReviewStudentRejectionReason("");
    setReviewStudentId(item.studentProfile?.studentsId ?? "");
    setReviewStudentBio(item.studentProfile?.bio ?? "");
  };

  const closeStudentApplicationModal = () => {
    setActiveStudentApplication(null);
    setReviewStudentResponseMessage("");
    setReviewStudentRejectionReason("");
    setReviewStudentId("");
    setReviewStudentBio("");
  };

  const reviewStudentApplication = async (
    status: Extract<StudentAdmissionApplicationStatus, "SHORTLISTED" | "APPROVED" | "REJECTED">,
  ) => {
    if (!activeStudentApplication) {
      return;
    }

    if (status === "REJECTED" && !reviewStudentRejectionReason.trim()) {
      toast.warning("Rejection reason is required");
      return;
    }

    if (status === "APPROVED") {
      if (reviewStudentId.trim().length < 2) {
        toast.warning("Student ID is required for approval");
        return;
      }
    }

    setReviewingStudentApplication(true);
    try {
      await DepartmentManagementService.reviewStudentApplication(activeStudentApplication.id, {
        status,
        responseMessage: reviewStudentResponseMessage.trim() || undefined,
        rejectionReason:
          status === "REJECTED" ? reviewStudentRejectionReason.trim() || undefined : undefined,
        studentsId: status === "APPROVED" ? reviewStudentId.trim() : undefined,
        bio: status === "APPROVED" ? reviewStudentBio.trim() || undefined : undefined,
      });

      await Promise.all([
        reloadStudentApplications(studentApplicationFilter === "ALL" ? undefined : studentApplicationFilter),
        reloadStudents(),
      ]);

      let successMessage = "Application rejected successfully";
      if (status === "SHORTLISTED") {
        successMessage = "Application shortlisted successfully";
      } else if (status === "APPROVED") {
        successMessage = "Application accepted successfully";
      }

      toast.success(successMessage);
      closeStudentApplicationModal();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to review application";
      toast.error(message);
    } finally {
      setReviewingStudentApplication(false);
    }
  };

  const studentApplicationStatusClasses = (status: StudentAdmissionApplicationStatus) => {
    return teacherApplicationStatusClasses(status);
  };

  const onAssignTeacherToCourseSection = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canAssignTeacherToCourseSection) {
      toast.warning("Select semester, batch, section, course and teacher");
      return;
    }

    setSavingTeacherAssignment(true);
    try {
      await DepartmentManagementService.upsertSectionCourseTeacherAssignment({
        semesterId: assignmentSemesterId,
        sectionId: assignmentSectionId,
        courseId: assignmentCourseId,
        teacherProfileId: assignmentTeacherProfileId,
      });

      await Promise.all([reloadCourseTeacherAssignments(), reloadCourseRegistrations()]);
      toast.success("Teacher assigned successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign teacher";
      toast.error(message);
    } finally {
      setSavingTeacherAssignment(false);
    }
  };

  const onCreateCourseRegistration = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!canCreateCourseRegistration) {
      toast.warning("Select semester, batch, section, course and student");
      return;
    }

    setCreatingRegistration(true);
    try {
      await DepartmentManagementService.createCourseRegistration({
        courseId: registrationCourseId,
        studentProfileId: registrationStudentProfileId,
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

  const onStartCourseRegistrationEdit = (item: CourseRegistration) => {
    setEditingCourseRegistrationId(item.id);
    setEditingRegistrationSemesterId(item.semesterId);
    setEditingRegistrationBatchId(item.section.batch?.id ?? "");
    setEditingRegistrationSectionId(item.sectionId);
    setEditingRegistrationCourseId(item.courseId);
    setEditingRegistrationStudentProfileId(item.studentProfileId);
  };

  const onCancelCourseRegistrationEdit = () => {
    setEditingCourseRegistrationId("");
    setEditingRegistrationSemesterId("");
    setEditingRegistrationBatchId("");
    setEditingRegistrationSectionId("");
    setEditingRegistrationCourseId("");
    setEditingRegistrationStudentProfileId("");
  };

  const onUpdateCourseRegistration = async (courseRegistrationId: string) => {
    if (!canUpdateCourseRegistration) {
      toast.warning("Select semester, batch, section, course and student");
      return;
    }

    setUpdatingCourseRegistrationId(courseRegistrationId);
    try {
      await DepartmentManagementService.updateCourseRegistration(courseRegistrationId, {
        semesterId: editingRegistrationSemesterId,
        sectionId: editingRegistrationSectionId,
        courseId: editingRegistrationCourseId,
        studentProfileId: editingRegistrationStudentProfileId,
      });

      await reloadCourseRegistrations();
      onCancelCourseRegistrationEdit();
      toast.success("Course registration updated successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update course registration";
      toast.error(message);
    } finally {
      setUpdatingCourseRegistrationId("");
    }
  };

  const onDeleteCourseRegistration = async (courseRegistrationId: string) => {
    setDeletingCourseRegistrationId(courseRegistrationId);
    try {
      await DepartmentManagementService.deleteCourseRegistration(courseRegistrationId);
      await reloadCourseRegistrations();
      if (editingCourseRegistrationId === courseRegistrationId) {
        onCancelCourseRegistrationEdit();
      }
      toast.success("Course registration deleted successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete course registration";
      toast.error(message);
    } finally {
      setDeletingCourseRegistrationId("");
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
          <ImagebbUploader
            label="Profile Image"
            helperText="Square crop (1:1). Optimized around 100KB before upload."
            value={profileImage}
            cropRatio={1}
            compressionSizeKB={100}
            onChange={(url) => setProfileImage(url)}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="department-admin-name">
              Admin Name
            </label>
            <input
              id="department-admin-name"
              value={profileName}
              onChange={(event) => setProfileName(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
            />
          </div>

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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="department-contact-no">
                Contact Number
              </label>
              <input
                id="department-contact-no"
                value={profileContactNo}
                onChange={(event) => setProfileContactNo(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="department-blood-group">
                Blood Group
              </label>
              <input
                id="department-blood-group"
                value={profileBloodGroup}
                onChange={(event) => setProfileBloodGroup(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="department-present-address">
                Present Address
              </label>
              <input
                id="department-present-address"
                value={profilePresentAddress}
                onChange={(event) => setProfilePresentAddress(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="department-permanent-address">
                Permanent Address
              </label>
              <input
                id="department-permanent-address"
                value={profilePermanentAddress}
                onChange={(event) => setProfilePermanentAddress(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-primary/40 transition focus:ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="department-gender">
              Gender
            </label>
            <input
              id="department-gender"
              value={profileGender}
              onChange={(event) => setProfileGender(event.target.value)}
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

  if (section === "batches") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Batch Management</h2>
        {loadingIndicator}

        <form className="space-y-3" onSubmit={onCreateBatch}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={batchName}
              onChange={(event) => setBatchName(event.target.value)}
              placeholder="Batch name"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={batchDescription}
              onChange={(event) => setBatchDescription(event.target.value)}
              placeholder="Description (optional)"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={creatingBatch || !canCreateBatch}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {creatingBatch ? "Creating..." : "Create Batch"}
          </button>
        </form>

        <div className="space-y-2">
          {batches.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
              {editingBatchId === item.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <input
                      value={editingBatchName}
                      onChange={(event) => setEditingBatchName(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                      placeholder="Batch name"
                    />
                    <input
                      value={editingBatchDescription}
                      onChange={(event) => setEditingBatchDescription(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                      placeholder="Description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onUpdateBatch(item.id)}
                      disabled={updatingBatchId === item.id}
                      className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {updatingBatchId === item.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelBatchEdit}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">{item.description ?? "-"}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onStartBatchEdit(item)}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDeleteBatch(item.id)}
                      disabled={deletingBatchId === item.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 disabled:opacity-60"
                    >
                      {deletingBatchId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {batches.length === 0 && !loadingPageData ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              No batches found.
            </p>
          ) : null}
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
            <select
              value={sectionBatchId}
              onChange={(event) => setSectionBatchId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select batch</option>
              {batches.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
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
              {editingSectionId === item.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input
                      value={editingSectionName}
                      onChange={(event) => setEditingSectionName(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                      placeholder="Section name"
                    />
                    <select
                      value={editingSectionSemesterId}
                      onChange={(event) => setEditingSectionSemesterId(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                    >
                      <option value="">Select semester</option>
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {formatSeasonYear(semester)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editingSectionBatchId}
                      onChange={(event) => setEditingSectionBatchId(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                    >
                      <option value="">Select batch</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <input
                      value={editingSectionCapacity}
                      onChange={(event) => setEditingSectionCapacity(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                      placeholder="Capacity"
                    />
                    <input
                      value={editingSectionDescription}
                      onChange={(event) => setEditingSectionDescription(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                      placeholder="Description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onUpdateSection(item.id)}
                      disabled={updatingSectionId === item.id}
                      className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {updatingSectionId === item.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelSectionEdit}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">
                    Semester: {item.semester?.name ?? "-"} | Batch: {item.batch?.name ?? "-"} | Capacity: {item.sectionCapacity ?? "-"}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onStartSectionEdit(item)}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDeleteSection(item.id)}
                      disabled={deletingSectionId === item.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 disabled:opacity-60"
                    >
                      {deletingSectionId === item.id ? "Deleting..." : "Delete"}
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

  if (section === "courseTeacherAssignments") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Course Teacher Assignment</h2>
        <p className="text-sm text-muted-foreground">
          Assign a teacher to a course and section. This assignment is used automatically during course registration.
        </p>
        {loadingIndicator}

        <form className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4" onSubmit={onAssignTeacherToCourseSection}>
          <p className="text-sm font-medium">Assign Teacher To Course + Section</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <select
              value={assignmentSemesterId}
              onChange={(event) => setAssignmentSemesterId(event.target.value)}
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
              value={assignmentBatchId}
              onChange={(event) => setAssignmentBatchId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select batch</option>
              {batches.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={assignmentSectionId}
              onChange={(event) => setAssignmentSectionId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select section</option>
              {filteredSectionsForTeacherAssignment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              value={assignmentCourseId}
              onChange={(event) => setAssignmentCourseId(event.target.value)}
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
              value={assignmentTeacherProfileId}
              onChange={(event) => setAssignmentTeacherProfileId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select teacher</option>
              {teachers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.user.name} ({item.teacherInitial})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={savingTeacherAssignment || !canAssignTeacherToCourseSection}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {savingTeacherAssignment ? "Saving Assignment..." : "Save Teacher Assignment"}
          </button>

          <div className="space-y-1">
            {courseTeacherAssignments.slice(0, 6).map((item) => (
              <p key={item.id} className="text-xs text-muted-foreground">
                {item.section.name} | {item.course.courseCode} - {item.course.courseTitle} | {item.teacherProfile.user.name}
              </p>
            ))}
            {courseTeacherAssignments.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No teacher assignments yet. Create one before registering students.
              </p>
            ) : null}
          </div>
        </form>

        <div className="space-y-2">
          {courseTeacherAssignments.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm">
              <p className="font-medium">
                {item.section.name} | {item.course.courseCode} - {item.course.courseTitle}
              </p>
              <p className="text-muted-foreground">
                Teacher: {item.teacherProfile.user.name} ({item.teacherProfile.teacherInitial}) | Designation: {item.teacherProfile.designation}
              </p>
            </div>
          ))}
          {courseTeacherAssignments.length === 0 && !loadingPageData ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              No teacher assignments found.
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  if (section === "courseRegistrations") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Course Registration</h2>
        <p className="text-sm text-muted-foreground">
          Register students to courses. Teacher is now auto-resolved from Course Teacher Assignment.
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
              value={registrationBatchId}
              onChange={(event) => setRegistrationBatchId(event.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select batch</option>
              {batches.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
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
              {editingCourseRegistrationId === item.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <select
                      value={editingRegistrationSemesterId}
                      onChange={(event) => setEditingRegistrationSemesterId(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                    >
                      <option value="">Select semester</option>
                      {semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {formatSeasonYear(semester)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editingRegistrationBatchId}
                      onChange={(event) => setEditingRegistrationBatchId(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                    >
                      <option value="">Select batch</option>
                      {batches.map((batchItem) => (
                        <option key={batchItem.id} value={batchItem.id}>
                          {batchItem.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editingRegistrationSectionId}
                      onChange={(event) => setEditingRegistrationSectionId(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                    >
                      <option value="">Select section</option>
                      {filteredSectionsForEditingRegistration.map((sectionItem) => (
                        <option key={sectionItem.id} value={sectionItem.id}>
                          {sectionItem.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editingRegistrationCourseId}
                      onChange={(event) => setEditingRegistrationCourseId(event.target.value)}
                      className="rounded-lg border border-border bg-background px-2 py-1"
                    >
                      <option value="">Select course</option>
                      {courses.map((courseItem) => (
                        <option key={courseItem.id} value={courseItem.id}>
                          {courseItem.courseCode} - {courseItem.courseTitle}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editingRegistrationStudentProfileId}
                      onChange={(event) =>
                        setEditingRegistrationStudentProfileId(event.target.value)
                      }
                      className="rounded-lg border border-border bg-background px-2 py-1"
                    >
                      <option value="">Select student</option>
                      {students.map((studentItem) => (
                        <option key={studentItem.id} value={studentItem.id}>
                          {studentItem.user.name} ({studentItem.studentsId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onUpdateCourseRegistration(item.id)}
                      disabled={
                        updatingCourseRegistrationId === item.id || !canUpdateCourseRegistration
                      }
                      className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {updatingCourseRegistrationId === item.id ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={onCancelCourseRegistrationEdit}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="font-medium">
                    {item.course.courseCode} - {item.course.courseTitle}
                  </p>
                  <p className="text-muted-foreground">
                    Student: {item.studentProfile.user.name} ({item.studentProfile.studentsId}) | Teacher:{" "}
                    {item.teacherProfile.user.name} ({item.teacherProfile.teacherInitial})
                  </p>
                  <p className="text-muted-foreground">
                    Program: {item.program?.title ?? "-"} | Batch: {item.section.batch?.name ?? "-"} | Section: {item.section.name} | Semester:{" "}
                    {formatSeasonYear(item.semester)}
                  </p>
                  <p className="text-muted-foreground">
                    Registered: {formatDateDDMMYYYY(item.registrationDate)}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onStartCourseRegistrationEdit(item)}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDeleteCourseRegistration(item.id)}
                      disabled={deletingCourseRegistrationId === item.id}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 disabled:opacity-60"
                    >
                      {deletingCourseRegistrationId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
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

  if (section === "studentApplications") {
    const studentApplicationModal = activeStudentApplication ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Student Application Details
              </p>
              <h3 className="text-lg font-semibold">{activeStudentApplication.studentUser.name}</h3>
              <p className="text-sm text-muted-foreground">{activeStudentApplication.studentUser.email}</p>
            </div>
            <button
              type="button"
              onClick={closeStudentApplicationModal}
              className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Posting</p>
              <p className="font-medium">{activeStudentApplication.posting.title}</p>
              <p className="text-sm text-muted-foreground">
                Location: {activeStudentApplication.posting.location ?? "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                Applied: {formatDateDDMMYYYY(activeStudentApplication.appliedAt)}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Current Status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${studentApplicationStatusClasses(activeStudentApplication.status)}`}
              >
                {activeStudentApplication.status}
              </span>
              <p className="mt-2 text-sm text-muted-foreground">
                Last response: {activeStudentApplication.institutionResponse ?? "-"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Cover Letter</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {activeStudentApplication.coverLetter ?? "No cover letter provided."}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Application Profile</p>
            {activeStudentApplication.studentUser.studentApplicationProfile ? (
              <div className="mt-1 space-y-2 text-sm">
                <p>
                  <span className="font-medium">Headline:</span>{" "}
                  {activeStudentApplication.studentUser.studentApplicationProfile.headline}
                </p>
                <p>
                  <span className="font-medium">About:</span>{" "}
                  {activeStudentApplication.studentUser.studentApplicationProfile.about}
                </p>
                <div>
                  <p className="font-medium">Document Links</p>
                  <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {activeStudentApplication.studentUser.studentApplicationProfile.documentUrls.map(
                      (item) => (
                        <p key={item} className="truncate">
                          {item}
                        </p>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-medium">Academic Records</p>
                  <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {activeStudentApplication.studentUser.studentApplicationProfile.academicRecords.map(
                      (record) => (
                        <p key={`${record.examName}-${record.institute}-${record.year}`}>
                          {record.examName} | {record.institute} | {record.result} | {record.year}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No application profile submitted.</p>
            )}
          </div>

          {activeStudentApplication.status === "PENDING" ||
          activeStudentApplication.status === "SHORTLISTED" ? (
            <div className="mt-4 space-y-3 rounded-xl border border-border/70 bg-background/70 p-3">
              <h4 className="text-sm font-semibold">Review Decision</h4>

              <textarea
                rows={2}
                value={reviewStudentResponseMessage}
                onChange={(event) => setReviewStudentResponseMessage(event.target.value)}
                placeholder="Response note for applicant (optional)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />

              <textarea
                rows={2}
                value={reviewStudentRejectionReason}
                onChange={(event) => setReviewStudentRejectionReason(event.target.value)}
                placeholder="Rejection reason (required only for reject)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />

              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  value={reviewStudentId}
                  onChange={(event) => setReviewStudentId(event.target.value)}
                  placeholder="Student ID (required for accept)"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>

              <textarea
                rows={2}
                value={reviewStudentBio}
                onChange={(event) => setReviewStudentBio(event.target.value)}
                placeholder="Student bio (optional, used on accept)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void reviewStudentApplication("APPROVED")}
                  disabled={reviewingStudentApplication}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {reviewingStudentApplication ? "Processing..." : "Accept"}
                </button>
                <button
                  type="button"
                  onClick={() => void reviewStudentApplication("SHORTLISTED")}
                  disabled={reviewingStudentApplication}
                  className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {reviewingStudentApplication ? "Processing..." : "Shortlist"}
                </button>
                <button
                  type="button"
                  onClick={() => void reviewStudentApplication("REJECTED")}
                  disabled={reviewingStudentApplication}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {reviewingStudentApplication ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              This application is finalized and can no longer be changed.
            </p>
          )}
        </div>
      </div>
    ) : null;

    return (
      <>
        <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Student Applications</h2>
          <p className="text-sm text-muted-foreground">
            Review incoming student admission applications and mark them as Accepted, Shortlisted,
            or Rejected.
          </p>
          {loadingIndicator}

          <div className="flex flex-wrap gap-2">
            {STUDENT_APPLICATION_FILTER_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setStudentApplicationFilter(item)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                  studentApplicationFilter === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {studentApplications.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/70 bg-background/70 px-3 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.studentUser.name}</p>
                    <p className="text-muted-foreground">{item.studentUser.email}</p>
                    <p className="text-muted-foreground">{item.posting.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Applied on {formatDateDDMMYYYY(item.appliedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${studentApplicationStatusClasses(item.status)}`}
                    >
                      {item.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => openStudentApplicationModal(item)}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {studentApplications.length === 0 && !loadingPageData ? (
              <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                No student applications found for this filter.
              </p>
            ) : null}
          </div>
        </article>

        {portalReady && studentApplicationModal
          ? createPortal(studentApplicationModal, document.body)
          : null}
      </>
    );
  }

  if (section === "teacherApplications") {
    const teacherApplicationModal = activeTeacherApplication ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Teacher Application Details
              </p>
              <h3 className="text-lg font-semibold">{activeTeacherApplication.teacherUser.name}</h3>
              <p className="text-sm text-muted-foreground">{activeTeacherApplication.teacherUser.email}</p>
            </div>
            <button
              type="button"
              onClick={closeTeacherApplicationModal}
              className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Posting</p>
              <p className="font-medium">{activeTeacherApplication.posting.title}</p>
              <p className="text-sm text-muted-foreground">
                Location: {activeTeacherApplication.posting.location ?? "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                Department: {activeTeacherApplication.department?.fullName ?? "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                Applied: {formatDateDDMMYYYY(activeTeacherApplication.appliedAt)}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/70 p-3">
              <p className="text-xs text-muted-foreground">Current Status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${teacherApplicationStatusClasses(activeTeacherApplication.status)}`}
              >
                {activeTeacherApplication.status}
              </span>
              <p className="mt-2 text-sm text-muted-foreground">
                Last response: {activeTeacherApplication.institutionResponse ?? "-"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Cover Letter</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {activeTeacherApplication.coverLetter ?? "No cover letter provided."}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs text-muted-foreground">Application Profile</p>
            {activeTeacherApplication.teacherUser.teacherApplicationProfile ? (
              <div className="mt-1 space-y-2 text-sm">
                <p>
                  <span className="font-medium">Headline:</span>{" "}
                  {activeTeacherApplication.teacherUser.teacherApplicationProfile.headline}
                </p>
                <p>
                  <span className="font-medium">About:</span>{" "}
                  {activeTeacherApplication.teacherUser.teacherApplicationProfile.about}
                </p>
                <p>
                  <span className="font-medium">Skills:</span>{" "}
                  {activeTeacherApplication.teacherUser.teacherApplicationProfile.skills.join(", ") || "-"}
                </p>
                <p>
                  <span className="font-medium">Certifications:</span>{" "}
                  {activeTeacherApplication.teacherUser.teacherApplicationProfile.certifications.join(", ") || "-"}
                </p>
                <p>
                  <span className="font-medium">Resume:</span>{" "}
                  <a
                    href={activeTeacherApplication.teacherUser.teacherApplicationProfile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    Open resume
                  </a>
                </p>
                {activeTeacherApplication.teacherUser.teacherApplicationProfile.portfolioUrl ? (
                  <p>
                    <span className="font-medium">Portfolio:</span>{" "}
                    <a
                      href={activeTeacherApplication.teacherUser.teacherApplicationProfile.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      Open portfolio
                    </a>
                  </p>
                ) : null}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="font-medium">Academic Records</p>
                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                      {activeTeacherApplication.teacherUser.teacherApplicationProfile.academicRecords.map(
                        (record) => (
                          <p key={`${record.degree}-${record.institute}-${record.year}`}>
                            {record.degree} | {record.institute} | {record.result} | {record.year}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Experience Records</p>
                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                      {activeTeacherApplication.teacherUser.teacherApplicationProfile.experiences.map(
                        (record) => (
                          <p key={`${record.title}-${record.organization}-${record.startDate}`}>
                            {record.title} @ {record.organization} ({record.startDate}
                            {record.endDate ? ` - ${record.endDate}` : " - Present"})
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">No application profile submitted.</p>
            )}
          </div>

          {activeTeacherApplication.status === "PENDING" ||
          activeTeacherApplication.status === "SHORTLISTED" ? (
            <div className="mt-4 space-y-3 rounded-xl border border-border/70 bg-background/70 p-3">
              <h4 className="text-sm font-semibold">Review Decision</h4>

              <textarea
                rows={2}
                value={reviewResponseMessage}
                onChange={(event) => setReviewResponseMessage(event.target.value)}
                placeholder="Response note for candidate (optional)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />

              <textarea
                rows={2}
                value={reviewRejectionReason}
                onChange={(event) => setReviewRejectionReason(event.target.value)}
                placeholder="Rejection reason (required only for reject)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />

              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <input
                  value={reviewTeacherInitial}
                  onChange={(event) => setReviewTeacherInitial(event.target.value)}
                  placeholder="Teacher initial (required for accept)"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={reviewTeacherId}
                  onChange={(event) => setReviewTeacherId(event.target.value)}
                  placeholder="Teacher ID (required for accept)"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
                <input
                  value={reviewTeacherDesignation}
                  onChange={(event) => setReviewTeacherDesignation(event.target.value)}
                  placeholder="Designation (required for accept)"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <textarea
                rows={2}
                value={reviewTeacherBio}
                onChange={(event) => setReviewTeacherBio(event.target.value)}
                placeholder="Teacher bio (optional, used on accept)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void reviewTeacherApplication("APPROVED")}
                  disabled={reviewingTeacherApplication}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {reviewingTeacherApplication ? "Processing..." : "Accept"}
                </button>
                <button
                  type="button"
                  onClick={() => void reviewTeacherApplication("SHORTLISTED")}
                  disabled={reviewingTeacherApplication}
                  className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {reviewingTeacherApplication ? "Processing..." : "Shortlist"}
                </button>
                <button
                  type="button"
                  onClick={() => void reviewTeacherApplication("REJECTED")}
                  disabled={reviewingTeacherApplication}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {reviewingTeacherApplication ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              This application is finalized and can no longer be changed.
            </p>
          )}
        </div>
      </div>
    ) : null;

    return (
      <>
        <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Teacher Applications</h2>
          <p className="text-sm text-muted-foreground">
            Review incoming teacher proposals and mark them as Accepted, Shortlisted (waiting list),
            or Rejected.
          </p>
          {loadingIndicator}

          <div className="flex flex-wrap gap-2">
            {TEACHER_APPLICATION_FILTER_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTeacherApplicationFilter(item)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                  teacherApplicationFilter === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {teacherApplications.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/70 bg-background/70 px-3 py-3 text-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.teacherUser.name}</p>
                    <p className="text-muted-foreground">{item.teacherUser.email}</p>
                    <p className="text-muted-foreground">
                      {item.posting.title}
                      {item.department?.fullName ? ` | ${item.department.fullName}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied on {formatDateDDMMYYYY(item.appliedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${teacherApplicationStatusClasses(item.status)}`}
                    >
                      {item.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => openTeacherApplicationModal(item)}
                      className="rounded-lg border border-border bg-background px-3 py-1 text-xs font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {teacherApplications.length === 0 && !loadingPageData ? (
              <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
                No teacher applications found for this filter.
              </p>
            ) : null}
          </div>
        </article>

        {portalReady && teacherApplicationModal
          ? createPortal(teacherApplicationModal, document.body)
          : null}
      </>
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
