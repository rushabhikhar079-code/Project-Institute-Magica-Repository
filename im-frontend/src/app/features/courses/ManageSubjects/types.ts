export type SubjectList = {
  subId: number;
  subName: string;
  courseName: string;
  duration: string;
  status: string;
  refSubjectId: number;
  branchId: number;
  curriculumName: string;
  actualFees: number;
  taxable: string;
  taxType: string;
  subjectType: string;
  hsncode: string;
  isImported: boolean;
};

export type SubjectListResponse = {
  items: SubjectList[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

export interface CreateSubjectRequest {
  subjectId?: number;

  crclmId: number;
  courseId: number;

  subName: string;
  description: string;

  duration: number;
  durationType: number;

  feesType: string;
  subFeesType: number;

  noofMonths: number;
  courseEndDate: string;

  updateAllBranches: boolean;

  fees: number;
  adhocSub: number;

  taxable: boolean;
  includingTax: boolean;

  allowProrated: boolean;

  allowInstallment: boolean;
  maxInstallment: number;

  hasStudentsAssigned: boolean;

  paymentTemplateId: number;

  isCreateTemplate: boolean;
  templateStatus: boolean;
  templateType: number;
  noofDays: number;

  templateDetails: string[];

  status: number;
  branchId: number;

  isSubjectLvl: boolean;

  type: string;
  hsncode: string;

  trainerIds: number[];
}
export interface UpdateSubjectRequest {
  curriculumId: number;
  curriculumName: string;
  description: string;
}
export type InstituteSubjects = {
  subId: number;
  subName: string;
  courseName: string;
  durationFull: string;
  actualFees: number;
  crclmId: number | null;
  courseId: number;
  subjectType: string;
};

export type InstituteSubjectResponse = {
  items: InstituteSubjects[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
};
