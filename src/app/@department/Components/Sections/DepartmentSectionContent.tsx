"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import NoticeWorkspace from "@/Components/Notice/NoticeWorkspace";

import {
  ApiRequestError,
  type DepartmentTeacherJobApplication,
  type DepartmentStudentAdmissionApplication,
  type DepartmentFeeConfiguration,
  type DepartmentStudentPaymentInfo,
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
  type InstitutionTransferEntityType,
  type InstitutionOption,
  type InstitutionTransferRequest,
  type InstitutionTransferStatus,
  type TeacherJobApplicationStatus,
  type Teacher,
} from "@/services/Department/departmentManagement.service";
import ImagebbUploader from "@/Components/ui/ImagebbUploader";
import PostingManagementPanel from "@/Components/PostingManagement/PostingManagementPanel";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import SearchableSelect from "@/Components/ui/SearchableSelect";
import DepartmentRoutineWorkspace from "@/app/@department/Components/Sections/DepartmentRoutineWorkspace";

import { type DepartmentSection } from "./departmentSections";

interface DepartmentSectionContentProps {
  section: DepartmentSection;
  isUniversity?: boolean;
}

const formatDateDDMMYYYY = (value: string | Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const formatAmount = (value: number, currency = "BDT") =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

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

const TRANSFER_STATUS_FILTER_OPTIONS: Array<InstitutionTransferStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
];

type FeeConfigurationFieldErrors = {
  semesterId?: string;
  totalFeeAmount?: string;
  monthlyFeeAmount?: string;
  form?: string;
};

type StudentPaymentLookupFieldErrors = {
  studentsId?: string;
  semesterId?: string;
  form?: string;
};

const mapFeeConfigurationFieldErrors = (error: unknown): FeeConfigurationFieldErrors => {
  if (!(error instanceof ApiRequestError)) {
    return {};
  }

  const fieldErrors: FeeConfigurationFieldErrors = {};

  for (const issue of error.fieldErrors) {
    if (issue.path === "body.semesterId") {
      fieldErrors.semesterId = issue.message;
    } else if (issue.path === "body.totalFeeAmount") {
      fieldErrors.totalFeeAmount = issue.message;
    } else if (issue.path === "body.monthlyFeeAmount") {
      fieldErrors.monthlyFeeAmount = issue.message;
    }
  }

  if (!fieldErrors.semesterId && !fieldErrors.totalFeeAmount && !fieldErrors.monthlyFeeAmount) {
    fieldErrors.form = error.message;
  }

  return fieldErrors;
};

const mapStudentPaymentLookupFieldErrors = (error: unknown): StudentPaymentLookupFieldErrors => {
  if (!(error instanceof ApiRequestError)) {
    return {};
  }

  const fieldErrors: StudentPaymentLookupFieldErrors = {};

  for (const issue of error.fieldErrors) {
    if (issue.path === "params.studentsId") {
      fieldErrors.studentsId = issue.message;
    } else if (issue.path === "query.semesterId") {
      fieldErrors.semesterId = issue.message;
    }
  }

  if (!fieldErrors.studentsId && !fieldErrors.semesterId) {
    fieldErrors.form = error.message;
  }

  return fieldErrors;
};

