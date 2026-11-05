import api from "../../../services/api";

import type {
  CourseList,
  InstituteCourses,
  InstituteCourseResponse,
  CreateCourseRequest,
  InstituteSubjectApi,
  InstituteSubjectResponse,
} from "./types";

/* ============================================================
   MANAGE COURSES
============================================================ */

export interface CourseSearchRequest {
  courseName: string;
  status: number;
  pageNumber: number;
  pageSize: number;
  instituteId?: number;
  branchId?: number;
  curriculumId?: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export type CourseListResponse = {
  items: CourseList[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

/* ============================================================
   GET COURSES - BRANCH LEVEL
============================================================ */

export const getCourses = async (
  payload: CourseSearchRequest,
): Promise<CourseListResponse> => {
  const activeInstituteId =
    payload.instituteId || Number(localStorage.getItem("instituteId")) || 0;

  const requestBody = {
    ...payload,
    instituteId: activeInstituteId > 0 ? activeInstituteId : undefined,
  };

  const response = await api.post("/course/course-search", requestBody, {
    showLoader: false,
  });

  console.log("GET COURSES RESPONSE:", response.data);

  return response.data.data;
};

/* ============================================================
   GET COURSE BY ID
============================================================ */

export const getCourseById = async (courseId: number) => {
  const response = await api.get(`/course/get-course/${courseId}`);

  return response.data;
};

/* ============================================================
   CREATE COURSE
============================================================ */

export const createCourse = async (payload: CreateCourseRequest) => {
  const response = await api.post("/course/create-course", payload, {
    showLoader: true,
  });

  return response.data;
};

/* ============================================================
   UPDATE COURSE
============================================================ */

export const updateCourse = async (payload: any) => {
  const response = await api.put("/course/update-course", payload, {
    showLoader: true,
  });

  return response.data;
};

/* ============================================================
   DELETE COURSE
============================================================ */

export const deleteCourse = async (courseId: number) => {
  const response = await api.delete(`/course/${courseId}`, {
    showLoader: true,
  });

  return response.data;
};

/* ============================================================
   INSTITUTE COURSES AVAILABLE FOR IMPORT
============================================================ */

export interface InstituteCourseSearchRequest {
  pageNumber: number;
  pageSize: number;
  branchId: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export const getInstituteCourse = async ({
  pageNumber,
  pageSize,
  branchId,
  sortBy,
  sortDirection,
}: InstituteCourseSearchRequest): Promise<InstituteCourseResponse> => {
  const response = await api.post(
    "/course/courses-institute",
    {
      pageNumber,
      pageSize,
      branchId,
      sortBy,
      sortDirection,
    },
    {
      showLoader: false,
    },
  );

  console.log("GET INSTITUTE COURSES RESPONSE:", response.data);

  return response.data.data ?? response.data;
};

/* ============================================================
   IMPORT COURSE(S) FROM INSTITUTE
============================================================ */

export const importCourse = async (
  courseIds: number[],
  branchId: number,
  pageNumber = 0,
  pageSize = 0,
) => {
  const response = await api.post(
    "/course/add-courses-institute",
    {
      pageNumber,
      pageSize,
      courseIds,
      branchId,
    },
    {
      showLoader: true,
    },
  );

  console.log("IMPORT COURSE RESPONSE:", response.data);

  return response.data;
};

export interface Staff {
  trainerId: number;
  name: string;
}
export const getCounsellors = async (
  instituteId: number,
  branchId: number,
): Promise<Staff[]> => {
  try {
    const response = await api.get(
      `/Common/counselors/${instituteId}/${branchId}`,
    );

    return response.data?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch counsellors:", error);
    throw error;
  }
};
export const getAllStaff = async (
  instituteId: number,
  branchId: number,
): Promise<Staff[]> => {
  const response = await api.get(`/Common/allstaff/${instituteId}/${branchId}`);

  return response.data?.data ?? [];
};
export interface SetInstallmentTemplateRequest {
  courseFee: number;
  maxInstallment: number;
  day: number;
  branchId: number;
}

export const setFixedInstallment = async (
  payload: SetInstallmentTemplateRequest,
) => {
  const response = await api.post("/course/set-interval-days", payload, {
    showLoader: true,
  } as any);

  return response.data;
};

export const setMonthlyInstallment = async (
  payload: SetInstallmentTemplateRequest,
) => {
  const response = await api.post("/course/set-monthly-interval", payload, {
    showLoader: true,
  } as any);

  return response.data;
};

export const setQuarterlyInstallment = async (
  payload: SetInstallmentTemplateRequest,
) => {
  const response = await api.post("/course/set-quarterly-interval", payload, {
    showLoader: true,
  } as any);

  return response.data;
};
export interface CourseSubjectsRequest {
  courseIds: number[];
  branchId: number;
  pageNumber: number;
  pageSize: number;
}

export const getCourseSubjects = async (
  payload: CourseSubjectsRequest,
): Promise<InstituteSubjectResponse> => {
  const response = await api.post(
    "/course/course-subjects-institute",
    payload,
    {
      showLoader: false,
    },
  );

  console.log("GET COURSE SUBJECTS RESPONSE:", response.data);

  return (
    response.data?.data ?? {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: payload.pageSize,
      totalPages: 0,
      hasPrevious: false,
      hasNext: false,
    }
  );
};
export interface ExportCourseRequest {
  courseIds: number[];
  branchIds: number[];
}

export const exportCourse = async (payload: ExportCourseRequest) => {
  const response = await api.post("/course/export-course", payload, {
    showLoader: true,
  });

  return response.data;
};
export interface ExpCourseSearchRequest {
  courseName: string;
  status: number;
  pageNumber: number;
  pageSize: number;
  instituteId?: number;
  branchId?: number;
  crclmIds: number[];
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export const getExportCourses = async (
  payload: ExpCourseSearchRequest,
): Promise<CourseListResponse> => {
  const activeInstituteId =
    payload.instituteId || Number(localStorage.getItem("instituteId")) || 0;

  const requestBody = {
    ...payload,
    instituteId: activeInstituteId > 0 ? activeInstituteId : undefined,
  };

  const response = await api.post(
    "/course/get-institute-courses-by-CrclmIds",
    requestBody,
    {
      showLoader: false,
    },
  );

  console.log("GET EXPORT COURSES RESPONSE:", response.data);

  return response.data.data;
};
