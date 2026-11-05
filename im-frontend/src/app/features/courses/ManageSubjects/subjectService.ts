import api from "../../../services/api";

import type {
  SubjectList,
  InstituteSubjectResponse,
  CreateSubjectRequest,
} from "./types";

/* ============================================================
   MANAGE SUBJECT
============================================================ */

export type SubjectListResponse = {
  items: SubjectList[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

/* ============================================================
   GET SUBJECT - BRANCH LEVEL
============================================================ */
export interface SubjectSearchRequest {
  pageNumber: number;
  pageSize: number;
  subjectName: string;
  crclmId: number;
  courseId: number;
  status: number;
  branchId?: number;

  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export const getSubjects = async (
  payload: SubjectSearchRequest,
): Promise<SubjectListResponse> => {
  const requestBody = {
    pageNumber: payload.pageNumber,
    pageSize: payload.pageSize,
    subjectName: payload.subjectName,
    crclmId: payload.crclmId,
    courseId: payload.courseId,
    status: payload.status,
    branchId: payload.branchId,
    sortBy: payload.sortBy,
    sortDirection: payload.sortDirection,
  };

  console.log("SUBJECT SEARCH REQUEST:", requestBody);

  const response = await api.post("/subject/subject-search", requestBody, {
    showLoader: false,
  });

  console.log("GET SUBJECT RESPONSE:", response.data);

  return response.data.data;
};
/* ============================================================
   GET SUBJECT BY ID
============================================================ */

export const getSubjectById = async (subjectId: number) => {
  const response = await api.get(`/subject/get-subject/${subjectId}`);

  return response.data;
};

/* ============================================================
   CREATE SUBJECT
============================================================ */

export const createSubject = async (payload: CreateSubjectRequest) => {
  const response = await api.post("/subject/add-subject", payload, {
    showLoader: true,
  });

  return response.data;
};

/* ============================================================
   UPDATE SUBJECT
============================================================ */
export const updateSubject = async (
  subjectId: number,
  payload: CreateSubjectRequest,
) => {
  const response = await api.put(
    `/subject/update-subject?subjectId=${subjectId}`,
    payload,
    { showLoader: true },
  );

  return response.data;
};
/* ============================================================
   DELETE SUBJECT
============================================================ */
export const deleteSubject = async (
  subjectId: number,
  deleteStatus: boolean = true,
) => {
  const response = await api.delete(`/Subject/delete-subject/${subjectId}`, {
    params: {
      deleteStatus,
    },
    showLoader: true,
  });

  return response.data;
};
/* ============================================================
   INSTITUTE SUBJECTS AVAILABLE FOR IMPORT
============================================================ */

/* ============================================================
   INSTITUTE SUBJECTS AVAILABLE FOR IMPORT
============================================================ */

export type InstituteSubjectSearchRequest = {
  courseId: number;
  crclmId: number;
  refCourseId: number;
  pageNumber: number;
  pageSize: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
};

export const getInstituteSubjectsByCourse = async (
  request: InstituteSubjectSearchRequest,
) => {
  const response = await api.post(
    "/Subject/institute-subjects",
    {
      pageNumber: request.pageNumber,
      pageSize: request.pageSize,
      courseId: request.courseId,
      refCourseId: request.refCourseId,
      crclmId: request.crclmId,
      sortBy: request.sortBy ?? "",
      sortDirection: request.sortDirection ?? "",
    },
    {
      showLoader: false,
    },
  );

  return response.data;
};
/* ============================================================
   IMPORT SUBJECT(S) FROM INSTITUTE
============================================================ */

export interface SubmitInstituteSubjectsRequest {
  courseId: number;
  refCourseId: number;
  instSubIds: number[];
  branchId: number;
}

export const importSubject = async (
  request: SubmitInstituteSubjectsRequest,
) => {
  const response = await api.post(
    "/Subject/submit-institute-subjects",
    request,
    {
      showLoader: true,
    },
  );

  return response.data;
};
/* ============================================================
   SET INSTALLMENT TEMPLATE
============================================================ */

export interface SetInstallmentTemplateRequest {
  courseFee: number;
  maxInstallment: number;
  day: number;
  branchId: number;
}

/* ============================================================
   FIXED INSTALLMENT
============================================================ */

export const setFixedInstallment = async (
  payload: SetInstallmentTemplateRequest,
) => {
  const response = await api.post("/subject/set-interval-days", payload, {
    showLoader: true,
  } as any);

  return response.data;
};

export const setMonthlyInstallment = async (
  payload: SetInstallmentTemplateRequest,
) => {
  const response = await api.post("/subject/set-monthly-interval", payload, {
    showLoader: true,
  } as any);

  return response.data;
};

export const setQuarterlyInstallment = async (
  payload: SetInstallmentTemplateRequest,
) => {
  const response = await api.post("/subject/set-quarterly-interval", payload, {
    showLoader: true,
  } as any);

  return response.data;
};
export interface ExportSubjectRequest {
  subjectIds: number[];
  branchIds: number[];
}

export const exportSubject = async (payload: ExportSubjectRequest) => {
  const response = await api.post("/subject/export-subject", payload, {
    showLoader: true,
  });

  return response.data;
};
export interface ExpSubjectSearchRequest {
  pageNumber: number;
  pageSize: number;
  subjectName: string;
  status: number;
  branchId: number;
  crclmIds: number[];
  courseIds: number[];
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export const getExportSubjects = async (
  payload: ExpSubjectSearchRequest,
): Promise<SubjectListResponse> => {
  const response = await api.post(
    "/subject/get-institute-subjects-by-course-crclm",
    payload,
    {
      showLoader: false,
    },
  );

  return response.data.data;
};
