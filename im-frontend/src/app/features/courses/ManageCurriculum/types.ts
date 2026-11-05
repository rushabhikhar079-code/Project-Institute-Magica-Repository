export type CurriculumList = {
  CurriculumId: number;
  CurriculumName: string;
  Description: string;
  Status: string;
  isImported: boolean;
};

export type CurriculumListResponse = {
  items: CurriculumList[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

export type CurriculumForm = {
  id: number;
  name: string;
  description: string;
};

export interface UpdateCurriculumRequest {
  crclmId: number;
  crclmName: string;
  crclmDesc: string;
  crclmStatus: boolean;
  branchId: number;
}
export interface CurriculumSubmitPayload {
  crclmId: number;
  crclmName: string;
  crclmDesc: string;
  crclmStatus: boolean;
  branchId: number;
}
export type InstituteCurriculum = {
  crclmId: number;
  crclmName: string;
  crclmDesc: string;
  crclmStatus: boolean;
  refCrclmId: number;
  isImported: boolean;
};

export type InstituteCurriculumResponse = {
  items: InstituteCurriculum[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};
