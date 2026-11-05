import api from "../../../services/api";
import type { FollowupStatus } from "../enquiry/addEnquiryTypes";
import {
  StudentSearchRequest,
  StudentSearchResponse,
} from "./enquiryListTypes";
import { EnquiryFormData } from "./validations/enquirySchema";

export const getFollowupStatuses = async (
  instituteId: number,
  branchId: number,
) => {
  const response = await api.get(
    `/Common/get_followup-status/${instituteId}/${branchId}`,
  );

  return response.data;
};
export interface CourseSubject {
  subId: number;
  subName: string;
  feesType: string;
  isCourseLvl: number;
}

export interface CourseWithSubjects {
  courseId: number;
  courseName: string;
  isCourseLvl: number;
  courseFeeWise: number;
  subjects: CourseSubject[];
}

export const getCoursesWithSubjects = async (
  branchId: number,
): Promise<CourseWithSubjects[]> => {
  const response = await api.get("/Common/get_courses_with_subjects", {
    params: {
      BranchId: branchId,
    },
  });

  return response.data?.data ?? [];
};

export interface EducationQualificationPayload {
  degree: string;
  college: string;
  stream: string;
  percentage: string;
  year: string;
}

export interface AddEnquiryPayload {
  // Registration / Enquiry
  regDate: string | null;
  enquiryDate: string | null;
  walkInDate: string | null;
  walkIn: string;

  // Personal
  gender: number;
  salutation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  Mobile: string;
  email: string;
  biometricAttendanceId: string;

  // Academic
  selectedSubjects: string;
  selectedCourses: string;
  otherFeesIds: string;
  batchIds: number[];

  // Correspondence Address
  address: string;
  countryId: number;
  stateId: number;
  cityId: number;
  otherCity: string;
  pinCode: string;

  // Permanent Address
  permanentAddress: string;
  countryIdC: number;
  stateIdC: number;
  cityIdC: number;
  otherCityC: string;
  pinCodeC: string;

  // Contact
  homePhone: string;

  // Personal Additional
  dateOfBirth: string | null;
  age: number;
  category: string;
  photo: string | null;
  // Work
  workStatus: string;
  occupation: string;
  organization: string;
  salary: number;

  // Other
  source: string;
  comments: string;

  // Father
  fatherFirstName: string;
  fatherMiddleName: string;
  fatherLastName: string;
  mobile1: string;

  // Mother
  motherFirstName: string;
  motherMiddleName: string;
  motherLastName: string;
  mobile2: string;

  // Parent
  parentCompanyName: string;
  parentGSTNo: string;

  // Education
  education: EducationQualificationPayload[];

  // Follow-up
  // Follow-up
  enableFollowUp: boolean;
  followUpStatusId: number | null;
  followUpRemarks: string;
  followUpDate: string | null;

  // Status / Remarks
  isInterested: boolean;
  remarks: string;
  enqStatus: number;

  // Branch
  branchId: number;
}

export const addEnquiry = async (payload: AddEnquiryPayload) => {
  const response = await api.post("/Student/enquiry_student", payload);

  return response.data;
};
export interface Batch {
  id: number;
  name: string;
}

export const getBatchesBySubjects = async (
  instituteId: number,
  branchId: number,
  subjectIds: number[],
): Promise<Batch[]> => {
  const response = await api.get(
    `/Common/get_batches-by-subjects/${instituteId}/${branchId}`,
    {
      params: {
        subjectIds: subjectIds.join(","),
      },
    },
  );

  return response.data.data;
};
export const searchStudents = async (
  payload: StudentSearchRequest,
): Promise<StudentSearchResponse> => {
  console.log("SEARCH STUDENTS PAYLOAD:", payload);

  const response = await api.post("/Student/search_students", payload, {
    showLoader: false,
  });

  console.log("SEARCH STUDENTS RESPONSE:", response.data);

  const data = response.data.data;

  console.log("RAW STUDENT ITEMS:", data.items);

  return {
    ...data,
    items: (data.items ?? []).map((item: any) => ({
      RegNo: item.regNo ?? "",
      Name: item.name ?? "",
      PContact: item.pContact ?? "",
      FMobile: item.fMobile ?? "",
      MMobile: item.mMobile ?? "",
      EmailId: item.emailId ?? "",
      Status: item.status ?? "",
      Registered: item.registered ?? "",

      // Course / Subject / Batch
      courseNames: item.courseNames ?? "",
      subjectNames: item.subjectNames ?? "",
      batchNames: item.batchNames ?? "",

      RegNo_Manual: item.regNo_Manual ?? "",
      RegDate: item.regDate ?? "",
      BranchId: item.branchId ?? 0,
      EnqStatus: item.enqStatus ?? "",
      Username: item.username ?? "",
      AllowStudModule: item.allowStudModule ?? false,
    })),
  };
};
export interface Source {
  id: number;
  name: string;
}

export const getSources = async (): Promise<Source[]> => {
  const response = await api.get("/Common/get_sources");

  return response.data?.data ?? [];
};
export const getStudentById = async (studentId: number, branchId: number) => {
  const response = await api.get(
    `/Student/get_student_for_edit/${studentId}?branchId=${branchId}`,
  );

  return response.data;
};
export const deleteStudent = async (payload: {
  studentId: number;
  status: number;
}) => {
  const response = await api.delete("/Student/delete_student", {
    data: payload,
  });

  return response.data;
};

export const bulkDeleteStudents = async (payload: { studentIds: number[] }) => {
  const response = await api.delete("/Student/bulk_delete_students", {
    data: payload,
  });

  return response.data;
};
export interface BulkUpdateStudentStatusRequest {
  studentIds: number[];
  status: number;
  inactiveStatus: string;
}

export const bulkUpdateStudentStatus = async (
  payload: BulkUpdateStudentStatusRequest,
) => {
  const response = await api.put(
    "/Student/bulk_update_student_status",
    payload,
  );

  return response.data;
};
