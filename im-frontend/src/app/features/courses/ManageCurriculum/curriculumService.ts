// branchService.ts

import { showLoader } from "../../../redux/slices/loaderSlice";
import api from "../../../services/api";
import { CurriculumFormValidation } from "../validations/curriculumSchema";
import {
  CurriculumList,
  UpdateCurriculumRequest,
  CurriculumListResponse,
  CurriculumSubmitPayload,
  InstituteCurriculumResponse,
} from "./types";

export interface CurriculumSearchRequest {
  curriculumName: string;
  status: number;
  pageNumber: number;
  pageSize: number;
  branchId: number;

  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}
export interface ImportCurriculumRequest {
  curriculumIds: number[];
  branchId: number;
}

export const addnewCurriculum = async (payload: CurriculumSubmitPayload) => {
  const response = await api.post("/Curriculum/create-curriculum", payload, {
    showLoader: true,
  });

  return response.data;
};
export const getCurriculums = async (
  payload: CurriculumSearchRequest,
): Promise<CurriculumListResponse> => {
  console.log("GET CURRICULUMS PAYLOAD:", payload);

  const response = await api.post("/curriculum/curriculum-search", payload, {
    showLoader: false,
  });

  const data = response.data.data;

  return {
    ...data,
    items: data.items.map((item: any) => ({
      CurriculumId: item.crclmId,
      CurriculumName: item.crclmName,
      Description: item.crclmDesc,
      Status: item.crclmStatus ? "Active" : "Inactive",
      isImported: item.isImported,
    })),
  };
};
export const getCurriculumById = async (curriculumId: number) => {
  const response = await api.get(`/curriculum/get-curriculum/${curriculumId}`);
  return response.data;
};
export const updateCurriculum = async (payload: CurriculumSubmitPayload) => {
  const response = await api.put("/curriculum/update-curriculum", payload, {
    showLoader: true,
  });

  return response.data;
};
export const deleteCurriculum = async (curriculumId: number) => {
  const response = await api.delete(
    `/curriculum/delete-curriculum/${curriculumId}`,
    {
      showLoader: true,
    },
  );

  return response.data;
};
export interface InstituteCurriculumImportRequest {
  pageNumber: number;
  pageSize: number;
  branchId: number;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc" | null;
}

export const getInstituteCurriculumsForImport = async (
  payload: InstituteCurriculumImportRequest,
): Promise<InstituteCurriculumResponse> => {
  const response = await api.post(
    "/Curriculum/institute-curriculums-for-import",
    payload,
    {
      showLoader: false,
    },
  );

  return response.data.data;
};
export const importCurriculums = async (payload: ImportCurriculumRequest) => {
  const response = await api.post("/Curriculum/import-curriculum", payload, {
    showLoader: true,
  });

  return response.data;
};
export interface ExportCurriculumRequest {
  curriculumIds: number[];
  branchIds: number[];
}

export const exportCurriculum = async (payload: ExportCurriculumRequest) => {
  const response = await api.post("/Curriculum/export-curriculum", payload, {
    showLoader: true,
  });

  return response.data;
};
