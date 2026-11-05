import api from "../../../services/api";

import type { StudentSearchRequest, StudentSearchResponse } from "./types";
import { OtherFee } from "./types";
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
      RegNo_Manual: item.regNo_Manual ?? "",
      RegDate: item.regDate ?? "",
      BranchId: item.branchId ?? 0,
      EnqStatus: item.enqStatus ?? "",
      Username: item.username ?? "",
      AllowStudModule: item.allowStudModule ?? false,
      CourseNames: item.courseNames ?? "-",
      SubjectNames: item.subjectNames ?? "-",
      BatchNames: item.batchNames ?? "-",
    })),
  };
};
export interface AutoRegNoResponse {
  registrationNo: string;
  tempRegNo?: number;
  systemGen?: boolean;
  regFormat?: number;
  regLevel?: number;
}
export const getAutoRegNo = async (
  instituteId: number,
  branchId: number,
): Promise<AutoRegNoResponse> => {
  const response = await api.get("/Student/auto-reg-no", {
    params: {
      instituteId,
      branchId,
    },
    showLoader: false,
  });

  return response.data.data;
};
export interface DropdownItemDto {
  id: string;
  name: string;
}

export const getRegNoManual = async (
  branchId: number,
): Promise<DropdownItemDto[]> => {
  const response = await api.get("/Student/get-reg-no-manual", {
    params: { branchId },
    showLoader: false,
  });

  return response.data.data;
};
export interface StudentRegistrationResponse {
  success: boolean;
  message: string;
  studentId: number | null;
  regNo: string | null;
}

export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
}

export const registerStudent = async (
  payload: Record<string, unknown>,
): Promise<ApiResponse<StudentRegistrationResponse>> => {
  const response = await api.post("/Student/register_students", payload);

  return response.data;
};
export const getOtherFees = async (
  instituteId: number,
  branchId: number,
): Promise<OtherFee[]> => {
  const response = await api.get("/Common/other-fees", {
    params: {
      instituteId,
      branchId,
    },
  });

  return response.data.data ?? [];
};
export interface BulkDeleteStudentsRequest {
  studentIds: number[];
}

export const bulkDeleteStudents = async (data: BulkDeleteStudentsRequest) => {
  const response = await api.delete("/Student/bulk_delete_students", {
    data,
  });

  return response.data;
};
export interface BulkUpdateStudentStatusRequest {
  studentIds: number[];
  status: number;
  inactiveStatus: string;
}

export const bulkUpdateStudentStatus = async (
  data: BulkUpdateStudentStatusRequest,
) => {
  const response = await api.put("/Student/bulk_update_student_status", data, {
    showLoader: false,
  });

  return response.data;
};
