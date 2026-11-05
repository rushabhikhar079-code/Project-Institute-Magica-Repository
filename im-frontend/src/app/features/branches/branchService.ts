// branchService.ts

import { showLoader } from "../../redux/slices/loaderSlice";
import api from "../../services/api";
import { BranchList, UpdateBranchRequest } from "./branchTypes";
import { BranchFormValidation } from "./validations/BranchSchema";

export interface BranchSearchRequest {
  branchName: string;
  city: string;
  contactPerson: string;
  email: string;
  mobile: string;
  status: number;
  pageNumber: number;
  pageSize: number;
  instituteId?: number;

  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export type BranchListResponse = {
  items: BranchList[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};
type BranchSubmitPayload = BranchFormValidation & {
  course_Fixed_Fee: {
    subjectId: number;
    amount: number;
  }[];

  coursewise_Commision: {
    subjectId: number;
    commission: number;
  }[];
};
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
export const addnewBranch = async (payload: BranchFormValidation) => {
  let agreementFile = "";

  if (payload.agreementFile instanceof File) {
    agreementFile = await fileToBase64(payload.agreementFile);
  }

  const requestBody = {
    branchId: 0,

    branchName: payload.name,
    branchCode: payload.code,
    address: payload.address,

    countryId: payload.countryId,
    stateId: payload.stateId,
    cityId: payload.cityId,
    otherCity: payload.otherCity ?? "",

    pinCode: payload.pinCode,
    phone: payload.phone,
    email: payload.email,

    contactPerson: payload.contactName,
    cpMobile: payload.contactMobile,
    cpEmail: payload.contactEmail,

    taxRate: Number(payload.taxRate || 0),

    status: payload.status === "Active" ? 1 : 0,
    makeFranchisee: payload.makeFranchisee,

    regDate: new Date().toISOString(),

    // Backend DTO property names
    signUp_Amt: Number(payload.signUpAmount || 0),
    monthly_Fee: Number(payload.monthlyFee || 0),
    exam_Fee: Number(payload.testFee || 0),
    certification_Fee: Number(payload.certFee || 0),
    commision_All: Number(payload.feeCommission || 0),
    stud_Fixed_Fee: Number(payload.fixedStudentFee || 0),

    agreementFileName: payload.agreementFileName ?? "",
    agreementFile: agreementFile,

    course_Fixed_Fee: [],
    coursewise_Commission: [],
  };

  console.log("ADD BRANCH REQUEST:", requestBody);

  const response = await api.post("/Branch/create-branch", requestBody, {
    showLoader: true,
  });

  return response.data;
};

export const getBranches = async (
  payload: BranchSearchRequest,
): Promise<BranchListResponse> => {
  const activeInstituteId =
    payload.instituteId || Number(localStorage.getItem("instituteId")) || 0;
  const requestBody = {
    ...payload,
    instituteId: activeInstituteId > 0 ? activeInstituteId : undefined,
  };
  const response = await api.post("/Branch/branch-search", requestBody, {
    showLoader: false,
  });

  console.log("AXIOS RESPONSE:", response);
  console.log("response.data:", response.data);
  console.log("response.data.data:", response.data.data);
  console.log("items:", response.data.data?.items);

  return response.data.data;
};

export const getBranchById = async (branchId: number) => {
  const response = await api.get(`/branch/get-branch/${branchId}`);
  return response.data;
};
export const updateBranch = async (
  branchId: number,
  payload: BranchFormValidation,
  courseData: {
    course_Fixed_Fee: {
      subjectId: number;
      amount: number;
    }[];
    coursewise_Commision: {
      subjectId: number;
      commision: number;
    }[];
  },
) => {
  const requestBody = {
    branchId,

    branchName: payload.name,
    branchCode: payload.code,
    address: payload.address,

    countryId: payload.countryId,
    stateId: payload.stateId,
    cityId: payload.cityId,
    otherCity: payload.otherCity ?? "",

    pinCode: payload.pinCode,
    phone: payload.phone,
    email: payload.email,

    contactPerson: payload.contactName,
    cpMobile: payload.contactMobile,
    cpEmail: payload.contactEmail,

    taxRate: Number(payload.taxRate || 0),

    status: payload.status === "Active" ? 1 : 0,

    makeFranchisee: payload.makeFranchisee,

    regDate: payload.signUpDate
      ? new Date(payload.signUpDate).toISOString()
      : null,

    signUp_Amt: Number(payload.signUpAmount || 0),
    monthly_Fee: Number(payload.monthlyFee || 0),
    exam_Fee: Number(payload.testFee || 0),
    certification_Fee: Number(payload.certFee || 0),
    commision_All: Number(payload.feeCommission || 0),
    stud_Fixed_Fee: Number(payload.fixedStudentFee || 0),

    agreementFileName: payload.agreementFileName ?? "",
    agreementFile: "",
    agreementFileChanged: payload.agreementFileChanged,

    // ONLY EDIT
    course_Fixed_Fee: courseData.course_Fixed_Fee,
    coursewise_Commision: courseData.coursewise_Commision,
  };

  console.log("UPDATE BRANCH REQUEST:", JSON.stringify(requestBody, null, 2));

  const response = await api.put(
    `/Branch/update-branch/${branchId}`,
    requestBody,
    {
      showLoader: true,
    },
  );

  return response.data;
};
export const deleteBranch = async (branchId: number) => {
  const response = await api.delete(`/Branch/delete-branch/${branchId}`, {
    showLoader: true,
  });

  return response.data;
};