export default function DepartmentSectionContent({
  section,
  isUniversity = true,
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
  const [semesterSearch, setSemesterSearch] = useState("");

  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchName, setBatchName] = useState("");
  const [batchDescription, setBatchDescription] = useState("");
  const [creatingBatch, setCreatingBatch] = useState(false);
  const [editingBatchId, setEditingBatchId] = useState("");
  const [editingBatchName, setEditingBatchName] = useState("");
  const [editingBatchDescription, setEditingBatchDescription] = useState("");
  const [updatingBatchId, setUpdatingBatchId] = useState("");
  const [deletingBatchId, setDeletingBatchId] = useState("");
  const [batchSearch, setBatchSearch] = useState("");

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
  const [sectionSearch, setSectionSearch] = useState("");

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
  const [courseSearch, setCourseSearch] = useState("");

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
  const [teacherSearch, setTeacherSearch] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [creatingStudent, setCreatingStudent] = useState(false);
  const [updatingStudentId, setUpdatingStudentId] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [transferEntityType, setTransferEntityType] =
    useState<InstitutionTransferEntityType>("STUDENT");
  const [transferProfileId, setTransferProfileId] = useState("");
  const [transferTargetInstitutionId, setTransferTargetInstitutionId] = useState("");
  const [transferRequestMessage, setTransferRequestMessage] = useState("");
  const [creatingTransferRequest, setCreatingTransferRequest] = useState(false);
  const [institutionOptions, setInstitutionOptions] = useState<InstitutionOption[]>([]);
  const [loadingInstitutionOptions, setLoadingInstitutionOptions] = useState(false);
  const [transferInstitutionSearch, setTransferInstitutionSearch] = useState("");
  const [incomingTransfers, setIncomingTransfers] = useState<InstitutionTransferRequest[]>([]);
  const [outgoingTransfers, setOutgoingTransfers] = useState<InstitutionTransferRequest[]>([]);
  const [transferStatusFilter, setTransferStatusFilter] =
    useState<InstitutionTransferStatus | "ALL">("ALL");
  const [reviewingTransferId, setReviewingTransferId] = useState("");
  const [transferResponseMessageById, setTransferResponseMessageById] = useState<Record<string, string>>({});
  const [transferTargetDepartmentIdById, setTransferTargetDepartmentIdById] = useState<Record<string, string>>({});

  const [feeConfigurations, setFeeConfigurations] = useState<DepartmentFeeConfiguration[]>([]);
  const [feeSemesterId, setFeeSemesterId] = useState("");
  const [feeTotalAmount, setFeeTotalAmount] = useState("");
  const [feeMonthlyAmount, setFeeMonthlyAmount] = useState("");
  const [savingFeeConfiguration, setSavingFeeConfiguration] = useState(false);
  const [feeConfigurationErrors, setFeeConfigurationErrors] =
    useState<FeeConfigurationFieldErrors>({});
  const [studentPaymentLookupId, setStudentPaymentLookupId] = useState("");
  const [studentPaymentSemesterId, setStudentPaymentSemesterId] = useState("");
  const [studentPaymentLookupErrors, setStudentPaymentLookupErrors] =
    useState<StudentPaymentLookupFieldErrors>({});
  const [studentPaymentInfo, setStudentPaymentInfo] = useState<DepartmentStudentPaymentInfo | null>(
    null,
  );
  const [loadingStudentPaymentInfo, setLoadingStudentPaymentInfo] = useState(false);

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

  const debouncedSemesterSearch = useDebouncedValue(semesterSearch, 1000);
  const debouncedBatchSearch = useDebouncedValue(batchSearch, 1000);
  const debouncedSectionSearch = useDebouncedValue(sectionSearch, 1000);
  const debouncedCourseSearch = useDebouncedValue(courseSearch, 1000);
  const debouncedTeacherSearch = useDebouncedValue(teacherSearch, 1000);
  const debouncedStudentSearch = useDebouncedValue(studentSearch, 1000);
  const debouncedTransferInstitutionSearch = useDebouncedValue(transferInstitutionSearch, 1000);

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

  const reloadSemesters = async (search?: string) => {
    const data = await DepartmentManagementService.listSemesters(search ?? debouncedSemesterSearch);
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

  const reloadBatches = async (search?: string) => {
    const data = await DepartmentManagementService.listBatches(search ?? debouncedBatchSearch);
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

  const reloadSections = async (search?: string) => {
    const data = await DepartmentManagementService.listSections(search ?? debouncedSectionSearch);
    setSections(data);
  };

  const reloadCourses = async (search?: string) => {
    const data = await DepartmentManagementService.listCourses(search ?? debouncedCourseSearch);
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

  const reloadTeachers = async (search?: string) => {
    const data = await DepartmentManagementService.listTeachers(search ?? debouncedTeacherSearch);
    setTeachers(data);
  };

  const reloadStudents = async (search?: string) => {
    const data = await DepartmentManagementService.listStudents(search ?? debouncedStudentSearch);
    setStudents(data);
  };

  const reloadFeeConfigurations = async (semesterId?: string) => {
    const data = await DepartmentManagementService.listFeeConfigurations(semesterId);
    setFeeConfigurations(data);
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

        if (section === "transfers") {
          const status = transferStatusFilter === "ALL" ? undefined : transferStatusFilter;
          await Promise.all([
            reloadTeachers(),
            reloadStudents(),
            reloadInstitutionOptions(),
            DepartmentManagementService.listIncomingTransferRequests(status),
            DepartmentManagementService.listOutgoingTransferRequests(status),
          ]).then(([_, __, ___, incoming, outgoing]) => {
            if (!cancelled) {
              setIncomingTransfers(incoming);
              setOutgoingTransfers(outgoing);
            }
          });
        }

        if (section === "fees") {
          await Promise.all([reloadSemesters(), reloadFeeConfigurations()]);
          if (!cancelled) {
            setStudentPaymentInfo(null);
          }
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
  }, [section, teacherApplicationFilter, studentApplicationFilter, transferStatusFilter]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!sectionBatchId && batches.length > 0) {
      setSectionBatchId(batches[0].id);
    }
  }, [batches, sectionBatchId]);

  useEffect(() => {
    if (!feeSemesterId && semesters.length > 0) {
      setFeeSemesterId(semesters[0].id);
    }
  }, [feeSemesterId, semesters]);

  useEffect(() => {
    if (!feeSemesterId) {
      return;
    }

    const existing = feeConfigurations.find((item) => item.semesterId === feeSemesterId);
    if (existing) {
      setFeeTotalAmount(String(existing.totalFeeAmount));
      setFeeMonthlyAmount(String(existing.monthlyFeeAmount));
      return;
    }

    setFeeTotalAmount("");
    setFeeMonthlyAmount("");
  }, [feeConfigurations, feeSemesterId]);

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

  useEffect(() => {
    if (!["sections", "courseTeacherAssignments", "courseRegistrations"].includes(section)) {
      return;
    }
    void reloadSemesters();
  }, [debouncedSemesterSearch, section]);

  useEffect(() => {
    if (!["sections", "courseTeacherAssignments", "courseRegistrations", "batches"].includes(section)) {
      return;
    }
    void reloadBatches();
  }, [debouncedBatchSearch, section]);

  useEffect(() => {
    if (!["sections", "courseTeacherAssignments", "courseRegistrations"].includes(section)) {
      return;
    }
    void reloadSections();
  }, [debouncedSectionSearch, section]);

  useEffect(() => {
    if (!["courses", "courseTeacherAssignments", "courseRegistrations"].includes(section)) {
      return;
    }
    void reloadCourses();
  }, [debouncedCourseSearch, section]);

  useEffect(() => {
    if (!["teachers", "teacherApplications", "courseTeacherAssignments"].includes(section)) {
      return;
    }
    void reloadTeachers();
  }, [debouncedTeacherSearch, section]);

  useEffect(() => {
    if (!["students", "studentApplications", "courseRegistrations"].includes(section)) {
      return;
    }
    void reloadStudents();
  }, [debouncedStudentSearch, section]);

  useEffect(() => {
    if (section !== "transfers") {
      return;
    }
    void reloadInstitutionOptions();
  }, [debouncedTransferInstitutionSearch, section]);

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

  const removeTeacher = async (teacherProfileId: string) => {
    setUpdatingTeacherId(teacherProfileId);
    try {
      await DepartmentManagementService.removeTeacher(teacherProfileId);
      await reloadTeachers();
      toast.success("Teacher removed successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove teacher";
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

  const removeStudent = async (studentProfileId: string) => {
    setUpdatingStudentId(studentProfileId);
    try {
      await DepartmentManagementService.removeStudent(studentProfileId);
      await reloadStudents();
      toast.success("Student removed successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to remove student";
      toast.error(message);
    } finally {
      setUpdatingStudentId("");
    }
  };

  const reloadTransfers = async () => {
    const status = transferStatusFilter === "ALL" ? undefined : transferStatusFilter;
    const [incoming, outgoing] = await Promise.all([
      DepartmentManagementService.listIncomingTransferRequests(status),
      DepartmentManagementService.listOutgoingTransferRequests(status),
    ]);
    setIncomingTransfers(incoming);
    setOutgoingTransfers(outgoing);
  };

  const reloadInstitutionOptions = async (search?: string) => {
    setLoadingInstitutionOptions(true);
    try {
      const data = await DepartmentManagementService.listInstitutionOptions(
        search ?? debouncedTransferInstitutionSearch,
      );
      setInstitutionOptions(data);

      if (!transferTargetInstitutionId && data.length > 0) {
        setTransferTargetInstitutionId(data[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load institutions";
      toast.error(message);
    } finally {
      setLoadingInstitutionOptions(false);
    }
  };

  const createTransferRequest = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!transferProfileId.trim()) {
      toast.warning("Select a profile to transfer");
      return;
    }

    if (!transferTargetInstitutionId.trim()) {
      toast.warning("Target institution is required");
      return;
    }

    setCreatingTransferRequest(true);
    try {
      await DepartmentManagementService.createTransferRequest({
        entityType: transferEntityType,
        profileId: transferProfileId.trim(),
        targetInstitutionId: transferTargetInstitutionId.trim(),
        requestMessage: transferRequestMessage.trim() || undefined,
      });

      setTransferRequestMessage("");
      await reloadTransfers();
      toast.success("Transfer request submitted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit transfer request";
      toast.error(message);
    } finally {
      setCreatingTransferRequest(false);
    }
  };

  const reviewTransferRequest = async (
    transferRequest: InstitutionTransferRequest,
    status: "ACCEPTED" | "REJECTED",
  ) => {
    setReviewingTransferId(transferRequest.id);
    try {
      await DepartmentManagementService.reviewTransferRequest(transferRequest.id, {
        status,
        responseMessage: transferResponseMessageById[transferRequest.id]?.trim() || undefined,
        targetDepartmentId:
          transferTargetDepartmentIdById[transferRequest.id]?.trim() || undefined,
      });

      await reloadTransfers();
      toast.success(`Transfer request ${status.toLowerCase()} successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to review transfer request";
      toast.error(message);
    } finally {
      setReviewingTransferId("");
    }
  };

  const onSaveFeeConfiguration = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setFeeConfigurationErrors({});

    const totalFeeAmount = Number(feeTotalAmount);
    const monthlyFeeAmount = Number(feeMonthlyAmount);

    if (!feeSemesterId) {
      setFeeConfigurationErrors({ semesterId: "Select semester/session first" });
      return;
    }

    if (!Number.isFinite(totalFeeAmount) || totalFeeAmount <= 0) {
      setFeeConfigurationErrors({ totalFeeAmount: "Total fee amount must be a positive number" });
      return;
    }

    if (!Number.isFinite(monthlyFeeAmount) || monthlyFeeAmount <= 0) {
      setFeeConfigurationErrors({ monthlyFeeAmount: "Monthly fee amount must be a positive number" });
      return;
    }

    if (monthlyFeeAmount > totalFeeAmount) {
      setFeeConfigurationErrors({
        monthlyFeeAmount: "Monthly fee amount cannot exceed total fee amount",
      });
      return;
    }

    setSavingFeeConfiguration(true);
    try {
      await DepartmentManagementService.upsertFeeConfiguration({
        semesterId: feeSemesterId,
        totalFeeAmount,
        monthlyFeeAmount,
      });

      await reloadFeeConfigurations();
      setFeeConfigurationErrors({});
      toast.success("Fee configuration saved successfully");
    } catch (error) {
      const fieldErrors = mapFeeConfigurationFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setFeeConfigurationErrors(fieldErrors);
      }
      const message = error instanceof Error ? error.message : "Failed to save fee configuration";
      toast.error(message);
    } finally {
      setSavingFeeConfiguration(false);
    }
  };

  const onLookupStudentPayment = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    setStudentPaymentLookupErrors({});

    if (studentPaymentLookupId.trim().length < 2) {
      setStudentPaymentLookupErrors({ studentsId: "Provide a valid student ID" });
      return;
    }

    setLoadingStudentPaymentInfo(true);
    try {
      const data = await DepartmentManagementService.getStudentPaymentInfo(
        studentPaymentLookupId.trim(),
        studentPaymentSemesterId || undefined,
      );
      setStudentPaymentInfo(data);
      setStudentPaymentLookupErrors({});
    } catch (error) {
      const fieldErrors = mapStudentPaymentLookupFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setStudentPaymentLookupErrors(fieldErrors);
      }
      const message = error instanceof Error ? error.message : "Failed to fetch student payment info";
      toast.error(message);
      setStudentPaymentInfo(null);
    } finally {
      setLoadingStudentPaymentInfo(false);
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

  if (section === "notices") {
    return <NoticeWorkspace canCompose isUniversity={isUniversity} />;
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
            <SearchableSelect
              value={sectionSemesterId}
              onChange={setSectionSemesterId}
              options={semesters.map((item) => ({ value: item.id, label: formatSeasonYear(item) }))}
              placeholder="Select semester"
              searchPlaceholder="Search semester..."
              emptyText="No semester found"
              searchValue={semesterSearch}
              onSearchValueChange={setSemesterSearch}
              className="text-sm"
            />
            <SearchableSelect
              value={sectionBatchId}
              onChange={setSectionBatchId}
              options={batches.map((item) => ({ value: item.id, label: item.name }))}
              placeholder="Select batch"
              searchPlaceholder="Search batch..."
              emptyText="No batch found"
              searchValue={batchSearch}
              onSearchValueChange={setBatchSearch}
              className="text-sm"
            />
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
                    <SearchableSelect
                      value={editingSectionSemesterId}
                      onChange={setEditingSectionSemesterId}
                      options={semesters.map((semester) => ({ value: semester.id, label: formatSeasonYear(semester) }))}
                      placeholder="Select semester"
                      searchPlaceholder="Search semester..."
                      emptyText="No semester found"
                      searchValue={semesterSearch}
                      onSearchValueChange={setSemesterSearch}
                    />
                    <SearchableSelect
                      value={editingSectionBatchId}
                      onChange={setEditingSectionBatchId}
                      options={batches.map((batch) => ({ value: batch.id, label: batch.name }))}
                      placeholder="Select batch"
                      searchPlaceholder="Search batch..."
                      emptyText="No batch found"
                      searchValue={batchSearch}
                      onSearchValueChange={setBatchSearch}
                    />
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

  if (section === "schedules") {
    return <DepartmentRoutineWorkspace section="schedules" />;
  }

  if (section === "classrooms") {
    return <DepartmentRoutineWorkspace section="classrooms" />;
  }

  if (section === "routines") {
    return <DepartmentRoutineWorkspace section="routines" />;
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
            <SearchableSelect
              value={assignmentSemesterId}
              onChange={setAssignmentSemesterId}
              options={semesters.map((item) => ({ value: item.id, label: formatSeasonYear(item) }))}
              placeholder="Select semester"
              searchPlaceholder="Search semester..."
              emptyText="No semester found"
              searchValue={semesterSearch}
              onSearchValueChange={setSemesterSearch}
              className="text-sm"
            />

            <SearchableSelect
              value={assignmentBatchId}
              onChange={setAssignmentBatchId}
              options={batches.map((item) => ({ value: item.id, label: item.name }))}
              placeholder="Select batch"
              searchPlaceholder="Search batch..."
              emptyText="No batch found"
              searchValue={batchSearch}
              onSearchValueChange={setBatchSearch}
              className="text-sm"
            />

            <SearchableSelect
              value={assignmentSectionId}
              onChange={setAssignmentSectionId}
              options={filteredSectionsForTeacherAssignment.map((item) => ({ value: item.id, label: item.name }))}
              placeholder="Select section"
              searchPlaceholder="Search section..."
              emptyText="No section found"
              searchValue={sectionSearch}
              onSearchValueChange={setSectionSearch}
              className="text-sm"
            />

            <SearchableSelect
              value={assignmentCourseId}
              onChange={setAssignmentCourseId}
              options={courses.map((item) => ({ value: item.id, label: `${item.courseCode} - ${item.courseTitle}` }))}
              placeholder="Select course"
              searchPlaceholder="Search course..."
              emptyText="No course found"
              searchValue={courseSearch}
              onSearchValueChange={setCourseSearch}
              className="text-sm"
            />

            <SearchableSelect
              value={assignmentTeacherProfileId}
              onChange={setAssignmentTeacherProfileId}
              options={teachers.map((item) => ({ value: item.id, label: `${item.user.name} (${item.teacherInitial})` }))}
              placeholder="Select teacher"
              searchPlaceholder="Search teacher..."
              emptyText="No teacher found"
              searchValue={teacherSearch}
              onSearchValueChange={setTeacherSearch}
              className="text-sm"
            />
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
            <SearchableSelect
              value={registrationSemesterId}
              onChange={setRegistrationSemesterId}
              options={semesters.map((item) => ({ value: item.id, label: formatSeasonYear(item) }))}
              placeholder="Select semester"
              searchPlaceholder="Search semester..."
              emptyText="No semester found"
              searchValue={semesterSearch}
              onSearchValueChange={setSemesterSearch}
              className="text-sm"
            />

            <SearchableSelect
              value={registrationBatchId}
              onChange={setRegistrationBatchId}
              options={batches.map((item) => ({ value: item.id, label: item.name }))}
              placeholder="Select batch"
              searchPlaceholder="Search batch..."
              emptyText="No batch found"
              searchValue={batchSearch}
              onSearchValueChange={setBatchSearch}
              className="text-sm"
            />

            <SearchableSelect
              value={registrationSectionId}
              onChange={setRegistrationSectionId}
              options={filteredSectionsForRegistration.map((item) => ({ value: item.id, label: item.name }))}
              placeholder="Select section"
              searchPlaceholder="Search section..."
              emptyText="No section found"
              searchValue={sectionSearch}
              onSearchValueChange={setSectionSearch}
              className="text-sm"
            />

            <SearchableSelect
              value={registrationCourseId}
              onChange={setRegistrationCourseId}
              options={courses.map((item) => ({ value: item.id, label: `${item.courseCode} - ${item.courseTitle}` }))}
              placeholder="Select course"
              searchPlaceholder="Search course..."
              emptyText="No course found"
              searchValue={courseSearch}
              onSearchValueChange={setCourseSearch}
              className="text-sm"
            />

            <SearchableSelect
              value={registrationStudentProfileId}
              onChange={setRegistrationStudentProfileId}
              options={students.map((item) => ({ value: item.id, label: `${item.user.name} (${item.studentsId})` }))}
              placeholder="Select student"
              searchPlaceholder="Search student..."
              emptyText="No student found"
              searchValue={studentSearch}
              onSearchValueChange={setStudentSearch}
              className="text-sm"
            />
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
                    <SearchableSelect
                      value={editingRegistrationSemesterId}
                      onChange={setEditingRegistrationSemesterId}
                      options={semesters.map((semester) => ({ value: semester.id, label: formatSeasonYear(semester) }))}
                      placeholder="Select semester"
                      searchPlaceholder="Search semester..."
                      emptyText="No semester found"
                      searchValue={semesterSearch}
                      onSearchValueChange={setSemesterSearch}
                    />
                    <SearchableSelect
                      value={editingRegistrationBatchId}
                      onChange={setEditingRegistrationBatchId}
                      options={batches.map((batchItem) => ({ value: batchItem.id, label: batchItem.name }))}
                      placeholder="Select batch"
                      searchPlaceholder="Search batch..."
                      emptyText="No batch found"
                      searchValue={batchSearch}
                      onSearchValueChange={setBatchSearch}
                    />
                    <SearchableSelect
                      value={editingRegistrationSectionId}
                      onChange={setEditingRegistrationSectionId}
                      options={filteredSectionsForEditingRegistration.map((sectionItem) => ({ value: sectionItem.id, label: sectionItem.name }))}
                      placeholder="Select section"
                      searchPlaceholder="Search section..."
                      emptyText="No section found"
                      searchValue={sectionSearch}
                      onSearchValueChange={setSectionSearch}
                    />
                    <SearchableSelect
                      value={editingRegistrationCourseId}
                      onChange={setEditingRegistrationCourseId}
                      options={courses.map((courseItem) => ({ value: courseItem.id, label: `${courseItem.courseCode} - ${courseItem.courseTitle}` }))}
                      placeholder="Select course"
                      searchPlaceholder="Search course..."
                      emptyText="No course found"
                      searchValue={courseSearch}
                      onSearchValueChange={setCourseSearch}
                    />
                    <SearchableSelect
                      value={editingRegistrationStudentProfileId}
                      onChange={setEditingRegistrationStudentProfileId}
                      options={students.map((studentItem) => ({ value: studentItem.id, label: `${studentItem.user.name} (${studentItem.studentsId})` }))}
                      placeholder="Select student"
                      searchPlaceholder="Search student..."
                      emptyText="No student found"
                      searchValue={studentSearch}
                      onSearchValueChange={setStudentSearch}
                    />
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
                <button
                  type="button"
                  onClick={() => void removeTeacher(item.id)}
                  disabled={updatingTeacherId === item.id}
                  className="rounded-lg border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>
    );
  }

  if (section === "transfers") {
    const transferProfileOptions =
      transferEntityType === "STUDENT"
        ? students.map((item) => ({
            value: item.id,
            label: `${item.user.name} (${item.studentsId})`,
          }))
        : teachers.map((item) => ({
            value: item.id,
            label: `${item.user.name} (${item.teachersId})`,
          }));

    return (
      <article className="space-y-5 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Institution Transfers</h2>
        {loadingIndicator}

        <form onSubmit={createTransferRequest} className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-4">
          <h3 className="text-sm font-semibold">Create Transfer Request</h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium">Entity Type</span>
              <select
                value={transferEntityType}
                onChange={(event) => {
                  const value = event.target.value as InstitutionTransferEntityType;
                  setTransferEntityType(value);
                  setTransferProfileId("");
                }}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium">Profile</span>
              <select
                value={transferProfileId}
                onChange={(event) => setTransferProfileId(event.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select profile</option>
                {transferProfileOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Target Institution</span>
            <SearchableSelect
              value={transferTargetInstitutionId}
              onChange={setTransferTargetInstitutionId}
              options={institutionOptions.map((item) => ({
                value: item.id,
                label: item.shortName ? `${item.name} (${item.shortName})` : item.name,
                imageUrl: item.institutionLogo,
              }))}
              placeholder={
                loadingInstitutionOptions ? "Loading institutions..." : "Select target institution"
              }
              searchPlaceholder="Search institutions"
              searchValue={transferInstitutionSearch}
              onSearchValueChange={setTransferInstitutionSearch}
              emptyText="No institutions found"
              disabled={loadingInstitutionOptions}
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-medium">Request Message (optional)</span>
            <textarea
              value={transferRequestMessage}
              onChange={(event) => setTransferRequestMessage(event.target.value)}
              rows={3}
              placeholder="Reason for transfer"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={creatingTransferRequest}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {creatingTransferRequest ? "Submitting..." : "Create Transfer Request"}
          </button>
        </form>

        <div className="rounded-xl border border-border/70 bg-background/70 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Incoming Requests</h3>
            <select
              value={transferStatusFilter}
              onChange={(event) =>
                setTransferStatusFilter(event.target.value as InstitutionTransferStatus | "ALL")
              }
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
            >
              {TRANSFER_STATUS_FILTER_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {incomingTransfers.map((request) => (
              <div key={request.id} className="rounded-xl border border-border/70 bg-card/80 p-3 text-sm">
                <p className="font-medium">
                  {request.entityType} transfer | {request.status}
                </p>
                <p className="text-muted-foreground">
                  From: {request.sourceInstitution?.name ?? request.sourceInstitutionId}
                </p>
                <p className="text-muted-foreground">
                  Profile: {request.teacherProfile?.user?.name ?? request.studentProfile?.user?.name ?? "-"}
                </p>
                {request.status === "PENDING" && (
                  <div className="mt-2 space-y-2">
                    {request.entityType === "TEACHER" && (
                      <input
                        value={transferTargetDepartmentIdById[request.id] ?? ""}
                        onChange={(event) =>
                          setTransferTargetDepartmentIdById((prev) => ({
                            ...prev,
                            [request.id]: event.target.value,
                          }))
                        }
                        placeholder="Target department UUID (required for teacher)"
                        className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs"
                      />
                    )}
                    <input
                      value={transferResponseMessageById[request.id] ?? ""}
                      onChange={(event) =>
                        setTransferResponseMessageById((prev) => ({
                          ...prev,
                          [request.id]: event.target.value,
                        }))
                      }
                      placeholder="Response message (optional)"
                      className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void reviewTransferRequest(request, "ACCEPTED")}
                        disabled={reviewingTransferId === request.id}
                        className="rounded-lg bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => void reviewTransferRequest(request, "REJECTED")}
                        disabled={reviewingTransferId === request.id}
                        className="rounded-lg border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {incomingTransfers.length === 0 && (
              <p className="text-sm text-muted-foreground">No incoming transfer requests found.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/70 p-4">
          <h3 className="mb-3 text-sm font-semibold">Outgoing Requests</h3>
          <div className="space-y-3">
            {outgoingTransfers.map((request) => (
              <div key={request.id} className="rounded-xl border border-border/70 bg-card/80 p-3 text-sm">
                <p className="font-medium">
                  {request.entityType} transfer | {request.status}
                </p>
                <p className="text-muted-foreground">
                  To: {request.targetInstitution?.name ?? request.targetInstitutionId}
                </p>
                <p className="text-muted-foreground">
                  Profile: {request.teacherProfile?.user?.name ?? request.studentProfile?.user?.name ?? "-"}
                </p>
                {request.responseMessage ? (
                  <p className="mt-1 text-muted-foreground">Response: {request.responseMessage}</p>
                ) : null}
              </div>
            ))}
            {outgoingTransfers.length === 0 && (
              <p className="text-sm text-muted-foreground">No outgoing transfer requests found.</p>
            )}
          </div>
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

  if (section === "fees") {
    return (
      <article className="space-y-4 rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Fee Management</h2>
        <p className="text-sm text-muted-foreground">
          Configure semester/session wise fees and inspect student payment details by student ID.
        </p>
        {loadingIndicator}

        <form className="space-y-3" onSubmit={onSaveFeeConfiguration}>
          {feeConfigurationErrors.form ? (
            <p className="text-sm text-destructive">{feeConfigurationErrors.form}</p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SearchableSelect
              value={feeSemesterId}
              onChange={(value) => {
                setFeeSemesterId(value);
                setFeeConfigurationErrors((current) => ({ ...current, semesterId: undefined }));
              }}
              options={semesters.map((item) => ({ value: item.id, label: item.name }))}
              placeholder="Select semester/session"
              searchPlaceholder="Search semester..."
              emptyText="No semester found"
              className={feeConfigurationErrors.semesterId ? "border-destructive" : undefined}
            />
            {feeConfigurationErrors.semesterId ? (
              <p className="text-xs text-destructive md:col-span-3">{feeConfigurationErrors.semesterId}</p>
            ) : null}
            <input
              type="number"
              min={0}
              step="0.01"
              value={feeTotalAmount}
              onChange={(event) => {
                setFeeTotalAmount(event.target.value);
                setFeeConfigurationErrors((current) => ({ ...current, totalFeeAmount: undefined }));
              }}
              placeholder="Total fee amount"
              aria-invalid={Boolean(feeConfigurationErrors.totalFeeAmount)}
              className={`rounded-xl border bg-background px-3 py-2 text-sm ${
                feeConfigurationErrors.totalFeeAmount ? "border-destructive" : "border-border"
              }`}
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={feeMonthlyAmount}
              onChange={(event) => {
                setFeeMonthlyAmount(event.target.value);
                setFeeConfigurationErrors((current) => ({ ...current, monthlyFeeAmount: undefined }));
              }}
              placeholder="Monthly fee amount"
              aria-invalid={Boolean(feeConfigurationErrors.monthlyFeeAmount)}
              className={`rounded-xl border bg-background px-3 py-2 text-sm ${
                feeConfigurationErrors.monthlyFeeAmount ? "border-destructive" : "border-border"
              }`}
            />
            {feeConfigurationErrors.totalFeeAmount ? (
              <p className="text-xs text-destructive">{feeConfigurationErrors.totalFeeAmount}</p>
            ) : null}
            {feeConfigurationErrors.monthlyFeeAmount ? (
              <p className="text-xs text-destructive">{feeConfigurationErrors.monthlyFeeAmount}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={savingFeeConfiguration}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {savingFeeConfiguration ? "Saving..." : "Save Fee Configuration"}
          </button>
        </form>

        <div className="space-y-2">
          {loadingPageData ? (
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading fee configurations...
            </div>
          ) : null}
          {feeConfigurations.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm">
              <p className="font-medium">{item.semester.name}</p>
              <p className="text-muted-foreground">
                Total: {formatAmount(item.totalFeeAmount, item.currency)} | Monthly: {formatAmount(item.monthlyFeeAmount, item.currency)}
              </p>
              <p className="text-muted-foreground">
                Collected: {formatAmount(item.totalPaidAmount, item.currency)} | Outstanding: {formatAmount(item.outstandingAmount, item.currency)}
              </p>
            </div>
          ))}
          {feeConfigurations.length === 0 && !loadingPageData ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
              No fee configuration found yet.
            </p>
          ) : null}
        </div>

        <form className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4" onSubmit={onLookupStudentPayment}>
          <h3 className="text-sm font-semibold">Student Payment Info</h3>
          {studentPaymentLookupErrors.form ? (
            <p className="text-sm text-destructive">{studentPaymentLookupErrors.form}</p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={studentPaymentLookupId}
              onChange={(event) => {
                setStudentPaymentLookupId(event.target.value);
                setStudentPaymentLookupErrors((current) => ({ ...current, studentsId: undefined }));
              }}
              placeholder="Student ID"
              aria-invalid={Boolean(studentPaymentLookupErrors.studentsId)}
              className={`rounded-xl border bg-background px-3 py-2 text-sm ${
                studentPaymentLookupErrors.studentsId ? "border-destructive" : "border-border"
              }`}
            />
            <SearchableSelect
              value={studentPaymentSemesterId}
              onChange={(value) => {
                setStudentPaymentSemesterId(value);
                setStudentPaymentLookupErrors((current) => ({ ...current, semesterId: undefined }));
              }}
              options={[{ value: "", label: "All semesters" }, ...semesters.map((item) => ({ value: item.id, label: item.name }))]}
              placeholder="All semesters"
              searchPlaceholder="Search semester..."
              emptyText="No semester found"
              className={studentPaymentLookupErrors.semesterId ? "border-destructive" : undefined}
            />
            <button
              type="submit"
              disabled={loadingStudentPaymentInfo}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {loadingStudentPaymentInfo ? "Loading..." : "Lookup"}
            </button>
            {studentPaymentLookupErrors.studentsId ? (
              <p className="text-xs text-destructive">{studentPaymentLookupErrors.studentsId}</p>
            ) : null}
            {studentPaymentLookupErrors.semesterId ? (
              <p className="text-xs text-destructive">{studentPaymentLookupErrors.semesterId}</p>
            ) : null}
          </div>
        </form>

        {studentPaymentInfo ? (
          <div className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4 text-sm">
            <p className="font-semibold">
              {studentPaymentInfo.student.user.name} ({studentPaymentInfo.student.studentsId})
            </p>
            <p className="text-muted-foreground">{studentPaymentInfo.student.user.email}</p>

            <div className="space-y-2">
              {studentPaymentInfo.feeSummaries.map((item) => (
                <div key={item.feeConfigurationId} className="rounded-lg border border-border/70 bg-background px-3 py-2">
                  <p className="font-medium">{item.semester.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Paid: {formatAmount(item.paidAmount, item.currency)} | Due: {formatAmount(item.dueAmount, item.currency)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {studentPaymentInfo.paymentHistory.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/70 bg-background px-3 py-2 text-xs">
                  <p className="font-medium">
                    {item.semester.name} • {item.paymentMode} • {formatAmount(item.amount, item.currency)}
                  </p>
                  <p className="text-muted-foreground">
                    Status: {item.status} | Tran ID: {item.tranId}
                  </p>
                </div>
              ))}
              {studentPaymentInfo.paymentHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground">No payment history found for this student.</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {!studentPaymentInfo && loadingStudentPaymentInfo ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading student payment info...
          </div>
        ) : null}
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
              <button
                type="button"
                onClick={() => void removeStudent(item.id)}
                disabled={updatingStudentId === item.id}
                className="rounded-lg border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive disabled:opacity-60"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
